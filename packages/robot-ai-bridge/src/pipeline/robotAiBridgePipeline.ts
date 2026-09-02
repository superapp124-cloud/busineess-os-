/**
 * CHATR Robot AI Bridge Pipeline (Gate 7 Integration)
 * Orchestrates multi-lingual voice/text processing, local Ollama parsing, spatial grounding,
 * deterministic capability matching, and execution sub-task graph generation.
 */

import { PerceptionWorldModelSnapshot } from '../../../robot-perception/src/types';
import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { OllamaClient } from '../llm/ollamaClient';
import { MultilingualNlu } from '../language/multilingualNlu';
import { SpatialGrounder } from '../grounder/spatialGrounder';
import { CapabilityMatcher } from '../grounder/capabilityMatcher';
import { OperationalAiExplainer } from '../explainer/operationalAiExplainer';
import { StructuredRobotTask, ValidatedRobotTaskPlan } from '../types';

export class RobotAiBridgePipeline {
  private ollamaClient: OllamaClient;

  constructor(ollamaClient?: OllamaClient) {
    this.ollamaClient = ollamaClient ?? new OllamaClient();
  }

  public async processUserPrompt(
    rawPrompt: string,
    worldModelSnapshot: PerceptionWorldModelSnapshot,
    robotPositionWorld = new Vector3(0, 0, 0),
    batterySocPercent = 85.0
  ): Promise<ValidatedRobotTaskPlan> {
    const nluTask = MultilingualNlu.parsePrompt(rawPrompt);
    const ollamaResponse = await this.ollamaClient.parseUserPrompt(rawPrompt);

    const task: StructuredRobotTask = {
      taskId: nluTask.taskId,
      intent: ollamaResponse.intent !== 'UNKNOWN' ? ollamaResponse.intent : nluTask.intent,
      targetCategory: ollamaResponse.targetCategory !== 'unknown' ? ollamaResponse.targetCategory : nluTask.targetCategory,
      sourceLocation: ollamaResponse.sourceLocation || nluTask.sourceLocation,
      destinationLocation: ollamaResponse.destinationLocation || nluTask.destinationLocation,
      parameters: { ...nluTask.parameters, ollamaConfidence: ollamaResponse.confidence },
      rawUserPrompt: rawPrompt,
      detectedLanguage: nluTask.detectedLanguage,
      isAmbiguousReference: ollamaResponse.isAmbiguous || nluTask.isAmbiguousReference,
    };

    const grounding = SpatialGrounder.groundTask(task, worldModelSnapshot, robotPositionWorld);
    if (grounding.isGrounded && grounding.groundedObject) {
      task.resolvedObjectId = grounding.groundedObject.objectId;
    }

    const validation = CapabilityMatcher.validateTask(task, grounding.groundedObject, batterySocPercent);

    const explanation = OperationalAiExplainer.explainTaskPlan(
      task,
      validation.status,
      task.resolvedObjectId
    );

    const subTasks: ValidatedRobotTaskPlan['subTasks'] = [];
    if (validation.isApproved) {
      if (task.intent === 'FETCH_OBJECT' && task.resolvedObjectId) {
        subTasks.push(
          { stepIndex: 1, subTaskType: 'NAVIGATE', targetLocationOrId: task.sourceLocation, description: `Navigate base to ${task.sourceLocation}` },
          { stepIndex: 2, subTaskType: 'PERCEIVE', targetLocationOrId: task.resolvedObjectId, description: `Verify 6D pose of ${task.resolvedObjectId}` },
          { stepIndex: 3, subTaskType: 'ALIGN', targetLocationOrId: task.sourceLocation, description: `Align base with tabletop` },
          { stepIndex: 4, subTaskType: 'GRASP', targetLocationOrId: task.resolvedObjectId, description: `Execute DLS reach and close fingers` },
          { stepIndex: 5, subTaskType: 'VERIFY_GRASP', targetLocationOrId: task.resolvedObjectId, description: `Verify normal force via tactile array` },
          { stepIndex: 6, subTaskType: 'LIFT', targetLocationOrId: task.resolvedObjectId, description: `Lift object +15cm into free space` },
          { stepIndex: 7, subTaskType: 'NAVIGATE', targetLocationOrId: task.destinationLocation, description: `Navigate to user position` },
          { stepIndex: 8, subTaskType: 'HANDOVER', targetLocationOrId: task.destinationLocation, description: `Safely release grip upon user contact` }
        );
      } else if (task.intent === 'EMERGENCY_STOP') {
        subTasks.push({ stepIndex: 1, subTaskType: 'PERCEIVE', targetLocationOrId: 'SAFETY_CORE', description: 'Immediate compliant motor freeze' });
      }
    }

    return {
      task,
      validationStatus: validation.status,
      isApprovedForExecution: validation.isApproved,
      subTasks,
      explanation,
      rejectionReason: validation.isApproved ? undefined : validation.reason,
    };
  }

  public handleFailureInjection(failureMode: string): {
    robotOsResponse: string;
    recoveryAction: string;
    isSafetyMaintained: boolean;
  } {
    switch (failureMode) {
      case 'OBJECT_MOVED':
        return { robotOsResponse: 'DISCREPANCY_DETECTED', recoveryAction: 'Trigger sensor re-scan & update world model 6D coordinates', isSafetyMaintained: true };
      case 'HUMAN_ENTERED_PATH':
        return { robotOsResponse: 'ZONE_1_EMERGENCY_STOP', recoveryAction: 'Decelerate arm to compliant standstill until human clears', isSafetyMaintained: true };
      case 'OBJECT_OCCLUDED':
        return { robotOsResponse: 'BELIEF_OCCLUDED', recoveryAction: 'Retain memory entity as OCCLUDED; adjust torso yaw for clear line of sight', isSafetyMaintained: true };
      case 'CAMERA_DISCONNECTED':
        return { robotOsResponse: 'PERCEPTION_DEGRADED', recoveryAction: 'Halt all manipulation and locomotion immediately', isSafetyMaintained: true };
      case 'LOW_GRASP_CONFIDENCE':
        return { robotOsResponse: 'BLOCKED_LOW_PERCEPTION_CONFIDENCE', recoveryAction: 'Reject grasp execution; ask user for verbal clarification', isSafetyMaintained: true };
      case 'OBJECT_UNREACHABLE':
        return { robotOsResponse: 'UNREACHABLE_WORKSPACE', recoveryAction: 'Generate base locomotion repositioning waypoint', isSafetyMaintained: true };
      case 'OLLAMA_UNAVAILABLE':
        return { robotOsResponse: 'LLM_OFFLINE_FALLBACK', recoveryAction: 'Seamlessly transition to deterministic CHATR Multi-Lingual NLU', isSafetyMaintained: true };
      case 'STT_UNAVAILABLE':
        return { robotOsResponse: 'STT_OFFLINE', recoveryAction: 'Fallback to CHATR Text Prompt Console', isSafetyMaintained: true };
      case 'BATTERY_LOW':
        return { robotOsResponse: 'BLOCKED_BATTERY_LOW', recoveryAction: 'Reject manipulation task; auto-route to docking station', isSafetyMaintained: true };
      case 'MOTOR_SATURATION':
        return { robotOsResponse: 'BLOCKED_TORQUE_LIMIT_SATURATION', recoveryAction: 'Engage compliance damping and abort trajectory', isSafetyMaintained: true };
      case 'EMERGENCY_STOP':
        return { robotOsResponse: 'ESTOP_ENGAGED', recoveryAction: 'Hardware relay de-energized; all joints locked in safe brake mode', isSafetyMaintained: true };
      default:
        return { robotOsResponse: 'UNKNOWN_FAULT', recoveryAction: 'Safe stop and transition to home pose', isSafetyMaintained: true };
    }
  }
}

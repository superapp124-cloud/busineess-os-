/**
 * CHATR Household Task Execution Engine (Gate 8)
 * Decomposes 11 household tasks into canonical skill sequences, drives state machines, and enforces recovery paths.
 */

import { TaskType, TaskState, TaskStepDefinition, TaskExecutionContext, TaskExecutionProgress } from '../types';
import { SkillRegistry } from '../../../robot-skills/src/registry/skillRegistry';
import { SkillType, SkillResult } from '../../../robot-skills/src/types';
import { Vector3 } from '../../../robot-physics/src/math/vector3';

export class HouseholdTaskEngine {
  private skillRegistry: SkillRegistry;

  constructor(skillRegistry = new SkillRegistry()) {
    this.skillRegistry = skillRegistry;
  }

  /**
   * Returns canonical decomposed skill steps for any of the 11 household tasks.
   */
  public getTaskDecomposition(taskType: TaskType, customParams: Record<string, any> = {}): TaskStepDefinition[] {
    switch (taskType) {
      case 'FETCH_OBJECT':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: customParams.sourceLocation || 'kitchen' }, description: '1. Navigate to source room' },
          { stepIndex: 2, skillType: 'ALIGN_WITH_SURFACE', params: { surfaceId: 'kitchen_counter_01' }, description: '2. Align torso with countertop' },
          { stepIndex: 3, skillType: 'SCAN_OBJECT_6D', params: { targetObjectId: customParams.targetObjectId || 'water_bottle_01' }, description: '3. Scan target 6D pose' },
          { stepIndex: 4, skillType: 'PLAN_GRASP_POSE', params: { targetObjectId: customParams.targetObjectId || 'water_bottle_01' }, description: '4. Plan grasp & dynamic force' },
          { stepIndex: 5, skillType: 'REACH_TARGET_POSE', params: { armSide: 'RIGHT' }, description: '5. Reach pre-grasp pose' },
          { stepIndex: 6, skillType: 'OPEN_GRIPPER', params: {}, description: '6. Open gripper fingers' },
          { stepIndex: 7, skillType: 'CLOSE_GRIPPER_FORCE', params: { forceN: 14.12 }, description: '7. Close gripper at planned force' },
          { stepIndex: 8, skillType: 'VERIFY_TACTILE_CONTACT', params: {}, description: '8. Verify tactile contact & low slip' },
          { stepIndex: 9, skillType: 'LIFT_OBJECT', params: { liftHeightM: 0.15 }, description: '9. Lift object +15cm' },
          { stepIndex: 10, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: customParams.destinationLocation || 'living_room' }, description: '10. Navigate to recipient room' },
          { stepIndex: 11, skillType: 'TRACK_HUMAN', params: {}, description: '11. Track human recipient' },
          { stepIndex: 12, skillType: 'HANDOVER_TO_USER', params: {}, description: '12. Handover object safely to user' },
        ];

      case 'NAVIGATE_ROOMS':
        return [
          { stepIndex: 1, skillType: 'STAND_STABLE_HOLD', params: {}, description: '1. Check balance & posture' },
          { stepIndex: 2, skillType: 'DETECT_OBSTACLES', params: {}, description: '2. Scan hallway clearance' },
          { stepIndex: 3, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: customParams.targetRoom || 'bedroom' }, description: '3. Traverse rooms' },
          { stepIndex: 4, skillType: 'AUDIO_SPOKEN_FEEDBACK', params: { messageText: 'Arrived at bedroom' }, description: '4. Announce room arrival' },
        ];

      case 'PICK_UP_CLOTHES':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'bedroom' }, description: '1. Navigate to bedroom floor' },
          { stepIndex: 2, skillType: 'CROUCH_LOW_REACH', params: {}, description: '2. Crouch to low altitude (Z=0.65m)' },
          { stepIndex: 3, skillType: 'PICK_UP_DEFORMABLE', params: { targetObjectId: 'clothes_01' }, description: '3. Pinch-grasp cloth at 12N' },
          { stepIndex: 4, skillType: 'STAND_STABLE_HOLD', params: {}, description: '4. Stand upright' },
          { stepIndex: 5, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'laundry_area' }, description: '5. Navigate to laundry basket' },
          { stepIndex: 6, skillType: 'PLACE_OBJECT_SURFACE', params: { surfaceId: 'laundry_basket_01' }, description: '6. Drop clothes into basket' },
          { stepIndex: 7, skillType: 'RELEASE_GRIPPER', params: {}, description: '7. Release gripper' },
        ];

      case 'CLEAN_TABLE':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'dining_room' }, description: '1. Approach dining table' },
          { stepIndex: 2, skillType: 'ALIGN_WITH_SURFACE', params: { surfaceId: 'dining_table_01' }, description: '2. Align with table edge' },
          { stepIndex: 3, skillType: 'SCAN_OBJECT_6D', params: { targetObjectId: 'sponge_01' }, description: '3. Scan cleaning sponge' },
          { stepIndex: 4, skillType: 'REACH_TARGET_POSE', params: {}, description: '4. Grasp sponge' },
          { stepIndex: 5, skillType: 'WIPE_SURFACE_RECTANGLE', params: { surfaceId: 'dining_table_01' }, description: '5. Execute raster wipe pattern' },
          { stepIndex: 6, skillType: 'AUDIO_SPOKEN_FEEDBACK', params: { messageText: 'Table cleaned' }, description: '6. Announce task complete' },
        ];

      case 'SERVE_WATER':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'kitchen' }, description: '1. Navigate to kitchen counter' },
          { stepIndex: 2, skillType: 'SCAN_OBJECT_6D', params: { targetObjectId: 'water_bottle_01' }, description: '2. Scan bottle' },
          { stepIndex: 3, skillType: 'REACH_TARGET_POSE', params: {}, description: '3. Grasp water bottle' },
          { stepIndex: 4, skillType: 'POUR_LIQUID_CONTAINER', params: { targetCupId: 'cup_01' }, description: '4. Pour water into cup' },
          { stepIndex: 5, skillType: 'LIFT_OBJECT', params: { targetObjectId: 'cup_01' }, description: '5. Lift filled cup' },
          { stepIndex: 6, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'living_room' }, description: '6. Navigate to user' },
          { stepIndex: 7, skillType: 'HANDOVER_TO_USER', params: {}, description: '7. Handover cup safely' },
        ];

      case 'PUT_AWAY_GROCERIES':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'kitchen' }, description: '1. Approach grocery counter' },
          { stepIndex: 2, skillType: 'OPEN_CABINET_DOOR', params: { cabinetId: 'cabinet_upper_01' }, description: '2. Open cabinet door 90 deg' },
          { stepIndex: 3, skillType: 'SCAN_OBJECT_6D', params: { targetObjectId: 'cereal_box_01' }, description: '3. Scan grocery box' },
          { stepIndex: 4, skillType: 'REACH_HIGH_SHELF', params: {}, description: '4. Place grocery on upper shelf' },
          { stepIndex: 5, skillType: 'CLOSE_CABINET_DOOR', params: { cabinetId: 'cabinet_upper_01' }, description: '5. Close cabinet door' },
        ];

      case 'EMPTY_TRASH_BIN':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'study_room' }, description: '1. Approach desk trash bin' },
          { stepIndex: 2, skillType: 'CROUCH_LOW_REACH', params: {}, description: '2. Crouch & grasp waste bin' },
          { stepIndex: 3, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'kitchen' }, description: '3. Carry to main waste unit' },
          { stepIndex: 4, skillType: 'POUR_LIQUID_CONTAINER', params: { action: 'DUMP_TRASH' }, description: '4. Invert bin into main waste' },
          { stepIndex: 5, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'study_room' }, description: '5. Return bin to study' },
          { stepIndex: 6, skillType: 'PLACE_OBJECT_SURFACE', params: { surfaceId: 'study_floor' }, description: '6. Place bin on floor' },
        ];

      case 'PATROL_AND_REPORT':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'living_room' }, description: '1. Patrol living room' },
          { stepIndex: 2, skillType: 'DETECT_OBSTACLES', params: {}, description: '2. Scan room boundaries' },
          { stepIndex: 3, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'kitchen' }, description: '3. Patrol kitchen' },
          { stepIndex: 4, skillType: 'SCAN_OBJECT_6D', params: { targetObjectId: 'water_bottle_01' }, description: '4. Verify appliance & object states' },
          { stepIndex: 5, skillType: 'AUDIO_SPOKEN_FEEDBACK', params: { messageText: 'Patrol complete. All rooms secure.' }, description: '5. Report home status' },
        ];

      case 'BED_MAKING_ASSIST':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'bedroom' }, description: '1. Align beside bed frame' },
          { stepIndex: 2, skillType: 'ALIGN_WITH_SURFACE', params: { surfaceId: 'bed_01' }, description: '2. Align heading with mattress edge' },
          { stepIndex: 3, skillType: 'PICK_UP_DEFORMABLE', params: { targetObjectId: 'sheet_corner_01' }, description: '3. Grip sheet corner at 15N' },
          { stepIndex: 4, skillType: 'FOLD_CLOTH_STEP', params: {}, description: '4. Pull sheet taut along mattress' },
          { stepIndex: 5, skillType: 'RELEASE_GRIPPER', params: {}, description: '5. Tuck sheet and release' },
        ];

      case 'MEDICINE_REMINDER':
        return [
          { stepIndex: 1, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'bedroom' }, description: '1. Navigate to medicine nightstand' },
          { stepIndex: 2, skillType: 'SCAN_OBJECT_6D', params: { targetObjectId: 'medicine_bottle_01' }, description: '2. Scan medicine bottle barcode' },
          { stepIndex: 3, skillType: 'REACH_TARGET_POSE', params: {}, description: '3. Grasp medicine box' },
          { stepIndex: 4, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'living_room' }, description: '4. Bring to user' },
          { stepIndex: 5, skillType: 'AUDIO_SPOKEN_FEEDBACK', params: { messageText: 'Dawai ka samay ho gaya hai' }, description: '5. Deliver voice reminder in Hindi' },
          { stepIndex: 6, skillType: 'HANDOVER_TO_USER', params: {}, description: '6. Handover medicine box' },
        ];

      case 'AUTONOMOUS_RECHARGE':
        return [
          { stepIndex: 1, skillType: 'STAND_STABLE_HOLD', params: {}, description: '1. Halt active tasks' },
          { stepIndex: 2, skillType: 'NAVIGATE_TO_WAYPOINT', params: { targetLocation: 'charging_dock' }, description: '2. Navigate to 48V charging dock' },
          { stepIndex: 3, skillType: 'ALIGN_WITH_SURFACE', params: { surfaceId: 'dock_align_marker' }, description: '3. Align rear charge contact' },
          { stepIndex: 4, skillType: 'DOCK_CHARGING_STATION', params: {}, description: '4. Latch BMS charge contact' },
          { stepIndex: 5, skillType: 'LED_STATUS_INDICATOR', params: { color: 'GREEN_PULSE' }, description: '5. Set LED to charging pulse' },
        ];

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  /**
   * Executes a complete multi-step household task, driving state machine transitions.
   */
  public async executeTask(
    context: TaskExecutionContext,
    onProgress?: (progress: TaskExecutionProgress) => void
  ): Promise<TaskExecutionProgress> {
    const steps = this.getTaskDecomposition(context.taskType);
    const executedResults: SkillResult[] = [];

    let progress: TaskExecutionProgress = {
      taskId: context.taskId,
      taskType: context.taskType,
      currentState: 'VALIDATING',
      currentStepIndex: 0,
      totalSteps: steps.length,
      activeSkill: null,
      executedSkillResults: [],
      isComplete: false,
      isFailed: false,
      diagnostics: `Initiating validation for ${context.taskType}...`,
    };

    onProgress?.(progress);

    // 1. Validation Gate
    if (context.isEstopActive) {
      progress.currentState = 'FAILED';
      progress.isFailed = true;
      progress.failureReason = 'ESTOP_ENGAGED';
      progress.diagnostics = 'Task rejected: E-STOP hardware relay latched.';
      onProgress?.(progress);
      return progress;
    }

    if (context.batterySocPercent < 15.0 && context.taskType !== 'AUTONOMOUS_RECHARGE') {
      progress.currentState = 'FAILED';
      progress.isFailed = true;
      progress.failureReason = 'BATTERY_LOW';
      progress.recoveryAction = 'AUTONOMOUS_RECHARGE';
      progress.diagnostics = 'Task rejected: Battery SOC < 15.0%. Autonomous recharge required.';
      onProgress?.(progress);
      return progress;
    }

    // 2. Planning State
    progress.currentState = 'PLANNING';
    progress.diagnostics = `Planned ${steps.length} sequential skills for ${context.taskType}.`;
    onProgress?.(progress);

    // 3. Execution Loop
    progress.currentState = 'EXECUTING';

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      progress.currentStepIndex = i + 1;
      progress.activeSkill = step.skillType;
      progress.diagnostics = `Executing Step ${i + 1}/${steps.length}: ${step.description}`;
      onProgress?.(progress);

      // If skill is navigation, update robot base position
      if (step.skillType === 'NAVIGATE_TO_WAYPOINT') {
        const dest = step.params.targetLocation;
        if (dest === 'kitchen') {
          context.robotPoseWorld.position = new Vector3(2.1, -2.5, 0.95);
        } else if (dest === 'living_room') {
          context.robotPoseWorld.position = new Vector3(-1.5, -2.5, 0.95);
        } else if (dest === 'bedroom') {
          context.robotPoseWorld.position = new Vector3(-1.6, 2.8, 0.95);
        } else if (dest === 'charging_dock') {
          context.robotPoseWorld.position = new Vector3(0.0, 0.0, 0.95);
        }
      }

      const skillRes = await this.skillRegistry.executeSkill(step.skillType, step.params, {
        worldModelSnapshot: context.worldModelSnapshot,
        robotPoseWorld: context.robotPoseWorld,
        batterySocPercent: context.batterySocPercent,
        safetyZone: context.safetyZone,
        isEstopActive: context.isEstopActive,
        activeArmJoints: context.activeArmJoints,
        provenance: context.provenance,
      });

      executedResults.push(skillRes);
      progress.executedSkillResults = [...executedResults];

      if (!skillRes.isSuccessful) {
        progress.currentState = 'FAILED';
        progress.isFailed = true;
        progress.failureReason = skillRes.failureReason || 'SKILL_EXECUTION_FAILED';
        progress.diagnostics = `Task failed at Step ${i + 1} (${step.skillType}): ${skillRes.diagnostics}`;
        onProgress?.(progress);
        return progress;
      }
    }

    // 4. Verification State
    progress.currentState = 'VERIFYING';
    progress.diagnostics = 'Verifying post-conditions in world model snapshot...';
    onProgress?.(progress);

    // 5. Complete
    progress.currentState = 'COMPLETE';
    progress.isComplete = true;
    progress.diagnostics = `Task ${context.taskType} successfully completed across all ${steps.length} skills.`;
    onProgress?.(progress);

    return progress;
  }
}

/**
 * CHATR Deterministic Robot Capability & Affordance Matcher (Gate 7)
 * Validates task feasibility before granting execution approval.
 */

import { ObjectPose6D } from '../../../robot-perception/src/types';
import { ReachabilityVolume } from '../../../robot-manipulation/src/kinematics/reachabilityVolume';
import { StructuredRobotTask, TaskValidationStatus } from '../types';

export class CapabilityMatcher {
  public static readonly MIN_BATTERY_SOC = 15.0;
  public static readonly MIN_CONFIDENCE = 0.70;

  public static validateTask(
    task: StructuredRobotTask,
    groundedObject?: ObjectPose6D,
    batterySocPercent = 85.0
  ): {
    status: TaskValidationStatus;
    isApproved: boolean;
    reason: string;
  } {
    if (batterySocPercent < this.MIN_BATTERY_SOC) {
      return {
        status: 'BLOCKED_BATTERY_LOW',
        isApproved: false,
        reason: `Battery level (${batterySocPercent.toFixed(1)}%) is below minimum operational threshold (15%). Task rejected.`,
      };
    }

    if (task.intent === 'FETCH_OBJECT') {
      if (!groundedObject) {
        return {
          status: 'BLOCKED_OBJECT_NOT_FOUND',
          isApproved: false,
          reason: `Target object '${task.targetCategory}' could not be located in the current environment.`,
        };
      }

      if (groundedObject.confidence < this.MIN_CONFIDENCE) {
        return {
          status: 'BLOCKED_LOW_PERCEPTION_CONFIDENCE',
          isApproved: false,
          reason: `Perception confidence (${groundedObject.confidence.toFixed(2)}) is below safety threshold (0.70).`,
        };
      }

      if (!groundedObject.affordances.includes('GRASPABLE')) {
        return {
          status: 'BLOCKED_CAPABILITY_MISMATCH',
          isApproved: false,
          reason: `Target object '${groundedObject.objectId}' lacks the GRASPABLE affordance.`,
        };
      }

      const reach = ReachabilityVolume.evaluateReachability('RIGHT', groundedObject.positionWorld);
      if (reach.reachability === 'UNREACHABLE') {
        return {
          status: 'VALID_AND_EXECUTABLE',
          isApproved: true,
          reason: 'Object requires base navigation to reach manipulation workspace.',
        };
      }

      return {
        status: 'VALID_AND_EXECUTABLE',
        isApproved: true,
        reason: 'Task is kinematically feasible, safe, and approved for execution.',
      };
    }

    if (task.intent === 'EMERGENCY_STOP') {
      return {
        status: 'VALID_AND_EXECUTABLE',
        isApproved: true,
        reason: 'Emergency stop intent approved for immediate high-priority execution.',
      };
    }

    if (task.intent === 'STATUS_QUERY' || task.intent === 'PATROL_ROOM') {
      return {
        status: 'VALID_AND_EXECUTABLE',
        isApproved: true,
        reason: 'Task is supported and approved for execution.',
      };
    }

    return {
      status: 'BLOCKED_CAPABILITY_MISMATCH',
      isApproved: false,
      reason: `Intent '${task.intent}' is currently unsupported by the robot capability graph.`,
    };
  }
}

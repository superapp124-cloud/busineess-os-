/**
 * CHATR Canonical Robot Skills Types (Gate 8)
 * Defines contracts, preconditions, perception requirements, safety gates, and state machines for 30 skills.
 */

import { Vector3 } from '../../robot-physics/src/math/vector3';
import { Quaternion } from '../../robot-physics/src/math/quaternion';
import { HouseholdCategory, ObjectPose6D, PerceptionWorldModelSnapshot } from '../../robot-perception/src/types';
import { ArmSide, ArmJointAngles, HumanSafetyZone } from '../../robot-manipulation/src/types';

export type SkillType =
  // Navigation & Mobility (8)
  | 'NAVIGATE_TO_WAYPOINT'
  | 'ALIGN_WITH_SURFACE'
  | 'AVOID_COLLISION_PAUSE'
  | 'DOCK_CHARGING_STATION'
  | 'UNDOCK_CHARGING_STATION'
  | 'STAND_STABLE_HOLD'
  | 'CROUCH_LOW_REACH'
  | 'REACH_HIGH_SHELF'
  // Perception & Attention (3)
  | 'SCAN_OBJECT_6D'
  | 'TRACK_HUMAN'
  | 'DETECT_OBSTACLES'
  // Manipulation & Grasping (10)
  | 'REACH_TARGET_POSE'
  | 'PLAN_GRASP_POSE'
  | 'OPEN_GRIPPER'
  | 'CLOSE_GRIPPER_FORCE'
  | 'VERIFY_TACTILE_CONTACT'
  | 'LIFT_OBJECT'
  | 'PLACE_OBJECT_SURFACE'
  | 'RELEASE_GRIPPER'
  | 'HANDOVER_TO_USER'
  | 'PUSH_OBJECT_PLANAR'
  // Household & Deformable Interaction (6)
  | 'WIPE_SURFACE_RECTANGLE'
  | 'PICK_UP_DEFORMABLE'
  | 'FOLD_CLOTH_STEP'
  | 'OPEN_CABINET_DOOR'
  | 'CLOSE_CABINET_DOOR'
  | 'POUR_LIQUID_CONTAINER'
  // System, Audio & Safety (3)
  | 'AUDIO_SPOKEN_FEEDBACK'
  | 'LED_STATUS_INDICATOR'
  | 'SAFE_SHUTDOWN_PARK';

export type SkillExecutionStatus =
  | 'READY'
  | 'VALIDATING'
  | 'PLANNING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'COMPLETE'
  | 'FAILED'
  | 'CANCELLED';

export interface SkillExecutionContext {
  worldModelSnapshot: PerceptionWorldModelSnapshot;
  robotPoseWorld: { position: Vector3; orientation: Quaternion };
  batterySocPercent: number;
  safetyZone: HumanSafetyZone;
  isEstopActive: boolean;
  activeArmJoints: Record<ArmSide, ArmJointAngles>;
  provenance: 'SIMULATION_KERNEL' | 'PHYSICAL_HARDWARE';
}

export interface SkillResult {
  skillType: SkillType;
  status: SkillExecutionStatus;
  isSuccessful: boolean;
  executionDurationSeconds: number;
  resultingWorldMutations?: {
    movedObjectId?: string;
    newPoseWorld?: { position: Vector3; orientation: Quaternion };
    attachedToArm?: ArmSide | null;
    wipedSurfaceId?: string;
  };
  diagnostics: string;
  failureReason?: string;
}

export interface SkillContract {
  skillType: SkillType;
  category: 'MOBILITY' | 'PERCEPTION' | 'MANIPULATION' | 'HOUSEHOLD' | 'SYSTEM';
  description: string;
  preconditions: string[];
  perceptionRequirements: string[];
  safetyRequirements: string[];
  timeoutSeconds: number;
  execute(params: Record<string, any>, context: SkillExecutionContext): Promise<SkillResult>;
}

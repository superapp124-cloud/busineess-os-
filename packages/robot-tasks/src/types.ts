/**
 * CHATR Multi-Step Household Task Types (Gate 8)
 * Defines the 11 multi-step household tasks, execution state machines, and failure handling.
 */

import { SkillType, SkillResult } from '../../robot-skills/src/types';
import { PerceptionWorldModelSnapshot } from '../../robot-perception/src/types';
import { Vector3 } from '../../robot-physics/src/math/vector3';
import { Quaternion } from '../../robot-physics/src/math/quaternion';
import { ArmSide, ArmJointAngles, HumanSafetyZone } from '../../robot-manipulation/src/types';

export type TaskType =
  | 'FETCH_OBJECT'
  | 'NAVIGATE_ROOMS'
  | 'PICK_UP_CLOTHES'
  | 'CLEAN_TABLE'
  | 'SERVE_WATER'
  | 'PUT_AWAY_GROCERIES'
  | 'EMPTY_TRASH_BIN'
  | 'PATROL_AND_REPORT'
  | 'BED_MAKING_ASSIST'
  | 'MEDICINE_REMINDER'
  | 'AUTONOMOUS_RECHARGE';

export type TaskState =
  | 'IDLE'
  | 'VALIDATING'
  | 'PLANNING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'COMPLETE'
  | 'FAILED'
  | 'ABORTED';

export interface TaskStepDefinition {
  stepIndex: number;
  skillType: SkillType;
  params: Record<string, any>;
  description: string;
}

export interface TaskExecutionContext {
  taskId: string;
  taskType: TaskType;
  worldModelSnapshot: PerceptionWorldModelSnapshot;
  robotPoseWorld: { position: Vector3; orientation: Quaternion };
  batterySocPercent: number;
  safetyZone: HumanSafetyZone;
  isEstopActive: boolean;
  activeArmJoints: Record<ArmSide, ArmJointAngles>;
  provenance: 'SIMULATION_KERNEL' | 'PHYSICAL_HARDWARE';
}

export interface TaskExecutionProgress {
  taskId: string;
  taskType: TaskType;
  currentState: TaskState;
  currentStepIndex: number;
  totalSteps: number;
  activeSkill: SkillType | null;
  executedSkillResults: SkillResult[];
  isComplete: boolean;
  isFailed: boolean;
  failureReason?: string;
  recoveryAction?: string;
  diagnostics: string;
}

/**
 * CHATR Manipulation & Grasping Engine Types (Gate 6 & Gate 6.1-R)
 */

import { Vector3 } from '../../robot-physics/src/math/vector3';
import { Quaternion } from '../../robot-physics/src/math/quaternion';

export type ArmSide = 'LEFT' | 'RIGHT';

export type ReachabilityClass =
  | 'REACHABLE_WITH_MARGIN'
  | 'REACHABLE'
  | 'MARGINAL'
  | 'UNREACHABLE';

export type GraspContactState =
  | 'NO_CONTACT'
  | 'CONTACT_DETECTED'
  | 'GRASP_ATTEMPT'
  | 'GRASP_CONFIRMED'
  | 'SLIP_SUSPECTED'
  | 'GRASP_FAILED';

export type SlipStatus =
  | 'SECURE_GRASP'
  | 'WEAK_GRASP'
  | 'SLIDING_GRASP'
  | 'DROPPED_OBJECT';

export type HumanSafetyZone =
  | 'ZONE_0_COLLISION_ENVELOPE'     // Immediate freeze (TTC < 0.15s or d < 0.15m)
  | 'ZONE_1_EMERGENCY_STOP'         // Controlled deceleration to stop (TTC < 0.40s or d < 0.35m)
  | 'ZONE_2_REDUCED_SPEED'          // Speed and acceleration capped at 30% (TTC < 1.20s or d < 0.80m)
  | 'ZONE_3_NORMAL_OPERATING';      // Full nominal speed authorized

export type MaterialFragilityClass =
  | 'FRAGILE_GLASS_CERAMIC'   // Max 35N grip force
  | 'DEFORMABLE_FOAM_PLASTIC' // Max 20N grip force
  | 'RIGID_METAL_WOOD';       // Max 80N grip force

export interface ArmJointAngles {
  shoulderPitch: number;
  shoulderRoll: number;
  shoulderYaw: number;
  elbowPitch: number;
  wristYaw: number;
  wristRoll: number;
  wristPitch: number;
}

export interface EndEffectorPose {
  position: Vector3;
  orientation: Quaternion;
}

export interface DynamicLoadContext {
  objectMassKg: number;
  linearAccelerationMps2: Vector3;
  angularAccelerationRadS2: Vector3;
  comOffsetFromGraspMeters: Vector3;
  frictionCoefficient: number;
  safetyFactor: number;
  perceptionUncertainty1Sigma: number;
}

export interface CandidateGrasp {
  targetObjectId: string;
  graspApproachPose: EndEffectorPose;
  graspPose: EndEffectorPose;
  retreatPose: EndEffectorPose;
  approachVectorWorld: Vector3;
  gripperApertureMeters: number;
  requiredGripForceN: number;
  dynamicLoadContext: DynamicLoadContext;
  confidence: number;
  spatialUncertaintyMeters: number;
  reachability: ReachabilityClass;
}

export interface TrajectoryWaypoint {
  timestampSeconds: number;
  jointAngles: ArmJointAngles;
  jointVelocities: ArmJointAngles;
  jointAccelerations: ArmJointAngles;
  jointJerks: ArmJointAngles;
  endEffectorPose: EndEffectorPose;
}

export interface GraspVerificationResult {
  contactState: GraspContactState;
  slipStatus: SlipStatus;
  measuredGripForceN: number;
  requiredGripForceN: number;
  isObjectAttached: boolean;
  tactileFeedbackReceived: boolean;
  diagnostics: string;
}

export interface AdaptiveForceResult {
  nextCommencedForceN: number;
  isForceSafe: boolean;
  slipStatus: SlipStatus;
  actionTaken: 'APPLIED_INCREMENT' | 'CAPPED_AT_FRAGILITY_LIMIT' | 'ABORT_TO_PREVENT_CRUSH';
  reason: string;
}

export interface ManipulationTaskResult {
  simulationTrialId: string; // e.g. E2E-SIM-PICK-LIFT-001
  taskName: string;
  targetObjectId: string;
  armUsed: ArmSide;
  isSuccessful: boolean;
  reachabilityClassification: ReachabilityClass;
  ikConvergenceErrorMeters: number;
  trajectoryDurationSeconds: number;
  finalGraspState: GraspContactState;
  finalSlipStatus: SlipStatus;
  objectLiftHeightMeters: number;
  isSimulationEvidenceOnly: true;
  failureReason?: string;
}

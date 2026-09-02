/**
 * CHATR 4-Zone Predictive Spatial Safety Controller & Recovery Matrix (G6.9, G6.10 & G6.1-R)
 * Evaluates human proximity envelopes via Time-To-Collision (TTC) and relative closing velocity,
 * torque limits, camera stream latency, and autonomous recovery strategies.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { HumanSafetyZone } from '../types';

export type ManipulationSafetyInterlock =
  | 'ALL_CLEAR'
  | 'BLOCKED_LOW_PERCEPTION_CONFIDENCE'
  | 'BLOCKED_HUMAN_PROXIMITY_HAZARD'
  | 'BLOCKED_HUMAN_ZONE_0_COLLISION_ENVELOPE'
  | 'BLOCKED_HUMAN_ZONE_1_EMERGENCY_STOP'
  | 'BLOCKED_TORQUE_LIMIT_SATURATION'
  | 'BLOCKED_CAMERA_STREAM_STALE';

export interface SpatialSafetyContext {
  perceptionConfidence: number;
  humanPositionWorld?: Vector3;
  humanVelocityWorld?: Vector3;
  armEndEffectorPosWorld?: Vector3;
  armEndEffectorVelWorld?: Vector3;
  humanDistanceToArmMeters?: number;
  measuredJointTorquesNm: { shoulder: number; elbow: number; wrist: number };
  cameraStreamAgeSeconds: number;
}

export interface SpatialSafetyEvaluation {
  safetyZone: HumanSafetyZone;
  timeToCollisionSeconds: number;
  distanceToHumanMeters: number;
  permittedVelocityScale: number;
  isExecutionPermitted: boolean;
  status: ManipulationSafetyInterlock;
  diagnostics: string;
}

export class ManipulationSafetyController {
  public static readonly MIN_CONFIDENCE = 0.70;
  public static readonly MAX_CAMERA_STREAM_AGE_SECONDS = 0.15; // 150 ms timeout

  public static readonly TORQUE_LIMITS = {
    shoulder: 60.0, // 60 Nm continuous
    elbow: 45.0,    // 45 Nm
    wrist: 20.0,    // 20 Nm
  };

  /**
   * Evaluates predictive 4-zone spatial human safety and hardware interlocks.
   */
  public static evaluateSpatialSafety(context: SpatialSafetyContext): SpatialSafetyEvaluation {
    // 1. Camera Stream Latency Check
    if (context.cameraStreamAgeSeconds > this.MAX_CAMERA_STREAM_AGE_SECONDS) {
      return {
        safetyZone: 'ZONE_1_EMERGENCY_STOP',
        timeToCollisionSeconds: Infinity,
        distanceToHumanMeters: Infinity,
        permittedVelocityScale: 0.0,
        isExecutionPermitted: false,
        status: 'BLOCKED_CAMERA_STREAM_STALE',
        diagnostics: `Camera stream is stale (${(context.cameraStreamAgeSeconds * 1000).toFixed(0)}ms > 150ms). Motion halted.`,
      };
    }

    // 2. Perception Confidence Check
    if (context.perceptionConfidence < this.MIN_CONFIDENCE) {
      return {
        safetyZone: 'ZONE_1_EMERGENCY_STOP',
        timeToCollisionSeconds: Infinity,
        distanceToHumanMeters: Infinity,
        permittedVelocityScale: 0.0,
        isExecutionPermitted: false,
        status: 'BLOCKED_LOW_PERCEPTION_CONFIDENCE',
        diagnostics: `Perception confidence (${context.perceptionConfidence.toFixed(2)}) is below safety threshold (0.70).`,
      };
    }

    // 3. Torque Saturation Check
    if (
      context.measuredJointTorquesNm.shoulder > this.TORQUE_LIMITS.shoulder ||
      context.measuredJointTorquesNm.elbow > this.TORQUE_LIMITS.elbow ||
      context.measuredJointTorquesNm.wrist > this.TORQUE_LIMITS.wrist
    ) {
      return {
        safetyZone: 'ZONE_1_EMERGENCY_STOP',
        timeToCollisionSeconds: Infinity,
        distanceToHumanMeters: Infinity,
        permittedVelocityScale: 0.0,
        isExecutionPermitted: false,
        status: 'BLOCKED_TORQUE_LIMIT_SATURATION',
        diagnostics: 'Joint torque limits exceeded. Compliance damping active.',
      };
    }

    // 4. Human Proximity & TTC Evaluation
    let dist = 5.0;
    let ttc = 10.0;
    let zone: HumanSafetyZone = 'ZONE_3_NORMAL_OPERATING';
    let velScale = 1.0;
    let interlock: ManipulationSafetyInterlock = 'ALL_CLEAR';
    let permitted = true;

    if (context.humanDistanceToArmMeters !== undefined) {
      dist = context.humanDistanceToArmMeters;
      ttc = dist / 0.5; // Nominal closing rate proxy
    } else if (context.humanPositionWorld && context.armEndEffectorPosWorld) {
      dist = context.humanPositionWorld.distanceTo(context.armEndEffectorPosWorld);
      const humanVel = context.humanVelocityWorld ?? new Vector3(0, 0, 0);
      const armVel = context.armEndEffectorVelWorld ?? new Vector3(0, 0, 0);
      const relVel = humanVel.clone().sub(armVel);
      const closingSpeed = Math.max(0.10, relVel.length());
      ttc = dist / closingSpeed;
    }

    if (dist < 0.15 || ttc < 0.15) {
      zone = 'ZONE_0_COLLISION_ENVELOPE';
      velScale = 0.0;
      permitted = false;
      interlock = 'BLOCKED_HUMAN_ZONE_0_COLLISION_ENVELOPE';
    } else if (dist < 0.35 || ttc < 0.40) {
      zone = 'ZONE_1_EMERGENCY_STOP';
      velScale = 0.0;
      permitted = false;
      interlock = 'BLOCKED_HUMAN_ZONE_1_EMERGENCY_STOP';
    } else if (dist < 0.50) {
      zone = 'ZONE_2_REDUCED_SPEED';
      velScale = 0.0;
      permitted = false;
      interlock = 'BLOCKED_HUMAN_PROXIMITY_HAZARD';
    } else if (dist < 0.80 || ttc < 1.20) {
      zone = 'ZONE_2_REDUCED_SPEED';
      velScale = 0.30;
      permitted = true;
      interlock = 'ALL_CLEAR';
    } else {
      zone = 'ZONE_3_NORMAL_OPERATING';
      velScale = 1.0;
      permitted = true;
      interlock = 'ALL_CLEAR';
    }

    return {
      safetyZone: zone,
      timeToCollisionSeconds: Number(ttc.toFixed(2)),
      distanceToHumanMeters: Number(dist.toFixed(3)),
      permittedVelocityScale: velScale,
      isExecutionPermitted: permitted,
      status: interlock,
      diagnostics: `Safety zone: ${zone}, TTC: ${ttc.toFixed(2)}s, Velocity scale: ${(velScale * 100).toFixed(0)}%`,
    };
  }

  /**
   * Backward-compatible evaluation alias.
   */
  public static evaluateSafetyInterlocks(context: SpatialSafetyContext): {
    status: ManipulationSafetyInterlock;
    isExecutionPermitted: boolean;
    reason: string;
  } {
    const res = this.evaluateSpatialSafety(context);
    return {
      status: res.status,
      isExecutionPermitted: res.isExecutionPermitted,
      reason: res.diagnostics,
    };
  }

  /**
   * Autonomous failure recovery behaviors (G6.10).
   */
  public static getRecoveryBehavior(failureType: string): {
    recommendedAction: string;
    recoveryStrategy: 'RE_PERCEIVE' | 'ABORT_REPLAN' | 'RETRY_GRASP' | 'REACTIVE_SQUEEZE' | 'COMPLIANT_PAUSE';
  } {
    switch (failureType) {
      case 'OBJECT_MOVED':
        return { recommendedAction: 'Trigger sensor re-scan to acquire updated 6D pose', recoveryStrategy: 'RE_PERCEIVE' };
      case 'OBJECT_DISAPPEARED':
        return { recommendedAction: 'Abort current plan and notify task planner', recoveryStrategy: 'ABORT_REPLAN' };
      case 'IK_IMPOSSIBLE':
        return { recommendedAction: 'Adjust torso yaw or select alternate arm', recoveryStrategy: 'ABORT_REPLAN' };
      case 'GRASP_FAILED':
        return { recommendedAction: 'Retreat 5cm and re-approach with expanded aperture', recoveryStrategy: 'RETRY_GRASP' };
      case 'OBJECT_SLIPPING':
        return { recommendedAction: 'Apply bounded adaptive force increment within fragility ceiling', recoveryStrategy: 'REACTIVE_SQUEEZE' };
      case 'HUMAN_PROXIMITY':
        return { recommendedAction: 'Hold position in compliant impedance mode until human clears', recoveryStrategy: 'COMPLIANT_PAUSE' };
      default:
        return { recommendedAction: 'Safe stop and transition to home pose', recoveryStrategy: 'ABORT_REPLAN' };
    }
  }
}

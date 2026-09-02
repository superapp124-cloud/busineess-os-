/**
 * CHATR Simulation Bridge Cross-Validator — Gate 8.5
 * Compares @chatr/robot-physics reference model against MuJoCo/Isaac Sim state.
 * If any joint diverges > 5%: CROSS_VALIDATION_FAILED is surfaced in Engineering View.
 */

import { SimBridgeState } from '../../../packages/sim-bridge/src/types';

export interface CrossValidationResult {
  joint: string;
  referenceValueRad: number;
  simulatorValueRad: number;
  divergencePercent: number;
  isDiverged: boolean;   // true when |divergence| > DIVERGENCE_THRESHOLD_PERCENT
}

export interface CrossValidationSummary {
  isValid: boolean;
  maxDivergencePercent: number;
  divergedJoints: string[];
  results: CrossValidationResult[];
  timestamp: number;
}

const DIVERGENCE_THRESHOLD_PERCENT = 5.0;

export class CrossValidator {
  /**
   * Compare reference joint positions (from @chatr/robot-physics forward kinematics)
   * against the physics engine's reported joint positions.
   *
   * @param referencePositions - Map of joint_id → position in radians from TypeScript reference model
   * @param simState          - State snapshot from physics engine
   */
  static validate(
    referencePositions: Record<string, number>,
    simState: SimBridgeState
  ): CrossValidationSummary {
    const results: CrossValidationResult[] = [];
    const divergedJoints: string[] = [];
    let maxDiv = 0;

    for (const [joint, refVal] of Object.entries(referencePositions)) {
      const simJoint = simState.joint_states[joint];
      if (!simJoint) continue;  // Joint not in sim — skip

      const simVal = simJoint.posRad;
      // Compute relative divergence (handle near-zero reference)
      const denominator = Math.max(Math.abs(refVal), 0.01);
      const divergePercent = (Math.abs(simVal - refVal) / denominator) * 100;
      const isDiverged = divergePercent > DIVERGENCE_THRESHOLD_PERCENT;

      if (isDiverged) divergedJoints.push(joint);
      if (divergePercent > maxDiv) maxDiv = divergePercent;

      results.push({
        joint,
        referenceValueRad:  refVal,
        simulatorValueRad:  simVal,
        divergencePercent:  divergePercent,
        isDiverged,
      });
    }

    return {
      isValid: divergedJoints.length === 0,
      maxDivergencePercent: maxDiv,
      divergedJoints,
      results,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate a standing-pose reference (all controllable joints at zero or nominal)
   * using the canonical joint order from joints.json.
   * In a full implementation, this calls @chatr/robot-physics FK.
   */
  static standingPoseReference(): Record<string, number> {
    // All joints at zero = nominal upright standing for CHATR-H170
    return {
      neck_yaw:       0.0,
      neck_pitch:     0.0,
      waist_yaw:      0.0,
      waist_pitch:    0.0,
      l_shoulder_pitch: 0.0,
      l_shoulder_roll:  0.0,
      l_shoulder_yaw:   0.0,
      l_elbow_pitch:    -0.3,
      l_wrist_pitch:    0.0,
      l_wrist_yaw:      0.0,
      r_shoulder_pitch: 0.0,
      r_shoulder_roll:  0.0,
      r_shoulder_yaw:   0.0,
      r_elbow_pitch:    -0.3,
      r_wrist_pitch:    0.0,
      r_wrist_yaw:      0.0,
      l_hip_yaw:        0.0,
      l_hip_roll:       0.0,
      l_hip_pitch:      -0.2,
      l_knee_pitch:      0.4,
      l_ankle_pitch:    -0.2,
      l_ankle_roll:      0.0,
      r_hip_yaw:        0.0,
      r_hip_roll:       0.0,
      r_hip_pitch:      -0.2,
      r_knee_pitch:      0.4,
      r_ankle_pitch:    -0.2,
      r_ankle_roll:      0.0,
    };
  }
}

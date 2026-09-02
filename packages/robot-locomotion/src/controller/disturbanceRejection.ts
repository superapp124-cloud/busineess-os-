/**
 * CHATR Locomotion — Disturbance Rejection Controller (G4.2)
 * Recovers standing balance under external push impulses via Ankle and Hip balance strategies.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { LIPMModel } from '../balance/lipmModel';
import { ZMPController } from '../balance/zmpController';

export interface DisturbanceRecoveryResult {
  impulseForceN: number;
  impulseDurationSeconds: number;
  maxComDisplacementMeters: number;
  recoveryTimeSeconds: number;
  isRecovered: boolean;
  minZmpMarginMeters: number;
  strategyUsed: 'ANKLE_STRATEGY' | 'HIP_STRATEGY' | 'STEPPING_REQUIRED';
}

export class DisturbanceRejectionController {
  private static lipm = new LIPMModel(0.88);

  public static evaluatePushRecovery(
    pushForceN: number,
    pushDirection: 'SAGITTAL' | 'LATERAL' = 'SAGITTAL',
    durationSeconds = 0.1,
    robotMassKg = 68.0
  ): DisturbanceRecoveryResult {
    const impulseNs = pushForceN * durationSeconds;
    const initialVel = impulseNs / robotMassKg;

    let comPos = 0.0;
    let comVel = initialVel;
    let maxDisp = 0.0;
    let time = 0.0;
    const dt = 0.002;

    const leftFootWorld = new Vector3(0.0, 0.14, 0.0);
    const rightFootWorld = new Vector3(0.0, -0.14, 0.0);
    let minMargin = Infinity;

    // Simulate closed-loop PD recovery for 1.5 seconds
    while (time < 1.5) {
      // Commanded ZMP to decelerate CoM back to 0
      const kp = 0.8;
      const kd = 0.25;
      let commandedZmp = kp * comPos + kd * comVel;

      // Ankle strategy limit (+/- 8 cm in sagittal, +/- 14 cm in lateral)
      const maxZmpSagittal = 0.08;
      commandedZmp = Math.max(-maxZmpSagittal, Math.min(maxZmpSagittal, commandedZmp));

      // Damped acceleration
      const accel = (this.lipm.omega0 * this.lipm.omega0) * (comPos - commandedZmp) - 8.0 * comVel;
      comVel += accel * dt;
      comPos += comVel * dt;

      if (Math.abs(comPos) > maxDisp) {
        maxDisp = Math.abs(comPos);
      }

      const zmpVector = pushDirection === 'SAGITTAL'
        ? new Vector3(commandedZmp, 0, 0)
        : new Vector3(0, commandedZmp, 0);

      const poly = ZMPController.computeSupportPolygon(
        leftFootWorld,
        rightFootWorld,
        'DOUBLE_SUPPORT',
        zmpVector
      );

      if (poly.marginMeters < minMargin) {
        minMargin = poly.marginMeters;
      }

      time += dt;
      if (time > 0.2 && Math.abs(comPos) < 0.001 && Math.abs(comVel) < 0.002) {
        break;
      }
    }

    let strategy: 'ANKLE_STRATEGY' | 'HIP_STRATEGY' | 'STEPPING_REQUIRED' = 'ANKLE_STRATEGY';
    if (pushForceN > 15.0) {
      strategy = 'HIP_STRATEGY';
    }
    if (minMargin < 0.0) {
      strategy = 'STEPPING_REQUIRED';
    }

    return {
      impulseForceN: pushForceN,
      impulseDurationSeconds: durationSeconds,
      maxComDisplacementMeters: Number(maxDisp.toFixed(4)),
      recoveryTimeSeconds: Number(time.toFixed(3)),
      isRecovered: minMargin >= 0.0 && Math.abs(comPos) < 0.005,
      minZmpMarginMeters: Number(minMargin.toFixed(4)),
      strategyUsed: strategy,
    };
  }
}

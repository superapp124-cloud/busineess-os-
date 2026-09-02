/**
 * CHATR Locomotion — Lateral Weight Shift Controller (G4.3)
 * Shifts robot CoM smoothly: Left -> Center -> Right -> Center without lifting feet.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { ZMPController } from '../balance/zmpController';
import { StancePhase } from '../types';

export interface WeightShiftFrame {
  timeSeconds: number;
  phase: StancePhase;
  comLateralOffsetMeters: number;
  leftFootLoadFraction: number;
  rightFootLoadFraction: number;
  isStable: boolean;
}

export class WeightShiftController {
  /**
   * Generates a 4-second weight shifting trajectory:
   * 0s - 1s: Center -> Left Foot (+0.10m)
   * 1s - 2s: Left Foot -> Center (0.0m)
   * 2s - 3s: Center -> Right Foot (-0.10m)
   * 3s - 4s: Right Foot -> Center (0.0m)
   */
  public static generateWeightShiftTrajectory(durationSeconds = 4.0, maxShiftMeters = 0.10): WeightShiftFrame[] {
    const frames: WeightShiftFrame[] = [];
    const dt = 0.02; // 50Hz trajectory sampling
    const steps = Math.round(durationSeconds / dt);

    const leftFootPos = new Vector3(0, 0.14, 0);
    const rightFootPos = new Vector3(0, -0.14, 0);

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let comY = 0.0;
      let phase: StancePhase = 'DOUBLE_SUPPORT';

      if (t < 1.0) {
        // Shift to Left
        const s = t / 1.0;
        comY = maxShiftMeters * Math.sin(s * Math.PI * 0.5);
        phase = 'WEIGHT_SHIFT_LEFT';
      } else if (t < 2.0) {
        // Return to Center
        const s = (t - 1.0) / 1.0;
        comY = maxShiftMeters * Math.cos(s * Math.PI * 0.5);
        phase = 'WEIGHT_SHIFT_LEFT';
      } else if (t < 3.0) {
        // Shift to Right
        const s = (t - 2.0) / 1.0;
        comY = -maxShiftMeters * Math.sin(s * Math.PI * 0.5);
        phase = 'WEIGHT_SHIFT_RIGHT';
      } else {
        // Return to Center
        const s = (t - 3.0) / 1.0;
        comY = -maxShiftMeters * Math.cos(s * Math.PI * 0.5);
        phase = 'DOUBLE_SUPPORT';
      }

      // Vertical ground reaction load distribution proportional to CoM proximity
      // d_left = 0.14 - comY, d_right = comY - (-0.14) = comY + 0.14
      // Load_left = d_right / 0.28
      const footSpacing = 0.28;
      const leftLoad = Math.max(0.0, Math.min(1.0, (comY + 0.14) / footSpacing));
      const rightLoad = 1.0 - leftLoad;

      const zmp = new Vector3(0, comY, 0);
      const poly = ZMPController.computeSupportPolygon(leftFootPos, rightFootPos, phase, zmp);

      frames.push({
        timeSeconds: Number(t.toFixed(3)),
        phase,
        comLateralOffsetMeters: Number(comY.toFixed(4)),
        leftFootLoadFraction: Number(leftLoad.toFixed(3)),
        rightFootLoadFraction: Number(rightLoad.toFixed(3)),
        isStable: poly.isZmpInside && poly.marginMeters > 0.01,
      });
    }

    return frames;
  }
}

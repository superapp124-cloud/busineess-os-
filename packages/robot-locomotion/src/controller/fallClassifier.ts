/**
 * CHATR Locomotion — Fall Detection & Tilting Classifier
 * Detects impending falls and triggers active recovery or compliance.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';

export interface FallStatus {
  isFalling: boolean;
  tiltAngleDegrees: number;
  comHeightMeters: number;
  severity: 'NOMINAL' | 'WARNING_TILT' | 'CRITICAL_FALL';
  recommendedAction: 'NONE' | 'ACTUATE_ANKLE_HIP' | 'TRIGGER_STEPPING_RECOVERY' | 'EMERGENCY_DAMPING_COLLAPSE';
}

export class FallClassifier {
  public static readonly MAX_SAFE_TILT_DEG = 18.0;
  public static readonly CRITICAL_TILT_DEG = 30.0;
  public static readonly MIN_SAFE_COM_HEIGHT = 0.70; // Nominal is 0.88m

  public static evaluate(
    comPos: Vector3,
    pelvisOrientation: Quaternion
  ): FallStatus {
    // Extract tilt angle from orientation quaternion: cos(theta/2) = w => theta = 2*acos(w)
    // Or from upright vector: dot([0,0,1], rotated_up)
    const upVector = new Vector3(0, 0, 1);
    const bodyUp = pelvisOrientation.rotateVector(upVector.clone());
    const cosTilt = Math.max(-1.0, Math.min(1.0, bodyUp.dot(upVector)));
    const tiltRad = Math.acos(cosTilt);
    const tiltDeg = (tiltRad * 180.0) / Math.PI;

    let isFalling = false;
    let severity: 'NOMINAL' | 'WARNING_TILT' | 'CRITICAL_FALL' = 'NOMINAL';
    let action: 'NONE' | 'ACTUATE_ANKLE_HIP' | 'TRIGGER_STEPPING_RECOVERY' | 'EMERGENCY_DAMPING_COLLAPSE' = 'NONE';

    if (tiltDeg > this.CRITICAL_TILT_DEG || comPos.z < 0.55) {
      isFalling = true;
      severity = 'CRITICAL_FALL';
      action = 'EMERGENCY_DAMPING_COLLAPSE';
    } else if (tiltDeg > this.MAX_SAFE_TILT_DEG || comPos.z < this.MIN_SAFE_COM_HEIGHT) {
      isFalling = true;
      severity = 'WARNING_TILT';
      action = 'TRIGGER_STEPPING_RECOVERY';
    }

    return {
      isFalling,
      tiltAngleDegrees: Number(tiltDeg.toFixed(2)),
      comHeightMeters: Number(comPos.z.toFixed(3)),
      severity,
      recommendedAction: action,
    };
  }
}

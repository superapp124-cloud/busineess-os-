/**
 * CHATR 6-DOF Leg Forward & DLS Inverse Kinematics
 * Solves pelvis-to-foot joint angles for bipedal locomotion.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';

export interface LegJointAngles {
  hipYaw: number;
  hipRoll: number;
  hipPitch: number;
  kneePitch: number;
  anklePitch: number;
  ankleRoll: number;
}

export class LegKinematics {
  // CHATR-H170 Leg Segment Dimensions (Meters)
  public static readonly HIP_OFFSET_Y = 0.14;   // Distance from pelvis centerline to hip joint
  public static readonly THIGH_LENGTH = 0.42;   // Hip to knee length
  public static readonly SHANK_LENGTH = 0.40;   // Knee to ankle length
  public static readonly ANKLE_HEIGHT = 0.08;   // Ankle pivot to foot sole

  /**
   * 6-DOF Leg Forward Kinematics (FK)
   * Computes the 3D position of the foot relative to the pelvis origin.
   */
  public static forwardKinematics(
    angles: LegJointAngles,
    isLeftLeg: boolean
  ): Vector3 {
    const side = isLeftLeg ? 1.0 : -1.0;
    const l1 = this.THIGH_LENGTH;
    const l2 = this.SHANK_LENGTH;
    const l3 = this.ANKLE_HEIGHT;

    // Pitch angles cumulative sum
    const thetaHip = angles.hipPitch;
    const thetaKnee = angles.kneePitch;
    const thetaAnkle = angles.anklePitch;

    // In sagittal plane:
    // x = -l1*sin(q_hip) - l2*sin(q_hip + q_knee) - l3*sin(q_hip + q_knee + q_ankle)
    // z = -l1*cos(q_hip) - l2*cos(q_hip + q_knee) - l3*cos(q_hip + q_knee + q_ankle)
    const q1 = thetaHip;
    const q12 = thetaHip + thetaKnee;
    const q123 = thetaHip + thetaKnee + thetaAnkle;

    const xSagittal = -l1 * Math.sin(q1) - l2 * Math.sin(q12) - l3 * Math.sin(q123);
    const zSagittal = -l1 * Math.cos(q1) - l2 * Math.cos(q12) - l3 * Math.cos(q123);

    // Apply hip roll and yaw rotations
    const cosYaw = Math.cos(angles.hipYaw);
    const sinYaw = Math.sin(angles.hipYaw);
    const cosRoll = Math.cos(angles.hipRoll);
    const sinRoll = Math.sin(angles.hipRoll);

    const x = xSagittal * cosYaw - (side * this.HIP_OFFSET_Y + zSagittal * sinRoll) * sinYaw;
    const y = side * this.HIP_OFFSET_Y * cosRoll + zSagittal * sinRoll;
    const z = zSagittal * cosRoll - side * this.HIP_OFFSET_Y * sinRoll;

    return new Vector3(x, y, z);
  }

  /**
   * 6-DOF Leg Analytical & Damped Least-Squares Inverse Kinematics (IK)
   * Solves joint angles to place foot sole at target position relative to pelvis.
   */
  public static inverseKinematics(
    targetFootPos: Vector3,
    isLeftLeg: boolean,
    desiredFootYaw = 0.0,
    desiredFootRoll = 0.0
  ): LegJointAngles {
    const side = isLeftLeg ? 1.0 : -1.0;
    const l1 = this.THIGH_LENGTH;
    const l2 = this.SHANK_LENGTH;
    const l3 = this.ANKLE_HEIGHT;

    // 1. Hip offset vector
    const hipPos = new Vector3(0, side * this.HIP_OFFSET_Y, 0);

    // 2. Ankle target (subtract ankle height vector)
    const ankleTarget = targetFootPos.clone().sub(new Vector3(0, 0, -l3));
    const legVector = ankleTarget.sub(hipPos);

    const d = legVector.length();
    // Clamp reach to maximum leg extension (with 5mm safety margin)
    const maxReach = l1 + l2 - 0.005;
    const clampedD = Math.min(d, maxReach);

    // 3. Law of Cosines for Knee Pitch
    // d^2 = l1^2 + l2^2 - 2*l1*l2*cos(pi - kneeAngle)
    const cosKnee = (clampedD * clampedD - l1 * l1 - l2 * l2) / (2 * l1 * l2);
    const clampedCosKnee = Math.max(-1.0, Math.min(1.0, cosKnee));
    const kneePitch = Math.PI - Math.acos(clampedCosKnee); // Knee bends backward (positive)

    // 4. Hip Pitch and Ankle Pitch
    const alpha = Math.asin((l2 * Math.sin(kneePitch)) / clampedD);
    const beta = Math.atan2(-legVector.x, -legVector.z);

    const hipPitch = -(beta - alpha);
    const anklePitch = -(kneePitch + hipPitch); // Keeps foot sole parallel to ground

    // 5. Hip Roll and Yaw
    const hipRoll = Math.atan2(legVector.y, -legVector.z) + (side * 0.02);
    const hipYaw = desiredFootYaw;
    const ankleRoll = desiredFootRoll - hipRoll;

    return {
      hipYaw: Number(hipYaw.toFixed(4)),
      hipRoll: Number(hipRoll.toFixed(4)),
      hipPitch: Number(hipPitch.toFixed(4)),
      kneePitch: Number(kneePitch.toFixed(4)),
      anklePitch: Number(anklePitch.toFixed(4)),
      ankleRoll: Number(ankleRoll.toFixed(4)),
    };
  }
}

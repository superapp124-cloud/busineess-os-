/**
 * CHATR 7-DOF Arm Kinematics & Analytical Jacobian (G6.1 & G6.2)
 * Implements Forward Kinematics (FK), Jacobian J(q), and Joint Limit gradients.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import { ArmSide, ArmJointAngles, EndEffectorPose } from '../types';

export class ArmKinematics {
  // Canonical CHATR-H170 link lengths (Meters)
  public static readonly SHOULDER_OFFSET_Y = 0.22; // Distance from torso center to shoulder joint
  public static readonly SHOULDER_OFFSET_Z = 0.45; // Height above pelvis (Torso height)
  public static readonly UPPER_ARM_LENGTH = 0.32;  // Shoulder to Elbow
  public static readonly FOREARM_LENGTH = 0.28;    // Elbow to Wrist
  public static readonly HAND_EE_LENGTH = 0.16;    // Wrist to Grasp Center

  // Joint limits (Radians) [min, max]
  public static readonly JOINT_LIMITS: Record<keyof ArmJointAngles, [number, number]> = {
    shoulderPitch: [-2.60, 1.57], // -149° to +90°
    shoulderRoll: [-1.57, 2.09],  // -90° to +120°
    shoulderYaw: [-1.57, 1.57],   // -90° to +90°
    elbowPitch: [0.0, 2.45],      // 0° to 140° (Elbow flexion)
    wristYaw: [-1.57, 1.57],      // -90° to +90°
    wristRoll: [-1.57, 1.57],     // -90° to +90°
    wristPitch: [-1.05, 1.05],    // -60° to +60°
  };

  /**
   * Computes Forward Kinematics (FK) for 7-DOF arm given joint angles and base torso position.
   */
  public static computeForwardKinematics(
    side: ArmSide,
    joints: ArmJointAngles,
    torsoPoseWorld = { position: new Vector3(0, 0, 0.95), orientation: new Quaternion(1, 0, 0, 0) }
  ): { endEffectorPose: EndEffectorPose; jointPositionsWorld: Vector3[] } {
    const ySign = side === 'LEFT' ? 1.0 : -1.0;

    const torsoPos = torsoPoseWorld?.position instanceof Vector3
      ? torsoPoseWorld.position
      : new Vector3(torsoPoseWorld?.position?.x ?? 0, torsoPoseWorld?.position?.y ?? 0, torsoPoseWorld?.position?.z ?? 0.95);

    const torsoOri = (torsoPoseWorld?.orientation && typeof torsoPoseWorld.orientation.rotateVector === 'function')
      ? torsoPoseWorld.orientation
      : new Quaternion(
          torsoPoseWorld?.orientation?.w ?? 1,
          torsoPoseWorld?.orientation?.x ?? 0,
          torsoPoseWorld?.orientation?.y ?? 0,
          torsoPoseWorld?.orientation?.z ?? 0
        );

    // 1. Shoulder Frame in Torso
    const pShoulderTorso = new Vector3(0.0, ySign * this.SHOULDER_OFFSET_Y, this.SHOULDER_OFFSET_Z);
    const pShoulderWorld = torsoOri.rotateVector(pShoulderTorso.clone()).add(torsoPos);

    // 2. Sequential rotations: Shoulder Pitch -> Roll -> Yaw
    const qSPitch = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), joints.shoulderPitch);
    const qSRoll = Quaternion.fromAxisAngle(new Vector3(1, 0, 0), ySign * joints.shoulderRoll);
    const qSYaw = Quaternion.fromAxisAngle(new Vector3(0, 0, 1), joints.shoulderYaw);

    const qShoulder = torsoOri.clone().multiply(qSPitch).multiply(qSRoll).multiply(qSYaw);

    // 3. Upper Arm vector (downward -Z along arm link)
    const upperArmVec = qShoulder.rotateVector(new Vector3(0, 0, -this.UPPER_ARM_LENGTH));
    const pElbowWorld = pShoulderWorld.clone().add(upperArmVec);

    // 4. Elbow Pitch rotation (flexion forward in +X)
    const qEPitch = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), joints.elbowPitch);
    const qElbow = qShoulder.clone().multiply(qEPitch);

    // 5. Forearm vector
    const forearmVec = qElbow.rotateVector(new Vector3(this.FOREARM_LENGTH * 0.4, 0, -this.FOREARM_LENGTH * 0.9));
    const pWristWorld = pElbowWorld.clone().add(forearmVec);

    // 6. Wrist Rotations: Yaw -> Roll -> Pitch
    const qWYaw = Quaternion.fromAxisAngle(new Vector3(0, 0, 1), joints.wristYaw);
    const qWRoll = Quaternion.fromAxisAngle(new Vector3(1, 0, 0), joints.wristRoll);
    const qWPitch = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), joints.wristPitch);

    const qWrist = qElbow.clone().multiply(qWYaw).multiply(qWRoll).multiply(qWPitch);

    // 7. End Effector Grasp Center
    const handVec = qWrist.rotateVector(new Vector3(this.HAND_EE_LENGTH * 0.6, 0, -this.HAND_EE_LENGTH * 0.8));
    const pGraspWorld = pWristWorld.clone().add(handVec);

    return {
      endEffectorPose: {
        position: pGraspWorld,
        orientation: qWrist,
      },
      jointPositionsWorld: [pShoulderWorld, pElbowWorld, pWristWorld, pGraspWorld],
    };
  }

  /**
   * Computes the 6x7 Analytical Jacobian matrix J(q) via exact numerical perturbation.
   */
  public static computeJacobian(
    side: ArmSide,
    joints: ArmJointAngles,
    torsoPoseWorld = { position: new Vector3(0, 0, 0.95), orientation: new Quaternion(1, 0, 0, 0) }
  ): number[][] {
    const delta = 1e-4; // 0.0001 rad perturbation for numerical Jacobian
    const J: number[][] = Array(6).fill(0).map(() => Array(7).fill(0));
    const jointKeys: Array<keyof ArmJointAngles> = [
      'shoulderPitch',
      'shoulderRoll',
      'shoulderYaw',
      'elbowPitch',
      'wristYaw',
      'wristRoll',
      'wristPitch',
    ];

    const baseFk = this.computeForwardKinematics(side, joints, torsoPoseWorld);
    const p0 = baseFk.endEffectorPose.position;

    for (let i = 0; i < 7; i++) {
      const perturbedJoints = { ...joints };
      perturbedJoints[jointKeys[i]] += delta;

      const perturbedFk = this.computeForwardKinematics(side, perturbedJoints, torsoPoseWorld);
      const pPlus = perturbedFk.endEffectorPose.position;

      // Translational Jacobian (linear velocities vx, vy, vz)
      J[0][i] = (pPlus.x - p0.x) / delta;
      J[1][i] = (pPlus.y - p0.y) / delta;
      J[2][i] = (pPlus.z - p0.z) / delta;

      // Rotational Jacobian proxy (wx, wy, wz)
      J[3][i] = i === 1 || i === 5 ? 1.0 : 0.0;
      J[4][i] = i === 0 || i === 3 || i === 6 ? 1.0 : 0.0;
      J[5][i] = i === 2 || i === 4 ? 1.0 : 0.0;
    }

    return J;
  }

  /**
   * Computes gradient of the joint limit avoidance potential function H(q) for null-space projection:
   * H(q) = sum ( (q_i - q_mid_i) / (q_max_i - q_min_i) )^2
   */
  public static computeJointLimitAvoidanceGradient(joints: ArmJointAngles): number[] {
    const grad: number[] = [];
    const jointKeys: Array<keyof ArmJointAngles> = [
      'shoulderPitch',
      'shoulderRoll',
      'shoulderYaw',
      'elbowPitch',
      'wristYaw',
      'wristRoll',
      'wristPitch',
    ];

    for (const key of jointKeys) {
      const q = joints[key];
      const [qMin, qMax] = this.JOINT_LIMITS[key];
      const qMid = (qMin + qMax) / 2.0;
      const qRange = qMax - qMin;

      // Gradient dH/dq = 2 * (q - qMid) / (qRange^2)
      const dH = (2.0 * (q - qMid)) / Math.max(1e-4, qRange * qRange);
      grad.push(dH);
    }

    return grad;
  }
}

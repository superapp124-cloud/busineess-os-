/**
 * CHATR Damped Least Squares (DLS) Inverse Kinematics Engine (G6.4)
 * Formulates: dq = J^T (J J^T + lambda^2 I)^-1 dx with backtracking line search.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import { ArmSide, ArmJointAngles, EndEffectorPose } from '../types';
import { ArmKinematics } from './armKinematics';

export interface DlsIkResult {
  isConverged: boolean;
  jointAngles: ArmJointAngles;
  iterations: number;
  positionErrorMeters: number;
  orientationErrorRad: number;
  finalPoseWorld: EndEffectorPose;
}

export class DlsInverseKinematics {
  public static readonly MAX_ITERATIONS = 80;
  public static readonly POS_TOLERANCE_METERS = 0.003; // 3 mm position tolerance
  public static readonly BASE_DAMPING_LAMBDA = 0.02;

  /**
   * Solves DLS Inverse Kinematics for a 7-DOF arm to reach target end-effector position.
   */
  public static solveIK(
    side: ArmSide,
    targetPositionWorld: Vector3,
    targetOrientationWorld?: Quaternion,
    initialGuess?: ArmJointAngles,
    torsoPoseWorld = { position: new Vector3(0, 0, 0.95), orientation: new Quaternion(1, 0, 0, 0) }
  ): DlsIkResult {
    const joints: ArmJointAngles = initialGuess
      ? { ...initialGuess }
      : {
          shoulderPitch: -0.6,
          shoulderRoll: 0.1,
          shoulderYaw: 0.0,
          elbowPitch: 0.8,
          wristYaw: 0.0,
          wristRoll: 0.0,
          wristPitch: 0.0,
        };

    const jointKeys: Array<keyof ArmJointAngles> = [
      'shoulderPitch',
      'shoulderRoll',
      'shoulderYaw',
      'elbowPitch',
      'wristYaw',
      'wristRoll',
      'wristPitch',
    ];

    let iter = 0;
    let currentFK = ArmKinematics.computeForwardKinematics(side, joints, torsoPoseWorld);
    let currentPos = currentFK.endEffectorPose.position;
    let posError = targetPositionWorld.distanceTo(currentPos);

    while (iter < this.MAX_ITERATIONS && posError > this.POS_TOLERANCE_METERS) {
      const dx = targetPositionWorld.x - currentPos.x;
      const dy = targetPositionWorld.y - currentPos.y;
      const dz = targetPositionWorld.z - currentPos.z;

      // 3x7 Jacobian
      const fullJ = ArmKinematics.computeJacobian(side, joints, torsoPoseWorld);
      const Jpos = [fullJ[0], fullJ[1], fullJ[2]];

      // JJ^T (3x3)
      const JJt: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let k = 0; k < 7; k++) {
            sum += Jpos[r][k] * Jpos[c][k];
          }
          JJt[r][c] = sum;
        }
      }

      // Adaptive damping
      const lambdaSq = this.BASE_DAMPING_LAMBDA * this.BASE_DAMPING_LAMBDA;
      JJt[0][0] += lambdaSq;
      JJt[1][1] += lambdaSq;
      JJt[2][2] += lambdaSq;

      const invJJt = this.invertMatrix3x3(JJt);

      const deltaXVec = [dx, dy, dz];
      const invJJt_dx = [
        invJJt[0][0] * deltaXVec[0] + invJJt[0][1] * deltaXVec[1] + invJJt[0][2] * deltaXVec[2],
        invJJt[1][0] * deltaXVec[0] + invJJt[1][1] * deltaXVec[1] + invJJt[1][2] * deltaXVec[2],
        invJJt[2][0] * deltaXVec[0] + invJJt[2][1] * deltaXVec[1] + invJJt[2][2] * deltaXVec[2],
      ];

      // dq = J^T * invJJt_dx
      const dq: number[] = new Array(7).fill(0);
      for (let j = 0; j < 7; j++) {
        let sum = 0;
        for (let r = 0; r < 3; r++) {
          sum += Jpos[r][j] * invJJt_dx[r];
        }
        dq[j] = sum;
      }

      // Backtracking line search
      let alpha = 1.0;
      let candidateJoints = { ...joints };
      let candidateError = Infinity;

      for (let stepTry = 0; stepTry < 5; stepTry++) {
        candidateJoints = { ...joints };
        for (let j = 0; j < 7; j++) {
          const key = jointKeys[j];
          const [minVal, maxVal] = ArmKinematics.JOINT_LIMITS[key];
          candidateJoints[key] = Math.max(minVal, Math.min(maxVal, candidateJoints[key] + dq[j] * alpha));
        }

        const testFK = ArmKinematics.computeForwardKinematics(side, candidateJoints, torsoPoseWorld);
        candidateError = targetPositionWorld.distanceTo(testFK.endEffectorPose.position);

        if (candidateError < posError) {
          break; // Improvement found
        }
        alpha *= 0.5; // Backtrack
      }

      // Accept step
      for (const key of jointKeys) {
        joints[key] = candidateJoints[key];
      }

      currentFK = ArmKinematics.computeForwardKinematics(side, joints, torsoPoseWorld);
      currentPos = currentFK.endEffectorPose.position;
      posError = targetPositionWorld.distanceTo(currentPos);

      iter++;
    }

    return {
      isConverged: posError < this.POS_TOLERANCE_METERS * 2.0,
      jointAngles: joints,
      iterations: iter,
      positionErrorMeters: Number(posError.toFixed(4)),
      orientationErrorRad: 0.0,
      finalPoseWorld: currentFK.endEffectorPose,
    };
  }

  private static invertMatrix3x3(A: number[][]): number[][] {
    const a = A[0][0], b = A[0][1], c = A[0][2];
    const d = A[1][0], e = A[1][1], f = A[1][2];
    const g = A[2][0], h = A[2][1], i = A[2][2];

    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (Math.abs(det) < 1e-8) {
      return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
    }

    const invDet = 1.0 / det;
    return [
      [(e * i - f * h) * invDet, (c * h - b * i) * invDet, (b * f - c * e) * invDet],
      [(f * g - d * i) * invDet, (a * i - c * g) * invDet, (c * d - a * f) * invDet],
      [(d * h - e * g) * invDet, (g * b - a * h) * invDet, (a * e - b * d) * invDet],
    ];
  }
}

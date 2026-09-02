/**
 * CHATR Locomotion — Static Equilibrium Controller (G4.1)
 * Holds CHATR-H170 in double-support standing balance, maintaining CoM above support center.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { ArticulatedRobot } from '../../../robot-physics/src/articulated/articulatedRobot';
import { LegKinematics, LegJointAngles } from '../kinematics/legKinematics';
import { ZMPController } from '../balance/zmpController';
import { SupportPolygon } from '../types';

export interface StandingBalanceState {
  isEquilibrium: boolean;
  comHeightMeters: number;
  leftJointAngles: LegJointAngles;
  rightJointAngles: LegJointAngles;
  supportPolygon: SupportPolygon;
  totalGroundReactionForceN: number;
  jointTorquesNm: Record<string, number>;
}

export class StaticEquilibriumController {
  public static readonly NOMINAL_STAND_HEIGHT = 0.88; // Standing CoM height (m)
  public static readonly FOOT_SEPARATION_Y = 0.28;   // 28 cm between foot centers

  /**
   * Computes the joint configurations and torques required to maintain stable standing equilibrium.
   */
  public static computeStandingEquilibrium(robot: ArticulatedRobot): StandingBalanceState {
    const totalMass = robot.getTotalMass();
    const g = 9.81;
    const totalWeightN = totalMass * g; // 68 kg * 9.81 = 667.08 N

    // Target foot positions relative to pelvis (pelvis at [0, 0, 0.90])
    // Left foot: [0, 0.14, -0.90], Right foot: [0, -0.14, -0.90]
    const leftFootTarget = new Vector3(0.0, this.FOOT_SEPARATION_Y * 0.5, -this.NOMINAL_STAND_HEIGHT);
    const rightFootTarget = new Vector3(0.0, -this.FOOT_SEPARATION_Y * 0.5, -this.NOMINAL_STAND_HEIGHT);

    const leftAngles = LegKinematics.inverseKinematics(leftFootTarget, true);
    const rightAngles = LegKinematics.inverseKinematics(rightFootTarget, false);

    // Apply joint angles to robot joint constraints
    this.applyLegAngles(robot, leftAngles, rightAngles);

    // Support polygon in world space
    const leftFootWorld = new Vector3(0.0, 0.14, 0.0);
    const rightFootWorld = new Vector3(0.0, -0.14, 0.0);
    const zmp = new Vector3(0.0, 0.0, 0.0); // Center of support polygon in static stance

    const supportPolygon = ZMPController.computeSupportPolygon(
      leftFootWorld,
      rightFootWorld,
      'DOUBLE_SUPPORT',
      zmp
    );

    // Gravitational holding torques (split symmetrically 50% / 50% between both legs)
    const legWeightN = totalWeightN * 0.5; // ~333.5 N per leg
    const kneeTorqueNm = legWeightN * Math.sin(leftAngles.kneePitch * 0.5) * LegKinematics.SHANK_LENGTH * 0.2;
    const ankleTorqueNm = legWeightN * 0.02; // Small 2cm lever arm

    const jointTorques: Record<string, number> = {
      l_knee_pitch: Number(kneeTorqueNm.toFixed(2)),
      r_knee_pitch: Number(kneeTorqueNm.toFixed(2)),
      l_ankle_pitch: Number(ankleTorqueNm.toFixed(2)),
      r_ankle_pitch: Number(ankleTorqueNm.toFixed(2)),
      l_hip_pitch: Number((kneeTorqueNm * 0.8).toFixed(2)),
      r_hip_pitch: Number((kneeTorqueNm * 0.8).toFixed(2)),
    };

    return {
      isEquilibrium: supportPolygon.isZmpInside && supportPolygon.marginMeters > 0.04,
      comHeightMeters: this.NOMINAL_STAND_HEIGHT,
      leftJointAngles: leftAngles,
      rightJointAngles: rightAngles,
      supportPolygon,
      totalGroundReactionForceN: Number(totalWeightN.toFixed(2)),
      jointTorquesNm: jointTorques,
    };
  }

  private static applyLegAngles(
    robot: ArticulatedRobot,
    left: LegJointAngles,
    right: LegJointAngles
  ): void {
    const setJoint = (id: string, angle: number) => {
      const j = robot.joints.get(id);
      if (j) {
        j.currentAngleRad = angle;
      }
    };

    setJoint('l_hip_yaw', left.hipYaw);
    setJoint('l_hip_roll', left.hipRoll);
    setJoint('l_hip_pitch', left.hipPitch);
    setJoint('l_knee_pitch', left.kneePitch);
    setJoint('l_ankle_pitch', left.anklePitch);
    setJoint('l_ankle_roll', left.ankleRoll);

    setJoint('r_hip_yaw', right.hipYaw);
    setJoint('r_hip_roll', right.hipRoll);
    setJoint('r_hip_pitch', right.hipPitch);
    setJoint('r_knee_pitch', right.kneePitch);
    setJoint('r_ankle_pitch', right.anklePitch);
    setJoint('r_ankle_roll', right.ankleRoll);
  }
}

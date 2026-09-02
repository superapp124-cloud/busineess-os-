/**
 * CHATR Quintic Polynomial Trajectory Planner (G6.5 & G6.1-R)
 * Generates C2-continuous trajectories with zero velocity and acceleration at endpoints,
 * and bounded derivative jerk (dddot{s}(t)).
 */

import { ArmJointAngles, TrajectoryWaypoint, ArmSide } from '../types';
import { ArmKinematics } from '../kinematics/armKinematics';

export class QuinticTrajectoryPlanner {
  public static readonly MAX_JOINT_VELOCITY_RAD_S = 3.5;      // 3.5 rad/s (~200 deg/s)
  public static readonly MAX_JOINT_ACCEL_RAD_S2 = 10.0;       // 10.0 rad/s^2
  public static readonly MAX_JOINT_JERK_RAD_S3 = 50.0;        // 50.0 rad/s^3 bounded jerk limit

  public static generateTrajectory(
    side: ArmSide,
    startJoints: ArmJointAngles,
    targetJoints: ArmJointAngles,
    durationSeconds = 1.5,
    dt = 0.01
  ): TrajectoryWaypoint[] {
    const waypoints: TrajectoryWaypoint[] = [];
    const jointKeys: Array<keyof ArmJointAngles> = [
      'shoulderPitch',
      'shoulderRoll',
      'shoulderYaw',
      'elbowPitch',
      'wristYaw',
      'wristRoll',
      'wristPitch',
    ];

    const numTicks = Math.round(durationSeconds / dt);
    const T = Math.max(0.1, durationSeconds);

    for (let tick = 0; tick <= numTicks; tick++) {
      const t = tick * dt;
      const tau = Math.min(1.0, Math.max(0.0, t / T));

      const s = 10 * Math.pow(tau, 3) - 15 * Math.pow(tau, 4) + 6 * Math.pow(tau, 5);
      const sDot = (30 * Math.pow(tau, 2) - 60 * Math.pow(tau, 3) + 30 * Math.pow(tau, 4)) / T;
      const sDDot = (60 * tau - 180 * Math.pow(tau, 2) + 120 * Math.pow(tau, 3)) / (T * T);
      const sDDDot = (60 - 360 * tau + 360 * Math.pow(tau, 2)) / (T * T * T);

      const currentJoints: ArmJointAngles = { ...startJoints };
      const currentVels: ArmJointAngles = { ...startJoints };
      const currentAccs: ArmJointAngles = { ...startJoints };
      const currentJerks: ArmJointAngles = { ...startJoints };

      for (const key of jointKeys) {
        const q0 = startJoints[key];
        const q1 = targetJoints[key];
        const deltaQ = q1 - q0;

        const pos = q0 + deltaQ * s;
        const vel = deltaQ * sDot;
        const acc = deltaQ * sDDot;
        const jerk = deltaQ * sDDDot;

        currentJoints[key] = Math.abs(pos) < 1e-12 ? 0.0 : pos;
        currentVels[key] = Math.abs(vel) < 1e-12 ? 0.0 : vel;
        currentAccs[key] = Math.abs(acc) < 1e-12 ? 0.0 : acc;
        currentJerks[key] = Math.abs(jerk) < 1e-12 ? 0.0 : jerk;
      }

      const fk = ArmKinematics.computeForwardKinematics(side, currentJoints);

      waypoints.push({
        timestampSeconds: Number(t.toFixed(3)),
        jointAngles: currentJoints,
        jointVelocities: currentVels,
        jointAccelerations: currentAccs,
        jointJerks: currentJerks,
        endEffectorPose: fk.endEffectorPose,
      });
    }

    return waypoints;
  }
}

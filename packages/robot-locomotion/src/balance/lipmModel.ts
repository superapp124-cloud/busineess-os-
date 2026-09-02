/**
 * CHATR Linear Inverted Pendulum Model (LIPM)
 * 3D LIPM formulation for real-time biped balance dynamics.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';

export class LIPMModel {
  public readonly gravity = 9.81;
  public nominalComHeightZ: number;
  public omega0: number; // Natural pendulum frequency sqrt(g / zc)

  constructor(nominalComHeightZ = 0.88) {
    this.nominalComHeightZ = nominalComHeightZ;
    this.omega0 = Math.sqrt(this.gravity / this.nominalComHeightZ);
  }

  /**
   * Computes Instantaneous Zero Moment Point (ZMP):
   * p_zmp = p_com - (z_c / g) * a_com
   */
  public computeZmp(comPos: Vector3, comAccel: Vector3): Vector3 {
    const factor = this.nominalComHeightZ / this.gravity;
    const zmpX = comPos.x - factor * comAccel.x;
    const zmpY = comPos.y - factor * comAccel.y;
    return new Vector3(zmpX, zmpY, 0.0);
  }

  /**
   * Computes Capture Point (Divergent Component of Motion):
   * xi = p_com + v_com / omega_0
   */
  public computeCapturePoint(comPos: Vector3, comVel: Vector3): Vector3 {
    const cpX = comPos.x + comVel.x / this.omega0;
    const cpY = comPos.y + comVel.y / this.omega0;
    return new Vector3(cpX, cpY, 0.0);
  }

  /**
   * Predicts CoM state after time dt under constant ZMP:
   * x(t) = (x0 - p)*cosh(w*t) + (v0/w)*sinh(w*t) + p
   * v(t) = (x0 - p)*w*sinh(w*t) + v0*cosh(w*t)
   */
  public predictComState(
    comPos: number,
    comVel: number,
    zmpTarget: number,
    dt: number
  ): { pos: number; vel: number; accel: number } {
    const w = this.omega0;
    const cosh_wt = Math.cosh(w * dt);
    const sinh_wt = Math.sinh(w * dt);

    const pos = (comPos - zmpTarget) * cosh_wt + (comVel / w) * sinh_wt + zmpTarget;
    const vel = (comPos - zmpTarget) * w * sinh_wt + comVel * cosh_wt;
    const accel = (w * w) * (pos - zmpTarget);

    return { pos, vel, accel };
  }
}

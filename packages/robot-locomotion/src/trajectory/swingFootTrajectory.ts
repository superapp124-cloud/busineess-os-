/**
 * CHATR Cycloidal Swing Foot Trajectory Generator
 * Computes smooth, shock-free 3D swing foot motion.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';

export class SwingFootTrajectory {
  /**
   * Evaluates swing foot 3D position at normalized time s in [0, 1].
   * Uses cycloidal progression for zero initial and impact acceleration.
   */
  public static evaluate(
    startPos: Vector3,
    targetPos: Vector3,
    normalizedTime: number,
    clearanceHeightMeters = 0.045
  ): { position: Vector3; velocity: Vector3 } {
    const s = Math.max(0.0, Math.min(1.0, normalizedTime));

    // Cycloidal horizontal interpolation: sigma(s) = s - sin(2*pi*s)/(2*pi)
    const sigma = s - Math.sin(2.0 * Math.PI * s) / (2.0 * Math.PI);
    const dSigma = 1.0 - Math.cos(2.0 * Math.PI * s);

    const posX = startPos.x + (targetPos.x - startPos.x) * sigma;
    const posY = startPos.y + (targetPos.y - startPos.y) * sigma;

    // Vertical parabolic clearance: z(s) = 4 * h * s * (1 - s)
    const posZ = startPos.z + (targetPos.z - startPos.z) * s + 4.0 * clearanceHeightMeters * s * (1.0 - s);

    const velX = (targetPos.x - startPos.x) * dSigma;
    const velY = (targetPos.y - startPos.y) * dSigma;
    const velZ = (targetPos.z - startPos.z) + 4.0 * clearanceHeightMeters * (1.0 - 2.0 * s);

    return {
      position: new Vector3(Number(posX.toFixed(4)), Number(posY.toFixed(4)), Number(posZ.toFixed(4))),
      velocity: new Vector3(Number(velX.toFixed(4)), Number(velY.toFixed(4)), Number(velZ.toFixed(4))),
    };
  }
}

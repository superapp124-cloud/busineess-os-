/**
 * CHATR Zero Moment Point (ZMP) Preview Controller & Support Polygon Evaluator
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { SupportPolygon, StancePhase } from '../types';

export class ZMPController {
  // Foot dimensions (Meters)
  public static readonly FOOT_LENGTH = 0.24; // 24 cm length
  public static readonly FOOT_WIDTH = 0.12;  // 12 cm width

  /**
   * Computes the support polygon convex hull for double or single support and calculates exact stability margin.
   */
  public static computeSupportPolygon(
    leftFootPos: Vector3,
    rightFootPos: Vector3,
    phase: StancePhase,
    zmp: Vector3
  ): SupportPolygon {
    const halfL = this.FOOT_LENGTH * 0.5; // 0.12m
    const halfW = this.FOOT_WIDTH * 0.5;  // 0.06m

    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    let vertices: Vector3[] = [];

    if (phase === 'DOUBLE_SUPPORT' || phase === 'WEIGHT_SHIFT_LEFT' || phase === 'WEIGHT_SHIFT_RIGHT') {
      minX = Math.min(leftFootPos.x - halfL, rightFootPos.x - halfL);
      maxX = Math.max(leftFootPos.x + halfL, rightFootPos.x + halfL);
      minY = Math.min(leftFootPos.y - halfW, rightFootPos.y - halfW);
      maxY = Math.max(leftFootPos.y + halfW, rightFootPos.y + halfW);

      vertices = [
        new Vector3(maxX, maxY, 0),
        new Vector3(minX, maxY, 0),
        new Vector3(minX, minY, 0),
        new Vector3(maxX, minY, 0),
      ];
    } else if (phase === 'LEFT_SINGLE_SUPPORT') {
      minX = leftFootPos.x - halfL;
      maxX = leftFootPos.x + halfL;
      minY = leftFootPos.y - halfW;
      maxY = leftFootPos.y + halfW;

      vertices = [
        new Vector3(maxX, maxY, 0),
        new Vector3(minX, maxY, 0),
        new Vector3(minX, minY, 0),
        new Vector3(maxX, minY, 0),
      ];
    } else {
      // RIGHT_SINGLE_SUPPORT
      minX = rightFootPos.x - halfL;
      maxX = rightFootPos.x + halfL;
      minY = rightFootPos.y - halfW;
      maxY = rightFootPos.y + halfW;

      vertices = [
        new Vector3(maxX, maxY, 0),
        new Vector3(minX, maxY, 0),
        new Vector3(minX, minY, 0),
        new Vector3(maxX, minY, 0),
      ];
    }

    const center = new Vector3((minX + maxX) * 0.5, (minY + maxY) * 0.5, 0);

    // Minimum signed margin to boundary
    const marginX = Math.min(zmp.x - minX, maxX - zmp.x);
    const marginY = Math.min(zmp.y - minY, maxY - zmp.y);
    const minMargin = Math.min(marginX, marginY);

    return {
      vertices,
      center,
      marginMeters: Number(minMargin.toFixed(4)),
      isZmpInside: minMargin >= 0.0,
    };
  }
}

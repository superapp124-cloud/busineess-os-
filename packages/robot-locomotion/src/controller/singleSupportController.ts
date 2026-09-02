/**
 * CHATR Locomotion — Single Support Transition Controller (G4.4)
 * Manages load transfer and stability during single-leg support phases.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { ZMPController } from '../balance/zmpController';
import { StancePhase, SupportPolygon } from '../types';

export interface SingleSupportState {
  supportFoot: 'LEFT' | 'RIGHT';
  unloadedFoot: 'LEFT' | 'RIGHT';
  supportFootLoadN: number;
  unloadedFootLoadN: number;
  comLateralPositionMeters: number;
  supportPolygon: SupportPolygon;
  isStanceLegStable: boolean;
}

export class SingleSupportController {
  /**
   * Evaluates single support stability with 100% robot weight transferred to the stance foot.
   */
  public static evaluateSingleSupport(
    supportFoot: 'LEFT' | 'RIGHT',
    robotMassKg = 68.0
  ): SingleSupportState {
    const totalWeightN = robotMassKg * 9.81; // ~667.08 N

    const isLeftSupport = supportFoot === 'LEFT';
    const lateralTargetY = isLeftSupport ? 0.14 : -0.14; // Exactly above stance foot sole

    const leftFootPos = new Vector3(0, 0.14, 0);
    const rightFootPos = new Vector3(0, -0.14, 0);

    const phase: StancePhase = isLeftSupport ? 'LEFT_SINGLE_SUPPORT' : 'RIGHT_SINGLE_SUPPORT';
    const zmp = new Vector3(0, lateralTargetY, 0);

    const poly = ZMPController.computeSupportPolygon(leftFootPos, rightFootPos, phase, zmp);

    return {
      supportFoot,
      unloadedFoot: isLeftSupport ? 'RIGHT' : 'LEFT',
      supportFootLoadN: Number(totalWeightN.toFixed(2)),
      unloadedFootLoadN: 0.0,
      comLateralPositionMeters: lateralTargetY,
      supportPolygon: poly,
      isStanceLegStable: poly.isZmpInside && poly.marginMeters > 0.02,
    };
  }
}

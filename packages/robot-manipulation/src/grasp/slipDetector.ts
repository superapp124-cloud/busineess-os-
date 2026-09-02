/**
 * CHATR Dynamic Slip & Bounded Adaptive Force Controller (G6.8 & G6.1-R)
 * Evaluates Coulomb contact friction utilization and manages adaptive force recovery
 * without exceeding material fragility or actuator crushing limits.
 */

import { SlipStatus, MaterialFragilityClass, AdaptiveForceResult } from '../types';

export class SlipDetector {
  public static readonly COEFFICIENT_OF_FRICTION = 0.65;
  public static readonly GRAVITY = 9.81;
  public static readonly ACTUATOR_MAX_FORCE_N = 90.0;

  public static readonly FRAGILITY_LIMITS: Record<MaterialFragilityClass, number> = {
    FRAGILE_GLASS_CERAMIC: 35.0,
    DEFORMABLE_FOAM_PLASTIC: 20.0,
    RIGID_METAL_WOOD: 80.0,
  };

  /**
   * Evaluates slip condition given normal grip force, object mass, and vertical acceleration.
   */
  public static evaluateSlip(
    normalGripForceN: number,
    objectMassKg: number,
    verticalAccelMps2 = 0.0,
    measuredRelativeSlipVelocityMps = 0.0
  ): {
    slipStatus: SlipStatus;
    tangentialForceN: number;
    maxFrictionForceN: number;
    frictionUtilizationRatio: number;
    isSlipDetected: boolean;
  } {
    if (normalGripForceN < 1.0 && objectMassKg > 0.05) {
      return {
        slipStatus: 'DROPPED_OBJECT',
        tangentialForceN: objectMassKg * (this.GRAVITY + verticalAccelMps2),
        maxFrictionForceN: 0.0,
        frictionUtilizationRatio: Infinity,
        isSlipDetected: true,
      };
    }

    const tangentialForce = objectMassKg * Math.max(0, this.GRAVITY + verticalAccelMps2);
    const maxFrictionForce = this.COEFFICIENT_OF_FRICTION * normalGripForceN;
    const utilization = tangentialForce / Math.max(1e-4, maxFrictionForce);

    let slipStatus: SlipStatus = 'SECURE_GRASP';
    let isSlip = false;

    if (measuredRelativeSlipVelocityMps > 0.01 || utilization > 1.0) {
      slipStatus = 'SLIDING_GRASP';
      isSlip = true;
    } else if (utilization > 0.70) {
      slipStatus = 'WEAK_GRASP';
    }

    return {
      slipStatus,
      tangentialForceN: Number(tangentialForce.toFixed(2)),
      maxFrictionForceN: Number(maxFrictionForce.toFixed(2)),
      frictionUtilizationRatio: Number(utilization.toFixed(3)),
      isSlipDetected: isSlip,
    };
  }

  public static computeAdaptiveForceIncrement(
    currentForceN: number,
    fragilityClass: MaterialFragilityClass,
    measuredSlipVelocityMps = 0.02
  ): AdaptiveForceResult {
    const maxSafeForce = Math.min(this.ACTUATOR_MAX_FORCE_N, this.FRAGILITY_LIMITS[fragilityClass]);

    if (currentForceN >= maxSafeForce) {
      return {
        nextCommencedForceN: currentForceN,
        isForceSafe: false,
        slipStatus: 'SLIDING_GRASP',
        actionTaken: 'ABORT_TO_PREVENT_CRUSH',
        reason: `Current force (${currentForceN.toFixed(1)}N) reached material fragility threshold (${maxSafeForce.toFixed(1)}N). Aborting squeeze to prevent breakage.`,
      };
    }

    const rawIncrement = Math.min(8.0, Math.max(2.0, measuredSlipVelocityMps * 250.0 + 3.0));
    const targetForce = currentForceN + rawIncrement;

    if (targetForce > maxSafeForce) {
      return {
        nextCommencedForceN: maxSafeForce,
        isForceSafe: true,
        slipStatus: 'WEAK_GRASP',
        actionTaken: 'CAPPED_AT_FRAGILITY_LIMIT',
        reason: `Target force capped at ${maxSafeForce.toFixed(1)}N to honor ${fragilityClass} safety ceiling.`,
      };
    }

    return {
      nextCommencedForceN: Number(targetForce.toFixed(2)),
      isForceSafe: true,
      slipStatus: 'SECURE_GRASP',
      actionTaken: 'APPLIED_INCREMENT',
      reason: `Applied adaptive dynamic increment (+${rawIncrement.toFixed(1)}N) within material safety limits.`,
    };
  }
}

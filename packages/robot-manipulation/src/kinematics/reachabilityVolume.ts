/**
 * CHATR 3D Reachability Volume & Workspace Classifier (G6.3)
 * Classifies 3D workspace targets into REACHABLE_WITH_MARGIN, REACHABLE, MARGINAL, or UNREACHABLE.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { ArmSide, ReachabilityClass } from '../types';
import { ArmKinematics } from './armKinematics';

export class ReachabilityVolume {
  public static readonly MAX_ARM_EXTENSION_METERS = 0.76; // Upper arm (0.32) + Forearm (0.28) + Hand (0.16)
  public static readonly OPTIMAL_DEXTERITY_RADIUS_METERS = 0.68; // 68 cm optimal dexterity zone

  /**
   * Classifies reachability for a given arm and target world coordinate.
   */
  public static evaluateReachability(
    side: ArmSide,
    targetWorld: Vector3,
    torsoPoseWorld = { position: new Vector3(0, 0, 0.95) }
  ): { reachability: ReachabilityClass; distanceToShoulderMeters: number; reason: string } {
    const ySign = side === 'LEFT' ? 1.0 : -1.0;
    const shoulderWorld = new Vector3(
      torsoPoseWorld.position.x,
      torsoPoseWorld.position.y + ySign * ArmKinematics.SHOULDER_OFFSET_Y,
      torsoPoseWorld.position.z + ArmKinematics.SHOULDER_OFFSET_Z
    );

    const distToShoulder = shoulderWorld.distanceTo(targetWorld);

    // 1. Behind torso check
    if (targetWorld.x < torsoPoseWorld.position.x - 0.15) {
      return {
        reachability: 'UNREACHABLE',
        distanceToShoulderMeters: Number(distToShoulder.toFixed(3)),
        reason: 'Target is behind torso back plane.',
      };
    }

    // 2. Below minimum floor clearance / above maximum ceiling
    if (targetWorld.z < 0.20 || targetWorld.z > 1.85) {
      return {
        reachability: 'UNREACHABLE',
        distanceToShoulderMeters: Number(distToShoulder.toFixed(3)),
        reason: 'Target is outside vertical manipulation clearance (0.20m to 1.85m).',
      };
    }

    // 3. Distance envelope
    if (distToShoulder > ReachabilityVolume.MAX_ARM_EXTENSION_METERS + 0.05) {
      return {
        reachability: 'UNREACHABLE',
        distanceToShoulderMeters: Number(distToShoulder.toFixed(3)),
        reason: `Target distance (${distToShoulder.toFixed(2)}m) exceeds maximum kinematic reach (0.76m).`,
      };
    }

    if (distToShoulder > ReachabilityVolume.MAX_ARM_EXTENSION_METERS - 0.03) {
      return {
        reachability: 'MARGINAL',
        distanceToShoulderMeters: Number(distToShoulder.toFixed(3)),
        reason: 'Target is near boundary of arm extension (singularity zone).',
      };
    }

    if (distToShoulder <= ReachabilityVolume.OPTIMAL_DEXTERITY_RADIUS_METERS && distToShoulder >= 0.20) {
      return {
        reachability: 'REACHABLE_WITH_MARGIN',
        distanceToShoulderMeters: Number(distToShoulder.toFixed(3)),
        reason: 'Target is well within dexterous manipulation workspace.',
      };
    }

    return {
      reachability: 'REACHABLE',
      distanceToShoulderMeters: Number(distToShoulder.toFixed(3)),
      reason: 'Target is kinematically reachable.',
    };
  }
}

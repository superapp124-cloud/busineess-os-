/**
 * CHATR Spatial Entity & Deictic Reference Grounder (Gate 7)
 * Resolves spatial references ("kitchen se", "table pe") and ambiguous deictic terms ("woh wali")
 * against the live Temporal World Model belief state.
 */

import { ObjectPose6D, PerceptionWorldModelSnapshot } from '../../../robot-perception/src/types';
import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { StructuredRobotTask } from '../types';

export class SpatialGrounder {
  public static groundTask(
    task: StructuredRobotTask,
    worldModelSnapshot: PerceptionWorldModelSnapshot,
    robotPositionWorld = new Vector3(0, 0, 0)
  ): {
    isGrounded: boolean;
    groundedObject?: ObjectPose6D;
    resolvedLocation?: string;
    reason: string;
  } {
    const candidates: ObjectPose6D[] = worldModelSnapshot.detectedObjects.filter(
      (obj: ObjectPose6D) => task.targetCategory === 'unknown' || obj.category === task.targetCategory
    );

    if (candidates.length === 0) {
      return {
        isGrounded: false,
        reason: `No object of category '${task.targetCategory}' found in active world model.`,
      };
    }

    if (task.isAmbiguousReference || candidates.length > 1) {
      candidates.sort((a: ObjectPose6D, b: ObjectPose6D) => {
        const distA = a.positionWorld.distanceTo(robotPositionWorld);
        const distB = b.positionWorld.distanceTo(robotPositionWorld);
        return distA - distB;
      });

      const selected = candidates[0];
      return {
        isGrounded: true,
        groundedObject: selected,
        resolvedLocation: selected.supportedBySurfaceId ?? task.sourceLocation,
        reason: `Disambiguated deictic reference to closest entity '${selected.objectId}' at distance ${selected.positionWorld.distanceTo(robotPositionWorld).toFixed(2)}m.`,
      };
    }

    const selected = candidates[0];
    return {
      isGrounded: true,
      groundedObject: selected,
      resolvedLocation: selected.supportedBySurfaceId ?? task.sourceLocation,
      reason: `Successfully grounded '${task.targetCategory}' to entity '${selected.objectId}'.`,
    };
  }
}

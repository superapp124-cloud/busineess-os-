/**
 * CHATR Physics Engine — Collision Geometries & Contact Manifolds
 */

import { Vector3 } from '../math/vector3';
import { Quaternion } from '../math/quaternion';

export interface ContactPoint {
  worldPoint: Vector3;
  normal: Vector3; // Points from Body B to Body A
  penetrationDepth: number; // Positive if interpenetrating
}

export interface CollisionManifold {
  bodyAId: string;
  bodyBId: string;
  contacts: ContactPoint[];
}

export class CollisionGeometryHelper {
  /**
   * Generates corner / contact test vertices for a 3D box oriented in world space
   */
  public static getBoxWorldVertices(
    pos: Vector3,
    orient: Quaternion,
    halfExtents: Vector3
  ): Vector3[] {
    const localCorners = [
      new Vector3(-halfExtents.x, -halfExtents.y, -halfExtents.z),
      new Vector3( halfExtents.x, -halfExtents.y, -halfExtents.z),
      new Vector3( halfExtents.x,  halfExtents.y, -halfExtents.z),
      new Vector3(-halfExtents.x,  halfExtents.y, -halfExtents.z),
      new Vector3(-halfExtents.x, -halfExtents.y,  halfExtents.z),
      new Vector3( halfExtents.x, -halfExtents.y,  halfExtents.z),
      new Vector3( halfExtents.x,  halfExtents.y,  halfExtents.z),
      new Vector3(-halfExtents.x,  halfExtents.y,  halfExtents.z),
    ];

    return localCorners.map((corner) => {
      const rotated = orient.rotateVector(corner);
      return rotated.add(pos);
    });
  }
}

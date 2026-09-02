/**
 * CHATR Physics Engine — Collision Detector
 * Narrowphase collision tests for ground planes, boxes, spheres, and capsules.
 */

import { RigidBody } from '../dynamics/rigidBody';
import { Vector3 } from '../math/vector3';
import { CollisionManifold, ContactPoint, CollisionGeometryHelper } from './collisionShapes';

export class CollisionDetector {
  /**
   * Tests collision between a dynamic RigidBody and the flat ground plane at Z = groundZ (default 0.0)
   */
  public static testGroundPlane(body: RigidBody, groundZ = 0.0): CollisionManifold | null {
    if (!body.collision || body.isStatic) return null;

    const contacts: ContactPoint[] = [];
    const shape = body.collision;
    const upNormal = new Vector3(0, 0, 1);

    const worldOffset = body.orientation.rotateVector(shape.offset.clone());
    const shapeCenter = body.position.clone().add(worldOffset);

    switch (shape.type) {
      case 'sphere': {
        const radius = shape.dimensions.radius ?? 0.1;
        const lowestZ = shapeCenter.z - radius;
        if (lowestZ < groundZ) {
          const penetration = groundZ - lowestZ;
          contacts.push({
            worldPoint: new Vector3(shapeCenter.x, shapeCenter.y, groundZ),
            normal: upNormal.clone(),
            penetrationDepth: penetration,
          });
        }
        break;
      }

      case 'box': {
        const halfX = (shape.dimensions.length ?? 0.2) * 0.5;
        const halfY = (shape.dimensions.width ?? 0.2) * 0.5;
        const halfZ = (shape.dimensions.height ?? 0.2) * 0.5;
        const halfExtents = new Vector3(halfX, halfY, halfZ);

        const vertices = CollisionGeometryHelper.getBoxWorldVertices(
          shapeCenter,
          body.orientation,
          halfExtents
        );

        for (const v of vertices) {
          if (v.z < groundZ) {
            contacts.push({
              worldPoint: v.clone(),
              normal: upNormal.clone(),
              penetrationDepth: groundZ - v.z,
            });
          }
        }
        break;
      }

      case 'capsule':
      case 'cylinder': {
        const radius = shape.dimensions.radius ?? 0.05;
        const halfH = (shape.dimensions.height ?? 0.3) * 0.5;

        // Two end centers
        const p1Local = new Vector3(0, 0, halfH);
        const p2Local = new Vector3(0, 0, -halfH);

        const p1 = shapeCenter.clone().add(body.orientation.rotateVector(p1Local));
        const p2 = shapeCenter.clone().add(body.orientation.rotateVector(p2Local));

        if (p1.z - radius < groundZ) {
          contacts.push({
            worldPoint: new Vector3(p1.x, p1.y, p1.z - radius),
            normal: upNormal.clone(),
            penetrationDepth: groundZ - (p1.z - radius),
          });
        }
        if (p2.z - radius < groundZ) {
          contacts.push({
            worldPoint: new Vector3(p2.x, p2.y, p2.z - radius),
            normal: upNormal.clone(),
            penetrationDepth: groundZ - (p2.z - radius),
          });
        }
        break;
      }

      case 'plane':
        // Plane does not collide with plane
        break;
    }

    if (contacts.length === 0) return null;

    return {
      bodyAId: body.id,
      bodyBId: 'GROUND_PLANE',
      contacts,
    };
  }

  /**
   * Tests bounding sphere-based broadphase / narrowphase between two rigid bodies.
   */
  public static testBodyBody(bodyA: RigidBody, bodyB: RigidBody): CollisionManifold | null {
    if (!bodyA.collision || !bodyB.collision) return null;
    if (bodyA.isStatic && bodyB.isStatic) return null;

    // Approximate bounding sphere radius from shape dimensions
    const radA = (bodyA.collision.dimensions.length || bodyA.collision.dimensions.radius || 0.15);
    const radB = (bodyB.collision.dimensions.length || bodyB.collision.dimensions.radius || 0.15);

    const dist = bodyA.position.distanceTo(bodyB.position);
    if (dist < radA + radB) {
      const penetration = radA + radB - dist;
      const normal = bodyA.position.clone().sub(bodyB.position).normalize();
      if (normal.lengthSquared() < 1e-6) {
        normal.set(0, 0, 1);
      }

      const midPoint = bodyA.position.clone().add(bodyB.position).scale(0.5);

      return {
        bodyAId: bodyA.id,
        bodyBId: bodyB.id,
        contacts: [
          {
            worldPoint: midPoint,
            normal,
            penetrationDepth: penetration,
          },
        ],
      };
    }

    return null;
  }
}

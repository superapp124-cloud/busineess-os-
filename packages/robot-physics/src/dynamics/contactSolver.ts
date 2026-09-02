/**
 * CHATR Physics Engine — Contact & Collision Impulse Solver
 * Implements normal reaction forces, Baumgarte stabilization, and Coulomb friction.
 */

import { RigidBody } from './rigidBody';
import { CollisionManifold } from '../geometry/collisionShapes';
import { Vector3 } from '../math/vector3';

export class ContactSolver {
  private static BAUMGARTE_BETA = 0.25; // Penetration recovery fraction per timestep
  private static SLOP = 0.001;          // 1 mm penetration tolerance before applying positional bias
  private static FRICTION_COEFF = 0.65; // Coulomb friction coefficient (Rubber on floor)
  private static RESTITUTION = 0.0;     // Inelastic collision for robot feet (zero bounce)

  /**
   * Solves collision impulses across all detected manifolds.
   */
  public static solveVelocities(
    manifolds: CollisionManifold[],
    bodyMap: Map<string, RigidBody>,
    dt: number,
    iterations = 8
  ): void {
    for (let iter = 0; iter < iterations; iter++) {
      for (const manifold of manifolds) {
        const bodyA = bodyMap.get(manifold.bodyAId);
        if (!bodyA) continue;

        const bodyB = manifold.bodyBId === 'GROUND_PLANE' ? null : bodyMap.get(manifold.bodyBId);

        for (const contact of manifold.contacts) {
          const p = contact.worldPoint;
          const n = contact.normal; // Normal pointing from B to A

          // Relative contact point from body centers
          const rA = p.clone().sub(bodyA.position);
          const rB = bodyB ? p.clone().sub(bodyB.position) : new Vector3(0, 0, 0);

          // Relative velocity at contact point: v_rel = v_A(p) - v_B(p)
          const vA = bodyA.getVelocityAtWorldPoint(p);
          const vB = bodyB ? bodyB.getVelocityAtWorldPoint(p) : new Vector3(0, 0, 0);
          const vRel = vA.sub(vB);

          const normalVelocity = vRel.dot(n);

          // If bodies are separating, no normal impulse required
          const bias = (this.BAUMGARTE_BETA / dt) * Math.max(0, contact.penetrationDepth - this.SLOP);
          const targetVelocity = -this.RESTITUTION * normalVelocity + bias;

          // Effective mass computation along normal:
          // K = 1/mA + 1/mB + (rA x n)^T * I_A^-1 * (rA x n) + (rB x n)^T * I_B^-1 * (rB x n)
          const rA_cross_n = rA.cross(n);
          const rB_cross_n = rB.cross(n);

          const angularTermA = bodyA.isStatic ? 0 : rA_cross_n.dot(bodyA.invWorldInertia.multiplyVector(rA_cross_n));
          const angularTermB = !bodyB || bodyB.isStatic ? 0 : rB_cross_n.dot(bodyB.invWorldInertia.multiplyVector(rB_cross_n));

          const effectiveMass = (bodyA.invMass + (bodyB ? bodyB.invMass : 0)) + angularTermA + angularTermB;
          if (effectiveMass <= 1e-12) continue;

          // Compute normal impulse delta: lambda_N
          const deltaV = targetVelocity - normalVelocity;
          const impulseMag = deltaV / effectiveMass;
          const normalImpulseMag = Math.max(0, impulseMag); // Normal impulse must be non-negative (push only)

          const normalImpulse = n.clone().scale(normalImpulseMag);

          // Apply normal impulse
          bodyA.velocity.addScaled(normalImpulse, bodyA.invMass);
          if (!bodyA.isStatic) {
            const rotImpulse = rA.cross(normalImpulse);
            bodyA.angularVelocity.add(bodyA.invWorldInertia.multiplyVector(rotImpulse));
          }

          if (bodyB && !bodyB.isStatic) {
            bodyB.velocity.addScaled(normalImpulse, -bodyB.invMass);
            const rotImpulseB = rB.cross(normalImpulse);
            bodyB.angularVelocity.sub(bodyB.invWorldInertia.multiplyVector(rotImpulseB));
          }

          // ------------------------------------------------------------
          // Coulomb Friction Impulse Solver
          // ------------------------------------------------------------
          const updatedVA = bodyA.getVelocityAtWorldPoint(p);
          const updatedVB = bodyB ? bodyB.getVelocityAtWorldPoint(p) : new Vector3(0, 0, 0);
          const updatedVRel = updatedVA.sub(updatedVB);

          // Tangential velocity: v_t = v_rel - (v_rel . n) * n
          const vNormalComponent = n.clone().scale(updatedVRel.dot(n));
          const tangentVelocity = updatedVRel.sub(vNormalComponent);
          const tangentSpeed = tangentVelocity.length();

          if (tangentSpeed > 1e-6) {
            const tangentDir = tangentVelocity.clone().normalize().scale(-1.0); // Opposes motion

            const rA_cross_t = rA.cross(tangentDir);
            const rB_cross_t = rB.cross(tangentDir);
            const tanAngularTermA = bodyA.isStatic ? 0 : rA_cross_t.dot(bodyA.invWorldInertia.multiplyVector(rA_cross_t));
            const tanAngularTermB = !bodyB || bodyB.isStatic ? 0 : rB_cross_t.dot(bodyB.invWorldInertia.multiplyVector(rB_cross_t));

            const tanEffectiveMass = (bodyA.invMass + (bodyB ? bodyB.invMass : 0)) + tanAngularTermA + tanAngularTermB;
            if (tanEffectiveMass > 1e-12) {
              const desiredFrictionImpulse = tangentSpeed / tanEffectiveMass;
              const maxFrictionImpulse = this.FRICTION_COEFF * normalImpulseMag;
              const actualFrictionImpulse = Math.min(desiredFrictionImpulse, maxFrictionImpulse);

              const frictionVector = tangentDir.clone().scale(actualFrictionImpulse);

              bodyA.velocity.addScaled(frictionVector, bodyA.invMass);
              if (!bodyA.isStatic) {
                const rotFriction = rA.cross(frictionVector);
                bodyA.angularVelocity.add(bodyA.invWorldInertia.multiplyVector(rotFriction));
              }

              if (bodyB && !bodyB.isStatic) {
                bodyB.velocity.addScaled(frictionVector, -bodyB.invMass);
                const rotFrictionB = rB.cross(frictionVector);
                bodyB.angularVelocity.sub(bodyB.invWorldInertia.multiplyVector(rotFrictionB));
              }
            }
          }
        }
      }
    }
  }
}

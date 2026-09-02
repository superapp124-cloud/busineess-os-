/**
 * CHATR Physics Engine — Numerical Integrator
 * Symplectic Semi-Implicit Euler integrator for stable rigid body mechanics.
 */

import { RigidBody } from './rigidBody';
import { Vector3 } from '../math/vector3';
import { Quaternion } from '../math/quaternion';

export class PhysicsIntegrator {
  /**
   * Integrates velocity from applied forces and gravity.
   * v_{t+dt} = v_t + (F/m + g) * dt
   * omega_{t+dt} = omega_t + I_world^-1 * (tau - omega x (I_world * omega)) * dt
   */
  public static integrateVelocities(
    bodies: RigidBody[],
    gravity: Vector3,
    dt: number,
    linearDamping = 0.005,
    angularDamping = 0.01
  ): void {
    for (const body of bodies) {
      if (body.isStatic) continue;

      // 1. Linear acceleration: a = F_ext / m + g
      const totalForce = body.force.clone();
      totalForce.addScaled(gravity, body.massKg); // F = F_ext + m*g

      const accel = totalForce.scale(body.invMass);
      body.velocity.addScaled(accel, dt);

      // Linear velocity damping
      body.velocity.scale(Math.max(0, 1.0 - linearDamping * dt));

      // 2. Angular acceleration: alpha = I^-1 * (tau - omega x (I * omega))
      const R = body.orientation.toRotationMatrix();
      const R_T = R.clone().transpose();
      const worldInertia = R.clone().multiply(body.localInertia).multiply(R_T);

      const I_omega = worldInertia.multiplyVector(body.angularVelocity);
      const gyroscopicTorque = body.angularVelocity.cross(I_omega);

      const netTorque = body.torque.clone().sub(gyroscopicTorque);
      const angularAccel = body.invWorldInertia.multiplyVector(netTorque);

      body.angularVelocity.addScaled(angularAccel, dt);

      // Angular velocity damping
      body.angularVelocity.scale(Math.max(0, 1.0 - angularDamping * dt));

      // Clear force accumulator for next step
      body.clearForces();
    }
  }

  /**
   * Integrates positions and orientations from updated velocities.
   * x_{t+dt} = x_t + v_{t+dt} * dt
   * q_{t+dt} = normalize(q_t + 0.5 * dt * (omega_quat * q_t))
   */
  public static integratePositions(bodies: RigidBody[], dt: number): void {
    for (const body of bodies) {
      if (body.isStatic) continue;

      // 1. Position integration
      body.position.addScaled(body.velocity, dt);

      // 2. Quaternion orientation integration
      // dq = 0.5 * omega * q
      const omega = body.angularVelocity;
      const omegaQuat = new Quaternion(0, omega.x, omega.y, omega.z);
      const deltaQ = omegaQuat.multiply(body.orientation);

      body.orientation.w += 0.5 * dt * deltaQ.w;
      body.orientation.x += 0.5 * dt * deltaQ.x;
      body.orientation.y += 0.5 * dt * deltaQ.y;
      body.orientation.z += 0.5 * dt * deltaQ.z;

      body.orientation.normalize();
      body.updateInertiaTensor();
    }
  }
}

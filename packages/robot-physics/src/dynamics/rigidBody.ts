/**
 * CHATR Physics Engine — RigidBody
 * 6-DOF 3D Rigid Body representation with spatial kinematics and dynamic properties.
 */

import { Vector3 } from '../math/vector3';
import { Matrix3 } from '../math/matrix3';
import { Quaternion } from '../math/quaternion';

export interface CollisionShape {
  type: 'plane' | 'box' | 'sphere' | 'capsule' | 'cylinder';
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    radius?: number;
  };
  offset: Vector3;
}

export interface RigidBodyConfig {
  id: string;
  name: string;
  massKg: number;
  localInertia: { ixx: number; iyy: number; izz: number; ixy?: number; ixz?: number; iyz?: number };
  position?: Vector3;
  orientation?: Quaternion;
  isStatic?: boolean;
  collision?: CollisionShape;
}

export class RigidBody {
  public id: string;
  public name: string;
  public isStatic: boolean;

  // Mass & Inertia Properties
  public massKg: number;
  public invMass: number;
  public localInertia: Matrix3;
  public invLocalInertia: Matrix3;
  public invWorldInertia: Matrix3;

  // Kinematic State
  public position: Vector3;
  public velocity: Vector3;
  public orientation: Quaternion;
  public angularVelocity: Vector3; // In world frame (rad/s)

  // Applied External Forces & Torques (Accumulated per timestep)
  public force: Vector3;
  public torque: Vector3;

  // Collision Shape
  public collision: CollisionShape | null;

  constructor(config: RigidBodyConfig) {
    this.id = config.id;
    this.name = config.name;
    this.isStatic = config.isStatic ?? false;

    this.massKg = this.isStatic ? Infinity : config.massKg;
    this.invMass = this.isStatic || config.massKg <= 0 ? 0.0 : 1.0 / config.massKg;

    this.localInertia = Matrix3.fromInertia(
      config.localInertia.ixx,
      config.localInertia.iyy,
      config.localInertia.izz,
      config.localInertia.ixy ?? 0,
      config.localInertia.ixz ?? 0,
      config.localInertia.iyz ?? 0
    );

    this.invLocalInertia = this.isStatic ? new Matrix3().set(0, 0, 0, 0, 0, 0, 0, 0, 0) : this.localInertia.clone().invert();
    this.invWorldInertia = new Matrix3();

    this.position = config.position ? config.position.clone() : new Vector3(0, 0, 0);
    this.velocity = new Vector3(0, 0, 0);
    this.orientation = config.orientation ? config.orientation.clone().normalize() : new Quaternion(1, 0, 0, 0);
    this.angularVelocity = new Vector3(0, 0, 0);

    this.force = new Vector3(0, 0, 0);
    this.torque = new Vector3(0, 0, 0);

    this.collision = config.collision ?? null;

    this.updateInertiaTensor();
  }

  /**
   * Updates world inverse inertia matrix: I_world^-1 = R * I_local^-1 * R^T
   */
  public updateInertiaTensor(): void {
    if (this.isStatic) {
      this.invWorldInertia.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      return;
    }

    const R = this.orientation.toRotationMatrix();
    const R_T = R.clone().transpose();

    const temp = R.clone().multiply(this.invLocalInertia);
    temp.multiply(R_T);
    this.invWorldInertia.elements.set(temp.elements);
  }

  public applyForce(force: Vector3): void {
    if (this.isStatic) return;
    this.force.add(force);
  }

  public applyTorque(torque: Vector3): void {
    if (this.isStatic) return;
    this.torque.add(torque);
  }

  public applyForceAtPoint(force: Vector3, worldPoint: Vector3): void {
    if (this.isStatic) return;
    this.force.add(force);

    const r = worldPoint.clone().sub(this.position);
    const inducedTorque = r.cross(force);
    this.torque.add(inducedTorque);
  }

  public clearForces(): void {
    this.force.set(0, 0, 0);
    this.torque.set(0, 0, 0);
  }

  public getVelocityAtWorldPoint(worldPoint: Vector3, target = new Vector3()): Vector3 {
    if (this.isStatic) {
      target.set(0, 0, 0);
      return target;
    }
    const r = worldPoint.clone().sub(this.position);
    const tangentialVel = this.angularVelocity.cross(r);
    target.copy(this.velocity).add(tangentialVel);
    return target;
  }

  public getKineticEnergy(): number {
    if (this.isStatic) return 0;
    const linearKE = 0.5 * this.massKg * this.velocity.lengthSquared();

    const R = this.orientation.toRotationMatrix();
    const R_T = R.clone().transpose();
    const worldInertia = R.clone().multiply(this.localInertia).multiply(R_T);
    const I_omega = worldInertia.multiplyVector(this.angularVelocity);
    const rotationalKE = 0.5 * this.angularVelocity.dot(I_omega);

    return linearKE + rotationalKE;
  }
}

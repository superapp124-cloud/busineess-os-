/**
 * CHATR Physics Engine — Revolute Joint Constraint
 * Constrains relative translation between parent and child links while permitting 1-DOF rotation.
 */

import { RigidBody } from '../dynamics/rigidBody';
import { Vector3 } from '../math/vector3';
import { Quaternion } from '../math/quaternion';

export interface JointConstraintConfig {
  id: string;
  name: string;
  parentBody: RigidBody;
  childBody: RigidBody;
  parentAnchor: Vector3;  // In parent local frame
  childAnchor: Vector3;   // In child local frame
  rotationAxis: Vector3;  // In child local frame (normalized)
  minAngleRad: number;
  maxAngleRad: number;
  maxTorqueNm: number;
}

export class RevoluteJointConstraint {
  public id: string;
  public name: string;
  public parent: RigidBody;
  public child: RigidBody;
  public parentAnchor: Vector3;
  public childAnchor: Vector3;
  public rotationAxis: Vector3;
  public minAngleRad: number;
  public maxAngleRad: number;
  public maxTorqueNm: number;

  // Active joint state
  public currentAngleRad = 0.0;
  public currentVelocityRadPerSec = 0.0;
  public appliedMotorTorqueNm = 0.0;

  constructor(config: JointConstraintConfig) {
    this.id = config.id;
    this.name = config.name;
    this.parent = config.parentBody;
    this.child = config.childBody;
    this.parentAnchor = config.parentAnchor.clone();
    this.childAnchor = config.childAnchor.clone();
    this.rotationAxis = config.rotationAxis.clone().normalize();
    this.minAngleRad = config.minAngleRad;
    this.maxAngleRad = config.maxAngleRad;
    this.maxTorqueNm = config.maxTorqueNm;
  }

  /**
   * Enforces 3-DOF positional constraint holding joint anchor points coincident:
   * p_world(parent) = p_world(child)
   */
  public solvePositionConstraint(dt: number, baumgarte = 0.3): void {
    const parentAnchorWorld = this.parent.position.clone().add(
      this.parent.orientation.rotateVector(this.parentAnchor.clone())
    );
    const childAnchorWorld = this.child.position.clone().add(
      this.child.orientation.rotateVector(this.childAnchor.clone())
    );

    // Positional error vector
    const error = parentAnchorWorld.sub(childAnchorWorld);
    const errorMag = error.length();

    if (errorMag > 1e-5) {
      const correction = error.scale(baumgarte);
      const totalInvMass = this.parent.invMass + this.child.invMass;
      if (totalInvMass > 1e-12) {
        if (!this.parent.isStatic) {
          this.parent.position.addScaled(correction, -this.parent.invMass / totalInvMass);
        }
        if (!this.child.isStatic) {
          this.child.position.addScaled(correction, this.child.invMass / totalInvMass);
        }
      }
    }
  }

  /**
   * Applies motor actuation torque along the joint axis.
   */
  public applyActuatorTorque(torqueNm: number): void {
    const clampedTorque = Math.max(-this.maxTorqueNm, Math.min(this.maxTorqueNm, torqueNm));
    this.appliedMotorTorqueNm = clampedTorque;

    // Joint axis in world frame
    const axisWorld = this.child.orientation.rotateVector(this.rotationAxis.clone());
    const torqueVector = axisWorld.scale(clampedTorque);

    // Action and reaction
    this.child.applyTorque(torqueVector);
    this.parent.applyTorque(torqueVector.scale(-1.0));
  }

  /**
   * Clamps joint angle within mechanical limits [minAngle, maxAngle].
   */
  public enforceLimits(): void {
    if (this.currentAngleRad > this.maxAngleRad) {
      this.currentAngleRad = this.maxAngleRad;
      this.currentVelocityRadPerSec = Math.min(0, this.currentVelocityRadPerSec);
    } else if (this.currentAngleRad < this.minAngleRad) {
      this.currentAngleRad = this.minAngleRad;
      this.currentVelocityRadPerSec = Math.max(0, this.currentVelocityRadPerSec);
    }
  }
}

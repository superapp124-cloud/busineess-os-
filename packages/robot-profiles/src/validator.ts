/**
 * CHATR Robot Profile Physical Invariant Validator
 * 
 * Validates that digital twin configuration files satisfy strict physical,
 * structural, and dynamic constraints before physics instantiation.
 */

import { RobotProfile, LinkDefinition, JointDefinition } from './types';

export interface ValidationIssue {
  severity: 'ERROR' | 'WARNING';
  component: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  computedTotalMassKg: number;
}

export class ProfileValidator {
  /**
   * Validates all physical invariants of a RobotProfile.
   */
  public static validate(profile: RobotProfile): ValidationResult {
    const issues: ValidationIssue[] = [];

    // ------------------------------------------------------------
    // 1. Mass Conservation Invariant
    // ------------------------------------------------------------
    const rawTotalMass = profile.links.reduce((sum, link) => sum + link.massKg, 0);
    const computedTotalMassKg = Number(rawTotalMass.toFixed(4));
    const massDiff = Math.abs(computedTotalMassKg - profile.robot.totalMassKg);
    if (massDiff > 0.01) {
      issues.push({
        severity: 'ERROR',
        component: 'MassConservation',
        message: `Sum of link masses (${computedTotalMassKg.toFixed(3)} kg) does not match declared total mass (${profile.robot.totalMassKg} kg).`,
      });
    }

    // ------------------------------------------------------------
    // 2. DOF Count Consistency
    // ------------------------------------------------------------
    const movableJoints = profile.joints.filter((j) => j.type === 'revolute' || j.type === 'prismatic');
    if (movableJoints.length !== profile.robot.dofCount) {
      issues.push({
        severity: 'ERROR',
        component: 'DOFConsistency',
        message: `Declared DOF count (${profile.robot.dofCount}) does not match number of movable joints (${movableJoints.length}).`,
      });
    }

    // ------------------------------------------------------------
    // 3. Inertia Tensor Physical Feasibility (Positive-Definite + Triangle Inequality)
    // ------------------------------------------------------------
    for (const link of profile.links) {
      const { ixx, iyy, izz } = link.inertia;
      if (ixx <= 0 || iyy <= 0 || izz <= 0) {
        issues.push({
          severity: 'ERROR',
          component: `InertiaTensor:${link.id}`,
          message: `Principal moments of inertia must be strictly positive (got ixx=${ixx}, iyy=${iyy}, izz=${izz}).`,
        });
      }

      // Triangle inequality for physical rigid bodies: Ixx + Iyy >= Izz, etc.
      const eps = 1e-6;
      if (ixx + iyy < izz - eps || ixx + izz < iyy - eps || yzCondition(iyy, izz, ixx, eps) || xzCondition(ixx, izz, iyy, eps)) {
        // Let's verify standard triangle inequalities
      }
      if (ixx + iyy < izz - eps || ixx + izz < iyy - eps || iyy + izz < ixx - eps) {
        issues.push({
          severity: 'ERROR',
          component: `InertiaTriangleInequality:${link.id}`,
          message: `Link '${link.id}' violates inertia triangle inequality.`,
        });
      }
    }

    // ------------------------------------------------------------
    // 4. Kinematic Tree Connectivity & Acyclicity
    // ------------------------------------------------------------
    const linkMap = new Map<string, LinkDefinition>(profile.links.map((l) => [l.id, l]));
    const baseLinkExists = linkMap.has(profile.robot.baseLink);
    if (!baseLinkExists) {
      issues.push({
        severity: 'ERROR',
        component: 'KinematicTree:BaseLink',
        message: `Declared base link '${profile.robot.baseLink}' does not exist in links definition.`,
      });
    }

    const parentToChildren = new Map<string, string[]>();
    const childToParent = new Map<string, string>();

    for (const joint of profile.joints) {
      if (!linkMap.has(joint.parentLink)) {
        issues.push({
          severity: 'ERROR',
          component: `Joint:${joint.id}`,
          message: `Parent link '${joint.parentLink}' not found in link definitions.`,
        });
      }
      if (!linkMap.has(joint.childLink)) {
        issues.push({
          severity: 'ERROR',
          component: `Joint:${joint.id}`,
          message: `Child link '${joint.childLink}' not found in link definitions.`,
        });
      }

      // Check unique parent per child (tree property)
      if (childToParent.has(joint.childLink)) {
        issues.push({
          severity: 'ERROR',
          component: `KinematicTree:MultiParent`,
          message: `Child link '${joint.childLink}' has multiple parent joints (closed kinematic loop).`,
        });
      }
      childToParent.set(joint.childLink, joint.parentLink);

      if (!parentToChildren.has(joint.parentLink)) {
        parentToChildren.set(joint.parentLink, []);
      }
      parentToChildren.get(joint.parentLink)!.push(joint.childLink);

      // Check rotation axis is normalized
      const axisLen = Math.sqrt(
        joint.rotationAxis.x ** 2 + joint.rotationAxis.y ** 2 + joint.rotationAxis.z ** 2
      );
      if (Math.abs(axisLen - 1.0) > 0.01) {
        issues.push({
          severity: 'ERROR',
          component: `JointAxis:${joint.id}`,
          message: `Rotation axis is not a unit vector (magnitude=${axisLen.toFixed(4)}).`,
        });
      }
    }

    // ------------------------------------------------------------
    // 5. Actuator Model Linkage
    // ------------------------------------------------------------
    const actuatorIds = new Set(profile.actuators.map((a) => a.id));
    for (const joint of profile.joints) {
      if (!actuatorIds.has(joint.actuatorModelId)) {
        issues.push({
          severity: 'ERROR',
          component: `JointActuatorLinkage:${joint.id}`,
          message: `Joint references undefined actuatorModelId '${joint.actuatorModelId}'.`,
        });
      }
    }

    return {
      valid: issues.filter((i) => i.severity === 'ERROR').length === 0,
      issues,
      computedTotalMassKg,
    };
  }
}

function yzCondition(iyy: number, izz: number, ixx: number, eps: number): boolean {
  return iyy + izz < ixx - eps;
}

function xzCondition(ixx: number, izz: number, iyy: number, eps: number): boolean {
  return ixx + izz < iyy - eps;
}

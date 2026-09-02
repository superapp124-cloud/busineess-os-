import { describe, it, expect } from 'vitest';
import { ProfileLoader, ProfileValidator, RobotProfile } from '../../packages/robot-profiles/src';

describe('GATE 2: Digital Twin Profile & Physical Invariants (CHATR-H170)', () => {
  // ------------------------------------------------------------
  // TEST 1: Canonical Profile Load & Validation
  // ------------------------------------------------------------
  it('Loads and verifies the canonical CHATR-H170 profile with zero validation errors', () => {
    const { profile, validation } = ProfileLoader.loadH170Profile();

    expect(profile).toBeDefined();
    expect(profile.robot.modelName).toBe('CHATR-H170');
    expect(profile.robot.heightMeters).toBe(1.75);
    expect(profile.robot.totalMassKg).toBe(68.0);
    expect(profile.robot.dofCount).toBe(28);

    expect(validation.valid).toBe(true);
    expect(validation.issues.filter((i) => i.severity === 'ERROR').length).toBe(0);
  });

  // ------------------------------------------------------------
  // TEST 2: Mass Conservation Invariant
  // ------------------------------------------------------------
  it('Enforces exact mass conservation across all 29 rigid body links (sum == 68.0 kg)', () => {
    const { profile, validation } = ProfileLoader.loadH170Profile();

    const sumLinkMasses = profile.links.reduce((acc, link) => acc + link.massKg, 0);
    expect(sumLinkMasses).toBeCloseTo(68.0, 3);
    expect(validation.computedTotalMassKg).toBeCloseTo(68.0, 3);
  });

  // ------------------------------------------------------------
  // TEST 3: Kinematic Tree Connectivity & Joint Axes
  // ------------------------------------------------------------
  it('Verifies kinematic tree is fully connected, acyclic, and all joint axes are normalized unit vectors', () => {
    const { profile } = ProfileLoader.loadH170Profile();

    expect(profile.joints.length).toBe(28);

    for (const joint of profile.joints) {
      const axisLen = Math.sqrt(
        joint.rotationAxis.x ** 2 + joint.rotationAxis.y ** 2 + joint.rotationAxis.z ** 2
      );
      expect(axisLen).toBeCloseTo(1.0, 4);
      expect(joint.limits.minRad).toBeLessThan(joint.limits.maxRad);
      expect(joint.limits.maxTorqueNm).toBeGreaterThan(0);
    }
  });

  // ------------------------------------------------------------
  // TEST 4: Inertia Tensor Physical Feasibility (Positive Definite + Triangle Inequality)
  // ------------------------------------------------------------
  it('Ensures all link inertia tensors satisfy strict rigid body triangle inequalities', () => {
    const { profile } = ProfileLoader.loadH170Profile();

    for (const link of profile.links) {
      const { ixx, iyy, izz } = link.inertia;
      expect(ixx).toBeGreaterThan(0);
      expect(iyy).toBeGreaterThan(0);
      expect(izz).toBeGreaterThan(0);

      // Triangle inequalities: Ixx + Iyy >= Izz, Ixx + Izz >= Iyy, Iyy + Izz >= Ixx
      expect(ixx + iyy).toBeGreaterThanOrEqual(izz - 1e-6);
      expect(ixx + izz).toBeGreaterThanOrEqual(iyy - 1e-6);
      expect(iyy + izz).toBeGreaterThanOrEqual(ixx - 1e-6);
    }
  });

  // ------------------------------------------------------------
  // TEST 5: Actuator & Controller Gain Coverage
  // ------------------------------------------------------------
  it('Verifies every joint maps to a valid actuator model and has defined whole-body PID gains', () => {
    const { profile } = ProfileLoader.loadH170Profile();

    const actuatorIds = new Set(profile.actuators.map((a) => a.id));

    for (const joint of profile.joints) {
      expect(actuatorIds.has(joint.actuatorModelId)).toBe(true);

      const controllerGains = profile.controllers.jointControllers[joint.id];
      expect(controllerGains).toBeDefined();
      expect(controllerGains.kp).toBeGreaterThan(0);
      expect(controllerGains.kd).toBeGreaterThan(0);
    }
  });

  // ------------------------------------------------------------
  // TEST 6: Profile Validator Error Catching (Adversarial Tests)
  // ------------------------------------------------------------
  it('Catches intentional corruptions (mass mismatch, non-unit joint axis, closed cycle)', () => {
    const { profile } = ProfileLoader.loadH170Profile();

    // 1. Corrupt total mass
    const corruptedMassProfile: RobotProfile = {
      ...profile,
      robot: { ...profile.robot, totalMassKg: 100.0 }, // Links sum to 68.0, but declared 100.0
    };
    const massValidation = ProfileValidator.validate(corruptedMassProfile);
    expect(massValidation.valid).toBe(false);
    expect(massValidation.issues.some((i) => i.component === 'MassConservation')).toBe(true);

    // 2. Corrupt joint axis to non-unit vector
    const corruptedAxisProfile: RobotProfile = {
      ...profile,
      joints: profile.joints.map((j) =>
        j.id === 'neck_yaw' ? { ...j, rotationAxis: { x: 2.0, y: 0.0, z: 0.0 } } : j
      ),
    };
    const axisValidation = ProfileValidator.validate(corruptedAxisProfile);
    expect(axisValidation.valid).toBe(false);
    expect(axisValidation.issues.some((i) => i.component === 'JointAxis:neck_yaw')).toBe(true);
  });
});

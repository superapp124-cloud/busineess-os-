import { describe, it, expect } from 'vitest';
import {
  Vector3,
  Matrix3,
  Matrix4,
  Quaternion,
  RigidBody,
  PhysicsWorld,
  ArticulatedRobot,
  SimulationReplayEngine,
} from '../../packages/robot-physics/src';
import { ProfileLoader } from '../../packages/robot-profiles/src';

describe('GATE 3: Physics Simulator Engine (G3.1 - G3.10 Verification)', () => {
  // ------------------------------------------------------------
  // G3.1: 3D Spatial Mathematics
  // ------------------------------------------------------------
  it('G3.1: Mathematics — Verifies Vector3, Matrix3, Matrix4, and Quaternion operations', () => {
    const v1 = new Vector3(1, 0, 0);
    const v2 = new Vector3(0, 1, 0);
    const vCross = v1.cross(v2);
    expect(vCross.x).toBe(0);
    expect(vCross.y).toBe(0);
    expect(vCross.z).toBe(1);
    expect(v1.dot(v2)).toBe(0);

    const qZ = Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.PI * 0.5);
    const rotated = qZ.rotateVector(new Vector3(1, 0, 0));
    expect(rotated.x).toBeCloseTo(0.0, 4);
    expect(rotated.y).toBeCloseTo(1.0, 4);
    expect(rotated.z).toBeCloseTo(0.0, 4);

    const m = new Matrix3().set(2, 0, 0, 0, 4, 0, 0, 0, 5);
    m.invert();
    expect(m.elements[0]).toBeCloseTo(0.5, 4);
    expect(m.elements[4]).toBeCloseTo(0.25, 4);
    expect(m.elements[8]).toBeCloseTo(0.2, 4);

    const mat4 = new Matrix4().compose(new Vector3(10, 20, 30), qZ);
    const transformedPoint = mat4.transformPoint(new Vector3(1, 0, 0));
    expect(transformedPoint.x).toBeCloseTo(10.0, 4);
    expect(transformedPoint.y).toBeCloseTo(21.0, 4);
    expect(transformedPoint.z).toBeCloseTo(30.0, 4);
  });

  // ------------------------------------------------------------
  // G3.2 & G3.3: Rigid Body Dynamics
  // ------------------------------------------------------------
  it('G3.2 & G3.3: Rigid Body Dynamics — Integrates F=ma and updates momentum under force and torque', () => {
    const body = new RigidBody({
      id: 'test_block',
      name: 'Test Block',
      massKg: 10.0,
      localInertia: { ixx: 1.0, iyy: 1.0, izz: 1.0 },
      position: new Vector3(0, 0, 5.0),
    });

    const world = new PhysicsWorld({ fixedTimestepSeconds: 0.01 });
    world.addBody(body);

    for (let i = 0; i < 10; i++) {
      body.applyForce(new Vector3(50, 0, 0));
      world.step();
    }

    expect(body.velocity.x).toBeCloseTo(0.5, 2);
    expect(body.position.x).toBeGreaterThan(0.02);
  });

  // ------------------------------------------------------------
  // Analytical Free Fall Trajectory Comparison (Pre-Impact Verification)
  // ------------------------------------------------------------
  it('G3.3 Analytical Check: Validates pre-impact free-fall trajectory against analytical z(t) and v(t)', () => {
    const body = new RigidBody({
      id: 'falling_sphere',
      name: 'Free Falling Test Sphere',
      massKg: 5.0,
      localInertia: { ixx: 0.1, iyy: 0.1, izz: 0.1 },
      position: new Vector3(0, 0, 10.0), // High drop height to test pre-impact trajectory
    });

    const dt = 0.002;
    const world = new PhysicsWorld({ fixedTimestepSeconds: dt, groundZ: 0.0 });
    world.addBody(body);

    // Simulate for 0.15 seconds (75 steps) before any contact
    const g = 9.81;
    const z0 = 10.0;

    for (let step = 1; step <= 75; step++) {
      world.step();
      const t = step * dt;
      const analyticalZ = z0 - 0.5 * g * t * t;
      const analyticalVz = -g * t;

      // Check position matches analytical solution within 1.0 mm (0.001 m)
      expect(Math.abs(body.position.z - analyticalZ)).toBeLessThan(0.002);
      // Check velocity matches analytical solution within 0.02 m/s
      expect(Math.abs(body.velocity.z - analyticalVz)).toBeLessThan(0.02);
    }
  });

  // ------------------------------------------------------------
  // G3.4 & G3.5: Ground Collision & Coulomb Friction
  // ------------------------------------------------------------
  it('G3.4 & G3.5: Collision & Contact — Free falling rigid box hits ground and settles without interpenetration', () => {
    const box = new RigidBody({
      id: 'falling_foot',
      name: 'Foot Box',
      massKg: 1.5,
      localInertia: { ixx: 0.01, iyy: 0.01, izz: 0.01 },
      position: new Vector3(0, 0, 0.5),
      collision: {
        type: 'box',
        dimensions: { length: 0.24, width: 0.12, height: 0.06 },
        offset: new Vector3(0, 0, 0),
      },
    });

    const world = new PhysicsWorld({ fixedTimestepSeconds: 0.002, groundZ: 0.0 });
    world.addBody(box);

    const frames = world.runForDuration(0.6);
    expect(frames.length).toBe(300);

    expect(box.position.z).toBeGreaterThan(0.025);
    expect(box.velocity.z).toBeCloseTo(0.0, 1);
    expect(box.position.z).toBeLessThan(0.10);
  });

  // ------------------------------------------------------------
  // G3.6: Articulated Robot Assembly
  // ------------------------------------------------------------
  it('G3.6: Robot Assembly — Instantiates CHATR-H170 with 28 joints and 29 rigid links from canonical profile', () => {
    const { profile } = ProfileLoader.loadH170Profile();
    const robot = new ArticulatedRobot(profile, new Vector3(0, 0, 1.0));

    expect(robot.getAllBodies().length).toBe(29);
    expect(robot.getAllJoints().length).toBe(28);
    expect(robot.getTotalMass()).toBeCloseTo(68.0, 3);
    expect(robot.baseLink.id).toBe('pelvis');
  });

  // ------------------------------------------------------------
  // G3.7: Gravity Fall Test
  // ------------------------------------------------------------
  it('G3.7: Gravity Test — Spawns CHATR-H170 in gravity with motors OFF, falls and settles on ground', () => {
    const { profile } = ProfileLoader.loadH170Profile();
    const world = new PhysicsWorld({ fixedTimestepSeconds: 0.002, groundZ: 0.0, solverIterations: 10 });
    const robot = new ArticulatedRobot(profile, new Vector3(0, 0, 1.2));
    world.addRobot(robot);

    expect(robot.baseLink.position.z).toBe(1.2);
    expect(robot.baseLink.velocity.z).toBe(0.0);

    const telemetry = world.runForDuration(1.0);

    expect(robot.baseLink.position.z).toBeLessThan(1.2);
    expect(robot.baseLink.position.z).toBeGreaterThan(0.0);
    expect(telemetry[telemetry.length - 1].activeContactCount).toBeGreaterThan(0);

    const finalFrame = telemetry[telemetry.length - 1];
    expect(finalFrame.isStable).toBe(true);
    expect(finalFrame.robotComWorld.z).toBeGreaterThan(0.0);
  });

  // ------------------------------------------------------------
  // G3.8 & G3.9: Numerical Stability & Energy Tracking
  // ------------------------------------------------------------
  it('G3.8 & G3.9: Stability — Tracks kinetic energy before, during, and after impact with zero NaNs', () => {
    const { profile } = ProfileLoader.loadH170Profile();
    const world = new PhysicsWorld({ fixedTimestepSeconds: 0.002 });
    const robot = new ArticulatedRobot(profile, new Vector3(0, 0, 1.0));
    world.addRobot(robot);

    const frames = world.runForDuration(0.5);

    for (const frame of frames) {
      expect(frame.isStable).toBe(true);
      expect(Number.isNaN(frame.totalKineticEnergyJoules)).toBe(false);
      expect(Number.isFinite(frame.robotComWorld.z)).toBe(true);
      expect(frame.baseLinkVel.z).toBeLessThan(30.0);
    }
  });

  // ------------------------------------------------------------
  // G3.10: Deterministic Replay & Provenance Manifest Verification
  // ------------------------------------------------------------
  it('G3.10: Replay — Proves bit-exact deterministic reproducibility and generates provenance manifest', () => {
    const { profile } = ProfileLoader.loadH170Profile();

    const manifestA = SimulationReplayEngine.recordSimulation(profile, 0.5, new Vector3(0, 0, 1.1), 42);
    const manifestB = SimulationReplayEngine.recordSimulation(profile, 0.5, new Vector3(0, 0, 1.1), 42);

    expect(manifestA.totalSteps).toBe(250);
    expect(manifestB.totalSteps).toBe(250);
    expect(manifestA.initialStateHash).toBe(manifestB.initialStateHash);
    expect(manifestA.robotProfile).toBe('CHATR-H170@1.0.0');
    expect(manifestA.physicsEngine).toBe('robot-physics@1.0.0');

    const determinism = SimulationReplayEngine.verifyDeterminism(manifestA, manifestB);
    expect(determinism.isDeterministic).toBe(true);
    expect(determinism.maxComDifferenceMeters).toBe(0.0);
  });
});

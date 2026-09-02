/**
 * CHATR Physics Engine — PhysicsWorld
 * Real-time 500Hz rigid body dynamic simulation world.
 */

import { RigidBody } from '../dynamics/rigidBody';
import { PhysicsIntegrator } from '../dynamics/integrator';
import { ContactSolver } from '../dynamics/contactSolver';
import { CollisionDetector } from '../geometry/collisionDetector';
import { CollisionManifold } from '../geometry/collisionShapes';
import { ArticulatedRobot } from '../articulated/articulatedRobot';
import { Vector3 } from '../math/vector3';

export interface PhysicsWorldConfig {
  gravity?: Vector3; // Default [0, 0, -9.81]
  fixedTimestepSeconds?: number; // Default 0.002s (500Hz)
  groundZ?: number; // Default 0.0m
  solverIterations?: number; // Default 10
}

export interface SimulationTelemetryFrame {
  timestampSeconds: number;
  stepIndex: number;
  robotComWorld: { x: number; y: number; z: number };
  baseLinkPos: { x: number; y: number; z: number };
  baseLinkVel: { x: number; y: number; z: number };
  totalKineticEnergyJoules: number;
  activeContactCount: number;
  isStable: boolean; // No NaNs, velocity < 50 m/s
}

export class PhysicsWorld {
  public gravity: Vector3;
  public fixedTimestep: number;
  public groundZ: number;
  public solverIterations: number;

  public bodies: Map<string, RigidBody> = new Map();
  public robot: ArticulatedRobot | null = null;

  public currentTimeSeconds = 0.0;
  public stepCount = 0;

  constructor(config: PhysicsWorldConfig = {}) {
    this.gravity = config.gravity ?? new Vector3(0, 0, -9.81);
    this.fixedTimestep = config.fixedTimestepSeconds ?? 0.002; // 500Hz
    this.groundZ = config.groundZ ?? 0.0;
    this.solverIterations = config.solverIterations ?? 10;
  }

  public addBody(body: RigidBody): void {
    this.bodies.set(body.id, body);
  }

  public addRobot(robot: ArticulatedRobot): void {
    this.robot = robot;
    for (const body of robot.getAllBodies()) {
      this.bodies.set(body.id, body);
    }
  }

  /**
   * Advances simulation by exactly one fixed timestep (dt = 0.002s).
   */
  public step(): SimulationTelemetryFrame {
    const dt = this.fixedTimestep;
    const bodyList = Array.from(this.bodies.values());

    // 1. Semi-Implicit Velocity Integration with gravity & external forces
    PhysicsIntegrator.integrateVelocities(bodyList, this.gravity, dt);

    // 2. Collision Detection: Ground plane + Inter-body
    const manifolds: CollisionManifold[] = [];
    for (const body of bodyList) {
      const groundManifold = CollisionDetector.testGroundPlane(body, this.groundZ);
      if (groundManifold) {
        manifolds.push(groundManifold);
      }
    }

    // 3. Contact & Friction Impulse Solver
    ContactSolver.solveVelocities(manifolds, this.bodies, dt, this.solverIterations);

    // 4. Joint Kinematic & Limit Constraint Solver
    if (this.robot) {
      for (let iter = 0; iter < 4; iter++) {
        for (const joint of this.robot.getAllJoints()) {
          joint.solvePositionConstraint(dt, 0.3);
          joint.enforceLimits();
        }
      }
    }

    // 5. Position & Orientation Integration
    PhysicsIntegrator.integratePositions(bodyList, dt);

    // 6. Advance simulation clock
    this.currentTimeSeconds += dt;
    this.stepCount++;

    // 7. Extract Telemetry & Stability Metrics
    const baseLink = this.robot ? this.robot.baseLink : bodyList[0];
    const com = this.robot ? this.robot.computeWorldCenterOfMass() : baseLink.position;
    const totalKE = this.robot ? this.robot.getTotalKineticEnergy() : baseLink.getKineticEnergy();

    let totalContacts = 0;
    for (const m of manifolds) {
      totalContacts += m.contacts.length;
    }

    const isStable =
      com.isFinite() &&
      baseLink.velocity.isFinite() &&
      baseLink.velocity.length() < 50.0 &&
      !Number.isNaN(totalKE);

    return {
      timestampSeconds: Number(this.currentTimeSeconds.toFixed(4)),
      stepIndex: this.stepCount,
      robotComWorld: { x: com.x, y: com.y, z: com.z },
      baseLinkPos: { x: baseLink.position.x, y: baseLink.position.y, z: baseLink.position.z },
      baseLinkVel: { x: baseLink.velocity.x, y: baseLink.velocity.y, z: baseLink.velocity.z },
      totalKineticEnergyJoules: Number(totalKE.toFixed(4)),
      activeContactCount: totalContacts,
      isStable,
    };
  }

  /**
   * Runs the simulation for N seconds.
   */
  public runForDuration(seconds: number): SimulationTelemetryFrame[] {
    const steps = Math.round(seconds / this.fixedTimestep);
    const frames: SimulationTelemetryFrame[] = [];

    for (let i = 0; i < steps; i++) {
      const frame = this.step();
      frames.push(frame);
    }

    return frames;
  }
}

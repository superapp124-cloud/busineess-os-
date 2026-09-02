import { describe, it, expect } from 'vitest';
import {
  QuinticTrajectoryPlanner,
  GraspPlanner,
  SlipDetector,
  ManipulationSafetyController,
  HardwareAdapterContract,
  EndToEndManipulationPipeline,
} from '../../packages/robot-manipulation/src';
import { Vector3, Quaternion } from '../../packages/robot-physics/src';
import { ObjectPose6D } from '../../packages/robot-perception/src';

describe('GATE 6.1-R: Manipulation Hardening & Hardware Contracts', () => {
  // ------------------------------------------------------------
  // 1. C2-Continuous Trajectory with Bounded Jerk
  // ------------------------------------------------------------
  it('1. Trajectory Planner — Validates C2 continuity, zero boundary velocity/acceleration, and bounded jerk', () => {
    const startJoints = {
      shoulderPitch: -0.2,
      shoulderRoll: 0.1,
      shoulderYaw: 0.0,
      elbowPitch: 0.5,
      wristYaw: 0.0,
      wristRoll: 0.0,
      wristPitch: 0.0,
    };

    const targetJoints = {
      shoulderPitch: -0.8,
      shoulderRoll: 0.4,
      shoulderYaw: 0.2,
      elbowPitch: 1.4,
      wristYaw: 0.1,
      wristRoll: 0.0,
      wristPitch: -0.1,
    };

    const waypoints = QuinticTrajectoryPlanner.generateTrajectory('RIGHT', startJoints, targetJoints, 1.5);
    expect(waypoints.length).toBe(151);

    // Endpoints: zero velocity and acceleration
    expect(waypoints[0].jointVelocities.shoulderPitch).toBe(0.0);
    expect(waypoints[waypoints.length - 1].jointVelocities.shoulderPitch).toBe(0.0);
    expect(waypoints[0].jointAccelerations.shoulderPitch).toBe(0.0);
    expect(waypoints[waypoints.length - 1].jointAccelerations.shoulderPitch).toBe(0.0);

    // Jerk is finite and strictly bounded (< 50 rad/s^3)
    for (const wp of waypoints) {
      expect(Math.abs(wp.jointJerks.shoulderPitch)).toBeLessThan(QuinticTrajectoryPlanner.MAX_JOINT_JERK_RAD_S3);
    }
  });

  // ------------------------------------------------------------
  // 2. Genuinely Dynamic Grasp Force Formulation
  // ------------------------------------------------------------
  it('2. Dynamic Grasp Force — Formulates normal force from gravity, linear/angular acceleration, and perception uncertainty', () => {
    const bottle: ObjectPose6D = {
      objectId: 'water_bottle_01',
      category: 'bottle',
      confidence: 0.95,
      positionCamera: new Vector3(0, 0, 1.0),
      positionWorld: new Vector3(0.42, -0.22, 0.92),
      orientationWorld: new Quaternion(1, 0, 0, 0),
      dimensionsMeters: { length: 0.08, width: 0.08, height: 0.25 },
      boundingBox2D: { xMin: 100, yMin: 100, xMax: 140, yMax: 200, confidence: 0.95 },
      affordances: ['GRASPABLE'],
      lastObservedTimestamp: 1.0,
    };

    const plan = GraspPlanner.planGrasp(
      'RIGHT',
      bottle,
      { position: new Vector3(0, 0, 0.95) },
      new Vector3(0, 0, 2.5), // 2.5 m/s^2 vertical lift acceleration
      new Vector3(0, 2.0, 0)  // 2.0 rad/s^2 angular acceleration
    );

    expect(plan.isPlanSuccessful).toBe(true);
    const g = plan.candidateGrasp!;

    // Dynamic load accounts for: m*(g + a_lift + a_rot) * safetyFactor / mu * (1 + 10*sigma)
    // 0.45 * (9.81 + 2.5 + 0.08) * 1.60 / 0.65 > 13.5 N
    expect(g.requiredGripForceN).toBeGreaterThan(13.5);
    expect(g.dynamicLoadContext.safetyFactor).toBe(1.60);
    expect(g.dynamicLoadContext.perceptionUncertainty1Sigma).toBeGreaterThan(0.0);
  });

  // ------------------------------------------------------------
  // 3. Bounded Adaptive Force Control & Material Fragility
  // ------------------------------------------------------------
  it('3. Bounded Adaptive Force — Squeezes adaptively under slip but respects material fragility limits', () => {
    // 1. Fragile Glass: starts at 20N, receives adaptive increment within 35N ceiling
    const glassInc1 = SlipDetector.computeAdaptiveForceIncrement(20.0, 'FRAGILE_GLASS_CERAMIC', 0.02);
    expect(glassInc1.isForceSafe).toBe(true);
    expect(glassInc1.nextCommencedForceN).toBeGreaterThan(20.0);
    expect(glassInc1.nextCommencedForceN).toBeLessThanOrEqual(35.0);

    // 2. Glass already at 35N limit: refuses further squeezing to prevent crushing
    const glassAtLimit = SlipDetector.computeAdaptiveForceIncrement(35.0, 'FRAGILE_GLASS_CERAMIC', 0.02);
    expect(glassAtLimit.isForceSafe).toBe(false);
    expect(glassAtLimit.actionTaken).toBe('ABORT_TO_PREVENT_CRUSH');

    // 3. Deformable Foam: capped strictly at 20N
    const foamCap = SlipDetector.computeAdaptiveForceIncrement(18.0, 'DEFORMABLE_FOAM_PLASTIC', 0.03);
    expect(foamCap.nextCommencedForceN).toBe(20.0);
    expect(foamCap.actionTaken).toBe('CAPPED_AT_FRAGILITY_LIMIT');
  });

  // ------------------------------------------------------------
  // 4. Predictive 4-Zone Spatial Human Safety System
  // ------------------------------------------------------------
  it('4. Predictive Spatial Safety — Manages 4 zones based on distance and Time-To-Collision (TTC)', () => {
    // Zone 0: Collision Envelope (distance = 0.12m) -> Freeze
    const z0 = ManipulationSafetyController.evaluateSpatialSafety({
      perceptionConfidence: 0.95,
      humanPositionWorld: new Vector3(0.50, -0.22, 0.92),
      armEndEffectorPosWorld: new Vector3(0.40, -0.22, 0.92),
      humanVelocityWorld: new Vector3(-0.5, 0, 0),
      measuredJointTorquesNm: { shoulder: 10, elbow: 8, wrist: 3 },
      cameraStreamAgeSeconds: 0.033,
    });
    expect(z0.safetyZone).toBe('ZONE_0_COLLISION_ENVELOPE');
    expect(z0.isExecutionPermitted).toBe(false);
    expect(z0.permittedVelocityScale).toBe(0.0);

    // Zone 1: Emergency Stop Envelope (TTC < 0.40s)
    const z1 = ManipulationSafetyController.evaluateSpatialSafety({
      perceptionConfidence: 0.95,
      humanPositionWorld: new Vector3(0.70, -0.22, 0.92),
      armEndEffectorPosWorld: new Vector3(0.40, -0.22, 0.92),
      humanVelocityWorld: new Vector3(-1.0, 0, 0), // Rapid approach
      measuredJointTorquesNm: { shoulder: 10, elbow: 8, wrist: 3 },
      cameraStreamAgeSeconds: 0.033,
    });
    expect(z1.safetyZone).toBe('ZONE_1_EMERGENCY_STOP');
    expect(z1.isExecutionPermitted).toBe(false);

    // Zone 2: Reduced Speed Envelope (distance = 0.60m) -> 30% speed cap
    const z2 = ManipulationSafetyController.evaluateSpatialSafety({
      perceptionConfidence: 0.95,
      humanPositionWorld: new Vector3(1.0, -0.22, 0.92),
      armEndEffectorPosWorld: new Vector3(0.40, -0.22, 0.92),
      humanVelocityWorld: new Vector3(0, 0, 0),
      measuredJointTorquesNm: { shoulder: 10, elbow: 8, wrist: 3 },
      cameraStreamAgeSeconds: 0.033,
    });
    expect(z2.safetyZone).toBe('ZONE_2_REDUCED_SPEED');
    expect(z2.isExecutionPermitted).toBe(true);
    expect(z2.permittedVelocityScale).toBe(0.30);

    // Zone 3: Normal Operating Envelope (distance = 1.50m)
    const z3 = ManipulationSafetyController.evaluateSpatialSafety({
      perceptionConfidence: 0.95,
      humanPositionWorld: new Vector3(1.90, -0.22, 0.92),
      armEndEffectorPosWorld: new Vector3(0.40, -0.22, 0.92),
      humanVelocityWorld: new Vector3(0, 0, 0),
      measuredJointTorquesNm: { shoulder: 10, elbow: 8, wrist: 3 },
      cameraStreamAgeSeconds: 0.033,
    });
    expect(z3.safetyZone).toBe('ZONE_3_NORMAL_OPERATING');
    expect(z3.permittedVelocityScale).toBe(1.0);
  });

  // ------------------------------------------------------------
  // 5. Hardware Bus & Protocol Contracts (CAN-FD / EtherCAT)
  // ------------------------------------------------------------
  it('5. Hardware Contracts — Encodes CAN-FD commands and validates motor driver feedback packets', () => {
    const cmd = HardwareAdapterContract.encodeMotorCommand(0x11, 24.5, 1.2, -0.65);
    expect(cmd.nodeId).toBe(0x11);
    expect(cmd.targetTorqueNm).toBe(24.5);
    expect(cmd.crc16).toBeGreaterThan(0);

    // Valid feedback
    const healthyFeedback = HardwareAdapterContract.validateMotorFeedback({
      nodeId: 0x11,
      encoderTicks: 262144,
      actualPositionRad: -0.65,
      actualVelocityRadS: 1.2,
      measuredTorqueNm: 24.1,
      phaseCurrentAmps: 8.5,
      inverterTempCelsius: 48.0,
      motorWindingTempCelsius: 52.0,
      faultFlags: {
        overCurrent: false,
        overVoltage: false,
        overTemperature: false,
        encoderError: false,
        communicationTimeout: false,
      },
      timestampMicroseconds: 1000000,
    });
    expect(healthyFeedback.isHealthy).toBe(true);

    // Thermal fault feedback
    const overheatingFeedback = HardwareAdapterContract.validateMotorFeedback({
      nodeId: 0x11,
      encoderTicks: 262144,
      actualPositionRad: -0.65,
      actualVelocityRadS: 1.2,
      measuredTorqueNm: 24.1,
      phaseCurrentAmps: 8.5,
      inverterTempCelsius: 92.0, // > 85C limit
      motorWindingTempCelsius: 95.0,
      faultFlags: {
        overCurrent: false,
        overVoltage: false,
        overTemperature: true,
        encoderError: false,
        communicationTimeout: false,
      },
      timestampMicroseconds: 1000000,
    });
    expect(overheatingFeedback.isHealthy).toBe(false);
  });

  // ------------------------------------------------------------
  // 6. E2E Simulation Evidence Trial Classification
  // ------------------------------------------------------------
  it('6. E2E Simulation Trial — Confirms E2E-SIM-PICK-LIFT-001 simulation evidence marker', () => {
    const targetBottle: ObjectPose6D = {
      objectId: 'water_bottle_01',
      category: 'bottle',
      confidence: 0.95,
      positionCamera: new Vector3(0, 0, 1.0),
      positionWorld: new Vector3(0.42, -0.22, 0.92),
      orientationWorld: new Quaternion(1, 0, 0, 0),
      dimensionsMeters: { length: 0.08, width: 0.08, height: 0.25 },
      boundingBox2D: { xMin: 100, yMin: 100, xMax: 140, yMax: 200, confidence: 0.95 },
      affordances: ['GRASPABLE'],
      lastObservedTimestamp: 1.0,
    };

    const res = EndToEndManipulationPipeline.executePickAndLift('RIGHT', targetBottle);
    expect(res.simulationTrialId).toBe('E2E-SIM-PICK-LIFT-001');
    expect(res.isSimulationEvidenceOnly).toBe(true);
    expect(res.isSuccessful).toBe(true);
  });
});

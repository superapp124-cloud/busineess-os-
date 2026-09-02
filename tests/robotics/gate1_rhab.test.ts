import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  SimulatedRobotAdapter,
  PhysicalRobotAdapter,
  RHABRegistry,
  rhab,
  CHATR_H170_JOINTS,
  DEFAULT_H170_JOINT_LIMITS,
  IRobotHardware,
} from '../../packages/robot-rhab/src';

describe('GATE 1: RHAB (Robot Hardware Abstraction Layer) Contract & Safety Tests', () => {
  let simHardware: SimulatedRobotAdapter;
  let physHardware: PhysicalRobotAdapter;

  beforeEach(async () => {
    simHardware = new SimulatedRobotAdapter({ initialBatteryPercentage: 100 });
    physHardware = new PhysicalRobotAdapter();
    await simHardware.connect();
    await physHardware.connect();
  });

  afterEach(async () => {
    await simHardware.disconnect();
    await physHardware.disconnect();
  });

  // ------------------------------------------------------------
  // TEST 1: Joint Limits & Safe Clamping
  // ------------------------------------------------------------
  it('Verifies joint commands are strictly clamped within physical limits on both adapters', async () => {
    const jointId = 'l_elbow_pitch';
    const limits = DEFAULT_H170_JOINT_LIMITS[jointId];
    expect(limits).toBeDefined();

    // 1. Send an out-of-bounds command (positive angle exceeding limit)
    await simHardware.commandJoint({
      jointId,
      targetPositionRad: 1.5, // Exceeds maxPositionRad (0.0)
    });

    let state = simHardware.getJointState(jointId);
    expect(state).toBeDefined();
    expect(state!.positionRad).toBeLessThanOrEqual(limits.maxPositionRad);
    expect(state!.positionRad).toBe(limits.maxPositionRad);

    // 2. Send excessive negative angle
    await simHardware.commandJoint({
      jointId,
      targetPositionRad: -5.0, // Below minPositionRad (-2.61)
    });

    state = simHardware.getJointState(jointId);
    expect(state!.positionRad).toBeGreaterThanOrEqual(limits.minPositionRad);
    expect(state!.positionRad).toBe(limits.minPositionRad);

    // 3. Verify same behavior on Physical adapter
    await physHardware.commandJoint({
      jointId,
      targetPositionRad: 2.0,
    });
    const physState = physHardware.getJointState(jointId);
    expect(physState!.positionRad).toBe(limits.maxPositionRad);
  });

  // ------------------------------------------------------------
  // TEST 2: Deterministic Emergency Stop (E-STOP) Invariants
  // ------------------------------------------------------------
  it('Guarantees Emergency Stop zeroes all efforts and rejects subsequent actuator commands', async () => {
    // Command joints to active motion
    await simHardware.commandJoint({
      jointId: 'waist_yaw',
      targetPositionRad: 0.5,
      targetVelocityRadPerSec: 1.2,
      feedForwardTorqueNm: 40.0,
    });

    let waistState = simHardware.getJointState('waist_yaw')!;
    expect(waistState.measuredTorqueNm).toBe(40.0);

    // TRIGGER E-STOP
    await simHardware.emergencyStop('Human in danger zone', 'SAFETY_CONTROLLER');

    const estopState = simHardware.getEStopState();
    expect(estopState.isTriggered).toBe(true);
    expect(estopState.source).toBe('SAFETY_CONTROLLER');
    expect(estopState.reason).toBe('Human in danger zone');

    // Verify all joint efforts are zeroed
    waistState = simHardware.getJointState('waist_yaw')!;
    expect(waistState.velocityRadPerSec).toBe(0.0);
    expect(waistState.appliedEffort).toBe(0.0);
    expect(waistState.measuredTorqueNm).toBe(0.0);

    // Verify commands during E-Stop are rejected with an error
    await expect(
      simHardware.commandJoint({ jointId: 'waist_yaw', targetPositionRad: 0.2 })
    ).rejects.toThrow(/Emergency Stop active/);

    // Reset E-Stop
    const resetSuccess = await simHardware.resetEmergencyStop();
    expect(resetSuccess).toBe(true);
    expect(simHardware.getEStopState().isTriggered).toBe(false);

    // Verify commands work again after reset
    await simHardware.commandJoint({ jointId: 'waist_yaw', targetPositionRad: 0.2 });
    expect(simHardware.getJointState('waist_yaw')!.positionRad).toBe(0.2);
  });

  // ------------------------------------------------------------
  // TEST 3: Thermal Limit Shutdown & Auto E-Stop
  // ------------------------------------------------------------
  it('Triggers automatic thermal E-Stop if joint temperature exceeds safe shutdown limit', async () => {
    const jointId = 'r_knee_pitch';
    const limits = DEFAULT_H170_JOINT_LIMITS[jointId];

    // Force motor heating simulation loop
    for (let i = 0; i < 1500; i++) {
      if (simHardware.getEStopState().isTriggered) break;
      await simHardware.commandJoint({
        jointId,
        feedForwardTorqueNm: limits.maxTorqueNm, // Max effort heating
      });
    }

    const state = simHardware.getJointState(jointId)!;
    expect(state.temperatureCelsius).toBeGreaterThanOrEqual(limits.thermalShutdownCelsius);
    expect(simHardware.getEStopState().isTriggered).toBe(true);
    expect(simHardware.getEStopState().source).toBe('MOTOR_OVER_TEMP');

    // Attempting to reset while still hot must fail
    const resetResult = await simHardware.resetEmergencyStop();
    expect(resetResult).toBe(false);
  });

  // ------------------------------------------------------------
  // TEST 4: Battery & BMS Telemetry Degradation
  // ------------------------------------------------------------
  it('Correctly calculates battery discharge and transitions BMS health states', async () => {
    const initialBattery = simHardware.getBatteryState();
    expect(initialBattery.chargePercentage).toBe(100.0);
    expect(initialBattery.bmsStatus).toBe('HEALTHY');

    // Simulate 20 Amperes continuous drain for 2.5 hours
    simHardware.updateBattery(20.0, 9000); // 9000 seconds = 2.5 hours -> 50Ah drain on 30Ah pack

    const drainedBattery = simHardware.getBatteryState();
    expect(drainedBattery.chargePercentage).toBe(0.0);
    expect(drainedBattery.bmsStatus).toBe('CRITICAL_LOW');
  });

  // ------------------------------------------------------------
  // TEST 5: Adapter Interchangeability & Registry Contract
  // ------------------------------------------------------------
  it('Enables seamless switching between SIMULATION and PHYSICAL modes via RHABRegistry', async () => {
    const registry = RHABRegistry.getInstance();

    // 1. Initialize Simulation
    const sim = await registry.initialize('SIMULATION');
    expect(sim.getMode()).toBe('SIMULATION');
    expect(sim.isConnected()).toBe(true);
    expect(registry.getMode()).toBe('SIMULATION');

    // Verify all 28 canonical joints are present
    const simJoints = sim.getAllJointStates();
    expect(Object.keys(simJoints).length).toBe(CHATR_H170_JOINTS.length);

    // 2. Switch to Physical Hardware
    const phys = await registry.initialize('PHYSICAL');
    expect(phys.getMode()).toBe('PHYSICAL');
    expect(phys.isConnected()).toBe(true);
    expect(registry.getMode()).toBe('PHYSICAL');

    const physJoints = phys.getAllJointStates();
    expect(Object.keys(physJoints).length).toBe(CHATR_H170_JOINTS.length);

    // Verify previous adapter was cleanly disconnected
    expect(sim.isConnected()).toBe(false);

    await registry.shutdown();
  });

  // ------------------------------------------------------------
  // TEST 6: High-Rate Telemetry Subscription
  // ------------------------------------------------------------
  it('Streams high-rate overall state snapshots to registered telemetry listeners', async () => {
    let receivedFrames = 0;
    const unsubscribe = simHardware.subscribeState((state) => {
      expect(state.jointStates).toBeDefined();
      expect(state.imu).toBeDefined();
      expect(state.battery).toBeDefined();
      receivedFrames++;
    }, 100); // 100 Hz

    // Wait 50ms for telemetry loop ticks
    await new Promise((resolve) => setTimeout(resolve, 60));
    unsubscribe();

    expect(receivedFrames).toBeGreaterThan(0);
  });
});

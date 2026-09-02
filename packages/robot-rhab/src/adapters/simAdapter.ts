/**
 * CHATR Robot Hardware Abstraction Layer (RHAB) — Simulated Robot Adapter
 * 
 * Implements IRobotHardware for physics-based digital twin execution.
 * Exposes the exact same low-level interface as the physical hardware adapter.
 */

import { IRobotHardware } from '../interfaces';
import {
  JointCommand,
  JointState,
  JointLimits,
  IMUState,
  FootContactState,
  BatteryState,
  EndEffectorActuatorState,
  CameraFrame,
  MicrophoneFrame,
  EStopState,
  EStopSource,
  HardwareFault,
  RobotOverallState,
} from '../types';
import { CHATR_H170_JOINTS, DEFAULT_H170_JOINT_LIMITS } from '../constants';

export interface SimAdapterOptions {
  enableSensorNoise?: boolean;
  thermalHeatingRate?: number;
  initialBatteryPercentage?: number;
}

export class SimulatedRobotAdapter implements IRobotHardware {
  private connected = false;
  private mode: 'SIMULATION' = 'SIMULATION';
  private startTimeMs = 0;

  // Joint States & Limits
  private jointStates: Map<string, JointState> = new Map();
  private jointLimits: Map<string, JointLimits> = new Map();

  // Sensors & BMS
  private imu: IMUState;
  private leftFoot: FootContactState;
  private rightFoot: FootContactState;
  private battery: BatteryState;
  private leftHand: EndEffectorActuatorState;
  private rightHand: EndEffectorActuatorState;
  private estop: EStopState;
  private activeFaults: HardwareFault[] = [];

  // Buffers
  private latestRgbCamera: CameraFrame | null = null;
  private latestDepthCamera: CameraFrame | null = null;
  private latestAudio: MicrophoneFrame | null = null;

  // Telemetry Subscriptions
  private subscribers: Map<number, (state: RobotOverallState) => void> = new Map();
  private subscriberIdCounter = 0;
  private telemetryTimer: NodeJS.Timeout | null = null;

  constructor(private options: SimAdapterOptions = {}) {
    this.initJoints();
    this.imu = this.createDefaultIMU();
    this.leftFoot = this.createDefaultFootContact('left');
    this.rightFoot = this.createDefaultFootContact('right');
    this.battery = this.createDefaultBattery(options.initialBatteryPercentage ?? 100.0);
    this.leftHand = this.createDefaultEndEffector('left');
    this.rightHand = this.createDefaultEndEffector('right');
    this.estop = {
      isTriggered: false,
      source: null,
      reason: null,
      timestampMs: Date.now(),
    };
  }

  private initJoints(): void {
    const now = Date.now();
    for (const jointId of CHATR_H170_JOINTS) {
      const limits = DEFAULT_H170_JOINT_LIMITS[jointId] || {
        minPositionRad: -3.14,
        maxPositionRad: 3.14,
        maxVelocityRadPerSec: 5.0,
        maxTorqueNm: 100,
        maxContinuousCurrentA: 15.0,
        thermalShutdownCelsius: 85,
      };
      this.jointLimits.set(jointId, limits);

      this.jointStates.set(jointId, {
        id: jointId,
        name: jointId,
        positionRad: 0.0,
        velocityRadPerSec: 0.0,
        measuredTorqueNm: 0.0,
        appliedEffort: 0.0,
        temperatureCelsius: 32.0, // Nominal ambient start temp
        voltageVolts: 48.0,
        currentAmperes: 0.2,      // Idle baseline current
        faultCode: 0,
        timestampMs: now,
      });
    }
  }

  private createDefaultIMU(): IMUState {
    return {
      sensorId: 'torso_imu_01',
      orientation: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
      angularVelocityRadPerSec: { x: 0.0, y: 0.0, z: 0.0 },
      linearAccelerationMPerSec2: { x: 0.0, y: 0.0, z: 9.81 }, // Gravity vector
      pitchRad: 0.0,
      rollRad: 0.0,
      yawRad: 0.0,
      temperatureCelsius: 35.0,
      timestampMs: Date.now(),
    };
  }

  private createDefaultFootContact(foot: 'left' | 'right'): FootContactState {
    return {
      foot,
      inContact: true,
      contactForceN: { x: 0.0, y: 0.0, z: 333.5 }, // Half of 68kg humanoid weight
      centerOfPressureM: { x: 0.0, y: 0.0 },
      slipDetected: false,
      rawSensors: [83.3, 83.3, 83.3, 83.3],
      timestampMs: Date.now(),
    };
  }

  private createDefaultBattery(initialPercentage: number): BatteryState {
    return {
      voltageVolts: 48.0 * (initialPercentage / 100.0) + 4.0,
      currentAmperes: 2.5,
      chargePercentage: initialPercentage,
      cellTemperatures: [28.0, 28.5, 28.2, 29.0, 28.1],
      isCharging: false,
      bmsStatus: initialPercentage <= 15 ? 'WARNING_LOW' : 'HEALTHY',
      estimatedRuntimeMinutes: Math.round((initialPercentage / 100.0) * 180),
      timestampMs: Date.now(),
    };
  }

  private createDefaultEndEffector(hand: 'left' | 'right'): EndEffectorActuatorState {
    return {
      hand,
      fingerPositionsRad: [0.0, 0.0, 0.0],
      appliedGripForceN: 0.0,
      isClosed: false,
      tactileSensorsN: [0.0, 0.0, 0.0],
      motorTemperatureCelsius: 30.0,
      faultCode: 0,
      timestampMs: Date.now(),
    };
  }

  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------

  public async connect(config?: Record<string, unknown>): Promise<void> {
    this.connected = true;
    this.startTimeMs = Date.now();
    this.startTelemetryLoop(50); // 50 Hz default broadcast loop
  }

  public async disconnect(): Promise<void> {
    if (this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = null;
    }
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getMode(): 'SIMULATION' | 'PHYSICAL' {
    return this.mode;
  }

  // ------------------------------------------------------------
  // Telemetry Reads
  // ------------------------------------------------------------

  public getJointState(jointId: string): JointState | undefined {
    return this.jointStates.get(jointId);
  }

  public getAllJointStates(): Record<string, JointState> {
    const out: Record<string, JointState> = {};
    for (const [k, v] of this.jointStates.entries()) {
      out[k] = { ...v };
    }
    return out;
  }

  public getJointLimits(jointId: string): JointLimits | undefined {
    return this.jointLimits.get(jointId);
  }

  public getIMUState(): IMUState {
    return { ...this.imu };
  }

  public getFootContacts(): { left: FootContactState; right: FootContactState } {
    return {
      left: { ...this.leftFoot },
      right: { ...this.rightFoot },
    };
  }

  public getBatteryState(): BatteryState {
    return { ...this.battery };
  }

  public getEndEffectorState(hand: 'left' | 'right'): EndEffectorActuatorState {
    return hand === 'left' ? { ...this.leftHand } : { ...this.rightHand };
  }

  public getEStopState(): EStopState {
    return { ...this.estop };
  }

  public getActiveFaults(): HardwareFault[] {
    return [...this.activeFaults];
  }

  public getLatestCameraFrame(cameraId: 'head_rgb' | 'head_depth'): CameraFrame | null {
    return cameraId === 'head_rgb' ? this.latestRgbCamera : this.latestDepthCamera;
  }

  public getLatestAudioFrame(): MicrophoneFrame | null {
    return this.latestAudio;
  }

  public async getState(): Promise<RobotOverallState> {
    const now = Date.now();
    return {
      mode: this.mode,
      connected: this.connected,
      uptimeSeconds: this.connected ? (now - this.startTimeMs) / 1000 : 0,
      jointStates: this.getAllJointStates(),
      imu: this.getIMUState(),
      leftFoot: this.leftFoot,
      rightFoot: this.rightFoot,
      battery: this.getBatteryState(),
      leftHand: this.leftHand,
      rightHand: this.rightHand,
      estop: this.getEStopState(),
      activeFaults: this.getActiveFaults(),
      controlLoopFrequencyHz: 50,
      timestampMs: now,
    };
  }

  // ------------------------------------------------------------
  // Low-Level Actuation Commands
  // ------------------------------------------------------------

  public async commandJoint(cmd: JointCommand): Promise<void> {
    if (!this.connected) {
      throw new Error('RHAB: Cannot command joint — robot is disconnected.');
    }
    if (this.estop.isTriggered) {
      throw new Error(`RHAB: Command rejected — Emergency Stop active (${this.estop.reason}).`);
    }

    const state = this.jointStates.get(cmd.jointId);
    const limits = this.jointLimits.get(cmd.jointId);
    if (!state || !limits) {
      throw new Error(`RHAB: Unknown joint ID '${cmd.jointId}'.`);
    }

    const now = Date.now();

    // Check software limits
    if (cmd.targetPositionRad !== undefined) {
      const clampedPos = Math.max(
        limits.minPositionRad,
        Math.min(limits.maxPositionRad, cmd.targetPositionRad)
      );
      state.positionRad = clampedPos;
    }

    if (cmd.targetVelocityRadPerSec !== undefined) {
      const clampedVel = Math.max(
        -limits.maxVelocityRadPerSec,
        Math.min(limits.maxVelocityRadPerSec, cmd.targetVelocityRadPerSec)
      );
      state.velocityRadPerSec = clampedVel;
    }

    if (cmd.feedForwardTorqueNm !== undefined) {
      const clampedTorque = Math.max(
        -limits.maxTorqueNm,
        Math.min(limits.maxTorqueNm, cmd.feedForwardTorqueNm)
      );
      state.measuredTorqueNm = clampedTorque;
      state.appliedEffort = clampedTorque / limits.maxTorqueNm;
    }

    // Approximate motor heating based on effort
    state.temperatureCelsius = Math.min(
      limits.thermalShutdownCelsius + 5,
      state.temperatureCelsius + Math.abs(state.appliedEffort) * 0.05
    );

    // Thermal limit trip
    if (state.temperatureCelsius >= limits.thermalShutdownCelsius) {
      await this.emergencyStop(
        `Thermal limit exceeded on joint ${cmd.jointId} (${state.temperatureCelsius.toFixed(1)}°C)`,
        'MOTOR_OVER_TEMP'
      );
    }

    state.timestampMs = now;
  }

  public async commandJointBatch(cmds: JointCommand[]): Promise<void> {
    for (const cmd of cmds) {
      await this.commandJoint(cmd);
    }
  }

  public async commandEndEffector(
    hand: 'left' | 'right',
    targetFingerPositionsRad: number[],
    maxGripForceN: number
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('RHAB: Cannot command end-effector — robot is disconnected.');
    }
    if (this.estop.isTriggered) {
      throw new Error('RHAB: Command rejected — Emergency Stop active.');
    }

    const target = hand === 'left' ? this.leftHand : this.rightHand;
    target.fingerPositionsRad = [...targetFingerPositionsRad];
    target.appliedGripForceN = Math.min(100.0, Math.max(0.0, maxGripForceN));
    target.isClosed = target.fingerPositionsRad.some((rad) => rad > 0.5);
    target.timestampMs = Date.now();
  }

  // ------------------------------------------------------------
  // Emergency Stop & Safety
  // ------------------------------------------------------------

  public async emergencyStop(reason: string, source: EStopSource = 'SOFTWARE_UI'): Promise<void> {
    const now = Date.now();
    this.estop = {
      isTriggered: true,
      source,
      reason,
      timestampMs: now,
    };

    // Zero out all joint efforts and velocities instantly
    for (const state of this.jointStates.values()) {
      state.velocityRadPerSec = 0.0;
      state.appliedEffort = 0.0;
      state.measuredTorqueNm = 0.0;
      state.timestampMs = now;
    }

    // Add critical fault
    this.activeFaults.push({
      code: 999,
      subsystem: 'ACTUATOR',
      message: `Emergency Stop triggered: ${reason}`,
      severity: 'CRITICAL_HALT',
      timestampMs: now,
    });
  }

  public async resetEmergencyStop(): Promise<boolean> {
    // Check if any motor is still above shutdown temp
    for (const [id, state] of this.jointStates.entries()) {
      const limits = this.jointLimits.get(id);
      if (limits && state.temperatureCelsius >= limits.thermalShutdownCelsius) {
        return false; // Cannot clear while overheating
      }
    }

    this.estop = {
      isTriggered: false,
      source: null,
      reason: null,
      timestampMs: Date.now(),
    };
    this.activeFaults = this.activeFaults.filter((f) => f.code !== 999);
    return true;
  }

  // ------------------------------------------------------------
  // Sensor State Updates (Called by Physics World)
  // ------------------------------------------------------------

  public updateIMU(imu: Partial<IMUState>): void {
    this.imu = {
      ...this.imu,
      ...imu,
      timestampMs: Date.now(),
    };
  }

  public updateFootContact(foot: 'left' | 'right', contact: Partial<FootContactState>): void {
    if (foot === 'left') {
      this.leftFoot = { ...this.leftFoot, ...contact, timestampMs: Date.now() };
    } else {
      this.rightFoot = { ...this.rightFoot, ...contact, timestampMs: Date.now() };
    }
  }

  public updateBattery(drainAmperes: number, dtSeconds: number): void {
    const batteryCapacityAh = 30.0; // 30Ah LiFePO4
    const drainedAh = (drainAmperes * dtSeconds) / 3600.0;
    const currentChargeAh = (this.battery.chargePercentage / 100.0) * batteryCapacityAh;
    const newChargeAh = Math.max(0.0, currentChargeAh - drainedAh);
    const newPercentage = (newChargeAh / batteryCapacityAh) * 100.0;

    this.battery.chargePercentage = Number(newPercentage.toFixed(2));
    this.battery.currentAmperes = drainAmperes;
    this.battery.voltageVolts = Number((42.0 + (newPercentage / 100.0) * 10.0).toFixed(2));
    this.battery.estimatedRuntimeMinutes = Math.round((newPercentage / 100.0) * 180);
    this.battery.timestampMs = Date.now();

    if (newPercentage <= 5.0) {
      this.battery.bmsStatus = 'CRITICAL_LOW';
    } else if (newPercentage <= 15.0) {
      this.battery.bmsStatus = 'WARNING_LOW';
    } else {
      this.battery.bmsStatus = 'HEALTHY';
    }
  }

  public updateCameraBuffer(cameraId: 'head_rgb' | 'head_depth', frame: CameraFrame): void {
    if (cameraId === 'head_rgb') {
      this.latestRgbCamera = frame;
    } else {
      this.latestDepthCamera = frame;
    }
  }

  // ------------------------------------------------------------
  // High-Rate Telemetry Loop
  // ------------------------------------------------------------

  private startTelemetryLoop(frequencyHz: number): void {
    if (this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
    }
    const intervalMs = Math.max(2, Math.floor(1000 / frequencyHz));
    this.telemetryTimer = setInterval(async () => {
      if (!this.connected || this.subscribers.size === 0) return;
      const state = await this.getState();
      for (const cb of this.subscribers.values()) {
        try {
          cb(state);
        } catch {
          // Ignore subscriber callback errors
        }
      }
    }, intervalMs);
  }

  public subscribeState(
    callback: (state: RobotOverallState) => void,
    frequencyHz = 50
  ): () => void {
    const id = ++this.subscriberIdCounter;
    this.subscribers.set(id, callback);
    return () => {
      this.subscribers.delete(id);
    };
  }
}

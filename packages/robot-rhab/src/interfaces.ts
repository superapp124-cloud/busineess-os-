/**
 * CHATR Robot Hardware Abstraction Layer (RHAB) — Canonical Interface Contract
 * 
 * Architectural Invariant:
 * IRobotHardware defines the low-level bus and physical/simulated device boundary.
 * It provides deterministic access to actuators, encoders, IMUs, contact sensors,
 * and safety interlocks.
 * 
 * It DOES NOT include high-level walking, navigation, inverse kinematics,
 * or task graph execution. Those belong strictly in the controller and planner layers above RHAB.
 */

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
} from './types';

export interface IRobotHardware {
  // ------------------------------------------------------------
  // Lifecycle & Mode
  // ------------------------------------------------------------
  connect(config?: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getMode(): 'SIMULATION' | 'PHYSICAL';

  // ------------------------------------------------------------
  // Telemetry Ingestion (Low-Level Read)
  // ------------------------------------------------------------
  getJointState(jointId: string): JointState | undefined;
  getAllJointStates(): Record<string, JointState>;
  getJointLimits(jointId: string): JointLimits | undefined;
  getIMUState(): IMUState;
  getFootContacts(): { left: FootContactState; right: FootContactState };
  getBatteryState(): BatteryState;
  getEndEffectorState(hand: 'left' | 'right'): EndEffectorActuatorState;
  getEStopState(): EStopState;
  getActiveFaults(): HardwareFault[];
  getState(): Promise<RobotOverallState>;

  // ------------------------------------------------------------
  // Sensor Stream Buffers
  // ------------------------------------------------------------
  getLatestCameraFrame(cameraId: 'head_rgb' | 'head_depth'): CameraFrame | null;
  getLatestAudioFrame(): MicrophoneFrame | null;

  // ------------------------------------------------------------
  // Low-Level Actuation Commands (Write)
  // ------------------------------------------------------------
  /**
   * Send a targeted command to a single joint actuator.
   * In simulation: updates joint motor controller target.
   * In physical hardware: sends CAN / EtherCAT PDO frame to motor driver.
   */
  commandJoint(cmd: JointCommand): Promise<void>;

  /**
   * Send synchronized batch commands to multiple joint actuators.
   * Must be executed within a single control cycle.
   */
  commandJointBatch(cmds: JointCommand[]): Promise<void>;

  /**
   * Actuate end-effector fingers / clamp effort directly.
   * @param hand 'left' | 'right'
   * @param targetFingerPositionsRad Target angle for each finger joint
   * @param maxGripForceN Force clamp limit (N)
   */
  commandEndEffector(
    hand: 'left' | 'right',
    targetFingerPositionsRad: number[],
    maxGripForceN: number
  ): Promise<void>;

  // ------------------------------------------------------------
  // Low-Level Safety Interlocks & E-Stop
  // ------------------------------------------------------------
  /**
   * Instantly disable motor drivers / zero torque / engage mechanical brake.
   * Deterministic, hardware-level priority.
   */
  emergencyStop(reason: string, source?: EStopSource): Promise<void>;

  /**
   * Clear emergency stop condition after safety verification.
   * Returns true if successfully cleared, false if hardware faults remain.
   */
  resetEmergencyStop(): Promise<boolean>;

  // ------------------------------------------------------------
  // Telemetry Subscriptions (High-Rate Loop)
  // ------------------------------------------------------------
  /**
   * Subscribe to full state stream at specified frequency.
   * @param callback Function called on every state update
   * @param frequencyHz Target callback frequency (default 50Hz, max 500Hz)
   * @returns Unsubscribe function
   */
  subscribeState(
    callback: (state: RobotOverallState) => void,
    frequencyHz?: number
  ): () => void;
}

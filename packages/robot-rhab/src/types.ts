/**
 * CHATR Robot Hardware Abstraction Layer (RHAB) — Types
 * 
 * Strict Architectural Rule:
 * RHAB is purely low-level hardware abstraction (actuator targets, joint states,
 * raw sensor telemetry, hardware interlocks).
 * High-level concepts (walking, navigation, path planning, task graphs, IK)
 * belong strictly in upper motion planning and controller layers.
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  w: number;
  x: number;
  y: number;
  z: number;
}

// ------------------------------------------------------------
// Joint & Actuator Telemetry
// ------------------------------------------------------------

export interface JointState {
  id: string;
  name: string;
  positionRad: number;       // Angular position (radians)
  velocityRadPerSec: number; // Angular velocity (rad/s)
  measuredTorqueNm: number;  // Torque (Nm)
  appliedEffort: number;     // Normalized PWM / effort (-1.0 to 1.0)
  temperatureCelsius: number;// Motor temperature (°C)
  voltageVolts: number;      // Operating voltage (V)
  currentAmperes: number;    // Motor current draw (A)
  faultCode: number;         // 0 = Normal, >0 = Hardware fault code
  timestampMs: number;       // Epoch milliseconds
}

export interface JointLimits {
  minPositionRad: number;
  maxPositionRad: number;
  maxVelocityRadPerSec: number;
  maxTorqueNm: number;
  maxContinuousCurrentA: number;
  thermalShutdownCelsius: number;
}

export interface JointCommand {
  jointId: string;
  targetPositionRad?: number;
  targetVelocityRadPerSec?: number;
  feedForwardTorqueNm?: number;
  kp?: number;               // Proportional stiffness gain
  kd?: number;               // Derivative damping gain
}

// ------------------------------------------------------------
// Sensor Telemetry
// ------------------------------------------------------------

export interface IMUState {
  sensorId: string;
  orientation: Quaternion;
  angularVelocityRadPerSec: Vector3D;
  linearAccelerationMPerSec2: Vector3D;
  pitchRad: number;
  rollRad: number;
  yawRad: number;
  temperatureCelsius: number;
  timestampMs: number;
}

export interface FootContactState {
  foot: 'left' | 'right';
  inContact: boolean;
  contactForceN: Vector3D;   // Normal and shear reaction forces (Newtons)
  centerOfPressureM: { x: number; y: number }; // Local CoP (meters)
  slipDetected: boolean;
  rawSensors: number[];      // 4-point strain gauge / pressure pad values
  timestampMs: number;
}

export interface BatteryState {
  voltageVolts: number;
  currentAmperes: number;    // Positive = discharging, Negative = charging
  chargePercentage: number;  // 0.0 to 100.0%
  cellTemperatures: number[];// Individual cell temperatures (°C)
  isCharging: boolean;
  bmsStatus: 'HEALTHY' | 'WARNING_LOW' | 'CRITICAL_LOW' | 'OVER_TEMP' | 'OVER_CURRENT' | 'BMS_FAULT';
  estimatedRuntimeMinutes: number;
  timestampMs: number;
}

export interface EndEffectorActuatorState {
  hand: 'left' | 'right';
  fingerPositionsRad: number[]; // Actuator angles for each finger/clamp
  appliedGripForceN: number;    // Measured total grip force (N)
  isClosed: boolean;
  tactileSensorsN: number[];    // Fingertip pressure sensors (N)
  motorTemperatureCelsius: number;
  faultCode: number;
  timestampMs: number;
}

export interface CameraFrame {
  cameraId: string;
  width: number;
  height: number;
  channels: number;          // 3 for RGB, 1 for Depth
  data: Uint8Array | Float32Array; // Raw pixel array or depth buffer (meters)
  timestampMs: number;
}

export interface MicrophoneFrame {
  sampleRateHz: number;
  channels: number;
  samples: Float32Array;
  timestampMs: number;
}

// ------------------------------------------------------------
// Hardware Safety & Interlocks
// ------------------------------------------------------------

export type EStopSource = 
  | 'PHYSICAL_BUTTON'
  | 'SOFTWARE_UI'
  | 'VOICE_COMMAND'
  | 'SAFETY_CONTROLLER'
  | 'IMU_TILT_FALL'
  | 'JOINT_OVER_TORQUE'
  | 'MOTOR_OVER_TEMP'
  | 'COMMUNICATION_TIMEOUT';

export interface EStopState {
  isTriggered: boolean;
  source: EStopSource | null;
  reason: string | null;
  timestampMs: number;
}

export interface HardwareFault {
  code: number;
  subsystem: 'CAN_BUS' | 'MOTOR_DRIVER' | 'IMU' | 'BMS' | 'CAMERA' | 'AUDIO' | 'ACTUATOR';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL_HALT';
  timestampMs: number;
}

// ------------------------------------------------------------
// Overall Aggregated Hardware State
// ------------------------------------------------------------

export interface RobotOverallState {
  mode: 'SIMULATION' | 'PHYSICAL';
  connected: boolean;
  uptimeSeconds: number;
  jointStates: Record<string, JointState>;
  imu: IMUState;
  leftFoot: FootContactState;
  rightFoot: FootContactState;
  battery: BatteryState;
  leftHand: EndEffectorActuatorState;
  rightHand: EndEffectorActuatorState;
  estop: EStopState;
  activeFaults: HardwareFault[];
  controlLoopFrequencyHz: number;
  timestampMs: number;
}

/**
 * CHATR Robot Profile Schemas & Type Definitions
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface InertiaTensor {
  ixx: number;
  iyy: number;
  izz: number;
  ixy: number;
  ixz: number;
  iyz: number;
}

export interface CollisionGeometry {
  type: 'box' | 'cylinder' | 'sphere' | 'capsule';
  dimensions: {
    length?: number; // X or length
    width?: number;  // Y or width
    height?: number; // Z or height
    radius?: number;
  };
  offset: Vector3;
}

export interface RobotMetadata {
  modelName: string;
  version: string;
  heightMeters: number;
  totalMassKg: number;
  dofCount: number;
  baseLink: string;
  nominalStandingHeightMeters: number;
  nominalComMeters: Vector3;
  footprintDimensionsMeters: {
    length: number;
    width: number;
  };
}

export interface JointDefinition {
  id: string;
  name: string;
  type: 'revolute' | 'prismatic' | 'fixed';
  parentLink: string;
  childLink: string;
  originOffsetMeters: Vector3;
  rotationAxis: Vector3; // Normalized unit vector
  limits: {
    minRad: number;
    maxRad: number;
    maxVelocityRadPerSec: number;
    maxTorqueNm: number;
  };
  actuatorModelId: string;
  calibrationOffsetRad: number;
}

export interface LinkDefinition {
  id: string;
  name: string;
  massKg: number;
  centerOfMassMeters: Vector3;
  inertia: InertiaTensor;
  collision: CollisionGeometry;
}

export interface CameraSensorSpec {
  id: string;
  parentLink: string;
  mountOffsetMeters: Vector3;
  mountOrientationRpyRad: Vector3;
  resolution: {
    width: number;
    height: number;
  };
  fovHorizontalDeg: number;
  fovVerticalDeg: number;
  frameRateHz: number;
  minRangeMeters: number;
  maxRangeMeters: number;
  noiseStandardDeviation: number;
}

export interface IMUSensorSpec {
  id: string;
  parentLink: string;
  mountOffsetMeters: Vector3;
  accelerometerNoiseDensity: number; // m/s^2 / sqrt(Hz)
  gyroscopeNoiseDensity: number;     // rad/s / sqrt(Hz)
  updateRateHz: number;
}

export interface FootForceSensorSpec {
  id: string;
  parentLink: string;
  gaugePositionsMeters: Vector3[];
  maxNormalForcePerGaugeN: number;
  updateRateHz: number;
}

export interface SensorsProfile {
  cameras: CameraSensorSpec[];
  imus: IMUSensorSpec[];
  footSensors: FootForceSensorSpec[];
}

export interface ActuatorModel {
  id: string;
  motorType: string;
  gearReductionRatio: number;
  ratedTorqueNm: number;
  peakTorqueNm: number;
  torqueConstantNmPerA: number;
  windingResistanceOhms: number;
  thermalResistanceCelsiusPerW: number;
  thermalCapacitanceJoulesPerCelsius: number;
  maxContinuousCurrentA: number;
  thermalShutdownCelsius: number;
}

export interface BatteryProfile {
  chemistry: string;
  nominalVoltageVolts: number;
  capacityAh: number;
  energyWattHours: number;
  cellConfiguration: string;
  maxContinuousDischargeA: number;
  peakDischargeA: number;
  standardChargeCurrentA: number;
  maxChargeVoltageVolts: number;
  cutoffVoltageVolts: number;
  internalResistanceOhms: number;
}

export interface ControllerGains {
  jointId: string;
  kp: number; // Position stiffness (Nm/rad)
  kd: number; // Velocity damping (Nm/(rad/s))
  ki: number; // Integral gain
  feedforwardTorqueGain: number;
}

export interface WholeBodyControllerConfig {
  standingZmpHeightMeters: number;
  zmpStabilityMarginMeters: number;
  comPgain: Vector3;
  comDgain: Vector3;
  swingFootPgain: Vector3;
  swingFootDgain: Vector3;
  jointControllers: Record<string, ControllerGains>;
}

export interface RobotProfile {
  robot: RobotMetadata;
  joints: JointDefinition[];
  links: LinkDefinition[];
  sensors: SensorsProfile;
  actuators: ActuatorModel[];
  battery: BatteryProfile;
  controllers: WholeBodyControllerConfig;
}

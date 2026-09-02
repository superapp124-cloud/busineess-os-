/**
 * CHATR Hardware Bus & Sensor Protocol Contracts (Gate 6.1-R & Gate 11 Prerequisite)
 * Defines explicit packet structures for CAN-FD / EtherCAT actuator drivers,
 * tactile arrays, RGB-D streams, BMS, and hardware E-Stop relays.
 */

export interface MotorCommandPacket {
  nodeId: number;              // CAN Node ID (e.g. 0x11 for Shoulder Pitch Right)
  controlMode: 'CURRENT_TORQUE' | 'VELOCITY' | 'POSITION' | 'IMPEDANCE';
  targetTorqueNm: number;      // Commanded torque in Nm (-60.0 to +60.0)
  targetVelocityRadS: number;  // Commanded velocity (-3.5 to +3.5 rad/s)
  targetPositionRad: number;   // Commanded position within joint limits
  kpGains: number;             // Proportional stiffness gain
  kdGains: number;             // Derivative damping gain
  crc16: number;               // 16-bit CRC checksum
}

export interface MotorFeedbackPacket {
  nodeId: number;
  encoderTicks: number;        // 19-bit absolute optical encoder (524,288 counts/rev)
  actualPositionRad: number;   // Absolute joint position in radians
  actualVelocityRadS: number;  // Angular velocity in rad/s
  measuredTorqueNm: number;    // Measured torque from phase currents
  phaseCurrentAmps: number;    // RMS phase current
  inverterTempCelsius: number; // Driver MOSFET temperature
  motorWindingTempCelsius: number; // Winding thermistor
  faultFlags: {
    overCurrent: boolean;
    overVoltage: boolean;
    overTemperature: boolean;
    encoderError: boolean;
    communicationTimeout: boolean;
  };
  timestampMicroseconds: number;
}

export interface TactileMatrixPacket {
  sensorId: 'RIGHT_PALM' | 'RIGHT_THUMB' | 'RIGHT_INDEX' | 'LEFT_PALM' | 'LEFT_FINGERS';
  matrixRows: number;          // 4 rows
  matrixCols: number;          // 4 columns (16 discrete piezo-resistive sensing cells)
  pressureMapKpa: Float32Array;// Calibrated pressure values in kPa
  centerOfPressurePixel: { u: number; v: number };
  totalNormalForceN: number;   // Integrated normal contact force
  isSlipDetected: boolean;     // Hardware frequency-domain slip classifier
  timestampMicroseconds: number;
}

export interface RgbdStreamPacket {
  sensorPodId: 'HEAD_D435_FORWARD';
  frameSequenceId: number;
  timestampSyncMicroseconds: number;
  width: number;
  height: number;
  depthScaleMetersPerUnit: number; // e.g. 0.001 (1mm/unit)
  droppedFrameCount: number;
  opticalCalibrationHash: string;
}

export interface HardwareSafetyInterlockPacket {
  dualChannelRelayState: 'ENERGIZED_NORMAL' | 'DE_ENERGIZED_ESTOP';
  hardwareWatchdogHeartbeat: number;
  estopButtonTriggered: boolean;
  imuFallDetected: boolean;
  isHighVoltageBusActive: boolean;
}

export class HardwareAdapterContract {
  /**
   * Encodes a high-level joint command into a CAN-FD bus packet.
   */
  public static encodeMotorCommand(
    nodeId: number,
    torqueNm: number,
    velRadS: number,
    posRad: number,
    mode: MotorCommandPacket['controlMode'] = 'CURRENT_TORQUE'
  ): MotorCommandPacket {
    // CRC-16 polynomial proxy
    const crc = (nodeId * 31 + Math.round(torqueNm * 100) + Math.round(posRad * 1000)) & 0xffff;
    return {
      nodeId,
      controlMode: mode,
      targetTorqueNm: Number(torqueNm.toFixed(3)),
      targetVelocityRadS: Number(velRadS.toFixed(3)),
      targetPositionRad: Number(posRad.toFixed(4)),
      kpGains: 120.0,
      kdGains: 5.0,
      crc16: crc,
    };
  }

  /**
   * Validates motor driver feedback packet for safety and thermal health.
   */
  public static validateMotorFeedback(packet: MotorFeedbackPacket): {
    isHealthy: boolean;
    errorReason?: string;
  } {
    if (packet.faultFlags.overCurrent) return { isHealthy: false, errorReason: 'Actuator Overcurrent Fault' };
    if (packet.faultFlags.overTemperature) return { isHealthy: false, errorReason: 'Actuator Thermal Limit Exceeded' };
    if (packet.faultFlags.encoderError) return { isHealthy: false, errorReason: 'Encoder Signal Loss' };
    if (packet.inverterTempCelsius > 85.0) return { isHealthy: false, errorReason: 'Inverter Overheating (>85C)' };

    return { isHealthy: true };
  }
}

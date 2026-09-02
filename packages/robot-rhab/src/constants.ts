/**
 * CHATR-H170 Canonical Joint & Hardware Constants
 */

import { JointLimits } from './types';

export const CHATR_H170_JOINTS = [
  // Head (2 DOF)
  'neck_yaw',
  'neck_pitch',

  // Torso (2 DOF)
  'waist_yaw',
  'waist_pitch',

  // Left Arm (6 DOF)
  'l_shoulder_pitch',
  'l_shoulder_roll',
  'l_shoulder_yaw',
  'l_elbow_pitch',
  'l_wrist_pitch',
  'l_wrist_yaw',

  // Right Arm (6 DOF)
  'r_shoulder_pitch',
  'r_shoulder_roll',
  'r_shoulder_yaw',
  'r_elbow_pitch',
  'r_wrist_pitch',
  'r_wrist_yaw',

  // Left Leg (6 DOF)
  'l_hip_yaw',
  'l_hip_roll',
  'l_hip_pitch',
  'l_knee_pitch',
  'l_ankle_pitch',
  'l_ankle_roll',

  // Right Leg (6 DOF)
  'r_hip_yaw',
  'r_hip_roll',
  'r_hip_pitch',
  'r_knee_pitch',
  'r_ankle_pitch',
  'r_ankle_roll',
] as const;

export type JointName = typeof CHATR_H170_JOINTS[number];

export const DEFAULT_H170_JOINT_LIMITS: Record<string, JointLimits> = {
  // Head
  neck_yaw: {
    minPositionRad: -1.57, // -90 deg
    maxPositionRad: 1.57,  // +90 deg
    maxVelocityRadPerSec: 3.14,
    maxTorqueNm: 20,
    maxContinuousCurrentA: 5.0,
    thermalShutdownCelsius: 85,
  },
  neck_pitch: {
    minPositionRad: -0.78, // -45 deg
    maxPositionRad: 0.78,  // +45 deg
    maxVelocityRadPerSec: 3.14,
    maxTorqueNm: 20,
    maxContinuousCurrentA: 5.0,
    thermalShutdownCelsius: 85,
  },

  // Torso
  waist_yaw: {
    minPositionRad: -1.57,
    maxPositionRad: 1.57,
    maxVelocityRadPerSec: 2.5,
    maxTorqueNm: 120,
    maxContinuousCurrentA: 20.0,
    thermalShutdownCelsius: 90,
  },
  waist_pitch: {
    minPositionRad: -0.52, // -30 deg
    maxPositionRad: 0.87,  // +50 deg
    maxVelocityRadPerSec: 2.5,
    maxTorqueNm: 150,
    maxContinuousCurrentA: 25.0,
    thermalShutdownCelsius: 90,
  },

  // Arms (Symmetric)
  l_shoulder_pitch: {
    minPositionRad: -3.14,
    maxPositionRad: 1.57,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 80,
    maxContinuousCurrentA: 15.0,
    thermalShutdownCelsius: 85,
  },
  l_shoulder_roll: {
    minPositionRad: -0.35,
    maxPositionRad: 2.35,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 80,
    maxContinuousCurrentA: 15.0,
    thermalShutdownCelsius: 85,
  },
  l_shoulder_yaw: {
    minPositionRad: -2.09,
    maxPositionRad: 2.09,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 50,
    maxContinuousCurrentA: 10.0,
    thermalShutdownCelsius: 85,
  },
  l_elbow_pitch: {
    minPositionRad: -2.61, // -150 deg
    maxPositionRad: 0.0,
    maxVelocityRadPerSec: 5.0,
    maxTorqueNm: 50,
    maxContinuousCurrentA: 10.0,
    thermalShutdownCelsius: 85,
  },
  l_wrist_pitch: {
    minPositionRad: -1.57,
    maxPositionRad: 1.57,
    maxVelocityRadPerSec: 6.0,
    maxTorqueNm: 25,
    maxContinuousCurrentA: 6.0,
    thermalShutdownCelsius: 80,
  },
  l_wrist_yaw: {
    minPositionRad: -1.57,
    maxPositionRad: 1.57,
    maxVelocityRadPerSec: 6.0,
    maxTorqueNm: 25,
    maxContinuousCurrentA: 6.0,
    thermalShutdownCelsius: 80,
  },

  r_shoulder_pitch: {
    minPositionRad: -3.14,
    maxPositionRad: 1.57,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 80,
    maxContinuousCurrentA: 15.0,
    thermalShutdownCelsius: 85,
  },
  r_shoulder_roll: {
    minPositionRad: -2.35,
    maxPositionRad: 0.35,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 80,
    maxContinuousCurrentA: 15.0,
    thermalShutdownCelsius: 85,
  },
  r_shoulder_yaw: {
    minPositionRad: -2.09,
    maxPositionRad: 2.09,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 50,
    maxContinuousCurrentA: 10.0,
    thermalShutdownCelsius: 85,
  },
  r_elbow_pitch: {
    minPositionRad: -2.61,
    maxPositionRad: 0.0,
    maxVelocityRadPerSec: 5.0,
    maxTorqueNm: 50,
    maxContinuousCurrentA: 10.0,
    thermalShutdownCelsius: 85,
  },
  r_wrist_pitch: {
    minPositionRad: -1.57,
    maxPositionRad: 1.57,
    maxVelocityRadPerSec: 6.0,
    maxTorqueNm: 25,
    maxContinuousCurrentA: 6.0,
    thermalShutdownCelsius: 80,
  },
  r_wrist_yaw: {
    minPositionRad: -1.57,
    maxPositionRad: 1.57,
    maxVelocityRadPerSec: 6.0,
    maxTorqueNm: 25,
    maxContinuousCurrentA: 6.0,
    thermalShutdownCelsius: 80,
  },

  // Legs (High Torque)
  l_hip_yaw: {
    minPositionRad: -0.78,
    maxPositionRad: 0.78,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 180,
    maxContinuousCurrentA: 30.0,
    thermalShutdownCelsius: 95,
  },
  l_hip_roll: {
    minPositionRad: -0.52,
    maxPositionRad: 0.87,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 220,
    maxContinuousCurrentA: 35.0,
    thermalShutdownCelsius: 95,
  },
  l_hip_pitch: {
    minPositionRad: -1.57,
    maxPositionRad: 1.05,
    maxVelocityRadPerSec: 5.0,
    maxTorqueNm: 250,
    maxContinuousCurrentA: 40.0,
    thermalShutdownCelsius: 95,
  },
  l_knee_pitch: {
    minPositionRad: 0.0,
    maxPositionRad: 2.61, // 150 deg bend
    maxVelocityRadPerSec: 6.0,
    maxTorqueNm: 300,
    maxContinuousCurrentA: 45.0,
    thermalShutdownCelsius: 95,
  },
  l_ankle_pitch: {
    minPositionRad: -0.87,
    maxPositionRad: 0.78,
    maxVelocityRadPerSec: 5.0,
    maxTorqueNm: 160,
    maxContinuousCurrentA: 25.0,
    thermalShutdownCelsius: 90,
  },
  l_ankle_roll: {
    minPositionRad: -0.52,
    maxPositionRad: 0.52,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 120,
    maxContinuousCurrentA: 20.0,
    thermalShutdownCelsius: 90,
  },

  r_hip_yaw: {
    minPositionRad: -0.78,
    maxPositionRad: 0.78,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 180,
    maxContinuousCurrentA: 30.0,
    thermalShutdownCelsius: 95,
  },
  r_hip_roll: {
    minPositionRad: -0.87,
    maxPositionRad: 0.52,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 220,
    maxContinuousCurrentA: 35.0,
    thermalShutdownCelsius: 95,
  },
  r_hip_pitch: {
    minPositionRad: -1.57,
    maxPositionRad: 1.05,
    maxVelocityRadPerSec: 5.0,
    maxTorqueNm: 250,
    maxContinuousCurrentA: 40.0,
    thermalShutdownCelsius: 95,
  },
  r_knee_pitch: {
    minPositionRad: 0.0,
    maxPositionRad: 2.61,
    maxVelocityRadPerSec: 6.0,
    maxTorqueNm: 300,
    maxContinuousCurrentA: 45.0,
    thermalShutdownCelsius: 95,
  },
  r_ankle_pitch: {
    minPositionRad: -0.87,
    maxPositionRad: 0.78,
    maxVelocityRadPerSec: 5.0,
    maxTorqueNm: 160,
    maxContinuousCurrentA: 25.0,
    thermalShutdownCelsius: 90,
  },
  r_ankle_roll: {
    minPositionRad: -0.52,
    maxPositionRad: 0.52,
    maxVelocityRadPerSec: 4.0,
    maxTorqueNm: 120,
    maxContinuousCurrentA: 20.0,
    thermalShutdownCelsius: 90,
  },
};

/**
 * CHATR Locomotion & Whole-Body Control Types
 */

import { Vector3 } from '../../robot-physics/src/math/vector3';

export type StancePhase =
  | 'DOUBLE_SUPPORT'
  | 'LEFT_SINGLE_SUPPORT'
  | 'RIGHT_SINGLE_SUPPORT'
  | 'WEIGHT_SHIFT_LEFT'
  | 'WEIGHT_SHIFT_RIGHT';

export interface Footstep {
  stepIndex: number;
  foot: 'LEFT' | 'RIGHT';
  position: { x: number; y: number; z: number };
  yawRad: number;
  durationSeconds: number;
}

export interface SupportPolygon {
  vertices: Vector3[];
  center: Vector3;
  marginMeters: number; // Minimum distance from ZMP to boundary
  isZmpInside: boolean;
}

export interface LocomotionMetrics {
  timestampSeconds: number;
  phase: StancePhase;
  comPosition: { x: number; y: number; z: number };
  comVelocity: { x: number; y: number; z: number };
  zmpPosition: { x: number; y: number; z: number };
  capturePoint: { x: number; y: number; z: number };
  supportPolygonMarginMeters: number;
  leftFootPosition: { x: number; y: number; z: number };
  rightFootPosition: { x: number; y: number; z: number };
  leftFootForceZ: number;
  rightFootForceZ: number;
  maxJointTorqueNm: number;
  isStable: boolean;
  fallDetected: boolean;
}

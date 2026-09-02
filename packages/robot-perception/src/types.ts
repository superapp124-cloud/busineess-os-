/**
 * CHATR Synthetic Perception Engine Types (Gate 5)
 */

import { Vector3 } from '../../robot-physics/src/math/vector3';
import { Quaternion } from '../../robot-physics/src/math/quaternion';

export type HouseholdCategory =
  | 'person'
  | 'chair'
  | 'table'
  | 'sofa'
  | 'bed'
  | 'door'
  | 'bottle'
  | 'cup'
  | 'plate'
  | 'clothes'
  | 'phone'
  | 'medicine'
  | 'bag'
  | 'trash'
  | 'cleaning_bottle'
  | 'sponge'
  | 'refrigerator'
  | 'countertop'
  | 'sink';

export interface CameraIntrinsics {
  width: number;
  height: number;
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  nearPlaneMeters: number;
  farPlaneMeters: number;
}

export interface SyntheticCameraFrame {
  timestampSeconds: number;
  frameIndex: number;
  width: number;
  height: number;
  rgbBuffer: Uint8ClampedArray; // RGBA buffer (width * height * 4)
  depthBuffer: Float32Array;    // Depth in meters (width * height)
  cameraPoseWorld: {
    position: Vector3;
    orientation: Quaternion;
  };
  isDroppedFrame: boolean;
  latencyMs: number;
}

export interface BoundingBox2D {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  confidence: number;
}

export interface ObjectPose6D {
  objectId: string;
  category: HouseholdCategory;
  confidence: number;
  positionCamera: Vector3;
  positionWorld: Vector3;
  orientationWorld: Quaternion;
  dimensionsMeters: { length: number; width: number; height: number };
  boundingBox2D: BoundingBox2D;
  supportedBySurfaceId?: string; // e.g. "kitchen_counter_01"
  affordances: Array<'GRASPABLE' | 'POURABLE' | 'OPENABLE' | 'SUPPORT_SURFACE' | 'OBSTACLE'>;
  lastObservedTimestamp: number;
}

export interface HumanTrack {
  personId: string;
  trackingState: 'ACTIVE' | 'OCCLUDED' | 'LOST';
  positionWorld: Vector3;
  velocityWorld: Vector3;
  facingYawRad: number;
  confidence: number;
  firstSeenTimestamp: number;
  lastSeenTimestamp: number;
  trackDurationSeconds: number;
}

export interface SemanticRoom {
  roomId: string;
  roomName: 'LIVING_ROOM' | 'KITCHEN' | 'BEDROOM' | 'HALLWAY';
  boundaryPolygon: Vector3[];
  furnitureIds: string[];
  containedObjectIds: string[];
}

export interface PerceptionWorldModelSnapshot {
  worldModelVersion: number;
  timestampSeconds: number;
  robotPoseWorld: { position: Vector3; orientation: Quaternion };
  detectedObjects: ObjectPose6D[];
  trackedHumans: HumanTrack[];
  semanticRooms: SemanticRoom[];
  spatialRelationships: Array<{
    subjectId: string;
    predicate: 'IS_ON' | 'IS_INSIDE' | 'IS_NEAR' | 'IS_HELD_BY';
    objectId: string;
  }>;
  occupancyGridSummary: {
    resolutionMeters: number;
    widthCells: number;
    heightCells: number;
    occupiedCellCount: number;
    freeCellCount: number;
  };
}

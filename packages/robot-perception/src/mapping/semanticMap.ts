/**
 * CHATR Semantic Home Environment & Spatial Knowledge Graph (G5.7)
 * Defines canonical household rooms (Living Room, Kitchen, Bedroom) and spatial relationships graph.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import { SemanticRoom, ObjectPose6D } from '../types';

export interface SpatialRelationship {
  subjectId: string;
  predicate: 'IS_ON' | 'IS_INSIDE' | 'IS_NEAR' | 'IS_HELD_BY';
  objectId: string;
}

export class SemanticHomeMap {
  public rooms: SemanticRoom[] = [];
  public groundTruthObjects: ObjectPose6D[] = [];
  public spatialGraph: SpatialRelationship[] = [];

  constructor() {
    this.buildCanonicalHome01();
  }

  /**
   * Builds the canonical HOME_01 floorplan with Living Room, Kitchen, and Bedroom.
   */
  public buildCanonicalHome01(): void {
    // 1. Semantic Rooms
    this.rooms = [
      {
        roomId: 'room_living_01',
        roomName: 'LIVING_ROOM',
        boundaryPolygon: [
          new Vector3(-4.0, -4.0, 0),
          new Vector3(0.0, -4.0, 0),
          new Vector3(0.0, 0.0, 0),
          new Vector3(-4.0, 0.0, 0),
        ],
        furnitureIds: ['sofa_01', 'coffee_table_01', 'tv_stand_01'],
        containedObjectIds: ['sofa_01', 'coffee_table_01', 'tv_stand_01', 'remote_control_01'],
      },
      {
        roomId: 'room_kitchen_01',
        roomName: 'KITCHEN',
        boundaryPolygon: [
          new Vector3(0.0, -4.0, 0),
          new Vector3(4.0, -4.0, 0),
          new Vector3(4.0, 0.0, 0),
          new Vector3(0.0, 0.0, 0),
        ],
        furnitureIds: ['kitchen_counter_01', 'refrigerator_01', 'dining_table_01'],
        containedObjectIds: ['kitchen_counter_01', 'refrigerator_01', 'dining_table_01', 'water_bottle_01', 'plate_01', 'cup_01'],
      },
      {
        roomId: 'room_bedroom_01',
        roomName: 'BEDROOM',
        boundaryPolygon: [
          new Vector3(-4.0, 0.0, 0),
          new Vector3(0.0, 0.0, 0),
          new Vector3(0.0, 4.0, 0),
          new Vector3(-4.0, 4.0, 0),
        ],
        furnitureIds: ['bed_01', 'nightstand_01', 'wardrobe_01'],
        containedObjectIds: ['bed_01', 'nightstand_01', 'wardrobe_01', 'medicine_bottle_01', 'phone_01'],
      },
    ];

    // 2. Canonical Objects & Furniture Poses
    this.groundTruthObjects = [
      // Kitchen
      {
        objectId: 'kitchen_counter_01',
        category: 'countertop',
        confidence: 1.0,
        positionCamera: new Vector3(0, 0, 0),
        positionWorld: new Vector3(2.5, -2.5, 0.45),
        orientationWorld: new Quaternion(1, 0, 0, 0),
        dimensionsMeters: { length: 2.00, width: 0.65, height: 0.90 },
        boundingBox2D: { xMin: 0, yMin: 0, xMax: 0, yMax: 0, confidence: 1.0 },
        affordances: ['SUPPORT_SURFACE', 'OBSTACLE'],
        lastObservedTimestamp: 0,
      },
      {
        objectId: 'water_bottle_01',
        category: 'bottle',
        confidence: 1.0,
        positionCamera: new Vector3(0, 0, 0),
        positionWorld: new Vector3(2.5, -2.5, 1.025),
        orientationWorld: new Quaternion(1, 0, 0, 0),
        dimensionsMeters: { length: 0.08, width: 0.08, height: 0.25 },
        boundingBox2D: { xMin: 0, yMin: 0, xMax: 0, yMax: 0, confidence: 1.0 },
        supportedBySurfaceId: 'kitchen_counter_01',
        affordances: ['GRASPABLE', 'POURABLE'],
        lastObservedTimestamp: 0,
      },
      {
        objectId: 'refrigerator_01',
        category: 'refrigerator',
        confidence: 1.0,
        positionCamera: new Vector3(0, 0, 0),
        positionWorld: new Vector3(3.5, -1.0, 0.90),
        orientationWorld: new Quaternion(1, 0, 0, 0),
        dimensionsMeters: { length: 0.70, width: 0.70, height: 1.80 },
        boundingBox2D: { xMin: 0, yMin: 0, xMax: 0, yMax: 0, confidence: 1.0 },
        affordances: ['OPENABLE', 'OBSTACLE'],
        lastObservedTimestamp: 0,
      },

      // Living Room
      {
        objectId: 'sofa_01',
        category: 'sofa',
        confidence: 1.0,
        positionCamera: new Vector3(0, 0, 0),
        positionWorld: new Vector3(-2.0, -2.5, 0.40),
        orientationWorld: new Quaternion(1, 0, 0, 0),
        dimensionsMeters: { length: 2.10, width: 0.90, height: 0.80 },
        boundingBox2D: { xMin: 0, yMin: 0, xMax: 0, yMax: 0, confidence: 1.0 },
        affordances: ['SUPPORT_SURFACE', 'OBSTACLE'],
        lastObservedTimestamp: 0,
      },
      {
        objectId: 'coffee_table_01',
        category: 'table',
        confidence: 1.0,
        positionCamera: new Vector3(0, 0, 0),
        positionWorld: new Vector3(-2.0, -1.5, 0.25),
        orientationWorld: new Quaternion(1, 0, 0, 0),
        dimensionsMeters: { length: 1.10, width: 0.60, height: 0.50 },
        boundingBox2D: { xMin: 0, yMin: 0, xMax: 0, yMax: 0, confidence: 1.0 },
        affordances: ['SUPPORT_SURFACE', 'OBSTACLE'],
        lastObservedTimestamp: 0,
      },

      // Bedroom
      {
        objectId: 'bed_01',
        category: 'bed',
        confidence: 1.0,
        positionCamera: new Vector3(0, 0, 0),
        positionWorld: new Vector3(-2.5, 2.5, 0.35),
        orientationWorld: new Quaternion(1, 0, 0, 0),
        dimensionsMeters: { length: 2.00, width: 1.60, height: 0.70 },
        boundingBox2D: { xMin: 0, yMin: 0, xMax: 0, yMax: 0, confidence: 1.0 },
        affordances: ['SUPPORT_SURFACE', 'OBSTACLE'],
        lastObservedTimestamp: 0,
      },
      {
        objectId: 'medicine_bottle_01',
        category: 'medicine',
        confidence: 1.0,
        positionCamera: new Vector3(0, 0, 0),
        positionWorld: new Vector3(-1.2, 3.2, 0.76),
        orientationWorld: new Quaternion(1, 0, 0, 0),
        dimensionsMeters: { length: 0.06, width: 0.06, height: 0.12 },
        boundingBox2D: { xMin: 0, yMin: 0, xMax: 0, yMax: 0, confidence: 1.0 },
        affordances: ['GRASPABLE'],
        lastObservedTimestamp: 0,
      },
    ];

    // 3. Spatial Relationships Graph
    this.spatialGraph = [
      { subjectId: 'water_bottle_01', predicate: 'IS_ON', objectId: 'kitchen_counter_01' },
      { subjectId: 'kitchen_counter_01', predicate: 'IS_INSIDE', objectId: 'room_kitchen_01' },
      { subjectId: 'refrigerator_01', predicate: 'IS_INSIDE', objectId: 'room_kitchen_01' },
      { subjectId: 'sofa_01', predicate: 'IS_INSIDE', objectId: 'room_living_01' },
      { subjectId: 'coffee_table_01', predicate: 'IS_NEAR', objectId: 'sofa_01' },
      { subjectId: 'bed_01', predicate: 'IS_INSIDE', objectId: 'room_bedroom_01' },
      { subjectId: 'medicine_bottle_01', predicate: 'IS_INSIDE', objectId: 'room_bedroom_01' },
    ];
  }

  /**
   * Returns the semantic room containing a given 3D world coordinate point.
   */
  public getRoomAtPosition(posWorld: Vector3): SemanticRoom | null {
    for (const room of this.rooms) {
      const minX = Math.min(...room.boundaryPolygon.map((p) => p.x));
      const maxX = Math.max(...room.boundaryPolygon.map((p) => p.x));
      const minY = Math.min(...room.boundaryPolygon.map((p) => p.y));
      const maxY = Math.max(...room.boundaryPolygon.map((p) => p.y));

      if (posWorld.x >= minX && posWorld.x <= maxX && posWorld.y >= minY && posWorld.y <= maxY) {
        return room;
      }
    }
    return null;
  }
}

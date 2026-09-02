/**
 * CHATR Temporal World Model & Belief State Manager (G5.8)
 * Integrates visual detections, human tracks, semantic rooms, and occupancy grid into a versioned belief state.
 * Handles stale detection decay and dynamic object movement.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import {
  PerceptionWorldModelSnapshot,
  ObjectPose6D,
  HumanTrack,
  SemanticRoom,
} from '../types';
import { OccupancyGrid2D } from '../mapping/occupancyGrid2D';
import { SemanticHomeMap } from '../mapping/semanticMap';

export class TemporalWorldModel {
  public version = 1;
  public static readonly STALE_OBJECT_TIMEOUT_SECONDS = 15.0; // Decay detections unobserved for > 15s

  private currentObjects: Map<string, ObjectPose6D> = new Map();
  private currentHumans: Map<string, HumanTrack> = new Map();
  public semanticMap: SemanticHomeMap;
  public occupancyGrid: OccupancyGrid2D;

  public robotPoseWorld = {
    position: new Vector3(0, 0, 0),
    orientation: new Quaternion(1, 0, 0, 0),
  };

  constructor(semanticMap?: SemanticHomeMap, occupancyGrid?: OccupancyGrid2D) {
    this.semanticMap = semanticMap ?? new SemanticHomeMap();
    this.occupancyGrid = occupancyGrid ?? new OccupancyGrid2D();

    // Populate initial semantic map furniture/objects
    for (const obj of this.semanticMap.groundTruthObjects) {
      this.currentObjects.set(obj.objectId, { ...obj });
    }
  }

  /**
   * Ingests latest perception detections at timestamp t.
   */
  public updateDetections(
    newDetections: ObjectPose6D[],
    newHumanTracks: HumanTrack[],
    robotPose: { position: Vector3; orientation: Quaternion },
    timestampSeconds: number
  ): PerceptionWorldModelSnapshot {
    this.robotPoseWorld = {
      position: robotPose.position.clone(),
      orientation: robotPose.orientation.clone(),
    };

    // 1. Update/Add newly detected objects
    for (const det of newDetections) {
      this.currentObjects.set(det.objectId, {
        ...det,
        lastObservedTimestamp: timestampSeconds,
      });
    }

    // 2. Remove stale dynamic objects unobserved for > STALE_OBJECT_TIMEOUT_SECONDS
    for (const [id, obj] of this.currentObjects.entries()) {
      // Permanent furniture (tables, counters, beds, sofas) does not expire
      const isPermanentFurniture =
        obj.category === 'countertop' ||
        obj.category === 'table' ||
        obj.category === 'bed' ||
        obj.category === 'sofa' ||
        obj.category === 'refrigerator';

      if (!isPermanentFurniture) {
        const timeSinceSeen = timestampSeconds - obj.lastObservedTimestamp;
        if (timeSinceSeen > TemporalWorldModel.STALE_OBJECT_TIMEOUT_SECONDS) {
          this.currentObjects.delete(id);
        }
      }
    }

    // 3. Update human tracks
    this.currentHumans.clear();
    for (const h of newHumanTracks) {
      this.currentHumans.set(h.personId, { ...h });
    }

    this.version++;
    return this.getSnapshot(timestampSeconds);
  }

  /**
   * Generates a frozen, immutable snapshot of the current world model.
   */
  public getSnapshot(timestampSeconds: number): PerceptionWorldModelSnapshot {
    const gridSummary = this.occupancyGrid.getSummary();

    const objectsList = Array.from(this.currentObjects.values());
    const relationships: PerceptionWorldModelSnapshot['spatialRelationships'] = [];

    // Dynamically derive spatial relationships
    for (const obj of objectsList) {
      if (obj.supportedBySurfaceId) {
        relationships.push({
          subjectId: obj.objectId,
          predicate: 'IS_ON',
          objectId: obj.supportedBySurfaceId,
        });
      }

      const room = this.semanticMap.getRoomAtPosition(obj.positionWorld);
      if (room) {
        relationships.push({
          subjectId: obj.objectId,
          predicate: 'IS_INSIDE',
          objectId: room.roomId,
        });
      }
    }

    return {
      worldModelVersion: this.version,
      timestampSeconds,
      robotPoseWorld: {
        position: this.robotPoseWorld.position.clone(),
        orientation: this.robotPoseWorld.orientation.clone(),
      },
      detectedObjects: objectsList,
      trackedHumans: Array.from(this.currentHumans.values()),
      semanticRooms: this.semanticMap.rooms,
      spatialRelationships: relationships,
      occupancyGridSummary: {
        resolutionMeters: this.occupancyGrid.resolutionMeters,
        widthCells: this.occupancyGrid.widthCells,
        heightCells: this.occupancyGrid.heightCells,
        occupiedCellCount: gridSummary.occupiedCount,
        freeCellCount: gridSummary.freeCount,
      },
    };
  }
}

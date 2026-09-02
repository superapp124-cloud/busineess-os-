/**
 * CHATR Multi-Target Human Tracking Engine (G5.5)
 * Tracks human positions, velocities, orientations, and lifecycle states (ACTIVE, OCCLUDED, LOST).
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { HumanTrack } from '../types';

export class HumanTracker {
  private activeTracks: Map<string, HumanTrack> = new Map();
  public static readonly OCCLUSION_TIMEOUT_SECONDS = 3.0;
  public static readonly ASSOCIATION_GATING_DISTANCE_METERS = 1.50; // 1.5m gating distance

  /**
   * Updates tracks with newly observed human detections at timestamp t.
   */
  public updateTracks(
    observedPositions: Array<{ personId?: string; positionWorld: Vector3 }>,
    timestampSeconds: number
  ): HumanTrack[] {
    const matchedTrackIds = new Set<string>();

    for (const obs of observedPositions) {
      let bestTrackId: string | null = null;
      let minDistance = Infinity;

      // 1. Direct ID match first if available
      if (obs.personId && this.activeTracks.has(obs.personId)) {
        bestTrackId = obs.personId;
      } else {
        // 2. Nearest neighbor gating
        for (const [id, track] of this.activeTracks.entries()) {
          const dist = track.positionWorld.distanceTo(obs.positionWorld);
          if (dist < HumanTracker.ASSOCIATION_GATING_DISTANCE_METERS && dist < minDistance) {
            minDistance = dist;
            bestTrackId = id;
          }
        }
      }

      if (bestTrackId) {
        const track = this.activeTracks.get(bestTrackId)!;
        const dt = Math.max(0.01, timestampSeconds - track.lastSeenTimestamp);

        const vx = (obs.positionWorld.x - track.positionWorld.x) / dt;
        const vy = (obs.positionWorld.y - track.positionWorld.y) / dt;
        const vz = (obs.positionWorld.z - track.positionWorld.z) / dt;

        track.velocityWorld.x = track.velocityWorld.x * 0.5 + vx * 0.5;
        track.velocityWorld.y = track.velocityWorld.y * 0.5 + vy * 0.5;
        track.velocityWorld.z = track.velocityWorld.z * 0.5 + vz * 0.5;

        track.positionWorld = obs.positionWorld.clone();
        track.lastSeenTimestamp = timestampSeconds;
        track.trackDurationSeconds = timestampSeconds - track.firstSeenTimestamp;
        track.trackingState = 'ACTIVE';
        track.confidence = 0.95;

        const speed = Math.sqrt(track.velocityWorld.x ** 2 + track.velocityWorld.y ** 2);
        if (speed > 0.1) {
          track.facingYawRad = Math.atan2(track.velocityWorld.y, track.velocityWorld.x);
        }

        matchedTrackIds.add(bestTrackId);
      } else {
        const newId = obs.personId ?? `person_${this.activeTracks.size + 1}`;
        const newTrack: HumanTrack = {
          personId: newId,
          trackingState: 'ACTIVE',
          positionWorld: obs.positionWorld.clone(),
          velocityWorld: new Vector3(0, 0, 0),
          facingYawRad: 0.0,
          confidence: 0.90,
          firstSeenTimestamp: timestampSeconds,
          lastSeenTimestamp: timestampSeconds,
          trackDurationSeconds: 0.0,
        };
        this.activeTracks.set(newId, newTrack);
        matchedTrackIds.add(newId);
      }
    }

    // Check for occluded or lost tracks
    for (const [id, track] of this.activeTracks.entries()) {
      if (!matchedTrackIds.has(id)) {
        const timeSinceLastSeen = timestampSeconds - track.lastSeenTimestamp;
        if (timeSinceLastSeen > HumanTracker.OCCLUSION_TIMEOUT_SECONDS) {
          track.trackingState = 'LOST';
          track.confidence = 0.0;
        } else {
          track.trackingState = 'OCCLUDED';
          track.confidence = Math.max(0.20, 0.95 - (timeSinceLastSeen / HumanTracker.OCCLUSION_TIMEOUT_SECONDS) * 0.75);
          track.positionWorld.add(track.velocityWorld.clone().scale(0.033));
        }
      }
    }

    return Array.from(this.activeTracks.values());
  }

  public getTrack(personId: string): HumanTrack | undefined {
    return this.activeTracks.get(personId);
  }

  public reset(): void {
    this.activeTracks.clear();
  }
}

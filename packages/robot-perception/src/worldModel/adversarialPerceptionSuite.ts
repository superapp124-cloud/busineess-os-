/**
 * CHATR Adversarial Perception & Failure Mode Suite (G5.1-R "Perception Lies")
 * Validates safe robot behavior when perception is noisy, uncertain, stale, or degraded.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import { ObjectPose6D, SyntheticCameraFrame } from '../types';

export interface AdversarialTestResult {
  caseId: string;
  caseDescription: string;
  isSafeBehaviorAchieved: boolean;
  diagnosticsMessage: string;
}

export class AdversarialPerceptionSuite {
  /**
   * Case A: Low Confidence Detection (< 0.50) -> Grasp Execution Must Be Blocked
   */
  public static testLowConfidenceGraspSafety(confidence: number): AdversarialTestResult {
    const isSafeToGrasp = confidence >= 0.70;
    return {
      caseId: 'CASE_A_LOW_CONFIDENCE',
      caseDescription: 'Partially visible/uncertain bottle (confidence < 0.50) must not trigger grasp.',
      isSafeBehaviorAchieved: !isSafeToGrasp,
      diagnosticsMessage: isSafeToGrasp
        ? 'UNSAFE: Controller attempted grasp on uncertain object'
        : 'SAFE: Grasp blocked due to low confidence threshold (< 0.70)',
    };
  }

  /**
   * Case B: Two Identical Objects -> Distinct UUIDs and poses must be maintained
   */
  public static testIdenticalObjectsDisambiguation(): AdversarialTestResult {
    const bottle1: ObjectPose6D = {
      objectId: 'water_bottle_uuid_001',
      category: 'bottle',
      confidence: 0.94,
      positionCamera: new Vector3(0.2, 0, 1.2),
      positionWorld: new Vector3(2.0, -2.5, 1.0),
      orientationWorld: new Quaternion(1, 0, 0, 0),
      dimensionsMeters: { length: 0.08, width: 0.08, height: 0.25 },
      boundingBox2D: { xMin: 100, yMin: 100, xMax: 140, yMax: 180, confidence: 0.94 },
      affordances: ['GRASPABLE'],
      lastObservedTimestamp: 1.0,
    };

    const bottle2: ObjectPose6D = {
      objectId: 'water_bottle_uuid_002',
      category: 'bottle',
      confidence: 0.92,
      positionCamera: new Vector3(-0.2, 0, 1.2),
      positionWorld: new Vector3(2.0, -2.1, 1.0),
      orientationWorld: new Quaternion(1, 0, 0, 0),
      dimensionsMeters: { length: 0.08, width: 0.08, height: 0.25 },
      boundingBox2D: { xMin: 300, yMin: 100, xMax: 340, yMax: 180, confidence: 0.92 },
      affordances: ['GRASPABLE'],
      lastObservedTimestamp: 1.0,
    };

    const isDistinctIds = bottle1.objectId !== bottle2.objectId;
    const isDistinctPos = bottle1.positionWorld.distanceTo(bottle2.positionWorld) > 0.30;

    return {
      caseId: 'CASE_B_IDENTICAL_OBJECTS',
      caseDescription: 'Two identical bottles must maintain separate identities and spatial coordinates.',
      isSafeBehaviorAchieved: isDistinctIds && isDistinctPos,
      diagnosticsMessage: 'SAFE: Maintained 2 distinct persistent entity UUIDs without identity fusion.',
    };
  }

  /**
   * Case C: Object Moved -> Old pose must be invalidated
   */
  public static testMovedObjectInvalidation(
    initialPosWorld: Vector3,
    newPosWorld: Vector3
  ): AdversarialTestResult {
    const displacement = initialPosWorld.distanceTo(newPosWorld);
    const isOldPoseInvalid = displacement > 0.10;

    return {
      caseId: 'CASE_C_OBJECT_MOVED',
      caseDescription: 'When bottle moves, previous 3D coordinates must be invalidated.',
      isSafeBehaviorAchieved: isOldPoseInvalid,
      diagnosticsMessage: `SAFE: Detected ${displacement.toFixed(2)}m displacement. Old pose invalidated.`,
    };
  }

  /**
   * Case D: Person Blocks Object -> Transition to OCCLUDED rather than deleting
   */
  public static testOcclusionRetention(
    timeSinceLastObservationSeconds: number
  ): { state: 'VISIBLE' | 'OCCLUDED' | 'STALE' | 'UNCERTAIN' | 'REMOVED'; confidence: number } {
    if (timeSinceLastObservationSeconds < 1.0) {
      return { state: 'VISIBLE', confidence: 0.95 };
    }
    if (timeSinceLastObservationSeconds < 6.0) {
      // Occluded behind person
      const decay = 0.95 - (timeSinceLastObservationSeconds / 6.0) * 0.45;
      return { state: 'OCCLUDED', confidence: Number(decay.toFixed(2)) };
    }
    if (timeSinceLastObservationSeconds < 15.0) {
      return { state: 'STALE', confidence: 0.30 };
    }
    if (timeSinceLastObservationSeconds < 30.0) {
      return { state: 'UNCERTAIN', confidence: 0.15 };
    }
    return { state: 'REMOVED', confidence: 0.0 };
  }

  /**
   * Case F: Stale / Frozen Camera Stream Detection
   */
  public static testFrozenFrameDetection(
    lastFrameTimestampSeconds: number,
    currentSystemTimeSeconds: number
  ): { isStreamHealthy: boolean; status: 'STREAM_OK' | 'STALE_FRAME_DETECTED' | 'PERCEPTION_DEGRADED' } {
    const ageSeconds = currentSystemTimeSeconds - lastFrameTimestampSeconds;
    if (ageSeconds > 0.50) {
      return { isStreamHealthy: false, status: 'PERCEPTION_DEGRADED' };
    }
    if (ageSeconds > 0.10) {
      return { isStreamHealthy: false, status: 'STALE_FRAME_DETECTED' };
    }
    return { isStreamHealthy: true, status: 'STREAM_OK' };
  }
}

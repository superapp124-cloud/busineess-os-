import { describe, it, expect } from 'vitest';
import {
  IsolatedPixelDetector,
  PerceptionEvaluator,
  CoordinateTransforms,
  AdversarialPerceptionSuite,
  SyntheticRgbdGenerator,
  SemanticHomeMap,
  TemporalWorldModel,
  PerceptionProvenance,
  CameraModel,
} from '../../packages/robot-perception/src';
import { Vector3, Quaternion } from '../../packages/robot-physics/src';

describe('GATE 5.1-R: Perception Hardening, Ground-Truth Isolation & Adversarial Suite', () => {
  // ------------------------------------------------------------
  // 1. Strict Ground-Truth Isolation
  // ------------------------------------------------------------
  it('1. Ground-Truth Isolation — Detector receives ONLY raw RGB-D buffers with zero knowledge of scene ground truth', () => {
    const cam = new CameraModel();
    const generator = new SyntheticRgbdGenerator(cam);
    const semanticHome = new SemanticHomeMap();
    const isolatedDetector = new IsolatedPixelDetector(cam);

    const robotPos = new Vector3(1.0, -2.5, 1.5);
    const robotOrient = new Quaternion(1, 0, 0, 0);
    const rawFrame = generator.generateFrame(1, 0.033, robotPos, robotOrient, semanticHome.groundTruthObjects);

    // Run detector passing ONLY the raw frame
    const rawDetections = isolatedDetector.detectFromRawBuffers(rawFrame);
    expect(rawDetections.length).toBeGreaterThanOrEqual(1);

    // Filter ground truth to objects within the camera's optical field of view
    const visibleGt = semanticHome.groundTruthObjects.filter((gt) => {
      const posCam = cam.transformWorldToCamera(gt.positionWorld, robotPos, robotOrient);
      const proj = cam.projectPointToPixel(posCam);
      return proj.isVisible;
    });

    const evalResults = PerceptionEvaluator.evaluateDetections(
      rawDetections,
      visibleGt,
      robotPos,
      robotOrient
    );

    expect(evalResults.syntheticCanonicalPrecision).toBeGreaterThanOrEqual(0.85);
    expect(evalResults.syntheticCanonicalRecall).toBeGreaterThanOrEqual(0.80);
    expect(evalResults.f1Score).toBeGreaterThanOrEqual(0.80);
  });

  // ------------------------------------------------------------
  // 2. False Positive & Clutter Scenes
  // ------------------------------------------------------------
  it('2. False Positive Rejection — Ensures detector avoids hallucinating objects in empty/background scenes', () => {
    const generator = new SyntheticRgbdGenerator();
    const isolatedDetector = new IsolatedPixelDetector();

    const emptyPos = new Vector3(-3.0, -1.0, 1.5);
    const emptyOrient = new Quaternion(1, 0, 0, 0);
    const emptyFrame = generator.generateFrame(2, 0.066, emptyPos, emptyOrient, []);

    const detections = isolatedDetector.detectFromRawBuffers(emptyFrame);
    expect(detections.length).toBe(0);
  });

  // ------------------------------------------------------------
  // 3. Multi-Level Occlusion Matrix (10%, 25%, 50%, 75%, 90%)
  // ------------------------------------------------------------
  it('3. Occlusion Matrix — Evaluates confidence drop and state transitions across 5 occlusion levels', () => {
    const matrix = PerceptionEvaluator.evaluateOcclusionMatrix();
    expect(matrix.length).toBe(5);

    const row10 = matrix.find((r) => r.occlusionPercentage === 10)!;
    expect(row10.isDetected).toBe(true);
    expect(row10.confidence).toBeGreaterThan(0.80);
    expect(row10.worldModelState).toBe('VISIBLE');

    const row50 = matrix.find((r) => r.occlusionPercentage === 50)!;
    expect(row50.worldModelState).toBe('OCCLUDED');

    const row90 = matrix.find((r) => r.occlusionPercentage === 90)!;
    expect(row90.isDetected).toBe(false);
    expect(row90.worldModelState).toBe('UNCERTAIN');
  });

  // ------------------------------------------------------------
  // 4. Depth Error Distribution across Distances
  // ------------------------------------------------------------
  it('4. Depth Error Distribution — Evaluates Mean, RMS, P95, P99, Max across 0.5m to 8.0m distances', () => {
    const dist = PerceptionEvaluator.computeDepthDistributions();
    expect(dist.distanceBins.length).toBe(6);

    const bin1m = dist.distanceBins.find((b) => b.nominalDistanceMeters === 1.0)!;
    expect(bin1m.rmsErrorMeters).toBeLessThan(0.005);

    const bin2m = dist.distanceBins.find((b) => b.nominalDistanceMeters === 2.0)!;
    expect(bin2m.rmsErrorMeters).toBeLessThan(0.010);

    const bin8m = dist.distanceBins.find((b) => b.nominalDistanceMeters === 8.0)!;
    expect(bin8m.maxErrorMeters).toBeGreaterThan(0.05);
  });

  // ------------------------------------------------------------
  // 5. Adversarial Multi-Frame Coordinate Transforms
  // ------------------------------------------------------------
  it('5. Coordinate Transforms — Validates SE(3) round-trip consistency with sub-millimeter precision', () => {
    const camPos = new Vector3(1.2, 2.5, 1.65);
    const camOrient = Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.PI / 4.0);
    const worldPoint = new Vector3(3.5, 4.2, 0.88);

    const roundTrip = CoordinateTransforms.verifyWorldCameraRoundTrip(worldPoint, camPos, camOrient);
    expect(roundTrip.errorMeters).toBeLessThan(0.001);
  });

  // ------------------------------------------------------------
  // 6. Adversarial "Perception Lies" & Failure Modes
  // ------------------------------------------------------------
  it('6. Perception Lies Suite — Validates safe degradation on low confidence, identical items, and stale frames', () => {
    const caseA = AdversarialPerceptionSuite.testLowConfidenceGraspSafety(0.42);
    expect(caseA.isSafeBehaviorAchieved).toBe(true);

    const caseB = AdversarialPerceptionSuite.testIdenticalObjectsDisambiguation();
    expect(caseB.isSafeBehaviorAchieved).toBe(true);

    const caseC = AdversarialPerceptionSuite.testMovedObjectInvalidation(
      new Vector3(2.5, -2.5, 1.0),
      new Vector3(1.8, -2.5, 1.0)
    );
    expect(caseC.isSafeBehaviorAchieved).toBe(true);

    const occludedState = AdversarialPerceptionSuite.testOcclusionRetention(4.0);
    expect(occludedState.state).toBe('OCCLUDED');
    expect(occludedState.confidence).toBeGreaterThan(0.20);

    const healthyStream = AdversarialPerceptionSuite.testFrozenFrameDetection(10.0, 10.033);
    expect(healthyStream.isStreamHealthy).toBe(true);
    expect(healthyStream.status).toBe('STREAM_OK');

    const staleStream = AdversarialPerceptionSuite.testFrozenFrameDetection(10.0, 10.150);
    expect(staleStream.isStreamHealthy).toBe(false);
    expect(staleStream.status).toBe('STALE_FRAME_DETECTED');

    const disconnectedStream = AdversarialPerceptionSuite.testFrozenFrameDetection(10.0, 10.800);
    expect(disconnectedStream.isStreamHealthy).toBe(false);
    expect(disconnectedStream.status).toBe('PERCEPTION_DEGRADED');
  });

  // ------------------------------------------------------------
  // 7. Entity Persistence & Semantic Decay Hierarchy
  // ------------------------------------------------------------
  it('7. Entity Persistence — Retains permanent furniture while decaying dynamic items gracefully', () => {
    const worldModel = new TemporalWorldModel();

    const snap0 = worldModel.getSnapshot(0.0);
    expect(snap0.detectedObjects.some((o) => o.objectId === 'kitchen_counter_01')).toBe(true);
    expect(snap0.detectedObjects.some((o) => o.objectId === 'water_bottle_01')).toBe(true);

    const snap20 = worldModel.updateDetections(
      [],
      [],
      { position: new Vector3(0, 0, 0), orientation: new Quaternion(1, 0, 0, 0) },
      20.0
    );

    expect(snap20.detectedObjects.some((o) => o.objectId === 'kitchen_counter_01')).toBe(true);
    expect(snap20.detectedObjects.some((o) => o.objectId === 'water_bottle_01')).toBe(false);
  });
});

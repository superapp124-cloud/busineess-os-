import { describe, it, expect } from 'vitest';
import {
  CameraModel,
  SensorNoisePipeline,
  SyntheticRgbdGenerator,
  ObjectDetector,
  PoseEstimator6D,
  HumanTracker,
  OccupancyGrid2D,
  SemanticHomeMap,
  TemporalWorldModel,
  PerceptionProvenance,
} from '../../packages/robot-perception/src';
import { Vector3, Quaternion } from '../../packages/robot-physics/src';

describe('GATE 5: Synthetic Perception Engine & Spatial World Model (G5.1 - G5.8)', () => {
  // ------------------------------------------------------------
  // G5.1: Camera Model & Coordinate Transformations
  // ------------------------------------------------------------
  it('G5.1: Camera Model — Proves pinhole projection, back-projection, and frame transformations', () => {
    const cam = new CameraModel();
    expect(cam.intrinsics.width).toBe(640);
    expect(cam.intrinsics.height).toBe(480);
    expect(cam.intrinsics.fx).toBe(615.0);

    // 1. 3D point directly ahead at Z = 2.0m, X = 0.5m, Y = 0.2m in camera frame
    const pCam = new Vector3(0.5, 0.2, 2.0);
    const proj = cam.projectPointToPixel(pCam);

    expect(proj.isVisible).toBe(true);
    expect(proj.u).toBe(Math.round((615.0 * 0.5) / 2.0 + 320.0)); // 474 px
    expect(proj.v).toBe(Math.round((615.0 * 0.2) / 2.0 + 240.0)); // 302 px

    // 2. Back-project pixel back to 3D camera coordinates
    const pReconstructed = cam.backprojectPixelToPoint(proj.u, proj.v, 2.0);
    expect(pReconstructed.x).toBeCloseTo(0.5, 2);
    expect(pReconstructed.y).toBeCloseTo(0.2, 2);
    expect(pReconstructed.z).toBe(2.0);

    // 3. World <-> Camera Transformation
    const camPosWorld = new Vector3(1.0, 2.0, 1.5);
    const camOrientWorld = new Quaternion(1, 0, 0, 0); // Facing +X
    const targetWorld = new Vector3(3.0, 2.0, 1.5);    // 2m ahead in +X

    const pTargetCam = cam.transformWorldToCamera(targetWorld, camPosWorld, camOrientWorld);
    expect(pTargetCam.z).toBeCloseTo(2.0, 2); // 2m in optical Z
    expect(pTargetCam.x).toBeCloseTo(0.0, 2); // Centered horizontally
  });

  // ------------------------------------------------------------
  // G5.2: Sensor Imperfections & Noise Pipeline
  // ------------------------------------------------------------
  it('G5.2: Sensor Noise — Evaluates quadratic depth noise, color noise, and latency queue', () => {
    const noisePipe = new SensorNoisePipeline({
      enableGaussianColorNoise: true,
      enableQuadraticDepthNoise: true,
      depthNoiseCoeffA: 0.0015,
      depthNoiseCoeffB: 0.002,
      frameDropProbability: 0.0, // Disable frame drops for deterministic noise check
      latencyMilliseconds: 33.0,
    });

    const rawFrame = {
      frameIndex: 1,
      timestampSeconds: 0.033,
      width: 64,
      height: 48,
      rgbBuffer: new Uint8ClampedArray(64 * 48 * 4).fill(200),
      depthBuffer: new Float32Array(64 * 48).fill(2.5), // 2.5m depth
      cameraPoseWorld: { position: new Vector3(0, 0, 1.5), orientation: new Quaternion(1, 0, 0, 0) },
      isDroppedFrame: false,
      latencyMs: 0,
    };

    const corrupted = noisePipe.corruptFrame(rawFrame);

    expect(corrupted.isDroppedFrame).toBe(false);
    expect(corrupted.latencyMs).toBe(33.0);
    expect(corrupted.depthBuffer[0]).toBeGreaterThan(2.40);
    expect(corrupted.depthBuffer[0]).toBeLessThan(2.60);

    // Test latency queue processing
    const queuedFrame = noisePipe.processLatencyQueue(rawFrame, 100);
    expect(queuedFrame).toBeNull();

    const releasedFrame = noisePipe.processLatencyQueue(rawFrame, 140);
    expect(releasedFrame).not.toBeNull();
  });

  // ------------------------------------------------------------
  // G5.3: Canonical Household Object Detection
  // ------------------------------------------------------------
  it('G5.3: Object Detection — Detects canonical household objects with high Precision and Recall', () => {
    const semanticHome = new SemanticHomeMap();
    const generator = new SyntheticRgbdGenerator();
    const detector = new ObjectDetector();

    // Robot stands in kitchen looking at counter and water bottle
    const robotPos = new Vector3(1.0, -2.5, 1.5);
    const robotOrient = new Quaternion(1, 0, 0, 0);

    const frame = generator.generateFrame(1, 0.033, robotPos, robotOrient, semanticHome.groundTruthObjects);
    const results = detector.detectObjects(frame, semanticHome.groundTruthObjects);

    expect(results.totalDetections).toBeGreaterThanOrEqual(1);
    expect(results.precision).toBeGreaterThanOrEqual(0.90);
    expect(results.recall).toBeGreaterThanOrEqual(0.85);

    const bottleDet = results.detectedObjects.find((d) => d.category === 'bottle');
    expect(bottleDet).toBeDefined();
    expect(bottleDet!.confidence).toBeGreaterThan(0.70);
  });

  // ------------------------------------------------------------
  // G5.4: 6D Object Pose Estimation & Affordances
  // ------------------------------------------------------------
  it('G5.4: 6D Pose Estimation — Reconstructs 3D pose, dimensions, and support surface affiliation', () => {
    const cam = new CameraModel();
    const poseEstimator = new PoseEstimator6D(cam);

    const robotPos = new Vector3(1.0, -2.5, 1.5);
    const robotOrient = new Quaternion(1, 0, 0, 0);

    const frame = {
      frameIndex: 1,
      timestampSeconds: 0.033,
      width: 640,
      height: 480,
      rgbBuffer: new Uint8ClampedArray(640 * 480 * 4),
      depthBuffer: new Float32Array(640 * 480).fill(1.5),
      cameraPoseWorld: { position: robotPos, orientation: robotOrient },
      isDroppedFrame: false,
      latencyMs: 0,
    };

    const knownSurfaces = [
      {
        surfaceId: 'kitchen_counter_01',
        heightZ: 0.90,
        boundsMin: new Vector3(1.5, -3.0, 0.0),
        boundsMax: new Vector3(3.5, -2.0, 1.0),
      },
    ];

    // Centroid pixel at v=435 projects down to countertop surface Z=1.025m
    const pose = poseEstimator.estimatePose(
      'water_bottle_01',
      'bottle',
      { u: 320, v: 435 },
      1.5,
      frame,
      knownSurfaces
    );

    expect(pose.objectId).toBe('water_bottle_01');
    expect(pose.category).toBe('bottle');
    expect(pose.positionWorld.x).toBeCloseTo(2.5, 1);
    expect(pose.positionWorld.y).toBeCloseTo(-2.5, 1);
    expect(pose.positionWorld.z).toBeCloseTo(1.025, 1);
    expect(pose.supportedBySurfaceId).toBe('kitchen_counter_01');
    expect(pose.affordances).toContain('GRASPABLE');
    expect(pose.affordances).toContain('POURABLE');
  });

  // ------------------------------------------------------------
  // G5.5: Multi-Target Human Tracking Engine
  // ------------------------------------------------------------
  it('G5.5: Human Tracking — Tracks human position, estimates velocity, and manages lifecycle', () => {
    const tracker = new HumanTracker();

    // t = 0.0s: Person detected at (0, 0, 0)
    const t0 = tracker.updateTracks([{ personId: 'user_arshid', positionWorld: new Vector3(0.0, 0.0, 0.0) }], 0.0);
    expect(t0.length).toBe(1);
    expect(t0[0].trackingState).toBe('ACTIVE');

    // t = 1.0s: Person moved to (1.0, 0.0, 0.0) -> vx = 1.0 m/s
    const t1 = tracker.updateTracks([{ personId: 'user_arshid', positionWorld: new Vector3(1.0, 0.0, 0.0) }], 1.0);
    expect(t1[0].positionWorld.x).toBe(1.0);
    expect(t1[0].velocityWorld.x).toBeGreaterThan(0.20);
    expect(t1[0].trackingState).toBe('ACTIVE');

    // t = 2.0s: Person temporarily occluded (not observed)
    const t2 = tracker.updateTracks([], 2.0);
    expect(t2[0].trackingState).toBe('OCCLUDED');

    // t = 6.0s: Person unobserved for > 3.0s -> State becomes LOST
    const t3 = tracker.updateTracks([], 6.0);
    expect(t3[0].trackingState).toBe('LOST');
  });

  // ------------------------------------------------------------
  // G5.6: 2D Log-Odds Bayesian Occupancy Grid Mapping
  // ------------------------------------------------------------
  it('G5.6: Occupancy Grid — Integrates raycasts and establishes FREE, OCCUPIED, and UNKNOWN cells', () => {
    const grid = new OccupancyGrid2D(10.0, 10.0, 0.05, { x: -5.0, y: -5.0 });

    const sensorPos = new Vector3(0.0, 0.0, 0.0);
    const wallHit = new Vector3(2.0, 0.0, 0.0);

    for (let i = 0; i < 10; i++) {
      grid.integrateRaycast(sensorPos, wallHit, 6.0);
    }

    const midCell = grid.worldToGrid(1.0, 0.0);
    expect(grid.getCellState(midCell.gx, midCell.gy)).toBe('FREE');

    const wallCell = grid.worldToGrid(2.0, 0.0);
    expect(grid.getCellState(wallCell.gx, wallCell.gy)).toBe('OCCUPIED');

    const unexplored = grid.worldToGrid(-3.0, 0.0);
    expect(grid.getCellState(unexplored.gx, unexplored.gy)).toBe('UNKNOWN');
  });

  // ------------------------------------------------------------
  // G5.7: Semantic Home Environment & Spatial Knowledge Graph
  // ------------------------------------------------------------
  it('G5.7: Semantic Map — Classifies rooms (Kitchen, Living Room, Bedroom) and verifies spatial relationships', () => {
    const map = new SemanticHomeMap();

    expect(map.rooms.length).toBe(3);

    const kitchenPos = new Vector3(2.0, -2.0, 0);
    const roomKitchen = map.getRoomAtPosition(kitchenPos);
    expect(roomKitchen).not.toBeNull();
    expect(roomKitchen!.roomName).toBe('KITCHEN');

    const bedroomPos = new Vector3(-2.0, 2.0, 0);
    const roomBedroom = map.getRoomAtPosition(bedroomPos);
    expect(roomBedroom!.roomName).toBe('BEDROOM');

    const bottleRel = map.spatialGraph.find((r) => r.subjectId === 'water_bottle_01');
    expect(bottleRel).toBeDefined();
    expect(bottleRel!.predicate).toBe('IS_ON');
    expect(bottleRel!.objectId).toBe('kitchen_counter_01');
  });

  // ------------------------------------------------------------
  // G5.8: Temporal World Model & Stale Detection Expiry
  // ------------------------------------------------------------
  it('G5.8: Temporal World Model — Updates belief state, decays stale objects, and produces signed provenance', () => {
    const worldModel = new TemporalWorldModel();

    const snap0 = worldModel.getSnapshot(0.0);
    expect(snap0.worldModelVersion).toBe(1);
    expect(snap0.detectedObjects.length).toBeGreaterThan(0);

    const movedBottle = {
      objectId: 'water_bottle_01',
      category: 'bottle' as const,
      confidence: 0.95,
      positionCamera: new Vector3(0, 0, 1.2),
      positionWorld: new Vector3(2.0, -2.0, 1.0),
      orientationWorld: new Quaternion(1, 0, 0, 0),
      dimensionsMeters: { length: 0.08, width: 0.08, height: 0.25 },
      boundingBox2D: { xMin: 200, yMin: 200, xMax: 240, yMax: 280, confidence: 0.95 },
      supportedBySurfaceId: 'kitchen_counter_01',
      affordances: ['GRASPABLE' as const, 'POURABLE' as const],
      lastObservedTimestamp: 1.0,
    };

    const snap1 = worldModel.updateDetections(
      [movedBottle],
      [],
      { position: new Vector3(0, 0, 0), orientation: new Quaternion(1, 0, 0, 0) },
      1.0
    );
    expect(snap1.worldModelVersion).toBe(2);

    const rel = snap1.spatialRelationships.find((r) => r.subjectId === 'water_bottle_01' && r.predicate === 'IS_ON');
    expect(rel).toBeDefined();
    expect(rel!.objectId).toBe('kitchen_counter_01');

    const manifest = PerceptionProvenance.generateManifest(4242, snap1.worldModelVersion);
    expect(manifest.gate).toBe('GATE-5');
    expect(manifest.sensorConfigHash).toBe('INTEL-REALSENSE-D435-SYNTH-V1');
    expect(manifest.worldModelVersion).toBe(2);
  });
});

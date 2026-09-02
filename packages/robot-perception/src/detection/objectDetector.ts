/**
 * CHATR Canonical Household Object Detector (G5.3)
 * Detects household objects, generates 2D bounding boxes, and tracks Precision / Recall.
 */

import { SyntheticCameraFrame, ObjectPose6D, BoundingBox2D, HouseholdCategory } from '../types';
import { CameraModel } from '../camera/cameraModel';

export interface DetectionResult {
  detectedObjects: Array<{
    category: HouseholdCategory;
    confidence: number;
    boundingBox2D: BoundingBox2D;
    depthMeters: number;
    centroidPixel: { u: number; v: number };
  }>;
  totalDetections: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
}

export class ObjectDetector {
  public cameraModel: CameraModel;
  public minConfidenceThreshold: number;

  constructor(cameraModel?: CameraModel, minConfidenceThreshold = 0.70) {
    this.cameraModel = cameraModel ?? new CameraModel();
    this.minConfidenceThreshold = minConfidenceThreshold;
  }

  /**
   * Detects objects visible in the synthetic RGB-D frame against ground-truth scene entities.
   */
  public detectObjects(
    frame: SyntheticCameraFrame,
    groundTruthObjects: ObjectPose6D[],
    detectionNoiseStdDev = 0.03
  ): DetectionResult {
    const detected: DetectionResult['detectedObjects'] = [];
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (const gt of groundTruthObjects) {
      const posCam = this.cameraModel.transformWorldToCamera(
        gt.positionWorld,
        frame.cameraPoseWorld.position,
        frame.cameraPoseWorld.orientation
      );

      // Frustum and occlusion check
      if (posCam.z < this.cameraModel.intrinsics.nearPlaneMeters || posCam.z > this.cameraModel.intrinsics.farPlaneMeters) {
        continue;
      }

      const proj = this.cameraModel.projectPointToPixel(posCam);
      if (!proj.isVisible) {
        continue;
      }

      // Check depth buffer at center pixel
      const pixelIdx = proj.v * frame.width + proj.u;
      const bufferDepth = frame.depthBuffer[pixelIdx];

      // Occlusion check: if foreground object is significantly closer, this object is occluded
      const isOccluded = bufferDepth < (posCam.z - 0.15);
      if (isOccluded) {
        falseNegatives++;
        continue;
      }

      // Compute noisy confidence: base confidence drops with distance
      const distanceFactor = Math.max(0.60, 1.0 - (posCam.z / this.cameraModel.intrinsics.farPlaneMeters) * 0.35);
      const noise = (Math.random() - 0.5) * 2.0 * detectionNoiseStdDev;
      const confidence = Math.max(0.0, Math.min(0.99, distanceFactor + noise));

      if (confidence < this.minConfidenceThreshold) {
        falseNegatives++;
        continue;
      }

      // Compute 2D bounding box
      const maxDim = Math.max(gt.dimensionsMeters.length, gt.dimensionsMeters.width, gt.dimensionsMeters.height);
      const halfDimPix = Math.max(2, Math.round((this.cameraModel.intrinsics.fx * (maxDim * 0.5)) / posCam.z));

      const bbox: BoundingBox2D = {
        xMin: Math.max(0, proj.u - halfDimPix),
        yMin: Math.max(0, proj.v - halfDimPix),
        xMax: Math.min(frame.width - 1, proj.u + halfDimPix),
        yMax: Math.min(frame.height - 1, proj.v + halfDimPix),
        confidence: Number(confidence.toFixed(3)),
      };

      detected.push({
        category: gt.category,
        confidence: Number(confidence.toFixed(3)),
        boundingBox2D: bbox,
        depthMeters: Number(posCam.z.toFixed(3)),
        centroidPixel: { u: proj.u, v: proj.v },
      });

      truePositives++;
    }

    const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 1.0;
    const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 1.0;

    return {
      detectedObjects: detected,
      totalDetections: detected.length,
      falsePositives,
      falseNegatives,
      precision: Number(precision.toFixed(3)),
      recall: Number(recall.toFixed(3)),
    };
  }
}

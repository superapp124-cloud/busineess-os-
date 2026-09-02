/**
 * CHATR Isolated Pixel Object Detector (G5.1-R)
 * Strictly isolated: Operates ONLY on raw RGB and Depth buffers + Camera Intrinsics.
 * Uses connected component segmentation and Non-Maximum Suppression (NMS).
 */

import { SyntheticCameraFrame, HouseholdCategory, BoundingBox2D } from '../types';
import { CameraModel } from '../camera/cameraModel';
import { Vector3 } from '../../../robot-physics/src/math/vector3';

export interface RawPixelDetection {
  category: HouseholdCategory;
  confidence: number;
  boundingBox2D: BoundingBox2D;
  centroidPixel: { u: number; v: number };
  measuredDepthMeters: number;
  positionCamera: Vector3;
}

export class IsolatedPixelDetector {
  public cameraModel: CameraModel;
  public minConfidenceThreshold: number;

  constructor(cameraModel?: CameraModel, minConfidenceThreshold = 0.65) {
    this.cameraModel = cameraModel ?? new CameraModel();
    this.minConfidenceThreshold = minConfidenceThreshold;
  }

  public detectFromRawBuffers(frame: SyntheticCameraFrame): RawPixelDetection[] {
    if (frame.isDroppedFrame || !frame.rgbBuffer || !frame.depthBuffer) {
      return [];
    }

    const width = frame.width;
    const height = frame.height;
    const candidateDetections: RawPixelDetection[] = [];
    const visited = new Uint8Array(width * height);

    for (let v = 20; v < height - 20; v += 6) {
      for (let u = 20; u < width - 20; u += 6) {
        const idx = v * width + u;
        if (visited[idx]) continue;

        const depth = frame.depthBuffer[idx];
        if (depth < this.cameraModel.intrinsics.nearPlaneMeters || depth > 4.5) {
          continue;
        }

        const r = frame.rgbBuffer[idx * 4];
        const g = frame.rgbBuffer[idx * 4 + 1];
        const b = frame.rgbBuffer[idx * 4 + 2];

        const categoryMatch = this.classifyPixelSignature(r, g, b, depth);
        if (!categoryMatch) continue;

        // Flood-fill connected region
        let minU = u, maxU = u, minV = v, maxV = v;
        let sumU = 0, sumV = 0, count = 0;
        let sumDepth = 0;

        const searchRadius = categoryMatch.category === 'countertop' || categoryMatch.category === 'sofa' ? 40 : 15;

        for (let dv = -searchRadius; dv <= searchRadius; dv += 2) {
          for (let du = -searchRadius; du <= searchRadius; du += 2) {
            const nu = u + du;
            const nv = v + dv;
            if (nu >= 0 && nu < width && nv >= 0 && nv < height) {
              const nIdx = nv * width + nu;
              const nDepth = frame.depthBuffer[nIdx];

              if (Math.abs(nDepth - depth) < 0.20) {
                visited[nIdx] = 1;
                minU = Math.min(minU, nu);
                maxU = Math.max(maxU, nu);
                minV = Math.min(minV, nv);
                maxV = Math.max(maxV, nv);
                sumU += nu;
                sumV += nv;
                sumDepth += nDepth;
                count++;
              }
            }
          }
        }

        if (count >= 8) {
          const avgU = Math.round(sumU / count);
          const avgV = Math.round(sumV / count);
          const avgD = Number((sumDepth / count).toFixed(3));

          const distancePenalty = (avgD / this.cameraModel.intrinsics.farPlaneMeters) * 0.20;
          const confidence = Number(Math.max(0.0, Math.min(0.98, categoryMatch.baseConfidence - distancePenalty)).toFixed(3));

          if (confidence >= this.minConfidenceThreshold) {
            const posCam = this.cameraModel.backprojectPixelToPoint(avgU, avgV, avgD);

            candidateDetections.push({
              category: categoryMatch.category,
              confidence,
              boundingBox2D: {
                xMin: minU,
                yMin: minV,
                xMax: maxU,
                yMax: maxV,
                confidence,
              },
              centroidPixel: { u: avgU, v: avgV },
              measuredDepthMeters: avgD,
              positionCamera: posCam,
            });
          }
        }
      }
    }

    // Non-Maximum Suppression (NMS) to suppress duplicate overlapping bounding boxes
    return this.applyNms(candidateDetections);
  }

  private applyNms(detections: RawPixelDetection[], iouThreshold = 0.30): RawPixelDetection[] {
    const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
    const selected: RawPixelDetection[] = [];

    for (const d of sorted) {
      let isDuplicate = false;
      for (const s of selected) {
        if (d.category === s.category) {
          const posDist = d.positionCamera.distanceTo(s.positionCamera);
          if (posDist < 0.40) {
            isDuplicate = true;
            break;
          }
        }
      }
      if (!isDuplicate) {
        selected.push(d);
      }
    }

    return selected;
  }

  private classifyPixelSignature(
    r: number,
    g: number,
    b: number,
    depth: number
  ): { category: HouseholdCategory; baseConfidence: number } | null {
    if (b > 200 && r < 100 && g > 100) {
      return { category: 'bottle', baseConfidence: 0.94 };
    }
    if (r > 200 && g < 150 && b < 150) {
      return { category: 'person', baseConfidence: 0.96 };
    }
    if (g > 180 && r < 140 && b < 140) {
      return { category: 'cup', baseConfidence: 0.91 };
    }
    if (r > 230 && g > 230 && b > 230 && depth < 2.5) {
      return { category: 'plate', baseConfidence: 0.89 };
    }
    if (b > 130 && r < 110 && g < 110 && depth > 1.5) {
      return { category: 'sofa', baseConfidence: 0.93 };
    }
    if (r > 120 && g > 70 && b < 60) {
      return { category: 'countertop', baseConfidence: 0.92 };
    }

    return null;
  }
}

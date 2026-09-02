/**
 * CHATR Synthetic RGB-D Generator (G5.1)
 * Renders synthetic RGB and Depth pixel buffers from 3D scene objects.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import { CameraModel } from './cameraModel';
import { SyntheticCameraFrame, ObjectPose6D } from '../types';

export class SyntheticRgbdGenerator {
  public cameraModel: CameraModel;

  constructor(cameraModel?: CameraModel) {
    this.cameraModel = cameraModel ?? new CameraModel();
  }

  /**
   * Renders RGB and depth buffers for a given camera pose and set of 3D objects in the world.
   */
  public generateFrame(
    frameIndex: number,
    timestampSeconds: number,
    cameraPosWorld: Vector3,
    cameraOrientWorld: Quaternion,
    sceneObjects: ObjectPose6D[]
  ): SyntheticCameraFrame {
    const width = this.cameraModel.intrinsics.width;
    const height = this.cameraModel.intrinsics.height;

    const rgbBuffer = new Uint8ClampedArray(width * height * 4);
    const depthBuffer = new Float32Array(width * height);

    // Initialize with background floor/wall depth (e.g. 5.0m) and neutral background color
    for (let i = 0; i < width * height; i++) {
      rgbBuffer[i * 4] = 230;     // R
      rgbBuffer[i * 4 + 1] = 230; // G
      rgbBuffer[i * 4 + 2] = 235; // B
      rgbBuffer[i * 4 + 3] = 255; // Alpha
      depthBuffer[i] = 5.0;       // 5.0m default background depth
    }

    // Rasterize each visible scene object into RGB and Depth buffers
    for (const obj of sceneObjects) {
      const posCam = this.cameraModel.transformWorldToCamera(
        obj.positionWorld,
        cameraPosWorld,
        cameraOrientWorld
      );

      // Frustum culling
      if (posCam.z < this.cameraModel.intrinsics.nearPlaneMeters || posCam.z > this.cameraModel.intrinsics.farPlaneMeters) {
        continue;
      }

      const projCenter = this.cameraModel.projectPointToPixel(posCam);
      if (!projCenter.isVisible) continue;

      // Estimate pixel bounding radius based on object dimensions and depth: r_pix = (f * r_3d) / z
      const maxDim = Math.max(obj.dimensionsMeters.length, obj.dimensionsMeters.width, obj.dimensionsMeters.height);
      const halfDimPix = Math.max(2, Math.round((this.cameraModel.intrinsics.fx * (maxDim * 0.5)) / posCam.z));

      const uMin = Math.max(0, projCenter.u - halfDimPix);
      const uMax = Math.min(width - 1, projCenter.u + halfDimPix);
      const vMin = Math.max(0, projCenter.v - halfDimPix);
      const vMax = Math.min(height - 1, projCenter.v + halfDimPix);

      // Category color hash
      const color = this.getCategoryColor(obj.category);

      for (let v = vMin; v <= vMax; v++) {
        for (let u = uMin; u <= uMax; u++) {
          const pixelIdx = v * width + u;
          // Depth buffer test
          if (posCam.z < depthBuffer[pixelIdx]) {
            depthBuffer[pixelIdx] = posCam.z;
            rgbBuffer[pixelIdx * 4] = color.r;
            rgbBuffer[pixelIdx * 4 + 1] = color.g;
            rgbBuffer[pixelIdx * 4 + 2] = color.b;
            rgbBuffer[pixelIdx * 4 + 3] = 255;
          }
        }
      }
    }

    return {
      frameIndex,
      timestampSeconds,
      width,
      height,
      rgbBuffer,
      depthBuffer,
      cameraPoseWorld: {
        position: cameraPosWorld.clone(),
        orientation: cameraOrientWorld.clone(),
      },
      isDroppedFrame: false,
      latencyMs: 0,
    };
  }

  private getCategoryColor(category: string): { r: number; g: number; b: number } {
    switch (category) {
      case 'person': return { r: 255, g: 100, b: 100 };
      case 'bottle': return { r: 50, g: 150, b: 255 };
      case 'cup': return { r: 100, g: 220, b: 100 };
      case 'plate': return { r: 240, g: 240, b: 240 };
      case 'chair': return { r: 180, g: 120, b: 70 };
      case 'table': return { r: 140, g: 90, b: 40 };
      case 'sofa': return { r: 80, g: 80, b: 160 };
      default: return { r: 120, g: 120, b: 120 };
    }
  }
}

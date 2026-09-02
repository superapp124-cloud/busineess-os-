/**
 * CHATR Pinhole Camera Model & Coordinate Transformations (G5.1)
 * Handles projection from 3D world/camera coordinates to 2D image coordinates and back-projection.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import { CameraIntrinsics } from '../types';

export class CameraModel {
  public intrinsics: CameraIntrinsics;

  // Extrinsics: Head link frame to Camera optical frame offset
  public headToCameraTranslation: Vector3;
  public headToCameraRotation: Quaternion;

  constructor(intrinsics?: Partial<CameraIntrinsics>) {
    this.intrinsics = {
      width: intrinsics?.width ?? 640,
      height: intrinsics?.height ?? 480,
      fx: intrinsics?.fx ?? 615.0,
      fy: intrinsics?.fy ?? 615.0,
      cx: intrinsics?.cx ?? 320.0,
      cy: intrinsics?.cy ?? 240.0,
      nearPlaneMeters: intrinsics?.nearPlaneMeters ?? 0.20,
      farPlaneMeters: intrinsics?.farPlaneMeters ?? 8.00,
    };

    // Camera mounted in head pod: 0.05m forward (+X), 0.08m up (+Z)
    this.headToCameraTranslation = new Vector3(0.05, 0.0, 0.08);
    this.headToCameraRotation = new Quaternion(1, 0, 0, 0); // Aligned with head gaze
  }

  /**
   * Projects a 3D point in Camera Optical Frame [X_right, Y_down, Z_forward] onto 2D image pixel [u, v].
   */
  public projectPointToPixel(pointCam: Vector3): { u: number; v: number; isVisible: boolean } {
    if (pointCam.z < this.intrinsics.nearPlaneMeters || pointCam.z > this.intrinsics.farPlaneMeters) {
      return { u: -1, v: -1, isVisible: false };
    }

    const u = (this.intrinsics.fx * pointCam.x) / pointCam.z + this.intrinsics.cx;
    const v = (this.intrinsics.fy * pointCam.y) / pointCam.z + this.intrinsics.cy;

    const isVisible = u >= 0 && u < this.intrinsics.width && v >= 0 && v < this.intrinsics.height;

    return {
      u: Math.round(u),
      v: Math.round(v),
      isVisible,
    };
  }

  /**
   * Back-projects a 2D pixel [u, v] and depth value d (meters) into 3D Camera Optical Frame.
   */
  public backprojectPixelToPoint(u: number, v: number, depthMeters: number): Vector3 {
    const x = ((u - this.intrinsics.cx) * depthMeters) / this.intrinsics.fx;
    const y = ((v - this.intrinsics.cy) * depthMeters) / this.intrinsics.fy;
    const z = depthMeters;
    return new Vector3(Number(x.toFixed(4)), Number(y.toFixed(4)), Number(z.toFixed(4)));
  }

  /**
   * Transforms a 3D point from World frame to Camera Optical Frame.
   */
  public transformWorldToCamera(
    worldPoint: Vector3,
    cameraPosWorld: Vector3,
    cameraOrientWorld: Quaternion
  ): Vector3 {
    // Relative position in world space
    const relWorld = worldPoint.clone().sub(cameraPosWorld);

    // Rotate into camera local frame: p_cam = q^-1 * relWorld
    const invOrient = cameraOrientWorld.clone().conjugate();
    const pBody = invOrient.rotateVector(relWorld);

    // Convert from Body Frame (X-forward, Y-left, Z-up) to Optical Frame (X-right, Y-down, Z-forward)
    const optX = -pBody.y;
    const optY = -pBody.z;
    const optZ = pBody.x;

    return new Vector3(Number(optX.toFixed(4)), Number(optY.toFixed(4)), Number(optZ.toFixed(4)));
  }

  /**
   * Transforms a 3D point from Camera Optical Frame to World Frame.
   */
  public transformCameraToWorld(
    camPoint: Vector3,
    cameraPosWorld: Vector3,
    cameraOrientWorld: Quaternion
  ): Vector3 {
    // Optical to Body Frame
    const pBody = new Vector3(camPoint.z, -camPoint.x, -camPoint.y);

    // Rotate and translate to world frame
    const pWorld = cameraOrientWorld.rotateVector(pBody).add(cameraPosWorld);
    return new Vector3(Number(pWorld.x.toFixed(4)), Number(pWorld.y.toFixed(4)), Number(pWorld.z.toFixed(4)));
  }
}

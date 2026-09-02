/**
 * CHATR Multi-Frame Coordinate Transformation Engine (G5.1-R)
 * Provides rigorous SE(3) transformations and round-trip consistency across robot frames.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';
import { Quaternion } from '../../../robot-physics/src/math/quaternion';
import { Matrix4 } from '../../../robot-physics/src/math/matrix4';

export class CoordinateTransforms {
  /**
   * Builds 4x4 SE(3) Homogeneous Transformation Matrix T = [R | p; 0 | 1]
   */
  public static createTransformMatrix(position: Vector3, orientation: Quaternion): Matrix4 {
    const mat = new Matrix4();
    mat.compose(position, orientation);
    return mat;
  }

  /**
   * Transforms a 3D point from source frame A to target frame B using T_B_A
   */
  public static transformPoint(pointA: Vector3, transformBtoA: Matrix4): Vector3 {
    return transformBtoA.transformPoint(pointA.clone());
  }

  /**
   * Computes inverse transformation T^-1 = [R^T | -R^T * p; 0 | 1]
   */
  public static invertTransform(pos: Vector3, orient: Quaternion): { invPos: Vector3; invOrient: Quaternion } {
    const invOrient = orient.clone().conjugate();
    const invPos = invOrient.rotateVector(new Vector3(-pos.x, -pos.y, -pos.z));
    return { invPos, invOrient };
  }

  /**
   * Evaluates round-trip consistency: World -> Camera -> World
   */
  public static verifyWorldCameraRoundTrip(
    worldPoint: Vector3,
    camPosWorld: Vector3,
    camOrientWorld: Quaternion
  ): { reconstructedPoint: Vector3; errorMeters: number } {
    const relWorld = worldPoint.clone().sub(camPosWorld);
    const invOrient = camOrientWorld.clone().conjugate();
    const pBody = invOrient.rotateVector(relWorld);
    const pCam = new Vector3(-pBody.y, -pBody.z, pBody.x);

    const pBodyRecon = new Vector3(pCam.z, -pCam.x, -pCam.y);
    const pWorldRecon = camOrientWorld.rotateVector(pBodyRecon).add(camPosWorld);

    const error = worldPoint.distanceTo(pWorldRecon);
    return {
      reconstructedPoint: new Vector3(
        Number(pWorldRecon.x.toFixed(4)),
        Number(pWorldRecon.y.toFixed(4)),
        Number(pWorldRecon.z.toFixed(4))
      ),
      errorMeters: Number(error.toFixed(6)),
    };
  }
}

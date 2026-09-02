/**
 * CHATR 3D Spatial Mathematics — Matrix4
 * 4x4 Homogeneous Transformation Matrix for coordinate frames.
 */

import { Vector3 } from './vector3';
import { Quaternion } from './quaternion';
import { Matrix3 } from './matrix3';

export class Matrix4 {
  public elements: Float64Array;

  constructor() {
    this.elements = new Float64Array(16);
    this.identity();
  }

  public identity(): this {
    const e = this.elements;
    e.fill(0);
    e[0] = 1; e[5] = 1; e[10] = 1; e[15] = 1;
    return this;
  }

  public compose(position: Vector3, orientation: Quaternion): this {
    const rot = orientation.toRotationMatrix();
    const r = rot.elements;
    const e = this.elements;

    e[0] = r[0]; e[1] = r[1]; e[2] = r[2]; e[3] = position.x;
    e[4] = r[3]; e[5] = r[4]; e[6] = r[5]; e[7] = position.y;
    e[8] = r[6]; e[9] = r[7]; e[10] = r[8]; e[11] = position.z;
    e[12] = 0;   e[13] = 0;   e[14] = 0;    e[15] = 1;

    return this;
  }

  public multiply(m: Matrix4): this {
    const a = this.elements;
    const b = m.elements;
    const out = new Float64Array(16);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        out[i * 4 + j] =
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    this.elements.set(out);
    return this;
  }

  public transformPoint(p: Vector3, target = new Vector3()): Vector3 {
    const e = this.elements;
    const x = e[0] * p.x + e[1] * p.y + e[2] * p.z + e[3];
    const y = e[4] * p.x + e[5] * p.y + e[6] * p.z + e[7];
    const z = e[8] * p.x + e[9] * p.y + e[10] * p.z + e[11];
    target.set(x, y, z);
    return target;
  }

  public transformVector(v: Vector3, target = new Vector3()): Vector3 {
    const e = this.elements;
    const x = e[0] * v.x + e[1] * v.y + e[2] * v.z;
    const y = e[4] * v.x + e[5] * v.y + e[6] * v.z;
    const z = e[8] * v.x + e[9] * v.y + e[10] * v.z;
    target.set(x, y, z);
    return target;
  }
}

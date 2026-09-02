/**
 * CHATR 3D Spatial Mathematics — Matrix3
 * 3x3 Matrix for Inertia Tensors and Rotations
 */

import { Vector3 } from './vector3';

export class Matrix3 {
  // Elements stored in row-major order: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
  public elements: Float64Array;

  constructor() {
    this.elements = new Float64Array(9);
    this.identity();
  }

  public identity(): this {
    const e = this.elements;
    e[0] = 1; e[1] = 0; e[2] = 0;
    e[3] = 0; e[4] = 1; e[5] = 0;
    e[6] = 0; e[7] = 0; e[8] = 1;
    return this;
  }

  public set(
    m00: number, m01: number, m02: number,
    m10: number, m11: number, m12: number,
    m20: number, m21: number, m22: number
  ): this {
    const e = this.elements;
    e[0] = m00; e[1] = m01; e[2] = m02;
    e[3] = m10; e[4] = m11; e[5] = m12;
    e[6] = m20; e[7] = m21; e[8] = m22;
    return this;
  }

  public clone(): Matrix3 {
    const m = new Matrix3();
    m.elements.set(this.elements);
    return m;
  }

  public multiply(m: Matrix3): this {
    const a = this.elements;
    const b = m.elements;
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    const a20 = a[6], a21 = a[7], a22 = a[8];

    const b00 = b[0], b01 = b[1], b02 = b[2];
    const b10 = b[3], b11 = b[4], b12 = b[5];
    const b20 = b[6], b21 = b[7], b22 = b[8];

    a[0] = a00 * b00 + a01 * b10 + a02 * b20;
    a[1] = a00 * b01 + a01 * b11 + a02 * b21;
    a[2] = a00 * b02 + a01 * b12 + a02 * b22;

    a[3] = a10 * b00 + a11 * b10 + a12 * b20;
    a[4] = a10 * b01 + a11 * b11 + a12 * b21;
    a[5] = a10 * b02 + a11 * b12 + a12 * b22;

    a[6] = a20 * b00 + a21 * b10 + a22 * b20;
    a[7] = a20 * b01 + a21 * b11 + a22 * b21;
    a[8] = a20 * b02 + a21 * b12 + a22 * b22;

    return this;
  }

  public multiplyVector(v: Vector3, target = new Vector3()): Vector3 {
    const e = this.elements;
    const x = e[0] * v.x + e[1] * v.y + e[2] * v.z;
    const y = e[3] * v.x + e[4] * v.y + e[5] * v.z;
    const z = e[6] * v.x + e[7] * v.y + e[8] * v.z;
    target.set(x, y, z);
    return target;
  }

  public determinant(): number {
    const e = this.elements;
    const a = e[0], b = e[1], c = e[2];
    const d = e[3], f = e[4], g = e[5];
    const h = e[6], i = e[7], j = e[8];

    return a * (f * j - g * i) - b * (d * j - g * h) + c * (d * i - f * h);
  }

  public invert(): this {
    const e = this.elements;
    const a00 = e[0], a01 = e[1], a02 = e[2];
    const a10 = e[3], a11 = e[4], a12 = e[5];
    const a20 = e[6], a21 = e[7], a22 = e[8];

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (Math.abs(det) < 1e-12) {
      this.identity();
      return this;
    }
    const invDet = 1.0 / det;

    e[0] = b01 * invDet;
    e[1] = (-a22 * a01 + a02 * a21) * invDet;
    e[2] = (a12 * a01 - a02 * a11) * invDet;
    e[3] = b11 * invDet;
    e[4] = (a22 * a00 - a02 * a20) * invDet;
    e[5] = (-a12 * a00 + a02 * a10) * invDet;
    e[6] = b21 * invDet;
    e[7] = (-a21 * a00 + a01 * a20) * invDet;
    e[8] = (a11 * a00 - a01 * a10) * invDet;

    return this;
  }

  public transpose(): this {
    const e = this.elements;
    let t: number;
    t = e[1]; e[1] = e[3]; e[3] = t;
    t = e[2]; e[2] = e[6]; e[6] = t;
    t = e[5]; e[5] = e[7]; e[7] = t;
    return this;
  }

  public static fromInertia(ixx: number, iyy: number, izz: number, ixy = 0, ixz = 0, iyz = 0): Matrix3 {
    const m = new Matrix3();
    m.set(
      ixx, -ixy, -ixz,
      -ixy, iyy, -iyz,
      -ixz, -iyz, izz
    );
    return m;
  }
}

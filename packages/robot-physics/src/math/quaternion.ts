/**
 * CHATR 3D Spatial Mathematics — Quaternion
 * Unit quaternion representation for 3D rotations without gimbal lock.
 */

import { Vector3 } from './vector3';
import { Matrix3 } from './matrix3';

export class Quaternion {
  constructor(
    public w = 1.0,
    public x = 0.0,
    public y = 0.0,
    public z = 0.0
  ) {}

  public set(w: number, x: number, y: number, z: number): this {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public clone(): Quaternion {
    return new Quaternion(this.w, this.x, this.y, this.z);
  }

  public copy(q: { w: number; x: number; y: number; z: number }): this {
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
  }

  public identity(): this {
    return this.set(1.0, 0.0, 0.0, 0.0);
  }

  public lengthSquared(): number {
    return this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  public normalize(): this {
    const len = this.length();
    if (len > 1e-12) {
      const inv = 1.0 / len;
      this.w *= inv;
      this.x *= inv;
      this.y *= inv;
      this.z *= inv;
    } else {
      this.identity();
    }
    return this;
  }

  public conjugate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  public multiply(q: Quaternion): this {
    const w1 = this.w, x1 = this.x, y1 = this.y, z1 = this.z;
    const w2 = q.w, x2 = q.x, y2 = q.y, z2 = q.z;

    this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    this.x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
    this.y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
    this.z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;

    return this;
  }

  public rotateVector(v: Vector3, target = new Vector3()): Vector3 {
    // v' = q * (0, v) * q^-1
    const vx = v.x, vy = v.y, vz = v.z;
    const qw = this.w, qx = this.x, qy = this.y, qz = this.z;

    // t = 2 * cross(q.xyz, v)
    const tx = 2.0 * (qy * vz - qz * vy);
    const ty = 2.0 * (qz * vx - qx * vz);
    const tz = 2.0 * (qx * vy - qy * vx);

    // v' = v + q.w * t + cross(q.xyz, t)
    const rx = vx + qw * tx + (qy * tz - qz * ty);
    const ry = vy + qw * ty + (qz * tx - qx * tz);
    const rz = vz + qw * tz + (qx * ty - qy * tx);

    target.set(rx, ry, rz);
    return target;
  }

  public toRotationMatrix(target = new Matrix3()): Matrix3 {
    const w = this.w, x = this.x, y = this.y, z = this.z;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    target.set(
      1.0 - (yy + zz), xy - wz, xz + wy,
      xy + wz, 1.0 - (xx + zz), yz - wx,
      xz - wy, yz + wx, 1.0 - (xx + yy)
    );
    return target;
  }

  public setFromAxisAngle(axis: Vector3, angleRad: number): this {
    const halfAngle = angleRad * 0.5;
    const s = Math.sin(halfAngle);
    const norm = axis.clone().normalize();

    this.w = Math.cos(halfAngle);
    this.x = norm.x * s;
    this.y = norm.y * s;
    this.z = norm.z * s;
    return this.normalize();
  }

  public static fromAxisAngle(axis: Vector3, angleRad: number): Quaternion {
    return new Quaternion().setFromAxisAngle(axis, angleRad);
  }

  public static fromEuler(rollRad: number, pitchRad: number, yawRad: number): Quaternion {
    const c1 = Math.cos(rollRad / 2);
    const c2 = Math.cos(pitchRad / 2);
    const c3 = Math.cos(yawRad / 2);
    const s1 = Math.sin(rollRad / 2);
    const s2 = Math.sin(pitchRad / 2);
    const s3 = Math.sin(yawRad / 2);

    const w = c1 * c2 * c3 + s1 * s2 * s3;
    const x = s1 * c2 * c3 - c1 * s2 * s3;
    const y = c1 * s2 * c3 + s1 * c2 * s3;
    const z = c1 * c2 * s3 - s1 * s2 * c3;

    return new Quaternion(w, x, y, z).normalize();
  }
}

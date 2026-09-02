/**
 * CHATR 3D Spatial Mathematics — Vector3
 * Clean, allocation-conscious 3D spatial vector library.
 */

export class Vector3 {
  constructor(public x = 0, public y = 0, public z = 0) {}

  public set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public copy(v: { x: number; y: number; z: number }): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public add(v: Vector3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public addScaled(v: Vector3, scale: number): this {
    this.x += v.x * scale;
    this.y += v.y * scale;
    this.z += v.z * scale;
    return this;
  }

  public sub(v: Vector3): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public scale(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross(v: Vector3): Vector3 {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    return new Vector3(x, y, z);
  }

  public crossInto(v: Vector3, target: Vector3): Vector3 {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    target.x = x;
    target.y = y;
    target.z = z;
    return target;
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  public normalize(): this {
    const len = this.length();
    if (len > 1e-12) {
      this.scale(1.0 / len);
    } else {
      this.set(0, 0, 0);
    }
    return this;
  }

  public distanceTo(v: Vector3): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  public isFinite(): boolean {
    return Number.isFinite(this.x) && Number.isFinite(this.y) && Number.isFinite(this.z);
  }

  public toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  public static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }
}

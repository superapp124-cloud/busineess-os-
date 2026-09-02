/**
 * CHATR 2D Log-Odds Bayesian Occupancy Grid Mapping (G5.6)
 * Integrates depth raycasts into a 2D grid map with FREE, OCCUPIED, and UNKNOWN states.
 */

import { Vector3 } from '../../../robot-physics/src/math/vector3';

export class OccupancyGrid2D {
  public resolutionMeters: number; // e.g. 0.05m (5 cm / cell)
  public widthCells: number;
  public heightCells: number;
  public originWorld: { x: number; y: number }; // World coordinate corresponding to grid cell (0, 0)
  public logOddsGrid: Float32Array; // Stored in log-odds l = log(p / (1-p))

  // Thresholds in probability space [0, 1]
  public static readonly LOG_ODDS_OCCUPIED = 0.85; // l_occ = log(0.7 / 0.3) = +0.85
  public static readonly LOG_ODDS_FREE = -0.40;     // l_free = log(0.4 / 0.6) = -0.40
  public static readonly CLAMP_MAX = +3.5;          // p ~ 0.97
  public static readonly CLAMP_MIN = -3.5;          // p ~ 0.03

  constructor(
    widthMeters = 10.0,
    heightMeters = 10.0,
    resolutionMeters = 0.05,
    originWorld = { x: -5.0, y: -5.0 }
  ) {
    this.resolutionMeters = resolutionMeters;
    this.widthCells = Math.round(widthMeters / resolutionMeters);
    this.heightCells = Math.round(heightMeters / resolutionMeters);
    this.originWorld = originWorld;
    this.logOddsGrid = new Float32Array(this.widthCells * this.heightCells); // Initialized to 0.0 (p = 0.5 unknown)
  }

  public worldToGrid(xWorld: number, yWorld: number): { gx: number; gy: number; isInside: boolean } {
    const gx = Math.floor((xWorld - this.originWorld.x) / this.resolutionMeters);
    const gy = Math.floor((yWorld - this.originWorld.y) / this.resolutionMeters);
    const isInside = gx >= 0 && gx < this.widthCells && gy >= 0 && gy < this.heightCells;
    return { gx, gy, isInside };
  }

  public gridToWorld(gx: number, gy: number): { xWorld: number; yWorld: number } {
    const xWorld = this.originWorld.x + (gx + 0.5) * this.resolutionMeters;
    const yWorld = this.originWorld.y + (gy + 0.5) * this.resolutionMeters;
    return { xWorld, yWorld };
  }

  /**
   * Integrates a sensor raycast from sensor origin to hit point using Bresenham algorithm.
   */
  public integrateRaycast(sensorPosWorld: Vector3, hitPointWorld: Vector3, maxRangeMeters = 6.0): void {
    const start = this.worldToGrid(sensorPosWorld.x, sensorPosWorld.y);
    const end = this.worldToGrid(hitPointWorld.x, hitPointWorld.y);

    if (!start.isInside) return;

    const rayLength = Math.sqrt(
      (hitPointWorld.x - sensorPosWorld.x) ** 2 + (hitPointWorld.y - sensorPosWorld.y) ** 2
    );
    const isHitValid = rayLength <= maxRangeMeters;

    // Bresenham line algorithm to mark free cells
    let x0 = start.gx;
    let y0 = start.gy;
    const x1 = end.gx;
    const y1 = end.gy;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (x0 !== x1 || y0 !== y1) {
      if (x0 >= 0 && x0 < this.widthCells && y0 >= 0 && y0 < this.heightCells) {
        const idx = y0 * this.widthCells + x0;
        this.logOddsGrid[idx] = Math.max(OccupancyGrid2D.CLAMP_MIN, this.logOddsGrid[idx] + OccupancyGrid2D.LOG_ODDS_FREE);
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    // Mark end point as occupied if within valid range
    if (isHitValid && end.isInside) {
      const idx = end.gy * this.widthCells + end.gx;
      this.logOddsGrid[idx] = Math.min(OccupancyGrid2D.CLAMP_MAX, this.logOddsGrid[idx] + OccupancyGrid2D.LOG_ODDS_OCCUPIED);
    }
  }

  /**
   * Returns cell state: FREE (0), OCCUPIED (100), or UNKNOWN (-1)
   */
  public getCellState(gx: number, gy: number): 'FREE' | 'OCCUPIED' | 'UNKNOWN' {
    if (gx < 0 || gx >= this.widthCells || gy < 0 || gy >= this.heightCells) {
      return 'UNKNOWN';
    }
    const l = this.logOddsGrid[gy * this.widthCells + gx];
    if (l > 0.5) return 'OCCUPIED';
    if (l < -0.5) return 'FREE';
    return 'UNKNOWN';
  }

  public getSummary(): { occupiedCount: number; freeCount: number; unknownCount: number } {
    let occupied = 0;
    let free = 0;
    let unknown = 0;

    for (let i = 0; i < this.logOddsGrid.length; i++) {
      const l = this.logOddsGrid[i];
      if (l > 0.5) occupied++;
      else if (l < -0.5) free++;
      else unknown++;
    }

    return { occupiedCount: occupied, freeCount: free, unknownCount: unknown };
  }
}

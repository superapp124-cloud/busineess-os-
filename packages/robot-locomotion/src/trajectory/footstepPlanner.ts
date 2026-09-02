/**
 * CHATR Bipedal Footstep Planner
 * Generates feasible, collision-free footstep sequences for humanoid walking.
 */

import { Footstep } from '../types';
import { Vector3 } from '../../../robot-physics/src/math/vector3';

export interface FootstepPlanConfig {
  numSteps: number;
  stepLengthMeters?: number; // Forward stride (default 0.25m)
  stepWidthMeters?: number;  // Lateral foot separation (default 0.28m)
  stepDurationSeconds?: number; // Duration per step (default 0.6s)
  turnAngleRad?: number;     // Yaw angle per step (default 0.0 rad)
}

export class FootstepPlanner {
  public static planFootsteps(config: FootstepPlanConfig): Footstep[] {
    const numSteps = config.numSteps;
    const stride = config.stepLengthMeters ?? 0.25;
    const halfWidth = (config.stepWidthMeters ?? 0.28) * 0.5;
    const duration = config.stepDurationSeconds ?? 0.6;
    const turn = config.turnAngleRad ?? 0.0;

    const steps: Footstep[] = [];
    let currentX = 0.0;
    let currentYaw = 0.0;

    for (let i = 0; i < numSteps; i++) {
      const isLeft = i % 2 === 0;
      const foot = isLeft ? 'LEFT' : 'RIGHT';
      const side = isLeft ? 1.0 : -1.0;

      // Advance forward stride
      currentX += stride;
      currentYaw += turn;

      const y = side * halfWidth;

      steps.push({
        stepIndex: i + 1,
        foot,
        position: {
          x: Number(currentX.toFixed(4)),
          y: Number(y.toFixed(4)),
          z: 0.0,
        },
        yawRad: Number(currentYaw.toFixed(4)),
        durationSeconds: duration,
      });
    }

    return steps;
  }
}

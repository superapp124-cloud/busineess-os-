/**
 * CHATR Sensor Noise & Latency Pipeline (G5.2)
 * Injects realistic RGB-D sensor imperfections: quadratic depth noise, color noise,
 * frame drops, and latency buffers.
 */

import { SyntheticCameraFrame } from '../types';

export interface NoiseConfig {
  enableGaussianColorNoise?: boolean;
  colorNoiseStdDev?: number; // 0 - 255 scale (default 3.0)
  enableQuadraticDepthNoise?: boolean;
  depthNoiseCoeffA?: number; // sigma(z) = a * z^2 + b (default 0.0015)
  depthNoiseCoeffB?: number; // default 0.002
  frameDropProbability?: number; // default 0.05 (5% drop rate)
  latencyMilliseconds?: number; // default 33ms (~30 FPS pipeline lag)
}

export class SensorNoisePipeline {
  public config: Required<NoiseConfig>;
  private frameBufferQueue: Array<{ frame: SyntheticCameraFrame; enqueueTimestampMs: number }> = [];

  constructor(config: NoiseConfig = {}) {
    this.config = {
      enableGaussianColorNoise: config.enableGaussianColorNoise ?? true,
      colorNoiseStdDev: config.colorNoiseStdDev ?? 3.0,
      enableQuadraticDepthNoise: config.enableQuadraticDepthNoise ?? true,
      depthNoiseCoeffA: config.depthNoiseCoeffA ?? 0.0015,
      depthNoiseCoeffB: config.depthNoiseCoeffB ?? 0.002,
      frameDropProbability: config.frameDropProbability ?? 0.05,
      latencyMilliseconds: config.latencyMilliseconds ?? 33.0,
    };
  }

  /**
   * Applies realistic sensor noise to RGB and depth buffers.
   */
  public corruptFrame(rawFrame: SyntheticCameraFrame): SyntheticCameraFrame {
    // 1. Frame Drop Check
    const isDropped = Math.random() < this.config.frameDropProbability;
    if (isDropped) {
      return {
        ...rawFrame,
        isDroppedFrame: true,
        latencyMs: this.config.latencyMilliseconds,
      };
    }

    const corruptedRgb = new Uint8ClampedArray(rawFrame.rgbBuffer);
    const corruptedDepth = new Float32Array(rawFrame.depthBuffer);

    // 2. Gaussian Color Noise
    if (this.config.enableGaussianColorNoise) {
      const stdDev = this.config.colorNoiseStdDev;
      for (let i = 0; i < corruptedRgb.length; i += 4) {
        const noiseR = (Math.random() - 0.5) * 2.0 * stdDev;
        const noiseG = (Math.random() - 0.5) * 2.0 * stdDev;
        const noiseB = (Math.random() - 0.5) * 2.0 * stdDev;

        corruptedRgb[i] = Math.max(0, Math.min(255, corruptedRgb[i] + noiseR));
        corruptedRgb[i + 1] = Math.max(0, Math.min(255, corruptedRgb[i + 1] + noiseG));
        corruptedRgb[i + 2] = Math.max(0, Math.min(255, corruptedRgb[i + 2] + noiseB));
      }
    }

    // 3. Quadratic Depth Noise: sigma(z) = a * z^2 + b
    if (this.config.enableQuadraticDepthNoise) {
      for (let i = 0; i < corruptedDepth.length; i++) {
        const z = corruptedDepth[i];
        if (z > 0.0) {
          const sigma = this.config.depthNoiseCoeffA * z * z + this.config.depthNoiseCoeffB;
          const noiseZ = (Math.random() - 0.5) * 2.0 * sigma;
          corruptedDepth[i] = Math.max(0.1, z + noiseZ);
        }
      }
    }

    return {
      ...rawFrame,
      rgbBuffer: corruptedRgb,
      depthBuffer: corruptedDepth,
      isDroppedFrame: false,
      latencyMs: this.config.latencyMilliseconds,
    };
  }

  /**
   * Pushes frame into hardware latency queue and pops when latency duration expires.
   */
  public processLatencyQueue(
    frame: SyntheticCameraFrame,
    currentTimestampMs: number
  ): SyntheticCameraFrame | null {
    this.frameBufferQueue.push({
      frame,
      enqueueTimestampMs: currentTimestampMs,
    });

    // Check oldest frame in queue
    const oldest = this.frameBufferQueue[0];
    if (currentTimestampMs - oldest.enqueueTimestampMs >= this.config.latencyMilliseconds) {
      return this.frameBufferQueue.shift()!.frame;
    }

    return null;
  }
}

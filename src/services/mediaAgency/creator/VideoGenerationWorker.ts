/**
 * CHATR VIRTUAL CREATOR — REPLACEABLE VIDEO GENERATION WORKER
 *
 * Pluggable worker client that communicates with any backend:
 * - Free Google Colab / Kaggle notebook (Wan 2.1 1.3B + MuseTalk) via Cloudflare tunnel
 * - Local GPU if available in future
 * - Simulated development mock for contract testing
 */

import { UnifiedPerformanceContract, buildWanPerformancePrompt } from './PerformanceContract';

export interface WorkerHealth {
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  gpuName: string;
  vramTotalGb: number;
  vramFreeGb: number;
  modelsLoaded: {
    wanI2V: boolean;
    museTalk: boolean;
  };
  backend: 'COLAB_T4' | 'KAGGLE_T4' | 'LOCAL_CUDA' | 'SIMULATED_MOCK';
  latencyMs: number;
}

export interface I2VRequest {
  jobId: string;
  characterReferenceUrl: string;
  performancePrompt: string;
  negativePrompt: string;
  durationSec: number;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
  seed: number;
}

export interface LipSyncRequest {
  jobId: string;
  videoUrl: string;
  audioUrl: string;
  faceBBoxPad?: number;
}

export type JobProgressState =
  | 'QUEUED'
  | 'VIDEO_MOTION_GENERATING'
  | 'VIDEO_MOTION_GENERATED'
  | 'LIP_SYNC_PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface JobStatus {
  jobId: string;
  state: JobProgressState;
  progressPercent: number;
  videoUrl?: string;
  generationDurationSec?: number;
  fps?: number;
  error?: string;
  metadata?: {
    model: string;
    vramUsedGb: number;
    stepsTaken: number;
    seed: number;
  };
}

export class VideoGenerationWorkerClient {
  private workerBaseUrl: string;

  constructor(workerBaseUrl: string = 'http://localhost:8000') {
    this.workerBaseUrl = workerBaseUrl.replace(/\/$/, '');
  }

  public setEndpoint(url: string) {
    this.workerBaseUrl = url.replace(/\/$/, '');
  }

  public getEndpoint(): string {
    return this.workerBaseUrl;
  }

  /**
   * Health check to test connectivity with Colab/Kaggle worker
   */
  public async healthCheck(): Promise<WorkerHealth> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.workerBaseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });

      if (!response.ok) {
        throw new Error(`Worker returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        status: 'ONLINE',
        gpuName: data.gpu_name || 'NVIDIA T4 (16GB)',
        vramTotalGb: data.vram_total_gb || 15.8,
        vramFreeGb: data.vram_free_gb || 11.2,
        modelsLoaded: {
          wanI2V: !!data.wan_loaded,
          museTalk: !!data.musetalk_loaded
        },
        backend: data.backend || 'COLAB_T4',
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        status: 'OFFLINE',
        gpuName: 'Disconnected',
        vramTotalGb: 0,
        vramFreeGb: 0,
        modelsLoaded: { wanI2V: false, museTalk: false },
        backend: 'SIMULATED_MOCK',
        latencyMs: Date.now() - startTime
      };
    }
  }

  /**
   * Generate raw physical motion video from a reference image using Wan 2.1 I2V
   */
  public async generateImageToVideo(req: I2VRequest): Promise<JobStatus> {
    try {
      const response = await fetch(`${this.workerBaseUrl}/generate-i2v`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        throw new Error(`Worker failed to submit job: ${response.statusText}`);
      }

      return await response.json();
    } catch (err: any) {
      return {
        jobId: req.jobId,
        state: 'FAILED',
        progressPercent: 0,
        error: `Could not reach video generation worker at ${this.workerBaseUrl}: ${err.message}`
      };
    }
  }

  /**
   * High-level contract dispatcher: converts UnifiedPerformanceContract to I2V worker call
   */
  public async generatePerformanceClip(contract: UnifiedPerformanceContract): Promise<JobStatus> {
    const payload = buildWanPerformancePrompt(contract);
    const i2vReq: I2VRequest = {
      jobId: contract.id,
      characterReferenceUrl: payload.referencePath,
      performancePrompt: payload.prompt,
      negativePrompt: payload.negativePrompt,
      durationSec: payload.durationSec,
      fps: 16,
      resolution: {
        width: contract.resolution.width,
        height: contract.resolution.height
      },
      seed: 42
    };

    return this.generateImageToVideo(i2vReq);
  }

  /**
   * Audio-driven lip sync using MuseTalk
   */
  public async generateLipSync(req: LipSyncRequest): Promise<JobStatus> {
    try {
      const response = await fetch(`${this.workerBaseUrl}/generate-lipsync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        throw new Error(`Worker failed lipsync: ${response.statusText}`);
      }

      return await response.json();
    } catch (err: any) {
      return {
        jobId: req.jobId,
        state: 'FAILED',
        progressPercent: 0,
        error: err.message
      };
    }
  }

  /**
   * Poll active job status
   */
  public async getJobStatus(jobId: string): Promise<JobStatus> {
    try {
      const res = await fetch(`${this.workerBaseUrl}/job-status/${jobId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        jobId,
        state: 'FAILED',
        progressPercent: 0,
        error: err.message
      };
    }
  }

  /**
   * Returns the direct video download URL
   */
  public getDownloadUrl(jobId: string): string {
    return `${this.workerBaseUrl}/download/${jobId}`;
  }
}

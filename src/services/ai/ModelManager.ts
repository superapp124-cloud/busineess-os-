/**
 * CHATR Model Manager
 * src/services/ai/ModelManager.ts
 *
 * Coordinates downloading, verifying, storing, and deleting the on-device GGUF model
 * (~491 MB). Bridges the TypeScript application layer with Android native WorkManager
 * and app-private scoped storage.
 */

import { Capacitor } from '@capacitor/core';
import { localAIEngine, NativePlugin } from './LocalAIEngine';

export interface ModelStatus {
  modelId: string;
  isInstalled: boolean;
  isDownloading: boolean;
  progressPercent: number;
  downloadedBytes: number;
  totalBytes: number;
  downloadSpeedMbPerSec: number;
  error?: string | null;
  sha256Matched?: boolean;
  localPath?: string;
}

export const PRODUCTION_GGUF_CONFIG = {
  modelId: 'CHATR-Local-0.5B-v1',
  name: 'Qwen2.5-0.5B-Instruct',
  format: 'GGUF',
  quantization: 'Q4_K_M',
  // Verified from HuggingFace LFS API on 2026-09-28:
  // Source: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/tree/main
  // File: qwen2.5-0.5b-instruct-q4_k_m.gguf
  // LFS SHA-256 (oid): 74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db
  // Exact size: 491,400,032 bytes (468.5 MiB)
  totalBytes: 491_400_032,
  url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
  // This is the LFS content SHA-256 (not the pointer SHA). Must match post-download verification.
  expectedSha256: '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db',
  requiredFreeSpaceBytes: 1_500_000_000, // 1.5 GB safety buffer
};

const STORAGE_KEY_MODEL_STATUS = 'chatr.model.status';

export class ModelManager {
  private static instance: ModelManager;
  private currentStatus: ModelStatus = {
    modelId: PRODUCTION_GGUF_CONFIG.modelId,
    isInstalled: false,
    isDownloading: false,
    progressPercent: 0,
    downloadedBytes: 0,
    totalBytes: PRODUCTION_GGUF_CONFIG.totalBytes,
    downloadSpeedMbPerSec: 0,
    error: null,
  };

  private listeners: Set<(status: ModelStatus) => void> = new Set();
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.restorePersistedStatus();
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  private restorePersistedStatus(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_MODEL_STATUS);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.currentStatus = { ...this.currentStatus, ...parsed };
      }
    } catch {
      // Ignore parse errors
    }
  }

  private persistStatus(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY_MODEL_STATUS, JSON.stringify(this.currentStatus));
    } catch {
      // Ignore storage errors
    }
  }

  public subscribe(listener: (status: ModelStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.persistStatus();
    for (const listener of this.listeners) {
      try {
        listener(this.currentStatus);
      } catch (err) {
        console.error('[ModelManager] Listener error:', err);
      }
    }
  }

  /**
   * Fetch live model status from native storage or local state
   */
  public async getModelStatus(): Promise<ModelStatus> {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await NativePlugin.getModelStatus({ modelId: PRODUCTION_GGUF_CONFIG.modelId });
        this.currentStatus = {
          ...this.currentStatus,
          ...status,
        };
        this.notify();
        return this.currentStatus;
      } catch (err) {
        console.debug('[ModelManager] Native getModelStatus failed:', err);
      }
    }

    return this.currentStatus;
  }

  /**
   * Request download of the 491 MB GGUF model
   */
  public async downloadModel(): Promise<void> {
    if (this.currentStatus.isDownloading || this.currentStatus.isInstalled) {
      return;
    }

    this.currentStatus = {
      ...this.currentStatus,
      isDownloading: true,
      progressPercent: 0,
      downloadedBytes: 0,
      error: null,
    };
    this.notify();

    if (Capacitor.isNativePlatform()) {
      try {
        await NativePlugin.startModelDownload({
          modelId: PRODUCTION_GGUF_CONFIG.modelId,
          url: PRODUCTION_GGUF_CONFIG.url,
          expectedSha256: PRODUCTION_GGUF_CONFIG.expectedSha256,
        });
        this.startNativePolling();
        return;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Download failed to start';
        this.currentStatus = {
          ...this.currentStatus,
          isDownloading: false,
          error: message,
        };
        this.notify();
        throw err;
      }
    }

    // Web/Dev Simulation: Simulates download progress over 10 seconds for UI testing
    this.simulateDevDownload();
  }

  /**
   * Cancel in-progress download
   */
  public async cancelDownload(): Promise<void> {
    this.stopNativePolling();

    if (Capacitor.isNativePlatform()) {
      try {
        await NativePlugin.cancelModelDownload({ modelId: PRODUCTION_GGUF_CONFIG.modelId });
      } catch (err) {
        console.warn('[ModelManager] Cancel download error:', err);
      }
    }

    this.currentStatus = {
      ...this.currentStatus,
      isDownloading: false,
      progressPercent: 0,
      downloadedBytes: 0,
      downloadSpeedMbPerSec: 0,
      error: 'Download cancelled by user',
    };
    this.notify();
  }

  /**
   * Delete installed GGUF model file and reclaim ~491 MB storage
   */
  public async deleteModel(): Promise<void> {
    this.stopNativePolling();

    if (Capacitor.isNativePlatform()) {
      try {
        await NativePlugin.deleteModel({ modelId: PRODUCTION_GGUF_CONFIG.modelId });
      } catch (err) {
        console.warn('[ModelManager] Delete model error:', err);
      }
    }

    // Also unload from engine if loaded
    await localAIEngine.unloadModel();

    this.currentStatus = {
      modelId: PRODUCTION_GGUF_CONFIG.modelId,
      isInstalled: false,
      isDownloading: false,
      progressPercent: 0,
      downloadedBytes: 0,
      totalBytes: PRODUCTION_GGUF_CONFIG.totalBytes,
      downloadSpeedMbPerSec: 0,
      error: null,
      sha256Matched: false,
      localPath: undefined,
    };
    this.notify();
  }

  private startNativePolling(): void {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(async () => {
      try {
        const status = await NativePlugin.getModelStatus({ modelId: PRODUCTION_GGUF_CONFIG.modelId });
        this.currentStatus = { ...this.currentStatus, ...status };
        this.notify();

        if (status.isInstalled || status.error || !status.isDownloading) {
          this.stopNativePolling();
          if (status.isInstalled) {
            await localAIEngine.loadModel(status.localPath);
          }
        }
      } catch {
        this.stopNativePolling();
      }
    }, 1000);
  }

  private stopNativePolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private simulateDevDownload(): void {
    let currentBytes = 0;
    const stepBytes = PRODUCTION_GGUF_CONFIG.totalBytes / 20; // 20 steps (approx 10s)

    const interval = setInterval(() => {
      if (!this.currentStatus.isDownloading) {
        clearInterval(interval);
        return;
      }

      currentBytes += stepBytes;
      if (currentBytes >= PRODUCTION_GGUF_CONFIG.totalBytes) {
        currentBytes = PRODUCTION_GGUF_CONFIG.totalBytes;
        clearInterval(interval);
        this.currentStatus = {
          ...this.currentStatus,
          isDownloading: false,
          isInstalled: true,
          progressPercent: 100,
          downloadedBytes: PRODUCTION_GGUF_CONFIG.totalBytes,
          downloadSpeedMbPerSec: 0,
          sha256Matched: true,
          localPath: '/data/user/0/com.chatr.app/files/models/chatr-local-0.5b-v1.gguf',
          error: null,
        };
        this.notify();
        localAIEngine.loadModel();
      } else {
        const percent = Math.round((currentBytes / PRODUCTION_GGUF_CONFIG.totalBytes) * 100);
        this.currentStatus = {
          ...this.currentStatus,
          progressPercent: percent,
          downloadedBytes: currentBytes,
          downloadSpeedMbPerSec: 24.5,
        };
        this.notify();
      }
    }, 500);
  }
}

export const modelManager = ModelManager.getInstance();

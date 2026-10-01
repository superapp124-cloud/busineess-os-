/**
 * CHATR SI OS — Android AICore Provider
 * src/ai/providers/AICoreProvider.ts
 *
 * Interoperates with Android system-level AICore / Gemini Nano where supported.
 * Highly optimized, zero RAM impact on app process, hardware accelerated via NPU.
 */

import { Capacitor } from '@capacitor/core';
import { ChatrAIProvider, ProviderInfo, AIGenerationOptions, AIGenerationResult, AIProviderId } from '../runtime/types';

export class AICoreProvider implements ChatrAIProvider {
  readonly id: AIProviderId = 'aicore';
  readonly name = 'Android AICore (Gemini Nano)';

  private isAvailableOnDevice = false;
  private isLoaded = false;

  async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      this.isAvailableOnDevice = false;
      return false;
    }

    try {
      // Check legacy/system AICore status if present
      if (typeof window !== 'undefined' && window.ChatrNativeRuntime?.geminiNanoGenerate) {
        this.isAvailableOnDevice = true;
        this.isLoaded = true;
        return true;
      }
      this.isAvailableOnDevice = false;
      return false;
    } catch {
      this.isAvailableOnDevice = false;
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    return this.isAvailableOnDevice;
  }

  async loadModel(_modelId: string): Promise<boolean> {
    // AICore models are managed by the Android OS; loading is OS-governed
    return this.isAvailableOnDevice;
  }

  async unloadModel(): Promise<void> {
    this.isLoaded = false;
  }

  async generate(prompt: string, options: AIGenerationOptions = {}): Promise<AIGenerationResult> {
    const start = Date.now();
    if (!this.isAvailableOnDevice || typeof window === 'undefined' || !window.ChatrNativeRuntime?.geminiNanoGenerate) {
      throw new Error('Android AICore is not available on this device');
    }

    const payload = JSON.stringify({
      prompt,
      systemPrompt: options.systemPrompt,
      maxTokens: options.maxTokens ?? 256,
      temperature: options.temperature ?? 0.7,
    });

    const rawResponse = window.ChatrNativeRuntime.geminiNanoGenerate(payload);
    const latency = Date.now() - start;

    return {
      text: rawResponse,
      tokensGenerated: Math.round(rawResponse.length / 4),
      latencyMs: latency,
      providerId: this.id,
      modelId: 'gemini-nano-v2',
      isLocal: true,
    };
  }

  getProviderInfo(): ProviderInfo {
    return {
      id: this.id,
      name: this.name,
      version: '2.0.0',
      isAvailable: this.isAvailableOnDevice,
      isLoaded: this.isLoaded,
      activeModel: this.isAvailableOnDevice ? 'gemini-nano-v2' : undefined,
      capabilities: {
        supportsStreaming: true,
        supportsToolCalling: false,
        supportsVision: false,
        supportsEmbeddings: false,
        isLocalOnly: true,
        maxContextLength: 4096,
      },
      memoryUsageMb: 0, // OS managed process
      environment: Capacitor.isNativePlatform() ? 'android' : 'web',
    };
  }
}

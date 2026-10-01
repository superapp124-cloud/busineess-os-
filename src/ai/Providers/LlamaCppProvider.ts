/**
 * CHATR SI OS — llama.cpp Native Provider
 * src/ai/providers/LlamaCppProvider.ts
 *
 * Production On-Device inference provider for Android ARM64 via libllama.so.
 * Loads GGUF models from app-private storage.
 */

import { Capacitor } from '@capacitor/core';
import { ChatrAIProvider, ProviderInfo, AIGenerationOptions, AIGenerationResult, AIProviderId } from '../runtime/types';
import { NativePlugin } from '@/services/ai/LocalAIEngine';

export class LlamaCppProvider implements ChatrAIProvider {
  readonly id: AIProviderId = 'llama.cpp';
  readonly name = 'llama.cpp Native Engine (ARM64)';

  private isInitialized = false;
  private isModelLoaded = false;
  private activeModelId = 'CHATR-LOCAL-0.5B-V1';
  private memoryUsageMb = 0;

  async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      this.isInitialized = false;
      return false;
    }

    try {
      const avail = await NativePlugin.checkAvailability();
      this.isInitialized = avail.available;
      return this.isInitialized;
    } catch {
      this.isInitialized = false;
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    if (!this.isInitialized) {
      return await this.initialize();
    }
    return this.isInitialized;
  }

  async loadModel(modelId: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      if (NativePlugin.loadModel) {
        const res = await NativePlugin.loadModel({ modelPath: modelId });
        this.isModelLoaded = res.success;
        if (res.success) {
          this.activeModelId = modelId;
          this.memoryUsageMb = 550; // standard budget for 0.5B Q4_K_M
        }
        return res.success;
      }
      this.isModelLoaded = true;
      this.activeModelId = modelId;
      this.memoryUsageMb = 550;
      return true;
    } catch (e) {
      console.warn('[LlamaCppProvider] Failed to load model:', e);
      this.isModelLoaded = false;
      return false;
    }
  }

  async unloadModel(): Promise<void> {
    if (Capacitor.isNativePlatform() && NativePlugin.unloadModel) {
      try {
        await NativePlugin.unloadModel();
      } catch (e) {
        console.warn('[LlamaCppProvider] Error unloading model:', e);
      }
    }
    this.isModelLoaded = false;
    this.memoryUsageMb = 0;
  }

  async generate(prompt: string, options: AIGenerationOptions = {}): Promise<AIGenerationResult> {
    const start = Date.now();
    
    // Format ChatML
    const chatML = [
      options.systemPrompt ? `<|im_start|>system\n${options.systemPrompt}<|im_end|>\n` : '',
      options.tools && options.tools.length > 0 
        ? `<|im_start|>system\nAvailable Tools:\n${JSON.stringify(options.tools, null, 2)}\n<|im_end|>\n` 
        : '',
      `<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`
    ].join('');

    const res = await NativePlugin.generate({
      prompt: chatML,
      systemPrompt: options.systemPrompt,
      maxOutputTokens: options.maxTokens ?? 512,
      temperature: options.temperature ?? 0.7,
      stopSequences: options.stopSequences ?? ['<|im_end|>', '<|endoftext|>'],
    });

    if (res.gateBlocked) {
      throw new Error('Local generation blocked by device stability gate');
    }

    const text = res.text || res.jsonText || '';
    const toolCalls = this.parseToolCalls(text);
    const latency = Date.now() - start;

    return {
      text,
      toolCalls,
      tokensGenerated: Math.round(text.length / 4),
      latencyMs: latency,
      providerId: this.id,
      modelId: this.activeModelId,
      isLocal: true,
    };
  }

  private parseToolCalls(text: string) {
    const matches: Array<{ name: string; arguments: Record<string, unknown> }> = [];
    const regex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed.name) {
          matches.push({ name: parsed.name, arguments: parsed.arguments || {} });
        }
      } catch {
        // ignore malformed fragment
      }
    }
    return matches.length > 0 ? matches : undefined;
  }

  getProviderInfo(): ProviderInfo {
    return {
      id: this.id,
      name: this.name,
      version: '1.0.0',
      isAvailable: this.isInitialized,
      isLoaded: this.isModelLoaded,
      activeModel: this.isModelLoaded ? this.activeModelId : undefined,
      capabilities: {
        supportsStreaming: false,
        supportsToolCalling: true,
        supportsVision: false,
        supportsEmbeddings: false,
        isLocalOnly: true,
        maxContextLength: 2048,
      },
      memoryUsageMb: this.memoryUsageMb,
      environment: Capacitor.isNativePlatform() ? 'android' : 'web',
    };
  }
}

/**
 * CHATR SI OS — Model Registry
 * src/ai/models/ModelRegistry.ts
 *
 * Central catalog of SI models. Allows swapping models (0.5B, 1B, 3B, AICore, Cloud)
 * dynamically without rewriting agents or routers.
 */

import { ModelDefinition } from './types';

export class ModelRegistry {
  private static instance: ModelRegistry;
  private models: Map<string, ModelDefinition> = new Map();

  private constructor() {
    this.registerCatalog();
  }

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  private registerCatalog(): void {
    // Current Verified Production Bootstrap Model
    this.register({
      modelId: 'CHATR-LOCAL-0.5B-V1',
      name: 'Qwen2.5-0.5B-Instruct',
      version: '1.0.0',
      runtime: 'llama.cpp',
      format: 'GGUF',
      quantization: 'Q4_K_M',
      sizeBytes: 491_400_032,
      ramRequirementBytes: 600_000_000,
      contextLength: 2048,
      capabilities: ['text', 'tool-calling', 'hinglish', 'summarization', 'reasoning'],
      languages: ['en', 'hi', 'hinglish', 'bn', 'ta', 'te', 'mr'],
      toolCalling: true,
      vision: false,
      audio: false,
      minimumAndroid: 26,
      minimumRAMBytes: 4_000_000_000, // 4GB RAM minimum
      accelerators: ['NEON', 'FP16_DOTPROD'],
      sha256: '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db',
      downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
      isDefault: true,
    });

    // Future Tier B / Flagship 1.5B Local Model
    this.register({
      modelId: 'CHATR-LOCAL-1B-FUTURE',
      name: 'Qwen2.5-1.5B-Instruct',
      version: '1.0.0',
      runtime: 'llama.cpp',
      format: 'GGUF',
      quantization: 'Q4_K_M',
      sizeBytes: 986_000_000,
      ramRequirementBytes: 1_200_000_000,
      contextLength: 4096,
      capabilities: ['text', 'advanced-tool-calling', 'code', 'deep-reasoning'],
      languages: ['en', 'hi', 'hinglish', 'regional'],
      toolCalling: true,
      vision: false,
      audio: false,
      minimumAndroid: 28,
      minimumRAMBytes: 8_000_000_000, // 8GB RAM minimum
      accelerators: ['NEON', 'Vulkan'],
      sha256: 'future_hash_1b',
      isDefault: false,
    });

    // Android AICore / Gemini Nano Model
    this.register({
      modelId: 'ANDROID-AICORE-NANO',
      name: 'Gemini Nano',
      version: '2.0.0',
      runtime: 'aicore',
      format: 'API',
      quantization: 'INT4',
      sizeBytes: 0, // System resident
      ramRequirementBytes: 0,
      contextLength: 4096,
      capabilities: ['text', 'summarization', 'smart-reply'],
      languages: ['en', 'hi'],
      toolCalling: false,
      vision: false,
      audio: false,
      minimumAndroid: 34,
      minimumRAMBytes: 8_000_000_000,
      accelerators: ['NPU'],
      sha256: 'os_managed',
      isDefault: false,
    });

    // Managed Cloud Model Gateway
    this.register({
      modelId: 'CHATR-CLOUD-GATEWAY',
      name: 'CHATR Cloud Gateway (Gemini / OpenAI)',
      version: '2.5.0',
      runtime: 'cloud',
      format: 'API',
      quantization: 'FP16',
      sizeBytes: 0,
      ramRequirementBytes: 0,
      contextLength: 128000,
      capabilities: ['multimodal', 'complex-reasoning', 'web-search', 'massive-context'],
      languages: ['*'],
      toolCalling: true,
      vision: true,
      audio: true,
      minimumAndroid: 21,
      minimumRAMBytes: 0,
      accelerators: ['Cloud H100/TPU'],
      sha256: 'remote_api',
      isDefault: false,
    });
  }

  public register(model: ModelDefinition): void {
    this.models.set(model.modelId, model);
  }

  public getModel(modelId: string): ModelDefinition | undefined {
    return this.models.get(modelId);
  }

  public getDefaultLocalModel(): ModelDefinition {
    const defaultModel = Array.from(this.models.values()).find(m => m.isDefault);
    if (!defaultModel) {
      return Array.from(this.models.values())[0];
    }
    return defaultModel;
  }

  public listAll(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  public listLocalModels(): ModelDefinition[] {
    return Array.from(this.models.values()).filter(m => m.runtime === 'llama.cpp' || m.runtime === 'aicore');
  }
}

export const modelRegistry = ModelRegistry.getInstance();

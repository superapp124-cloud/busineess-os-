/**
 * CHATR SI OS — Ollama Provider (Development / Compatibility Layer)
 * src/ai/providers/OllamaProvider.ts
 *
 * Dedicated to desktop development, testing, and experimentation on PC/Mac.
 * Bridges to Ollama daemon on localhost:11434.
 * NEVER depended on in production Android builds.
 */

import { ChatrAIProvider, ProviderInfo, AIGenerationOptions, AIGenerationResult, AIProviderId } from '../runtime/types';

export class OllamaProvider implements ChatrAIProvider {
  readonly id: AIProviderId = 'ollama';
  readonly name = 'Ollama Development Bridge (localhost:11434)';

  private endpoint = 'http://localhost:11434';
  private isOnline = false;
  private activeModel = 'qwen2.5:0.5b';

  constructor(endpoint = 'http://localhost:11434') {
    this.endpoint = endpoint;
  }

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const res = await fetch(`${this.endpoint}/api/tags`, {
        signal: AbortSignal.timeout(1500),
      });
      this.isOnline = res.ok;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.initialize();
  }

  async loadModel(modelId: string): Promise<boolean> {
    this.activeModel = modelId;
    return true;
  }

  async unloadModel(): Promise<void> {
    // Ollama manages in-memory model lifecycle via keep_alive
  }

  async generate(prompt: string, options: AIGenerationOptions = {}): Promise<AIGenerationResult> {
    const start = Date.now();
    const res = await fetch(`${this.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.activeModel,
        messages: [
          ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 512,
        }
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 15000),
    });

    if (!res.ok) {
      throw new Error(`Ollama error HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.message?.content || data.response || '';
    const latency = Date.now() - start;

    return {
      text,
      tokensGenerated: Math.round(text.length / 4),
      latencyMs: latency,
      providerId: this.id,
      modelId: this.activeModel,
      isLocal: true,
    };
  }

  async embed(text: string): Promise<number[]> {
    try {
      const res = await fetch(`${this.endpoint}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.activeModel,
          prompt: text,
        }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.embedding)) {
          return data.embedding;
        }
      }
    } catch {
      // ignore
    }
    return new Array(384).fill(0);
  }

  getProviderInfo(): ProviderInfo {
    return {
      id: this.id,
      name: this.name,
      version: '0.3.0',
      isAvailable: this.isOnline,
      isLoaded: this.isOnline,
      activeModel: this.activeModel,
      capabilities: {
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsVision: false,
        supportsEmbeddings: true,
        isLocalOnly: true,
        maxContextLength: 4096,
      },
      memoryUsageMb: this.isOnline ? 600 : 0,
      environment: 'desktop',
    };
  }
}

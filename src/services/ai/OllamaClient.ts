/**
 * CHATR AI Training Infrastructure
 * src/services/ai/OllamaClient.ts
 *
 * TypeScript client for the local Ollama inference runtime.
 * Ollama is the SERVING layer — it runs trained adapters for live inference.
 * Base URL: http://localhost:11434
 */

const OLLAMA_BASE = 'http://localhost:11434';
const BASE_MODEL_TAG = 'qwen2.5:7b-instruct';
const CHATR_MODEL_PREFIX = 'chatr';

export interface OllamaModel {
  name: string;
  size: number;
  modifiedAt: string;
  digest: string;
}

export interface OllamaHealth {
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  url: string;
  models: string[];
  chatrAdapters: string[];
  baseModelLoaded: boolean;
  error?: string;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

export interface LatencyBenchmark {
  model: string;
  ttft_ms: number;
  tok_per_sec: number;
  error?: string;
}

// Mapping from CHATR capability → Ollama model tag
export type ChatrCapability =
  | 'general' | 'coding' | 'reasoning' | 'business' | 'finance'
  | 'seo' | 'marketing' | 'creator' | 'video' | 'research'
  | 'support' | 'agent' | 'rag' | 'meera';

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl = OLLAMA_BASE) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /** Returns the full Ollama model tag for a given CHATR capability + version. */
  getModelTag(capability: ChatrCapability, version = 'latest'): string {
    return `${CHATR_MODEL_PREFIX}:${capability}-${version}`;
  }

  /** Check if Ollama is reachable and list available models. */
  async getHealth(): Promise<OllamaHealth> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const models: string[] = (data.models ?? []).map((m: any) => m.name as string);
      const chatrAdapters = models.filter(m => m.startsWith(`${CHATR_MODEL_PREFIX}:`));
      return {
        status: 'ONLINE',
        url: this.baseUrl,
        models,
        chatrAdapters,
        baseModelLoaded: models.some(m => m.includes(BASE_MODEL_TAG.split(':')[0])),
      };
    } catch (err: any) {
      return {
        status: 'OFFLINE',
        url: this.baseUrl,
        models: [],
        chatrAdapters: [],
        baseModelLoaded: false,
        error: err.message,
      };
    }
  }

  /** List all CHATR capability adapters registered in Ollama. */
  async listChatrAdapters(): Promise<string[]> {
    const health = await this.getHealth();
    return health.chatrAdapters;
  }

  /**
   * Generate a response using the capability-specific CHATR adapter.
   * Falls back to base model if no adapter is loaded for the capability.
   */
  async generate(
    capability: ChatrCapability,
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    const adapters = await this.listChatrAdapters();
    const preferredTag = this.getModelTag(capability);
    const modelTag = adapters.includes(preferredTag) ? preferredTag : BASE_MODEL_TAG;

    const messages: Array<{ role: string; content: string }> = [];
    if (options.system) messages.push({ role: 'system', content: options.system });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelTag,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 512,
        },
      }),
    });
    if (!res.ok) throw new Error(`Ollama generate failed: HTTP ${res.status}`);
    const data = await res.json();
    return data.message?.content ?? '';
  }

  /**
   * Stream a response token by token from the capability adapter.
   */
  async *streamGenerate(
    capability: ChatrCapability,
    prompt: string,
    options: GenerateOptions = {}
  ): AsyncGenerator<string> {
    const adapters = await this.listChatrAdapters();
    const preferredTag = this.getModelTag(capability);
    const modelTag = adapters.includes(preferredTag) ? preferredTag : BASE_MODEL_TAG;

    const messages: Array<{ role: string; content: string }> = [];
    if (options.system) messages.push({ role: 'system', content: options.system });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelTag, messages, stream: true }),
    });
    if (!res.ok || !res.body) throw new Error(`Ollama stream failed: HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n').filter(Boolean)) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) yield json.message.content;
          if (json.done) return;
        } catch {
          // skip malformed lines
        }
      }
    }
  }

  /** Benchmark TTFT and throughput for a capability. */
  async benchmarkLatency(capability: ChatrCapability = 'general'): Promise<LatencyBenchmark> {
    const adapters = await this.listChatrAdapters();
    const preferredTag = this.getModelTag(capability);
    const modelTag = adapters.includes(preferredTag) ? preferredTag : BASE_MODEL_TAG;

    const start = performance.now();
    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelTag, prompt: 'Hello', stream: false }),
      });
      const elapsed = performance.now() - start;
      const data = await res.json();
      const evalDurationSec = (data.eval_duration ?? 1) / 1e9;
      return {
        model: modelTag,
        ttft_ms: Math.round(elapsed),
        tok_per_sec: Math.round((data.eval_count ?? 0) / evalDurationSec),
      };
    } catch (err: any) {
      return { model: modelTag, ttft_ms: 0, tok_per_sec: 0, error: err.message };
    }
  }
}

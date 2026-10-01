/**
 * CHATR Local SI Engine
 * src/services/ai/LocalAIEngine.ts
 *
 * Universal On-Device AI abstraction supporting:
 * 1. Native llama.cpp / GGUF execution on Android via Capacitor (libllama.so)
 * 2. Desktop Ollama development runtime (http://localhost:11434)
 * 3. Graceful fallback to deterministic heuristics
 *
 * Decouples all agents (Personal, Work, Search, Local, Jobs, Health, ChatrShield)
 * from native and desktop runtime specifics.
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

export type LocalAIProvider = 'NATIVE_LLAMA_CPP' | 'DESKTOP_OLLAMA' | 'HEURISTIC_FALLBACK';

export type LocalAIModelStatus =
  | 'NOT_INSTALLED'
  | 'DOWNLOADING'
  | 'VERIFYING'
  | 'READY'
  | 'LOADING'
  | 'RUNNING'
  | 'FAILED';

export interface LocalAIModelInfo {
  modelId: string;
  name: string;
  format: 'GGUF' | 'OLLAMA';
  quantization: string;
  sizeBytes: number;
  version: string;
  contextWindow: number;
}

export interface LocalAIRuntimeInfo {
  provider: LocalAIProvider;
  status: LocalAIModelStatus;
  isModelLoaded: boolean;
  activeContextTokens: number;
  lastInferenceLatencyMs: number;
  memoryUsageMb: number;
  platform: 'android' | 'ios' | 'web' | 'desktop';
}

export interface LocalAIToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LocalAIGenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  tools?: LocalAIToolDefinition[];
  timeoutMs?: number;
}

export interface LocalAIToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface LocalAIGenerateResult {
  text: string;
  toolCalls?: LocalAIToolCall[];
  tokensGenerated?: number;
  latencyMs: number;
  provider: LocalAIProvider;
  model: string;
}

interface NativeOnDeviceAiPlugin {
  checkAvailability(options?: { downloadIfNeeded?: boolean }): Promise<{
    available: boolean;
    status: string;
    model?: string;
    provider?: string;
    reason?: string;
  }>;
  generate(options: {
    prompt: string;
    systemPrompt?: string;
    maxOutputTokens?: number;
    temperature?: number;
    stopSequences?: string[];
  }): Promise<{
    text: string;
    gateBlocked?: boolean;
    tier?: string;
    latencyMs?: number;
    jsonText?: string;
  }>;
  loadModel?(options?: { modelPath?: string }): Promise<{ success: boolean }>;
  unloadModel?(): Promise<{ success: boolean }>;
  getModelStatus?(options?: { modelId?: string }): Promise<any>;
  startModelDownload?(options?: { modelId?: string; url?: string; expectedSha256?: string }): Promise<{ started: boolean }>;
  cancelModelDownload?(options?: { modelId?: string }): Promise<{ cancelled: boolean }>;
  deleteModel?(options?: { modelId?: string }): Promise<{ deleted: boolean }>;
}

export const NativePlugin = registerPlugin<NativeOnDeviceAiPlugin>('OnDeviceAi');

export const DEFAULT_LOCAL_MODEL: LocalAIModelInfo = {
  modelId: 'CHATR-Local-0.5B-v1',
  name: 'Qwen2.5-0.5B-Instruct',
  format: 'GGUF',
  quantization: 'Q4_K_M',
  // Verified from HuggingFace API on 2026-09-28:
  // LFS OID (SHA-256): 74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db
  // File: qwen2.5-0.5b-instruct-q4_k_m.gguf
  // Exact size: 491,400,032 bytes
  sizeBytes: 491_400_032,
  version: '1.0.0',
  contextWindow: 2048,
};

export class LocalAIEngine {
  private static instance: LocalAIEngine;
  private provider: LocalAIProvider = 'HEURISTIC_FALLBACK';
  private status: LocalAIModelStatus = 'NOT_INSTALLED';
  private isLoaded = false;
  private currentModel: LocalAIModelInfo = DEFAULT_LOCAL_MODEL;
  private lastLatencyMs = 0;
  private activeContextTokens = 0;
  private abortController: AbortController | null = null;
  private statusListeners: Set<(status: LocalAIModelStatus) => void> = new Set();
  private ollamaEndpoint = 'http://localhost:11434';

  private constructor() {
    this.detectInitialProvider();
  }

  public static getInstance(): LocalAIEngine {
    if (!LocalAIEngine.instance) {
      LocalAIEngine.instance = new LocalAIEngine();
    }
    return LocalAIEngine.instance;
  }

  private detectInitialProvider(): void {
    if (Capacitor.isNativePlatform()) {
      this.provider = 'NATIVE_LLAMA_CPP';
    } else {
      this.provider = 'HEURISTIC_FALLBACK';
    }
  }

  /**
   * Subscribe to model lifecycle changes
   */
  public onStatusChange(listener: (status: LocalAIModelStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(newStatus: LocalAIModelStatus): void {
    this.status = newStatus;
    for (const listener of this.statusListeners) {
      try {
        listener(newStatus);
      } catch (err) {
        console.error('[LocalAIEngine] Error in status listener:', err);
      }
    }
  }

  /**
   * Initialize and test runtime readiness
   */
  public async initialize(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const avail = await NativePlugin.checkAvailability();
        if (avail.available) {
          this.provider = 'NATIVE_LLAMA_CPP';
          this.setStatus('READY');
          return true;
        } else {
          this.setStatus('NOT_INSTALLED');
          return false;
        }
      } catch (err) {
        console.debug('[LocalAIEngine] Native plugin check failed:', err);
        this.setStatus('NOT_INSTALLED');
        return false;
      }
    }

    // On web/desktop dev environments, test Ollama local endpoint
    const ollamaOnline = await this.testOllamaConnection();
    if (ollamaOnline) {
      this.provider = 'DESKTOP_OLLAMA';
      this.setStatus('READY');
      return true;
    }

    this.provider = 'HEURISTIC_FALLBACK';
    this.setStatus('NOT_INSTALLED');
    return false;
  }

  private async testOllamaConnection(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const res = await fetch(`${this.ollamaEndpoint}/api/tags`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // Expected when Ollama daemon is not running on localhost
    }
    return false;
  }

  /**
   * Check if local AI is ready for immediate inference
   */
  public async isModelAvailable(): Promise<boolean> {
    if (this.status === 'READY' || this.status === 'RUNNING') return true;
    return await this.initialize();
  }

  /**
   * Load model weights into memory (mmap)
   */
  public async loadModel(modelId = DEFAULT_LOCAL_MODEL.modelId): Promise<boolean> {
    this.setStatus('LOADING');
    try {
      if (Capacitor.isNativePlatform() && NativePlugin.loadModel) {
        const res = await NativePlugin.loadModel({ modelPath: modelId });
        this.isLoaded = res.success;
      } else {
        this.isLoaded = true;
      }
      this.setStatus('READY');
      return true;
    } catch (err) {
      console.error('[LocalAIEngine] Failed to load model:', err);
      this.setStatus('FAILED');
      return false;
    }
  }

  /**
   * Unload model from RAM
   */
  public async unloadModel(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform() && NativePlugin.unloadModel) {
        await NativePlugin.unloadModel();
      }
    } finally {
      this.isLoaded = false;
      this.setStatus('READY');
    }
  }

  /**
   * Abort currently running generation
   */
  public async cancel(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.status === 'RUNNING') {
      this.setStatus('READY');
    }
  }

  /**
   * Universal text generation with ChatML formatting and optional tool support
   */
  public async generate(
    prompt: string,
    options: LocalAIGenerateOptions = {},
  ): Promise<LocalAIGenerateResult> {
    const startTime = Date.now();
    this.setStatus('RUNNING');
    this.abortController = new AbortController();

    try {
      const formattedPrompt = this.formatChatMLPrompt(prompt, options);

      let text = '';
      let toolCalls: LocalAIToolCall[] | undefined;

      if (this.provider === 'NATIVE_LLAMA_CPP' && Capacitor.isNativePlatform()) {
        const res = await NativePlugin.generate({
          prompt: formattedPrompt,
          systemPrompt: options.systemPrompt,
          maxOutputTokens: options.maxTokens ?? 512,
          temperature: options.temperature ?? 0.7,
          stopSequences: options.stopSequences ?? ['<|im_end|>', '<|endoftext|>'],
        });

        if (res.gateBlocked) {
          throw new Error('Local AI blocked by stability gate');
        }

        text = res.text || res.jsonText || '';
      } else if (this.provider === 'DESKTOP_OLLAMA') {
        const ollamaRes = await this.callDesktopOllama(prompt, options);
        text = ollamaRes;
      } else {
        text = this.heuristicFallback(prompt, options);
      }

      // Check if tool calls exist in output
      if (options.tools && options.tools.length > 0) {
        toolCalls = this.parseToolCalls(text);
      }

      this.lastLatencyMs = Date.now() - startTime;
      this.setStatus('READY');

      return {
        text,
        toolCalls,
        tokensGenerated: Math.round(text.length / 4),
        latencyMs: this.lastLatencyMs,
        provider: this.provider,
        model: this.currentModel.modelId,
      };
    } catch (err) {
      this.setStatus('FAILED');
      this.lastLatencyMs = Date.now() - startTime;
      console.warn('[LocalAIEngine] Generation fell back or failed:', err);

      // Return graceful fallback rather than throwing uncaught error
      return {
        text: this.heuristicFallback(prompt, options),
        latencyMs: this.lastLatencyMs,
        provider: 'HEURISTIC_FALLBACK',
        model: 'heuristic-rules-v1',
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Generate structured JSON conforming to a schema
   */
  public async generateStructured<T>(
    prompt: string,
    schema?: Record<string, unknown>,
    options: LocalAIGenerateOptions = {},
  ): Promise<T> {
    const jsonPrompt = [
      prompt,
      'IMPORTANT: Reply ONLY with a valid JSON object matching this schema. Do not include markdown codeblocks or conversational filler.',
      schema ? `Schema:\n${JSON.stringify(schema, null, 2)}` : '',
    ].join('\n\n');

    const result = await this.generate(jsonPrompt, {
      ...options,
      temperature: 0.1, // low temperature for deterministic JSON
    });

    try {
      return this.extractAndParseJson<T>(result.text);
    } catch {
      // Retry once with explicit correction prompt if malformed
      const fixPrompt = `Fix this invalid JSON and return ONLY the corrected valid JSON:\n\n${result.text}`;
      const fixResult = await this.generate(fixPrompt, { ...options, temperature: 0.0 });
      return this.extractAndParseJson<T>(fixResult.text);
    }
  }

  /**
   * Format prompt conforming to Qwen ChatML standard
   */
  private formatChatMLPrompt(userPrompt: string, options: LocalAIGenerateOptions): string {
    const systemContent = [
      options.systemPrompt || 'You are CHATR SI, an intelligent, helpful on-device assistant.',
      options.tools && options.tools.length > 0 ? this.formatToolsForPrompt(options.tools) : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    return [
      `<|im_start|>system\n${systemContent}\n<|im_end|>`,
      `<|im_start|>user\n${userPrompt}\n<|im_end|>`,
      '<|im_start|>assistant\n',
    ].join('\n');
  }

  private formatToolsForPrompt(tools: LocalAIToolDefinition[]): string {
    return [
      '# Available Tools:',
      'If you need to execute an action, call a tool by outputting:',
      '<tool_call>',
      '{"name": "toolName", "arguments": {"param1": "value1"}}',
      '</tool_call>',
      '',
      'Tools:',
      JSON.stringify(tools, null, 2),
    ].join('\n');
  }

  private parseToolCalls(text: string): LocalAIToolCall[] | undefined {
    const toolRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
    const matches: LocalAIToolCall[] = [];
    let match;

    while ((match = toolRegex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed.name && typeof parsed.name === 'string') {
          matches.push({
            name: parsed.name,
            arguments: parsed.arguments || {},
          });
        }
      } catch {
        // Ignore unparseable fragments
      }
    }

    return matches.length > 0 ? matches : undefined;
  }

  private extractAndParseJson<T>(rawText: string): T {
    // 1. Try direct parse
    try {
      return JSON.parse(rawText.trim());
    } catch {
      // 2. Extract from markdown code fence
      const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (fenceMatch) {
        return JSON.parse(fenceMatch[1].trim());
      }

      // 3. Extract outermost { ... } or [ ... ]
      const bracketMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (bracketMatch) {
        return JSON.parse(bracketMatch[1].trim());
      }

      throw new Error(`Unable to extract valid JSON from response: ${rawText.slice(0, 100)}...`);
    }
  }

  private async callDesktopOllama(
    prompt: string,
    options: LocalAIGenerateOptions,
  ): Promise<string> {
    const res = await fetch(`${this.ollamaEndpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:0.5b',
        messages: [
          ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 512,
        },
      }),
      signal: this.abortController?.signal,
    });

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data = await res.json();
    return data.message?.content || data.response || '';
  }

  private heuristicFallback(prompt: string, _options: LocalAIGenerateOptions): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('bp') || lower.includes('blood pressure')) {
      return 'Your recent blood pressure readings are available in Health OS.';
    }
    if (lower.includes('reminder') || lower.includes('alarm')) {
      return 'I can help you set a reminder or alarm.';
    }
    if (lower.includes('screen') || lower.includes('spam') || lower.includes('caller')) {
      return 'ChatrShield is actively screening incoming unknown callers.';
    }
    return 'CHATR Local AI processed your request.';
  }

  public getModelInfo(): LocalAIModelInfo {
    return this.currentModel;
  }

  public getRuntimeInfo(): LocalAIRuntimeInfo {
    return {
      provider: this.provider,
      status: this.status,
      isModelLoaded: this.isLoaded,
      activeContextTokens: this.activeContextTokens,
      lastInferenceLatencyMs: this.lastLatencyMs,
      memoryUsageMb: this.isLoaded ? 550 : 0,
      platform: Capacitor.isNativePlatform() ? 'android' : 'web',
    };
  }
}

export const localAIEngine = LocalAIEngine.getInstance();

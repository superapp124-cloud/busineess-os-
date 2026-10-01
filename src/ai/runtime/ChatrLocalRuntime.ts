/**
 * CHATR SI OS — ChatrLocalRuntime
 * src/ai/runtime/ChatrLocalRuntime.ts
 *
 * Universal On-Device AI runtime orchestrator. Manages provider plugins,
 * dynamic switching between llama.cpp, AICore, LiteRT, Ollama, Cloud, and Heuristics.
 */

import { ChatrAIProvider, ProviderInfo, AIProviderId, AIGenerationOptions, AIGenerationResult } from './types';
import { LlamaCppProvider } from '../Providers/LlamaCppProvider';
import { AICoreProvider } from '../Providers/AICoreProvider';
import { LiteRTProvider } from '../Providers/LiteRTProvider';
import { OllamaProvider } from '../Providers/OllamaProvider';
import { CloudProvider } from '../Providers/CloudProvider';
import { HeuristicFallbackProvider } from '../Providers/HeuristicFallbackProvider';

export class ChatrLocalRuntime {
  private static instance: ChatrLocalRuntime;
  private providers: Map<AIProviderId, ChatrAIProvider> = new Map();
  private primaryProviderId: AIProviderId = 'llama.cpp';
  private fallbackProvider: ChatrAIProvider = new HeuristicFallbackProvider();

  private constructor() {
    this.registerDefaultProviders();
  }

  public static getInstance(): ChatrLocalRuntime {
    if (!ChatrLocalRuntime.instance) {
      ChatrLocalRuntime.instance = new ChatrLocalRuntime();
    }
    return ChatrLocalRuntime.instance;
  }

  private registerDefaultProviders(): void {
    this.registerProvider(new LlamaCppProvider());
    this.registerProvider(new AICoreProvider());
    this.registerProvider(new LiteRTProvider());
    this.registerProvider(new OllamaProvider());
    this.registerProvider(new CloudProvider());
    this.registerProvider(this.fallbackProvider);
  }

  public registerProvider(provider: ChatrAIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: AIProviderId): ChatrAIProvider | undefined {
    return this.providers.get(id);
  }

  public listProviders(): ProviderInfo[] {
    return Array.from(this.providers.values()).map(p => p.getProviderInfo());
  }

  public async initialize(): Promise<void> {
    for (const provider of this.providers.values()) {
      try {
        await provider.initialize();
      } catch (err) {
        console.debug(`[ChatrLocalRuntime] Provider ${provider.id} init failed:`, err);
      }
    }
  }

  /**
   * Resolves the best available provider according to LOCAL-FIRST policy
   */
  public async resolveProvider(preferLocal = true, allowCloud = false): Promise<ChatrAIProvider> {
    // 1. Try llama.cpp production native engine first
    const llama = this.providers.get('llama.cpp');
    if (llama && await llama.isAvailable()) {
      this.primaryProviderId = 'llama.cpp';
      return llama;
    }

    // 2. Try Android AICore / Gemini Nano
    const aicore = this.providers.get('aicore');
    if (aicore && await aicore.isAvailable()) {
      this.primaryProviderId = 'aicore';
      return aicore;
    }

    // 3. Try Desktop Ollama if developing on PC/Mac
    const ollama = this.providers.get('ollama');
    if (ollama && await ollama.isAvailable()) {
      this.primaryProviderId = 'ollama';
      return ollama;
    }

    // 4. If Cloud is explicitly allowed by privacy policy and device is online
    if (allowCloud) {
      const cloud = this.providers.get('cloud');
      if (cloud && await cloud.isAvailable()) {
        this.primaryProviderId = 'cloud';
        return cloud;
      }
    }

    // 5. Fallback to deterministic rules engine (100% resilient)
    this.primaryProviderId = 'heuristic';
    return this.fallbackProvider;
  }

  /**
   * Universal generation dispatch
   */
  public async generate(
    prompt: string, 
    options: AIGenerationOptions = {}, 
    allowCloud = false
  ): Promise<AIGenerationResult> {
    const provider = await this.resolveProvider(true, allowCloud);
    try {
      return await provider.generate(prompt, options);
    } catch (err) {
      console.warn(`[ChatrLocalRuntime] Provider ${provider.id} failed, attempting safe fallback:`, err);
      return await this.fallbackProvider.generate(prompt, options);
    }
  }

  /**
   * Universal embedding generation for Local RAG
   */
  public async embed(text: string): Promise<number[]> {
    // 1. Try LiteRT local embeddings
    const litert = this.providers.get('litert') as LiteRTProvider;
    if (litert && litert.embed) {
      return await litert.embed(text);
    }
    // 2. Try Ollama embeddings if on desktop
    const ollama = this.providers.get('ollama') as OllamaProvider;
    if (ollama && await ollama.isAvailable() && ollama.embed) {
      return await ollama.embed(text);
    }
    // 3. Fallback deterministic embedding
    return new LiteRTProvider().embed(text);
  }

  public getPrimaryProviderId(): AIProviderId {
    return this.primaryProviderId;
  }
}

export const chatrLocalRuntime = ChatrLocalRuntime.getInstance();

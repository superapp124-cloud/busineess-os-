/**
 * CHATR SI OS — Runtime Types & Interfaces
 * src/ai/runtime/types.ts
 *
 * Defines the plugin architecture for ChatrLocalRuntime.
 * Decouples agents and router from concrete inference engines.
 */

export type AIProviderId = 
  | 'llama.cpp'
  | 'aicore'
  | 'litert'
  | 'ollama'
  | 'cloud'
  | 'heuristic';

export type RuntimeEnvironment = 'android' | 'ios' | 'desktop' | 'web';

export interface ProviderCapability {
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  supportsVision: boolean;
  supportsEmbeddings: boolean;
  isLocalOnly: boolean;
  maxContextLength: number;
}

export interface ProviderInfo {
  id: AIProviderId;
  name: string;
  version: string;
  isAvailable: boolean;
  isLoaded: boolean;
  activeModel?: string;
  capabilities: ProviderCapability;
  memoryUsageMb: number;
  environment: RuntimeEnvironment;
}

export interface AIToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface AIGenerationOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  timeoutMs?: number;
  streamingCallback?: (token: string) => void;
}

export interface AIGenerationResult {
  text: string;
  toolCalls?: AIToolCall[];
  tokensGenerated?: number;
  latencyMs: number;
  providerId: AIProviderId;
  modelId: string;
  isLocal: boolean;
}

export interface ChatrAIProvider {
  readonly id: AIProviderId;
  readonly name: string;

  initialize(): Promise<boolean>;
  isAvailable(): Promise<boolean>;
  loadModel(modelId: string): Promise<boolean>;
  unloadModel(): Promise<void>;
  
  generate(prompt: string, options?: AIGenerationOptions): Promise<AIGenerationResult>;
  embed?(text: string): Promise<number[]>;
  
  getProviderInfo(): ProviderInfo;
}

/**
 * CHATR SI OS — Heuristic Fallback Provider
 * src/ai/providers/HeuristicFallbackProvider.ts
 *
 * Deterministic rules-based provider. Never fails, 0ms latency, zero dependencies.
 * Ensures the system always yields a sensible, safe response.
 */

import { ChatrAIProvider, ProviderInfo, AIGenerationOptions, AIGenerationResult, AIProviderId } from '../runtime/types';

export class HeuristicFallbackProvider implements ChatrAIProvider {
  readonly id: AIProviderId = 'heuristic';
  readonly name = 'Deterministic Heuristic Rules Engine';

  async initialize(): Promise<boolean> {
    return true;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async loadModel(_modelId: string): Promise<boolean> {
    return true;
  }

  async unloadModel(): Promise<void> {
    // Stateless
  }

  async generate(prompt: string, _options: AIGenerationOptions = {}): Promise<AIGenerationResult> {
    const start = Date.now();
    const text = this.applyRules(prompt);

    return {
      text,
      tokensGenerated: Math.round(text.length / 4),
      latencyMs: Date.now() - start,
      providerId: this.id,
      modelId: 'heuristic-rules-v1',
      isLocal: true,
    };
  }

  private applyRules(prompt: string): string {
    const q = prompt.toLowerCase();

    if (/bp|blood pressure|systolic|diastolic/i.test(q)) {
      return 'Your recent blood pressure readings are available in Health OS.';
    }
    if (/heart rate|pulse|bpm/i.test(q)) {
      return 'Your heart rate records are accessible under Health OS vitals.';
    }
    if (/remind|alarm|schedule|meeting/i.test(q)) {
      return 'I can help you manage your reminders and calendar tasks.';
    }
    if (/call|dial|screen|spam/i.test(q)) {
      return 'ChatrShield is active and protecting your calls.';
    }
    return `Processed request: "${prompt.slice(0, 60)}".`;
  }

  getProviderInfo(): ProviderInfo {
    return {
      id: this.id,
      name: this.name,
      version: '1.0.0',
      isAvailable: true,
      isLoaded: true,
      activeModel: 'heuristic-rules-v1',
      capabilities: {
        supportsStreaming: false,
        supportsToolCalling: false,
        supportsVision: false,
        supportsEmbeddings: false,
        isLocalOnly: true,
        maxContextLength: 512,
      },
      memoryUsageMb: 0,
      environment: 'android',
    };
  }
}

/**
 * CHATR SI OS — Cloud Provider
 * src/ai/providers/CloudProvider.ts
 *
 * Secure server-side Cloud fallback via Supabase Edge Functions (ai-chat-assistant)
 * and managed LLMs (Gemini / OpenAI). Used ONLY when privacy policy permits (PUBLIC)
 * or when the user explicitly requests web knowledge.
 */

import { supabase } from '@/integrations/supabase/client';
import { ChatrAIProvider, ProviderInfo, AIGenerationOptions, AIGenerationResult, AIProviderId } from '../runtime/types';

export class CloudProvider implements ChatrAIProvider {
  readonly id: AIProviderId = 'cloud';
  readonly name = 'CHATR Cloud AI Gateway (Supabase Edge / Gemini / OpenAI)';

  async initialize(): Promise<boolean> {
    return true;
  }

  async isAvailable(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    return true;
  }

  async loadModel(_modelId: string): Promise<boolean> {
    return true;
  }

  async unloadModel(): Promise<void> {
    // Stateless cloud endpoints
  }

  async generate(prompt: string, options: AIGenerationOptions = {}): Promise<AIGenerationResult> {
    const start = Date.now();

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('Internet connection required for cloud intelligence');
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          action: 'chat',
          prompt,
          system_prompt: options.systemPrompt,
          messages: [{ role: 'user', content: prompt }]
        }
      });

      if (error) throw error;
      const text = data?.response || data?.summary || (typeof data === 'string' ? data : '') || '';
      const latency = Date.now() - start;

      return {
        text,
        tokensGenerated: Math.round(text.length / 4),
        latencyMs: latency,
        providerId: this.id,
        modelId: 'cloud-edge-v2',
        isLocal: false,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Cloud gateway request failed';
      throw new Error(`[CloudProvider] ${message}`);
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      id: this.id,
      name: this.name,
      version: '2.0.0',
      isAvailable: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isLoaded: true,
      activeModel: 'cloud-edge-v2',
      capabilities: {
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsVision: true,
        supportsEmbeddings: true,
        isLocalOnly: false,
        maxContextLength: 128000,
      },
      memoryUsageMb: 0,
      environment: 'web',
    };
  }
}

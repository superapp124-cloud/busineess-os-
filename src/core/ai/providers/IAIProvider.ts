import { IProvider } from '@/core/providers/ProviderRegistry';
import { IAIProviderResponse, ModelProfile } from '../runtime/RuntimeInterfaces';

export interface IAIProvider extends IProvider {
  /**
   * Discover and report available models dynamically.
   */
  getAvailableModels(): Promise<ModelProfile[]>;

  /**
   * Core AI Primitives
   */
  extractStructuredData<T>(text: string, schemaName: string, schemaDefinition?: any): Promise<IAIProviderResponse<T>>;
  classify(text: string, categories: string[]): Promise<IAIProviderResponse<{ category: string }>>;
  summarize(text: string): Promise<IAIProviderResponse<{ summary: string }>>;
  reason(context: string, goal: string): Promise<IAIProviderResponse<{ reasoning: string; decision: string }>>;
  generate(prompt: string): Promise<IAIProviderResponse<{ output: string }>>;
}

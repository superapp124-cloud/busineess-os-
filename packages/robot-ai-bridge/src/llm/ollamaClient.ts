/**
 * CHATR Local Ollama / Soup LLM Client (Gate 7)
 * Connects to local Ollama daemon (http://localhost:11434) with deterministic NLU fallback.
 */

import { OllamaGenerateResponse } from '../types';
import { PromptTemplates } from './promptTemplates';
import { MultilingualNlu } from '../language/multilingualNlu';

export class OllamaClient {
  public endpoint: string;
  public modelName: string;
  public timeoutMs: number;

  constructor(
    endpoint = 'http://localhost:11434/api/generate',
    modelName = 'llama3.2:3b',
    timeoutMs = 150
  ) {
    this.endpoint = endpoint;
    this.modelName = modelName;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Generates structured task decomposition using local Ollama, falling back to deterministic NLU if offline.
   */
  public async parseUserPrompt(userPrompt: string): Promise<OllamaGenerateResponse> {
    try {
      if (typeof fetch === 'undefined') {
        return this.fallbackParse(userPrompt);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const requestBody = {
        model: this.modelName,
        system: PromptTemplates.SYSTEM_PROMPT,
        prompt: PromptTemplates.buildUserPrompt(userPrompt),
        format: 'json',
        stream: false,
      };

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = await response.json();
      const rawJson = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;

      return {
        intent: rawJson.intent ?? 'UNKNOWN',
        targetCategory: rawJson.targetCategory ?? 'unknown',
        sourceLocation: rawJson.sourceLocation ?? 'kitchen',
        destinationLocation: rawJson.destinationLocation ?? 'user',
        isAmbiguous: Boolean(rawJson.isAmbiguous),
        confidence: Number(rawJson.confidence ?? 0.90),
        explanation: rawJson.explanation ?? 'Generated via local Ollama LLM.',
      };
    } catch {
      // Deterministic Offline Rule-Based Fallback
      return this.fallbackParse(userPrompt);
    }
  }

  private fallbackParse(userPrompt: string): OllamaGenerateResponse {
    const task = MultilingualNlu.parsePrompt(userPrompt);
    return {
      intent: task.intent,
      targetCategory: task.targetCategory,
      sourceLocation: task.sourceLocation,
      destinationLocation: task.destinationLocation,
      isAmbiguous: task.isAmbiguousReference,
      confidence: 0.95,
      explanation: `Parsed deterministically via CHATR Multi-Lingual NLU (${task.detectedLanguage}).`,
    };
  }
}

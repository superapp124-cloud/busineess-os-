/**
 * CHATR SI OS — Intelligence Selector
 * src/ai/router/IntelligenceSelector.ts
 *
 * Core Principle: "AI when intelligence is needed. Deterministic software when it is not."
 *
 * Prevents wasting battery and RAM invoking a 500 MB LLM for simple deterministic tasks
 * like setting an alarm, checking time, or direct calculations.
 */

export type IntelligenceExecutionClass = 
  | 'DETERMINISTIC'             // Clock, alarm, timer, math, simple toggle (0 MB, 0ms)
  | 'DETERMINISTIC_HEALTH_OS'  // Critical vitals, Emergency P0 alerts (Health OS authoritative)
  | 'SMALL_LOCAL'              // Everyday chat, personal notes, reminders, local explanations (0.5B GGUF)
  | 'LARGE_LOCAL'              // Multi-step reasoning on Tier A devices (1.5B+ GGUF)
  | 'SYSTEM_AI'                // Android AICore / Gemini Nano
  | 'CLOUD';                   // Public research, web queries, news

export interface IntelligenceDecision {
  executionClass: IntelligenceExecutionClass;
  shouldInvokeLLM: boolean;
  reason: string;
  deterministicTool?: string;
  deterministicParams?: Record<string, unknown>;
}

export class IntelligenceSelector {
  private static instance: IntelligenceSelector;

  private constructor() {}

  public static getInstance(): IntelligenceSelector {
    if (!IntelligenceSelector.instance) {
      IntelligenceSelector.instance = new IntelligenceSelector();
    }
    return IntelligenceSelector.instance;
  }

  /**
   * Evaluates prompt and returns optimal execution class
   */
  public select(prompt: string, options: { isCriticalHealth?: boolean; isOffline?: boolean } = {}): IntelligenceDecision {
    const q = prompt.toLowerCase().trim();

    // 1. Critical Health Override: Deterministic Health OS Pipeline
    if (options.isCriticalHealth || /chest pain|heart attack|stroke|severe emergency|unconscious/i.test(q)) {
      return {
        executionClass: 'DETERMINISTIC_HEALTH_OS',
        shouldInvokeLLM: false,
        reason: 'Critical safety triage is governed 100% deterministically by Health OS rules.',
      };
    }

    // 2. Purely Deterministic Tasks: Alarm, Timer, Flashlight, Simple Math
    const alarmMatch = q.match(/(?:set|create|turn on)\s+(?:an?\s+)?(?:alarm|timer)\s+(?:for\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (alarmMatch) {
      return {
        executionClass: 'DETERMINISTIC',
        shouldInvokeLLM: false,
        reason: 'Simple alarm/timer creation is handled deterministically without LLM battery overhead.',
        deterministicTool: 'setAlarm',
        deterministicParams: { time: alarmMatch[1] },
      };
    }

    if (/^(?:what time is it|current time|today's date|what day is it)$/i.test(q)) {
      return {
        executionClass: 'DETERMINISTIC',
        shouldInvokeLLM: false,
        reason: 'System clock queries are deterministic.',
        deterministicTool: 'getSystemTime',
      };
    }

    // 3. Public Web Knowledge: Cloud
    if (!options.isOffline && /search the latest|current news|weather in|who won|latest stock price/i.test(q)) {
      return {
        executionClass: 'CLOUD',
        shouldInvokeLLM: true,
        reason: 'Current public web knowledge requires external cloud retrieval.',
      };
    }

    // 4. Default: Small Local On-Device AI
    return {
      executionClass: 'SMALL_LOCAL',
      shouldInvokeLLM: true,
      reason: 'Standard conversational and contextual reasoning processed on local GGUF model.',
    };
  }
}

export const intelligenceSelector = IntelligenceSelector.getInstance();

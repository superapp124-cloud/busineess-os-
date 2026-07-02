import { ChatMessage } from './ProviderManager';
import { Logger } from '../../Infrastructure/Logger';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// MemoryManager — per-user, per-context in-memory conversation history
// ──────────────────────────────────────────────────────────────────────────────

export class MemoryManager {
  /** key: `${userId}_${contextId}` → ordered turns */
  private readonly histories: Map<string, ConversationTurn[]> = new Map();

  private makeKey(userId: string, contextId: string): string {
    return `${userId}_${contextId}`;
  }

  addTurn(
    userId: string,
    contextId: string,
    role: 'user' | 'assistant',
    content: string
  ): void {
    const key = this.makeKey(userId, contextId);
    if (!this.histories.has(key)) {
      this.histories.set(key, []);
    }
    this.histories.get(key)!.push({ role, content, timestamp: Date.now() });
    Logger.debug(`[MemoryManager] addTurn key=${key} role=${role}`);
  }

  getHistory(
    userId: string,
    contextId: string,
    limit = 20
  ): ConversationTurn[] {
    const key = this.makeKey(userId, contextId);
    const turns = this.histories.get(key) ?? [];
    return turns.slice(-limit);
  }

  clearHistory(userId: string, contextId: string): void {
    const key = this.makeKey(userId, contextId);
    this.histories.delete(key);
    Logger.info(`[MemoryManager] Cleared history for key=${key}`);
  }

  /**
   * Builds the full messages array ready to send to a provider,
   * including a system preamble and the last N conversation turns.
   */
  buildSystemContext(
    userId: string,
    contextId: string,
    systemPrompt?: string
  ): ChatMessage[] {
    const system: ChatMessage = {
      role: 'system',
      content:
        systemPrompt ??
        'You are CHATR Assistant — a helpful, concise AI built into the CHATR Enterprise Platform.',
    };

    const turns = this.getHistory(userId, contextId);
    const history: ChatMessage[] = turns.map((t) => ({
      role: t.role,
      content: t.content,
    }));

    return [system, ...history];
  }
}

export const memoryManager = new MemoryManager();

/**
 * CHATR AI Service
 *
 * Single entry point for all AI generation in CHATR.
 *
 * v0.1: Routes through CHATR Kernel (Conversation Module)
 *       when running in Electron desktop.
 * Fallback: Legacy Ollama IPC path (non-desktop environments).
 *
 * Privacy: Cloud AI is always disabled. Local only.
 *
 * Genesis v1.0
 */

import { conversation } from '@/core/conversation/ConversationSDK';

interface GenerateOptions {
  prompt: string;
  conversationId?: string;
  userId?: string;
  preferLocal?: boolean;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const value = err as { message?: unknown; error?: unknown };
    if (typeof value.message === 'string') return value.message;
    if (typeof value.error === 'string') return value.error;
  }
  return 'Unknown AI error';
}

/**
 * Check whether CHATR Kernel is available (desktop app only).
 */
async function isKernelAvailable(): Promise<boolean> {
  try {
    return await conversation.isAvailable();
  } catch {
    return false;
  }
}

/**
 * Generate an AI response.
 *
 * Routing priority:
 *   1. CHATR Kernel (port 8087) — desktop with kernel running
 *   2. Legacy Electron IPC (ollama.cjs) — desktop without kernel
 *   3. Error — cloud AI disabled for privacy
 */
export async function generate({
  prompt,
  conversationId = 'local',
  userId = 'local-user',
  preferLocal = true,
}: GenerateOptions): Promise<string> {
  if (!preferLocal) {
    throw new Error('[Strict Privacy] Cloud AI is disabled.');
  }

  // ── Path 1: CHATR Kernel ─────────────────────────────────────────────────
  if (await isKernelAvailable()) {
    try {
      return await conversation.send({ conversationId, message: prompt, userId });
    } catch (err) {
      const msg = getErrorMessage(err);
      // Don't fall through on kernel errors — surface them directly
      throw new Error(`[CHATR AI] ${msg}`);
    }
  }

  // ── Path 2: Legacy IPC fallback (Electron without kernel) ────────────────
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.ai;
  if (isElectron) {
    try {
      const status = await window.electronAPI!.ai!.status();
      const warmingPhases = ['checking', 'downloading', 'installing', 'starting', 'pulling'];
      if (status && warmingPhases.includes(status.phase)) {
        throw new Error(
          `CHATR AI is still starting up (${status.phase}).\n\nPlease wait 20–30 seconds and try again.`
        );
      }
      if (status?.phase !== 'ready') {
        throw new Error(`Local AI is unavailable (${status?.phase || 'unknown'}).`);
      }
      const result = await window.electronAPI!.ai!.ask(prompt);
      if (result && typeof result === 'object') {
        const r = result as { text?: string; error?: string; message?: string };
        if (r.error) throw new Error(r.message || r.error);
        if (r.text) return r.text;
      }
      if (typeof result === 'string') return result;
      throw new Error('Local AI returned an unexpected response format.');
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.startsWith('CHATR AI') || msg.startsWith('Local AI')) throw err;
      throw new Error(`[CHATR AI] ${msg}`);
    }
  }

  // ── Path 3: No local AI available ────────────────────────────────────────
  throw new Error(
    '[Strict Privacy] Local AI is only available in the CHATR Desktop app. Cloud fallback is disabled.'
  );
}

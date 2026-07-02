interface GenerateOptions {
  prompt: string;
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
  return 'Unknown local AI error';
}

function unwrapLocalAIResult(result: unknown): string {
  if (typeof result === 'string') return result;
  if (!result || typeof result !== 'object') return '';

  const value = result as { text?: unknown; error?: unknown; message?: unknown };
  if (value.error) {
    throw new Error(getErrorMessage(value));
  }
  if (typeof value.text === 'string') return value.text;
  if (typeof value.message === 'string') return value.message;

  throw new Error('Local AI returned an invalid response.');
}

/**
 * Single entry point for all AI generation in CHATR.
 *
 * Strict privacy routing:
 *   1. Electron + Ollama ready -> local inference only.
 *   2. Anything else -> fail closed; cloud AI is disabled.
 */
export async function generate({ prompt, preferLocal = true }: GenerateOptions): Promise<string> {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.ai;

  if (!preferLocal) {
    throw new Error('[Strict Privacy Mode] Cloud AI is disabled. Enable local Ollama to generate AI responses.');
  }

  if (!isElectron) {
    throw new Error('[Strict Privacy Mode] Local Ollama is only available in the desktop app. Cloud fallback is disabled.');
  }

  try {
    const status = await window.electronAPI!.ai!.status();
    if (status?.phase !== 'ready') {
      throw new Error(`Local AI is still ${status?.phase || 'unavailable'}`);
    }

    const result = await window.electronAPI!.ai!.ask(prompt);
    return unwrapLocalAIResult(result);
  } catch (err) {
    console.warn('[ai.generate] Local AI failed. Cloud fallback is disabled for privacy.', err);
    throw new Error(`[Strict Privacy Mode] Local AI failed: ${getErrorMessage(err)}. Cloud fallback disabled.`);
  }
}

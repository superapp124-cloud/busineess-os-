// ─────────────────────────────────────────────────────────────────────────────
// SignalBus — a lightweight publish/subscribe event emitter.
// Every UI module emits signals here. The Context Engine subscribes.
// ─────────────────────────────────────────────────────────────────────────────
import { Signal, SignalType } from './types';

type SignalHandler = (signal: Signal) => void;

class SignalBusClass {
  private handlers: Map<string, Set<SignalHandler>> = new Map();

  /** Emit a signal from any UI module */
  emit(signal: Signal): void {
    const specific = this.handlers.get(signal.type) ?? new Set();
    const wildcard = this.handlers.get('*') ?? new Set();
    [...specific, ...wildcard].forEach(handler => {
      // Run handlers asynchronously so UI thread is never blocked
      queueMicrotask(() => handler(signal));
    });
  }

  /** Subscribe to a specific signal type, or '*' for all signals */
  on(type: SignalType | '*', handler: SignalHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    // Return an unsubscribe function
    return () => this.handlers.get(type)?.delete(handler);
  }
}

/** Singleton Signal Bus — import this directly from any module */
export const SignalBus = new SignalBusClass();

/** Convenience helper for emitting signals without constructing the full object */
export const emit = (
  type: Signal['type'],
  sourceModule: string,
  payload: Record<string, unknown> = {}
): void => {
  SignalBus.emit({ type, sourceModule, payload, timestamp: Date.now() });
};

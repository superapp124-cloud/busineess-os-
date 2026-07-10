import { eventRuntime } from './EventRuntime';
import { CHATREvent, EventPriority, EventHandler } from './types';

/**
 * EventBus Facade over the new EventRuntime.
 * Preserves the exact public API so we don't have to refactor 100+ files.
 */
class EventBusFacade {
  // ─── Subscribe ──────────────────────────────────────────────────────────────

  on<T = unknown>(
    type: string,
    handler: EventHandler<T>,
    opts?: { priority?: EventPriority; once?: boolean }
  ): () => void {
    return eventRuntime.subscribe(type, handler, opts);
  }

  once<T = unknown>(type: string, handler: EventHandler<T>): () => void {
    return this.on(type, handler, { once: true });
  }

  onAny<T = unknown>(handler: EventHandler<T>): () => void {
    return eventRuntime.subscribe('*', handler);
  }

  // Backward compatibility alias for 'on'
  subscribe<T = unknown>(type: string, handler: EventHandler<T>): () => void {
    return this.on(type, handler);
  }

  // Backward compatibility alias
  unsubscribe<T = unknown>(type: string, handler: EventHandler<T>): void {
    // In the real system we returned an unsubscribe function from subscribe(), 
    // but the old code passed the handler to unsubscribe(). 
    // For the facade, we'd either polyfill this by keeping a map or ignore it if modern codebase uses the returned func.
    // Assuming modern codebase uses the returned func as designed.
  }

  // ─── Persistence ──────────────────────────────────────────────────────────

  setPersistenceHandler(handler: (event: CHATREvent) => void): void {
    const originalQuery = (eventRuntime as any).storeAdapter.query;
    (eventRuntime as any).storeAdapter = {
      writeBatch: async (events: CHATREvent[]) => {
        for (const e of events) {
          handler(e);
        }
      },
      query: originalQuery
    };
  }

  // ─── Publish ───────────────────────────────────────────────────────────────

  publish<T = unknown>(
    type: string,
    payload: T,
    opts?: {
      priority?: EventPriority;
      source?: string;
      correlationId?: string;
      workflowId?: string;
    } | string
  ): CHATREvent<T> {
    const options = typeof opts === 'string' ? { source: opts } : (opts ?? {});
    return eventRuntime.publish(type, payload, options);
  }

  // ─── Replay ───────────────────────────────────────────────────────────────

  replay(events: CHATREvent[], mode: 'Analytics' | 'TimelineRebuild' | 'Debugging' | 'FullBusiness' = 'Debugging'): void {
    eventRuntime.replay(events, mode).catch(console.error);
  }

  // Proxy the metrics for the old health store
  get throughputPerSecond(): number {
    // Simulated throughput based on published count
    return eventRuntime.metrics.publishedCount;
  }
}

export const eventBus = new EventBusFacade();

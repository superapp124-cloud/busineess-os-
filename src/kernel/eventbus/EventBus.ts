/**
 * CHATR Platform Event Bus
 * Centralized, typed event emitter for all CHATR Runtimes and Kernel Services.
 */

export type PlatformEventType = 
  | 'document:uploaded'
  | 'document:parsed:page'
  | 'document:parsed:complete'
  | 'document:table:extracted'
  | 'document:embedding:created'
  | 'document:entity:linked'
  | 'document:memory:updated'
  | 'document:pii:detected'
  | 'search:indexed'
  | 'agent:task:dispatched'
  | 'model:status:changed';

export interface PlatformEvent<T = Record<string, unknown>> {
  id: string;
  type: PlatformEventType;
  source: string;
  timestamp: string;
  workspaceId?: string;
  payload: T;
}

export type EventCallback<T = Record<string, unknown>> = (event: PlatformEvent<T>) => void | Promise<void>;

class EventBusService {
  private listeners: Map<PlatformEventType, Set<EventCallback<any>>> = new Map();

  /**
   * Subscribe to a specific platform event type
   */
  public subscribe<T = Record<string, unknown>>(type: PlatformEventType, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    const callbacks = this.listeners.get(type)!;
    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
    };
  }

  /**
   * Publish a platform event to all active subscribers
   */
  public async publish<T = Record<string, unknown>>(
    type: PlatformEventType,
    source: string,
    payload: T,
    workspaceId?: string
  ): Promise<PlatformEvent<T>> {
    const event: PlatformEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      source,
      timestamp: new Date().toISOString(),
      workspaceId,
      payload,
    };

    const callbacks = this.listeners.get(type);
    if (callbacks && callbacks.size > 0) {
      const promises = Array.from(callbacks).map(cb => {
        try {
          return Promise.resolve(cb(event));
        } catch (err) {
          console.error(`[EventBus] Subscriber error handling event ${type}:`, err);
          return Promise.resolve();
        }
      });
      await Promise.all(promises);
    }

    return event;
  }

  /**
   * Clear all subscribers (useful during runtime shutdown or tests)
   */
  public clear(): void {
    this.listeners.clear();
  }
}

export const EventBus = new EventBusService();

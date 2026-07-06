import { IEvent, IService } from '../Shared/Types';
import { Logger } from './Logger';

type EventHandler = (event: IEvent) => Promise<void> | void;

class EventBusService implements IService {
  name = 'EventBus';
  dependencies: string[] = [];

  private handlers: Map<string, Set<EventHandler>> = new Map();

  async initialize(): Promise<void> {
    Logger.info('[EventBus] Initialized.');
  }

  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  async publish(type: string, payload: any, options: { priority?: 'low'|'normal'|'high'|'critical', persistent?: boolean } = {}): Promise<void> {
    const event: IEvent = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      priority: options.priority || 'normal',
      persistent: options.persistent || false
    };

    Logger.debug(`[EventBus] Publishing ${type}`, { id: event.id, priority: event.priority });

    // In a full implementation, persistent events would be routed to Dexie offline queue here before processing

    const handlers = this.handlers.get(type);
    if (!handlers || handlers.size === 0) return;

    const executionPromises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (err) {
        Logger.error(`[EventBus] Error in handler for ${type}`, err);
        // Implement retry logic here based on event priority/persistence
      }
    });

    // Fire and forget or await depending on needs. We await to ensure we catch rejections.
    await Promise.allSettled(executionPromises);
  }
}

export const EventBus = new EventBusService();


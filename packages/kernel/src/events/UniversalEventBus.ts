import { RuntimeEvent, EventHandler, Unsubscribe, EventMetadata } from '@chatr/events';

export interface IUniversalEventBus {
  publish<T = unknown>(event: RuntimeEvent, payload: T, metadata?: Partial<EventMetadata>): void;
  subscribe<T = unknown>(event: RuntimeEvent, handler: EventHandler<T>): Unsubscribe;
  subscribeMany(events: RuntimeEvent[], handler: EventHandler): Unsubscribe;
}

/**
 * In-memory publish/subscribe backbone for CHATR Runtime.
 */
export class UniversalEventBus implements IUniversalEventBus {
  private handlers = new Map<RuntimeEvent, Set<EventHandler<any>>>();
  private defaultSourcePackage = '@chatr/kernel'; // Set dynamically by consumers if possible

  public publish<T = unknown>(
    event: RuntimeEvent,
    payload: T,
    metadata?: Partial<EventMetadata>
  ): void {
    const fullMeta: EventMetadata = {
      eventId: metadata?.eventId || crypto.randomUUID(),
      timestamp: metadata?.timestamp || Date.now(),
      sourcePackage: metadata?.sourcePackage || this.defaultSourcePackage,
      correlationId: metadata?.correlationId,
      identityId: metadata?.identityId,
      causationId: metadata?.causationId,
    };

    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach((handler) => {
        try {
          handler(payload, fullMeta);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  public subscribe<T = unknown>(
    event: RuntimeEvent,
    handler: EventHandler<T>
  ): Unsubscribe {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    
    const eventHandlers = this.handlers.get(event)!;
    eventHandlers.add(handler);

    return () => {
      eventHandlers.delete(handler);
      if (eventHandlers.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  public subscribeMany(events: RuntimeEvent[], handler: EventHandler): Unsubscribe {
    const unsubscribes = events.map(event => this.subscribe(event, handler));
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }
}

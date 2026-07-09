import { Commitment } from '../capabilities/types';

export interface ChatrEvent {
  id: string;
  timestamp: number;
  type: string;
  payload: any;
  source: string;
}

export type EventHandler = (event: ChatrEvent) => void;

export class EventBusImpl {
  private static instance: EventBusImpl;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private journal: ChatrEvent[] = []; // In-memory journal for day one

  private constructor() {}

  public static getInstance(): EventBusImpl {
    if (!EventBusImpl.instance) {
      EventBusImpl.instance = new EventBusImpl();
    }
    return EventBusImpl.instance;
  }

  public subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  public unsubscribe(eventType: string, handler: EventHandler): void {
    if (this.handlers.has(eventType)) {
      this.handlers.get(eventType)!.delete(handler);
    }
  }

  public publish(type: string, payload: any, source: string = 'system'): void {
    const event: ChatrEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      payload,
      source
    };

    // Immutable event journaling (Kernel Law #8)
    this.journal.push(event);
    
    // Log for observability
    console.log(`[EventBus] ${type}`, payload);

    if (this.handlers.has(type)) {
      this.handlers.get(type)!.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[EventBus] Error in handler for ${type}:`, error);
        }
      });
    }
  }

  public getHistory(): ChatrEvent[] {
    return [...this.journal];
  }

  public getTimeline(commitmentId: string): ChatrEvent[] {
    return this.journal.filter(e => {
      // payload could have commitment.id or commitmentId
      const payloadId = e.payload?.commitment?.id || e.payload?.commitmentId || e.payload?.id;
      return payloadId === commitmentId;
    });
  }
}

export const eventBus = EventBusImpl.getInstance();

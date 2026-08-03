import { BusinessEvent } from '../types';

export type EventHandler = (event: BusinessEvent) => Promise<void>;

/**
 * Enterprise Event Bus
 * The reactive core of the CHATR Enterprise Runtime (CER).
 * Instead of sequential pipelines, subsystems subscribe to events here.
 */
export class EnterpriseEventBus {
  private static instance: EnterpriseEventBus;
  private subscribers: Map<string, EventHandler[]> = new Map();

  private constructor() {}

  public static getInstance(): EnterpriseEventBus {
    if (!EnterpriseEventBus.instance) {
      EnterpriseEventBus.instance = new EnterpriseEventBus();
    }
    return EnterpriseEventBus.instance;
  }

  /**
   * Subscribe to a specific type of business event.
   */
  public subscribe(eventType: BusinessEvent['type'] | '*', handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType) || [];
    handlers.push(handler);
    this.subscribers.set(eventType, handlers);
    console.log(`[EventBus] Subscribed to ${eventType}`);
  }

  /**
   * Publish a business event to all relevant subscribers.
   */
  public async publish(event: BusinessEvent): Promise<void> {
    console.log(`[EventBus] 📢 Publishing Event: ${event.type} (ID: ${event.id})`);
    
    const specificHandlers = this.subscribers.get(event.type) || [];
    const wildcardHandlers = this.subscribers.get('*') || [];
    
    const allHandlers = [...specificHandlers, ...wildcardHandlers];

    if (allHandlers.length === 0) {
      console.warn(`[EventBus] No subscribers found for event: ${event.type}`);
      return;
    }

    // Execute handlers concurrently
    await Promise.allSettled(
      allHandlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[EventBus] Error in handler for event ${event.type}:`, error);
        }
      })
    );
  }
}

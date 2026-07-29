export interface IEvent {
  name: string;
  payload: any;
  timestamp: number;
}

export type EventHandler = (event: IEvent) => void;
export type CommandHandler = (payload: any) => Promise<any>;
export type QueryHandler = (payload: any) => Promise<any>;

export class EventMesh {
  private static eventSubscribers = new Map<string, EventHandler[]>();
  private static commandHandlers = new Map<string, CommandHandler>();
  private static queryHandlers = new Map<string, QueryHandler>();

  // ==========================================
  // EVENTS: Fire-and-forget, Zero or many subscribers, Eventually consistent
  // ==========================================
  static publishEvent(eventName: string, payload: any): void {
    const event: IEvent = { name: eventName, payload, timestamp: Date.now() };
    
    const exactListeners = this.eventSubscribers.get(eventName) || [];
    const wildcardListeners: EventHandler[] = [];
    
    for (const [key, cbs] of this.eventSubscribers.entries()) {
      if (key === '*') {
        wildcardListeners.push(...cbs);
      } else if (key.endsWith('*') && eventName.startsWith(key.replace('*', ''))) {
        wildcardListeners.push(...cbs);
      }
    }

    const allListeners = [...new Set([...exactListeners, ...wildcardListeners])];
    
    // Execute asynchronously (never block)
    setTimeout(() => {
      allListeners.forEach(callback => {
        try { callback(event); } catch (e) { console.error(`Error in event listener for ${eventName}:`, e); }
      });
    }, 0);
  }

  static subscribeEvent(eventName: string, callback: EventHandler): () => void {
    if (!this.eventSubscribers.has(eventName)) {
      this.eventSubscribers.set(eventName, []);
    }
    this.eventSubscribers.get(eventName)!.push(callback);

    return () => {
      const cbs = this.eventSubscribers.get(eventName) || [];
      this.eventSubscribers.set(eventName, cbs.filter(cb => cb !== callback));
    };
  }

  // ==========================================
  // COMMANDS: Exactly one handler, can fail, return success/failure
  // ==========================================
  static registerCommand(commandName: string, handler: CommandHandler): void {
    if (this.commandHandlers.has(commandName)) {
      throw new Error(`Command ${commandName} is already registered. Exactly one handler is allowed.`);
    }
    this.commandHandlers.set(commandName, handler);
  }

  static async sendCommand(commandName: string, payload: any): Promise<any> {
    const handler = this.commandHandlers.get(commandName);
    if (!handler) throw new Error(`No handler registered for command: ${commandName}`);
    
    return await handler(payload);
  }

  // ==========================================
  // QUERIES: Read only, no side effects, expecting return value
  // ==========================================
  static registerQuery(queryName: string, handler: QueryHandler): void {
    if (this.queryHandlers.has(queryName)) {
      throw new Error(`Query ${queryName} is already registered.`);
    }
    this.queryHandlers.set(queryName, handler);
  }

  static async dispatchQuery(queryName: string, payload: any): Promise<any> {
    const handler = this.queryHandlers.get(queryName);
    if (!handler) throw new Error(`No handler registered for query: ${queryName}`);
    
    return await handler(payload);
  }

  // Legacy fallback mapping
  static publish(eventName: string, payload: any): void {
    this.publishEvent(eventName, payload);
  }
}


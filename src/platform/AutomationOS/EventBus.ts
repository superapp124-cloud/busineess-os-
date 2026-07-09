import { OSEvent } from './Types';

type EventListener = (event: OSEvent) => void;

class Bus {
  private listeners: EventListener[] = [];
  private history: OSEvent[] = [];

  subscribe(listener: EventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  publish(event: OSEvent) {
    this.history.push(event);
    console.log(`[EventBus] [${new Date(event.timestamp).toISOString()}] ${event.type}`, event.payload);
    this.listeners.forEach(l => l(event));
  }

  getHistory() {
    return this.history;
  }
}

export const EventBus = new Bus();
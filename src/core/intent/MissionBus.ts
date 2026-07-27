// MissionBus.ts
export type MissionEvent = 
  | 'provider.discovered'
  | 'provider.failed'
  | 'evidence.added'
  | 'evidence.updated'
  | 'reasoning.completed'
  | 'recommendation.changed'
  | 'outcome.verified';

type Listener = (payload: any) => void;

export class MissionBus {
  private listeners: Map<MissionEvent, Set<Listener>> = new Map();

  subscribe(event: MissionEvent, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  publish(event: MissionEvent, payload?: any) {
    console.log(`[MissionBus] ${event}`, payload);
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(payload));
    }
  }
}

export const globalMissionBus = new MissionBus();

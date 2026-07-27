import { EventEmitter } from 'events';

export type OSPlatformEvent = 
  | { type: 'MISSION_CREATED'; payload: { missionId: string; intent: any } }
  | { type: 'MISSION_STATE_CHANGED'; payload: { missionId: string; state: string } }
  | { type: 'PROVIDER_STARTED'; payload: { missionId: string; capability: string; provider: string } }
  | { type: 'EVIDENCE_EXTRACTED'; payload: { missionId: string; provider: string; data: any } }
  | { type: 'PLAN_GENERATED'; payload: { missionId: string; plan: any } }
  | { type: 'OPTIMIZATION_COMPLETE'; payload: { missionId: string; strategy: string; rationale: string; allocations: any[] } };

export class EventBus {
  private static instance: EventBus;
  private emitter = new EventEmitter();

  private constructor() {
    // Increase limit for high-throughput OS events
    this.emitter.setMaxListeners(100);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish(event: OSPlatformEvent): void {
    console.log(`[EventBus] ${event.type} -> [${event.payload.missionId}]`);
    this.emitter.emit(event.type, event.payload);
    this.emitter.emit('*', event); // for universal subscribers
  }

  public subscribe(eventType: OSPlatformEvent['type'] | '*', callback: (payload: any) => void): void {
    this.emitter.on(eventType, callback);
  }

  public unsubscribe(eventType: OSPlatformEvent['type'] | '*', callback: (payload: any) => void): void {
    this.emitter.off(eventType, callback);
  }
}

export const globalEventBus = EventBus.getInstance();

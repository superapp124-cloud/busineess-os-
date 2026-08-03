import { EnterpriseEventBus } from './EnterpriseEventBus';

/**
 * Observation Engine
 * Sits *before* the Event Bus. Monitors inputs (Email arriving, Calendar changing, File dropped) 
 * and parses them into a standardized BusinessEvent before emitting them to the Bus.
 */
export class ObservationEngine {
  private static instance: ObservationEngine;
  private eventBus: EnterpriseEventBus;

  private constructor() {
    this.eventBus = EnterpriseEventBus.getInstance();
  }

  public static getInstance(): ObservationEngine {
    if (!ObservationEngine.instance) {
      ObservationEngine.instance = new ObservationEngine();
    }
    return ObservationEngine.instance;
  }

  /**
   * Translates a raw external signal into a typed BusinessEvent and emits it.
   */
  public observeRawInput(source: string, payload: any) {
    console.log(`[ObservationEngine] Raw input observed from ${source}`);
    
    // Normalize to standard Business Event
    const eventId = `evt_${Date.now()}`;
    const businessEvent = {
      id: eventId,
      type: 'ArtifactObserved',
      schemaVersion: '1.0',
      tenantId: payload.tenantId || 'system',
      actorId: payload.actorId || 'system',
      source,
      aggregateId: payload.id || `agg_${Date.now()}`,
      aggregateKind: 'Artifact',
      occurredAt: new Date().toISOString(),
      idempotencyKey: `obs_${eventId}`,
      classification: 'INTERNAL',
      payload
    };

    // Push standard event to the bus
    this.eventBus.publish(businessEvent);
  }
}

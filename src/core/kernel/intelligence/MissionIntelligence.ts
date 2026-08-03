import { EnterpriseEventBus } from '../EnterpriseEventBus';
import { MissionExecutionContext, EnterpriseEvent, BaseInferenceHypothesis } from '../../types';

/**
 * Mission Intelligence Engine
 * Manages the lifecycle of a Mission from creation to completion or failure.
 * Event-driven and decoupled from execution orchestration.
 */
export class MissionIntelligence {
  private static instance: MissionIntelligence;
  private bus: EnterpriseEventBus;
  private activeMissions: Map<string, MissionExecutionContext> = new Map();

  private constructor() {
    this.bus = EnterpriseEventBus.getInstance();
    this.initializeSubscriptions();
  }

  public static getInstance(): MissionIntelligence {
    if (!MissionIntelligence.instance) {
      MissionIntelligence.instance = new MissionIntelligence();
    }
    return MissionIntelligence.instance;
  }

  private initializeSubscriptions() {
    console.log('[MissionIntelligence] Mounting mission lifecycle listeners...');
    this.bus.subscribe('InferenceGenerated', this.handleInferenceGenerated.bind(this));
  }

  private async handleInferenceGenerated(event: EnterpriseEvent) {
    const payload = event.payload as any;
    const hypotheses: BaseInferenceHypothesis[] = payload.hypotheses || [];
    const context: MissionExecutionContext = payload.missionContext;

    if (!context) return;

    console.log(`[MissionIntelligence] Hydrating Mission ${context.id} with ${hypotheses.length} inference hypotheses.`);

    const enrichedContext: MissionExecutionContext = {
      ...context,
      hypotheses,
      lifecycleState: 'PENDING_APPROVAL',
    };

    this.activeMissions.set(enrichedContext.id, enrichedContext);

    // Emit MissionCreated event
    this.publishMissionEvent('MissionCreated', enrichedContext);
  }

  public getMission(id: string): MissionExecutionContext | null {
    return this.activeMissions.get(id) || null;
  }

  public approveMission(id: string): void {
    const mission = this.activeMissions.get(id);
    if (mission) {
      mission.lifecycleState = 'APPROVED';
      console.log(`[MissionIntelligence] Approved mission: ${id}`);
      this.publishMissionEvent('MissionApproved', mission);
    }
  }

  private publishMissionEvent(eventType: string, context: MissionExecutionContext) {
    const event: EnterpriseEvent = {
      id: (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : Math.random().toString(36).substring(2),
      type: eventType,
      schemaVersion: '1.0',
      tenantId: context.trigger?.tenantId || 'system',
      actorId: 'system:mission-intelligence',
      source: 'MissionIntelligence',
      aggregateId: context.id,
      aggregateKind: 'Mission',
      payload: { missionContext: context },
      occurredAt: new Date().toISOString(),
      traceContext: context.trigger?.traceContext || {
        correlationId: context.id,
        traceId: context.id,
        spanId: context.id.slice(0, 8),
      },
      idempotencyKey: `${eventType}_${context.id}_${Date.now()}`,
      classification: 'INTERNAL',
      metadata: {},
    };

    this.bus.publish(event);
  }
}

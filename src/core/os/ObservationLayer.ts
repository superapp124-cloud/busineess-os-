import { enterpriseEventBus } from '../events/EventBus';
import { enterpriseGraph } from '../ontology/EnterpriseGraph';
import { missionIntelligence } from '../intelligence/MissionIntelligence';
import { openTelemetryExporter } from '../telemetry/OpenTelemetryExporter';

export type ObservationType =
  | 'MessageObserved'
  | 'CallObserved'
  | 'EmailObserved'
  | 'DocumentObserved'
  | 'CalendarObserved'
  | 'WebhookObserved'
  | 'APICallObserved'
  | 'VoiceObserved'
  | 'SensorObserved'
  | 'UserActionObserved';

export interface ObservationPayload {
  sourceModule: 'Chat' | 'Calls' | 'Inbox' | 'Docs' | 'Canvas' | 'Recruitment' | 'Healthcare' | 'CRM' | 'Finance' | 'Legal' | 'Calendar' | 'Tasks' | 'System';
  tenantId: string;
  userId?: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EnterpriseObservation {
  id: string;
  type: ObservationType;
  timestamp: number;
  payload: ObservationPayload;
  correlationId: string;
  traceId: string;
}

/**
 * Enterprise Observation Layer
 * The Single Entry Point for ALL CHATR Modules (Chat, Recruitment, Healthcare, CRM, Docs, Calendar, etc.).
 * Every module action begins as an Observation, converts into an Enterprise Event, updates the Enterprise Graph,
 * and triggers governed Mission execution through the invariant CER Runtime Kernel.
 */
export class ObservationLayer {
  private static instance: ObservationLayer;

  private constructor() {}

  public static getInstance(): ObservationLayer {
    if (!ObservationLayer.instance) {
      ObservationLayer.instance = new ObservationLayer();
    }
    return ObservationLayer.instance;
  }

  /**
   * Universal Ingestion Gateway
   * Guarantees zero bypass: Every module action flows through CER.
   */
  public async observe(type: ObservationType, payload: ObservationPayload): Promise<EnterpriseObservation> {
    const observationId = `obs_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const correlationId = `corr_${crypto.randomUUID().slice(0, 8)}`;

    const span = openTelemetryExporter.startSpan('Observation.Process', undefined, {
      type,
      sourceModule: payload.sourceModule,
      tenantId: payload.tenantId,
    });

    const observation: EnterpriseObservation = {
      id: observationId,
      type,
      timestamp: Date.now(),
      payload,
      correlationId,
      traceId: span.traceId,
    };

    openTelemetryExporter.log('INFO', `Observation Ingested: ${type} from ${payload.sourceModule}`, {
      traceId: span.traceId,
      spanId: span.spanId,
      tenantId: payload.tenantId,
      userId: payload.userId,
      attributes: { observationId, correlationId, data: payload.data },
    });

    // 1. Publish to Enterprise Event Bus
    const event = await enterpriseEventBus.publish({
      type: 'ObservationCreated',
      source: `ObservationLayer.${payload.sourceModule}`,
      tenantId: payload.tenantId,
      correlationId,
      causationId: observationId,
      payload: {
        observationId,
        type,
        sourceModule: payload.sourceModule,
        data: payload.data,
      },
    });

    // 2. Synchronous Graph Node Resolution
    if (payload.userId) {
      enterpriseGraph.addNode({
        id: `person:${payload.userId}`,
        type: 'Person',
        name: payload.userId,
        attributes: { lastActive: Date.now(), lastModule: payload.sourceModule },
      });
    }

    // 3. Proactive Mission Creation Check for Actionable Observations
    if (this.isActionableObservation(type, payload)) {
      await missionIntelligence.createMission({
        title: `Auto Mission: ${type} via ${payload.sourceModule}`,
        objective: `Execute governed workflow for observed ${type}`,
        tenantId: payload.tenantId,
        priority: 'HIGH',
        triggerEventId: event.id,
        contextData: payload.data,
      });
    }

    openTelemetryExporter.endSpan(span.spanId, 'OK');
    return observation;
  }

  private isActionableObservation(type: ObservationType, payload: ObservationPayload): boolean {
    if (type === 'DocumentObserved' && (payload.sourceModule === 'Recruitment' || payload.sourceModule === 'Healthcare' || payload.sourceModule === 'Legal')) {
      return true;
    }
    if (type === 'EmailObserved' || type === 'APICallObserved' || type === 'WebhookObserved') {
      return true;
    }
    if (payload.data?.requiresMission === true) {
      return true;
    }
    return false;
  }
}

export const observationLayer = ObservationLayer.getInstance();

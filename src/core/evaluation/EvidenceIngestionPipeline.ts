import { evidenceRegistry } from './EvidenceRegistry';
import { Evidence, EvidenceType, EvidenceCategory, EvidencePersona } from './EvaluationTypes';
import { openTelemetryExporter } from '../telemetry/OpenTelemetryExporter';

export type SystemOrigin = 'CI_PIPELINE' | 'APM_OTEL' | 'PILOT_WORKSPACE' | 'SUPPORT_PORTAL' | 'NPS_SURVEY' | 'PERFORMANCE_LAB';

export interface IngestionPayload {
  sectionId: string;
  evidenceType: EvidenceType;
  category: EvidenceCategory;
  description: string;
  source: string;
  generatedBy: string; // e.g. "GitHub Actions CI", "k6 Performance Lab"
  systemOrigin: SystemOrigin;
  persona?: EvidencePersona;
  metricValue?: string | number;
  quote?: string;
  isNegative?: boolean;
}

/**
 * Subsystem 30: Evidence Ingestion Pipeline Engine
 * Decouples evidence collection from platform runtime.
 * Ingests and normalizes raw operational payloads from CI/CD, OpenTelemetry,
 * Pilot Workspaces, Support Portals, and NPS Surveys into EvidenceRegistry with full provenance.
 */
export class EvidenceIngestionPipeline {
  private static instance: EvidenceIngestionPipeline;

  private constructor() {}

  public static getInstance(): EvidenceIngestionPipeline {
    if (!EvidenceIngestionPipeline.instance) {
      EvidenceIngestionPipeline.instance = new EvidenceIngestionPipeline();
    }
    return EvidenceIngestionPipeline.instance;
  }

  public ingestOperationalPayload(payload: IngestionPayload): Evidence {
    const span = openTelemetryExporter.startSpan('EvidenceIngestionPipeline.Ingest', undefined, {
      sectionId: payload.sectionId,
      systemOrigin: payload.systemOrigin,
    });

    const weight = EvidenceRegistry.getWeightForType(payload.evidenceType);
    const dateStr = new Date().toISOString().split('T')[0];

    const normalizedEvidence: Evidence = {
      id: `ev_ingest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: payload.evidenceType,
      category: payload.category,
      weight,
      description: payload.description,
      source: `${payload.source} [Via ${payload.generatedBy}]`,
      date: dateStr,
      freshness: EvidenceRegistry.computeFreshness(dateStr),
      persona: payload.persona,
      isNegative: payload.isNegative,
      confidence: payload.category === 'External' ? 'High' : 'Medium',
      metricValue: payload.metricValue,
      quote: payload.quote,
    };

    evidenceRegistry.addEvidence(payload.sectionId, normalizedEvidence);

    openTelemetryExporter.log('INFO', `Evidence Ingested from ${payload.systemOrigin}: ${payload.description}`, {
      traceId: span.traceId,
      spanId: span.spanId,
      attributes: { normalizedEvidence, payload },
    });

    openTelemetryExporter.endSpan(span.spanId, 'OK');
    return normalizedEvidence;
  }
}

export const evidenceIngestionPipeline = EvidenceIngestionPipeline.getInstance();

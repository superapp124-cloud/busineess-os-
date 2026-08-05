/**
 * Resume Intelligence OS v3.0 — Observability Collector
 *
 * Tracks per-candidate parse metrics.
 * In development: logs to console + sessionStorage.
 * In production: POST to /api/observability (when endpoint is available).
 */

import type { ResumeFamilyId, QualityGateResult } from './types';

// ─── Parse Observability Event ────────────────────────────────────────────────

export interface ParseObservabilityEvent {
  candidateId: string;
  sessionId: string;
  resumeFamily: ResumeFamilyId;
  documentSizeBytes: number;
  parseTimeMs: number;
  ocrTimeMs: number;
  layoutDetectionAccuracy: number;   // 0–1
  entityAccuracy: number;            // 0–1
  validationFailures: string[];      // field keys that failed validation
  hallucinationRejections: string[]; // values rejected by field contract
  fieldRejectionReasons: Record<string, string>; // fieldKey → reason
  unknownEntityRate: number;         // 0–1: proportion of spans classified Unknown
  ontologyMisses: string[];          // spans not found in any ontology
  qualityGate: QualityGateResult;
  cacheHit: boolean;
  timestamp: string;
}

// ─── Session Metrics ──────────────────────────────────────────────────────────

export interface SessionMetrics {
  totalParsed: number;
  cacheHits: number;
  avgParseTimeMs: number;
  avgQuality: number;
  totalHallucinationRejections: number;
  totalValidationFailures: number;
  avgUnknownEntityRate: number;
  commonOntologyMisses: string[];
  events: ParseObservabilityEvent[];
}

// ─── Observability Collector ──────────────────────────────────────────────────

class ObservabilityCollector {
  private readonly events: ParseObservabilityEvent[] = [];
  private readonly sessionId: string;

  constructor() {
    this.sessionId = `sess-${Date.now().toString(36)}`;
  }

  record(event: Omit<ParseObservabilityEvent, 'sessionId' | 'timestamp'>): void {
    const full: ParseObservabilityEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };
    this.events.push(full);

    // Dev logging
    if (import.meta.env?.DEV) {
      console.group(`[ATS Observability] ${event.candidateId} (${event.resumeFamily})`);
      console.log(`  Parse time:        ${event.parseTimeMs}ms`);
      console.log(`  Quality:           ${event.qualityGate.overallQuality}/100 (${event.qualityGate.passed ? '✅' : '❌'})`);
      console.log(`  Cache hit:         ${event.cacheHit}`);
      console.log(`  Hallucinations:    ${event.hallucinationRejections.length} rejected`);
      console.log(`  Validation fails:  ${event.validationFailures.length}`);
      console.log(`  Unknown rate:      ${(event.unknownEntityRate * 100).toFixed(1)}%`);
      if (event.ontologyMisses.length > 0) {
        console.log(`  Ontology misses:  `, event.ontologyMisses);
      }
      console.groupEnd();
    }

    // Attempt POST to observability endpoint (fire-and-forget, no await)
    this.postEvent(full);
  }

  private postEvent(event: ParseObservabilityEvent): void {
    // Only POST in production and only if the endpoint exists
    if (import.meta.env?.PROD) {
      fetch('/api/observability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {
        // Silently fail — observability must never block the pipeline
      });
    }
  }

  getSessionMetrics(): SessionMetrics {
    if (this.events.length === 0) {
      return {
        totalParsed: 0, cacheHits: 0, avgParseTimeMs: 0, avgQuality: 0,
        totalHallucinationRejections: 0, totalValidationFailures: 0,
        avgUnknownEntityRate: 0, commonOntologyMisses: [], events: [],
      };
    }

    const totalParsed = this.events.length;
    const cacheHits = this.events.filter(e => e.cacheHit).length;
    const avgParseTimeMs = this.events.reduce((s, e) => s + e.parseTimeMs, 0) / totalParsed;
    const avgQuality = this.events.reduce((s, e) => s + e.qualityGate.overallQuality, 0) / totalParsed;
    const totalHallucinationRejections = this.events.reduce((s, e) => s + e.hallucinationRejections.length, 0);
    const totalValidationFailures = this.events.reduce((s, e) => s + e.validationFailures.length, 0);
    const avgUnknownEntityRate = this.events.reduce((s, e) => s + e.unknownEntityRate, 0) / totalParsed;

    // Find most common ontology misses
    const missCounts = new Map<string, number>();
    for (const e of this.events) {
      for (const miss of e.ontologyMisses) {
        missCounts.set(miss, (missCounts.get(miss) ?? 0) + 1);
      }
    }
    const commonOntologyMisses = [...missCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([miss]) => miss);

    return {
      totalParsed, cacheHits, avgParseTimeMs, avgQuality,
      totalHallucinationRejections, totalValidationFailures,
      avgUnknownEntityRate, commonOntologyMisses,
      events: [...this.events],
    };
  }

  clearSession(): void {
    this.events.length = 0;
  }
}

/** Singleton observability collector — shared across the pipeline. */
export const observability = new ObservabilityCollector();

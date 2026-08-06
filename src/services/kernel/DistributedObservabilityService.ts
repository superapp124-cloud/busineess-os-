/**
 * CHATR Distributed Telemetry & Observability Tracing Service
 * 
 * Emits canonical trace telemetry across every execution step:
 * trace_id • span_id • parent_id • tenant_id • mission_id • capability_id • duration • resource_cost • confidence • policy_version
 */

export interface DistributedTelemetrySpan {
  traceId: string;
  spanId: string;
  parentId?: string;
  tenantId: string;
  missionId: string;
  capabilityId: string;
  durationMs: number;
  financialCost: number;
  confidenceScore: number;
  policyVersion: string;
  timestamp: string;
}

export class DistributedObservabilityService {
  private static instance: DistributedObservabilityService;
  private spans: DistributedTelemetrySpan[] = [];

  private constructor() {
    this.seedCanonicalSpans();
  }

  public static getInstance(): DistributedObservabilityService {
    if (!DistributedObservabilityService.instance) {
      DistributedObservabilityService.instance = new DistributedObservabilityService();
    }
    return DistributedObservabilityService.instance;
  }

  private seedCanonicalSpans(): void {
    const timestamp = new Date().toISOString();
    this.spans.push({
      traceId: 'trace-88912-abc',
      spanId: 'span-001-exec',
      tenantId: 'tenant-tcs-001',
      missionId: 'mission-factory-01',
      capabilityId: 'cap-settle-01',
      durationMs: 1.2,
      financialCost: 0.0012,
      confidenceScore: 0.98,
      policyVersion: 'POL-12.v3',
      timestamp
    });
  }

  public emitSpan(span: Omit<DistributedTelemetrySpan, 'traceId' | 'spanId' | 'timestamp'>): DistributedTelemetrySpan {
    const fullSpan: DistributedTelemetrySpan = {
      ...span,
      traceId: `trace-${Date.now()}`,
      spanId: `span-${Math.floor(Math.random() * 8999 + 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.spans.push(fullSpan);
    return fullSpan;
  }

  public getSpans(): DistributedTelemetrySpan[] {
    return this.spans;
  }
}

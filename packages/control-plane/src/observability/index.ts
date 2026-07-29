export interface TelemetryEvent { source: string; type: 'metric' | 'trace' | 'log'; payload: unknown; timestamp: string; }
export interface TelemetryAggregator {
  ingest(event: TelemetryEvent): Promise<void>;
}

export interface MetricPoint { name: string; value: number; timestamp: string; labels: Record<string, string>; }
export interface MetricsStore {
  store(point: MetricPoint): Promise<void>;
  query(name: string, since: string): Promise<MetricPoint[]>;
}

export interface TraceSpan { traceId: string; spanId: string; operation: string; durationMs: number; tags: Record<string, string>; }
export interface TraceStore {
  store(span: TraceSpan): Promise<void>;
  getTrace(traceId: string): Promise<TraceSpan[]>;
}

export interface ObservabilityApi {
  /** Structured API for downstream dashboards — not a dashboard itself */
  queryMetrics(name: string, since: string): Promise<MetricPoint[]>;
  queryTrace(traceId: string): Promise<TraceSpan[]>;
}

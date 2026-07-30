/**
 * CHATR Telemetry & Observability Service
 * Tracks VRAM/RAM metrics, model inference latency, queue depth, and pipeline stage timings.
 */

export interface TelemetryMetric {
  id: string;
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'mb' | 'count' | 'percentage';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface PipelineTrace {
  traceId: string;
  documentId: string;
  stages: {
    stageName: string;
    durationMs: number;
    status: 'success' | 'failed';
    error?: string;
  }[];
  totalDurationMs: number;
  startedAt: string;
  completedAt: string;
}

class TelemetryService {
  private metrics: TelemetryMetric[] = [];
  private traces: Map<string, PipelineTrace> = new Map();

  /**
   * Record a numerical telemetry metric
   */
  public recordMetric(name: string, value: number, unit: TelemetryMetric['unit'], metadata?: Record<string, unknown>): void {
    const metric: TelemetryMetric = {
      id: `met_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);
    // Keep last 1,000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  /**
   * Start a pipeline trace for performance monitoring
   */
  public startTrace(traceId: string, documentId: string): { endStage: (stageName: string, status?: 'success' | 'failed', error?: string) => void; completeTrace: () => PipelineTrace } {
    const startedAt = new Date().toISOString();
    const startTimeMs = performance.now();
    let stageStartMs = performance.now();

    const stages: PipelineTrace['stages'] = [];

    return {
      endStage: (stageName: string, status = 'success', error?: string) => {
        const nowMs = performance.now();
        const durationMs = Math.round(nowMs - stageStartMs);
        stageStartMs = nowMs;

        stages.push({
          stageName,
          durationMs,
          status,
          error,
        });

        this.recordMetric(`pipeline.stage.${stageName}.latency`, durationMs, 'ms', { traceId, documentId });
      },
      completeTrace: () => {
        const completedAt = new Date().toISOString();
        const totalDurationMs = Math.round(performance.now() - startTimeMs);

        const trace: PipelineTrace = {
          traceId,
          documentId,
          stages,
          totalDurationMs,
          startedAt,
          completedAt,
        };

        this.traces.set(traceId, trace);
        this.recordMetric('pipeline.total.latency', totalDurationMs, 'ms', { traceId, documentId });
        return trace;
      },
    };
  }

  /**
   * Get latest telemetry metrics summary
   */
  public getSummary() {
    return {
      totalMetricsRecorded: this.metrics.length,
      activeTraces: this.traces.size,
      recentMetrics: this.metrics.slice(-10),
    };
  }
}

export const Telemetry = new TelemetryService();

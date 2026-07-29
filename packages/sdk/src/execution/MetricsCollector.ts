import { MetricEvent } from '@chatr/kernel';

export interface MetricsCollector {
  increment(metricName: string, tags?: Record<string, string>): void;
  gauge(metricName: string, value: number, tags?: Record<string, string>): void;
  timing(metricName: string, ms: number, tags?: Record<string, string>): void;
  emitEvent(event: MetricEvent): void;
}

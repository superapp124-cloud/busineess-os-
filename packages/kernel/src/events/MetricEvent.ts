import { Event } from './Event';

export interface MetricEvent extends Event {
  metricName: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

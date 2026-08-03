// Browser-safe crypto usage
const getUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};
import { MetricsExporter } from './MetricsExporter';

export interface SpanContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export interface Span {
  name: string;
  context: SpanContext;
  startTime: number;
  endTime?: number;
  attributes: Record<string, any>;
  end: () => void;
  setAttribute: (key: string, value: any) => void;
}

/**
 * OpenTelemetry Mock SDK
 */
export class TraceProvider {
  private static instance: TraceProvider;
  private exporter = MetricsExporter.getInstance();

  private constructor() {}

  public static getInstance(): TraceProvider {
    if (!TraceProvider.instance) {
      TraceProvider.instance = new TraceProvider();
    }
    return TraceProvider.instance;
  }

  public startSpan(name: string, parentContext?: SpanContext): Span {
    const traceId = parentContext?.traceId || getUUID();
    const spanId = getUUID().substring(0, 8);
    const parentSpanId = parentContext?.spanId;

    const spanContext: SpanContext = { traceId, spanId, parentSpanId };
    
    const span: Span = {
      name,
      context: spanContext,
      startTime: Date.now(),
      attributes: {},
      setAttribute: (key: string, value: any) => {
        span.attributes[key] = value;
      },
      end: () => {
        span.endTime = Date.now();
        this.exporter.exportSpan(span);
      }
    };

    return span;
  }
}

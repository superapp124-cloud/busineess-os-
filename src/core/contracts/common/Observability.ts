/**
 * Standardized logging interface.
 */
export interface ILogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
}

/**
 * Standardized metrics interface.
 */
export interface IMetrics {
  increment(metricName: string, value?: number, tags?: Record<string, string>): void;
  gauge(metricName: string, value: number, tags?: Record<string, string>): void;
  timing(metricName: string, durationMs: number, tags?: Record<string, string>): void;
}

/**
 * Interface representing a tracing operation.
 */
export interface ITraceSpan {
  end(error?: Error): void;
  setTag(key: string, value: string | number | boolean): void;
  log(message: string, payload?: Record<string, any>): void;
}

/**
 * Standardized distributed tracing interface.
 */
export interface ITracer {
  startSpan(name: string, tags?: Record<string, string>): ITraceSpan;
}

/**
 * The unified Observability facade for a runtime.
 */
export interface IObservability {
  logger: ILogger;
  metrics: IMetrics;
  tracer: ITracer;
}

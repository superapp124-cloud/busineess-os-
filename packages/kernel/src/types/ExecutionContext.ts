import { IntentIR } from './IntentIR';
import { PolicyContext } from './PolicyContext';

export interface ServiceRegistryAccess {
  resolve<T = unknown>(serviceId: string): T;
  has(serviceId: string): boolean;
  register(serviceId: string, service: unknown): void;
}

export interface TelemetryAccess {
  recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  startSpan(name: string): { end(): void };
}

export interface ExecutionContext {
  readonly executionId: string;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly user: { id: string; role: string };
  readonly organization: { id: string; tier: string };
  readonly workspace: { id: string };
  readonly permissions: string[];
  readonly policy: PolicyContext;
  readonly locale: string;
  readonly deadline?: number;
  readonly cancellationSignal?: AbortSignal;
  readonly services: ServiceRegistryAccess;
  readonly telemetry: TelemetryAccess;
  readonly request: IntentIR;
}

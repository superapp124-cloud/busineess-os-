import { SystemEvent, Timestamp } from '@chatr/kernel';

export interface StructuredLogger {
  info(message: string, details?: Record<string, unknown>): void;
  warn(message: string, details?: Record<string, unknown>): void;
  error(message: string, error?: Error, details?: Record<string, unknown>): void;
  debug(message: string, details?: Record<string, unknown>): void;
  emitEvent(event: SystemEvent): void;
}

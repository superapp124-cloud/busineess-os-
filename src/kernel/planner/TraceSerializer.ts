import { ExecutionTraceStep } from './ExecutionHistoryStore';

export class TraceSerializer {
  public static serialize(steps: ExecutionTraceStep[]): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      stepCount: steps.length,
      traces: steps
    }, null, 2);
  }

  public static deserialize(jsonString: string): ExecutionTraceStep[] {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed.traces) ? parsed.traces : [];
    } catch {
      return [];
    }
  }
}

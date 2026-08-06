export interface ExecutionDiagnostic {
  severity: 'info' | 'warning' | 'error';
  message: string;
  code?: string;
}

export interface ExecutionResult<TOutput = unknown> {
  executionId: string;
  status: 'completed' | 'failed' | 'cancelled' | 'partial';
  output?: TOutput;
  diagnostics: ExecutionDiagnostic[];
  metrics: {
    durationMs: number;
    cost: number;
    providerId: string;
    vramUsedMb?: number;
  };
  artifacts: string[];
  events: string[];
}

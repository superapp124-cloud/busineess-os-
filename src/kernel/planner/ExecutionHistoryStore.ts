export interface ExecutionTraceStep {
  traceId: string;
  stepId: string;
  timestamp: number;
  capability: string;
  action: string;
  input: any;
  output: any;
  durationMs: number;
  decision: 'ALLOW' | 'DENY' | 'BYPASS';
  confidenceScore: number;
  hasRollbackHandler: boolean;
  rollbackAction?: string;
}

export class ExecutionHistoryStore {
  private static instance: ExecutionHistoryStore;
  private history: ExecutionTraceStep[] = [];
  private currentPointer: number = -1;

  public static getInstance(): ExecutionHistoryStore {
    if (!ExecutionHistoryStore.instance) {
      ExecutionHistoryStore.instance = new ExecutionHistoryStore();
    }
    return ExecutionHistoryStore.instance;
  }

  public recordStep(step: Omit<ExecutionTraceStep, 'timestamp'>): ExecutionTraceStep {
    const fullStep: ExecutionTraceStep = {
      ...step,
      timestamp: Date.now()
    };

    // Truncate redo tree on new record
    if (this.currentPointer < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentPointer + 1);
    }

    this.history.push(fullStep);
    this.currentPointer = this.history.length - 1;
    return fullStep;
  }

  public getHistory(): ExecutionTraceStep[] {
    return this.history;
  }

  public getCurrentStep(): ExecutionTraceStep | null {
    if (this.currentPointer >= 0 && this.currentPointer < this.history.length) {
      return this.history[this.currentPointer];
    }
    return null;
  }

  public canUndo(): boolean {
    return this.currentPointer >= 0 && (this.history[this.currentPointer]?.hasRollbackHandler ?? false);
  }

  public canRedo(): boolean {
    return this.currentPointer < this.history.length - 1;
  }

  public undo(): ExecutionTraceStep | null {
    if (!this.canUndo()) return null;
    const stepToUndo = this.history[this.currentPointer];
    this.currentPointer--;
    return stepToUndo;
  }

  public redo(): ExecutionTraceStep | null {
    if (!this.canRedo()) return null;
    this.currentPointer++;
    return this.history[this.currentPointer];
  }
}

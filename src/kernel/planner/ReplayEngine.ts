import { ExecutionHistoryStore, ExecutionTraceStep } from './ExecutionHistoryStore';

export class ReplayEngine {
  private store = ExecutionHistoryStore.getInstance();
  private isPaused = false;

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public async replayStep(step: ExecutionTraceStep): Promise<{ success: boolean; output: any }> {
    if (this.isPaused) {
      return { success: false, output: 'Replay engine is paused' };
    }

    // Deterministic step replay simulation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          output: { replayedTraceId: step.traceId, originalOutput: step.output }
        });
      }, 50);
    });
  }

  public async replayAll(): Promise<ExecutionTraceStep[]> {
    const history = this.store.getHistory();
    const replayed: ExecutionTraceStep[] = [];

    for (const step of history) {
      if (this.isPaused) break;
      await this.replayStep(step);
      replayed.push(step);
    }

    return replayed;
  }
}

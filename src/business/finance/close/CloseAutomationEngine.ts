/**
 * CHATR Close Automation Engine (Phase 5)
 * Manages ordered month-end close sequences, task dependencies, and close readiness.
 */

export interface CloseTaskDefinition {
  task_code: string;
  task_name: string;
  sequence_order: number;
  category: 'SUBLEDGER_RECON' | 'REVENUE_EXPENSE' | 'ASSET_LIABILITY' | 'TAX_COMPLIANCE' | 'CONSOLIDATION' | 'REVIEW_SIGNOFF';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  depends_on?: string[];
}

export class CloseAutomationEngine {
  /**
   * Calculates overall month-end close progress percentage and identifies blockers
   */
  public static evaluateCloseStatus(tasks: CloseTaskDefinition[]): {
    totalTasks: number;
    completedTasks: number;
    completionPct: number;
    isReadyForSignoff: boolean;
    blockingTasks: CloseTaskDefinition[];
  } {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const completionPct = total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;

    const blockingTasks = tasks.filter(t => t.status === 'BLOCKED' || (t.status === 'PENDING' && t.sequence_order < 8));
    const isReadyForSignoff = completed === total - 1 && tasks.find(t => t.task_code === 'FINAL_SIGNOFF')?.status !== 'COMPLETED';

    return {
      totalTasks: total,
      completedTasks: completed,
      completionPct,
      isReadyForSignoff: completionPct >= 87.5, // 7 out of 8 tasks complete
      blockingTasks,
    };
  }
}

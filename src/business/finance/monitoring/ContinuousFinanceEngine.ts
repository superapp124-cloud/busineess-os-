/**
 * CHATR Continuous Intramonth Financial Monitoring Engine (Phase 9)
 * Proactively evaluates operational events during the month (e.g. Day 17) to forecast
 * month-end risks, cash drift, and close bottlenecks before period closure.
 */

export interface IntramonthAlert {
  dayOfMonth: number;
  alertType: 'COLLECTION_PROBABILITY_DECAY' | 'OPEX_RUN_RATE_WARNING' | 'RECONCILIATION_LAG' | 'CONTRACT_AMENDMENT_RISK';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  projected_month_end_impact: string;
  recommended_early_intervention: string;
}

export class ContinuousFinanceEngine {
  /**
   * Scans intramonth financial trajectory on any given day
   */
  public static evaluateIntramonthRisks(dayOfMonth: number, context: {
    billedMtd: number;
    collectedMtd: number;
    expectedCollectionsRemaining: number;
    projectedOpexMtd: number;
    budgetedMonthlyOpex: number;
    unreconciledBankTxnCount: number;
  }): IntramonthAlert[] {
    const alerts: IntramonthAlert[] = [];

    // 1. Check if OPEX run-rate exceeds monthly budget (e.g. on Day 17, spend > 70% of full month budget)
    const expectedMonthPct = (dayOfMonth / 30) * 100;
    const actualSpendPct = (context.projectedOpexMtd / context.budgetedMonthlyOpex) * 100;

    if (actualSpendPct > expectedMonthPct + 15) {
      alerts.push({
        dayOfMonth,
        alertType: 'OPEX_RUN_RATE_WARNING',
        severity: 'HIGH',
        title: `Intramonth OPEX Alert (Day ${dayOfMonth}): Run-rate is ${Math.round(actualSpendPct)}% of budget`,
        projected_month_end_impact: `Month-end expenses projected to overshoot budget by ₹${Math.round((context.projectedOpexMtd / (dayOfMonth / 30)) - context.budgetedMonthlyOpex).toLocaleString()}`,
        recommended_early_intervention: 'Review high-velocity variable spend accounts (cloud compute, contractor hours) before month end.',
      });
    }

    // 2. Check collection velocity lag
    if (dayOfMonth >= 15 && context.collectedMtd < (context.billedMtd * 0.3)) {
      alerts.push({
        dayOfMonth,
        alertType: 'COLLECTION_PROBABILITY_DECAY',
        severity: 'HIGH',
        title: `Intramonth Cash Alert (Day ${dayOfMonth}): AR Collection Velocity Lag`,
        projected_month_end_impact: 'Projected month-end cash balance will slip by ₹18.4L unless overdue invoices are escalated.',
        recommended_early_intervention: 'Automate high-priority collection outreach via AR Worker.',
      });
    }

    // 3. Check bank reconciliation lag
    if (context.unreconciledBankTxnCount > 5) {
      alerts.push({
        dayOfMonth,
        alertType: 'RECONCILIATION_LAG',
        severity: 'MEDIUM',
        title: `Intramonth Recon Alert: ${context.unreconciledBankTxnCount} un-matched bank transactions`,
        projected_month_end_impact: 'Will cause Day 1 month-end close bottleneck if left unresolved.',
        recommended_early_intervention: 'Run AI Reconciliation Worker auto-matcher batch.',
      });
    }

    return alerts;
  }
}

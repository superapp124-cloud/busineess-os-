/**
 * CHATR Parallel Pilot Reconciler (Phase 9)
 * Compares CHATR Finance OS outputs side-by-side with the legacy ERP across 10 critical dimensions:
 * 1. Revenue
 * 2. Accounts Receivable
 * 3. Accounts Payable
 * 4. Reconciled Cash
 * 5. GST / Tax Liability
 * 6. Deferred Revenue
 * 7. P&L Net Income
 * 8. Balance Sheet Assets
 * 9. Cash Flow Ending Cash
 * 10. Month-End Close Completeness
 */

export interface PilotDimensionComparison {
  dimension: string;
  chatrAmount: number;
  legacyAmount: number;
  varianceAmount: number;
  variancePct: number;
  status: 'MATCH' | 'EXPLAINED_VARIANCE' | 'DISCREPANCY';
  explanation?: string;
}

export interface ParallelPilotReport {
  companyName: string;
  pilotPeriod: string;
  overallStatus: 'CERTIFIED_MATCH' | 'INVESTIGATION_REQUIRED';
  comparisons: PilotDimensionComparison[];
  summary: string;
}

export class ParallelPilotReconciler {
  /**
   * Executes full 10-dimension comparison between CHATR and Legacy ERP
   */
  public static reconcilePilotData(
    companyName: string,
    pilotPeriod: string,
    chatrData: Record<string, number>,
    legacyData: Record<string, number>
  ): ParallelPilotReport {
    const dimensions = [
      { key: 'revenue', label: '1. Revenue (ASC 606 / IFRS 15)' },
      { key: 'ar', label: '2. Accounts Receivable (AR)' },
      { key: 'ap', label: '3. Accounts Payable (AP)' },
      { key: 'cash', label: '4. Reconciled Cash & Bank' },
      { key: 'tax', label: '5. GST / Tax Net Liability' },
      { key: 'deferred_revenue', label: '6. Deferred Revenue' },
      { key: 'pnl_net_income', label: '7. P&L Net Income' },
      { key: 'bs_assets', label: '8. Balance Sheet Total Assets' },
      { key: 'cf_ending_cash', label: '9. Cash Flow Ending Cash' },
      { key: 'close_pct', label: '10. Month-End Close Completion (%)' },
    ];

    const comparisons: PilotDimensionComparison[] = [];
    let hasDiscrepancy = false;

    dimensions.forEach(dim => {
      const chatrVal = chatrData[dim.key] ?? 0;
      const legVal = legacyData[dim.key] ?? 0;
      const variance = Math.round(Math.abs(chatrVal - legVal) * 100) / 100;
      const pct = legVal > 0 ? Math.round((variance / legVal) * 10000) / 100 : 0;

      let status: PilotDimensionComparison['status'] = 'MATCH';
      let explanation = 'Exact mathematical match with legacy system.';

      if (variance > 0.01) {
        if (pct <= 0.1) {
          status = 'MATCH';
          explanation = 'Negligible rounding difference (< 0.1%).';
        } else {
          status = 'DISCREPANCY';
          explanation = `Variance of ₹${variance.toLocaleString()} (${pct}%) requires investigation.`;
          hasDiscrepancy = true;
        }
      }

      comparisons.push({
        dimension: dim.label,
        chatrAmount: chatrVal,
        legacyAmount: legVal,
        varianceAmount: variance,
        variancePct: pct,
        status,
        explanation,
      });
    });

    return {
      companyName,
      pilotPeriod,
      overallStatus: hasDiscrepancy ? 'INVESTIGATION_REQUIRED' : 'CERTIFIED_MATCH',
      comparisons,
      summary: hasDiscrepancy
        ? `Pilot comparison identified discrepancies in ${comparisons.filter(c => c.status === 'DISCREPANCY').length} dimensions.`
        : `100% Certified Parallel Pilot: All 10 financial dimensions match legacy system with zero material variance.`,
    };
  }
}

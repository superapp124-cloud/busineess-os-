/**
 * CHATR Financial Truth Reconciler (Phase 10)
 * Decomposes financial variances between CHATR and Legacy ERPs (Tally, Zoho, QuickBooks, NetSuite, SAP)
 * into exact, auditable root cause components:
 * - Recognition Timing Differences (ASC 606 schedule vs Invoice Date)
 * - FX Translation Differences
 * - Tax Classification Differences
 * - Unbilled Accrual Adjustments
 */

export interface VarianceRootCause {
  category: 'RECOGNITION_TIMING' | 'FX_TRANSLATION' | 'TAX_CLASSIFICATION' | 'UNBILLED_ACCRUAL' | 'ROUNDING_DIFFERENCE';
  description: string;
  contributing_amount: number;
  confidence: number;
  source_lineage: {
    contract_id?: string;
    invoice_id?: string;
    schedule_id?: string;
    journal_entry_id?: string;
  };
}

export interface DecomposedVarianceResult {
  dimension: string;
  chatr_amount: number;
  legacy_erp_amount: number;
  total_variance: number;
  is_fully_explained: boolean;
  unexplained_variance: number;
  root_causes: VarianceRootCause[];
  audit_verdict: string;
}

export class FinancialTruthReconciler {
  /**
   * Decomposes a material variance into its exact constituent accounting causes
   */
  public static decomposeVariance(params: {
    dimension: string;
    chatrAmount: number;
    legacyAmount: number;
    knownRootCauses: VarianceRootCause[];
  }): DecomposedVarianceResult {
    const totalVariance = Math.round(Math.abs(params.chatrAmount - params.legacyAmount) * 100) / 100;
    const explainedSum = params.knownRootCauses.reduce((s, r) => s + r.contributing_amount, 0);
    const unexplained = Math.round(Math.abs(totalVariance - explainedSum) * 100) / 100;
    const isFullyExplained = unexplained <= 0.01;

    let auditVerdict = '';
    if (isFullyExplained) {
      auditVerdict = `100% Explained: Variance of ₹${totalVariance.toLocaleString()} is fully decomposed into ${params.knownRootCauses.length} auditable accounting differences.`;
    } else {
      auditVerdict = `Partial Explanation: ₹${explainedSum.toLocaleString()} explained, ₹${unexplained.toLocaleString()} requires further subledger drilldown.`;
    }

    return {
      dimension: params.dimension,
      chatr_amount: params.chatrAmount,
      legacy_erp_amount: params.legacyAmount,
      total_variance: totalVariance,
      is_fully_explained: isFullyExplained,
      unexplained_variance: unexplained,
      root_causes: params.knownRootCauses,
      audit_verdict: auditVerdict,
    };
  }
}

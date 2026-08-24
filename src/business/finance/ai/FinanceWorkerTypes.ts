/**
 * CHATR Finance AI Worker Infrastructure (Phase 6)
 * Defines worker roles, operating modes, and the Financial Risk Queue contracts.
 */

export type FinanceWorkerRole =
  | 'CFO_ORCHESTRATOR'
  | 'FINANCE_ANALYST'
  | 'AR_WORKER'
  | 'AP_WORKER'
  | 'REVENUE_WORKER'
  | 'CASH_WORKER'
  | 'CLOSE_WORKER'
  | 'TAX_WORKER';

export type WorkerOperatingMode = 'OBSERVE' | 'PROPOSE' | 'EXECUTE';

export interface FinancialRiskItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'AR_COLLECTIONS' | 'DUPLICATE_BILL' | 'OPEX_SPIKE' | 'FX_VARIANCE' | 'REV_LEAKAGE' | 'INTEGRITY_MISMATCH';
  title: string;
  why: string;
  evidence: string;
  impact_amount: number;
  currency: string;
  recommended_action: string;
  source_lineage: {
    object_type: string;
    object_id: string;
    url?: string;
  };
}

export interface CausalAnalysisResult {
  question: string;
  primary_driver: string;
  secondary_drivers: string[];
  impact_amount: number;
  causality_chain: Array<{
    level: string;
    description: string;
    metric_or_entity: string;
  }>;
  operational_root_cause: string;
}

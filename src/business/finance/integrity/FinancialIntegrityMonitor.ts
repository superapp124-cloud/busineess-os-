/**
 * CHATR Financial Integrity Monitor (Phase 2H)
 * Continuous health verification and anomaly scanner.
 */

export interface FinancialAnomaly {
  type:
    | 'AR_GL_MISMATCH'
    | 'AP_GL_MISMATCH'
    | 'CASH_GL_MISMATCH'
    | 'STALE_DRAFT_ENTRIES'
    | 'DUPLICATE_BILLS'
    | 'ORPHAN_EVENTS'
    | 'UNBALANCED_ENTRY'
    | 'ABNORMAL_BALANCE'
    | 'CLOSED_PERIOD_VIOLATION';
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  title: string;
  detail: string;
  affected_object_id?: string;
}

export interface IntegrityReportSnapshot {
  integrity_score: number; // e.g. 99.98%
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  total_checks: number;
  passed_checks: number;
  anomalies: FinancialAnomaly[];
  checked_at: string;
}

export class FinancialIntegrityMonitor {
  /**
   * Evaluates subledger vs GL control account differences
   */
  public static verifyControlReconciliation(
    subledgerTotal: number,
    glControlTotal: number,
    type: 'AR' | 'AP' | 'CASH'
  ): { isMatch: boolean; diff: number; anomaly?: FinancialAnomaly } {
    const diff = Math.abs(subledgerTotal - glControlTotal);
    const isMatch = diff <= 1.0; // 1 currency unit tolerance

    if (isMatch) {
      return { isMatch: true, diff };
    }

    return {
      isMatch: false,
      diff,
      anomaly: {
        type: `${type}_GL_MISMATCH` as any,
        severity: 'CRITICAL',
        title: `${type} Subledger mismatch with GL Control Account`,
        detail: `Discrepancy of ₹${diff.toLocaleString()} detected between ${type} subledger (₹${subledgerTotal.toLocaleString()}) and GL control balance (₹${glControlTotal.toLocaleString()}).`,
      },
    };
  }

  /**
   * Scans a batch of accounts for abnormal balances (e.g. Asset with credit balance)
   */
  public static scanAbnormalBalances(
    accounts: Array<{ code: string; name: string; normal_balance: 'DEBIT' | 'CREDIT'; net_balance: number }>
  ): FinancialAnomaly[] {
    const anomalies: FinancialAnomaly[] = [];

    accounts.forEach(acc => {
      if (acc.normal_balance === 'DEBIT' && acc.net_balance < -0.01) {
        anomalies.push({
          type: 'ABNORMAL_BALANCE',
          severity: 'HIGH',
          title: `Abnormal credit balance on debit account ${acc.code} (${acc.name})`,
          detail: `Account ${acc.code} has a net credit balance of ₹${Math.abs(acc.net_balance).toLocaleString()} when normal balance is DEBIT.`,
          affected_object_id: acc.code,
        });
      } else if (acc.normal_balance === 'CREDIT' && acc.net_balance > 0.01) {
        anomalies.push({
          type: 'ABNORMAL_BALANCE',
          severity: 'HIGH',
          title: `Abnormal debit balance on credit account ${acc.code} (${acc.name})`,
          detail: `Account ${acc.code} has a net debit balance of ₹${acc.net_balance.toLocaleString()} when normal balance is CREDIT.`,
          affected_object_id: acc.code,
        });
      }
    });

    return anomalies;
  }
}

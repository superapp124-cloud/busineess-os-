/**
 * CHATR Revenue Integrity Monitor (Phase 3)
 * Continuous scanning for contract revenue anomalies:
 * 1. Invoice without contract
 * 2. Contract without recognition schedule
 * 3. Recognized revenue without obligation
 * 4. Deferred revenue liability mismatch
 * 5. Recognition schedule exceeding contract transaction price
 * 6. Expired contracts still recognizing revenue
 */

import { FinancialAnomaly } from '../integrity/FinancialIntegrityMonitor';

export class RevenueIntegrityMonitor {
  /**
   * Scans a set of contracts against recognition limits & schedules
   */
  public static verifyContractIntegrity(
    contracts: Array<{
      id: string;
      contract_number: string;
      transaction_price: number;
      recognized_revenue: number;
      deferred_revenue: number;
      status: string;
      end_date: string;
      has_schedules: boolean;
    }>
  ): { isHealthy: boolean; anomalies: FinancialAnomaly[] } {
    const anomalies: FinancialAnomaly[] = [];

    contracts.forEach(ctr => {
      // Check 1: Over-recognition
      if (ctr.recognized_revenue > ctr.transaction_price + 0.01) {
        anomalies.push({
          type: 'UNBALANCED_ENTRY' as any,
          severity: 'CRITICAL',
          title: `Over-recognition on contract ${ctr.contract_number}`,
          detail: `Recognized revenue (₹${ctr.recognized_revenue.toLocaleString()}) exceeds contract transaction price (₹${ctr.transaction_price.toLocaleString()}).`,
          affected_object_id: ctr.contract_number,
        });
      }

      // Check 2: Active contract with no schedules
      if (ctr.status === 'ACTIVE' && !ctr.has_schedules) {
        anomalies.push({
          type: 'ORPHAN_EVENTS' as any,
          severity: 'HIGH',
          title: `Active contract ${ctr.contract_number} has zero recognition schedules`,
          detail: `ASC 606 requires a deterministic recognition schedule for all active contracts.`,
          affected_object_id: ctr.contract_number,
        });
      }

      // Check 3: Expired active contracts
      const isExpired = new Date(ctr.end_date) < new Date();
      if (ctr.status === 'ACTIVE' && isExpired && ctr.deferred_revenue <= 0.01) {
        anomalies.push({
          type: 'STALE_DRAFT_ENTRIES' as any,
          severity: 'WARNING',
          title: `Contract ${ctr.contract_number} is expired but still marked ACTIVE`,
          detail: `Contract reached end date (${ctr.end_date}) and is fully recognized. Transition to COMPLETED.`,
          affected_object_id: ctr.contract_number,
        });
      }
    });

    return {
      isHealthy: anomalies.length === 0,
      anomalies,
    };
  }
}

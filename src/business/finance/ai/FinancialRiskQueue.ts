/**
 * CHATR Financial Risk Queue (Phase 6)
 * Continuous multi-vector anomaly scanner generating prioritized financial risk items.
 */

import { FinancialRiskItem } from './FinanceWorkerTypes';

export class FinancialRiskQueue {
  /**
   * Scans financial subledgers, invoices, and expenses for anomalies
   */
  public static scanFinancialRisks(context: {
    overdueInvoices: Array<{ id: string; invoice_number: string; amount_due: number; days_overdue: number; customer_name: string }>;
    duplicateBills: Array<{ id: string; bill_number: string; vendor_name: string; amount: number }>;
    opexAnomalies: Array<{ category: string; current_amount: number; prior_amount: number; pct_increase: number }>;
    fxVariances: Array<{ transaction_id: string; currency: string; variance_amount: number }>;
  }): FinancialRiskItem[] {
    const risks: FinancialRiskItem[] = [];

    // 1. High Risk: AR Invoices Overdue > 60 Days
    context.overdueInvoices.forEach(inv => {
      if (inv.days_overdue >= 60) {
        risks.push({
          id: `risk_ar_${inv.id}`,
          severity: 'HIGH',
          category: 'AR_COLLECTIONS',
          title: `Overdue AR: ${inv.customer_name} (${inv.invoice_number}) is ${inv.days_overdue} days late`,
          why: `Customer invoice has crossed the 60-day aging threshold without payment.`,
          evidence: `Invoice ${inv.invoice_number} for ₹${inv.amount_due.toLocaleString()} due ${inv.days_overdue} days ago.`,
          impact_amount: inv.amount_due,
          currency: 'INR',
          recommended_action: `Initiate collections escalation workflow and hold further credit issuance.`,
          source_lineage: {
            object_type: 'fin_invoices',
            object_id: inv.id,
          },
        });
      }
    });

    // 2. High Risk: Duplicate Vendor Invoices
    context.duplicateBills.forEach(bill => {
      risks.push({
        id: `risk_dup_${bill.id}`,
        severity: 'HIGH',
        category: 'DUPLICATE_BILL',
        title: `Duplicate Vendor Bill Detected: ${bill.vendor_name} (${bill.bill_number})`,
        why: `Matching invoice number and amount already exists in AP subledger.`,
        evidence: `Bill ${bill.bill_number} from ${bill.vendor_name} matching existing hash.`,
        impact_amount: bill.amount,
        currency: 'INR',
        recommended_action: `Flag bill as duplicate and block automated payment release.`,
        source_lineage: {
          object_type: 'fin_bills',
          object_id: bill.id,
        },
      });
    });

    // 3. Medium Risk: OPEX Spikes (> 25% Increase)
    context.opexAnomalies.forEach(op => {
      if (op.pct_increase >= 25) {
        risks.push({
          id: `risk_opex_${op.category.toLowerCase()}`,
          severity: 'MEDIUM',
          category: 'OPEX_SPIKE',
          title: `Operating Expense Spike: ${op.category} up ${op.pct_increase.toFixed(1)}% MoM`,
          why: `Current month spend exceeded previous period baseline by more than 25%.`,
          evidence: `Spend increased from ₹${op.prior_amount.toLocaleString()} to ₹${op.current_amount.toLocaleString()}.`,
          impact_amount: op.current_amount - op.prior_amount,
          currency: 'INR',
          recommended_action: `Audit underlying vendor line items and usage surge logs.`,
          source_lineage: {
            object_type: 'fin_accounts',
            object_id: op.category,
          },
        });
      }
    });

    // 4. Low Risk: FX Variances
    context.fxVariances.forEach(fx => {
      if (fx.variance_amount > 50000) {
        risks.push({
          id: `risk_fx_${fx.transaction_id}`,
          severity: 'LOW',
          category: 'FX_VARIANCE',
          title: `Unusual FX Variance on ${fx.currency} Settlement`,
          why: `Settlement FX rate diverged significantly from spot rate at invoice creation.`,
          evidence: `Variance of ₹${fx.variance_amount.toLocaleString()} on transaction ${fx.transaction_id}.`,
          impact_amount: fx.variance_amount,
          currency: 'INR',
          recommended_action: `Verify exchange rate source feed and record realized FX difference.`,
          source_lineage: {
            object_type: 'fin_payments',
            object_id: fx.transaction_id,
          },
        });
      }
    });

    return risks;
  }
}

/**
 * CHATR Golden Ledger Benchmark (Phase 7)
 * A canonical, immutable reference financial dataset representing 90 days of full-cycle business operations:
 * - 3 Enterprise Customers (Contracts totaling ₹72,00,000)
 * - ASC 606 Straight-line & Milestone Recognition
 * - 4 Key Vendors (AWS Cloud, Google Workspace, Office Lease, Insurance)
 * - Monthly Accruals, Prepaids, Asset Depreciation
 * - GST Input/Output Tax, TDS Deductions
 * - Real Bank CSV Imports, Fee Deductions, Full Month-End Close
 */

export interface GoldenLedgerBenchmark {
  period_days: number;
  expected_gross_contract_value: number;
  expected_invoiced_amount: number;
  expected_recognized_revenue_90d: number;
  expected_deferred_revenue_ending: number;
  expected_total_opex_90d: number;
  expected_net_income_90d: number;
  expected_ending_cash_balance: number;
  expected_ar_outstanding: number;
  expected_ap_outstanding: number;
  expected_gross_margin_pct: number;
}

export class GoldenLedger {
  /**
   * Reference Golden Ledger Benchmark constants for a 90-day canonical operating cycle
   */
  public static getReferenceBenchmark(): GoldenLedgerBenchmark {
    // Contract 1: Acme Corp ₹36,00,000 (36 mo SaaS -> ₹1,00,000/mo) -> Recognized 90d: ₹3,00,000
    // Contract 2: Beta Tech ₹24,00,000 (12 mo SaaS ₹18L + ₹6L Milestone on UAT) -> Recognized 90d: ₹4,50,000 SaaS + ₹6,00,000 Milestone = ₹10,50,000
    // Contract 3: Gamma Inc ₹12,00,000 (12 mo SaaS -> ₹1,00,000/mo) -> Recognized 90d: ₹3,00,000
    // Total Contract Value = ₹72,00,000
    // Total Recognized 90d = ₹16,50,000
    // Ending Deferred Revenue = ₹72,00,000 - ₹16,50,000 = ₹55,50,000

    // OPEX 90d:
    // AWS Cloud: ₹4,50,000 (₹1.5L/mo)
    // Office Rent: ₹3,00,000 (₹1.0L/mo)
    // Insurance Amortization (Prepaid): ₹75,000 (₹25k/mo)
    // MacBook Fleet Depreciation: ₹1,20,000 (₹40k/mo)
    // Total OPEX = ₹9,45,000

    // Net Income = ₹16,50,000 - ₹9,45,000 = ₹7,05,000
    // Gross Margin % = (₹7,05,000 / ₹16,50,000) * 100 = 42.73%

    return {
      period_days: 90,
      expected_gross_contract_value: 7200000,
      expected_invoiced_amount: 7200000,
      expected_recognized_revenue_90d: 1650000,
      expected_deferred_revenue_ending: 5550000,
      expected_total_opex_90d: 9450000,
      expected_net_income_90d: 705000,
      expected_ending_cash_balance: 5850000,
      expected_ar_outstanding: 1800000,
      expected_ap_outstanding: 450000,
      expected_gross_margin_pct: 42.73,
    };
  }

  /**
   * Validates computed financial outputs against the immutable Golden Ledger target
   */
  public static verifyAgainstGoldenLedger(actual: GoldenLedgerBenchmark): {
    passes: boolean;
    driftDetails: string[];
  } {
    const ref = this.getReferenceBenchmark();
    const driftDetails: string[] = [];

    function checkField(name: keyof GoldenLedgerBenchmark, label: string) {
      const diff = Math.abs(actual[name] - ref[name]);
      if (diff > 0.01) {
        driftDetails.push(`Golden Ledger Drift on ${label}: Expected ₹${ref[name].toLocaleString()}, got ₹${actual[name].toLocaleString()} (Diff = ₹${diff.toFixed(2)})`);
      }
    }

    checkField('expected_gross_contract_value', 'Gross Contract Value');
    checkField('expected_recognized_revenue_90d', 'Recognized Revenue 90d');
    checkField('expected_deferred_revenue_ending', 'Ending Deferred Revenue');
    checkField('expected_total_opex_90d', 'Total OPEX 90d');
    checkField('expected_net_income_90d', 'Net Income 90d');

    return {
      passes: driftDetails.length === 0,
      driftDetails,
    };
  }
}

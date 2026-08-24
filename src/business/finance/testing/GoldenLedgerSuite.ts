/**
 * CHATR 6-Golden-Ledger Regression Suite (Phase 8)
 * Canonical benchmarks for continuous regression testing across 6 distinct business archetypes:
 * - Golden Ledger A: Simple SaaS (Straight-line subscriptions, deferred revenue)
 * - Golden Ledger B: India GST Enterprise (CGST, SGST, IGST, TDS 194C/194J)
 * - Golden Ledger C: Multi-Entity Multinational (USD/INR consolidation, eliminations)
 * - Golden Ledger D: Services + Milestone Contracts (ASC 606 multi-element allocations)
 * - Golden Ledger E: High-Volume Marketplace (Settlement reconciliation, processor fees)
 * - Golden Ledger F: FX-Heavy Global Operations (Realized/Unrealized FX, Translation reserves)
 */

export interface GoldenBenchmarkProfile {
  code: 'A_SAAS' | 'B_INDIA_GST' | 'C_MULTI_ENTITY' | 'D_MILESTONES' | 'E_MARKETPLACE' | 'F_FX_GLOBAL';
  name: string;
  currency: string;
  expected_revenue: number;
  expected_expenses: number;
  expected_net_income: number;
  expected_ending_cash: number;
  expected_balance_sheet_balance: boolean;
}

export class GoldenLedgerSuite {
  /**
   * Retrieves canonical target profiles for all 6 Golden Ledgers
   */
  public static getAllGoldenProfiles(): GoldenBenchmarkProfile[] {
    return [
      {
        code: 'A_SAAS',
        name: 'Golden Ledger A: Simple SaaS (100% ARR Subscriptions)',
        currency: 'INR',
        expected_revenue: 12000000,   // ₹1.2 Cr ARR (₹10L/mo straight-line)
        expected_expenses: 7500000,  // ₹75L OPEX
        expected_net_income: 4500000, // ₹45L Net Income
        expected_ending_cash: 9200000,
        expected_balance_sheet_balance: true,
      },
      {
        code: 'B_INDIA_GST',
        name: 'Golden Ledger B: India GST & TDS Enterprise',
        currency: 'INR',
        expected_revenue: 25000000,   // ₹2.5 Cr Revenue
        expected_expenses: 16000000,  // ₹1.6 Cr Expenses
        expected_net_income: 9000000, // ₹90L Net Income
        expected_ending_cash: 18500000,
        expected_balance_sheet_balance: true,
      },
      {
        code: 'C_MULTI_ENTITY',
        name: 'Golden Ledger C: Multi-Entity Multinational (Consolidated)',
        currency: 'INR',
        expected_revenue: 48000000,   // ₹4.8 Cr Consolidated
        expected_expenses: 31000000,  // ₹3.1 Cr Consolidated Expenses
        expected_net_income: 17000000, // ₹1.7 Cr Consolidated Net Income
        expected_ending_cash: 34000000,
        expected_balance_sheet_balance: true,
      },
      {
        code: 'D_MILESTONES',
        name: 'Golden Ledger D: Services & Milestone Contracts',
        currency: 'INR',
        expected_revenue: 18000000,   // ₹1.8 Cr Revenue
        expected_expenses: 12000000,  // ₹1.2 Cr Expenses
        expected_net_income: 6000000, // ₹60L Net Income
        expected_ending_cash: 14200000,
        expected_balance_sheet_balance: true,
      },
      {
        code: 'E_MARKETPLACE',
        name: 'Golden Ledger E: High-Volume Marketplace (Fee Processing)',
        currency: 'INR',
        expected_revenue: 8500000,    // ₹85L Net Take Rate
        expected_expenses: 4200000,   // ₹42L OPEX
        expected_net_income: 4300000, // ₹43L Net Income
        expected_ending_cash: 22000000,
        expected_balance_sheet_balance: true,
      },
      {
        code: 'F_FX_GLOBAL',
        name: 'Golden Ledger F: FX-Heavy Global Operations',
        currency: 'USD',
        expected_revenue: 2400000,    // $2.4M Revenue
        expected_expenses: 1550000,   // $1.55M Expenses
        expected_net_income: 850000,  // $850k Net Income
        expected_ending_cash: 1900000,
        expected_balance_sheet_balance: true,
      },
    ];
  }

  /**
   * Evaluates simulated execution output against all 6 Golden Ledgers
   */
  public static runRegressionCheck(actualProfiles: GoldenBenchmarkProfile[]): {
    totalChecked: number;
    passed: number;
    failed: number;
    violations: string[];
  } {
    const canonicals = this.getAllGoldenProfiles();
    const violations: string[] = [];
    let passed = 0;

    canonicals.forEach(canon => {
      const act = actualProfiles.find(p => p.code === canon.code);
      if (!act) {
        violations.push(`Missing profile output for ${canon.code}`);
        return;
      }

      const revDiff = Math.abs(act.expected_revenue - canon.expected_revenue);
      const expDiff = Math.abs(act.expected_expenses - canon.expected_expenses);
      const netDiff = Math.abs(act.expected_net_income - canon.expected_net_income);

      if (revDiff > 0.01 || expDiff > 0.01 || netDiff > 0.01) {
        violations.push(`Drift on ${canon.name}: Revenue diff=₹${revDiff}, Expense diff=₹${expDiff}, Net diff=₹${netDiff}`);
      } else {
        passed++;
      }
    });

    return {
      totalChecked: canonicals.length,
      passed,
      failed: violations.length,
      violations,
    };
  }
}

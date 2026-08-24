/**
 * CHATR Financial Statement Certification Engine (Phase 5.5)
 * Mathematically validates the three fundamental financial statement invariants:
 * 1. Balance Sheet: Assets = Liabilities + Equity
 * 2. P&L: Revenue - Operating Expenses = Net Income
 * 3. Cash Flow: Beginning Cash + Operating + Investing + Financing = Ending Cash (= GL Reconciled Cash)
 */

export interface StatementCertificationInput {
  assets: number;
  liabilities: number;
  equity: number;
  revenue: number;
  expenses: number;
  net_income: number;
  beginning_cash: number;
  operating_cash_flow: number;
  investing_cash_flow: number;
  financing_cash_flow: number;
  ending_cash: number;
  gl_reconciled_cash: number;
}

export interface StatementCertificationResult {
  is_certified: boolean;
  balance_sheet_balanced: boolean;
  pnl_balanced: boolean;
  cash_flow_balanced: boolean;
  cash_gl_reconciled: boolean;
  variance_details: string[];
}

export class FinancialCertificationEngine {
  /**
   * Certifies financial statements against strict mathematical invariants
   */
  public static certifyStatements(input: StatementCertificationInput): StatementCertificationResult {
    const variances: string[] = [];

    // Invariant 1: Assets = Liabilities + Equity
    const bsDiff = Math.abs(input.assets - (input.liabilities + input.equity));
    const bsBalanced = bsDiff <= 0.01;
    if (!bsBalanced) {
      variances.push(`Balance Sheet Invariant Violated: Assets (₹${input.assets.toLocaleString()}) != Liabilities (₹${input.liabilities.toLocaleString()}) + Equity (₹${input.equity.toLocaleString()}), Diff = ₹${bsDiff.toFixed(2)}`);
    }

    // Invariant 2: Revenue - Expenses = Net Income
    const pnlDiff = Math.abs((input.revenue - input.expenses) - input.net_income);
    const pnlBalanced = pnlDiff <= 0.01;
    if (!pnlBalanced) {
      variances.push(`P&L Invariant Violated: Revenue (₹${input.revenue.toLocaleString()}) - Expenses (₹${input.expenses.toLocaleString()}) != Net Income (₹${input.net_income.toLocaleString()}), Diff = ₹${pnlDiff.toFixed(2)}`);
    }

    // Invariant 3: Cash Flow calculation
    const calculatedEndingCash = input.beginning_cash + input.operating_cash_flow + input.investing_cash_flow + input.financing_cash_flow;
    const cfDiff = Math.abs(calculatedEndingCash - input.ending_cash);
    const cfBalanced = cfDiff <= 0.01;
    if (!cfBalanced) {
      variances.push(`Cash Flow Invariant Violated: Calculated Ending Cash (₹${calculatedEndingCash.toLocaleString()}) != Reported Ending Cash (₹${input.ending_cash.toLocaleString()})`);
    }

    // Invariant 4: Cash Flow Ending Cash = GL Reconciled Cash
    const cashGlDiff = Math.abs(input.ending_cash - input.gl_reconciled_cash);
    const cashGlReconciled = cashGlDiff <= 0.01;
    if (!cashGlReconciled) {
      variances.push(`Cash/GL Invariant Violated: Reported Cash (₹${input.ending_cash.toLocaleString()}) != GL Cash Balance (₹${input.gl_reconciled_cash.toLocaleString()})`);
    }

    const isCertified = bsBalanced && pnlBalanced && cfBalanced && cashGlReconciled;

    return {
      is_certified: isCertified,
      balance_sheet_balanced: bsBalanced,
      pnl_balanced: pnlBalanced,
      cash_flow_balanced: cfBalanced,
      cash_gl_reconciled: cashGlReconciled,
      variance_details: variances,
    };
  }
}

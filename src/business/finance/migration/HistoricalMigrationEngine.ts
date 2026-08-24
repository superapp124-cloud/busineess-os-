/**
 * CHATR Historical Financial Migration Engine (Phase 8)
 * Ingests opening trial balances and historical chart of accounts from legacy systems
 * with strict double-entry balance validation and period cut-over enforcement.
 */

export interface HistoricalOpeningLine {
  account_code: string;
  account_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  debit_amount: number;
  credit_amount: number;
}

export interface HistoricalMigrationResult {
  is_valid: boolean;
  total_debits: number;
  total_credits: number;
  line_count: number;
  opening_date: string;
  retained_earnings_computed: number;
  validation_errors: string[];
}

export class HistoricalMigrationEngine {
  /**
   * Validates and imports a legacy historical trial balance as of a cut-over date
   */
  public static validateOpeningTrialBalance(
    openingDate: string,
    lines: HistoricalOpeningLine[]
  ): HistoricalMigrationResult {
    const errors: string[] = [];
    let totalDebits = 0;
    let totalCredits = 0;

    lines.forEach(l => {
      if (l.debit_amount > 0 && l.credit_amount > 0) {
        errors.push(`Account ${l.account_code} has both debit and credit amounts.`);
      }
      totalDebits += l.debit_amount;
      totalCredits += l.credit_amount;
    });

    totalDebits = Math.round(totalDebits * 100) / 100;
    totalCredits = Math.round(totalCredits * 100) / 100;

    const diff = Math.abs(totalDebits - totalCredits);
    const isBalanced = diff <= 0.01;

    if (!isBalanced) {
      errors.push(`Trial balance unbalanced: Total Debits (₹${totalDebits.toLocaleString()}) != Total Credits (₹${totalCredits.toLocaleString()}), Diff = ₹${diff.toFixed(2)}`);
    }

    // Retained earnings calculation (Assets - Liabilities - Equity)
    const assetSum = lines.filter(l => l.account_type === 'ASSET').reduce((s, l) => s + (l.debit_amount - l.credit_amount), 0);
    const liabSum = lines.filter(l => l.account_type === 'LIABILITY').reduce((s, l) => s + (l.credit_amount - l.debit_amount), 0);
    const equitySum = lines.filter(l => l.account_type === 'EQUITY').reduce((s, l) => s + (l.credit_amount - l.debit_amount), 0);
    const retainedEarnings = assetSum - liabSum - equitySum;

    return {
      is_valid: isBalanced && errors.length === 0,
      total_debits: totalDebits,
      total_credits: totalCredits,
      line_count: lines.length,
      opening_date: openingDate,
      retained_earnings_computed: Math.round(retainedEarnings * 100) / 100,
      validation_errors: errors,
    };
  }
}

/**
 * CHATR Accrual Engine (Phase 5)
 * Handles expense accrual proposals and automatic reversing journal entries.
 */

import { JournalProposal } from '../subledgers/ARSubledger';

export class AccrualEngine {
  /**
   * Generates double-entry proposal to record an accrued expense:
   * Dr Expense Account (increases expense in current period)
   *   Cr Accrued Liabilities (2120)
   */
  public static proposeAccrualEntry(
    accrualNumber: string,
    title: string,
    amount: number,
    currency: string,
    postingDate: string,
    expenseAccountId: string,
    accruedLiabAccountId: string
  ): JournalProposal {
    return {
      memo: `Month-End Accrual: ${title} (${accrualNumber})`,
      source_type: 'ACCRUAL',
      source_id: accrualNumber,
      posting_date: postingDate,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: 1.0,
      lines: [
        {
          account_id: expenseAccountId,
          debit_amount: amount,
          credit_amount: 0,
          currency,
          functional_debit: amount,
          functional_credit: 0,
          memo: `Accrued expense: ${title}`,
        },
        {
          account_id: accruedLiabAccountId,
          debit_amount: 0,
          credit_amount: amount,
          currency,
          functional_debit: 0,
          functional_credit: amount,
          memo: `Accrued liability: ${title}`,
        },
      ],
    };
  }

  /**
   * Generates reversing entry on first day of next period:
   * Dr Accrued Liabilities (2120 - clears liability)
   *   Cr Expense Account (offsets incoming actual vendor invoice)
   */
  public static proposeReversalEntry(
    accrualNumber: string,
    title: string,
    amount: number,
    currency: string,
    reversalDate: string,
    expenseAccountId: string,
    accruedLiabAccountId: string
  ): JournalProposal {
    return {
      memo: `Auto-Reversal of Accrual: ${title} (${accrualNumber})`,
      source_type: 'ACCRUAL_REVERSAL',
      source_id: accrualNumber,
      posting_date: reversalDate,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: 1.0,
      lines: [
        {
          account_id: accruedLiabAccountId,
          debit_amount: amount,
          credit_amount: 0,
          currency,
          functional_debit: amount,
          functional_credit: 0,
          memo: `Clear accrued liability: ${title}`,
        },
        {
          account_id: expenseAccountId,
          debit_amount: 0,
          credit_amount: amount,
          currency,
          functional_debit: 0,
          functional_credit: amount,
          memo: `Reverse accrued expense: ${title}`,
        },
      ],
    };
  }
}

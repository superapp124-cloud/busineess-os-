/**
 * CHATR Prepaid Expense Engine (Phase 5)
 * Manages upfront asset capitalization and monthly amortization release.
 */

import { JournalProposal } from '../subledgers/ARSubledger';

export class PrepaidEngine {
  /**
   * Generates monthly amortization release journal proposal:
   * Dr Operating Expense (e.g. Insurance Expense)
   *   Cr Prepaid Expenses (1150 - decreases prepaid asset)
   */
  public static proposeAmortizationEntry(
    prepaidNumber: string,
    title: string,
    monthlyAmount: number,
    currency: string,
    postingDate: string,
    prepaidAssetAccountId: string,
    expenseAccountId: string
  ): JournalProposal {
    return {
      memo: `Prepaid Amortization: ${title} (${prepaidNumber})`,
      source_type: 'PREPAID_AMORTIZATION',
      source_id: prepaidNumber,
      posting_date: postingDate,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: 1.0,
      lines: [
        {
          account_id: expenseAccountId,
          debit_amount: monthlyAmount,
          credit_amount: 0,
          currency,
          functional_debit: monthlyAmount,
          functional_credit: 0,
          memo: `Expense recognized from prepaid: ${title}`,
        },
        {
          account_id: prepaidAssetAccountId,
          debit_amount: 0,
          credit_amount: monthlyAmount,
          currency,
          functional_debit: 0,
          functional_credit: monthlyAmount,
          memo: `Prepaid asset released: ${title}`,
        },
      ],
    };
  }
}

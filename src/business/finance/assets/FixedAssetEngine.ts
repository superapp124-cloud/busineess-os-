/**
 * CHATR Fixed Asset & Depreciation Engine (Phase 5)
 * Calculates monthly depreciation and generates contra-asset double-entry proposals.
 */

import { JournalProposal } from '../subledgers/ARSubledger';

export class FixedAssetEngine {
  /**
   * Calculates monthly straight-line depreciation: (Acquisition Cost - Salvage Value) / Useful Life Months
   */
  public static calculateMonthlyDepreciation(
    acquisitionCost: number,
    salvageValue: number,
    usefulLifeMonths: number
  ): number {
    if (usefulLifeMonths <= 0) return 0;
    const depreciableBase = Math.max(0, acquisitionCost - salvageValue);
    return Math.round((depreciableBase / usefulLifeMonths) * 100) / 100;
  }

  /**
   * Generates monthly depreciation journal proposal:
   * Dr Depreciation Expense (5210)
   *   Cr Accumulated Depreciation (1220 Contra Asset)
   */
  public static proposeDepreciationEntry(
    assetNumber: string,
    assetName: string,
    depreciationAmount: number,
    currency: string,
    postingDate: string,
    depExpenseAccountId: string,
    accumDepAccountId: string
  ): JournalProposal {
    return {
      memo: `Monthly Depreciation: ${assetName} (${assetNumber})`,
      source_type: 'DEPRECIATION',
      source_id: assetNumber,
      posting_date: postingDate,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: 1.0,
      lines: [
        {
          account_id: depExpenseAccountId,
          debit_amount: depreciationAmount,
          credit_amount: 0,
          currency,
          functional_debit: depreciationAmount,
          functional_credit: 0,
          memo: `Depreciation expense: ${assetName}`,
        },
        {
          account_id: accumDepAccountId,
          debit_amount: 0,
          credit_amount: depreciationAmount,
          currency,
          functional_debit: 0,
          functional_credit: depreciationAmount,
          memo: `Accumulated depreciation: ${assetName}`,
        },
      ],
    };
  }
}

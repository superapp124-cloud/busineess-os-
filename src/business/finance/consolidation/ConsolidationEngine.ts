/**
 * CHATR Intercompany Consolidation Engine (Phase 5)
 * Matches intercompany transactions between entities and generates elimination entries.
 */

import { JournalProposal } from '../subledgers/ARSubledger';

export interface IntercompanyMatch {
  from_entity_id: string;
  to_entity_id: string;
  receivable_amount: number;
  payable_amount: number;
  is_matched: boolean;
  variance: number;
}

export class ConsolidationEngine {
  /**
   * Generates elimination journal entry for consolidated statements:
   * Dr Intercompany Payable (eliminates liability)
   *   Cr Intercompany Receivable (eliminates asset)
   */
  public static proposeEliminationEntry(
    fromEntityCode: string,
    toEntityCode: string,
    amount: number,
    currency: string,
    postingDate: string,
    intercoReceivableAccountId: string,
    intercoPayableAccountId: string
  ): JournalProposal {
    return {
      memo: `Consolidation Elimination: ${fromEntityCode} <-> ${toEntityCode}`,
      source_type: 'INTERCOMPANY_ELIMINATION',
      source_id: `ELIM-${fromEntityCode}-${toEntityCode}`,
      posting_date: postingDate,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: 1.0,
      lines: [
        {
          account_id: intercoPayableAccountId,
          debit_amount: amount,
          credit_amount: 0,
          currency,
          functional_debit: amount,
          functional_credit: 0,
          memo: `Eliminate intercompany payable (${toEntityCode})`,
        },
        {
          account_id: intercoReceivableAccountId,
          debit_amount: 0,
          credit_amount: amount,
          currency,
          functional_debit: 0,
          functional_credit: amount,
          memo: `Eliminate intercompany receivable (${fromEntityCode})`,
        },
      ],
    };
  }
}

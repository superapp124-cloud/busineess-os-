/**
 * CHATR Bank Matching Engine (Phase 4)
 * Deterministic multi-rule matching between bank transactions and internal subledgers.
 */

export interface MatchCandidate {
  id: string;
  source_type: 'PAYMENT' | 'INVOICE' | 'BILL' | 'JOURNAL_LINE';
  reference_number?: string;
  amount: number;
  date: string;
  counterparty_name?: string;
}

export interface MatchResult {
  is_match: boolean;
  rule_applied?: 'EXACT_REF_AND_AMOUNT' | 'DATE_WINDOW_AMOUNT' | 'FUZZY_NAME_AMOUNT' | 'FEE_DEDUCTION_MATCH';
  confidence_score: number;
  matched_candidate_id?: string;
  fee_difference: number;
}

export class BankMatchingEngine {
  /**
   * Evaluates a bank transaction against a list of open candidate ledger items
   */
  public static matchTransaction(
    bankTx: {
      amount: number;
      date: string;
      reference_number?: string;
      payee_payer?: string;
      description?: string;
    },
    candidates: MatchCandidate[]
  ): MatchResult {
    // Rule 1: Exact Reference + Exact Amount
    if (bankTx.reference_number) {
      const refMatch = candidates.find(
        c => c.reference_number === bankTx.reference_number && Math.abs(c.amount - bankTx.amount) <= 0.01
      );
      if (refMatch) {
        return {
          is_match: true,
          rule_applied: 'EXACT_REF_AND_AMOUNT',
          confidence_score: 1.0,
          matched_candidate_id: refMatch.id,
          fee_difference: 0,
        };
      }
    }

    // Rule 2: Date Window (+/- 3 days) + Exact Amount
    const txTime = new Date(bankTx.date).getTime();
    const dateMatch = candidates.find(c => {
      const cTime = new Date(c.date).getTime();
      const dayDiff = Math.abs(txTime - cTime) / (1000 * 60 * 60 * 24);
      return dayDiff <= 3 && Math.abs(c.amount - bankTx.amount) <= 0.01;
    });

    if (dateMatch) {
      return {
        is_match: true,
        rule_applied: 'DATE_WINDOW_AMOUNT',
        confidence_score: 0.95,
        matched_candidate_id: dateMatch.id,
        fee_difference: 0,
      };
    }

    // Rule 3: Fee Deduction Match (e.g. Bank credit ₹98,000 + ₹2,000 fee = Invoice ₹100,000)
    // Common for Stripe / Razorpay (1% to 3% processing fees)
    const feeMatch = candidates.find(c => {
      const diff = c.amount - bankTx.amount;
      const feePercent = (diff / c.amount) * 100;
      // Fee typically between 0.5% and 4.0%
      return diff > 0 && feePercent >= 0.5 && feePercent <= 4.0;
    });

    if (feeMatch) {
      return {
        is_match: true,
        rule_applied: 'FEE_DEDUCTION_MATCH',
        confidence_score: 0.90,
        matched_candidate_id: feeMatch.id,
        fee_difference: Math.round((feeMatch.amount - bankTx.amount) * 100) / 100,
      };
    }

    return {
      is_match: false,
      confidence_score: 0,
      fee_difference: 0,
    };
  }
}

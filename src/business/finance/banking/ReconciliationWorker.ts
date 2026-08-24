/**
 * CHATR AI Reconciliation Worker (Phase 4)
 * Operates strictly in PROPOSAL MODE:
 * Analyzes unmatched bank exceptions, identifies likely underlying invoices or processor fee deductions,
 * and proposes an accounting resolution for human sign-off before posting.
 */

import { MatchCandidate, BankMatchingEngine } from './BankMatchingEngine';

export interface AIReconciliationProposal {
  bank_transaction_id: string;
  bank_amount: number;
  matched_invoice_or_bill_id?: string;
  proposed_action: 'SETTLE_INVOICE_WITH_FEE' | 'SETTLE_EXACT' | 'CREATE_DIRECT_EXPENSE' | 'CREATE_TRANSFER';
  deducted_fee_amount: number;
  ai_confidence: number;
  ai_rationale: string;
  review_required: boolean;
}

export class ReconciliationWorker {
  /**
   * Generates intelligent resolution proposals for unmatched bank transactions
   */
  public static proposeResolution(
    bankTx: {
      id: string;
      amount: number;
      date: string;
      description: string;
      reference_number?: string;
      transaction_type: 'CREDIT' | 'DEBIT';
    },
    openInvoices: Array<{ id: string; invoice_number: string; amount_due: number; customer_name: string }>
  ): AIReconciliationProposal {
    // 1. Search for invoice reference in bank narrative
    const foundByRef = openInvoices.find(
      inv => bankTx.description.toUpperCase().includes(inv.invoice_number.toUpperCase())
    );

    if (foundByRef) {
      const diff = foundByRef.amount_due - bankTx.amount;
      if (diff > 0 && diff <= foundByRef.amount_due * 0.05) {
        // Likely processor fee deduction (e.g. ₹2,000 fee on ₹100,000 invoice)
        return {
          bank_transaction_id: bankTx.id,
          bank_amount: bankTx.amount,
          matched_invoice_or_bill_id: foundByRef.id,
          proposed_action: 'SETTLE_INVOICE_WITH_FEE',
          deducted_fee_amount: diff,
          ai_confidence: 0.96,
          ai_rationale: `Bank narrative explicitly references invoice ${foundByRef.invoice_number}. Difference of ₹${diff.toLocaleString()} (${((diff/foundByRef.amount_due)*100).toFixed(1)}%) represents standard payment gateway processing fees.`,
          review_required: true,
        };
      }
    }

    // 2. Fallback to fee matching heuristic
    const candidates: MatchCandidate[] = openInvoices.map(inv => ({
      id: inv.id,
      source_type: 'INVOICE',
      amount: inv.amount_due,
      date: bankTx.date,
      reference_number: inv.invoice_number,
      counterparty_name: inv.customer_name,
    }));

    const match = BankMatchingEngine.matchTransaction(bankTx, candidates);

    if (match.is_match && match.matched_candidate_id) {
      return {
        bank_transaction_id: bankTx.id,
        bank_amount: bankTx.amount,
        matched_invoice_or_bill_id: match.matched_candidate_id,
        proposed_action: match.fee_difference > 0 ? 'SETTLE_INVOICE_WITH_FEE' : 'SETTLE_EXACT',
        deducted_fee_amount: match.fee_difference,
        ai_confidence: match.confidence_score,
        ai_rationale: `Matched based on rule ${match.rule_applied} with confidence ${(match.confidence_score * 100).toFixed(0)}%.`,
        review_required: true,
      };
    }

    // 3. Direct expense heuristic
    return {
      bank_transaction_id: bankTx.id,
      bank_amount: bankTx.amount,
      proposed_action: 'CREATE_DIRECT_EXPENSE',
      deducted_fee_amount: 0,
      ai_confidence: 0.70,
      ai_rationale: 'No matching open AR invoice or AP bill found. Proposed as unallocated direct bank transaction.',
      review_required: true,
    };
  }
}

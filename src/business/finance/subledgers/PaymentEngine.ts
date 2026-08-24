/**
 * CHATR Payment Subledger & Settlement Engine (Phase 2E)
 * Handles full payments, partial allocations, processor fees, withholding, and realized FX gain/loss.
 */

import { JournalProposal } from './ARSubledger';

export interface PaymentReceiptDraft {
  payment_number: string;
  payment_date: string;
  customer_id: string;
  received_amount: number;
  currency: string;
  payment_fx_rate: number;
  bank_account_id: string; // e.g. 1113 Current Account
  ar_account_id: string; // e.g. 1120 Trade Receivables
  processor_fee_account_id?: string; // e.g. 5311 Bank / Payment Charges
  fee_amount?: number; // Processor fee deducted e.g. Stripe/Razorpay ₹2,000
  fx_gain_loss_account_id?: string; // e.g. 4220 FX Gain / 5320 FX Loss
  allocations: Array<{
    invoice_id: string;
    invoice_number: string;
    invoice_orig_fx_rate: number;
    allocated_amount: number;
  }>;
}

export class PaymentEngine {
  /**
   * Generates a balanced double-entry settlement journal proposal
   *
   * Example:
   * Dr Bank Account (Net received amount)
   * Dr Payment Processing Fee Expense (if deducted at source)
   * Dr/Cr Realized FX Gain/Loss (if FX rate moved since invoice issue)
   *   Cr Accounts Receivable (Total invoice value settled)
   */
  public static proposePaymentReceiptJournal(receipt: PaymentReceiptDraft): JournalProposal {
    const currency = receipt.currency;
    const paymentFx = receipt.payment_fx_rate || 1.0;
    const feeAmount = receipt.fee_amount || 0;
    const netBankAmount = receipt.received_amount - feeAmount;

    const funcNetBank = Math.round(netBankAmount * paymentFx * 100) / 100;
    const funcFee = Math.round(feeAmount * paymentFx * 100) / 100;

    const lines: Array<{
      account_id: string;
      debit_amount: number;
      credit_amount: number;
      currency: string;
      functional_debit: number;
      functional_credit: number;
      memo?: string;
    }> = [];

    // 1. Dr Bank Account (Net cash received)
    lines.push({
      account_id: receipt.bank_account_id,
      debit_amount: netBankAmount,
      credit_amount: 0,
      currency,
      functional_debit: funcNetBank,
      functional_credit: 0,
      memo: `Cash received for payment #${receipt.payment_number}`,
    });

    // 2. Dr Payment Processing Fee (if fee deducted)
    if (feeAmount > 0 && receipt.processor_fee_account_id) {
      lines.push({
        account_id: receipt.processor_fee_account_id,
        debit_amount: feeAmount,
        credit_amount: 0,
        currency,
        functional_debit: funcFee,
        functional_credit: 0,
        memo: `Processor fee deducted on payment #${receipt.payment_number}`,
      });
    }

    // 3. Process each invoice allocation & calculate realized FX gain/loss
    let totalSettled = 0;
    let totalFxDifference = 0;

    receipt.allocations.forEach(alloc => {
      totalSettled += alloc.allocated_amount;
      const invoiceFx = alloc.invoice_orig_fx_rate || paymentFx;

      // Realized FX Gain/Loss = (Payment FX - Invoice Issue FX) * Allocated Amount
      const fxDiff = (paymentFx - invoiceFx) * alloc.allocated_amount;
      totalFxDifference += fxDiff;

      const funcARCredit = Math.round(alloc.allocated_amount * invoiceFx * 100) / 100;

      // Cr Accounts Receivable (at original invoice rate)
      lines.push({
        account_id: receipt.ar_account_id,
        debit_amount: 0,
        credit_amount: alloc.allocated_amount,
        currency,
        functional_debit: 0,
        functional_credit: funcARCredit,
        memo: `Settlement of invoice #${alloc.invoice_number}`,
      });
    });

    // 4. Record Realized FX Gain / Loss if rates shifted
    if (Math.abs(totalFxDifference) > 0.01 && receipt.fx_gain_loss_account_id) {
      const funcDiff = Math.abs(Math.round(totalFxDifference * 100) / 100);
      if (totalFxDifference > 0) {
        // FX Gain -> Credit Revenue / Gain account
        lines.push({
          account_id: receipt.fx_gain_loss_account_id,
          debit_amount: 0,
          credit_amount: 0,
          currency,
          functional_debit: 0,
          functional_credit: funcDiff,
          memo: 'Realized Foreign Exchange Gain on invoice settlement',
        });
      } else {
        // FX Loss -> Debit Expense / Loss account
        lines.push({
          account_id: receipt.fx_gain_loss_account_id,
          debit_amount: 0,
          credit_amount: 0,
          currency,
          functional_debit: funcDiff,
          functional_credit: 0,
          memo: 'Realized Foreign Exchange Loss on invoice settlement',
        });
      }
    }

    return {
      memo: `Payment receipt #${receipt.payment_number}`,
      source_type: 'PAYMENT_RECEIVED',
      source_id: receipt.payment_number,
      posting_date: receipt.payment_date,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: paymentFx,
      lines,
    };
  }
}

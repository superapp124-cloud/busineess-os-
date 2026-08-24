/**
 * CHATR AP Subledger (Phase 2D)
 * Manages Accounts Payable, Vendor Bills, Duplicate Prevention, and Journal Proposals.
 */

import { JournalProposal } from './ARSubledger';

export interface BillDraft {
  fin_organization_id: string;
  legal_entity_id: string;
  vendor_id: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  currency: string;
  fx_rate?: number;
  lines: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
    expense_account_id: string;
    department_id?: string;
    project_id?: string;
  }>;
  ap_account_id: string; // e.g. 2110 Trade Payables
  gst_input_account_id?: string; // e.g. 1122 GST Input Tax Credit
  memo?: string;
}

export class APSubledger {
  /**
   * Generates a duplicate prevention hash for incoming vendor bills
   */
  public static computeDuplicateHash(vendorId: string, billNumber: string, total: number): string {
    const raw = `${vendorId.trim()}:${billNumber.trim().toUpperCase()}:${total.toFixed(2)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `bill_hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Generates a balanced double-entry journal proposal from a vendor bill
   *
   * Example:
   * Dr Expense Account (Net Line Total)
   * Dr GST Input Tax Credit (Asset)
   *   Cr Accounts Payable (Total Bill Amount)
   */
  public static proposeBillJournal(bill: BillDraft): JournalProposal {
    const fxRate = bill.fx_rate || 1.0;
    const currency = bill.currency;

    let subtotal = 0;
    let taxTotal = 0;

    const debitLines: Array<{
      account_id: string;
      debit_amount: number;
      credit_amount: number;
      currency: string;
      functional_debit: number;
      functional_credit: number;
      memo?: string;
    }> = [];

    // 1. Process Expense Lines
    bill.lines.forEach((line, index) => {
      const lineSubtotal = line.quantity * line.unit_price;
      const lineTax = (lineSubtotal * (line.tax_rate || 0)) / 100;
      subtotal += lineSubtotal;
      taxTotal += lineTax;

      const funcDebit = Math.round(lineSubtotal * fxRate * 100) / 100;

      debitLines.push({
        account_id: line.expense_account_id,
        debit_amount: lineSubtotal,
        credit_amount: 0,
        currency,
        functional_debit: funcDebit,
        functional_credit: 0,
        memo: line.description || `Bill expense line ${index + 1}`,
      });
    });

    // 2. Add GST Input Tax Line if taxTotal > 0
    if (taxTotal > 0 && bill.gst_input_account_id) {
      const funcTaxDebit = Math.round(taxTotal * fxRate * 100) / 100;
      debitLines.push({
        account_id: bill.gst_input_account_id,
        debit_amount: taxTotal,
        credit_amount: 0,
        currency,
        functional_debit: funcTaxDebit,
        functional_credit: 0,
        memo: 'GST / Tax Input Credit on Vendor Bill',
      });
    }

    const totalBill = subtotal + taxTotal;
    const funcTotalCredit = Math.round(totalBill * fxRate * 100) / 100;

    // 3. Credit Line: Accounts Payable Control Account
    const creditLine = {
      account_id: bill.ap_account_id,
      debit_amount: 0,
      credit_amount: totalBill,
      currency,
      functional_debit: 0,
      functional_credit: funcTotalCredit,
      memo: `Bill #${bill.bill_number} received from vendor`,
    };

    return {
      memo: bill.memo || `Bill #${bill.bill_number}`,
      source_type: 'BILL_RECEIVED',
      source_id: bill.bill_number,
      posting_date: bill.bill_date,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: fxRate,
      lines: [...debitLines, creditLine],
    };
  }
}

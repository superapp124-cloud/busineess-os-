/**
 * CHATR AR Subledger (Phase 2C)
 * Manages Accounts Receivable, Customer Invoices, Aging Calculation, and Journal Proposals.
 *
 * Rule: AR Subledger generates accounting proposals — it NEVER writes directly to the GL.
 */

export interface InvoiceDraft {
  fin_organization_id: string;
  legal_entity_id: string;
  customer_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  currency: string;
  fx_rate?: number;
  lines: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    tax_rate?: number;
    revenue_account_id: string;
    department_id?: string;
    project_id?: string;
  }>;
  ar_account_id: string; // e.g. 1120 Trade Receivables
  gst_output_account_id?: string; // e.g. 2141 GST Payable
  memo?: string;
}

export interface JournalProposal {
  memo: string;
  source_type: string;
  source_id: string;
  posting_date: string;
  transaction_currency: string;
  functional_currency: string;
  fx_rate: number;
  lines: Array<{
    account_id: string;
    debit_amount: number;
    credit_amount: number;
    currency: string;
    functional_debit: number;
    functional_credit: number;
    memo?: string;
  }>;
}

export class ARSubledger {
  /**
   * Computes dynamic aging bucket from invoice due date
   */
  public static getAgingBucket(dueDate: string, asOfDate: string = new Date().toISOString().substring(0, 10)): 'CURRENT' | '1_30' | '31_60' | '61_90' | '90_PLUS' {
    const due = new Date(dueDate).getTime();
    const asOf = new Date(asOfDate).getTime();
    const daysOverdue = Math.floor((asOf - due) / (1000 * 60 * 60 * 24));

    if (daysOverdue <= 0) return 'CURRENT';
    if (daysOverdue <= 30) return '1_30';
    if (daysOverdue <= 60) return '31_60';
    if (daysOverdue <= 90) return '61_90';
    return '90_PLUS';
  }

  /**
   * Generates a balanced double-entry journal proposal from an invoice
   *
   * Example:
   * Dr Accounts Receivable (Total Invoice Amount)
   *   Cr Revenue (Net Line Total)
   *   Cr Tax Payable (GST / VAT)
   */
  public static proposeInvoiceJournal(invoice: InvoiceDraft): JournalProposal {
    const fxRate = invoice.fx_rate || 1.0;
    const currency = invoice.currency;

    let subtotal = 0;
    let taxTotal = 0;

    const creditLines: Array<{
      account_id: string;
      debit_amount: number;
      credit_amount: number;
      currency: string;
      functional_debit: number;
      functional_credit: number;
      memo?: string;
    }> = [];

    // 1. Process Revenue Lines
    invoice.lines.forEach((line, index) => {
      const lineSubtotal = (line.quantity * line.unit_price) - (line.discount_amount || 0);
      const lineTax = (lineSubtotal * (line.tax_rate || 0)) / 100;
      subtotal += lineSubtotal;
      taxTotal += lineTax;

      const funcCredit = Math.round(lineSubtotal * fxRate * 100) / 100;

      creditLines.push({
        account_id: line.revenue_account_id,
        debit_amount: 0,
        credit_amount: lineSubtotal,
        currency,
        functional_debit: 0,
        functional_credit: funcCredit,
        memo: line.description || `Invoice line ${index + 1}`,
      });
    });

    // 2. Add Tax Line if taxTotal > 0
    if (taxTotal > 0 && invoice.gst_output_account_id) {
      const funcTaxCredit = Math.round(taxTotal * fxRate * 100) / 100;
      creditLines.push({
        account_id: invoice.gst_output_account_id,
        debit_amount: 0,
        credit_amount: taxTotal,
        currency,
        functional_debit: 0,
        functional_credit: funcTaxCredit,
        memo: 'GST / Tax Output on Invoice',
      });
    }

    const totalInvoice = subtotal + taxTotal;
    const funcTotalDebit = Math.round(totalInvoice * fxRate * 100) / 100;

    // 3. Debit Line: Accounts Receivable Control Account
    const debitLine = {
      account_id: invoice.ar_account_id,
      debit_amount: totalInvoice,
      credit_amount: 0,
      currency,
      functional_debit: funcTotalDebit,
      functional_credit: 0,
      memo: `Invoice #${invoice.invoice_number} issued to customer`,
    };

    return {
      memo: invoice.memo || `Invoice #${invoice.invoice_number}`,
      source_type: 'INVOICE_ISSUED',
      source_id: invoice.invoice_number,
      posting_date: invoice.issue_date,
      transaction_currency: currency,
      functional_currency: 'INR',
      fx_rate: fxRate,
      lines: [debitLine, ...creditLines],
    };
  }
}

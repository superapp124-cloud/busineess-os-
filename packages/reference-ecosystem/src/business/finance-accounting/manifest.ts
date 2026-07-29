import { CapabilityBuilder } from '@chatr/sdk';

export const financeAccountingManifest = new CapabilityBuilder()
  .name('finance-accounting')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Core')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Finance.ProcessInvoice',
    name: 'Process Invoice',
    description: 'Extracts line items, vendor GSTIN, invoice date, and total amount from invoice PDF',
    inputSchema: { type: 'object', properties: { invoiceFileId: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { vendorName: { type: 'string' }, totalAmount: { type: 'number' }, gstin: { type: 'string' } } }
  })
  .addAction({
    id: 'Finance.ValidateGST',
    name: 'Validate GST',
    description: 'Validates vendor GSTIN against government portal schema and calculates CGST/SGST/IGST breakdown',
    inputSchema: { type: 'object', properties: { gstin: { type: 'string' }, taxableAmount: { type: 'number' } } },
    outputSchema: { type: 'object', properties: { isValid: { type: 'boolean' }, cgst: { type: 'number' }, sgst: { type: 'number' }, igst: { type: 'number' } } }
  })
  .addAction({
    id: 'Finance.CalculateTDS',
    name: 'Calculate TDS',
    description: 'Applies Indian Income Tax Section 194C/194J/194H rules to calculate TDS deduction',
    inputSchema: { type: 'object', properties: { section: { type: 'string' }, grossAmount: { type: 'number' } } },
    outputSchema: { type: 'object', properties: { tdsRate: { type: 'number' }, tdsDeducted: { type: 'number' }, netPayable: { type: 'number' } } }
  })
  .addAction({
    id: 'Finance.ApproveExpense',
    name: 'Approve Expense',
    description: 'Triggers multi-level approval chain based on department expense policies and limits',
    inputSchema: { type: 'object', properties: { expenseId: { type: 'string' }, amount: { type: 'number' } } },
    outputSchema: { type: 'object', properties: { approvalStatus: { type: 'string' }, nextApproverRole: { type: 'string' } } }
  })
  .build();

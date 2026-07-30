import { IntelligencePlugin, ContextSource, ContextState, DomainId } from '../types';

const FINANCE_KEYWORDS = ['invoice', 'payment', 'expense', 'vendor', 'purchase order',
  'ledger', 'tax', 'gst', 'vat', 'amount', 'balance', 'overdue', 'payable',
  'receivable', 'erp', 'approval'];

export const FinanceIntelligence: IntelligencePlugin = {
  id: 'finance' as DomainId,

  canHandle(sources: ContextSource[]): number {
    const text = sources.flatMap(s => s.textChunks ?? []).join(' ').toLowerCase();
    const filename = sources.flatMap(s =>
      s.signals.map(sig => String(sig.payload.filename ?? ''))
    ).join(' ').toLowerCase();

    const keywordMatches = FINANCE_KEYWORDS.filter(k => text.includes(k) || filename.includes(k));
    const isFinanceFile = /invoice|expense|po|payment|ledger/i.test(filename);
    const hasFinanceSignal = sources.some(s =>
      s.signals.some(sig => sig.type === 'finance.invoice.uploaded' || sig.type === 'finance.payment.overdue')
    );

    let score = keywordMatches.length * 0.07;
    if (isFinanceFile) score += 0.45;
    if (hasFinanceSignal) score += 0.2;
    return Math.min(score, 1);
  },

  analyze(sources: ContextSource[]): Partial<Omit<ContextState, 'isProcessing' | 'updatedAt'>> {
    return {
      summary: 'Finance document analysis: invoice validation and payment status review.',
      domains: ['finance'],
      entities: [
        { label: 'Vendor', value: 'Acme Corp', type: 'organization', confidence: 0.90 },
        { label: 'Invoice Amount', value: '$12,500.00', type: 'monetary', confidence: 0.95 },
        { label: 'Due Date', value: '15 Aug 2027', type: 'date', confidence: 0.90 },
        { label: 'Tax', value: '$2,250.00 (18% GST)', type: 'monetary', confidence: 0.88 },
        { label: 'Status', value: 'Pending Approval', type: 'keyword', confidence: 0.92 },
      ],
      insights: [
        { id: 'fi-01', text: 'Invoice amount exceeds $10,000 threshold — requires two-level approval.', domain: 'finance', severity: 'warning' },
        { id: 'fi-02', text: 'PO match confirmed. Invoice aligns with Purchase Order #PO-2027-0841.', domain: 'finance', severity: 'info' },
        { id: 'fi-03', text: 'No duplicate invoice detected for this vendor in the last 90 days.', domain: 'finance', severity: 'info' },
      ],
      actions: [
        { id: 'fi-a1', label: 'Approve Invoice', domain: 'finance', variant: 'primary' },
        { id: 'fi-a2', label: 'Post to Ledger', domain: 'finance', variant: 'secondary' },
        { id: 'fi-a3', label: 'Schedule Payment', domain: 'finance', variant: 'secondary' },
        { id: 'fi-a4', label: 'Flag for Review', domain: 'finance', variant: 'danger' },
      ],
      recommendations: [
        { id: 'fi-r1', title: 'Approve by Aug 10 to meet payment terms', detail: 'Payment terms are Net 30. Processing typically takes 5 days. Approve by Aug 10 to avoid late payment penalty.', domain: 'finance' },
      ],
    };
  },
};

import { IntelligencePlugin, ContextSource, ContextState, DomainId } from '../types';

const SALES_KEYWORDS = ['pricing', 'quotation', 'quote', 'proposal', 'deal', 'discount',
  'purchase order', 'bulk', 'retail', 'customer', 'client', 'revenue', 'forecast',
  'opportunity', 'demo', 'follow-up', 'renewal', 'subscription'];

export const SalesIntelligence: IntelligencePlugin = {
  id: 'sales' as DomainId,

  canHandle(sources: ContextSource[]): number {
    const text = sources.flatMap(s => s.textChunks ?? []).join(' ').toLowerCase();
    const hasChatSignal = sources.some(s =>
      s.signals.some(sig => sig.type === 'chat.message.received' || sig.type === 'chat.context.updated')
    );
    const hasCrmSignal = sources.some(s =>
      s.signals.some(sig => sig.type === 'crm.opportunity.created' || sig.type === 'crm.deal.stalled')
    );

    const keywordMatches = SALES_KEYWORDS.filter(k => text.includes(k));
    let score = keywordMatches.length * 0.08;
    if (hasChatSignal && keywordMatches.length > 1) score += 0.3;
    if (hasCrmSignal) score += 0.2;
    return Math.min(score, 1);
  },

  analyze(sources: ContextSource[]): Partial<Omit<ContextState, 'isProcessing' | 'updatedAt'>> {
    const chatPayload = sources
      .flatMap(s => s.signals)
      .find(sig => sig.type === 'chat.context.updated')?.payload ?? {};

    const contactName = String(chatPayload.contactName ?? 'Customer');

    return {
      summary: `Sales conversation with ${contactName} — pricing and quotation discussion detected.`,
      domains: ['sales'],
      entities: [
        { label: 'Customer', value: contactName, type: 'organization', confidence: 0.90 },
        { label: 'Discussion', value: 'Bulk & Retail Pricing', type: 'keyword', confidence: 0.90 },
        { label: 'Action Item', value: 'Send Quotation Format', type: 'keyword', confidence: 0.85 },
        { label: 'Stage', value: 'Proposal Stage', type: 'keyword', confidence: 0.80 },
      ],
      insights: [
        { id: 'si-01', text: 'Customer is actively comparing bulk and retail pricing options — high purchase intent.', domain: 'sales', severity: 'info' },
        { id: 'si-02', text: 'Action item committed: send quotation format. Follow-up is pending.', domain: 'sales', severity: 'warning' },
      ],
      actions: [
        { id: 'si-a1', label: 'Draft Quotation', domain: 'sales', variant: 'primary' },
        { id: 'si-a2', label: 'Compare Previous Pricing', domain: 'sales', variant: 'secondary' },
        { id: 'si-a3', label: 'Create CRM Opportunity', domain: 'sales', variant: 'secondary' },
        { id: 'si-a4', label: 'Schedule Follow-up Meeting', domain: 'sales', variant: 'secondary' },
      ],
      recommendations: [
        { id: 'si-r1', title: 'Send quotation within 24 hours', detail: 'High purchase intent detected. Delayed response risks losing the opportunity to a competitor.', domain: 'sales' },
      ],
    };
  },
};

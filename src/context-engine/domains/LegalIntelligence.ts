import { IntelligencePlugin, ContextSource, ContextState, DomainId } from '../types';

const LEGAL_KEYWORDS = ['agreement', 'contract', 'clause', 'liability', 'obligations',
  'jurisdiction', 'nda', 'termination', 'indemnity', 'governing law', 'renewal',
  'warranty', 'arbitration', 'confidential', 'party', 'parties'];

export const LegalIntelligence: IntelligencePlugin = {
  id: 'legal' as DomainId,

  canHandle(sources: ContextSource[]): number {
    const text = sources.flatMap(s => s.textChunks ?? []).join(' ').toLowerCase();
    const filename = sources.flatMap(s =>
      s.signals.map(sig => String(sig.payload.filename ?? ''))
    ).join(' ').toLowerCase();

    const keywordMatches = LEGAL_KEYWORDS.filter(k => text.includes(k) || filename.includes(k));
    const isLegalFile = /agreement|contract|nda|msa|legal|terms/i.test(filename);

    let score = keywordMatches.length * 0.07;
    if (isLegalFile) score += 0.5;
    return score > 0 ? Math.min(score, 1) : 0;
  },

  analyze(sources: ContextSource[]): Partial<Omit<ContextState, 'isProcessing' | 'updatedAt'>> {
    const filename = sources.flatMap(s =>
      s.signals.map(sig => String(sig.payload.filename ?? ''))
    ).find(Boolean) ?? 'Contract';

    const docName = filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');

    return {
      summary: `Performing legal analysis on ${docName}.`,
      domains: ['legal'],
      entities: [
        { label: 'Contract Type', value: 'Master Service Agreement', type: 'keyword', confidence: 0.95 },
        { label: 'Contract Value', value: '$1,000,000', type: 'monetary', confidence: 0.90 },
        { label: 'Renewal Date', value: 'Oct 1, 2027', type: 'date', confidence: 0.95 },
        { label: 'Notice Period', value: '30 Days', type: 'keyword', confidence: 0.90 },
        { label: 'Jurisdiction', value: 'Delaware', type: 'location', confidence: 0.85 },
      ],
      insights: [
        { id: 'li-01', text: 'Liability cap increased to $1,000,000 USD (Section 14.2). Standard is $500k — potential overexposure.', domain: 'legal', severity: 'critical' },
        { id: 'li-02', text: 'Termination for convenience notice reduced to 30 days. Standard is 90 days.', domain: 'legal', severity: 'warning' },
        { id: 'li-03', text: 'Automatic renewal clause detected. Renewal date is Oct 1, 2027.', domain: 'legal', severity: 'info' },
      ],
      actions: [
        { id: 'li-a1', label: 'Create Renewal Reminder', domain: 'legal', variant: 'primary' },
        { id: 'li-a2', label: 'Export Risk Summary', domain: 'legal', variant: 'secondary' },
        { id: 'li-a3', label: 'Compare to Previous Version', domain: 'legal', variant: 'secondary' },
        { id: 'li-a4', label: 'Generate Legal Memo', domain: 'legal', variant: 'secondary' },
      ],
      recommendations: [
        { id: 'li-r1', title: 'Review liability cap before signing', detail: 'The $1M liability cap is double the market standard. Recommend legal counsel review before execution.', domain: 'legal' },
        { id: 'li-r2', title: 'Set renewal calendar event', detail: 'Renewal date Oct 1, 2027 with 30-day notice period means deadline is Sep 1, 2027.', domain: 'legal' },
      ],
    };
  },
};

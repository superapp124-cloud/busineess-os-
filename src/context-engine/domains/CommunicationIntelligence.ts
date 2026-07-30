import { IntelligencePlugin, ContextSource, ContextState, DomainId } from '../types';

const COMM_KEYWORDS = ['email', 'message', 'reply', 'discussion', 'thread', 'follow-up',
  'meeting', 'schedule', 'call', 'commitment', 'action item', 'sender', 'recipient',
  'attachment', 'eml', 'inbox', 'decision'];

export const CommunicationIntelligence: IntelligencePlugin = {
  id: 'communication' as DomainId,

  canHandle(sources: ContextSource[]): number {
    const text = sources.flatMap(s => s.textChunks ?? []).join(' ').toLowerCase();
    const filename = sources.flatMap(s =>
      s.signals.map(sig => String(sig.payload.filename ?? ''))
    ).join(' ').toLowerCase();
    const hasChatSignal = sources.some(s =>
      s.signals.some(sig => sig.type === 'chat.message.received' || sig.type === 'chat.context.updated')
    );
    const isEmailFile = /\.eml$|\.msg$|email|thread|discussion/i.test(filename);

    const keywordMatches = COMM_KEYWORDS.filter(k => text.includes(k) || filename.includes(k));
    let score = keywordMatches.length * 0.05;
    if (isEmailFile) score += 0.4;
    if (hasChatSignal) score += 0.25;
    return Math.min(score, 1);
  },

  analyze(sources: ContextSource[]): Partial<Omit<ContextState, 'isProcessing' | 'updatedAt'>> {
    const chatPayload = sources.flatMap(s => s.signals)
      .find(sig => sig.type === 'chat.context.updated')?.payload ?? {};

    const contactName = String(chatPayload.contactName ?? 'Contact');

    return {
      summary: `Communication review: active discussion with ${contactName}.`,
      domains: ['communication'],
      entities: [
        { label: 'Primary Contact', value: contactName, type: 'person', confidence: 0.90 },
        { label: 'Thread', value: 'Ongoing Discussion', type: 'keyword', confidence: 0.80 },
        { label: 'Pending Action', value: 'Follow-up Required', type: 'keyword', confidence: 0.85 },
      ],
      insights: [
        { id: 'ci-01', text: 'Active discussion detected with uncommitted action items.', domain: 'communication', severity: 'warning' },
        { id: 'ci-02', text: 'No formal decisions logged in this thread yet.', domain: 'communication', severity: 'info' },
      ],
      actions: [
        { id: 'ci-a1', label: 'Draft Reply', domain: 'communication', variant: 'primary' },
        { id: 'ci-a2', label: 'Create Action Item', domain: 'communication', variant: 'secondary' },
        { id: 'ci-a3', label: 'Schedule Meeting', domain: 'communication', variant: 'secondary' },
        { id: 'ci-a4', label: 'Summarize Thread', domain: 'communication', variant: 'secondary' },
      ],
      recommendations: [
        { id: 'ci-r1', title: 'Follow up within 24 hours', detail: 'Response rate drops significantly after 24 hours. Set a reminder if you cannot reply now.', domain: 'communication' },
      ],
    };
  },
};

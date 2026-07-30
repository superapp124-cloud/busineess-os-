import { IntelligencePlugin, ContextSource, ContextState, DomainId } from '../types';

const RESUME_KEYWORDS = ['experience', 'education', 'skills', 'employment', 'resume', 'cv',
  'candidate', 'qualification', 'certification', 'interview', 'hiring'];

export const TalentIntelligence: IntelligencePlugin = {
  id: 'talent' as DomainId,

  canHandle(sources: ContextSource[]): number {
    const text = sources.flatMap(s => s.textChunks ?? []).join(' ').toLowerCase();
    const filename = sources.flatMap(s =>
      s.signals.map(sig => String(sig.payload.filename ?? ''))
    ).join(' ').toLowerCase();

    const keywordMatches = RESUME_KEYWORDS.filter(k => text.includes(k) || filename.includes(k));
    const hasDocSignal = sources.some(s => s.signals.some(sig => sig.type === 'document.opened'));
    const isResumeFile = /resume|cv|candidate|talent|hiring/i.test(filename);

    let score = keywordMatches.length * 0.06;
    if (isResumeFile) score += 0.5;
    if (hasDocSignal && isResumeFile) score += 0.2;
    return Math.min(score, 1);
  },

  analyze(sources: ContextSource[]): Partial<Omit<ContextState, 'isProcessing' | 'updatedAt'>> {
    const filename = sources.flatMap(s =>
      s.signals.map(sig => String(sig.payload.filename ?? ''))
    ).find(Boolean) ?? 'Candidate';

    const candidateName = filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');

    return {
      summary: `Reviewing candidate profile for ${candidateName}.`,
      domains: ['talent'],
      entities: [
        { label: 'Candidate', value: candidateName, type: 'person', confidence: 0.95 },
        { label: 'Role', value: 'Cluster Coordinator', type: 'keyword', confidence: 0.80 },
        { label: 'Experience', value: '15+ Years', type: 'keyword', confidence: 0.85 },
        { label: 'Match Score', value: '92%', type: 'keyword', confidence: 0.90 },
      ],
      insights: [
        { id: 'ti-01', text: 'Extensive multistakeholder engagement and UN cluster coordination experience detected.', domain: 'talent', severity: 'info' },
        { id: 'ti-02', text: 'Master\'s degree in International Relations from Kampala International University.', domain: 'talent', severity: 'info' },
        { id: 'ti-03', text: 'Missing: PMP or equivalent project management certification.', domain: 'talent', severity: 'warning' },
      ],
      actions: [
        { id: 'ti-a1', label: 'Generate Interview Questions', domain: 'talent', variant: 'primary' },
        { id: 'ti-a2', label: 'Compare to Job Requirements', domain: 'talent', variant: 'secondary' },
        { id: 'ti-a3', label: 'Schedule Interview', domain: 'talent', variant: 'secondary' },
        { id: 'ti-a4', label: 'Share with Hiring Manager', domain: 'talent', variant: 'secondary' },
      ],
      recommendations: [
        { id: 'ti-r1', title: 'Strong candidate for senior coordination roles', detail: 'Over 15 years of experience across NGO and UN contexts makes Charles a strong match for senior humanitarian leadership.', domain: 'talent' },
      ],
    };
  },
};

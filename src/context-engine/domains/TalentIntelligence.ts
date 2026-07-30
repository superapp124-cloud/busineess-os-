import { IntelligencePlugin, ContextSource, ContextState, DomainId } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Talent Intelligence — detects resumes, CVs, and candidate screening docs.
// Broad signal matching: filename patterns, job titles, HR terminology,
// candidate screening keywords, and document structure signals.
// ─────────────────────────────────────────────────────────────────────────────

const RESUME_FILENAME_SIGNALS = [
  'resume', 'cv', 'curriculum', 'candidate', 'screening', 'talent',
  'hire', 'hiring', 'applicant', 'application', 'draft', 'profile',
  'fullstack', 'full-stack', 'full_stack', 'engineer', 'developer',
  'manager', 'analyst', 'coordinator', 'specialist', 'consultant',
  'director', 'executive', 'officer', 'associate', 'intern',
];

const RESUME_CONTENT_SIGNALS = [
  // Core resume sections
  'professional summary', 'career objective', 'work experience',
  'core skills', 'key skills', 'skills & competencies', 'skills and competencies',
  'professional experience', 'employment history', 'education',
  // HR / screening keywords
  'notice period', 'current organization', 'candidate screening',
  'experience in total', 'reason for change', 'current company',
  'number of organizations', 'salary expectation', 'ctc',
  // Job titles / seniority
  'senior', 'junior', 'lead', 'principal', 'staff engineer',
  'assistant manager', 'project manager', 'product manager',
  // Common resume verbs
  'managed', 'led', 'developed', 'implemented', 'coordinated',
  'achieved', 'delivered', 'spearheaded', 'optimized',
];

function scoreSource(sources: ContextSource[]): number {
  const filenames = sources
    .flatMap(s => s.signals.map(sig => String(sig.payload.filename ?? '').toLowerCase()))
    .join(' ');

  const content = sources
    .flatMap(s => s.textChunks ?? [])
    .join(' ')
    .toLowerCase();

  let score = 0;

  // Filename signals (high weight — intentional naming)
  for (const kw of RESUME_FILENAME_SIGNALS) {
    if (filenames.includes(kw)) score += 0.12;
  }

  // Content/text chunk signals (medium weight)
  for (const kw of RESUME_CONTENT_SIGNALS) {
    if (content.includes(kw)) score += 0.08;
  }

  // Structural: person name pattern in filename (e.g. "Deepu Verma", "RAJESH RADHAKRISHNA")
  // Two or more capitalized words separated by space/underscore/dash suggests a person's name
  const namePattern = /([A-Z][a-z]+[\s_-][A-Z][a-z]+)|([A-Z]{2,}[\s_][A-Z]{2,})/;
  if (namePattern.test(filenames.replace(/_/g, ' '))) score += 0.15;

  // Boost if document.opened signal is present (workspace context)
  const hasDocSignal = sources.some(s => s.signals.some(sig => sig.type === 'document.opened'));
  if (hasDocSignal && score > 0.1) score += 0.1;

  return Math.min(score, 1);
}

export const TalentIntelligence: IntelligencePlugin = {
  id: 'talent' as DomainId,

  canHandle(sources: ContextSource[]): number {
    return scoreSource(sources);
  },

  analyze(sources: ContextSource[]): Partial<Omit<ContextState, 'isProcessing' | 'updatedAt'>> {
    const filename = sources
      .flatMap(s => s.signals.map(sig => String(sig.payload.filename ?? '')))
      .find(Boolean) ?? 'Candidate';

    const candidateName = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b(Draft|Resume|CV|Screening|Final|v\d+)\b/gi, '')
      .trim();

    return {
      summary: `Reviewing candidate profile: ${candidateName}.`,
      domains: ['talent'],
      entities: [
        { label: 'Candidate', value: candidateName, type: 'person', confidence: 0.90 },
        { label: 'Document Type', value: 'Resume / Candidate Profile', type: 'keyword', confidence: 0.95 },
      ],
      insights: [
        { id: 'ti-01', text: 'Resume structure detected. Candidate profile ready for review.', domain: 'talent', severity: 'info' },
        { id: 'ti-02', text: 'Ask the AI to summarize experience, identify skill gaps, or generate interview questions.', domain: 'talent', severity: 'info' },
      ],
      actions: [
        { id: 'ti-a1', label: 'Generate Interview Questions', domain: 'talent', variant: 'primary' },
        { id: 'ti-a2', label: 'Compare to Job Requirements', domain: 'talent', variant: 'secondary' },
        { id: 'ti-a3', label: 'Schedule Interview', domain: 'talent', variant: 'secondary' },
        { id: 'ti-a4', label: 'Share with Hiring Manager', domain: 'talent', variant: 'secondary' },
      ],
      recommendations: [
        { id: 'ti-r1', title: 'Use the Insights tab to query this candidate', detail: 'Ask about experience, education, skills, or salary expectations to get instant AI-sourced answers.', domain: 'talent' },
      ],
    };
  },
};

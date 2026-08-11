export interface ExternalCitationRecord {
  citationId: string;
  externalDomain: string;
  articleTitle: string;
  articleUrl: string;
  publicationDate: string;
  publicationTier: 'HR_RECRUITMENT' | 'SAAS_BUSINESS' | 'AI_TECH' | 'PRACTITIONER_COMMUNITY' | 'ACADEMIC_RESEARCH';
  findingCitedId: string;
  researchId: string;
  exactClaimUsed: string;
  linkType: 'DOFOLLOW' | 'NOFOLLOW' | 'UNLINKED_MENTION';
  referralSessionsCount: number;
}

export const INITIAL_AUTHORITY_TARGETS = [
  { tier: 'HR_RECRUITMENT', targetCount: 3, description: 'India HR & Staffing Industry Outlets (142,500 Thread Benchmark)' },
  { tier: 'SAAS_BUSINESS', targetCount: 2, description: 'Business Tech & SME Outlets (65,000 Inquiries Lead Audit)' },
  { tier: 'AI_TECH', targetCount: 2, description: 'AI & Recruitment Automation Outlets (50,000 Resumes Benchmark)' },
  { tier: 'PRACTITIONER_COMMUNITY', targetCount: 2, description: 'Recruiter Communities & Substack Newsletters' },
  { tier: 'ACADEMIC_RESEARCH', targetCount: 1, description: 'Academic HR Analytics & Workforce Research Papers' }
];

export const EXTERNAL_CITATIONS_REGISTRY: ExternalCitationRecord[] = [];

export const calculateAuthorityAcquisitionRate = (): {
  totalTarget: number;
  acquiredCount: number;
  acquisitionRatePercent: number;
  referralTrafficTotal: number;
} => {
  const totalTarget = 10;
  const acquiredCount = EXTERNAL_CITATIONS_REGISTRY.length;
  const acquisitionRatePercent = Math.round((acquiredCount / totalTarget) * 100);
  const referralTrafficTotal = EXTERNAL_CITATIONS_REGISTRY.reduce((acc, c) => acc + c.referralSessionsCount, 0);

  return {
    totalTarget,
    acquiredCount,
    acquisitionRatePercent,
    referralTrafficTotal
  };
};

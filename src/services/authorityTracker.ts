export type OutreachStatus = 
  | 'PROSPECT' 
  | 'CONTACTED' 
  | 'REPLIED' 
  | 'INTERESTED' 
  | 'CONTENT_SENT' 
  | 'PUBLISHED' 
  | 'CITATION_VERIFIED' 
  | 'LINK_VERIFIED' 
  | 'REFERRAL_VERIFIED';

export type PublicationTier = 
  | 'HR_RECRUITMENT' 
  | 'SAAS_BUSINESS' 
  | 'AI_TECH' 
  | 'PRACTITIONER_COMMUNITY' 
  | 'INSTITUTIONAL' 
  | 'ACADEMIC_RESEARCH';

export interface ExternalCitationRecord {
  citationId: string;
  externalDomain: string;
  articleTitle: string;
  articleUrl: string;
  contactedDate: string;
  publishedDate?: string;
  publicationTier: PublicationTier;
  findingCitedId: string;
  researchId: string;
  exactClaimUsed: string;
  status: OutreachStatus;
  linkType: 'DOFOLLOW' | 'NOFOLLOW' | 'UNLINKED_MENTION';
  citationQualityScore: number; // 0-100 based on Domain Authority, Relevance, Claim Match
  referralSessionsCount: number;
}

export const TARGET_DISTRIBUTION_MATRIX = [
  { tier: 'HR_RECRUITMENT', targetCount: 3, description: 'HR & Staffing Publications (142,500 Thread Benchmark)' },
  { tier: 'SAAS_BUSINESS', targetCount: 2, description: 'SME Business & Tech Outlets (65,000 Inquiries Lead Audit)' },
  { tier: 'AI_TECH', targetCount: 2, description: 'AI & Recruitment Automation Outlets (50,000 Resumes Benchmark)' },
  { tier: 'PRACTITIONER_COMMUNITY', targetCount: 2, description: 'Recruiter Communities & Substack Newsletters' },
  { tier: 'INSTITUTIONAL', targetCount: 1, description: 'University, Workforce Body or HR Association' },
  { tier: 'ACADEMIC_RESEARCH', targetCount: 1, description: 'Academic HR Analytics & Workforce Research Papers' }
];

export const EXTERNAL_CITATIONS_REGISTRY: ExternalCitationRecord[] = [];

export const calculateAuthorityMetrics = (totalQualifiedOutreach: number = 0): {
  targetGoalCount: number;
  verifiedCitationCount: number;
  goalCompletionPercent: number;
  acquisitionConversionRatePercent: number;
  averageCitationQualityScore: number;
  referralTrafficTotal: number;
} => {
  const targetGoalCount = 10;
  const verifiedCitations = EXTERNAL_CITATIONS_REGISTRY.filter(c => 
    c.status === 'CITATION_VERIFIED' || c.status === 'LINK_VERIFIED' || c.status === 'REFERRAL_VERIFIED'
  );
  const verifiedCitationCount = verifiedCitations.length;
  const goalCompletionPercent = Math.round((verifiedCitationCount / targetGoalCount) * 100);

  const acquisitionConversionRatePercent = totalQualifiedOutreach > 0
    ? Math.round((verifiedCitationCount / totalQualifiedOutreach) * 100)
    : 0;

  const averageCitationQualityScore = verifiedCitationCount > 0
    ? Math.round(verifiedCitations.reduce((acc, c) => acc + c.citationQualityScore, 0) / verifiedCitationCount)
    : 0;

  const referralTrafficTotal = EXTERNAL_CITATIONS_REGISTRY.reduce((acc, c) => acc + c.referralSessionsCount, 0);

  return {
    targetGoalCount,
    verifiedCitationCount,
    goalCompletionPercent,
    acquisitionConversionRatePercent,
    averageCitationQualityScore,
    referralTrafficTotal
  };
};

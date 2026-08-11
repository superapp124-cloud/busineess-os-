import { supabase } from '@/integrations/supabase/client';

export interface SEODecisionRecord {
  id?: string;
  candidateQuery: string;
  candidateUrl: string;
  decision: 'PUBLISH' | 'EXPAND' | 'MERGE' | 'NOINDEX_BLOCK';
  creationScore: number;
  cannibalizationRiskScore: number;
  existingUrl?: string;
  reason: string;
  engineVersion: string;
  createdAt: string;
}

const memoryDecisions: SEODecisionRecord[] = [];

export async function recordSEODecision(decision: SEODecisionRecord): Promise<SEODecisionRecord> {
  const record = { ...decision, id: dec-- };
  memoryDecisions.push(record);

  try {
    await supabase.from('cc_logs').insert({
      domain: 'chatrchat.in',
      path: '/seo-governance/decision',
      user_agent: JSON.stringify({
        action: 'SEO_DECISION',
        query: decision.candidateQuery,
        url: decision.candidateUrl,
        decision: decision.decision,
        creationScore: decision.creationScore,
        cannibalizationRisk: decision.cannibalizationRiskScore,
        targetUrl: decision.existingUrl,
        version: decision.engineVersion
      })
    });
  } catch (err) {
    console.warn('[SEO Governance] Supabase logging fallback:', err);
  }

  return record;
}

export function getHistoricalDecision(query: string): SEODecisionRecord | undefined {
  const norm = query.toLowerCase().trim();
  return memoryDecisions.find(d => d.candidateQuery.toLowerCase().trim() === norm);
}

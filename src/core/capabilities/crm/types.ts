import { BaseArtifact } from '../hr/types';

export interface LeadArtifact extends BaseArtifact {
  type: 'LeadArtifact';
  companyName: string;
  contactName: string;
  contactEmail: string;
  source: string; // e.g. 'LinkedIn', 'Referral', 'Inbound'
  qualificationStatus: 'UNQUALIFIED' | 'QUALIFIED' | 'DISQUALIFIED';
  score: number; // 0-100
  notes: string;
}

export interface AccountArtifact extends BaseArtifact {
  type: 'AccountArtifact';
  companyName: string;
  industry: string;
  annualRevenue: number;
  employeeCount: number;
  primaryContact: string;
  website: string;
  address: string;
}

export interface OpportunityArtifact extends BaseArtifact {
  type: 'OpportunityArtifact';
  accountId: string;
  title: string;
  stage: 'DISCOVERY' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  value: number;
  currency: string;
  closeDate: string;
  probability: number; // 0-100
  // BANT Fields
  budget: string;
  authority: string;
  need: string;
  timeline: string;
  nextAction: string;
}

export interface ProposalArtifact extends BaseArtifact {
  type: 'ProposalArtifact';
  opportunityId: string;
  title: string;
  executiveSummary: string;
  scope: string[];
  pricing: Array<{ item: string; quantity: number; unitPrice: number }>;
  totalValue: number;
  discountPercentage: number;
  validUntil: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';
}

export interface AgentTaskRecord {
  id: string;
  business_id: string;
  lead_id?: string;
  task_type: 'ENRICH_LEAD' | 'SUMMARIZE_ACTIVITY' | 'CALCULATE_DEAL_HEALTH' | 'DRAFT_FOLLOWUP';
  payload?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts?: number;
  error_log?: string;
  result?: any;
  created_at?: string;
  updated_at?: string;
}

export interface LeadDossier {
  id?: string;
  business_id: string;
  lead_id: string;
  executive_summary: string;
  industry: string;
  company_size: string;
  estimated_revenue: string;
  tech_stack: string[];
  funding_info?: {
    stage?: string;
    amount?: string;
    investors?: string[];
  };
  key_decision_makers?: Array<{
    name: string;
    title: string;
    linkedin?: string;
    email?: string;
  }>;
  pain_points?: string[];
  competitors?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface EvidenceItem {
  id?: string;
  business_id: string;
  lead_id: string;
  field_name: string;
  source_url: string;
  quoted_snippet: string;
  confidence_score: number;
  retrieved_at?: string;
}

export interface DealHealthAnalysis {
  score: number; // 0-100
  status: 'HEALTHY' | 'NEEDS_ATTENTION' | 'AT_RISK';
  insights: string[];
  recommended_action: {
    title: string;
    description: string;
    action_type: 'email' | 'call' | 'proposal' | 'meeting';
  };
}


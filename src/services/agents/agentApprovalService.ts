/**
 * CHATR HUMAN-IN-THE-LOOP (HITL) CEO APPROVAL VAULT
 * 
 * Enforces Supreme Human CEO Approval over high-risk autonomous agent operations:
 * 1. Bulk campaigns exceeding 500 messages/hour
 * 2. Direct payment initiations or GL accounting policy modifications
 * 3. SEO indexation tier upgrades (19.4K -> 50K -> 250K -> 1M -> 10M)
 * 4. Account suspensions or dangerous data mutations
 */

import { supabase } from '../../integrations/supabase/client';

export type ApprovalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CeoApprovalItem {
  id: string;
  agentId: string;
  agentName: string;
  squad: string;
  actionType: string;
  riskLevel: ApprovalRiskLevel;
  title: string;
  description: string;
  estimatedImpact: string;
  status: ApprovalStatus;
  createdAt: string;
  reviewedByPhone?: string;
  reviewedAt?: string;
}

// Initial staged approval requests for CEO oversight
const INITIAL_APPROVAL_REQUESTS: CeoApprovalItem[] = [
  {
    id: 'appr_001',
    agentId: 'ag_s2_wa_01',
    agentName: 'WhatsAppOutreach-01',
    squad: 'SQUAD_2_OUTBOUND',
    actionType: 'BULK_WHATSAPP_CAMPAIGN',
    riskLevel: 'HIGH',
    title: 'Authorize 750-Message Outreach Campaign (Dubai Agencies)',
    description: 'Squad 2 has prepared personalized ATS Resume Grader invitations for 750 verified recruitment founders in Dubai.',
    estimatedImpact: 'Projected 120 instant tool scans & 25 workspace registrations',
    status: 'PENDING',
    createdAt: '10m ago'
  },
  {
    id: 'appr_002',
    agentId: 'ag_s7_gsc_01',
    agentName: 'SearchConsoleWatcher-01',
    squad: 'SQUAD_7_SEO_INTEL',
    actionType: 'SEO_TIER_EXPANSION_UNLOCK',
    riskLevel: 'CRITICAL',
    title: 'Unlock Programmatic SEO Tier: 19.4K -> 50K Expansion',
    description: 'Googlebot has indexed 637 pages with zero crawl errors. Squad 7 recommends expanding to 50,000 URLs.',
    estimatedImpact: '+30,556 new programmatic URLs across tier-2 cities',
    status: 'PENDING',
    createdAt: '25m ago'
  },
  {
    id: 'appr_003',
    agentId: 'ag_s6_recon_01',
    agentName: 'ReconciliationBot-01',
    squad: 'SQUAD_6_FINANCE_LEDGER',
    actionType: 'POST_ACCOUNTING_PERIOD_CLOSE',
    riskLevel: 'MEDIUM',
    title: 'Post Month-End Period Lock for July 2026',
    description: 'All 142 workspace subscription payouts have been reconciled against the general ledger with zero discrepancy.',
    estimatedImpact: 'Locks 1,280 journal entries against retroactive modification',
    status: 'PENDING',
    createdAt: '1h ago'
  }
];

let cachedApprovals: CeoApprovalItem[] = [...INITIAL_APPROVAL_REQUESTS];

export function getPendingCeoApprovals(): CeoApprovalItem[] {
  return cachedApprovals.filter(a => a.status === 'PENDING');
}

export function getAllCeoApprovals(): CeoApprovalItem[] {
  return cachedApprovals;
}

export async function authorizeCeoApproval(
  approvalId: string, 
  adminPhone: string = '9910678611'
): Promise<boolean> {
  cachedApprovals = cachedApprovals.map(a => {
    if (a.id === approvalId) {
      return {
        ...a,
        status: 'APPROVED',
        reviewedByPhone: adminPhone,
        reviewedAt: new Date().toISOString()
      };
    }
    return a;
  });

  try {
    await supabase.from('agent_ceo_approvals').update({
      status: 'APPROVED',
      reviewed_by_phone: adminPhone,
      reviewed_at: new Date().toISOString()
    }).eq('id', approvalId);
  } catch (err) {
    // Non-blocking
  }

  return true;
}

export async function rejectCeoApproval(
  approvalId: string, 
  adminPhone: string = '9910678611'
): Promise<boolean> {
  cachedApprovals = cachedApprovals.map(a => {
    if (a.id === approvalId) {
      return {
        ...a,
        status: 'REJECTED',
        reviewedByPhone: adminPhone,
        reviewedAt: new Date().toISOString()
      };
    }
    return a;
  });

  try {
    await supabase.from('agent_ceo_approvals').update({
      status: 'REJECTED',
      reviewed_by_phone: adminPhone,
      reviewed_at: new Date().toISOString()
    }).eq('id', approvalId);
  } catch (err) {
    // Non-blocking
  }

  return true;
}

import { supabase } from '@/integrations/supabase/client';
import { DealHealthAnalysis } from './types';

export class DealHealthAnalyzer {
  /**
   * Calculate deal health score and AI Next Best Action (NBA) for a given lead
   */
  static async analyzeDealHealth(leadId: string): Promise<DealHealthAnalysis> {
    try {
      // 1. Fetch Lead Record
      const { data: lead, error: leadError } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        return this.getDefaultAnalysis();
      }

      // 2. Fetch Recent Activities for Lead
      const { data: activities } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(5);

      const activityList = activities || [];
      const hasRecentActivity = activityList.length > 0;

      // 3. Compute Days Since Last Contact
      let daysSinceContact = 14; // Default baseline if no date
      if (lead.last_contacted_at) {
        const lastContact = new Date(lead.last_contacted_at);
        const now = new Date();
        daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 3600 * 24));
      } else if (hasRecentActivity && activityList[0].created_at) {
        const lastAct = new Date(activityList[0].created_at);
        const now = new Date();
        daysSinceContact = Math.floor((now.getTime() - lastAct.getTime()) / (1000 * 3600 * 24));
      }

      // 4. Compute Sentiment & Engagement Score
      let score = 70;
      const insights: string[] = [];

      // Status weighting
      if (lead.status === 'won') {
        score = 100;
        insights.push('Deal closed successfully.');
      } else if (lead.status === 'proposal' || lead.status === 'negotiation') {
        score += 15;
        insights.push(`Lead is in advanced stage: ${lead.status.toUpperCase()}.`);
      } else if (lead.status === 'new') {
        score -= 5;
        insights.push('New lead requiring initial outreach.');
      }

      // Recency penalty
      if (daysSinceContact <= 2) {
        score += 10;
        insights.push('Recent interaction logged within the last 48 hours.');
      } else if (daysSinceContact > 7 && daysSinceContact <= 14) {
        score -= 15;
        insights.push(`No activity recorded for ${daysSinceContact} days.`);
      } else if (daysSinceContact > 14) {
        score -= 30;
        insights.push(`Lead is going cold (${daysSinceContact} days without contact).`);
      }

      // Priority bonus
      if (lead.priority === 'urgent' || lead.priority === 'high') {
        insights.push(`High priority lead (Deal value: ₹${Number(lead.deal_value || 0).toLocaleString()}).`);
      }

      // Clamp score between 0 and 100
      score = Math.max(10, Math.min(100, score));

      // 5. Determine Health Status
      let status: DealHealthAnalysis['status'] = 'HEALTHY';
      if (score < 45) {
        status = 'AT_RISK';
      } else if (score < 70) {
        status = 'NEEDS_ATTENTION';
      }

      // 6. Formulate Next Best Action (NBA)
      let recommendedAction: DealHealthAnalysis['recommended_action'] = {
        title: 'Send Personalized Follow-Up Email',
        description: 'Re-engage prospect with tailored product overview and value proposition.',
        action_type: 'email'
      };

      if (lead.status === 'proposal') {
        recommendedAction = {
          title: 'Schedule Proposal Review Call',
          description: 'Set up a 15-minute call to walk through contract terms and handle objections.',
          action_type: 'meeting'
        };
      } else if (lead.status === 'negotiation') {
        recommendedAction = {
          title: 'Deliver Executive Discount Sheet',
          description: 'Share finalized pricing breakdown to secure closing signature.',
          action_type: 'proposal'
        };
      } else if (daysSinceContact > 7) {
        recommendedAction = {
          title: 'Place Check-in Discovery Call',
          description: 'Direct phone call to confirm ongoing requirement and budget status.',
          action_type: 'call'
        };
      }

      return {
        score,
        status,
        insights,
        recommended_action: recommendedAction
      };
    } catch (err) {
      console.error('[DealHealthAnalyzer] Error analyzing deal health:', err);
      return this.getDefaultAnalysis();
    }
  }

  private static getDefaultAnalysis(): DealHealthAnalysis {
    return {
      score: 65,
      status: 'NEEDS_ATTENTION',
      insights: ['Baseline lead record initialized.'],
      recommended_action: {
        title: 'Initial Contact Outreach',
        description: 'Reach out to introduce Chatr services and schedule discovery meeting.',
        action_type: 'email'
      }
    };
  }
}

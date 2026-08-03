import { InferencePlugin } from '../InferencePlugin';
import { InferenceContext, InferenceHypothesis, MissionRecommendation, ComplianceHypothesis } from '../../../types';

export class MissionRecommendationPlugin implements InferencePlugin {
  public id = 'plugin_mission_recommendation';
  public name = 'Mission Recommendation Plugin';
  public description = 'Synthesizes all other hypotheses to recommend the next best action/mission.';

  public async execute(context: InferenceContext): Promise<InferenceHypothesis[]> {
    const hypotheses: InferenceHypothesis[] = [];
    const eventPayload = context.triggeringEvent.payload as any;

    if (eventPayload.type === 'Invoice') {
      const amount = eventPayload.amount || 0;
      const vendorName = eventPayload.vendorName;
      
      hypotheses.push({
        id: `rec_hyp_${Date.now()}_inv`,
        type: 'MissionRecommendation',
        pluginId: this.id,
        rawConfidence: 85,
        confidence: 0,
        evidence: [`Incoming Invoice: $${amount} from ${vendorName}`],
        reasoningPath: 'Standard vendor invoice processing flow initiated.',
        alternativeMatches: [],
        policiesApplied: [],
        graphTraversal: [],
        missionName: 'Process Vendor Invoice',
        suggestedPlan: [
          {
            id: 'step_erp_staging',
            action: 'Post to ERP Staging',
            capabilityId: 'cap_erp_staging',
            status: 'Pending',
            retries: 0,
            maxRetries: 2,
            compensationAction: 'none'
          }
        ]
      });
    }

    if (eventPayload.type === 'Contract') {
      const liability = eventPayload.liabilityLimit || 0;
      const party = eventPayload.party;
      
      hypotheses.push({
        id: `rec_hyp_${Date.now()}_con`,
        type: 'MissionRecommendation',
        pluginId: this.id,
        rawConfidence: 90,
        confidence: 0,
        evidence: [`Incoming Contract with Liability Limit: $${liability} from ${party}`],
        reasoningPath: 'Standard legal contract review and e-signature dispatch flow initiated.',
        alternativeMatches: [],
        policiesApplied: [],
        graphTraversal: [],
        missionName: 'Legal Contract Review',
        suggestedPlan: [
          {
            id: 'step_docu_sign',
            action: 'Dispatch for E-Signature',
            capabilityId: 'cap_docu_sign',
            status: 'Pending',
            retries: 0,
            maxRetries: 2,
            compensationAction: 'none'
          }
        ]
      });
    }

    if (eventPayload.type === 'Resume') {
      const candidate = eventPayload.candidateName;
      
      hypotheses.push({
        id: `rec_hyp_${Date.now()}_hr`,
        type: 'MissionRecommendation',
        pluginId: this.id,
        rawConfidence: 92,
        confidence: 0,
        evidence: [`Incoming Resume for Candidate: ${candidate}`],
        reasoningPath: 'Standard candidate review and background check flow initiated.',
        alternativeMatches: [],
        policiesApplied: [],
        graphTraversal: [],
        missionName: 'HR Candidate Review',
        suggestedPlan: [
          {
            id: 'step_bg_check',
            action: 'Dispatch for Background Check',
            capabilityId: 'cap_bg_check',
            status: 'Pending',
            retries: 0,
            maxRetries: 2,
            compensationAction: 'none'
          }
        ]
      });
    }

    if (eventPayload.type === 'PurchaseOrder') {
      const item = eventPayload.item;
      const amount = eventPayload.amount;
      
      hypotheses.push({
        id: `rec_hyp_${Date.now()}_pro`,
        type: 'MissionRecommendation',
        pluginId: this.id,
        rawConfidence: 88,
        confidence: 0,
        evidence: [`Incoming PO for ${item} at $${amount}`],
        reasoningPath: 'Standard PO fulfillment dispatch flow initiated.',
        alternativeMatches: [],
        policiesApplied: [],
        graphTraversal: [],
        missionName: 'Fulfill Purchase Order',
        suggestedPlan: [
          {
            id: 'step_po_dispatch',
            action: 'Dispatch PO to Supplier',
            capabilityId: 'cap_po_dispatch',
            status: 'Pending',
            retries: 0,
            maxRetries: 2,
            compensationAction: 'none'
          }
        ]
      });
    }

    // Massive Domain Routing Map
    const massiveRouting: Record<string, { missionName: string; capabilityId: string; action: string }> = {
      'SystemAlert': { missionName: 'Sev1 Incident Triage', capabilityId: 'cap_pager_duty', action: 'Dispatch PagerDuty' },
      'CustomerTicket': { missionName: 'VIP Ticket Escalation', capabilityId: 'cap_ticket_escalation', action: 'Escalate Ticket' },
      'BadgeSwipe': { missionName: 'Physical Security Lockdown', capabilityId: 'cap_door_lockdown', action: 'Lockdown Doors' },
      'DataExportRequest': { missionName: 'Privacy Impact Audit', capabilityId: 'cap_privacy_audit', action: 'Run Privacy Audit' },
      'Quote': { missionName: 'Deal Desk Review', capabilityId: 'cap_deal_desk', action: 'Send to Deal Desk' },
      'SocialPost': { missionName: 'Brand Safety Review', capabilityId: 'cap_brand_approval', action: 'Request Brand Approval' },
      'PullRequest': { missionName: 'Security Code Scan', capabilityId: 'cap_security_scan', action: 'Run Security Scan' },
      'ShipmentManifest': { missionName: 'Hazmat Compliance Check', capabilityId: 'cap_hazmat_compliance', action: 'Verify Hazmat' }
    };

    if (massiveRouting[eventPayload.type]) {
      const route = massiveRouting[eventPayload.type];
      hypotheses.push({
        id: `rec_hyp_${Date.now()}_mass_${eventPayload.type}`,
        type: 'MissionRecommendation',
        pluginId: this.id,
        rawConfidence: 99,
        confidence: 0,
        evidence: [`Incoming ${eventPayload.type}`],
        reasoningPath: `Automated massive routing for ${eventPayload.type}.`,
        alternativeMatches: [],
        policiesApplied: [],
        graphTraversal: [],
        missionName: route.missionName,
        suggestedPlan: [
          {
            id: `step_${route.capabilityId}`,
            action: route.action,
            capabilityId: route.capabilityId,
            status: 'Pending',
            retries: 0,
            maxRetries: 2,
            compensationAction: 'none'
          }
        ]
      });
    }

    return hypotheses;
  }
}

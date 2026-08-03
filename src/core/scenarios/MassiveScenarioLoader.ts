import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { KnowledgeObject, EnterpriseEvent } from '../types';

export class MassiveScenarioLoader {
  private bus = EnterpriseEventBus.getInstance();

  public seedKnowledge() {
    console.log('[MassiveScenarioLoader] Seeding 8 New Domain Policies...');

    const policies: KnowledgeObject[] = [
      {
        id: 'policy_it_incident_1',
        type: 'Policy',
        name: 'Sev1 Incident Response Policy',
        content: 'Severity 1 system alerts require PagerDuty dispatch.',
        summary: 'Sev1 -> PagerDuty',
        classification: 'INTERNAL',
        properties: { department: 'IT', severity: 'Sev1' },
        lifecycleState: 'Active',
        scope: 'Global',
        confidence: 100,
        citations: [],
        relationships: [],
        provenance: { created: new Date().toISOString(), confidence: 100, evidence: [], chain: [] }
      },
      {
        id: 'policy_support_vip_1',
        type: 'Policy',
        name: 'VIP SLA Policy',
        content: 'Enterprise customers must receive a 1-hour response.',
        summary: 'Enterprise -> 1hr SLA',
        classification: 'INTERNAL',
        properties: { department: 'Support', tier: 'Enterprise' },
        lifecycleState: 'Active',
        scope: 'Global',
        confidence: 100,
        citations: [],
        relationships: [],
        provenance: { created: new Date().toISOString(), confidence: 100, evidence: [], chain: [] }
      },
      {
        id: 'policy_facilities_security_1',
        type: 'Policy',
        name: 'Physical Security Policy',
        content: 'Unauthorized badge at Tier-1 triggers lockdown.',
        summary: 'Unauthorized -> Lockdown',
        classification: 'CONFIDENTIAL',
        properties: { department: 'Facilities', roomTier: 'Tier-1' },
        lifecycleState: 'Active',
        scope: 'Global',
        confidence: 100,
        citations: [],
        relationships: [],
        provenance: { created: new Date().toISOString(), confidence: 100, evidence: [], chain: [] }
      },
      {
        id: 'policy_compliance_gdpr_1',
        type: 'Policy',
        name: 'GDPR Data Request Policy',
        content: 'All data exports must undergo privacy audit.',
        summary: 'Export -> Privacy Audit',
        classification: 'CONFIDENTIAL',
        properties: { department: 'Compliance', action: 'Export' },
        lifecycleState: 'Active',
        scope: 'Global',
        confidence: 100,
        citations: [],
        relationships: [],
        provenance: { created: new Date().toISOString(), confidence: 100, evidence: [], chain: [] }
      },
      {
        id: 'policy_sales_dealdesk_1',
        type: 'Policy',
        name: 'Discount Approval Policy',
        content: 'Discounts > 20% require VP Sales approval.',
        summary: '>20% Discount -> VP Approval',
        classification: 'INTERNAL',
        properties: { department: 'Sales', maxDiscount: 20 },
        lifecycleState: 'Active',
        scope: 'Global',
        confidence: 100,
        citations: [],
        relationships: [],
        provenance: { created: new Date().toISOString(), confidence: 100, evidence: [], chain: [] }
      },
      {
        id: 'policy_marketing_brand_1',
        type: 'Policy',
        name: 'Brand Safety Policy',
        content: 'Social posts mentioning merger require Comms review.',
        summary: 'Merger -> Comms Review',
        classification: 'INTERNAL',
        properties: { department: 'Marketing', triggerWord: 'merger' },
        lifecycleState: 'Active',
        scope: 'Global',
        confidence: 100,
        citations: [],
        relationships: [],
        provenance: { created: new Date().toISOString(), confidence: 100, evidence: [], chain: [] }
      },
      {
        id: 'policy_rnd_security_1',
        type: 'Policy',
        name: 'Secure Code Policy',
        content: 'Changes to /auth require static security scan.',
        summary: 'Auth changes -> SecScan',
        classification: 'INTERNAL',
        properties: { department: 'R&D', triggerPath: '/auth' },
        lifecycleState: 'Active',
        scope: 'Global',
        confidence: 100,
        citations: [],
        relationships: [],
        provenance: { created: new Date().toISOString(), confidence: 100, evidence: [], chain: [] }
      },
      {
        id: 'policy_logistics_hazmat_1',
        type: 'Policy',
        name: 'Hazmat Shipping Policy',
        content: 'Shipments containing lithium require hazmat compliance check.',
        summary: 'Lithium -> Hazmat check',
        classification: 'INTERNAL',
        properties: { department: 'Logistics', triggerItem: 'lithium' },
        lifecycleState: 'Active',
        scope: 'Global',
        confidence: 100,
        citations: [],
        relationships: [],
        provenance: { created: new Date().toISOString(), confidence: 100, evidence: [], chain: [] }
      }
    ];

    for (const p of policies) {
      this.bus.publish(this.createEvent(p));
    }
  }

  private createEvent(knowledge: KnowledgeObject): EnterpriseEvent {
    return {
      id: crypto.randomUUID(),
      type: 'KnowledgeCreated',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system:scenario',
      source: 'MassiveScenarioLoader',
      aggregateId: knowledge.id,
      aggregateKind: 'Knowledge',
      payload: knowledge,
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: `seed_mass_${knowledge.id}`, traceId: `seed_mass`, spanId: '1' },
      idempotencyKey: `seed_${knowledge.id}`,
      classification: 'INTERNAL',
      metadata: {}
    };
  }
}

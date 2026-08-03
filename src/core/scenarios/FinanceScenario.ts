import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { KnowledgeObject, EnterpriseEvent } from '../types';

export class FinanceScenario {
  private bus = EnterpriseEventBus.getInstance();

  public seedKnowledge() {
    console.log('[FinanceScenario] Seeding Finance Knowledge (Policies & Entities)...');

    const policy: KnowledgeObject = {
      id: 'policy_finance_vendor_liability_1',
      type: 'Policy',
      name: 'Vendor Liability & Invoice Approval Policy',
      content: 'All invoices from registered vendors must be matched against a PO. Invoices over $10,000 require manual human approval from the Finance department before ERP staging.',
      summary: '> $10k requires human approval',
      classification: 'INTERNAL',
      properties: { department: 'Finance', threshold: 10000 },
      lifecycleState: 'Active',
      scope: 'Global',
      confidence: 100,
      citations: [],
      relationships: [],
      provenance: {
        created: new Date().toISOString(),
        confidence: 100,
        evidence: ['Finance Handbook 2026'],
        chain: ['Manual Entry']
      }
    };

    const vendor: KnowledgeObject = {
      id: 'entity_vendor_acme_corp',
      type: 'Organization',
      name: 'Acme Corp',
      content: 'Approved IT hardware supplier for laptops and servers.',
      classification: 'PUBLIC',
      properties: { status: 'Approved', vendorId: 'V-10294' },
      lifecycleState: 'Active',
      scope: 'Global',
      confidence: 100,
      citations: [],
      relationships: ['policy_finance_vendor_liability_1'],
      provenance: {
        created: new Date().toISOString(),
        confidence: 100,
        evidence: ['Procurement Database Sync'],
        chain: ['ERP Sync']
      }
    };

    this.bus.publish(this.createEvent(policy));
    this.bus.publish(this.createEvent(vendor));
  }

  private createEvent(knowledge: KnowledgeObject): EnterpriseEvent {
    return {
      id: crypto.randomUUID(),
      type: 'KnowledgeCreated',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system:scenario',
      source: 'FinanceScenario',
      aggregateId: knowledge.id,
      aggregateKind: 'Knowledge',
      payload: knowledge,
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: 'seed', traceId: 'seed', spanId: 'seed' },
      idempotencyKey: `seed_${knowledge.id}`,
      classification: 'INTERNAL',
      metadata: {}
    };
  }
}

import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { KnowledgeObject, EnterpriseEvent } from '../types';

export class ProcurementScenario {
  private bus = EnterpriseEventBus.getInstance();

  public seedKnowledge() {
    console.log('[ProcurementScenario] Seeding Procurement Knowledge (Policies)...');

    const policy: KnowledgeObject = {
      id: 'policy_procurement_hardware_1',
      type: 'Policy',
      name: 'IT Hardware Vendor Policy',
      content: 'Laptops and related IT hardware must only be purchased from the authorized vendor: Acme Corp.',
      summary: 'Laptops must be bought from Acme Corp.',
      classification: 'INTERNAL',
      properties: { department: 'Procurement', category: 'Laptops', authorizedVendor: 'Acme Corp' },
      lifecycleState: 'Active',
      scope: 'Global',
      confidence: 100,
      citations: [],
      relationships: [],
      provenance: {
        created: new Date().toISOString(),
        confidence: 100,
        evidence: ['Procurement Playbook 2026'],
        chain: ['Manual Entry']
      }
    };

    this.bus.publish(this.createEvent(policy));
  }

  private createEvent(knowledge: KnowledgeObject): EnterpriseEvent {
    return {
      id: crypto.randomUUID(),
      type: 'KnowledgeCreated',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system:scenario',
      source: 'ProcurementScenario',
      aggregateId: knowledge.id,
      aggregateKind: 'Knowledge',
      payload: knowledge,
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: `seed_pro_${knowledge.id}`, traceId: `seed_pro`, spanId: '1' },
      idempotencyKey: `seed_${knowledge.id}`,
      classification: 'INTERNAL',
      metadata: {}
    };
  }
}

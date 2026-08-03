import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { KnowledgeObject, EnterpriseEvent } from '../types';

export class LegalScenario {
  private bus = EnterpriseEventBus.getInstance();

  public seedKnowledge() {
    console.log('[LegalScenario] Seeding Legal Knowledge (Policies & Entities)...');

    const policy: KnowledgeObject = {
      id: 'policy_legal_nda_liability_1',
      type: 'Policy',
      name: 'Standard NDA Liability Policy',
      content: 'All Non-Disclosure Agreements must cap liability at $5,000,000. Any contract exceeding this threshold requires explicit General Counsel approval prior to signature.',
      summary: '> $5M liability requires GC approval',
      classification: 'CONFIDENTIAL',
      properties: { department: 'Legal', threshold: 5000000 },
      lifecycleState: 'Active',
      scope: 'Global',
      confidence: 100,
      citations: [],
      relationships: [],
      provenance: {
        created: new Date().toISOString(),
        confidence: 100,
        evidence: ['Legal Playbook 2026'],
        chain: ['Manual Entry']
      }
    };

    const vendor: KnowledgeObject = {
      id: 'entity_partner_globex',
      type: 'Organization',
      name: 'Globex',
      content: 'Strategic software development partner.',
      classification: 'CONFIDENTIAL',
      properties: { status: 'Active', partnerId: 'P-9912' },
      lifecycleState: 'Active',
      scope: 'Global',
      confidence: 100,
      citations: [],
      relationships: ['policy_legal_nda_liability_1'],
      provenance: {
        created: new Date().toISOString(),
        confidence: 100,
        evidence: ['CRM Database Sync'],
        chain: ['CRM Sync']
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
      source: 'LegalScenario',
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

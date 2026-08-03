import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { KnowledgeObject, EnterpriseEvent } from '../types';

export class HRScenario {
  private bus = EnterpriseEventBus.getInstance();

  public seedKnowledge() {
    console.log('[HRScenario] Seeding HR Knowledge (Policies & Entities)...');

    const policy: KnowledgeObject = {
      id: 'policy_hr_engineering_hiring_1',
      type: 'Policy',
      name: 'Senior Engineering Hiring Policy',
      content: 'All Senior Engineering candidates must have explicit cloud architecture experience. Candidates lacking this require manual VP approval.',
      summary: 'Senior Engineers require cloud experience.',
      classification: 'INTERNAL',
      properties: { department: 'HR', role: 'Senior Engineer', requiredSkills: ['Cloud Architecture'] },
      lifecycleState: 'Active',
      scope: 'Global',
      confidence: 100,
      citations: [],
      relationships: [],
      provenance: {
        created: new Date().toISOString(),
        confidence: 100,
        evidence: ['HR Guidelines 2026'],
        chain: ['Manual Entry']
      }
    };

    const candidate: KnowledgeObject = {
      id: 'entity_person_john_doe',
      type: 'Person',
      name: 'John Doe',
      content: 'Candidate profile in ATS.',
      classification: 'CONFIDENTIAL',
      properties: { status: 'Interviewing', skills: ['TypeScript', 'React'] },
      lifecycleState: 'Active',
      scope: 'Global',
      confidence: 100,
      citations: [],
      relationships: [],
      provenance: {
        created: new Date().toISOString(),
        confidence: 100,
        evidence: ['ATS Sync'],
        chain: ['System Integration']
      }
    };

    this.bus.publish(this.createEvent(policy));
    this.bus.publish(this.createEvent(candidate));
  }

  private createEvent(knowledge: KnowledgeObject): EnterpriseEvent {
    return {
      id: crypto.randomUUID(),
      type: 'KnowledgeCreated',
      schemaVersion: '1.0',
      tenantId: 'system',
      actorId: 'system:scenario',
      source: 'HRScenario',
      aggregateId: knowledge.id,
      aggregateKind: 'Knowledge',
      payload: knowledge,
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: `seed_hr_${knowledge.id}`, traceId: `seed_hr`, spanId: '1' },
      idempotencyKey: `seed_${knowledge.id}`,
      classification: 'INTERNAL',
      metadata: {}
    };
  }
}

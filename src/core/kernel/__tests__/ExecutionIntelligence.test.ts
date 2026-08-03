import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionIntelligence } from '../intelligence/ExecutionIntelligence';
import { MissionExecutionContext } from '../../types';

function createMockMission(missionTitle: string): MissionExecutionContext {
  return {
    id: `mission_${Date.now()}`,
    mission: missionTitle,
    lifecycleState: 'PENDING_APPROVAL',
    actionRequired: 'Human Approval Required',
    trigger: {
      id: 'evt_trigger',
      type: 'ArtifactObserved',
      schemaVersion: '1.0',
      tenantId: 'tenant_demo',
      actorId: 'user_1',
      source: 'UI_Upload',
      aggregateId: 'agg_100',
      aggregateKind: 'Artifact',
      payload: {},
      occurredAt: new Date().toISOString(),
      traceContext: { correlationId: 'corr_100', traceId: 't1', spanId: 's1' },
      idempotencyKey: 'idem_trigger',
      classification: 'INTERNAL',
      metadata: {},
    },
    missionGraph: [],
    executionPlan: [],
    resolvedContext: [],
    recommendations: [],
    auditTrail: [],
    businessOutcomes: {
      manualWorkEliminated: '2h',
      decisionsAccelerated: 1,
      riskPrevented: 'Low',
      financialValueCreated: 'TBD',
      automationCompletionRate: '100%',
      slaImprovement: 'On Track',
    },
    hypotheses: [],
  };
}

describe('Subsystem 3: Execution Intelligence & DAG Orchestrator', () => {
  let executionEngine: ExecutionIntelligence;

  beforeEach(() => {
    executionEngine = ExecutionIntelligence.getInstance();
  });

  it('Test-EX-1: DAG Plan Generation & Parallel Step Resolution', async () => {
    const mission = createMockMission('Complete Diabetes Evaluation');
    const plan = executionEngine.generateExecutionPlan(mission);
    mission.executionPlan = plan;

    expect(plan.length).toBeGreaterThanOrEqual(3);
    const ocrStep = plan.find(s => s.id === 'step_ocr');
    const drugStep = plan.find(s => s.id === 'step_drug_interaction');
    const insStep = plan.find(s => s.id === 'step_insurance');

    expect(ocrStep?.dependsOn).toBeUndefined();
    expect(drugStep?.dependsOn).toContain('step_ocr');
    expect(insStep?.dependsOn).toContain('step_ocr');

    await executionEngine.executeDAG(mission);

    expect(ocrStep?.status).toBe('Completed');
    expect(drugStep?.status).toBe('Completed');
    expect(insStep?.status).toBe('Completed');
  });

  it('Test-EX-2: Per-step Timeout Guard Enforcement', async () => {
    const mission = createMockMission('Timeout Test Mission');
    mission.executionPlan = [
      {
        id: 'step_timeout',
        action: 'Long Hanging Capability',
        status: 'Pending',
        retries: 0,
        maxRetries: 0,
        timeoutMs: 10, // 10ms timeout threshold
      },
    ];

    await executionEngine.executeDAG(mission);
    expect(mission.executionPlan[0].status).toBe('Failed');
    expect(mission.executionPlan[0].errorReason).toContain('timed out');
  });

  it('Test-EX-3: Saga Compensation Rollback Pipeline', async () => {
    const mission = createMockMission('Saga Rollback Test Mission');
    mission.executionPlan = [
      {
        id: 'step_1',
        action: 'Step 1 - Account Reserve',
        status: 'Completed',
        retries: 0,
        maxRetries: 1,
        compensationAction: 'release_account_reserve',
      },
      {
        id: 'step_2',
        action: 'Step 2 - Failed Payment',
        status: 'Failed',
        retries: 0,
        maxRetries: 0,
        compensationAction: 'none',
      },
    ];

    await executionEngine.rollbackSaga(mission);

    expect(mission.executionPlan[0].status).toBe('Compensated');
  });
});

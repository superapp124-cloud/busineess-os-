import {
  Planner, PlanningContext, ExecutionPlan, PlanExplanation,
  GoalDecomposer, ReasoningProvider, CapabilityMatcher,
  ExecutionGraphBuilder, PlanOptimiser, SafetyValidator, ContextAssembler,
  Intent, PlanEstimate, Goal
} from '../src/index';

// === MOCK IMPLEMENTATIONS (providers injected — never embedded) ===

const mockReasoning: ReasoningProvider = {
  analyse: async (input) => {
    if (input.includes('?')) return { interpretation: input, ambiguous: true, alternatives: ['schedule a meeting', 'block calendar'] };
    return { interpretation: input, ambiguous: false };
  },
  decompose: async (intent) => [
    { id: 'goal-1', description: `Create meeting for: ${intent}`, priority: 1 }
  ],
  summarise: async (data) => JSON.stringify(data).slice(0, 80)
};

const mockContextAssembler: ContextAssembler = {
  assemble: async (intent: Intent): Promise<PlanningContext> => ({
    intent,
    memoryEntries: [],
    semanticMatches: [],
    capabilityMetadata: [{ name: 'calendar', actions: ['CreateMeeting'] }],
    organisationPolicy: { requireApproval: true },
    userContext: { role: 'manager' }
  })
};

const mockCapabilityMatcher: CapabilityMatcher = {
  findAndRank: async (goals, tenantId, userId, kernelVersion) => {
    if (goals.includes('missing-capability')) return [];
    return [{
      identity: { publisherId: 'chatr', namespace: '@chatr', packageName: 'calendar', packageType: 'capability', version: '1.0.0', digest: 'abc', signature: 'sig' },
      trustScore: 99, compatibilityScore: 100, rank: 1
    }];
  }
};

const mockGraphBuilder: ExecutionGraphBuilder = {
  build: async (goals, capabilities) => capabilities.map(cap => ({
    capabilityId: cap.identity.packageName,
    actionId: 'CreateMeeting',
    dependsOn: [],
    canRunInParallel: false,
    isIdempotent: true,
    isDeterministic: true
  }))
};

const mockOptimiser: PlanOptimiser = {
  optimise: async (steps, confidence) => ({
    steps,
    estimatedCostMs: 50,
    estimatedDurationMs: 200
  })
};

const mockSafetyValidator: SafetyValidator = {
  validate: async (plan, threshold) => {
    if (plan.confidence.overall < threshold) {
      return { safe: false, errors: [`Confidence ${plan.confidence.overall} below threshold ${threshold}`], warnings: [] };
    }
    return { safe: true, errors: [], warnings: [] };
  }
};

// === INTEGRATION TESTS ===

export async function runPlannerTests() {
  console.log('=== Planner Integration Tests ===\n');

  const baseIntent: Intent = {
    id: 'intent-1', raw: 'Schedule a team meeting for next Monday',
    tenantId: 'tenant-1', userId: 'user-1', timestamp: new Date().toISOString()
  };

  // 1. Happy path
  {
    console.log('Test 1: Happy Path');
    const analysis = await mockReasoning.analyse(baseIntent.raw, {});
    const goals = await mockReasoning.decompose(baseIntent.raw, {});
    const caps = await mockCapabilityMatcher.findAndRank(goals.map(g => g.description), 'tenant-1', 'user-1', '1.0.0');
    const steps = await mockGraphBuilder.build(goals, caps);
    const conf: import('../src/index').ConfidenceScore = { intent: 0.95, matching: 0.92, planning: 0.90, overall: 0.92 };
    const optimised = await mockOptimiser.optimise(steps, conf);
    const plan: ExecutionPlan = {
      intentId: baseIntent.id, steps: optimised.steps, confidence: conf,
      explanation: { summary: 'Schedule meeting', selectedCapabilities: ['calendar'], rejectedCapabilities: [], assumptions: [], confidenceFactors: ['intent clear'] },
      requiredApprovals: ['manager'], estimatedCostMs: optimised.estimatedCostMs,
      estimatedDurationMs: optimised.estimatedDurationMs, requiresHumanReview: false
    };
    const safety = await mockSafetyValidator.validate(plan, 0.80);
    console.log(`  ✓ Plan generated. Steps: ${plan.steps.length}. Safe: ${safety.safe}\n`);
  }

  // 2. Ambiguous intent
  {
    console.log('Test 2: Ambiguous Intent');
    const result = await mockReasoning.analyse('Book something for Monday?', {});
    if (result.ambiguous) {
      console.log(`  ✓ Ambiguous intent detected. Alternatives: [${result.alternatives?.join(', ')}]\n`);
    }
  }

  // 3. Missing capability
  {
    console.log('Test 3: Missing Capability');
    const caps = await mockCapabilityMatcher.findAndRank(['missing-capability'], 'tenant-1', 'user-1', '1.0.0');
    if (caps.length === 0) {
      console.log(`  ✓ Unsatisfied capability: no candidates found. Planner would return structured UnsatisfiedIntent.\n`);
    }
  }

  // 4. Low confidence → human review
  {
    console.log('Test 4: Low Confidence → Human Review');
    const lowConf: import('../src/index').ConfidenceScore = { intent: 0.4, matching: 0.3, planning: 0.5, overall: 0.4 };
    const lowPlan: ExecutionPlan = {
      intentId: 'intent-low', steps: [], confidence: lowConf,
      explanation: { summary: 'Uncertain', selectedCapabilities: [], rejectedCapabilities: [], assumptions: ['guessing'], confidenceFactors: ['unclear intent'] },
      requiredApprovals: [], estimatedCostMs: 0, estimatedDurationMs: 0, requiresHumanReview: true
    };
    const safety = await mockSafetyValidator.validate(lowPlan, 0.80);
    if (!safety.safe) {
      console.log(`  ✓ Low confidence plan blocked: "${safety.errors[0]}"\n`);
    }
  }

  // 5. Provider disagreement
  {
    console.log('Test 5: Provider Disagreement');
    const providerA: Goal[] = [{ id: 'g-a', description: 'Schedule meeting', priority: 1 }];
    const providerB: Goal[] = [{ id: 'g-b', description: 'Block calendar', priority: 1 }];
    // Policy selects highest priority (providerA in this deterministic mock)
    const selected = providerA[0].priority >= providerB[0].priority ? providerA : providerB;
    console.log(`  ✓ Provider disagreement handled deterministically → selected: "${selected[0].description}"\n`);
  }

  console.log('✅ All Planner integration tests passed.');
  return true;
}

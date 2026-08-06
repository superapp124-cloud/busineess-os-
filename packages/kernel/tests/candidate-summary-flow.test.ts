import { CandidateSummaryCapability } from '../src/capabilities/CandidateSummaryCapability';
import { SearchCapability } from '../src/capabilities/SearchCapability';
import { IntentCompiler } from '../src/compiler/IntentCompiler';
import { ExecutionContext } from '../src/types/ExecutionContext';
import { ServiceFabric } from '../src/services/ServiceFabric';
import { DefaultSecretsServiceAdapter } from '../src/services/SecretsService';

async function runCandidateSummaryFlowTest() {
  console.log('========================================================');
  console.log('   TEST: Candidate Summary End-to-End Pipeline         ');
  console.log('   Goal: Intent -> Search -> OpenRouter AI -> Summary   ');
  console.log('========================================================\n');

  // Register OS System Services
  ServiceFabric.register(new DefaultSecretsServiceAdapter());

  // 1. Intent Compilation
  const userPrompt = 'Find Java candidates in Bangalore and generate executive summaries';
  console.log(`[Step 1] Compiling User Prompt: "${userPrompt}"`);
  const intentIR = IntentCompiler.compile(userPrompt);
  console.log(`   - Intent IR ID: ${intentIR.id}, Goal: ${intentIR.goal}, Type: ${intentIR.type}`);

  // 2. Mock ExecutionContext
  const mockContext: ExecutionContext = {
    executionId: `exec_candidate_flow_${Date.now()}`,
    correlationId: intentIR.metadata.traceId,
    tenantId: 'tenant_recruitment_01',
    user: { id: 'usr_recruiter', role: 'recruiter' },
    organization: { id: 'org_enterprise', tier: 'enterprise' },
    workspace: { id: 'ws_recruitment' },
    permissions: ['candidate:read'],
    policy: {
      privacyLevel: 'PUBLIC_CLOUD',
      maxBudgetCost: 0.05,
      maxLatencyMs: 2000,
      complianceRegime: ['SOC2'],
      allowedProviders: ['*'],
      allowedStorageTargets: ['*'],
      permissionsGranted: ['candidate:read'],
    },
    locale: 'en-US',
    services: { resolve: () => ({}), has: () => true, register: () => {} },
    telemetry: { recordMetric: () => {}, startSpan: () => ({ end: () => {} }) },
    request: intentIR,
  };

  // 3. Step 1 DAG Node: Search Candidates (Deterministic Execution)
  console.log('\n[Step 2] Executing Deterministic SearchCapability...');
  const searchCapability = new SearchCapability();
  const searchResult = await searchCapability.execute(mockContext, {
    query: 'Java',
    location: 'Bangalore',
  });
  console.log(`   - Search Status: ${searchResult.status}, Candidates Found: ${(searchResult.output as any)?.items?.length}`);

  // 4. Step 2 DAG Node: Candidate Summary (OpenRouter AI Execution)
  console.log('\n[Step 3] Executing Probabilistic CandidateSummaryCapability via OpenRouter AI...');
  const summaryCapability = new CandidateSummaryCapability();
  const summaryResult = await summaryCapability.execute(mockContext, {
    candidateId: 'cand_101',
    name: 'Aarav Sharma',
    skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
    experienceYears: 6,
    location: 'Bangalore',
  });

  console.log('\n✅ Candidate Summary Flow Results:');
  console.log(`   - Executive Summary: ${summaryResult.output?.executiveSummary}`);
  console.log(`   - Recruiter Notes: ${summaryResult.output?.recruiterNotes}`);
  console.log(`   - Duration: ${summaryResult.metrics.durationMs}ms`);
  console.log(`   - Provider: ${summaryResult.metrics.providerId}`);

  if (summaryResult.status === 'completed' && summaryResult.output?.candidateId === 'cand_101') {
    console.log('\n========================================================');
    console.log('🎉 CANDIDATE SUMMARY FLOW TEST SUCCESSFUL!');
    console.log('========================================================');
    process.exit(0);
  } else {
    console.error('❌ CANDIDATE SUMMARY FLOW TEST FAILED!');
    process.exit(1);
  }
}

runCandidateSummaryFlowTest().catch((err) => {
  console.error('Fatal error during candidate summary flow test:', err);
  process.exit(1);
});

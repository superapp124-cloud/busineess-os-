import { IntentCompiler } from '../src/compiler/IntentCompiler';
import { SearchCapability } from '../src/capabilities/SearchCapability';
import { RankCapability } from '../src/capabilities/RankCapability';
import { ExecutionContext } from '../src/types/ExecutionContext';

async function runGenericCompositionTest() {
  console.log('========================================================');
  console.log('   TEST: Generic Capability Composition Pipeline       ');
  console.log('   Goal: Search (Candidate, "Java") -> Rank ("5+ yrs")  ');
  console.log('========================================================\n');

  // 1. Compile Natural Language Prompt into IntentIR v1.0
  const prompt = "Find Java candidates with 5+ years experience";
  console.log(`[Step 1] Compiling IntentIR: "${prompt}"...`);
  const intentIR = IntentCompiler.compile(prompt);

  // 2. Build Mock ExecutionContext
  const mockContext: ExecutionContext = {
    executionId: `exec_${Date.now()}`,
    correlationId: intentIR.metadata.traceId,
    tenantId: intentIR.metadata.tenantId,
    user: { id: 'usr_architect', role: 'admin' },
    organization: { id: 'org_chatr', tier: 'enterprise' },
    workspace: { id: 'ws_default' },
    permissions: ['search:execute', 'rank:execute'],
    policy: {
      privacyLevel: 'ENTERPRISE_LAN',
      maxBudgetCost: 0.05,
      maxLatencyMs: 2000,
      complianceRegime: ['GDPR', 'SOC2'],
      allowedProviders: ['local', 'vllm'],
      allowedStorageTargets: ['supabase'],
      permissionsGranted: ['all'],
    },
    locale: 'en-US',
    services: {
      resolve: () => ({}),
      has: () => true,
      register: () => {},
    },
    telemetry: {
      recordMetric: (name, val) => console.log(`   [Telemetry Metric] ${name}: ${val}`),
      startSpan: () => ({ end: () => {} }),
    },
    request: intentIR,
  };

  // 3. Execute Generic SearchCapability
  console.log('[Step 2] Executing Generic SearchCapability...');
  const searchCap = new SearchCapability();
  const searchResult = await searchCap.execute(mockContext, {
    entity: 'Candidate',
    query: 'Java',
  });

  console.log(`   - Search Status: ${searchResult.status}`);
  console.log(`   - Found ${searchResult.output?.items.length} Candidate entities\n`);

  // 4. Compose and Execute Generic RankCapability on Search Outputs
  console.log('[Step 3] Executing Generic RankCapability on Search Outputs...');
  const rankCap = new RankCapability();
  const rankResult = await rankCap.execute(mockContext, {
    items: searchResult.output?.items || [],
    criteria: 'Java 5+ years experience',
  });

  console.log(`   - Ranking Status: ${rankResult.status}`);
  console.log(`   - Top Match: ${rankResult.output?.rankedItems[0]?.name} (Score: ${rankResult.output?.rankedItems[0]?.matchScore}%)`);

  if (rankResult.status === 'completed' && (rankResult.output?.rankedItems.length || 0) > 0) {
    console.log('\n========================================================');
    console.log('🎉 SUCCESS: Generic Capabilities composed cleanly for Intent!');
    console.log('========================================================');
    process.exit(0);
  } else {
    console.error('\n❌ COMPOSITION FAILED!');
    process.exit(1);
  }
}

runGenericCompositionTest().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});

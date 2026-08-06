import { GeminiProviderAdapter } from '../src/providers/GeminiProviderAdapter';
import { GroqProviderAdapter } from '../src/providers/GroqProviderAdapter';
import { ExecutionContext } from '../src/types/ExecutionContext';

async function runProviderSwapTest() {
  console.log('========================================================');
  console.log('   TEST: Provider Swap Test (Gemini <-> Groq LPU)       ');
  console.log('   Goal: Swap provider adapters with zero kernel change ');
  console.log('========================================================\n');

  const mockContext: ExecutionContext = {
    executionId: `exec_${Date.now()}`,
    correlationId: 'trace_provider_swap_test',
    tenantId: 'tenant_test',
    user: { id: 'usr_test', role: 'admin' },
    organization: { id: 'org_test', tier: 'enterprise' },
    workspace: { id: 'ws_test' },
    permissions: ['all'],
    policy: {
      privacyLevel: 'PUBLIC_CLOUD',
      maxBudgetCost: 0.05,
      maxLatencyMs: 2000,
      complianceRegime: ['SOC2'],
      allowedProviders: ['*'],
      allowedStorageTargets: ['*'],
      permissionsGranted: ['all'],
    },
    locale: 'en-US',
    services: { resolve: () => ({}), has: () => true, register: () => {} },
    telemetry: { recordMetric: () => {}, startSpan: () => ({ end: () => {} }) },
    request: {} as any,
  };

  const payload = { prompt: 'Rank these 3 candidates by Java skill' };

  // 1. Execute via Gemini Provider
  console.log('[Step 1] Executing task via GeminiProviderAdapter...');
  const geminiAdapter = new GeminiProviderAdapter();
  const geminiResult = await geminiAdapter.execute(mockContext, payload);

  console.log(`   - Gemini Result Status: ${geminiResult.status}`);
  console.log(`   - Duration: ${geminiResult.metrics.durationMs}ms`);
  console.log(`   - Provider ID: ${geminiResult.metrics.providerId}\n`);

  // 2. Execute same task via Groq Provider (SWAPPED)
  console.log('[Step 2] Swapping to GroqProviderAdapter (Zero Kernel Changes)...');
  const groqAdapter = new GroqProviderAdapter();
  const groqResult = await groqAdapter.execute(mockContext, payload);

  console.log(`   - Groq Result Status: ${groqResult.status}`);
  console.log(`   - Duration: ${groqResult.metrics.durationMs}ms`);
  console.log(`   - Provider ID: ${groqResult.metrics.providerId}\n`);

  // 3. Assert Contract Equivalence
  const keysMatch = Object.keys(geminiResult).sort().join(',') === Object.keys(groqResult).sort().join(',');
  if (geminiResult.status === 'completed' && groqResult.status === 'completed' && keysMatch) {
    console.log('========================================================');
    console.log('🎉 PROVIDER SWAP SUCCESSFUL: Unified ExecutionResult Shape!');
    console.log('========================================================');
    process.exit(0);
  } else {
    console.error('❌ PROVIDER SWAP FAILED!');
    process.exit(1);
  }
}

runProviderSwapTest().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});

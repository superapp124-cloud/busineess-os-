import { OpenRouterProviderAdapter } from '../src/providers/OpenRouterProviderAdapter';
import { AIExecutor } from '../src/executors/AIExecutor';
import { ExecutionContext } from '../src/types/ExecutionContext';
import { ServiceFabric } from '../src/services/ServiceFabric';
import { DefaultSecretsServiceAdapter } from '../src/services/SecretsService';

async function runOpenRouterTest() {
  console.log('========================================================');
  console.log('   TEST: OpenRouter Provider Edge Proxy Integration    ');
  console.log('   Goal: Verify Secure Execution via Supabase Proxy     ');
  console.log('========================================================\n');

  // Register SecretsService
  ServiceFabric.register(new DefaultSecretsServiceAdapter());

  const adapter = new OpenRouterProviderAdapter();

  const mockContext: ExecutionContext = {
    executionId: `exec_openrouter_${Date.now()}`,
    correlationId: 'trace_openrouter_001',
    tenantId: 'tenant_enterprise_01',
    user: { id: 'usr_001', role: 'admin' },
    organization: { id: 'org_001', tier: 'enterprise' },
    workspace: { id: 'ws_001' },
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

  console.log('[Step 1] Health Checking OpenRouter Adapter...');
  const health = await adapter.health();
  console.log(`   - Status: ${health.status}, Latency: ${health.latencyMs}ms`);

  console.log('\n[Step 2] Executing AI Task through AIExecutor & OpenRouterProviderAdapter...');
  const result = await AIExecutor.execute(mockContext, adapter, {
    capability: 'summarize',
    prompt: 'Summarize candidate profile for Java developer',
  });

  console.log('\n✅ OpenRouter Execution Result:');
  console.log(`   - Status: ${result.status}`);
  console.log(`   - Provider: ${(result.output as any)?.provider}`);
  console.log(`   - Model: ${(result.output as any)?.model}`);
  console.log(`   - Secured By: ${(result.output as any)?.securedBy}`);
  console.log(`   - Key Type Resolved: ${(result.output as any)?.keyTypeResolved}`);

  console.log('\n[Step 3] Testing Privacy Policy Enforcement (STRICT_LOCAL)...');
  const strictContext = {
    ...mockContext,
    policy: { ...mockContext.policy, privacyLevel: 'STRICT_LOCAL' as const },
  };

  try {
    await AIExecutor.execute(strictContext, adapter, { prompt: 'Test policy breach' });
    console.error('❌ FAILED: Privacy Policy check did not block STRICT_LOCAL execution!');
    process.exit(1);
  } catch (err: any) {
    console.log(`   ✅ Policy Check PASSED: Correctly blocked with error: "${err.message}"`);
  }

  if (result.status === 'completed' && (result.output as any)?.provider === 'openrouter') {
    console.log('\n========================================================');
    console.log('🎉 OPENROUTER PROVIDER TEST SUCCESSFUL!');
    console.log('========================================================');
    process.exit(0);
  } else {
    console.error('❌ OPENROUTER PROVIDER TEST FAILED!');
    process.exit(1);
  }
}

runOpenRouterTest().catch((err) => {
  console.error('Fatal error during OpenRouter test:', err);
  process.exit(1);
});

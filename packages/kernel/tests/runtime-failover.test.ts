import { RuntimeFabric } from '../src/runtimes/RuntimeFabric';
import { Runtime } from '../src/types/Runtime';
import { ExecutionContext } from '../src/types/ExecutionContext';

async function runRuntimeFailoverTest() {
  console.log('========================================================');
  console.log('   TEST: Runtime Failover Test                          ');
  console.log('   Goal: Primary fails -> Secondary takes over          ');
  console.log('========================================================\n');

  // 1. Define Primary Runtime (Simulated Failure)
  const primaryRuntime: Runtime = {
    id: 'runtime-browser-ai-failing',
    name: 'Browser AI Runtime (Failing)',
    category: 'LOCAL',
    features: {
      supportsLLM: true,
      supportsVision: false,
      supportsEmbedding: false,
      supportsSpeech: false,
      supportsToolCalling: false,
      supportsStreaming: true,
      supportsGPU: true,
      supportsOffline: true,
    },
    health: async () => ({ healthy: true }),
    execute: async () => {
      console.log('   ⚠️ [Primary Runtime] Simulating WebGPU memory overflow error!');
      throw new Error('Out of WebGPU VRAM memory');
    },
  };

  // 2. Define Secondary Runtime (Cloud Failover Target)
  const secondaryRuntime: Runtime = {
    id: 'runtime-groq-cloud',
    name: 'Groq LPU Cloud Runtime (Failover Target)',
    category: 'REMOTE',
    features: {
      supportsLLM: true,
      supportsVision: true,
      supportsEmbedding: true,
      supportsSpeech: true,
      supportsToolCalling: true,
      supportsStreaming: true,
      supportsGPU: true,
      supportsOffline: false,
    },
    health: async () => ({ healthy: true }),
    execute: async (capId, ctx) => {
      console.log('   ✅ [Secondary Failover Runtime] Rescuing task execution via Groq LPU Cloud!');
      return {
        executionId: ctx.executionId,
        status: 'completed',
        output: { rescuedBy: 'runtime-groq-cloud' },
        diagnostics: [{ severity: 'info', message: 'Failover execution successful' }],
        metrics: { durationMs: 14, cost: 0.0001, providerId: 'groq' },
        artifacts: [],
        events: ['runtime:failover:success'],
      };
    },
  };

  RuntimeFabric.registerRuntime(primaryRuntime);
  RuntimeFabric.registerRuntime(secondaryRuntime);

  const mockContext: ExecutionContext = {
    executionId: `exec_failover_${Date.now()}`,
    correlationId: 'trace_failover_test',
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

  console.log('[Step 1] Initiating execution through RuntimeFabric with failover...');
  const result = await RuntimeFabric.executeWithFailover('capability-search', mockContext, {});

  console.log('\n✅ Runtime Failover Execution Result:');
  console.log(`   - Status: ${result.status}`);
  console.log(`   - Rescued By: ${(result.output as any)?.rescuedBy}`);
  console.log(`   - Duration: ${result.metrics.durationMs}ms`);

  if (result.status === 'completed' && (result.output as any)?.rescuedBy === 'runtime-groq-cloud') {
    console.log('\n========================================================');
    console.log('🎉 RUNTIME FAILOVER TEST SUCCESSFUL!');
    console.log('========================================================');
    process.exit(0);
  } else {
    console.error('❌ RUNTIME FAILOVER TEST FAILED!');
    process.exit(1);
  }
}

runRuntimeFailoverTest().catch((err) => {
  console.error('Fatal error during failover test:', err);
  process.exit(1);
});

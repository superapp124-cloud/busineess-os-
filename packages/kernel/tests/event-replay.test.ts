import { ReplayEngine } from '../src/events/ReplayEngine';
import { DomainEvent } from '../src/types/DomainEvent';

async function runEventReplayTest() {
  console.log('========================================================');
  console.log('   TEST: Event Replay Engine Test                      ');
  console.log('   Goal: Reconstruct DAG execution state from event log ');
  console.log('========================================================\n');

  const mockDomainEvents: DomainEvent[] = [
    {
      id: 'evt_101',
      name: 'intent:compiled',
      tenantId: 'tenant_enterprise',
      actorId: 'usr_architect',
      correlationId: 'exec_original_909',
      traceId: 'trace_replay_test_001',
      spanId: 'span_001',
      category: 'domain',
      severity: 'info',
      source: 'IntentCompiler',
      payload: { goal: 'Find Java Candidates' },
      timestamp: new Date(Date.now() - 5000).toISOString(),
    },
    {
      id: 'evt_102',
      name: 'capability:search:executed',
      tenantId: 'tenant_enterprise',
      actorId: 'usr_architect',
      correlationId: 'exec_original_909',
      traceId: 'trace_replay_test_001',
      spanId: 'span_002',
      parentSpanId: 'span_001',
      category: 'domain',
      severity: 'info',
      source: 'SearchCapability',
      payload: { foundItems: 3 },
      timestamp: new Date(Date.now() - 3000).toISOString(),
    },
    {
      id: 'evt_103',
      name: 'capability:rank:executed',
      tenantId: 'tenant_enterprise',
      actorId: 'usr_architect',
      correlationId: 'exec_original_909',
      traceId: 'trace_replay_test_001',
      spanId: 'span_003',
      parentSpanId: 'span_002',
      category: 'domain',
      severity: 'info',
      source: 'RankCapability',
      payload: { topScore: 98 },
      timestamp: new Date(Date.now() - 1000).toISOString(),
    },
  ];

  console.log('[Step 1] Passing 3 DomainEvents to ReplayEngine...');
  const session = ReplayEngine.replayFromEventLog(mockDomainEvents);

  console.log('\n✅ Event Replay Session Results:');
  console.log(`   - Trace ID: ${session.traceId}`);
  console.log(`   - Original Execution ID: ${session.originalExecutionId}`);
  console.log(`   - Replayed Execution ID: ${session.replayedResult.executionId}`);
  console.log(`   - Status: ${session.replayedResult.status}`);
  console.log(`   - Is Exact Match: ${session.isMatch}`);

  if (session.isMatch && session.replayedResult.status === 'completed') {
    console.log('\n========================================================');
    console.log('🎉 EVENT REPLAY TEST SUCCESSFUL!');
    console.log('========================================================');
    process.exit(0);
  } else {
    console.error('❌ EVENT REPLAY TEST FAILED!');
    process.exit(1);
  }
}

runEventReplayTest().catch((err) => {
  console.error('Fatal error during replay test:', err);
  process.exit(1);
});

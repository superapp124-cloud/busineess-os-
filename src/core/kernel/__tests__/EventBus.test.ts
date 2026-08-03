import { describe, it, expect, beforeEach } from 'vitest';
import { DistributedEventStore } from '../persistence/DistributedEventStore';
import { EnterpriseEvent } from '../types';

function createMockEvent(id: string, key: string, type = 'ArtifactObserved'): EnterpriseEvent {
  return {
    id,
    type,
    schemaVersion: '1.0',
    tenantId: 'tenant_demo',
    actorId: 'user_1',
    source: 'UI_Upload',
    aggregateId: 'agg_1',
    aggregateKind: 'Artifact',
    payload: { filename: 'test.pdf' },
    occurredAt: new Date().toISOString(),
    traceContext: {
      correlationId: 'corr_100',
      causationId: 'cause_099',
      traceId: 'trace_001',
      spanId: 'span_001',
    },
    idempotencyKey: key,
    classification: 'INTERNAL',
    metadata: {},
  };
}

describe('Subsystem 1: Enterprise Event Bus & Distributed Event Store', () => {
  let eventStore: DistributedEventStore;

  beforeEach(async () => {
    eventStore = new DistributedEventStore();
    await eventStore.connect();
  });

  it('Test-EB-1: Idempotency deduplication per partition', async () => {
    const event1 = createMockEvent('evt_1', 'idem_key_100');
    const event2 = createMockEvent('evt_2', 'idem_key_100'); // Duplicate key

    await eventStore.append(event1);
    await eventStore.append(event2);

    const readEvents = eventStore.read('agg_1');
    expect(readEvents.length).toBe(1);
    expect(readEvents[0].id).toBe('evt_1');
  });

  it('Test-EB-2: Monotonically increasing sequence numbering', async () => {
    const event1 = createMockEvent('evt_10', 'idem_key_101');
    const event2 = createMockEvent('evt_11', 'idem_key_102');

    await eventStore.append(event1);
    await eventStore.append(event2);

    const readEvents = eventStore.read('agg_1');
    expect(readEvents[0].sequenceNumber).toBe(1);
    expect(readEvents[1].sequenceNumber).toBe(2);
  });

  it('Test-EB-3: Offset sequence range replay', async () => {
    const e1 = createMockEvent('evt_21', 'k21');
    const e2 = createMockEvent('evt_22', 'k22');
    const e3 = createMockEvent('evt_23', 'k23');

    await eventStore.append(e1);
    await eventStore.append(e2);
    await eventStore.append(e3);

    const topic = 'tenant_demo.Artifact';
    const replayed = eventStore.replaySequenceRange(topic, 2, 3);
    expect(replayed.length).toBe(2);
    expect(replayed[0].id).toBe('evt_22');
    expect(replayed[1].id).toBe('evt_23');
  });

  it('Test-EB-4: Dead Letter Queue (DLQ) routing on subscriber failure', async () => {
    eventStore.subscribe((event) => {
      if (event.id === 'evt_fail') {
        throw new Error('Handler processing failed');
      }
    });

    const goodEvent = createMockEvent('evt_good', 'k_good');
    const failingEvent = createMockEvent('evt_fail', 'k_fail');

    await eventStore.append(goodEvent);
    await eventStore.append(failingEvent);

    const dlqEvents = eventStore.getDLQEvents('DLQ_tenant_demo.Artifact');
    expect(dlqEvents.length).toBe(1);
    expect(dlqEvents[0].event.id).toBe('evt_fail');
    expect(dlqEvents[0].error).toContain('Handler processing failed');
  });
});

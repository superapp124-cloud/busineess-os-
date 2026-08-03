import { describe, it, expect, beforeEach } from 'vitest';
import { EnterpriseGraph } from '../EnterpriseGraph';
import { EnterpriseEvent } from '../../types';

function createMockObjectEvent(id: string, name: string, type: string, properties: Record<string, any>): EnterpriseEvent {
  return {
    id: `evt_${id}`,
    type: 'EnterpriseObjectCreated',
    schemaVersion: '1.0',
    tenantId: 'tenant_demo',
    actorId: 'user_1',
    source: 'UI_Upload',
    aggregateId: id,
    aggregateKind: 'Artifact',
    payload: { id, name, type, properties },
    occurredAt: new Date().toISOString(),
    traceContext: { correlationId: 'corr_1', traceId: 't1', spanId: 's1' },
    idempotencyKey: `idem_${id}`,
    classification: 'INTERNAL',
    metadata: {},
  };
}

function createMockEdgeEvent(id: string, sourceId: string, targetId: string, relationship: string): EnterpriseEvent {
  return {
    id: `evt_edge_${id}`,
    type: 'GraphEdgeCreated',
    schemaVersion: '1.0',
    tenantId: 'tenant_demo',
    actorId: 'user_1',
    source: 'UI_Upload',
    aggregateId: id,
    aggregateKind: 'Decision',
    payload: { id, sourceId, targetId, relationship },
    occurredAt: new Date().toISOString(),
    traceContext: { correlationId: 'corr_1', traceId: 't1', spanId: 's1' },
    idempotencyKey: `idem_edge_${id}`,
    classification: 'INTERNAL',
    metadata: {},
  };
}

describe('Subsystem 2: Enterprise Graph Engine & Persistence', () => {
  let graph: EnterpriseGraph;

  beforeEach(async () => {
    graph = EnterpriseGraph.getInstance();
    await graph.initialize();
  });

  it('Test-EG-1: Synchronous Event Projection Update', async () => {
    const objEvt = createMockObjectEvent('pat_100', 'Rajesh Kumar', 'Person', { Condition: 'T2DM' });
    await graph.applyEvent(objEvt);

    const node = await graph.getNode('pat_100');
    expect(node).not.toBeNull();
    expect(node?.name).toBe('Rajesh Kumar');
    expect(node?.properties.Condition).toBe('T2DM');
  });

  it('Test-EG-2: Multi-Hop Traversal API', async () => {
    const n1 = createMockObjectEvent('pat_1', 'Patient', 'Person', {});
    const n2 = createMockObjectEvent('rx_1', 'Prescription', 'Document', {});
    const n3 = createMockObjectEvent('drug_1', 'Metformin', 'System', {});

    await graph.applyEvent(n1);
    await graph.applyEvent(n2);
    await graph.applyEvent(n3);

    const e1 = createMockEdgeEvent('edge_1', 'pat_1', 'rx_1', 'HAS_PRESCRIPTION');
    const e2 = createMockEdgeEvent('edge_2', 'rx_1', 'drug_1', 'PRESCRIBES');

    await graph.applyEvent(e1);
    await graph.applyEvent(e2);

    const paths = graph.traverse('pat_1', 2);
    expect(paths.length).toBeGreaterThanOrEqual(2);
    const targetNodeNames = paths.flatMap(p => p.nodes.map(n => n.name));
    expect(targetNodeNames).toContain('Prescription');
    expect(targetNodeNames).toContain('Metformin');
  });

  it('Test-EG-3: Indexed Property Fast Search', async () => {
    const n = createMockObjectEvent('pat_200', 'Anil Mehta', 'Person', { Condition: 'Hypertension' });
    await graph.applyEvent(n);

    const found = graph.findNodesByProperty('Condition', 'Hypertension');
    expect(found.length).toBe(1);
    expect(found[0].name).toBe('Anil Mehta');
  });

  it('Test-EG-4: Snapshot Export & Import Restoration', async () => {
    const snapshot = graph.exportSnapshot();
    expect(snapshot).toHaveProperty('nodes');
    expect(snapshot).toHaveProperty('edges');

    graph.importSnapshot({ nodes: [], edges: [] });
    expect((await graph.getAllNodes()).length).toBe(0);

    graph.importSnapshot(snapshot);
    expect((await graph.getAllNodes()).length).toBeGreaterThan(0);
  });
});

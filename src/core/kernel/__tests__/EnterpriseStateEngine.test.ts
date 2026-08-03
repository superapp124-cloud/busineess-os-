import { describe, it, expect, beforeEach } from 'vitest';
import { EnterpriseStateEngine, StateConflictError, InvalidStateTransitionError, TransactionContext } from '../EnterpriseStateEngine';

describe('Subsystem 8: Enterprise State Engine & Production Contracts (REQ-STATE-001 to REQ-STATE-010)', () => {
  let engine: EnterpriseStateEngine;

  beforeEach(() => {
    engine = EnterpriseStateEngine.getInstance();
    engine.setRecoveryMode('Normal');
  });

  it('Test 1: Multi-Store Read Model Isolation & State Versioning', () => {
    const entity = engine.setState('enterprise', 'ent_01', { name: 'ALOIS Tech' });
    expect(entity.version).toBe(1);

    const store = engine.getStore('enterprise');
    expect(store.get('ent_01')).toBeDefined();
  });

  it('Test 2: Optimistic Concurrency Control (OCC)', () => {
    engine.setState('enterprise', 'e_occ', { data: 'v1' });

    // Valid OCC update
    engine.setState('enterprise', 'e_occ', { data: 'v2' }, 1);

    // Mismatched version should throw StateConflictError
    expect(() => {
      engine.setState('enterprise', 'e_occ', { data: 'v3' }, 1);
    }).toThrow(StateConflictError);
  });

  it('Test 3: Mission State Transition Guard Validation', () => {
    engine.setState('mission', 'm_flow_1', { status: 'Draft', objective: 'HR Onboarding' });

    // Legal transition: Draft -> Ready
    engine.setState('mission', 'm_flow_1', { status: 'Ready' }, 1);

    // Illegal transition: Ready -> Completed (must go through Approved -> Running)
    expect(() => {
      engine.setState('mission', 'm_flow_1', { status: 'Completed' }, 2);
    }).toThrow(InvalidStateTransitionError);
  });

  it('Test 4: TransactionContext ACID Mutations & Atomic Rollback', () => {
    engine.setState('enterprise', 'item_1', { val: 100 });

    const tx: TransactionContext = {
      id: 'tx_fail_01',
      startedAt: Date.now(),
      user: 'admin',
      correlationId: 'corr_99182',
      changes: [
        { storeName: 'enterprise', id: 'item_1', payload: { val: 200 }, expectedVersion: 1 },
        { storeName: 'enterprise', id: 'item_1', payload: { val: 300 }, expectedVersion: 1 }, // Will fail OCC
      ],
    };

    expect(() => {
      engine.commitTransaction(tx);
    }).toThrow(StateConflictError);

    // Item 1 should remain unchanged at val: 100 (No partial commits)
    expect(engine.getEntity('enterprise', 'item_1')?.val).toBe(100);
  });

  it('Test 5: Concurrent Writes (StateConflictError)', () => {
    engine.setState('enterprise', 'writer_target', { balance: 500 });

    // Writer 1 updates version 1 -> 2
    engine.setState('enterprise', 'writer_target', { balance: 600 }, 1);

    // Writer 2 attempts update with stale version 1
    expect(() => {
      engine.setState('enterprise', 'writer_target', { balance: 700 }, 1);
    }).toThrow(StateConflictError);
  });

  it('Test 6: Replay Determinism (Byte-for-Byte Identical State)', () => {
    const events: any[] = [
      { sequenceNumber: 1, type: 'StateUpdated', payload: { store: 'enterprise', id: 'k1', data: { val: 'A' } } },
      { sequenceNumber: 2, type: 'StateUpdated', payload: { store: 'enterprise', id: 'k2', data: { val: 'B' } } },
    ];

    engine.repairProjection('enterprise', events);
    const hash1 = engine.computeStateHash();

    // Replay exact same ledger again
    engine.repairProjection('enterprise', events);
    const hash2 = engine.computeStateHash();

    expect(hash1).toBe(hash2);
  });

  it('Test 7: Snapshot Integrity & Cryptographic Hash Matching', () => {
    engine.setState('knowledge', 'kn_101', { summary: 'Enterprise Policy v2' });
    const snap = engine.createSnapshot();

    // Mutate state
    engine.setState('knowledge', 'kn_101', { summary: 'Mutated Policy' });

    // Restore snapshot
    engine.restoreSnapshot(snap);
    const restoredHash = engine.computeStateHash();

    expect(restoredHash).toBe(snap.stateHash);
  });

  it('Test 8: Incremental Replay & Projection Repair', () => {
    const events: any[] = [
      { sequenceNumber: 100, type: 'StateUpdated', payload: { store: 'connector', id: 'sys_1', data: { status: 'Healthy' } } },
      { sequenceNumber: 101, type: 'StateUpdated', payload: { store: 'connector', id: 'sys_2', data: { status: 'Degraded' } } },
    ];

    const count = engine.replayAfterSequence('connector', 99, events);
    expect(count).toBe(2);

    const meta = engine.getProjectionMetadata('connector');
    expect(meta?.status).toBe('Healthy');
    expect(meta?.lastSequence).toBe(101);
  });
});

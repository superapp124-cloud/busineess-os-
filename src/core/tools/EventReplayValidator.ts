import crypto from 'crypto';
import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { EnterpriseGraph } from '../kernel/EnterpriseGraph';
import { EnterpriseKnowledgeRuntime } from '../kernel/knowledge/EnterpriseKnowledgeRuntime';

export class EventReplayValidator {
  
  public static async runDeterminismTest() {
    console.log('[EventReplayValidator] Starting Deterministic Replay Test...');
    
    // 1. Get raw event store
    const bus = EnterpriseEventBus.getInstance();
    const eventStore = (bus as any).store || (bus as any).eventStore; // Extracting for test purposes
    if (!eventStore) throw new Error("EventStore not accessible");

    const events = eventStore.replay();
    console.log(`[EventReplayValidator] Found ${events.length} events to replay.`);

    // 2. Hash current state (Run 1)
    const run1Hash = this.hashSystemState();
    console.log(`[EventReplayValidator] Run 1 Hash: ${run1Hash}`);

    // 3. Clear State
    this.clearState();

    // 4. Replay Events (Run 2)
    for (const event of events) {
      await (bus as any).dispatch(event);
    }
    
    // Allow asynchronous projections to settle
    await new Promise(r => setTimeout(r, 500));

    // 5. Hash new state (Run 2)
    const run2Hash = this.hashSystemState();
    console.log(`[EventReplayValidator] Run 2 Hash: ${run2Hash}`);

    if (run1Hash !== run2Hash) {
      console.error(`[EventReplayValidator] FAILED: Runtime is non-deterministic.`);
      throw new Error("Determinism failure. Hashes do not match.");
    }

    console.log(`[EventReplayValidator] PASSED: Runtime is perfectly deterministic.`);
    return true;
  }

  private static hashSystemState(): string {
    const graphDb = (EnterpriseGraph.getInstance() as any).db || DistributedGraphStore.getInstance();
    const knowledge = EnterpriseKnowledgeRuntime.getInstance();

    const graphNodes = (graphDb as any).nodes ? Array.from((graphDb as any).nodes.values()).map((n: any) => n.id).sort() : [];
    const graphEdges = (graphDb as any).edges ? Array.from((graphDb as any).edges).map((e: any) => `${e.sourceId}->${e.targetId}`).sort() : [];
    const knNodes = (knowledge as any).store?.getAll ? (knowledge as any).store.getAll().map((n: any) => n.id).sort() : [];
    
    const stateObj = {
      graphNodes,
      graphEdges,
      knNodes
    };

    return crypto.createHash('sha256').update(JSON.stringify(stateObj)).digest('hex');
  }

  private static clearState() {
    console.log(`[EventReplayValidator] Clearing System State...`);
    const graphDb = (EnterpriseGraph.getInstance() as any).db || DistributedGraphStore.getInstance();
    const knowledge = EnterpriseKnowledgeRuntime.getInstance();
    
    if ((graphDb as any).nodes?.clear) (graphDb as any).nodes.clear();
    if (Array.isArray((graphDb as any).edges)) (graphDb as any).edges.length = 0;
    if ((knowledge as any).store?.knowledgeMap?.clear) (knowledge as any).store.knowledgeMap.clear();
  }
}

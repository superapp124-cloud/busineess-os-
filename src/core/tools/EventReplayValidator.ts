import crypto from 'crypto';
import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { EnterpriseGraph } from '../kernel/EnterpriseGraph';
import { EnterpriseKnowledgeRuntime } from '../kernel/knowledge/EnterpriseKnowledgeRuntime';

export class EventReplayValidator {
  
  public static async runDeterminismTest() {
    console.log('[EventReplayValidator] Starting Deterministic Replay Test...');
    
    // 1. Get raw event store
    const bus = EnterpriseEventBus.getInstance();
    const eventStore = (bus as any).eventStore; // Extracting for test purposes
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
      await bus.publish(event);
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
    const graph = EnterpriseGraph.getInstance();
    const knowledge = EnterpriseKnowledgeRuntime.getInstance();

    const graphNodes = Array.from((graph as any).nodes.values()).map((n:any) => n.id).sort();
    const graphEdges = Array.from((graph as any).edges.values()).map((e:any) => `${e.sourceId}->${e.targetId}`).sort();
    const knNodes = Array.from((knowledge as any).store.knowledgeNodes.values()).map((n:any) => n.id).sort();
    
    const stateObj = {
      graphNodes,
      graphEdges,
      knNodes
    };

    return crypto.createHash('sha256').update(JSON.stringify(stateObj)).digest('hex');
  }

  private static clearState() {
    console.log(`[EventReplayValidator] Clearing System State...`);
    const graph = EnterpriseGraph.getInstance();
    const knowledge = EnterpriseKnowledgeRuntime.getInstance();
    
    (graph as any).nodes.clear();
    (graph as any).edges.clear();
    (knowledge as any).store.knowledgeNodes.clear();
  }
}

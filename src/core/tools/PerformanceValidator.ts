import { EnterpriseEventBus } from '../kernel/EnterpriseEventBus';
import { EnterpriseEvent } from '../../types';

export class PerformanceValidator {
  private static events: EnterpriseEvent[] = [];
  
  public static startTracking() {
    console.log('[PerformanceValidator] Attaching telemetry to EventBus...');
    EnterpriseEventBus.getInstance().subscribe(this.onEvent);
  }

  private static onEvent = (event: EnterpriseEvent) => {
    PerformanceValidator.events.push(event);
  };

  public static generateReport(): boolean {
    let passed = true;
    console.log('\n--- PERFORMANCE VALIDATION REPORT ---');

    // Group by correlationId
    const traces = new Map<string, EnterpriseEvent[]>();
    for (const e of this.events) {
      if (!e.traceContext || !e.traceContext.correlationId) continue;
      const cid = e.traceContext.correlationId;
      if (!traces.has(cid)) traces.set(cid, []);
      traces.get(cid)!.push(e);
    }

    for (const [cid, events] of traces.entries()) {
      console.log(`Trace: ${cid}`);
      
      const artifactObserved = events.find(e => e.type === 'ArtifactObserved');
      const inferenceGen = events.find(e => e.type === 'InferenceGenerated');
      const missionCreated = events.find(e => e.type === 'MissionCreated');
      
      if (artifactObserved && inferenceGen) {
        const delta = new Date(inferenceGen.occurredAt).getTime() - new Date(artifactObserved.occurredAt).getTime();
        console.log(`  Observation -> Inference: ${delta}ms`);
        if (delta > 250) {
          console.error(`  [!] BUDGET EXCEEDED: Hybrid inference budget is <250ms.`);
          passed = false;
        }
      }

      if (inferenceGen && missionCreated) {
        const delta = new Date(missionCreated.occurredAt).getTime() - new Date(inferenceGen.occurredAt).getTime();
        console.log(`  Inference -> Mission: ${delta}ms`);
        if (delta > 50) {
          console.error(`  [!] BUDGET EXCEEDED: Mission Generation budget is <50ms.`);
          passed = false;
        }
      }
    }

    if (!passed) {
      throw new Error("Performance budgets exceeded. See report above.");
    }
    
    console.log('--- END PERFORMANCE REPORT ---\n');
    return passed;
  }
}

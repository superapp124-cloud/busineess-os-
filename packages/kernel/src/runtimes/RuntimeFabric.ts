import { Runtime, RuntimeCategory, RuntimeFeatureSet } from '../types/Runtime';
import { ExecutionContext } from '../types/ExecutionContext';
import { ExecutionResult } from '../types/ExecutionResult';

export class RuntimeFabric {
  private static runtimes: Map<string, Runtime> = new Map();

  public static registerRuntime(runtime: Runtime): void {
    this.runtimes.set(runtime.id, runtime);
    console.log(`[RuntimeFabric] Registered runtime: ${runtime.name} (${runtime.id}) [${runtime.category}]`);
  }

  public static async scoreRuntime(runtime: Runtime, ctx: ExecutionContext): Promise<number> {
    const health = await runtime.health();
    if (!health.healthy) return 0.0;

    let score = 1.0;
    if (runtime.category === 'LOCAL' || runtime.category === 'EMBEDDED') score += 0.5; // Privacy preference
    if (runtime.features.supportsGPU) score += 0.3;
    if (runtime.features.supportsStreaming) score += 0.2;

    return score;
  }

  public static async executeWithFailover<TInput = unknown, TOutput = unknown>(
    capabilityId: string,
    ctx: ExecutionContext,
    input: TInput
  ): Promise<ExecutionResult<TOutput>> {
    console.log(`[RuntimeFabric] Orchestrating execution with failover for capability: ${capabilityId}`);

    const runtimeList = Array.from(this.runtimes.values());
    const scoredRuntimes: { runtime: Runtime; score: number }[] = [];

    for (const runtime of runtimeList) {
      const score = await this.scoreRuntime(runtime, ctx);
      if (score > 0) scoredRuntimes.push({ runtime, score });
    }

    scoredRuntimes.sort((a, b) => b.score - a.score);

    if (scoredRuntimes.length === 0) {
      throw new Error(`[RuntimeFabric] No healthy runtimes available for capability: ${capabilityId}`);
    }

    // Try primary runtime, fail over to secondary if primary throws or fails
    for (const { runtime } of scoredRuntimes) {
      try {
        console.log(`[RuntimeFabric] Attempting execution on primary scored runtime: ${runtime.name} (${runtime.id})`);
        const result = await runtime.execute<TInput, TOutput>(capabilityId, ctx, input);
        if (result.status === 'completed') {
          return result;
        }
        console.warn(`[RuntimeFabric] Primary runtime ${runtime.id} returned status ${result.status}, failing over...`);
      } catch (err: any) {
        console.warn(`[RuntimeFabric] Execution error on ${runtime.id}: ${err.message}, failing over to next runtime...`);
      }
    }

    throw new Error(`[RuntimeFabric] All available runtimes failed for capability: ${capabilityId}`);
  }
}

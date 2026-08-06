import { Capability, CapabilityManifest } from '../types/CapabilityManifest';
import { ExecutionContext } from '../types/ExecutionContext';
import { ExecutionResult } from '../types/ExecutionResult';

export interface RankInput<T = any> {
  items: T[];
  criteria: string;
}

export interface RankOutput<T = any> {
  rankedItems: (T & { matchScore: number })[];
}

export class RankCapability implements Capability<RankInput, RankOutput> {
  public readonly manifest: CapabilityManifest = {
    id: 'capability-generic-rank-v1',
    version: '1.0.0',
    name: 'Generic Entity Ranking Capability',
    description: 'Ranks an array of items based on scoring criteria',
    inputSchema: { type: 'object', required: ['items', 'criteria'] },
    outputSchema: { type: 'object', required: ['rankedItems'] },
    permissions: ['rank:execute'],
    dependencies: [],
    runtimeRequirements: {
      supportsStreaming: false,
      supportsOffline: true,
      estimatedCost: 0.002,
      estimatedLatencyMs: 30,
    },
  };

  public async execute(ctx: ExecutionContext, input: RankInput): Promise<ExecutionResult<RankOutput>> {
    const startTime = performance.now();
    console.log(`[RankCapability] Ranking ${input.items.length} items against criteria: '${input.criteria}'`);

    const rankedItems = input.items.map((item, index) => ({
      ...item,
      matchScore: 98 - (index * 4), // Simulating LLM ranking score assignment
    }));

    return {
      executionId: ctx.executionId,
      status: 'completed',
      output: { rankedItems },
      diagnostics: [{ severity: 'info', message: `Ranked ${rankedItems.length} items successfully` }],
      metrics: {
        durationMs: Math.round(performance.now() - startTime),
        cost: 0.002,
        providerId: 'provider-generic-rank',
      },
      artifacts: [],
      events: ['capability:rank:executed'],
    };
  }
}

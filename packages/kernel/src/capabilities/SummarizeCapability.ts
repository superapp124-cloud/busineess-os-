import { Capability, CapabilityManifest } from '../types/CapabilityManifest';
import { ExecutionContext } from '../types/ExecutionContext';
import { ExecutionResult } from '../types/ExecutionResult';

export interface SummarizeInput<T = any> {
  items: T[];
  format?: 'short' | 'bullet' | 'detailed';
}

export interface SummarizeOutput {
  summary: string;
  itemCount: number;
}

export class SummarizeCapability implements Capability<SummarizeInput, SummarizeOutput> {
  public readonly manifest: CapabilityManifest = {
    id: 'capability-generic-summarize-v1',
    version: '1.0.0',
    name: 'Generic Entity Summarization Capability',
    description: 'Summarizes any list of entities or text blocks',
    inputSchema: { type: 'object', required: ['items'] },
    outputSchema: { type: 'object', required: ['summary', 'itemCount'] },
    permissions: ['summarize:execute'],
    dependencies: [],
    runtimeRequirements: {
      supportsStreaming: true,
      supportsOffline: true,
      estimatedCost: 0.001,
      estimatedLatencyMs: 20,
    },
  };

  public async execute(ctx: ExecutionContext, input: SummarizeInput): Promise<ExecutionResult<SummarizeOutput>> {
    const startTime = performance.now();
    console.log(`[SummarizeCapability] Summarizing ${input.items.length} items...`);

    const summary = `Found ${input.items.length} matching candidates. Top match is ${input.items[0]?.name || 'N/A'} with strong skill relevance.`;

    return {
      executionId: ctx.executionId,
      status: 'completed',
      output: {
        summary,
        itemCount: input.items.length,
      },
      diagnostics: [{ severity: 'info', message: 'Summarized items successfully' }],
      metrics: {
        durationMs: Math.round(performance.now() - startTime),
        cost: 0.001,
        providerId: 'provider-generic-summarize',
      },
      artifacts: [],
      events: ['capability:summarize:executed'],
    };
  }
}

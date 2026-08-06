import { Capability, CapabilityManifest } from '../types/CapabilityManifest';
import { ExecutionContext } from '../types/ExecutionContext';
import { ExecutionResult } from '../types/ExecutionResult';

export interface SearchInput {
  entity: string;
  query: string;
  filters?: Record<string, unknown>;
  limit?: number;
}

export interface SearchOutput<T = unknown> {
  entity: string;
  totalFound: number;
  items: T[];
}

export class SearchCapability implements Capability<SearchInput, SearchOutput> {
  public readonly manifest: CapabilityManifest = {
    id: 'capability-generic-search-v1',
    version: '1.0.0',
    name: 'Generic Entity Search Capability',
    description: 'Searches any Entity (Candidate, Job, Document, Invoice) by query and criteria',
    inputSchema: { type: 'object', required: ['entity', 'query'] },
    outputSchema: { type: 'object', required: ['entity', 'items'] },
    permissions: ['search:execute'],
    dependencies: [],
    runtimeRequirements: {
      supportsStreaming: false,
      supportsOffline: true,
      estimatedCost: 0.001,
      estimatedLatencyMs: 25,
    },
  };

  public async execute(ctx: ExecutionContext, input: SearchInput): Promise<ExecutionResult<SearchOutput>> {
    const startTime = performance.now();
    console.log(`[SearchCapability] Executing generic search for entity: '${input.entity}', query: '${input.query}'`);

    // Mock generic candidate dataset for testing vertical slice
    const rawItems = [
      { id: 'cand_1', name: 'Arjun Sharma', title: 'Senior Java Architect', experienceYears: 7, skills: ['Java', 'Spring', 'Kafka'] },
      { id: 'cand_2', name: 'Priya Patel', title: 'Lead Backend Engineer', experienceYears: 6, skills: ['Java', 'Microservices'] },
      { id: 'cand_3', name: 'Rahul Verma', title: 'Fullstack Engineer', experienceYears: 5, skills: ['Java', 'React'] },
    ];

    const filtered = rawItems.filter(item => 
      item.skills.some(s => s.toLowerCase().includes(input.query.toLowerCase())) ||
      item.title.toLowerCase().includes(input.query.toLowerCase())
    );

    const durationMs = Math.round(performance.now() - startTime);

    return {
      executionId: ctx.executionId,
      status: 'completed',
      output: {
        entity: input.entity,
        totalFound: filtered.length,
        items: filtered,
      },
      diagnostics: [{ severity: 'info', message: `Found ${filtered.length} matching ${input.entity} entities` }],
      metrics: {
        durationMs,
        cost: 0.001,
        providerId: 'provider-generic-search',
      },
      artifacts: [],
      events: ['capability:search:executed'],
    };
  }
}

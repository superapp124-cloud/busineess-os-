import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('planner')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'AI.Plan',
    name: 'Agent Orchestration Planner',
    description: 'Agent orchestration planning',
    inputSchema: { type: 'object', properties: { goal: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { plan: { type: 'object' } } }
  })
  .build();

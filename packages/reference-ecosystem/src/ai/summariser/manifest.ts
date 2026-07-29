import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('summariser')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'AI.Summarise',
    name: 'Summarise Content',
    description: 'Demonstrates AI Execution limits and constraints',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { summary: { type: 'string' } } }
  })
  .build();

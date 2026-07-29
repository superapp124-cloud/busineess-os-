import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('google-workspace')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'GoogleWorkspace.Connect',
    name: 'Connect Google Workspace',
    description: 'Demonstrates Connector Abstraction',
    inputSchema: { type: 'object', properties: {} },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } }
  })
  .build();

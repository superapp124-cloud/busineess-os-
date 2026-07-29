import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('microsoft-365')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'M365.Connect',
    name: 'Connect Microsoft 365',
    description: 'Alternative connector implementation mapping to same interfaces',
    inputSchema: { type: 'object', properties: {} },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } }
  })
  .build();

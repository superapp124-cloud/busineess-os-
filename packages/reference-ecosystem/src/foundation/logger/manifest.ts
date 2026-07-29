import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('logger')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Logger.LogEvent',
    name: 'Log System Event',
    description: 'Emits a structured SystemEvent to the Kernel event bus.',
    inputSchema: { type: 'object', properties: { message: { type: 'string' }, level: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } }
  })
  .build();

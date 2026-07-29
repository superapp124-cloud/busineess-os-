import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('echo')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Echo.Repeat',
    name: 'Repeat Input',
    description: 'Repeats the exact input provided, verifying deterministic I/O mapping.',
    inputSchema: { type: 'object', properties: { payload: { type: 'object' } } },
    outputSchema: { type: 'object', properties: { payload: { type: 'object' } } }
  })
  .build();

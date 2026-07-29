import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('hello-world')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'HelloWorld.SayHello',
    name: 'Say Hello',
    description: 'Returns a simple greeting to verify capability contracts.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { greeting: { type: 'string' } } }
  })
  .build();

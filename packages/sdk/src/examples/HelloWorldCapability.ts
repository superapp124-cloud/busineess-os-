import { CapabilityBuilder } from '../builders/CapabilityBuilder';

export const HelloWorldCapability = new CapabilityBuilder()
  .name('hello-world')
  .version(1, 0, 0)
  .publisher('chatr-examples', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'HelloWorld.SayHello',
    name: 'Say Hello',
    description: 'Returns a friendly greeting',
    inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { greeting: { type: 'string' } } }
  })
  .build();

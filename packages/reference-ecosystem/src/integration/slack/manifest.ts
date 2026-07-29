import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('slack')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Slack.PostMessage',
    name: 'Post Slack Message',
    description: 'Demonstrates Event-driven messaging',
    inputSchema: { type: 'object', properties: { channel: { type: 'string' }, message: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } }
  })
  .build();

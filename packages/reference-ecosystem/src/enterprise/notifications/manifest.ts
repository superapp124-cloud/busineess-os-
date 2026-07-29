import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('notifications')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Enterprise.Notify',
    name: 'Send Notification',
    description: 'Event subscriptions',
    inputSchema: { type: 'object', properties: { message: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } }
  })
  .build();

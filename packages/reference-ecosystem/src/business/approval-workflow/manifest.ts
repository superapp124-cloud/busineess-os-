import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('approval-workflow')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Approval.Request',
    name: 'Request Approval',
    description: 'Demonstrates Human Approval & Policy interception',
    inputSchema: { type: 'object', properties: { resourceId: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { approved: { type: 'boolean' } } }
  })
  .build();

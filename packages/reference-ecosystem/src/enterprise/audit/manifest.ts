import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('audit')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Enterprise.AuditLog',
    name: 'Record Audit Log',
    description: 'Immutable events and enterprise compliance',
    inputSchema: { type: 'object', properties: { action: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } }
  })
  .build();

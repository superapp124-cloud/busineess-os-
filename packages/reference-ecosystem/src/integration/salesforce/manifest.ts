import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('salesforce')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Salesforce.CreateLead',
    name: 'Create Salesforce Lead',
    description: 'External business object mapping',
    inputSchema: { type: 'object', properties: { email: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { leadId: { type: 'string' } } }
  })
  .build();

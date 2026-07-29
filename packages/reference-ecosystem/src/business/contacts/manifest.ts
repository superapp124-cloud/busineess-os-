import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('contacts')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Contacts.Create',
    name: 'Create Contact',
    description: 'Demonstrates CRUD + explicit Schema validation',
    inputSchema: { type: 'object', properties: { email: { type: 'string' }, name: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { contactId: { type: 'string' } } }
  })
  .build();

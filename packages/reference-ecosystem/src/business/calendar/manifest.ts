import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('calendar')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Calendar.CreateMeeting',
    name: 'Create Meeting',
    description: 'Demonstrates Business Object Modelling (Event/Meeting)',
    inputSchema: { type: 'object', properties: { title: { type: 'string' }, startTime: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { meetingId: { type: 'string' } } }
  })
  .build();

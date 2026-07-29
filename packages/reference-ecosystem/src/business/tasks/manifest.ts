import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('tasks')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Tasks.UpdateStatus',
    name: 'Update Task Status',
    description: 'Demonstrates State Transitions (TODO -> IN_PROGRESS -> DONE)',
    inputSchema: { type: 'object', properties: { taskId: { type: 'string' }, status: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } }
  })
  .build();

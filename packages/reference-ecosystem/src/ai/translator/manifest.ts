import { CapabilityBuilder } from '@chatr/sdk';

export const manifest = new CapabilityBuilder()
  .name('translator')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Team')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'AI.Translate',
    name: 'Translate Content',
    description: 'Demonstrates AI Provider abstraction (routing to different LLMs)',
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, targetLang: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { translated: { type: 'string' } } }
  })
  .build();

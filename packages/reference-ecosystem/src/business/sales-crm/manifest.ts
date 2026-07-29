import { CapabilityBuilder } from '@chatr/sdk';

export const salesCrmManifest = new CapabilityBuilder()
  .name('sales-crm')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Core')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Sales.ScoreLead',
    name: 'Score Lead',
    description: 'Evaluates lead fit based on firmographics, engagement history, and budget',
    inputSchema: { type: 'object', properties: { leadId: { type: 'string' }, companySize: { type: 'number' } } },
    outputSchema: { type: 'object', properties: { leadScore: { type: 'number' }, grade: { type: 'string' } } }
  })
  .addAction({
    id: 'Sales.GenerateOutreachSequence',
    name: 'Generate Outreach Sequence',
    description: 'Drafts 5-step personalized email sequence for target account decision makers',
    inputSchema: { type: 'object', properties: { targetRole: { type: 'string' }, valueProp: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { sequenceId: { type: 'string' }, stepCount: { type: 'number' } } }
  })
  .addAction({
    id: 'Sales.AnalyzeDealHealth',
    name: 'Analyze Deal Health',
    description: 'Analyzes deal velocity, decision-maker buy-in, and competitor presence',
    inputSchema: { type: 'object', properties: { dealId: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { winProbability: { type: 'number' }, riskFactors: { type: 'array' } } }
  })
  .build();

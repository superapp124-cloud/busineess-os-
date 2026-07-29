import { CapabilityBuilder } from '@chatr/sdk';

export const legalReviewerManifest = new CapabilityBuilder()
  .name('legal-reviewer')
  .version(1, 0, 0)
  .publisher('lexai', 'LexAI Partners')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Legal.ReviewContract',
    name: 'Review Contract',
    description: 'Parses legal contracts (NDA, MSA, Employment) and categorizes clauses',
    inputSchema: { type: 'object', properties: { documentId: { type: 'string' }, contractType: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { clausesParsed: { type: 'number' }, riskScore: { type: 'number' } } }
  })
  .addAction({
    id: 'Legal.DetectLiabilities',
    name: 'Detect Liabilities',
    description: 'Highlights unlimited liability, indemnity, and non-compete risk clauses',
    inputSchema: { type: 'object', properties: { contractText: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { flaggedClauses: { type: 'array' }, highestSeverity: { type: 'string' } } }
  })
  .addAction({
    id: 'Legal.GenerateRiskReport',
    name: 'Generate Risk Report',
    description: 'Generates a executive risk summary report for legal counsel',
    inputSchema: { type: 'object', properties: { contractId: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { reportId: { type: 'string' }, summary: { type: 'string' } } }
  })
  .build();

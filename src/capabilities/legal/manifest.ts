import { ICapabilityManifest } from '@/sdk/types';

export const LegalOSManifest: ICapabilityManifest = {
  id: 'legal-os',
  name: 'LegalOS',
  displayName: 'LegalOS',
  description: 'Contract management, clause extraction, and legal workflows.',
  department: 'Legal',
  category: 'Operations',
  version: '1.0.0',
  schemaVersion: '2.0.0',
  minimumKernelVersion: '2.0.0',
  maturity: 'L4',
  icon: 'LucideScale',
  rating: 4.8,
  installs: 1,
  tags: ['Legal', 'Contracts', 'Risk', 'Compliance'],
  
  dependencies: {
    connectors: ['docusign', 'email'],
    permissions: ['admin', 'legal', 'executive'],
    kernelServices: ['BrandBrain']
  } as any, // Temporary casting until SDK types fully propagate

  objects: [
    {
      name: 'Contract',
      pluralName: 'Contracts',
      icon: 'LucideFileText',
      titleField: 'title',
      fields: []
    },
    {
      name: 'Case',
      pluralName: 'Cases',
      icon: 'LucideBriefcase',
      titleField: 'title',
      fields: []
    }
  ],

  tools: [
    {
      id: 'summarise_contract',
      name: 'Summarise Contract',
      description: 'Generates a concise legal summary of a long contract highlighting key obligations.',
      inputSchema: { contractId: 'string' },
      outputSchema: { summary: 'string', keyTerms: 'string[]' },
      capabilities: ['legal', 'text_generation', 'analysis'],
      permissions: ['legal', 'executive']
    },
    {
      id: 'extract_clauses',
      name: 'Extract Clauses',
      description: 'Identifies liability, termination, and payment clauses.',
      inputSchema: { contractId: 'string' },
      outputSchema: { clauses: 'object[]' },
      capabilities: ['legal', 'analysis'],
      permissions: ['legal']
    }
  ],

  aiGovernance: {
    risk: 'high',
    approval: 'required',
    audit: true,
    explainability: true
  },

  tables: ['legal_contracts', 'legal_cases'],
  repositories: ['LegalRepository'],
  
  search: {
    objects: [
      { object: 'Contract', fields: ['title', 'party_name'], titleField: 'title' },
      { object: 'Case', fields: ['title', 'description'], titleField: 'title' }
    ]
  },

  views: [],
  dashboards: [],
  reports: [],
  workflows: [],
  automations: [],
  permissions: {},
  notifications: [],
  settings: [],
  integrations: [],
  seed: { objects: [] }
};

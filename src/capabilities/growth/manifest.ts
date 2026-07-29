import { ICapabilityManifest } from '@/sdk/types';

export const GrowthOSManifest: ICapabilityManifest = {
  id: 'growth-os',
  name: 'GrowthOS',
  displayName: 'GrowthOS',
  description: 'AI-driven Growth Operating System and Executive Advisor.',
  department: 'Executive',
  category: 'Core',
  version: '1.0.0',
  schemaVersion: '2.0.0',
  minimumKernelVersion: '2.0.0',
  maturity: 'L5',
  icon: 'LucideTrendingUp',
  rating: 5.0,
  installs: 1,
  tags: ['Growth', 'Marketing', 'Sales', 'Analytics', 'AI', 'Executive'],
  
  dependencies: {
    connectors: ['crm', 'analytics', 'social_media', 'ads'],
    permissions: ['admin', 'executive', 'marketing', 'sales'],
    kernelServices: ['BrandBrain', 'GrowthMemory', 'RecommendationEngine']
  } as any, // Temporary casting until SDK types fully propagate if needed

  objects: [
    {
      name: 'Campaign',
      pluralName: 'Campaigns',
      icon: 'LucideMegaphone',
      titleField: 'name',
      fields: []
    },
    {
      name: 'Audience',
      pluralName: 'Audiences',
      icon: 'LucideUsers',
      titleField: 'name',
      fields: []
    }
  ],

  tools: [
    {
      id: 'generate_campaign',
      name: 'Generate Campaign',
      description: 'Generates a full cross-channel campaign based on a business goal.',
      inputSchema: { goal: 'string', budget: 'number' },
      outputSchema: { planId: 'string', suggestedChannels: 'string[]' },
      capabilities: ['planning', 'marketing', 'strategy'],
      permissions: ['executive', 'marketing']
    },
    {
      id: 'analyze_seo',
      name: 'Analyse SEO',
      description: 'Provides actionable SEO insights based on competitor data.',
      inputSchema: { competitors: 'string[]' },
      outputSchema: { keywords: 'string[]', gaps: 'string[]' },
      capabilities: ['analytics', 'seo', 'strategy'],
      permissions: ['marketing']
    }
  ],

  aiGovernance: {
    risk: 'medium',
    approval: 'recommended',
    audit: true,
    explainability: true
  },

  tables: ['growth_campaigns', 'growth_assets', 'growth_competitors', 'growth_memory'],
  repositories: ['GrowthRepository'],
  
  search: {
    objects: [
      { object: 'Campaign', fields: ['name', 'objective'], titleField: 'name' },
      { object: 'Asset', fields: ['title', 'content'], titleField: 'title' }
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

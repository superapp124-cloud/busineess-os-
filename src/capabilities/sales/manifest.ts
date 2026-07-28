import { CapabilityManifest } from '../../core/sdk/CapabilityManifest';

export const salesManifest: CapabilityManifest = {
  id: 'sales-os',
  name: 'SalesOS',
  version: '1.0.0',
  description: 'AI CRM and Pipeline Management for modern sales teams.',
  icon: 'TrendingUp',
  color: 'emerald',
  category: 'sales',

  permissions: [
    { name: 'gmail.send', description: 'Send follow-ups to leads' },
    { name: 'calendar.read', description: 'Sync meetings with leads' }
  ],

  routes: [
    { path: '/desktop/sales', component: 'SalesWorkspace' }
  ],

  sidebar: {
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/desktop/sales?tab=dashboard' },
      { label: 'Pipeline', icon: 'Columns', path: '/desktop/sales?tab=pipeline' },
      { label: 'Leads', icon: 'Users', path: '/desktop/sales?tab=leads' },
      { label: 'Deals', icon: 'Briefcase', path: '/desktop/sales?tab=deals' }
    ]
  },

  search: {
    entities: ['sales_leads', 'sales_deals']
  },

  workflows: [
    { id: 'auto-followup', name: 'Auto Follow-up', description: 'Send automated follow-up email if no reply in 2 days' },
    { id: 'lead-scoring', name: 'AI Lead Scoring', description: 'Automatically score new leads based on ICP' }
  ],

  notifications: {
    types: ['lead_assigned', 'deal_won', 'deal_lost']
  },

  events: [
    { name: 'lead.created', description: 'Fired when a new lead is added' },
    { name: 'deal.won', description: 'Fired when a deal is closed won' }
  ],

  handlers: [
    { event: 'marketing.campaign.completed', handler: 'importCampaignLeads' }
  ],

  deploySteps: [
    { label: 'Creating sales workspace', detail: 'Setting up isolated CRM' },
    { label: 'Installing sales database', detail: 'sales_leads, sales_deals' },
    { label: 'Configuring AI agent', detail: 'Seeding ICP templates' }
  ],

  tables: [
    'sales_leads',
    'sales_deals',
    'sales_activities'
  ],
  
  seedFunction: 'seedSalesOS'
};

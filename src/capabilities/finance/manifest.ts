import { CapabilityManifest } from '../../core/sdk/CapabilityManifest';

export const financeManifest: CapabilityManifest = {
  id: 'finance-os',
  name: 'FinanceOS',
  version: '1.0.0',
  description: 'Accounting, expenses, and invoicing for business operations.',
  icon: 'Landmark',
  color: 'amber',
  category: 'finance',

  permissions: [
    { name: 'gmail.read', description: 'Read incoming invoices' },
    { name: 'gmail.send', description: 'Send invoices to clients' }
  ],

  routes: [
    { path: '/desktop/finance', component: 'FinanceWorkspace' }
  ],

  sidebar: {
    items: [
      { label: 'Overview', icon: 'PieChart', path: '/desktop/finance?tab=overview' },
      { label: 'General Ledger', icon: 'BookOpen', path: '/desktop/finance?tab=gl' },
      { label: 'Chart of Accounts', icon: 'List', path: '/desktop/finance?tab=coa' },
      { label: 'Journal Entries', icon: 'FileText', path: '/desktop/finance?tab=journal' },
      { label: 'Invoices (AR)', icon: 'FileText', path: '/desktop/finance?tab=invoices' },
      { label: 'Bills (AP)', icon: 'Receipt', path: '/desktop/finance?tab=bills' }
    ]
  },

  search: {
    entities: ['fin_journal_entries', 'fin_accounts', 'fin_events']
  },

  workflows: [
    { id: 'auto-invoice-reminder', name: 'Auto Invoice Reminder', description: 'Send reminder emails for overdue invoices' },
    { id: 'expense-auto-categorize', name: 'AI Expense Categorization', description: 'Automatically categorize new expenses using AI' },
    { id: 'fin-period-close', name: 'Month-End Close Checklist', description: 'Orchestrate period closing with audit controls' }
  ],

  notifications: {
    types: ['invoice_paid', 'expense_approved', 'period_closed', 'journal_entry_approval_required']
  },

  events: [
    { name: 'finance.journal_entry.posted', description: 'Fired when a journal entry is posted to the General Ledger' },
    { name: 'finance.period.closed', description: 'Fired when an accounting period is closed' },
    { name: 'finance.period.reopened', description: 'Fired when an accounting period is reopened' },
    { name: 'invoice.created', description: 'Fired when a new invoice is generated' },
    { name: 'invoice.paid', description: 'Fired when an invoice is marked as paid' },
    { name: 'expense.submitted', description: 'Fired when a new expense is submitted' }
  ],

  handlers: [
    { event: 'deal.won', handler: 'generateInvoiceFromDeal' },
    { event: 'candidate.hired', handler: 'initiatePayrollSetup' }
  ],

  deploySteps: [
    { label: 'Creating financial organization', detail: 'Configuring IFRS/US GAAP settings & multi-currency' },
    { label: 'Installing financial core schema', detail: 'fin_accounts, fin_journal_entries, fin_ledger_balances' },
    { label: 'Seeding standard Chart of Accounts', detail: 'Default asset, liability, equity, revenue, expense tree' }
  ],

  tables: [
    'fin_organizations',
    'fin_legal_entities',
    'fin_accounts',
    'fin_periods',
    'fin_events',
    'fin_accounting_policies',
    'fin_account_mappings',
    'fin_fx_rates',
    'fin_journal_entries',
    'fin_journal_lines'
  ],
  
  seedFunction: 'seed_default_chart_of_accounts'
};

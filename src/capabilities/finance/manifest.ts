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
      { label: 'Invoices', icon: 'FileText', path: '/desktop/finance?tab=invoices' },
      { label: 'Expenses', icon: 'Receipt', path: '/desktop/finance?tab=expenses' },
      { label: 'Payroll', icon: 'Users', path: '/desktop/finance?tab=payroll' }
    ]
  },

  search: {
    entities: ['finance_invoices', 'finance_expenses']
  },

  workflows: [
    { id: 'auto-invoice-reminder', name: 'Auto Invoice Reminder', description: 'Send reminder emails for overdue invoices' },
    { id: 'expense-auto-categorize', name: 'AI Expense Categorization', description: 'Automatically categorize new expenses using AI' }
  ],

  notifications: {
    types: ['invoice_paid', 'expense_approved', 'payroll_run']
  },

  events: [
    { name: 'invoice.created', description: 'Fired when a new invoice is generated' },
    { name: 'invoice.paid', description: 'Fired when an invoice is marked as paid' },
    { name: 'expense.submitted', description: 'Fired when a new expense is submitted' }
  ],

  handlers: [
    { event: 'deal.won', handler: 'generateInvoiceFromDeal' },
    { event: 'candidate.hired', handler: 'initiatePayrollSetup' }
  ],

  deploySteps: [
    { label: 'Creating finance workspace', detail: 'Setting up secure financial environment' },
    { label: 'Installing accounting database', detail: 'finance_invoices, finance_expenses' },
    { label: 'Configuring AI rules', detail: 'Seeding categorization rules' }
  ],

  tables: [
    'finance_invoices',
    'finance_expenses',
    'finance_payroll'
  ],
  
  seedFunction: 'seedFinanceOS'
};

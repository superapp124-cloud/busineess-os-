export const FinanceKnowledgePack = {
  id: 'pack_finance',
  domain: 'Finance OS',
  version: '1.0.0',
  policies: [
    {
      id: 'finance-expense-1.0',
      name: 'Employee Tax Policy v2.1',
      rules: [
        'Rent receipts up to ₹50,000 are eligible for HRA exemption under Section 10(13A).',
        'Valid PAN of landlord required for receipts > ₹100,000.'
      ]
    }
  ],
  entities: [
    { type: 'ExpenseClaim', fields: ['amount', 'date', 'payee', 'category'] }
  ]
};

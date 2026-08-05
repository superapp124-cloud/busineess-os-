/**
 * Resume Intelligence OS v3.0 — Finance Ontology
 */
import type { OntologyModule } from './registry';

export const financeOntology: OntologyModule = {
  id: 'finance', displayName: 'Finance & Accounting', version: '1.0.0',
  entries: [
    { canonical: 'Financial Modelling', aliases: ['Financial Modeling', 'Financial Model', 'DCF Model', 'LBO Model'], parentCategory: 'Finance', grandparentCategory: 'Financial Services', skillType: 'TechnicalSkill', taxonomy: ['Finance', 'Analysis', 'Financial Modelling'] },
    { canonical: 'Investment Banking', aliases: ['IB', 'Capital Markets', 'IBD'], parentCategory: 'Banking', grandparentCategory: 'Financial Services', skillType: 'DomainSkill', taxonomy: ['Financial Services', 'Banking', 'Investment Banking'] },
    { canonical: 'Risk Management', aliases: ['Credit Risk', 'Market Risk', 'Operational Risk', 'Risk Analytics'], parentCategory: 'Finance', grandparentCategory: 'Financial Services', skillType: 'DomainSkill', taxonomy: ['Finance', 'Risk', 'Risk Management'] },
    { canonical: 'Bloomberg Terminal', aliases: ['Bloomberg', 'Bloomberg Professional'], parentCategory: 'Finance Tool', grandparentCategory: 'Finance', skillType: 'ToolSkill', taxonomy: ['Finance', 'Tools', 'Bloomberg'] },
    { canonical: 'Financial Accounting', aliases: ['Accounting', 'General Ledger', 'GL', 'Bookkeeping'], parentCategory: 'Accounting', grandparentCategory: 'Finance', skillType: 'DomainSkill', taxonomy: ['Finance', 'Accounting', 'Financial Accounting'] },
    { canonical: 'IFRS', aliases: ['International Financial Reporting Standards', 'IFRS Reporting'], parentCategory: 'Accounting Standards', grandparentCategory: 'Finance', skillType: 'DomainSkill', taxonomy: ['Finance', 'Accounting', 'Standards', 'IFRS'] },
    { canonical: 'Ind AS', aliases: ['Indian Accounting Standards', 'IndAS'], parentCategory: 'Accounting Standards', grandparentCategory: 'Finance', skillType: 'DomainSkill', taxonomy: ['Finance', 'Accounting', 'Standards', 'Ind AS'] },
    { canonical: 'Treasury Management', aliases: ['Cash Management', 'Liquidity Management', 'Treasury'], parentCategory: 'Finance', grandparentCategory: 'Financial Services', skillType: 'DomainSkill', taxonomy: ['Finance', 'Treasury', 'Cash Management'] },
    { canonical: 'Tally', aliases: ['Tally ERP', 'Tally Prime', 'Tally Accounting'], parentCategory: 'Accounting Software', grandparentCategory: 'Finance', skillType: 'ToolSkill', taxonomy: ['Finance', 'Tools', 'Tally'] },
    { canonical: 'P&L Management', aliases: ['Profit and Loss', 'PnL', 'Revenue Management', 'Budget Management'], parentCategory: 'Finance', grandparentCategory: 'Business', skillType: 'DomainSkill', taxonomy: ['Business', 'Finance', 'P&L'] },
  ],
};

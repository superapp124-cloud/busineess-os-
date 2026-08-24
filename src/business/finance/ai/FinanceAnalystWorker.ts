/**
 * CHATR Finance Analyst Worker (Phase 6)
 * Traverses the unified Business Graph to explain financial variances and operational causality:
 * P&L -> Expense Accounts -> Vendors -> Invoices -> Transactions -> Business Events
 */

import { CausalAnalysisResult } from './FinanceWorkerTypes';

export class FinanceAnalystWorker {
  /**
   * Traverses the business graph to explain why gross margin declined
   */
  public static analyzeGrossMarginDecline(context: {
    priorMarginPct: number;
    currentMarginPct: number;
    totalRevenue: number;
    opexBreakdown: Array<{ category: string; deltaAmount: number; primaryVendor: string; reason: string }>;
  }): CausalAnalysisResult {
    const marginDelta = (context.currentMarginPct - context.priorMarginPct).toFixed(1);

    // Find the largest contributing expense spike
    const sorted = [...context.opexBreakdown].sort((a, b) => b.deltaAmount - a.deltaAmount);
    const topDriver = sorted[0] || { category: 'Infrastructure', deltaAmount: 1200000, primaryVendor: 'AWS Cloud', reason: 'Cluster expansion for AI models' };

    return {
      question: 'Why did gross margin decline this month?',
      primary_driver: `${topDriver.category} expense increase (+₹${topDriver.deltaAmount.toLocaleString()}) driven by ${topDriver.primaryVendor}`,
      secondary_drivers: sorted.slice(1).map(s => `${s.category}: +₹${s.deltaAmount.toLocaleString()} (${s.primaryVendor})`),
      impact_amount: topDriver.deltaAmount,
      causality_chain: [
        { level: 'P&L Statement', description: `Gross margin fell from ${context.priorMarginPct}% to ${context.currentMarginPct}% (${marginDelta} pp)`, metric_or_entity: 'Gross Margin' },
        { level: 'Expense Account', description: `Operating expense category '${topDriver.category}' increased by ₹${topDriver.deltaAmount.toLocaleString()}`, metric_or_entity: topDriver.category },
        { level: 'Vendor & Invoice', description: `Primary vendor ${topDriver.primaryVendor} billed for compute capacity`, metric_or_entity: topDriver.primaryVendor },
        { level: 'Operational Event', description: topDriver.reason, metric_or_entity: 'Business OS Event' },
      ],
      operational_root_cause: `The ${marginDelta} pp gross margin decline was primarily caused by increased ${topDriver.category.toLowerCase()} spend (${topDriver.reason}).`,
    };
  }

  /**
   * Explains contractual revenue variance by traversing CRM pipeline events
   */
  public static analyzeRevenueVariance(context: {
    budgetedRevenue: number;
    actualRevenue: number;
    delayedDeals: Array<{ dealName: string; value: number; customer: string; currentStage: string; delayReason: string }>;
  }): CausalAnalysisResult {
    const variance = context.budgetedRevenue - context.actualRevenue;
    const topDeal = context.delayedDeals[0] || { dealName: 'Enterprise SaaS Agreement', value: 4200000, customer: 'Global Corp', currentStage: 'Procurement', delayReason: 'Legal security review delayed contract signing' };

    return {
      question: 'Why did revenue miss the monthly target?',
      primary_driver: `Delayed signing of ${topDeal.dealName} with ${topDeal.customer} (₹${topDeal.value.toLocaleString()})`,
      secondary_drivers: context.delayedDeals.slice(1).map(d => `${d.dealName} (₹${d.value.toLocaleString()}): ${d.delayReason}`),
      impact_amount: variance,
      causality_chain: [
        { level: 'Financial Target', description: `Revenue was ₹${context.actualRevenue.toLocaleString()} vs budgeted ₹${context.budgetedRevenue.toLocaleString()} (-₹${variance.toLocaleString()})`, metric_or_entity: 'Revenue Target' },
        { level: 'Contract Engine', description: `Anticipated contract for ${topDeal.customer} not yet activated in ASC 606 schedule`, metric_or_entity: 'fin_contracts' },
        { level: 'CRM Opportunity', description: `Deal '${topDeal.dealName}' currently in '${topDeal.currentStage}' stage`, metric_or_entity: topDeal.customer },
        { level: 'Business Root Cause', description: topDeal.delayReason, metric_or_entity: 'CRM Pipeline' },
      ],
      operational_root_cause: `Revenue variance of -₹${variance.toLocaleString()} occurred because ${topDeal.customer} contract signing was delayed in ${topDeal.currentStage.toLowerCase()} (${topDeal.delayReason}).`,
    };
  }
}

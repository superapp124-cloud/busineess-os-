/**
 * CHATR CFO Briefing & Narrative Synthesis Engine (Phase 5)
 * Synthesizes closed accounting periods into executive financial narratives.
 */

export interface FinancialMetrics {
  period_name: string;
  current_revenue: number;
  prior_revenue: number;
  operating_expenses: number;
  net_income: number;
  gross_margin_pct: number;
  cash_balance: number;
  runway_months: number;
  ar_overdue_60d: number;
}

export class CFONarrativeEngine {
  /**
   * Generates executive CFO financial briefing narrative with drill-down highlights
   */
  public static generateBriefing(metrics: FinancialMetrics): {
    headline: string;
    narrative_paragraphs: string[];
    risk_alerts: string[];
  } {
    const revGrowth = metrics.prior_revenue > 0
      ? (((metrics.current_revenue - metrics.prior_revenue) / metrics.prior_revenue) * 100).toFixed(1)
      : '0.0';

    const isGrowing = Number(revGrowth) >= 0;

    const headline = `${metrics.period_name} Executive Financial Brief: Revenue ${isGrowing ? 'up' : 'down'} ${Math.abs(Number(revGrowth))}% MoM, Net Margin at ${metrics.gross_margin_pct}%`;

    const narrative_paragraphs = [
      `Revenue for ${metrics.period_name} totaled ₹${metrics.current_revenue.toLocaleString()}, representing a ${revGrowth}% ${isGrowing ? 'increase' : 'decrease'} against the prior period. Net income achieved ₹${metrics.net_income.toLocaleString()} with operating expenses at ₹${metrics.operating_expenses.toLocaleString()}.`,
      `Cash liquidity stands at ₹${metrics.cash_balance.toLocaleString()}, providing approximately ${metrics.runway_months.toFixed(1)} months of operational runway under the current burn trajectory.`,
    ];

    const risk_alerts: string[] = [];
    if (metrics.ar_overdue_60d > 0) {
      risk_alerts.push(`Aging Alert: ₹${metrics.ar_overdue_60d.toLocaleString()} of AR is past 60 days overdue and requires collection escalation.`);
    }
    if (metrics.runway_months < 6) {
      risk_alerts.push(`Liquidity Warning: Cash runway is below 6 months (${metrics.runway_months.toFixed(1)} months).`);
    }

    return {
      headline,
      narrative_paragraphs,
      risk_alerts,
    };
  }
}

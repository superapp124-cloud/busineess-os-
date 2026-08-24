/**
 * CHATR Cash Intelligence & Forecasting Engine (Phase 4)
 * Synthesizes Actual Cash (reconciled bank balances), Expected Cash (AR receivables + contracts),
 * and Expected Outflows (AP bills) into a 90-day predictive liquidity forecast.
 */

export interface CashForecastHorizon {
  period_label: 'Day 1-30' | 'Day 31-60' | 'Day 61-90';
  expected_inflows: number;
  expected_outflows: number;
  net_cash_flow: number;
  projected_cash_position: number;
}

export interface CashIntelligenceReport {
  actual_cash_balance: number;
  total_ar_inflows_90d: number;
  total_contract_inflows_90d: number;
  total_ap_outflows_90d: number;
  horizons: CashForecastHorizon[];
  liquidity_runway_days: number;
  calculated_at: string;
}

export class CashIntelligenceEngine {
  /**
   * Generates a 90-day predictive cash forecast across the unified business graph
   */
  public static calculateForecast(
    actualCash: number,
    invoices: Array<{ amount_due: number; due_date: string }>,
    contractSchedules: Array<{ scheduled_amount: number; scheduled_date: string }>,
    bills: Array<{ amount_due: number; due_date: string }>,
    asOfDate: string = new Date().toISOString().substring(0, 10)
  ): CashIntelligenceReport {
    const asOfTime = new Date(asOfDate).getTime();

    function getDaysDiff(dateStr: string): number {
      const t = new Date(dateStr).getTime();
      return Math.floor((t - asOfTime) / (1000 * 60 * 60 * 24));
    }

    let ar30 = 0, ar60 = 0, ar90 = 0;
    let ctr30 = 0, ctr60 = 0, ctr90 = 0;
    let ap30 = 0, ap60 = 0, ap90 = 0;

    // 1. Invoices
    invoices.forEach(inv => {
      const days = getDaysDiff(inv.due_date);
      if (days <= 30) ar30 += inv.amount_due;
      else if (days <= 60) ar60 += inv.amount_due;
      else if (days <= 90) ar90 += inv.amount_due;
    });

    // 2. Contract Releases
    contractSchedules.forEach(sched => {
      const days = getDaysDiff(sched.scheduled_date);
      if (days <= 30) ctr30 += sched.scheduled_amount;
      else if (days <= 60) ctr60 += sched.scheduled_amount;
      else if (days <= 90) ctr90 += sched.scheduled_amount;
    });

    // 3. AP Bills
    bills.forEach(bill => {
      const days = getDaysDiff(bill.due_date);
      if (days <= 30) ap30 += bill.amount_due;
      else if (days <= 60) ap60 += bill.amount_due;
      else if (days <= 90) ap90 += bill.amount_due;
    });

    // Compute horizons
    const inflows30 = ar30 + ctr30;
    const net30 = inflows30 - ap30;
    const pos30 = actualCash + net30;

    const inflows60 = ar60 + ctr60;
    const net60 = inflows60 - ap60;
    const pos60 = pos30 + net60;

    const inflows90 = ar90 + ctr90;
    const net90 = inflows90 - ap90;
    const pos90 = pos60 + net90;

    const totalInflows = inflows30 + inflows60 + inflows90;
    const totalOutflows = ap30 + ap60 + ap90;

    // Estimate runway (assuming avg monthly burn = totalOutflows / 3)
    const monthlyBurn = totalOutflows > 0 ? totalOutflows / 3 : 10000;
    const runwayDays = Math.round((actualCash / monthlyBurn) * 30);

    return {
      actual_cash_balance: Math.round(actualCash * 100) / 100,
      total_ar_inflows_90d: Math.round((ar30 + ar60 + ar90) * 100) / 100,
      total_contract_inflows_90d: Math.round((ctr30 + ctr60 + ctr90) * 100) / 100,
      total_ap_outflows_90d: Math.round(totalOutflows * 100) / 100,
      horizons: [
        {
          period_label: 'Day 1-30',
          expected_inflows: Math.round(inflows30 * 100) / 100,
          expected_outflows: Math.round(ap30 * 100) / 100,
          net_cash_flow: Math.round(net30 * 100) / 100,
          projected_cash_position: Math.round(pos30 * 100) / 100,
        },
        {
          period_label: 'Day 31-60',
          expected_inflows: Math.round(inflows60 * 100) / 100,
          expected_outflows: Math.round(ap60 * 100) / 100,
          net_cash_flow: Math.round(net60 * 100) / 100,
          projected_cash_position: Math.round(pos60 * 100) / 100,
        },
        {
          period_label: 'Day 61-90',
          expected_inflows: Math.round(inflows90 * 100) / 100,
          expected_outflows: Math.round(ap90 * 100) / 100,
          net_cash_flow: Math.round(net90 * 100) / 100,
          projected_cash_position: Math.round(pos90 * 100) / 100,
        },
      ],
      liquidity_runway_days: runwayDays,
      calculated_at: new Date().toISOString(),
    };
  }
}

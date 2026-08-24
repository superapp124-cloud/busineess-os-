/**
 * CHATR Scenario Comparison Matrix Engine (Phase 9)
 * Evaluates multiple strategic hypotheses simultaneously across revenue, cash, burn, and runway horizons.
 */

export interface ScenarioMatrixItem {
  id: string;
  name: string;
  headcountDelta: number;
  revenue: number;
  cash: number;
  monthlyBurn: number;
  runwayMonths: number;
  feasibility: 'HIGH' | 'MODERATE' | 'CRITICAL' | 'UNSUSTAINABLE';
  keyAssumptions: string;
}

export class ScenarioMatrixEngine {
  /**
   * Generates a comparative matrix of scenarios given current financial baselines
   */
  public static generateComparisonMatrix(baseline: {
    revenue: number;
    cash: number;
    monthlyBurn: number;
    avgSalaryPerHire: number;
    overheadPct: number;
  }): ScenarioMatrixItem[] {
    const costPerHire = baseline.avgSalaryPerHire * (1 + baseline.overheadPct / 100);

    return [
      {
        id: 'baseline',
        name: 'Current Baseline (0 Hires)',
        headcountDelta: 0,
        revenue: baseline.revenue,
        cash: baseline.cash,
        monthlyBurn: baseline.monthlyBurn,
        runwayMonths: Math.round((baseline.cash / baseline.monthlyBurn) * 10) / 10,
        feasibility: 'HIGH',
        keyAssumptions: 'Status quo operations, current pipeline trajectory',
      },
      {
        id: 'hire_20',
        name: 'Conservative Growth (+20 Hires)',
        headcountDelta: 20,
        revenue: baseline.revenue + 4000000,
        cash: baseline.cash,
        monthlyBurn: baseline.monthlyBurn + (20 * costPerHire),
        runwayMonths: Math.round((baseline.cash / (baseline.monthlyBurn + (20 * costPerHire))) * 10) / 10,
        feasibility: 'HIGH',
        keyAssumptions: 'Hiring completed over 60 days, modest revenue addition (+₹40L/mo)',
      },
      {
        id: 'hire_30',
        name: 'Moderate Expansion (+30 Hires)',
        headcountDelta: 30,
        revenue: baseline.revenue + 7500000,
        cash: baseline.cash,
        monthlyBurn: baseline.monthlyBurn + (30 * costPerHire),
        runwayMonths: Math.round((baseline.cash / (baseline.monthlyBurn + (30 * costPerHire))) * 10) / 10,
        feasibility: 'MODERATE',
        keyAssumptions: 'Requires collecting ₹40L overdue receivables within 45 days',
      },
      {
        id: 'hire_50',
        name: 'Aggressive Scale (+50 Hires)',
        headcountDelta: 50,
        revenue: baseline.revenue + 15000000,
        cash: baseline.cash,
        monthlyBurn: baseline.monthlyBurn + (50 * costPerHire),
        runwayMonths: Math.round((baseline.cash / (baseline.monthlyBurn + (50 * costPerHire))) * 10) / 10,
        feasibility: 'CRITICAL',
        keyAssumptions: 'Requires 4 operational levers: AR collections, Q3 pipeline close, burn cuts',
      },
      {
        id: 'stress_50',
        name: 'Stress Test (+50 Hires & -20% Revenue)',
        headcountDelta: 50,
        revenue: baseline.revenue * 0.8,
        cash: baseline.cash * 0.9,
        monthlyBurn: baseline.monthlyBurn + (50 * costPerHire),
        runwayMonths: Math.round(((baseline.cash * 0.9) / (baseline.monthlyBurn + (50 * costPerHire))) * 10) / 10,
        feasibility: 'UNSUSTAINABLE',
        keyAssumptions: 'Top-line drops 20% while 50 hires are onboarded; urgent capital buffer needed',
      },
    ];
  }
}

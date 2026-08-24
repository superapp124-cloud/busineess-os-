/**
 * CHATR Strategic Scenario Simulator (Phase 7)
 * Simulates major business decisions (e.g. "Can we afford to hire 30 engineers?")
 * across payroll ramp, tax, AR collection probabilities, and multi-scenario runway horizons.
 */

export interface ScenarioSimulationResult {
  decision_query: string;
  monthly_burn_increase: number;
  current_cash: number;
  current_runway_months: number;
  scenarios: {
    expected_case: {
      new_runway_months: number;
      is_feasible: boolean;
      conditions: string[];
    };
    stress_case: {
      new_runway_months: number;
      is_feasible: boolean;
      risk_factors: string[];
    };
    best_case: {
      new_runway_months: number;
    };
  };
  executive_recommendation: string;
}

export class StrategicScenarioSimulator {
  /**
   * Simulates the financial impact of hiring N new engineers
   */
  public static simulateHiringPlan(context: {
    newHiresCount: number;
    avgSalaryPerMonth: number;
    benefitsOverheadPct: number; // e.g. 20%
    currentCash: number;
    currentMonthlyBurn: number;
    arOverdueRiskAmount: number;
    delayedContractMonthlyRevenue: number;
  }): ScenarioSimulationResult {
    const rawSalary = context.newHiresCount * context.avgSalaryPerMonth;
    const totalNewBurn = Math.round(rawSalary * (1 + context.benefitsOverheadPct / 100));

    const currentRunway = Math.round((context.currentCash / context.currentMonthlyBurn) * 10) / 10;

    // Expected case: burn increases, delayed contracts start on time
    const expectedBurn = context.currentMonthlyBurn + totalNewBurn - (context.delayedContractMonthlyRevenue * 0.7);
    const expectedRunway = Math.round((context.currentCash / Math.max(1, expectedBurn)) * 10) / 10;

    // Stress case: burn increases, AR overdue is delayed further, delayed contract slips 90 days
    const stressCash = Math.max(0, context.currentCash - context.arOverdueRiskAmount);
    const stressBurn = context.currentMonthlyBurn + totalNewBurn;
    const stressRunway = Math.round((stressCash / Math.max(1, stressBurn)) * 10) / 10;

    // Best case
    const bestBurn = context.currentMonthlyBurn + totalNewBurn - context.delayedContractMonthlyRevenue;
    const bestRunway = Math.round((context.currentCash / Math.max(1, bestBurn)) * 10) / 10;

    const isFeasibleExpected = expectedRunway >= 6.0;

    const executive_recommendation = isFeasibleExpected
      ? `Hiring ${context.newHiresCount} engineers increases monthly burn by ₹${totalNewBurn.toLocaleString()}. Expected runway falls from ${currentRunway} to ${expectedRunway} months (stress case: ${stressRunway} months). Feasible if receivables are collected as scheduled.`
      : `Caution: Hiring ${context.newHiresCount} engineers reduces runway to ${expectedRunway} months (below the 6-month safety threshold). Recommend staggering hiring over 2 quarters.`;

    return {
      decision_query: `Can we afford to hire ${context.newHiresCount} engineers?`,
      monthly_burn_increase: totalNewBurn,
      current_cash: context.currentCash,
      current_runway_months: currentRunway,
      scenarios: {
        expected_case: {
          new_runway_months: expectedRunway,
          is_feasible: isFeasibleExpected,
          conditions: [
            `Overdue AR of ₹${context.arOverdueRiskAmount.toLocaleString()} is collected within 45 days`,
            `Pipeline contract contributes ₹${context.delayedContractMonthlyRevenue.toLocaleString()}/mo starting next quarter`,
          ],
        },
        stress_case: {
          new_runway_months: stressRunway,
          is_feasible: stressRunway >= 4.0,
          risk_factors: [
            `Overdue AR defaults or delays past 90 days`,
            `Pipeline deal slips by 1 quarter`,
          ],
        },
        best_case: {
          new_runway_months: bestRunway,
        },
      },
      executive_recommendation,
    };
  }
}

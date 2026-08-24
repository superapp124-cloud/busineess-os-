/**
 * CHATR Reverse Scenario Solver (Phase 8)
 * Inverse financial optimization engine:
 * 1. "Target runway >= 6 months -> How many people can we afford to hire?"
 * 2. "We want 50 hires -> What operational conditions must happen to afford it?"
 */

export interface MaxAffordableHiringResult {
  target_runway_months: number;
  max_affordable_hires: number;
  monthly_salary_per_hire: number;
  max_incremental_monthly_burn: number;
  current_cash: number;
  current_monthly_burn: number;
  projected_runway_with_hires: number;
  rationale: string;
}

export interface TargetHiringRequirementsResult {
  target_hires: number;
  monthly_incremental_cost: number;
  current_shortfall_amount: number;
  operational_requirements: Array<{
    category: 'AR_COLLECTIONS' | 'PIPELINE_CLOSURE' | 'BURN_REDUCTION' | 'CAPEX_DELAY' | 'RAMP_DELAY';
    action: string;
    financial_contribution: number;
    impact_description: string;
  }>;
  executive_summary: string;
}

export class ReverseScenarioSolver {
  /**
   * Solves for maximum sustainable headcount given a minimum runway constraint
   */
  public static solveMaxAffordableHeadcount(context: {
    targetRunwayMonths: number;
    currentCash: number;
    currentMonthlyBurn: number;
    avgSalaryPerMonth: number;
    overheadPct: number; // e.g. 20%
  }): MaxAffordableHiringResult {
    // Max allowable monthly burn = Current Cash / Target Runway
    const maxAllowableBurn = context.currentCash / context.targetRunwayMonths;
    const availableIncrementalBurn = Math.max(0, maxAllowableBurn - context.currentMonthlyBurn);

    const costPerHire = context.avgSalaryPerMonth * (1 + context.overheadPct / 100);
    const maxHires = Math.floor(availableIncrementalBurn / costPerHire);

    const resultingBurn = context.currentMonthlyBurn + (maxHires * costPerHire);
    const projectedRunway = Math.round((context.currentCash / resultingBurn) * 10) / 10;

    return {
      target_runway_months: context.targetRunwayMonths,
      max_affordable_hires: maxHires,
      monthly_salary_per_hire: context.avgSalaryPerMonth,
      max_incremental_monthly_burn: Math.round(maxHires * costPerHire),
      current_cash: context.currentCash,
      current_monthly_burn: context.currentMonthlyBurn,
      projected_runway_with_hires: projectedRunway,
      rationale: `To maintain a minimum ${context.targetRunwayMonths}-month runway (₹${context.currentCash.toLocaleString()} cash), you can sustainably hire up to ${maxHires} engineers (+₹${Math.round(maxHires * costPerHire).toLocaleString()}/mo burn).`,
    };
  }

  /**
   * Solves for what operational conditions must occur to afford a target headcount (e.g. 50 hires)
   */
  public static solveRequirementsForTargetHires(context: {
    targetHires: number;
    avgSalaryPerMonth: number;
    overheadPct: number;
    targetRunwayMonths: number;
    currentCash: number;
    currentMonthlyBurn: number;
    overdueAR: number;
    activePipelineValue: number;
  }): TargetHiringRequirementsResult {
    const costPerHire = context.avgSalaryPerMonth * (1 + context.overheadPct / 100);
    const totalIncrementalBurn = context.targetHires * costPerHire;
    const requiredTotalBurn = context.currentMonthlyBurn + totalIncrementalBurn;
    const requiredCapital = requiredTotalBurn * context.targetRunwayMonths;
    const shortfall = Math.max(0, requiredCapital - context.currentCash);

    const reqs: TargetHiringRequirementsResult['operational_requirements'] = [
      {
        category: 'AR_COLLECTIONS',
        action: `Collect ₹${(context.overdueAR * 0.85).toLocaleString()} of overdue receivables`,
        financial_contribution: Math.round(context.overdueAR * 0.85),
        impact_description: 'Accelerate collections via executive outreach',
      },
      {
        category: 'PIPELINE_CLOSURE',
        action: `Close ₹${(context.activePipelineValue * 0.4).toLocaleString()} of pipeline deals by Q3`,
        financial_contribution: Math.round(context.activePipelineValue * 0.4),
        impact_description: 'Adds contracted recurring monthly cash inflows',
      },
      {
        category: 'BURN_REDUCTION',
        action: 'Optimize cloud infrastructure and SaaS seats (₹7,00,000/mo savings)',
        financial_contribution: 700000 * context.targetRunwayMonths,
        impact_description: 'Reduces baseline operating cash burn',
      },
      {
        category: 'RAMP_DELAY',
        action: 'Stagger hiring in 2 tranches: 25 hires in Month 1, 25 hires in Month 4',
        financial_contribution: Math.round(totalIncrementalBurn * 1.5),
        impact_description: 'Preserves upfront runway cash buffer',
      },
    ];

    return {
      target_hires: context.targetHires,
      monthly_incremental_cost: totalIncrementalBurn,
      current_shortfall_amount: shortfall,
      operational_requirements: reqs,
      executive_summary: `Hiring ${context.targetHires} engineers (+₹${totalIncrementalBurn.toLocaleString()}/mo) requires a capital gap of ₹${shortfall.toLocaleString()} to sustain a ${context.targetRunwayMonths}-month runway. Feasible by executing the 4 structured operational levers.`,
    };
  }
}

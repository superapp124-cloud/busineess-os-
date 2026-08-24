/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 9: Parallel Finance Pilot & Continuous Financial Intelligence Test Suite
 */

import { ParallelPilotReconciler } from '../../business/finance/pilot/ParallelPilotReconciler';
import { ScenarioMatrixEngine } from '../../business/finance/simulation/ScenarioMatrixEngine';
import { ContinuousFinanceEngine } from '../../business/finance/monitoring/ContinuousFinanceEngine';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

console.log('\n🧪 Running CHATR Finance Phase 9 (Parallel Pilot & Continuous Finance) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. 10-DIMENSION PARALLEL PILOT RECONCILIATION
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. 10-Dimension Parallel Pilot Reconciliation ---');

test('ParallelPilotReconciler: certifies 100% match across all 10 financial dimensions', () => {
  const chatrData = {
    revenue: 62100000,
    ar: 21400000,
    ap: 13700000,
    cash: 48200000,
    tax: 4500000,
    deferred_revenue: 55500000,
    pnl_net_income: 30900000,
    bs_assets: 185000000,
    cf_ending_cash: 48200000,
    close_pct: 97,
  };

  const report = ParallelPilotReconciler.reconcilePilotData(
    'Acme Technologies Pvt Ltd',
    'August 2026',
    chatrData,
    chatrData // Exactly matches legacy system
  );

  assertEqual(report.overallStatus, 'CERTIFIED_MATCH', 'Pilot achieves CERTIFIED_MATCH');
  assertEqual(report.comparisons.length, 10, '10 financial dimensions compared');
  report.comparisons.forEach(c => {
    assertEqual(c.status, 'MATCH', `${c.dimension} matches`);
    assertEqual(c.varianceAmount, 0, `${c.dimension} has zero variance`);
  });
});

test('ParallelPilotReconciler: detects and flags discrepancy when revenue diverges from legacy ERP', () => {
  const chatrData = {
    revenue: 62100000,
    ar: 21400000,
    ap: 13700000,
    cash: 48200000,
    tax: 4500000,
    deferred_revenue: 55500000,
    pnl_net_income: 30900000,
    bs_assets: 185000000,
    cf_ending_cash: 48200000,
    close_pct: 97,
  };

  const legacyWithDiscrepancy = {
    ...chatrData,
    revenue: 58000000, // ₹41L discrepancy in legacy!
  };

  const report = ParallelPilotReconciler.reconcilePilotData(
    'Acme Technologies Pvt Ltd',
    'August 2026',
    chatrData,
    legacyWithDiscrepancy
  );

  assertEqual(report.overallStatus, 'INVESTIGATION_REQUIRED', 'Flags INVESTIGATION_REQUIRED');
  const revComp = report.comparisons.find(c => c.dimension.includes('Revenue'))!;
  assertEqual(revComp.status, 'DISCREPANCY', 'Revenue dimension flagged as DISCREPANCY');
});

// ══════════════════════════════════════════════════════════════════════
// 2. SCENARIO COMPARISON MATRIX
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. Scenario Comparison Matrix Engine ---');

test('ScenarioMatrixEngine: computes 5 distinct scaling and stress scenarios side-by-side', () => {
  const matrix = ScenarioMatrixEngine.generateComparisonMatrix({
    revenue: 62100000,
    cash: 48200000,
    monthlyBurn: 3500000,
    avgSalaryPerHire: 200000,
    overheadPct: 20,
  });

  assertEqual(matrix.length, 5, '5 scenarios generated (Current, +20, +30, +50, Stress)');

  const base = matrix.find(s => s.id === 'baseline')!;
  assertEqual(base.runwayMonths, 13.8, 'Baseline runway is 13.8 mo');

  const hire20 = matrix.find(s => s.id === 'hire_20')!;
  assertEqual(hire20.headcountDelta, 20, '+20 hires');
  assert(hire20.runwayMonths < base.runwayMonths, 'Runway contracts with headcount');

  const stress = matrix.find(s => s.id === 'stress_50')!;
  assertEqual(stress.feasibility, 'UNSUSTAINABLE', 'Stress case flagged as UNSUSTAINABLE');
});

// ══════════════════════════════════════════════════════════════════════
// 3. CONTINUOUS INTRAMONTH FINANCIAL MONITORING
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. Continuous Intramonth Monitoring & Early Alerts ---');

test('ContinuousFinanceEngine: triggers early OPEX run-rate warning on Day 17 of the month', () => {
  const alerts = ContinuousFinanceEngine.evaluateIntramonthRisks(17, {
    billedMtd: 50000000,
    collectedMtd: 12000000, // < 30% collected
    expectedCollectionsRemaining: 38000000,
    projectedOpexMtd: 32000000, // ₹3.2 Cr spent out of ₹4 Cr budget on Day 17 (80% spent!)
    budgetedMonthlyOpex: 40000000,
    unreconciledBankTxnCount: 8, // > 5 unreconciled txns
  });

  assertEqual(alerts.length, 3, '3 proactive intramonth alerts generated');

  const opexAlert = alerts.find(a => a.alertType === 'OPEX_RUN_RATE_WARNING')!;
  assertEqual(opexAlert.severity, 'HIGH', 'High severity OPEX alert');
  assert(opexAlert.title.includes('Day 17'), 'Includes Day 17 context');

  const cashAlert = alerts.find(a => a.alertType === 'COLLECTION_PROBABILITY_DECAY')!;
  assertEqual(cashAlert.severity, 'HIGH', 'High severity collection velocity alert');

  const reconAlert = alerts.find(a => a.alertType === 'RECONCILIATION_LAG')!;
  assertEqual(reconAlert.severity, 'MEDIUM', 'Medium severity reconciliation lag alert');
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 9 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 9 Parallel Pilot & Continuous Finance tests passed!\n');
}

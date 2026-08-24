/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 8: Live Finance OS, 6-Golden-Ledgers & Command Center Test Suite
 */

import { GoldenLedgerSuite, GoldenBenchmarkProfile } from '../../business/finance/testing/GoldenLedgerSuite';
import { ReverseScenarioSolver } from '../../business/finance/simulation/ReverseScenarioSolver';
import { HistoricalMigrationEngine, HistoricalOpeningLine } from '../../business/finance/migration/HistoricalMigrationEngine';

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

console.log('\n🧪 Running CHATR Finance Phase 8 (Live Finance OS & 6 Golden Ledgers) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. 6 GOLDEN LEDGERS REGRESSION BENCHMARKS
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. 6-Golden-Ledgers Continuous Regression Suite ---');

test('GoldenLedgerSuite: verifies all 6 canonical business archetypes with zero drift', () => {
  const canonicals = GoldenLedgerSuite.getAllGoldenProfiles();
  assertEqual(canonicals.length, 6, '6 canonical Golden Ledgers loaded (A to F)');

  // Run regression comparison against canonicals
  const check = GoldenLedgerSuite.runRegressionCheck(canonicals);
  assertEqual(check.passed, 6, 'All 6 Golden Ledgers pass regression');
  assertEqual(check.failed, 0, 'Zero regression violations');
});

// ══════════════════════════════════════════════════════════════════════
// 2. REVERSE SCENARIO SOLVER ("WHAT CAN WE AFFORD?")
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. Reverse Scenario Solver ---');

test('ReverseScenarioSolver: solves maximum sustainable headcount for a target 6-month runway', () => {
  const result = ReverseScenarioSolver.solveMaxAffordableHeadcount({
    targetRunwayMonths: 6,
    currentCash: 48500000,       // ₹4.85 Cr
    currentMonthlyBurn: 3500000, // ₹35L
    avgSalaryPerMonth: 200000,   // ₹2L
    overheadPct: 20,             // 20% benefits -> ₹2.4L/hire
  });

  // Max burn allowed = ₹4.85 Cr / 6 = ₹80.83L
  // Available incremental = ₹80.83L - ₹35L = ₹45.83L
  // Max hires = floor(₹45.83L / ₹2.4L) = 19 hires
  assertEqual(result.max_affordable_hires, 19, 'Solves exactly 19 affordable hires');
  assert(result.projected_runway_with_hires >= 6.0, 'Resulting runway meets or exceeds 6 months');
});

test('ReverseScenarioSolver: calculates exact 4 operational requirements needed to afford 50 hires', () => {
  const result = ReverseScenarioSolver.solveRequirementsForTargetHires({
    targetHires: 50,
    avgSalaryPerMonth: 200000,
    overheadPct: 20,
    targetRunwayMonths: 6,
    currentCash: 48500000,
    currentMonthlyBurn: 3500000,
    overdueAR: 4800000,
    activePipelineValue: 27500000,
  });

  assertEqual(result.target_hires, 50, 'Models 50 hires target');
  assertEqual(result.operational_requirements.length, 4, '4 structured operational requirements generated');
  assert(result.current_shortfall_amount > 0, 'Calculates capital shortfall accurately');
});

// ══════════════════════════════════════════════════════════════════════
// 3. HISTORICAL TRIAL BALANCE MIGRATION & CUT-OVER
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. Historical Migration Engine ---');

test('HistoricalMigrationEngine: ingests balanced legacy trial balance and computes retained earnings', () => {
  const lines: HistoricalOpeningLine[] = [
    { account_code: '1010', account_name: 'HDFC Bank Operating', account_type: 'ASSET', debit_amount: 50000000, credit_amount: 0 },
    { account_code: '1110', account_name: 'Accounts Receivable', account_type: 'ASSET', debit_amount: 20000000, credit_amount: 0 },
    { account_code: '2010', account_name: 'Accounts Payable', account_type: 'LIABILITY', debit_amount: 0, credit_amount: 15000000 },
    { account_code: '3010', account_name: 'Share Capital', account_type: 'EQUITY', debit_amount: 0, credit_amount: 30000000 },
    { account_code: '3020', account_name: 'Retained Earnings', account_type: 'EQUITY', debit_amount: 0, credit_amount: 25000000 },
  ];

  const migration = HistoricalMigrationEngine.validateOpeningTrialBalance('2026-04-01', lines);
  assert(migration.is_valid, 'Trial balance is valid and balanced');
  assertEqual(migration.total_debits, 70000000, 'Debits = ₹7.0 Cr');
  assertEqual(migration.total_credits, 70000000, 'Credits = ₹7.0 Cr');
});

test('HistoricalMigrationEngine: detects and rejects unbalanced legacy trial balance', () => {
  const lines: HistoricalOpeningLine[] = [
    { account_code: '1010', account_name: 'Bank', account_type: 'ASSET', debit_amount: 50000000, credit_amount: 0 },
    { account_code: '2010', account_name: 'AP', account_type: 'LIABILITY', debit_amount: 0, credit_amount: 40000000 }, // Off by ₹1 Cr!
  ];

  const migration = HistoricalMigrationEngine.validateOpeningTrialBalance('2026-04-01', lines);
  assert(!migration.is_valid, 'Unbalanced trial balance rejected');
  assert(migration.validation_errors.length > 0, 'Reports trial balance imbalance error');
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 8 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 8 Live Finance OS & 6 Golden Ledgers tests passed!\n');
}

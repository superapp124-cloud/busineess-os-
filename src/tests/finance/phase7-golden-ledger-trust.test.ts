/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 7: Golden Ledger, Financial Trust & Strategic Simulation Test Suite
 */

import { GoldenLedger, GoldenLedgerBenchmark } from '../../business/finance/testing/GoldenLedger';
import { FinancialSafetyEvaluator } from '../../business/finance/ai/FinancialSafetyEvaluator';
import { StrategicScenarioSimulator } from '../../business/finance/ai/StrategicScenarioSimulator';
import { FinancialAuditTrail } from '../../business/finance/audit/FinancialAuditTrail';

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

console.log('\n🧪 Running CHATR Finance Phase 7 (Golden Ledger & Financial Trust) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. GOLDEN LEDGER BENCHMARK VERIFICATION
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. 90-Day Full-Cycle Golden Ledger Benchmark ---');

test('GoldenLedger: 90-day simulation output exactly matches canonical reference with 0 drift', () => {
  const simulatedActual: GoldenLedgerBenchmark = {
    period_days: 90,
    expected_gross_contract_value: 7200000,
    expected_invoiced_amount: 7200000,
    expected_recognized_revenue_90d: 1650000,
    expected_deferred_revenue_ending: 5550000,
    expected_total_opex_90d: 9450000,
    expected_net_income_90d: 705000,
    expected_ending_cash_balance: 5850000,
    expected_ar_outstanding: 1800000,
    expected_ap_outstanding: 450000,
    expected_gross_margin_pct: 42.73,
  };

  const verify = GoldenLedger.verifyAgainstGoldenLedger(simulatedActual);
  assert(verify.passes, 'Simulation matches Golden Ledger');
  assertEqual(verify.driftDetails.length, 0, 'Zero drift across all accounting metrics');
});

// ══════════════════════════════════════════════════════════════════════
// 2. AI FINANCIAL SAFETY & DECEPTIVE TRAP EVALUATION
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. AI Financial Safety & Deceptive Trap Resistance ---');

test('FinancialSafetyEvaluator: rejects deceptive revenue growth trap when cash conversion is failing', () => {
  const evalRes = FinancialSafetyEvaluator.evaluateGrowthTrapQuery({
    revenueGrowthPct: 30, // Up 30% top-line!
    arIncreasePct: 45,    // AR surging!
    cashDeclinePct: 22,   // Cash collapsing!
    daysSalesOutstanding: 74,
  });

  assert(evalRes.trap_detected, 'AI correctly identifies deceptive growth trap');
  assert(evalRes.reasoning.includes('Revenue growth is not translating into cash collections'), 'Explains cash conversion failure');
});

test('FinancialSafetyEvaluator: blocks autonomous bad debt write-off and enforces HITL approval', () => {
  const evalRes = FinancialSafetyEvaluator.evaluateUnauthorizedWriteOffRequest(2500000);

  assert(evalRes.unauthorized_execution_blocked, 'Autonomous write-off is strictly blocked');
  assert(evalRes.reasoning.includes('queued for CFO human approval'), 'Queues proposal for human sign-off');
});

// ══════════════════════════════════════════════════════════════════════
// 3. STRATEGIC DECISION SCENARIO SIMULATOR
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. Strategic Hiring & Multi-Scenario Runway Simulation ---');

test('StrategicScenarioSimulator: accurately models hiring 30 engineers across Expected and Stress cases', () => {
  const sim = StrategicScenarioSimulator.simulateHiringPlan({
    newHiresCount: 30,
    avgSalaryPerMonth: 200000,
    benefitsOverheadPct: 20,
    currentCash: 48500000,
    currentMonthlyBurn: 3500000,
    arOverdueRiskAmount: 1800000,
    delayedContractMonthlyRevenue: 1000000,
  });

  // 30 * ₹2,00,000 * 1.20 = ₹72,00,000/mo
  assertEqual(sim.monthly_burn_increase, 7200000, 'Burn increase is ₹72,00,000/mo');
  assertEqual(sim.current_runway_months, 13.9, 'Current runway is 13.9 months');
  assert(sim.scenarios.expected_case.new_runway_months > 0, 'Computes expected runway');
  assert(sim.scenarios.stress_case.new_runway_months > 0, 'Computes stress case runway');
  assert(sim.executive_recommendation.length > 20, 'Generates executive recommendation');
});

// ══════════════════════════════════════════════════════════════════════
// 4. IMMUTABLE HUMAN APPROVAL AUDIT TRAIL
// ══════════════════════════════════════════════════════════════════════
console.log('--- 4. Immutable Human Approval Audit Trail ---');

test('FinancialAuditTrail: preserves complete 11-field compliance audit record for high-risk action', () => {
  const record = FinancialAuditTrail.createAuditRecord({
    actorId: 'usr_cfo_001',
    actionName: 'APPROVE_BAD_DEBT_WRITEOFF',
    reason: 'Customer Nexus Corp entered insolvency proceedings',
    objectType: 'fin_invoices',
    objectId: 'inv_nexus_991',
    aiRecommendation: 'Write off balance to Bad Debt Expense (5340)',
    aiConfidence: 0.98,
    policyVersion: 2,
    approverId: 'usr_cfo_001',
    finalAction: 'POSTED_TO_GL',
  });

  assertEqual(record.what, 'APPROVE_BAD_DEBT_WRITEOFF', 'Action captured');
  assertEqual(record.ai_confidence, 0.98, 'AI confidence preserved');
  assertEqual(record.policy_version, 2, 'Policy version 2 captured');
  assertEqual(record.final_action, 'POSTED_TO_GL', 'Final action captured');
  assert(record.id.startsWith('audit_'), 'Valid audit ID format');
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 7 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 7 Golden Ledger & Financial Trust tests passed!\n');
}

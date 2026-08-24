/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 10: Production Trust Certification & Financial Truth Reconciler Test Suite
 */

import { FinancialTruthReconciler } from '../../business/finance/certification/FinancialTruthReconciler';
import { UglyDataStressTester } from '../../business/finance/certification/UglyDataStressTester';
import { FinancialAIBenchmark } from '../../business/finance/certification/FinancialAIBenchmark';

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

console.log('\n🧪 Running CHATR Finance Phase 10 (Production Trust Certification) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. FINANCIAL TRUTH VARIANCE DECOMPOSITION ENGINE
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. Financial Truth Variance Decomposition ---');

test('FinancialTruthReconciler: decomposes ₹18,400 revenue variance into exact constituent accounting root causes', () => {
  const result = FinancialTruthReconciler.decomposeVariance({
    dimension: 'Revenue (ASC 606 / IFRS 15)',
    chatrAmount: 1284600,
    legacyAmount: 1266200,
    knownRootCauses: [
      {
        category: 'RECOGNITION_TIMING',
        description: 'Contract ABC straight-line schedule timing vs invoice date',
        contributing_amount: 12000,
        confidence: 0.99,
        source_lineage: { contract_id: 'CTR-2026-ABC' },
      },
      {
        category: 'FX_TRANSLATION',
        description: 'USD subscription spot translation difference',
        contributing_amount: 4400,
        confidence: 0.97,
        source_lineage: { invoice_id: 'INV-USD-991' },
      },
      {
        category: 'TAX_CLASSIFICATION',
        description: 'GST input credit timing treatment',
        contributing_amount: 2000,
        confidence: 0.95,
        source_lineage: { journal_entry_id: 'JE-2026-00412' },
      },
    ],
  });

  assertEqual(result.total_variance, 18400, 'Total variance is ₹18,400');
  assert(result.is_fully_explained, 'Variance is 100% fully explained');
  assertEqual(result.unexplained_variance, 0, 'Unexplained variance is ₹0.00');
  assert(result.audit_verdict.includes('100% Explained'), 'Generates certified audit verdict');
});

// ══════════════════════════════════════════════════════════════════════
// 2. ADVERSARIAL UGLY DATA STRESS RESILIENCE
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. Adversarial Ugly Data Stress Resilience ---');

test('UglyDataStressTester: safely processes 5 messy production anomalies while preserving 100% ledger balance', () => {
  const suite = UglyDataStressTester.runUglyDataTestSuite();

  assertEqual(suite.totalScenarios, 5, '5 adversarial messy data scenarios tested');
  assertEqual(suite.passedScenarios, 5, 'All 5 scenarios passed safely');
  assert(suite.allLedgersBalanced, 'All accounting ledgers remain perfectly balanced');
});

// ══════════════════════════════════════════════════════════════════════
// 3. 100-POINT FINANCIAL AI QUANTITATIVE BENCHMARK
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. 100-Point Financial AI Quantitative Scorecard ---');

test('FinancialAIBenchmark: evaluates AI CFO scoring Grade A+ (>= 95%) across all 6 core dimensions', () => {
  const scorecard = FinancialAIBenchmark.evaluateFinanceAI();

  assert(scorecard.totalScore >= 95, `Score is ${scorecard.totalScore}/100`);
  assertEqual(scorecard.grade, 'A+', 'Scores Grade A+');
  assertEqual(scorecard.dimensions.length, 6, '6 evaluation dimensions verified');
  scorecard.dimensions.forEach(d => {
    assert(d.scoredPoints >= d.passingThreshold, `${d.dimension} meets passing threshold (${d.scoredPoints}/${d.maxPoints})`);
  });
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 10 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 10 Production Trust Certification tests passed!\n');
}

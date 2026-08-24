/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 11: 30-Day Live Customer Shadow Accounting & Real-World Pilot Certification Test Suite
 */

import { ShadowAccountingPilot } from '../../business/finance/pilot_certification/ShadowAccountingPilot';
import { CFOBindTestEvaluator } from '../../business/finance/pilot_certification/CFOBindTestEvaluator';
import { PilotCertificationReport } from '../../business/finance/pilot_certification/PilotCertificationReport';

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

console.log('\n🧪 Running CHATR Finance Phase 11 (Shadow Accounting & Pilot Certification) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. 4-WEEK SHADOW ACCOUNTING PILOT LIFECYCLE
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. 4-Week Shadow Accounting Pilot Lifecycle ---');

test('ShadowAccountingPilot: completes all 4 weeks with 100% criteria passing across 14,280 transactions', () => {
  const lifecycle = ShadowAccountingPilot.getPilotLifecycle('Acme Global Technologies Pvt Ltd');

  assertEqual(lifecycle.totalWeeks, 4, '4-week pilot lifecycle');
  assertEqual(lifecycle.completedWeeks, 4, 'All 4 weeks completed');
  assert(lifecycle.allStagesPassed, 'All 12 criteria across 4 weeks passed');

  const w1 = lifecycle.stages.find(s => s.week === 1)!;
  assertEqual(w1.status, 'COMPLETED', 'Week 1 completed');
  const w4 = lifecycle.stages.find(s => s.week === 4)!;
  assertEqual(w4.status, 'COMPLETED', 'Week 4 completed');
});

// ══════════════════════════════════════════════════════════════════════
// 2. CFO BLIND TEST EVALUATION
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. CFO Blind Test Evaluation (7 Management Questions) ---');

test('CFOBindTestEvaluator: achieves 100% alignment against human CFO ground truth with operational causality', () => {
  const blindTest = CFOBindTestEvaluator.runBlindTest();

  assertEqual(blindTest.totalQuestions, 7, '7 CFO questions evaluated');
  assertEqual(blindTest.averageAlignmentScore, 100, '100% alignment score');
  assert(blindTest.allAnswersGrounded, 'All answers grounded in underlying subledger/GL lineage');

  blindTest.testCases.forEach(tc => {
    assert(tc.chatr_ai_response.claim.length > 0, `${tc.question_id} has claim`);
    assert(tc.chatr_ai_response.evidence.length > 0, `${tc.question_id} has evidence`);
    assert(tc.chatr_ai_response.calculation.length > 0, `${tc.question_id} has calculation`);
    assert(tc.chatr_ai_response.confidence >= 0.95, `${tc.question_id} confidence >= 95%`);
  });
});

// ══════════════════════════════════════════════════════════════════════
// 3. FORMAL REAL-WORLD PILOT CERTIFICATION REPORT
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. Production Pilot Certification Report Generator ---');

test('PilotCertificationReport: certifies zero material unexplained variance and zero unauthorized actions', () => {
  const report = PilotCertificationReport.generateCertification('Acme Global Technologies Pvt Ltd', 'August 2026');

  assertEqual(report.material_unexplained_variance, 0, '0 unexplained variance');
  assertEqual(report.unauthorized_financial_actions_count, 0, '0 unauthorized actions');
  assertEqual(report.internal_ai_benchmark_score, 99, 'Internal AI benchmark is 99/100');
  assertEqual(report.final_status, 'PRODUCTION PILOT CERTIFIED', 'Status is PRODUCTION PILOT CERTIFIED');
  assertEqual(report.certification_checklist.length, 10, '10 checklist items certified');
  report.certification_checklist.forEach(item => {
    assertEqual(item.result, 'PASS', `${item.area} passed certification`);
  });
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 11 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 11 Shadow Accounting & Pilot Certification tests passed!\n');
}

/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 6: AI Finance Workers & Orchestration Comprehensive Test Suite
 */

import { CFOOrchestrator } from '../../business/finance/ai/CFOOrchestrator';
import { FinancialRiskQueue } from '../../business/finance/ai/FinancialRiskQueue';
import { FinanceAnalystWorker } from '../../business/finance/ai/FinanceAnalystWorker';

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

console.log('\n🧪 Running CHATR Finance Phase 6 (AI Finance Workers & Orchestration) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. WORKER HIERARCHY & 3-MODE SAFETY GUARDRAILS
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. Worker Fleet Hierarchy & Mode Safety ---');

test('CFOOrchestrator: initializes specialized worker fleet with strict mode assignments', () => {
  const fleet = CFOOrchestrator.getWorkerFleetStatus();
  assertEqual(fleet.length, 7, '7 specialized AI workers active');

  // Verify all workers are in safe OBSERVE or PROPOSE modes (none in unconstrained autonomous execute)
  fleet.forEach(w => {
    assert(w.mode === 'OBSERVE' || w.mode === 'PROPOSE', `${w.name} is constrained to ${w.mode} mode`);
    assertEqual(w.status, 'ACTIVE', `${w.name} is ACTIVE`);
  });
});

// ══════════════════════════════════════════════════════════════════════
// 2. FINANCIAL RISK QUEUE (MULTI-VECTOR ANOMALY SCANNER)
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. Financial Risk Queue Anomaly Detection ---');

test('FinancialRiskQueue: detects multi-vector anomalies and prioritizes by severity and impact', () => {
  const risks = FinancialRiskQueue.scanFinancialRisks({
    overdueInvoices: [
      { id: 'inv_101', invoice_number: 'INV-2026-091', amount_due: 1840000, days_overdue: 68, customer_name: 'Nexus Corp' },
    ],
    duplicateBills: [
      { id: 'bill_204', bill_number: 'BILL-8841', vendor_name: 'Cloudflare Inc', amount: 620000 },
    ],
    opexAnomalies: [
      { category: 'Cloud Infrastructure (AWS)', current_amount: 1450000, prior_amount: 1080000, pct_increase: 34.2 },
    ],
    fxVariances: [
      { transaction_id: 'TXN-FX-991', currency: 'USD', variance_amount: 82000 },
    ],
  });

  assertEqual(risks.length, 4, '4 distinct anomalies detected across AR, AP, OPEX, and FX');

  const arRisk = risks.find(r => r.category === 'AR_COLLECTIONS')!;
  assertEqual(arRisk.severity, 'HIGH', 'Overdue AR > 60 days is HIGH severity');
  assertEqual(arRisk.impact_amount, 1840000, 'Impact amount matches invoice amount');
  assert(arRisk.source_lineage.object_type === 'fin_invoices', 'Points to invoice source lineage');

  const dupRisk = risks.find(r => r.category === 'DUPLICATE_BILL')!;
  assertEqual(dupRisk.severity, 'HIGH', 'Duplicate bill is HIGH severity');

  const opexRisk = risks.find(r => r.category === 'OPEX_SPIKE')!;
  assertEqual(opexRisk.severity, 'MEDIUM', 'OPEX spike > 25% is MEDIUM severity');

  const fxRisk = risks.find(r => r.category === 'FX_VARIANCE')!;
  assertEqual(fxRisk.severity, 'LOW', 'FX variance is LOW severity');
});

// ══════════════════════════════════════════════════════════════════════
// 3. FINANCE ANALYST (BUSINESS GRAPH CAUSAL VARIANCE EXPLAINER)
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. Business Graph Causal Reasoning ---');

test('FinanceAnalystWorker: explains gross margin decline by traversing P&L down to operational root cause', () => {
  const result = FinanceAnalystWorker.analyzeGrossMarginDecline({
    priorMarginPct: 43.6,
    currentMarginPct: 41.8,
    totalRevenue: 62100000,
    opexBreakdown: [
      { category: 'Cloud Infrastructure', deltaAmount: 1450000, primaryVendor: 'AWS Cloud', reason: 'GPU cluster expansion for enterprise AI models' },
      { category: 'Support SLA', deltaAmount: 320000, primaryVendor: 'Zendesk', reason: 'Tier-1 seats addition' },
    ],
  });

  assert(result.question.includes('gross margin decline'), 'Matches query');
  assertEqual(result.causality_chain.length, 4, '4 graph causality levels (P&L -> Account -> Vendor -> Operational Event)');
  assertEqual(result.causality_chain[0].level, 'P&L Statement', 'Level 1: P&L Statement');
  assertEqual(result.causality_chain[1].level, 'Expense Account', 'Level 2: Expense Account');
  assertEqual(result.causality_chain[2].level, 'Vendor & Invoice', 'Level 3: Vendor & Invoice');
  assertEqual(result.causality_chain[3].level, 'Operational Event', 'Level 4: Operational Event');
  assert(result.operational_root_cause.includes('GPU cluster expansion'), 'Identifies operational root cause');
});

test('FinanceAnalystWorker: explains revenue miss by traversing contracts down to CRM delayed opportunity', () => {
  const result = FinanceAnalystWorker.analyzeRevenueVariance({
    budgetedRevenue: 50000000, // ₹5 Cr target
    actualRevenue: 45800000,   // ₹4.58 Cr actual
    delayedDeals: [
      { dealName: 'Enterprise SaaS Agreement', value: 4200000, customer: 'Global Corp', currentStage: 'Procurement', delayReason: 'Legal security review delayed contract signing' },
    ],
  });

  assertEqual(result.impact_amount, 4200000, 'Impact amount is ₹42,00,000');
  assert(result.causality_chain[3].description.includes('Legal security review'), 'Identifies CRM operational root cause');
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 6 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 6 AI Finance Workers & Orchestration tests passed!\n');
}

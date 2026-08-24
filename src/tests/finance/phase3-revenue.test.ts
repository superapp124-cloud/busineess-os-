/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 3: Revenue Intelligence & Contract Accounting Test Suite (ASC 606 / IFRS 15)
 */

import { RevenueEngine } from '../../business/finance/revenue/RevenueEngine';
import { ContractAIInterpreter } from '../../business/finance/revenue/ContractAIInterpreter';
import { RevenueIntegrityMonitor } from '../../business/finance/revenue/RevenueIntegrityMonitor';

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

console.log('\n🧪 Running CHATR Finance Phase 3 (Revenue Intelligence) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. TRANSACTION PRICE ALLOCATION (ASC 606 Step 4)
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. Standalone Selling Price (SSP) Allocation ---');

test('RevenueEngine: allocates transaction price proportionally across 3 distinct obligations', () => {
  const contractValue = 1200000; // ₹12,00,000 contract
  const obligations = [
    {
      title: 'SaaS Software License',
      standalone_selling_price: 800000,
      recognition_method: 'STRAIGHT_LINE' as const,
      start_date: '2026-08-01',
      end_date: '2027-07-31',
      revenue_account_id: 'acc_4130_saas',
      deferred_rev_account_id: 'acc_2131_def_rev',
    },
    {
      title: 'Implementation & Configuration',
      standalone_selling_price: 200000,
      recognition_method: 'MILESTONE' as const,
      start_date: '2026-08-01',
      end_date: '2026-10-31',
      revenue_account_id: 'acc_4150_services',
      deferred_rev_account_id: 'acc_2132_def_services',
    },
    {
      title: 'Support SLA',
      standalone_selling_price: 200000,
      recognition_method: 'STRAIGHT_LINE' as const,
      start_date: '2026-08-01',
      end_date: '2027-07-31',
      revenue_account_id: 'acc_4120_support',
      deferred_rev_account_id: 'acc_2131_def_rev',
    },
  ];

  const allocated = RevenueEngine.allocateTransactionPrice(contractValue, obligations);
  assertEqual(allocated.length, 3, '3 obligations allocated');

  const totalAllocated = allocated.reduce((s, o) => s + o.allocated_price, 0);
  assertEqual(totalAllocated, 1200000, 'Sum of allocated prices equals contract transaction price exactly');
  assertEqual(allocated[0].allocated_price, 800000, 'Software = ₹8,00,000');
  assertEqual(allocated[1].allocated_price, 200000, 'Implementation = ₹2,00,000');
  assertEqual(allocated[2].allocated_price, 200000, 'Support = ₹2,00,000');
});

test('RevenueEngine: handles fractional cents rounding absorption on the final obligation', () => {
  const contractValue = 100000; // ₹1,00,000 split across 3 equal obligations
  const obligations = [
    { title: 'Item 1', standalone_selling_price: 100, recognition_method: 'STRAIGHT_LINE' as const, start_date: '2026-01-01', end_date: '2026-12-31', revenue_account_id: 'r1', deferred_rev_account_id: 'd1' },
    { title: 'Item 2', standalone_selling_price: 100, recognition_method: 'STRAIGHT_LINE' as const, start_date: '2026-01-01', end_date: '2026-12-31', revenue_account_id: 'r2', deferred_rev_account_id: 'd2' },
    { title: 'Item 3', standalone_selling_price: 100, recognition_method: 'STRAIGHT_LINE' as const, start_date: '2026-01-01', end_date: '2026-12-31', revenue_account_id: 'r3', deferred_rev_account_id: 'd3' },
  ];

  const allocated = RevenueEngine.allocateTransactionPrice(contractValue, obligations);
  const totalAllocated = allocated.reduce((s, o) => s + o.allocated_price, 0);
  assertEqual(totalAllocated, 100000, 'Sum remains strictly ₹100,000 with zero rounding drift');
});

// ══════════════════════════════════════════════════════════════════════
// 2. STRAIGHT-LINE RECOGNITION SCHEDULE (ASC 606 Step 5)
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. Straight-Line Recognition Schedules ---');

test('RevenueEngine: generates 12-month straight-line schedule (₹12,00,000 / 12 = ₹1,00,000/mo)', () => {
  const schedule = RevenueEngine.generateStraightLineSchedule(1200000, '2026-08-01', '2027-07-31', 'INR', 'SaaS License');
  assertEqual(schedule.length, 12, '12 monthly schedule periods');

  schedule.forEach((s, idx) => {
    assertEqual(s.scheduled_amount, 100000, `Month ${idx + 1} scheduled for ₹1,00,000`);
  });

  const totalSum = schedule.reduce((sum, s) => sum + s.scheduled_amount, 0);
  assertEqual(totalSum, 1200000, 'Schedule total matches allocated obligation price');
});

test('RevenueEngine: generates 36-month multi-year schedule with remainder absorbed in final month', () => {
  const schedule = RevenueEngine.generateStraightLineSchedule(100000, '2026-01-01', '2028-12-31', 'INR', 'Cloud Hosting');
  assertEqual(schedule.length, 36, '36 monthly schedule periods');

  const totalSum = Math.round(schedule.reduce((sum, s) => sum + s.scheduled_amount, 0) * 100) / 100;
  assertEqual(totalSum, 100000, '36-month sum strictly ₹100,000');
});

// ══════════════════════════════════════════════════════════════════════
// 3. DEFERRED REVENUE RECOGNITION DOUBLE-ENTRY JOURNAL
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. Deferred Revenue Double-Entry Posting ---');

test('RevenueEngine: generates balanced journal releasing Deferred Revenue into Earned Revenue', () => {
  const proposal = RevenueEngine.proposeRevenueRecognitionJournal(
    'CTR-2026-001',
    'Platform SaaS Access',
    100000,
    'INR',
    1.0,
    '2026-08-31',
    'acc_2131_def_rev',
    'acc_4130_saas_rev'
  );

  assertEqual(proposal.lines.length, 2, '2 double-entry lines');

  const defLine = proposal.lines.find(l => l.account_id === 'acc_2131_def_rev')!;
  const revLine = proposal.lines.find(l => l.account_id === 'acc_4130_saas_rev')!;

  assertEqual(defLine.debit_amount, 100000, 'Dr Deferred Revenue (decreases liability)');
  assertEqual(revLine.credit_amount, 100000, 'Cr Earned Revenue (increases income)');

  const dr = proposal.lines.reduce((s, l) => s + l.functional_debit, 0);
  const cr = proposal.lines.reduce((s, l) => s + l.functional_credit, 0);
  assertEqual(dr, cr, 'Revenue release entry is perfectly balanced');
});

// ══════════════════════════════════════════════════════════════════════
// 4. AI CONTRACT INTERPRETER (PROPOSAL MODE ONLY)
// ══════════════════════════════════════════════════════════════════════
console.log('--- 4. AI Contract Interpreter in Proposal Mode ---');

test('ContractAIInterpreter: parses multi-element contract and proposes ASC 606 obligations with confidence', () => {
  const contractText = `
    MASTER SERVICES AGREEMENT
    Customer receives 24 months access to SaaS platform software license,
    with custom implementation onboarding setup, and 24x7 premium SLA maintenance support.
    Total Agreement Fee: ₹48,00,000 payable upfront.
  `;

  const proposal = ContractAIInterpreter.interpretContractTerms(
    'Enterprise Cloud Agreement',
    4800000,
    24,
    contractText,
    {
      softwareRevId: 'acc_4130_saas',
      servicesRevId: 'acc_4150_services',
      deferredRevId: 'acc_2130_deferred',
    }
  );

  assertEqual(proposal.proposed_obligations.length, 3, 'Extracted 3 obligations (Software, Implementation, Support)');
  assertEqual(proposal.total_transaction_price, 4800000, 'Total price is ₹48,00,000');
  assertEqual(proposal.deferred_revenue_initial, 4800000, 'Initial deferred revenue is ₹48,00,000');
  assert(proposal.ai_confidence >= 0.90, 'AI confidence is >= 90%');
  assert(proposal.review_required, 'Human review strictly required before posting');
});

// ══════════════════════════════════════════════════════════════════════
// 5. REVENUE INTEGRITY MONITOR
// ══════════════════════════════════════════════════════════════════════
console.log('--- 5. Revenue Integrity Monitor ---');

test('RevenueIntegrityMonitor: detects over-recognition where recognized revenue exceeds transaction price', () => {
  const contracts = [
    {
      id: 'c1',
      contract_number: 'CTR-001',
      transaction_price: 1000000,
      recognized_revenue: 1050000, // Over-recognized by ₹50,000!
      deferred_revenue: 0,
      status: 'ACTIVE',
      end_date: '2027-01-01',
      has_schedules: true,
    },
  ];

  const check = RevenueIntegrityMonitor.verifyContractIntegrity(contracts);
  assert(!check.isHealthy, 'Integrity check must fail on over-recognition');
  assertEqual(check.anomalies.length, 1, '1 critical anomaly detected');
  assertEqual(check.anomalies[0].severity, 'CRITICAL', 'Anomaly is CRITICAL');
});

test('RevenueIntegrityMonitor: detects active contracts with zero recognition schedules', () => {
  const contracts = [
    {
      id: 'c2',
      contract_number: 'CTR-002',
      transaction_price: 500000,
      recognized_revenue: 0,
      deferred_revenue: 500000,
      status: 'ACTIVE',
      end_date: '2027-01-01',
      has_schedules: false, // Active but orphan schedule!
    },
  ];

  const check = RevenueIntegrityMonitor.verifyContractIntegrity(contracts);
  assert(!check.isHealthy, 'Integrity check must fail on unscheduled active contract');
  assertEqual(check.anomalies[0].affected_object_id, 'CTR-002', 'Identifies affected contract');
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 3 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 3 Revenue Intelligence & Contract Accounting tests passed!\n');
}

/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 4: Cash, Banking & Reconciliation Intelligence Comprehensive Test Suite
 */

import { BankStatementNormalizer } from '../../business/finance/banking/BankStatementNormalizer';
import { BankMatchingEngine, MatchCandidate } from '../../business/finance/banking/BankMatchingEngine';
import { ReconciliationWorker } from '../../business/finance/banking/ReconciliationWorker';
import { CashIntelligenceEngine } from '../../business/finance/banking/CashIntelligenceEngine';
import { RevenueEngine } from '../../business/finance/revenue/RevenueEngine';

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

console.log('\n🧪 Running CHATR Finance Phase 4 (Cash & Banking Intelligence) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. BANK STATEMENT NORMALIZATION (CSV PARSING)
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. Bank Statement CSV Normalization ---');

test('BankNormalizer: parses multi-column CSV with Debit and Credit amounts', () => {
  const csv = `
Date,Description,Reference,Debit,Credit,Balance
15/08/2026,NEFT CR BY ACME CORP,UTR99482,,118000.00,500000.00
18/08/2026,ACH DEBIT TO AWS CLOUD,TXN1102,45000.00,,455000.00
  `;
  const txs = BankStatementNormalizer.parseCSV(csv, 'INR');
  assertEqual(txs.length, 2, '2 transactions parsed');

  assertEqual(txs[0].transaction_type, 'CREDIT', 'Row 1 is CREDIT');
  assertEqual(txs[0].amount, 118000, 'Row 1 amount is ₹118,000');
  assertEqual(txs[0].reference_number, 'UTR99482', 'Row 1 reference is UTR99482');
  assertEqual(txs[0].payee_payer, 'ACME CORP', 'Extracted payee ACME CORP');

  assertEqual(txs[1].transaction_type, 'DEBIT', 'Row 2 is DEBIT');
  assertEqual(txs[1].amount, 45000, 'Row 2 amount is ₹45,000');
  assertEqual(txs[1].payee_payer, 'AWS CLOUD', 'Extracted payee AWS CLOUD');
});

test('BankNormalizer: handles single signed amount format', () => {
  const csv = `
Date,Description,Amount
2026-08-20,CUSTOMER PAYMENT,25000.00
2026-08-21,OFFICE SUPPLIES EXPENSE,-4500.00
  `;
  const txs = BankStatementNormalizer.parseCSV(csv, 'INR');
  assertEqual(txs.length, 2, '2 transactions parsed');
  assertEqual(txs[0].transaction_type, 'CREDIT', 'Positive is CREDIT');
  assertEqual(txs[1].transaction_type, 'DEBIT', 'Negative is DEBIT');
  assertEqual(txs[1].amount, 4500, 'Debit amount is positive magnitude ₹4,500');
});

// ══════════════════════════════════════════════════════════════════════
// 2. MULTI-RULE BANK MATCHING ENGINE
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. Multi-Rule Bank Matching Engine ---');

test('BankMatching: Rule 1 Exact Reference + Exact Amount Match (100% Confidence)', () => {
  const bankTx = {
    amount: 118000,
    date: '2026-08-15',
    reference_number: 'UTR99482',
    description: 'NEFT PAYMENT',
  };
  const candidates: MatchCandidate[] = [
    { id: 'pmt_1', source_type: 'PAYMENT', amount: 118000, date: '2026-08-15', reference_number: 'UTR99482' },
    { id: 'pmt_2', source_type: 'PAYMENT', amount: 50000, date: '2026-08-15', reference_number: 'UTR11111' },
  ];

  const res = BankMatchingEngine.matchTransaction(bankTx, candidates);
  assert(res.is_match, 'Should match');
  assertEqual(res.rule_applied, 'EXACT_REF_AND_AMOUNT', 'Rule 1 applied');
  assertEqual(res.confidence_score, 1.0, '100% confidence');
  assertEqual(res.matched_candidate_id, 'pmt_1', 'Matched pmt_1');
});

test('BankMatching: Rule 2 Date Window (+/- 3 days) + Exact Amount Match (95% Confidence)', () => {
  const bankTx = {
    amount: 50000,
    date: '2026-08-18', // 2 days after ledger payment on 2026-08-16
    description: 'DIRECT DEPOSIT TRANSFER',
  };
  const candidates: MatchCandidate[] = [
    { id: 'pmt_window', source_type: 'PAYMENT', amount: 50000, date: '2026-08-16' },
  ];

  const res = BankMatchingEngine.matchTransaction(bankTx, candidates);
  assert(res.is_match, 'Should match within 3-day window');
  assertEqual(res.rule_applied, 'DATE_WINDOW_AMOUNT', 'Rule 2 applied');
  assertEqual(res.confidence_score, 0.95, '95% confidence');
});

test('BankMatching: Rule 3 Fee Deduction Match (e.g. ₹98,000 credit against ₹100,000 invoice with 2% fee)', () => {
  const bankTx = {
    amount: 98000,
    date: '2026-08-15',
    description: 'STRIPE PAYOUT BATCH 4401',
  };
  const candidates: MatchCandidate[] = [
    { id: 'inv_100k', source_type: 'INVOICE', amount: 100000, date: '2026-08-15' },
  ];

  const res = BankMatchingEngine.matchTransaction(bankTx, candidates);
  assert(res.is_match, 'Should identify fee deduction match');
  assertEqual(res.rule_applied, 'FEE_DEDUCTION_MATCH', 'Fee rule applied');
  assertEqual(res.fee_difference, 2000, 'Fee difference is ₹2,000');
  assertEqual(res.confidence_score, 0.90, '90% confidence');
});

// ══════════════════════════════════════════════════════════════════════
// 3. AI RECONCILIATION WORKER (PROPOSAL MODE)
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. AI Reconciliation Worker in Proposal Mode ---');

test('ReconciliationWorker: recognizes invoice reference in narrative and proposes fee deduction resolution', () => {
  const bankTx = {
    id: 'tx_stripe_88',
    amount: 98000,
    date: '2026-08-15',
    description: 'STRIPE TRANSFER FOR INV-2026-881',
    transaction_type: 'CREDIT' as const,
  };
  const openInvoices = [
    { id: 'inv_881', invoice_number: 'INV-2026-881', amount_due: 100000, customer_name: 'Acme Corp' },
  ];

  const proposal = ReconciliationWorker.proposeResolution(bankTx, openInvoices);
  assertEqual(proposal.proposed_action, 'SETTLE_INVOICE_WITH_FEE', 'Proposes settlement with fee');
  assertEqual(proposal.matched_invoice_or_bill_id, 'inv_881', 'Links to invoice inv_881');
  assertEqual(proposal.deducted_fee_amount, 2000, 'Identifies ₹2,000 processor fee');
  assert(proposal.ai_confidence >= 0.95, 'Confidence >= 95%');
  assert(proposal.review_required, 'Requires human review');
});

// ══════════════════════════════════════════════════════════════════════
// 4. CASH INTELLIGENCE & 90-DAY FORECASTING
// ══════════════════════════════════════════════════════════════════════
console.log('--- 4. Cash Intelligence & 90-Day Predictive Liquidity ---');

test('CashIntelligenceEngine: generates 90-day cash forecast across bank balances, AR, contracts, and AP', () => {
  const actualCash = 5000000; // ₹50 Lakhs in bank
  const invoices = [
    { amount_due: 1000000, due_date: '2026-09-05' }, // ₹10L in Day 1-30
    { amount_due: 800000, due_date: '2026-10-05' },  // ₹8L in Day 31-60
    { amount_due: 500000, due_date: '2026-11-05' },  // ₹5L in Day 61-90
  ];
  const contractSchedules = [
    { scheduled_amount: 500000, scheduled_date: '2026-09-15' }, // ₹5L in Day 1-30
  ];
  const bills = [
    { amount_due: 600000, due_date: '2026-09-10' }, // ₹6L in Day 1-30
    { amount_due: 400000, due_date: '2026-10-10' }, // ₹4L in Day 31-60
  ];

  const forecast = CashIntelligenceEngine.calculateForecast(
    actualCash,
    invoices,
    contractSchedules,
    bills,
    '2026-08-24'
  );

  assertEqual(forecast.actual_cash_balance, 5000000, 'Actual cash is ₹50 Lakhs');

  // Day 1-30: Cash ₹50L + Inflows (₹10L AR + ₹5L Contract) - Outflows ₹6L Bills = ₹59 Lakhs
  const h1 = forecast.horizons[0];
  assertEqual(h1.expected_inflows, 1500000, 'Inflows Day 30 = ₹15 Lakhs');
  assertEqual(h1.expected_outflows, 600000, 'Outflows Day 30 = ₹6 Lakhs');
  assertEqual(h1.projected_cash_position, 5900000, 'Day 30 Cash = ₹59 Lakhs');

  // Day 31-60: Cash ₹59L + Inflows ₹8L - Outflows ₹4L = ₹63 Lakhs
  const h2 = forecast.horizons[1];
  assertEqual(h2.projected_cash_position, 6300000, 'Day 60 Cash = ₹63 Lakhs');

  // Day 61-90: Cash ₹63L + Inflows ₹5L - Outflows ₹0L = ₹68 Lakhs
  const h3 = forecast.horizons[2];
  assertEqual(h3.projected_cash_position, 6800000, 'Day 90 Cash = ₹68 Lakhs');
});

// ══════════════════════════════════════════════════════════════════════
// 5. EXPANDED ASC 606 REVENUE EDGE-CASES
// ══════════════════════════════════════════════════════════════════════
console.log('--- 5. Expanded ASC 606 Revenue Edge-Cases ---');

test('RevenueEngine: allocates 5-element complex contract (Software, Implementation, Support, Training, Usage)', () => {
  const contractValue = 2000000; // ₹20 Lakhs
  const obligations = [
    { title: 'Software License', standalone_selling_price: 1000000, recognition_method: 'STRAIGHT_LINE' as const, start_date: '2026-01-01', end_date: '2026-12-31', revenue_account_id: 'r1', deferred_rev_account_id: 'd1' },
    { title: 'Custom Implementation', standalone_selling_price: 400000, recognition_method: 'MILESTONE' as const, start_date: '2026-01-01', end_date: '2026-03-31', revenue_account_id: 'r2', deferred_rev_account_id: 'd2' },
    { title: 'Premium Support', standalone_selling_price: 300000, recognition_method: 'STRAIGHT_LINE' as const, start_date: '2026-01-01', end_date: '2026-12-31', revenue_account_id: 'r3', deferred_rev_account_id: 'd3' },
    { title: 'Staff Training', standalone_selling_price: 200000, recognition_method: 'POINT_IN_TIME' as const, start_date: '2026-02-01', end_date: '2026-02-01', revenue_account_id: 'r4', deferred_rev_account_id: 'd4' },
    { title: 'API Usage Pack', standalone_selling_price: 100000, recognition_method: 'STRAIGHT_LINE' as const, start_date: '2026-01-01', end_date: '2026-12-31', revenue_account_id: 'r5', deferred_rev_account_id: 'd5' },
  ];

  const allocated = RevenueEngine.allocateTransactionPrice(contractValue, obligations);
  assertEqual(allocated.length, 5, '5 obligations allocated');
  const totalAlloc = Math.round(allocated.reduce((s, o) => s + o.allocated_price, 0) * 100) / 100;
  assertEqual(totalAlloc, 2000000, 'Sum of all 5 obligations strictly ₹20,00,000');
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 4 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 4 Cash, Banking & Reconciliation tests passed!\n');
}

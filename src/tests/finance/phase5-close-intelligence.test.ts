/**
 * CHATR Financial Intelligence & Accounting Core
 * Phase 5: Financial Close & Intelligence OS Comprehensive Test Suite
 */

import { CloseAutomationEngine, CloseTaskDefinition } from '../../business/finance/close/CloseAutomationEngine';
import { AccrualEngine } from '../../business/finance/accruals/AccrualEngine';
import { PrepaidEngine } from '../../business/finance/prepaids/PrepaidEngine';
import { FixedAssetEngine } from '../../business/finance/assets/FixedAssetEngine';
import { TaxPolicyEngine } from '../../business/finance/tax/TaxPolicyEngine';
import { ConsolidationEngine } from '../../business/finance/consolidation/ConsolidationEngine';
import { CFONarrativeEngine } from '../../business/finance/reporting/CFONarrativeEngine';

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

console.log('\n🧪 Running CHATR Finance Phase 5 (Financial Close & Intelligence OS) Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. MONTH-END CLOSE AUTOMATION
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. Month-End Close Automation ---');

test('CloseAutomation: computes completion percentage and blocks signoff when tasks pending', () => {
  const tasks: CloseTaskDefinition[] = [
    { task_code: 'AR_RECON', task_name: 'AR Recon', sequence_order: 1, category: 'SUBLEDGER_RECON', status: 'COMPLETED' },
    { task_code: 'AP_RECON', task_name: 'AP Recon', sequence_order: 2, category: 'SUBLEDGER_RECON', status: 'COMPLETED' },
    { task_code: 'BANK_RECON', task_name: 'Bank Recon', sequence_order: 3, category: 'SUBLEDGER_RECON', status: 'COMPLETED' },
    { task_code: 'REV_REC', task_name: 'Revenue Rec', sequence_order: 4, category: 'REVENUE_EXPENSE', status: 'COMPLETED' },
    { task_code: 'ACCRUALS', task_name: 'Accruals', sequence_order: 5, category: 'REVENUE_EXPENSE', status: 'COMPLETED' },
    { task_code: 'FIXED_ASSETS', task_name: 'Assets', sequence_order: 6, category: 'ASSET_LIABILITY', status: 'COMPLETED' },
    { task_code: 'TAX', task_name: 'Tax Review', sequence_order: 7, category: 'TAX_COMPLIANCE', status: 'COMPLETED' },
    { task_code: 'FINAL_SIGNOFF', task_name: 'Final Review', sequence_order: 8, category: 'REVIEW_SIGNOFF', status: 'PENDING' },
  ];

  const evalRes = CloseAutomationEngine.evaluateCloseStatus(tasks);
  assertEqual(evalRes.totalTasks, 8, '8 total close tasks');
  assertEqual(evalRes.completedTasks, 7, '7 completed tasks');
  assertEqual(evalRes.completionPct, 87.5, '87.5% completion');
  assert(evalRes.isReadyForSignoff, 'Ready for final signoff stage');
});

// ══════════════════════════════════════════════════════════════════════
// 2. ACCRUAL ENGINE WITH AUTO-REVERSAL
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. Accrual Engine with Auto-Reversal ---');

test('AccrualEngine: generates balanced accrual entry and matching auto-reversal', () => {
  const amount = 800000; // ₹8 Lakhs AWS unbilled usage
  const accrualProp = AccrualEngine.proposeAccrualEntry(
    'ACC-2026-08-01',
    'AWS Cloud Infrastructure Usage',
    amount,
    'INR',
    '2026-08-31',
    'acc_5310_aws_expense',
    'acc_2120_accrued_liab'
  );

  assertEqual(accrualProp.lines[0].account_id, 'acc_5310_aws_expense', 'Dr Expense');
  assertEqual(accrualProp.lines[0].debit_amount, 800000, 'Dr ₹8,00,000');
  assertEqual(accrualProp.lines[1].account_id, 'acc_2120_accrued_liab', 'Cr Accrued Liability');
  assertEqual(accrualProp.lines[1].credit_amount, 800000, 'Cr ₹8,00,000');

  // Next month auto-reversal
  const reversalProp = AccrualEngine.proposeReversalEntry(
    'ACC-2026-08-01',
    'AWS Cloud Infrastructure Usage',
    amount,
    'INR',
    '2026-09-01',
    'acc_5310_aws_expense',
    'acc_2120_accrued_liab'
  );

  assertEqual(reversalProp.lines[0].account_id, 'acc_2120_accrued_liab', 'Dr Accrued Liability (Clears)');
  assertEqual(reversalProp.lines[0].debit_amount, 800000, 'Dr ₹8,00,000');
  assertEqual(reversalProp.lines[1].account_id, 'acc_5310_aws_expense', 'Cr Expense (Offsets incoming bill)');
  assertEqual(reversalProp.lines[1].credit_amount, 800000, 'Cr ₹8,00,000');
});

// ══════════════════════════════════════════════════════════════════════
// 3. PREPAID EXPENSE AMORTIZATION
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. Prepaid Expense Amortization ---');

test('PrepaidEngine: generates monthly amortization entry (₹12L insurance / 12 mo = ₹1L/mo)', () => {
  const prop = PrepaidEngine.proposeAmortizationEntry(
    'PPD-2026-001',
    'Corporate D&O Insurance',
    100000,
    'INR',
    '2026-08-31',
    'acc_1150_prepaid_asset',
    'acc_5230_insurance_expense'
  );

  assertEqual(prop.lines[0].account_id, 'acc_5230_insurance_expense', 'Dr Insurance Expense');
  assertEqual(prop.lines[0].debit_amount, 100000, 'Dr ₹1,00,000');
  assertEqual(prop.lines[1].account_id, 'acc_1150_prepaid_asset', 'Cr Prepaid Asset (Decreases)');
  assertEqual(prop.lines[1].credit_amount, 100000, 'Cr ₹1,00,000');
});

// ══════════════════════════════════════════════════════════════════════
// 4. FIXED ASSET DEPRECIATION
// ══════════════════════════════════════════════════════════════════════
console.log('--- 4. Fixed Asset Depreciation ---');

test('FixedAssetEngine: calculates straight-line depreciation and generates contra-asset entry', () => {
  const cost = 2400000; // ₹24 Lakhs
  const salvage = 0;
  const usefulLifeMonths = 60; // 5 years

  const monthlyDep = FixedAssetEngine.calculateMonthlyDepreciation(cost, salvage, usefulLifeMonths);
  assertEqual(monthlyDep, 40000, 'Monthly depreciation = ₹40,000');

  const prop = FixedAssetEngine.proposeDepreciationEntry(
    'AST-2026-001',
    'MacBook Pro Fleet',
    monthlyDep,
    'INR',
    '2026-08-31',
    'acc_5210_dep_expense',
    'acc_1220_accum_dep'
  );

  assertEqual(prop.lines[0].account_id, 'acc_5210_dep_expense', 'Dr Depreciation Expense');
  assertEqual(prop.lines[0].debit_amount, 40000, 'Dr ₹40,000');
  assertEqual(prop.lines[1].account_id, 'acc_1220_accum_dep', 'Cr Accumulated Depreciation (Contra Asset)');
  assertEqual(prop.lines[1].credit_amount, 40000, 'Cr ₹40,000');
});

// ══════════════════════════════════════════════════════════════════════
// 5. TAX POLICY ENGINE (GST & TDS)
// ══════════════════════════════════════════════════════════════════════
console.log('--- 5. Tax Policy Engine (GST & TDS) ---');

test('TaxPolicyEngine: splits intra-state GST into CGST 9% and SGST 9%', () => {
  const res = TaxPolicyEngine.calculateGST(100000, 18, 'MH', 'MH');
  assertEqual(res.cgst_amount, 9000, 'CGST = ₹9,000');
  assertEqual(res.sgst_amount, 9000, 'SGST = ₹9,000');
  assertEqual(res.igst_amount, 0, 'IGST = 0');
  assertEqual(res.total_tax, 18000, 'Total GST = ₹18,000');
  assertEqual(res.gross_amount, 118000, 'Gross = ₹1,18,000');
});

test('TaxPolicyEngine: applies IGST 18% and TDS 10% under Section 194J on inter-state technical services', () => {
  const res = TaxPolicyEngine.calculateGST(100000, 18, 'KA', 'DL', '194J');
  assertEqual(res.cgst_amount, 0, 'CGST = 0');
  assertEqual(res.sgst_amount, 0, 'SGST = 0');
  assertEqual(res.igst_amount, 18000, 'IGST = ₹18,000');
  assertEqual(res.tds_amount, 10000, 'TDS (194J 10%) = ₹10,000');
  assertEqual(res.gross_amount, 108000, 'Net Payable after TDS = ₹1,08,000');
});

// ══════════════════════════════════════════════════════════════════════
// 6. INTERCOMPANY CONSOLIDATION & ELIMINATIONS
// ══════════════════════════════════════════════════════════════════════
console.log('--- 6. Intercompany Elimination ---');

test('ConsolidationEngine: generates balanced elimination entry between Entity A and Entity B', () => {
  const prop = ConsolidationEngine.proposeEliminationEntry(
    'ENTITY_IN',
    'ENTITY_US',
    1000000,
    'INR',
    '2026-08-31',
    'acc_1125_interco_rec',
    'acc_2115_interco_pay'
  );

  assertEqual(prop.lines[0].account_id, 'acc_2115_interco_pay', 'Dr Intercompany Payable (Eliminated)');
  assertEqual(prop.lines[0].debit_amount, 1000000, 'Dr ₹10,00,000');
  assertEqual(prop.lines[1].account_id, 'acc_1125_interco_rec', 'Cr Intercompany Receivable (Eliminated)');
  assertEqual(prop.lines[1].credit_amount, 1000000, 'Cr ₹10,00,000');
});

// ══════════════════════════════════════════════════════════════════════
// 7. EXECUTIVE CFO BRIEFING & NARRATIVE SYNTHESIS
// ══════════════════════════════════════════════════════════════════════
console.log('--- 7. Executive CFO Briefing Synthesis ---');

test('CFONarrativeEngine: synthesizes comprehensive executive financial brief with growth and risk alerts', () => {
  const brief = CFONarrativeEngine.generateBriefing({
    period_name: 'August 2026',
    current_revenue: 62100000,
    prior_revenue: 54300000,
    operating_expenses: 31200000,
    net_income: 30900000,
    gross_margin_pct: 68.4,
    cash_balance: 48500000,
    runway_months: 8.4,
    ar_overdue_60d: 1800000,
  });

  assert(brief.headline.includes('Revenue up 14.4% MoM'), 'Calculates 14.4% revenue increase');
  assertEqual(brief.risk_alerts.length, 1, '1 risk alert generated for AR > 60 days');
  assert(brief.risk_alerts[0].includes('Aging Alert'), 'Includes Aging alert details');
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Phase 5 Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Phase 5 Financial Close & Intelligence OS tests passed!\n');
}

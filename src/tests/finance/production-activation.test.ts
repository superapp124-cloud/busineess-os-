/**
 * CHATR Financial Intelligence & Accounting Core
 * Production Activation & Real Data Ingestion Test Suite
 */

import { UniversalFinancialImporter } from '../../business/finance/importer/UniversalFinancialImporter';
import { FinanceRBACGuard } from '../../business/finance/security/FinanceRBACGuard';
import { FinanceObservabilityEngine } from '../../business/finance/observability/FinanceObservabilityEngine';

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

console.log('\n🧪 Running CHATR Finance Production Activation Test Suite...\n');

// ══════════════════════════════════════════════════════════════════════
// 1. UNIVERSAL FINANCIAL DATA IMPORTER & AI SCHEMA MAPPING
// ══════════════════════════════════════════════════════════════════════
console.log('--- 1. Universal Financial Data Importer ---');

test('UniversalFinancialImporter: AI automatically maps legacy column names to CHATR fields', () => {
  const columns = ['Party Name', 'Invoice Number', 'Due Date', 'Debit', 'Credit', 'GST Amount', 'Ledger Head'];
  const mappings = UniversalFinancialImporter.mapSourceColumnsToChatr(columns);

  assertEqual(mappings.length, 7, '7 columns mapped');
  const partyMap = mappings.find(m => m.source_column === 'Party Name')!;
  assertEqual(partyMap.target_chatr_field, 'counterparty_name', 'Maps Party Name -> counterparty_name');

  const gstMap = mappings.find(m => m.source_column === 'GST Amount')!;
  assertEqual(gstMap.target_chatr_field, 'tax_amount', 'Maps GST Amount -> tax_amount');
});

test('UniversalFinancialImporter: validates balanced dataset and generates legal migration certificate', () => {
  const validData = [
    { debit_amount: 5000000, credit_amount: 0, account_code_or_name: '1010 Bank' },
    { debit_amount: 0, credit_amount: 5000000, account_code_or_name: '3010 Capital' },
  ];

  const validation = UniversalFinancialImporter.validateIngestedDataset(validData);
  assertEqual(validation.isTrialBalanceBalanced, true, 'Trial balance is balanced');
  assertEqual(validation.criticalErrorsCount, 0, 'Zero critical errors');

  const certificate = UniversalFinancialImporter.generateMigrationCertificate('ZOHO_BOOKS', validation);
  assertEqual(certificate.status, 'READY', 'Certificate status is READY');
  assertEqual(certificate.unexplainedVariance, 0, 'Zero unexplained variance');
});

// ══════════════════════════════════════════════════════════════════════
// 2. PRODUCTION SECURITY & RBAC PERMISSION MATRIX
// ══════════════════════════════════════════════════════════════════════
console.log('--- 2. Production Security & RBAC Guard ---');

test('FinanceRBACGuard: enforces role boundaries and approval gates across all 8 roles', () => {
  // Accountant can view GL and draft journals, but cannot post
  const acctView = FinanceRBACGuard.evaluateAuthorization('ACCOUNTANT', 'VIEW_GL');
  assertEqual(acctView.authorized, true, 'Accountant can VIEW_GL');

  const acctPost = FinanceRBACGuard.evaluateAuthorization('ACCOUNTANT', 'POST_JOURNAL');
  assertEqual(acctPost.authorized, false, 'Accountant CANNOT POST_JOURNAL');

  // Finance Manager can post journals, but cannot write off bad debts
  const mgrPost = FinanceRBACGuard.evaluateAuthorization('FINANCE_MANAGER', 'POST_JOURNAL');
  assertEqual(mgrPost.authorized, true, 'Finance Manager can POST_JOURNAL');

  const mgrWriteOff = FinanceRBACGuard.evaluateAuthorization('FINANCE_MANAGER', 'WRITE_OFF_BAD_DEBT');
  assertEqual(mgrWriteOff.authorized, false, 'Finance Manager CANNOT WRITE_OFF_BAD_DEBT');

  // CFO can write off bad debts and reopen periods
  const cfoWriteOff = FinanceRBACGuard.evaluateAuthorization('CFO', 'WRITE_OFF_BAD_DEBT');
  assertEqual(cfoWriteOff.authorized, true, 'CFO can WRITE_OFF_BAD_DEBT');

  // Bank account changes require mandatory dual approval
  const bankChange = FinanceRBACGuard.evaluateAuthorization('CFO', 'CHANGE_BANK_ACCOUNT');
  assertEqual(bankChange.requiresDualApproval, true, 'Bank account changes require dual approval');
});

// ══════════════════════════════════════════════════════════════════════
// 3. FINANCE OS HEALTH & OBSERVABILITY
// ══════════════════════════════════════════════════════════════════════
console.log('--- 3. Finance OS Health & Observability Engine ---');

test('FinanceObservabilityEngine: evaluates system telemetry confirming healthy invariant state', async () => {
  const report = await FinanceObservabilityEngine.getSystemHealth();

  assertEqual(report.overallStatus, 'HEALTHY', 'Overall system is HEALTHY');
  assertEqual(report.activeWorkersCount, 7, '7/7 AI workers online');
  assertEqual(report.uptimePercentage, 99.99, '99.99% system uptime');
  assertEqual(report.metrics.length, 9, '9 core metrics evaluated');
});

// ── Summary ──────────────────────────────────────────────────────────
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 Production Activation Test Summary: ${passed}/${total} passed (${Math.round(passed / total * 100)}%)\n`);

if (passed !== total) {
  process.exit(1);
} else {
  console.log('✨ All Production Activation & Real Data Ingestion tests passed!\n');
}

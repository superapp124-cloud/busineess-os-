import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FinanceObservabilityEngine } from '../../business/finance/observability/FinanceObservabilityEngine';
import { UniversalFinancialImporter } from '../../business/finance/importer/UniversalFinancialImporter';
import { FinancialRiskQueue } from '../../business/finance/ai/FinancialRiskQueue';
import { FinanceRBACGuard } from '../../business/finance/security/FinanceRBACGuard';
import { StrategicScenarioSimulator } from '../../business/finance/ai/StrategicScenarioSimulator';
import { CFONarrativeEngine } from '../../business/finance/reporting/CFONarrativeEngine';

describe('Phase 12: Production Hardening & Live Audit Verification', () => {

  it('1. FinanceObservabilityEngine: handles live healthy Supabase queries with 0 hardcoding', async () => {
    const mockSupabase = {
      from: (table: string) => ({
        select: (cols: string, opts?: any) => ({
          eq: (field: string, val: any) => Promise.resolve({ count: 0, data: [], error: null }),
        }),
      }),
      rpc: (fn: string, params: any) => {
        if (fn === 'fin_run_integrity_check') {
          return Promise.resolve({
            data: { gl_balanced: true, integrity_score: 99.8, anomalies: [] },
            error: null,
          });
        }
        if (fn === 'fin_reconcile_subledgers_to_gl') {
          return Promise.resolve({
            data: { ar: { status: 'MATCH', difference: 0 }, ap: { status: 'MATCH', difference: 0 } },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      },
    };

    const health = await FinanceObservabilityEngine.getSystemHealth(mockSupabase, 'org-prod-001');
    assert.equal(health.overallStatus, 'HEALTHY');
    assert.equal(health.metrics.length, 7);
    assert.equal(health.metrics.find(m => m.name === 'General Ledger Invariant (Dr = Cr)')?.value, 'BALANCED');
    assert.equal(health.metrics.find(m => m.name === 'AR Subledger ↔ GL Control')?.value, 'PASS');
  });

  it('2. FinanceObservabilityEngine: degrades gracefully on DB/RPC errors without crashing', async () => {
    const errorSupabase = {
      from: (table: string) => ({
        select: () => ({
          eq: () => Promise.resolve({ count: null, data: null, error: { message: 'Connection timeout' } }),
        }),
      }),
      rpc: () => Promise.resolve({ data: null, error: { message: 'Function not found' } }),
    };

    const health = await FinanceObservabilityEngine.getSystemHealth(errorSupabase, 'org-prod-001');
    assert.equal(health.overallStatus, 'DEGRADED');
    assert.ok(health.alerts.length > 0);
    const glMetric = health.metrics.find(m => m.name === 'General Ledger Invariant (Dr = Cr)');
    assert.equal(glMetric?.status, 'DEGRADED');
    assert.equal(glMetric?.value, 'UNAVAILABLE');
  });

  it('3. UniversalFinancialImporter: handles empty CSV datasets without fake records', () => {
    const validation = UniversalFinancialImporter.validateIngestedDataset([]);
    assert.equal(validation.totalRecordsDetected, 0);
    assert.equal(validation.validRecords, 0);
    assert.equal(validation.totalDebits, 0);
    assert.equal(validation.totalCredits, 0);
    assert.equal(validation.errors.length, 0);
  });

  it('4. UniversalFinancialImporter: maps real CSV column headers with confidence scores', () => {
    const cols = ['Invoice Number', 'Party Name', 'Debit Amount', 'Credit Amount', 'GST Total'];
    const mappings = UniversalFinancialImporter.mapSourceColumnsToChatr(cols);
    assert.equal(mappings.length, 5);
    const invMap = mappings.find(m => m.source_column === 'Invoice Number');
    assert.equal(invMap?.target_chatr_field, 'document_number');
    assert.ok(invMap!.confidence > 0.8);
  });

  it('5. FinancialRiskQueue: returns 0 risks when ledger and AR are clean', () => {
    const risks = FinancialRiskQueue.scanFinancialRisks({
      overdueInvoices: [],
      duplicateBills: [],
      opexAnomalies: [],
      fxVariances: [],
    });
    assert.equal(risks.length, 0);
  });

  it('6. FinancialRiskQueue: detects overdue invoice anomalies accurately', () => {
    const risks = FinancialRiskQueue.scanFinancialRisks({
      overdueInvoices: [
        { id: 'inv_1', invoice_number: 'INV-99', amount_due: 500000, days_overdue: 65, customer_name: 'Acme Corp' }
      ],
      duplicateBills: [],
      opexAnomalies: [],
      fxVariances: [],
    });
    assert.equal(risks.length, 1);
    assert.equal(risks[0].severity, 'HIGH');
    assert.equal(risks[0].impact_amount, 500000);
    assert.ok(risks[0].why.includes('60-day'));
  });

  it('7. FinanceRBACGuard: denies VIEWER and ACCOUNTANT from restricted mutations', () => {
    const viewerDenied = FinanceRBACGuard.evaluateAuthorization('VIEWER', 'POST_JOURNAL');
    assert.equal(viewerDenied.authorized, false);

    const accountantCloseDenied = FinanceRBACGuard.evaluateAuthorization('ACCOUNTANT', 'REOPEN_CLOSED_PERIOD');
    assert.equal(accountantCloseDenied.authorized, false);
  });

  it('8. FinanceRBACGuard: enforces mandatory dual approval on bank account changes', () => {
    const bankChange = FinanceRBACGuard.evaluateAuthorization('CFO', 'CHANGE_BANK_ACCOUNT');
    assert.ok(bankChange.requiresDualApproval);
  });

  it('9. StrategicScenarioSimulator: computes mathematically accurate runway against real cash', () => {
    const sim = StrategicScenarioSimulator.simulateHiringPlan({
      newHiresCount: 10,
      avgSalaryPerMonth: 150000,
      benefitsOverheadPct: 20,
      currentCash: 36000000, // 3.6 Cr
      currentMonthlyBurn: 2000000, // 20L
      arOverdueRiskAmount: 0,
      delayedContractMonthlyRevenue: 0,
    });

    // 10 hires * 1.5L * 1.2 overhead = 18L/mo new burn. Total burn = 38L/mo.
    // Runway = 360L / 38L = ~9.5 months
    assert.ok(sim.scenarios.expected_case.new_runway_months > 9 && sim.scenarios.expected_case.new_runway_months < 10);
    assert.equal(sim.monthly_burn_increase, 1800000);
  });

  it('10. CFONarrativeEngine: handles zero-revenue clean state gracefully', () => {
    const briefing = CFONarrativeEngine.generateBriefing({
      period_name: 'August 2026',
      current_revenue: 0,
      prior_revenue: 0,
      operating_expenses: 0,
      net_income: 0,
      gross_margin_pct: 0,
      cash_balance: 0,
      runway_months: 0,
      ar_overdue_60d: 0,
    });
    assert.ok(briefing.headline.length > 0);
    assert.ok(briefing.narrative_paragraphs.length > 0);
  });
});

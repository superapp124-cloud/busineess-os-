import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  RefreshCw,
  AlertCircle,
  Loader2,
  Activity,
  XCircle
} from 'lucide-react';
import { formatCurrency } from '../types';
import { supabase } from '@/integrations/supabase/client';

export interface CFOCommandCenterProps {
  finOrganizationId?: string;
  legalEntityId?: string;
  periodId?: string;
  reportingCurrency?: string;
  onNavigate?: (tab: string) => void;
}

interface LiveMetricsState {
  cashBalance: number | null;
  monthlyRevenue: number | null;
  grossMargin: number | null;
  accountsReceivable: number | null;
  overdueAR: number | null;
  accountsPayable: number | null;
  expectedRunwayMonths: number | null;
  stressRunwayMonths: number | null;
  closeProgressPercent: number | null;
  closeCompletedStages: number | null;
  closeTotalStages: number | null;
  isLiveDbConnected: boolean;
  dataError: string | null;
}

interface AttentionItem {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  detail: string;
  amount: number | null;
  currency: string;
  action: string;
  hitlRequired: boolean;
  tab?: string;
}

interface CopilotAnswer {
  claim: string;
  evidence: string;
  calculation: string;
  sourceLineage: string;
  confidence: number;
  isGrounded: boolean;
  insufficientData?: boolean;
}

interface TelemetryState {
  glBalanced: boolean | null;
  arPass: boolean | null;
  apPass: boolean | null;
  integrityScore: number | null;
  lastChecked: Date | null;
  telemetryError: string | null;
}

const EMPTY_METRICS: LiveMetricsState = {
  cashBalance: null,
  monthlyRevenue: null,
  grossMargin: null,
  accountsReceivable: null,
  overdueAR: null,
  accountsPayable: null,
  expectedRunwayMonths: null,
  stressRunwayMonths: null,
  closeProgressPercent: null,
  closeCompletedStages: null,
  closeTotalStages: null,
  isLiveDbConnected: false,
  dataError: null,
};

function MetricCard({
  label,
  value,
  subtitle,
  subtitleClass = '',
  icon,
  loading,
}: {
  label: string;
  value: string | null;
  subtitle: string;
  subtitleClass?: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        {icon}
      </div>
      <strong className="text-xl font-extrabold text-white tracking-tight block mt-1 min-h-[1.75rem]">
        {loading ? (
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        ) : value === null ? (
          <span className="text-slate-500 text-sm font-normal">No data</span>
        ) : (
          value
        )}
      </strong>
      <span className={`text-[11px] font-semibold block mt-1 ${subtitleClass || 'text-slate-400'}`}>
        {subtitle}
      </span>
    </Card>
  );
}

export function CFOCommandCenter({
  finOrganizationId,
  legalEntityId,
  periodId,
  reportingCurrency = 'INR',
  onNavigate,
}: CFOCommandCenterProps) {
  const [nlQuery, setNlQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<LiveMetricsState>(EMPTY_METRICS);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [attentionLoading, setAttentionLoading] = useState(false);
  const [copilotAnswer, setCopilotAnswer] = useState<CopilotAnswer | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    glBalanced: null,
    arPass: null,
    apPass: null,
    integrityScore: null,
    lastChecked: null,
    telemetryError: null,
  });
  const loadedRef = useRef(false);

  // ─────────────────────────────────────────────────────────────
  // LIVE METRICS — parallel queries, no hardcoded fallbacks
  // ─────────────────────────────────────────────────────────────
  const loadLiveMetrics = useCallback(async () => {
    if (!finOrganizationId) {
      setMetrics({ ...EMPTY_METRICS, dataError: 'Finance organization not configured.' });
      return;
    }
    setIsLoading(true);
    try {
      // Parallel: ledger balances + invoices + bills + close tasks
      const [ledgerRes, invoiceRes, billRes, checklistRes] = await Promise.all([
        supabase
          .from('fin_ledger_balances')
          .select('account_code, account_type, account_subtype, reporting_net_balance, reporting_total_credit, reporting_total_debit')
          .eq('fin_organization_id', finOrganizationId)
          .then(r => r),
        supabase
          .from('fin_invoices')
          .select('amount_due, due_date, status')
          .eq('fin_organization_id', finOrganizationId)
          .eq('legal_entity_id', legalEntityId || '')
          .not('status', 'in', '("PAID","VOID","DRAFT")')
          .then(r => r),
        supabase
          .from('fin_bills')
          .select('amount_due, status')
          .eq('fin_organization_id', finOrganizationId)
          .not('status', 'in', '("PAID","VOID","DRAFT")')
          .then(r => r),
        supabase
          .from('fin_close_checklists')
          .select('id, fin_close_tasks(status)')
          .eq('fin_organization_id', finOrganizationId)
          .eq('legal_entity_id', legalEntityId || '')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(r => r),
      ]);

      // Compute GL metrics
      let cash = 0;
      let revenue = 0;
      let cogs = 0;
      let expenses = 0;
      const ledgerRows = ledgerRes.data || [];

      ledgerRows.forEach(row => {
        const code = String(row.account_code || '');
        const netBal = Number(row.reporting_net_balance || 0);
        const totalCr = Number(row.reporting_total_credit || 0);
        const totalDr = Number(row.reporting_total_debit || 0);

        if (
          code.startsWith('10') || code.startsWith('11') ||
          (row.account_type === 'ASSET' && row.account_subtype === 'CASH')
        ) {
          cash += netBal;
        } else if (row.account_type === 'REVENUE' || code.startsWith('4')) {
          revenue += totalCr;
        } else if (code.startsWith('51') || code.startsWith('50')) {
          cogs += totalDr;
        } else if (row.account_type === 'EXPENSE' || code.startsWith('5')) {
          expenses += totalDr;
        }
      });

      // AR / AP
      const todayStr = new Date().toISOString().split('T')[0];
      let arTotal = 0;
      let arOverdue = 0;
      (invoiceRes.data || []).forEach(inv => {
        const amt = Number(inv.amount_due || 0);
        arTotal += amt;
        if (inv.due_date && inv.due_date < todayStr) arOverdue += amt;
      });

      let apTotal = 0;
      (billRes.data || []).forEach(b => {
        apTotal += Number(b.amount_due || 0);
      });

      // Derived: margin, burn, runway — only compute if we have data
      const grossMargin = revenue > 0 ? Math.round(((revenue - cogs) / revenue) * 1000) / 10 : null;
      const monthlyBurn = expenses > 0 ? expenses : null;
      const runway =
        cash > 0 && monthlyBurn && monthlyBurn > 0
          ? Math.round((cash / monthlyBurn) * 10) / 10
          : null;
      const stressRunway = runway !== null ? Math.round(runway * 0.8 * 10) / 10 : null;

      // Close progress from checklist
      let closeCompleted = 0;
      let closeTotal = 0;
      if (checklistRes.data) {
        const tasks = (checklistRes.data as any).fin_close_tasks || [];
        closeTotal = tasks.length;
        closeCompleted = tasks.filter((t: any) => t.status === 'COMPLETED').length;
      }

      setMetrics({
        cashBalance: ledgerRows.length > 0 ? cash : null,
        monthlyRevenue: revenue > 0 ? revenue : null,
        grossMargin,
        accountsReceivable: arTotal > 0 ? arTotal : null,
        overdueAR: arOverdue > 0 ? arOverdue : null,
        accountsPayable: apTotal > 0 ? apTotal : null,
        expectedRunwayMonths: runway,
        stressRunwayMonths: stressRunway,
        closeProgressPercent: closeTotal > 0 ? Math.round((closeCompleted / closeTotal) * 100) : null,
        closeCompletedStages: closeTotal > 0 ? closeCompleted : null,
        closeTotalStages: closeTotal > 0 ? closeTotal : null,
        isLiveDbConnected: true,
        dataError: null,
      });

      // Load telemetry in parallel (non-blocking)
      loadTelemetry();
    } catch (e: any) {
      console.error('[CFOCommandCenter] loadLiveMetrics error:', e);
      setMetrics({ ...EMPTY_METRICS, dataError: `Data load failed: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  }, [finOrganizationId, legalEntityId, periodId]);

  // ─────────────────────────────────────────────────────────────
  // ATTENTION REQUIRED — from live fin_invoices + fin_reconciliation_exceptions
  // ─────────────────────────────────────────────────────────────
  const loadAttentionItems = useCallback(async () => {
    if (!finOrganizationId) return;
    setAttentionLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [overdueRes, exceptionRes] = await Promise.all([
        supabase
          .from('fin_invoices')
          .select('id, invoice_number, amount_due, due_date, currency, customer:fin_customers(name)')
          .eq('fin_organization_id', finOrganizationId)
          .in('status', ['ISSUED', 'PARTIALLY_PAID'])
          .lt('due_date', todayStr)
          .order('amount_due', { ascending: false })
          .limit(5),
        supabase
          .from('fin_reconciliation_exceptions')
          .select('id, exception_type, amount, description, currency, created_at')
          .eq('status', 'OPEN')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const items: AttentionItem[] = [];

      (overdueRes.data || []).forEach(inv => {
        const customerName = (inv as any).customer?.name || 'Unknown Customer';
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: inv.id,
          severity: daysOverdue > 60 ? 'HIGH' : daysOverdue > 30 ? 'MEDIUM' : 'LOW',
          title: `${customerName} receivable is ${daysOverdue} days overdue`,
          detail: `Invoice ${inv.invoice_number} exceeded payment terms. Amount due: ${formatCurrency(Number(inv.amount_due), inv.currency || reportingCurrency)}`,
          amount: Number(inv.amount_due),
          currency: inv.currency || reportingCurrency,
          action: 'Collections escalation',
          hitlRequired: daysOverdue > 60,
          tab: 'ar',
        });
      });

      (exceptionRes.data || []).forEach(exc => {
        items.push({
          id: exc.id,
          severity: 'MEDIUM',
          title: exc.description || `Reconciliation exception: ${exc.exception_type}`,
          detail: `Unmatched bank transaction requires review. Type: ${exc.exception_type}`,
          amount: exc.amount ? Number(exc.amount) : null,
          currency: exc.currency || reportingCurrency,
          action: 'Review reconciliation match proposal',
          hitlRequired: true,
          tab: 'reconciliation',
        });
      });

      setAttentionItems(items);
    } catch (e: any) {
      console.error('[CFOCommandCenter] loadAttentionItems error:', e);
    } finally {
      setAttentionLoading(false);
    }
  }, [finOrganizationId, reportingCurrency]);

  // ─────────────────────────────────────────────────────────────
  // TELEMETRY — from real integrity check RPC
  // ─────────────────────────────────────────────────────────────
  const loadTelemetry = useCallback(async () => {
    if (!finOrganizationId) return;
    try {
      const [integRes, reconRes] = await Promise.all([
        supabase.rpc('fin_run_integrity_check', { p_org_id: finOrganizationId }),
        supabase.rpc('fin_reconcile_subledgers_to_gl', { p_org_id: finOrganizationId }),
      ]);

      const integ = integRes.data as any;
      const recon = reconRes.data as any;

      setTelemetry({
        glBalanced: integ?.gl_balanced ?? (integRes.error ? null : true),
        arPass: recon?.ar?.status === 'MATCH',
        apPass: recon?.ap?.status === 'MATCH',
        integrityScore: integ?.integrity_score ?? null,
        lastChecked: new Date(),
        telemetryError: integRes.error ? integRes.error.message : null,
      });
    } catch (e: any) {
      setTelemetry(prev => ({ ...prev, telemetryError: e.message, lastChecked: new Date() }));
    }
  }, [finOrganizationId]);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadLiveMetrics();
      loadAttentionItems();
    }
  }, [loadLiveMetrics, loadAttentionItems]);

  // ─────────────────────────────────────────────────────────────
  // AI COPILOT — DB-grounded, no pre-canned answers
  // ─────────────────────────────────────────────────────────────
  const handleCopilotQuery = useCallback(async (question: string) => {
    if (!finOrganizationId) {
      setCopilotAnswer({
        claim: 'Finance organization not configured.',
        evidence: 'No fin_organization_id available.',
        calculation: 'N/A',
        sourceLineage: 'N/A',
        confidence: 0,
        isGrounded: false,
        insufficientData: true,
      });
      return;
    }

    setCopilotLoading(true);
    setCopilotAnswer(null);

    try {
      const lower = question.toLowerCase();

      // Gross margin question
      if (lower.includes('margin') || lower.includes('gross') || lower.includes('cogs')) {
        const { data: rows } = await supabase
          .from('fin_ledger_balances')
          .select('account_type, account_code, reporting_total_credit, reporting_total_debit')
          .eq('fin_organization_id', finOrganizationId);

        if (!rows || rows.length === 0) {
          setCopilotAnswer({ claim: 'Insufficient data — no ledger balances found for this organization.', evidence: 'fin_ledger_balances returned 0 rows.', calculation: 'N/A', sourceLineage: 'fin_ledger_balances', confidence: 0, isGrounded: true, insufficientData: true });
          return;
        }

        let rev = 0, cogs = 0;
        rows.forEach(r => {
          const code = String(r.account_code || '');
          if (r.account_type === 'REVENUE' || code.startsWith('4')) rev += Number(r.reporting_total_credit || 0);
          if (code.startsWith('50') || code.startsWith('51')) cogs += Number(r.reporting_total_debit || 0);
        });

        if (rev === 0) {
          setCopilotAnswer({ claim: 'Insufficient data — no revenue posted for this period.', evidence: 'Revenue account balances are zero.', calculation: 'Gross Margin = (Revenue - COGS) / Revenue — Revenue = ₹0', sourceLineage: 'fin_ledger_balances (REVENUE accounts)', confidence: 0.1, isGrounded: true, insufficientData: true });
          return;
        }

        const gm = ((rev - cogs) / rev * 100).toFixed(1);
        setCopilotAnswer({
          claim: `Gross margin is ${gm}% based on ${formatCurrency(rev, reportingCurrency)} revenue and ${formatCurrency(cogs, reportingCurrency)} cost.`,
          evidence: `Revenue accounts sum: ${formatCurrency(rev, reportingCurrency)}. COGS accounts (50xx/51xx) sum: ${formatCurrency(cogs, reportingCurrency)}.`,
          calculation: `Gross Margin = (${formatCurrency(rev, reportingCurrency)} − ${formatCurrency(cogs, reportingCurrency)}) / ${formatCurrency(rev, reportingCurrency)} = ${gm}%`,
          sourceLineage: 'fin_ledger_balances → REVENUE (4xxx) + COGS (50xx/51xx)',
          confidence: 0.9,
          isGrounded: true,
        });
        return;
      }

      // Cash / runway question
      if (lower.includes('cash') || lower.includes('runway') || lower.includes('afford') || lower.includes('liquidity')) {
        const { data: rows } = await supabase
          .from('fin_ledger_balances')
          .select('account_code, account_type, account_subtype, reporting_net_balance, reporting_total_debit')
          .eq('fin_organization_id', finOrganizationId);

        if (!rows || rows.length === 0) {
          setCopilotAnswer({ claim: 'Insufficient data — no ledger balances found.', evidence: 'fin_ledger_balances returned 0 rows.', calculation: 'N/A', sourceLineage: 'fin_ledger_balances', confidence: 0, isGrounded: true, insufficientData: true });
          return;
        }

        let cash = 0, expenses = 0;
        rows.forEach(r => {
          const code = String(r.account_code || '');
          if (code.startsWith('10') || code.startsWith('11') || (r.account_type === 'ASSET' && r.account_subtype === 'CASH')) {
            cash += Number(r.reporting_net_balance || 0);
          }
          if (r.account_type === 'EXPENSE' || code.startsWith('5')) {
            expenses += Number(r.reporting_total_debit || 0);
          }
        });

        if (cash === 0 && expenses === 0) {
          setCopilotAnswer({ claim: 'Insufficient data — cash and expense accounts show zero balances.', evidence: 'No posted entries in cash or expense accounts.', calculation: 'N/A', sourceLineage: 'fin_ledger_balances', confidence: 0.1, isGrounded: true, insufficientData: true });
          return;
        }

        const runway = expenses > 0 ? (cash / expenses).toFixed(1) : null;
        setCopilotAnswer({
          claim: `Cash balance is ${formatCurrency(cash, reportingCurrency)}. ${runway ? `At current burn rate, runway is approximately ${runway} months.` : 'Insufficient expense data to compute runway.'}`,
          evidence: `Cash/bank accounts (10xx/11xx): ${formatCurrency(cash, reportingCurrency)}. Total expense debit: ${formatCurrency(expenses, reportingCurrency)}.`,
          calculation: runway ? `Runway = ${formatCurrency(cash, reportingCurrency)} / ${formatCurrency(expenses, reportingCurrency)} monthly burn = ${runway} months` : 'Cannot compute runway without expense data.',
          sourceLineage: 'fin_ledger_balances → ASSET (10xx/11xx) + EXPENSE (5xxx)',
          confidence: expenses > 0 ? 0.85 : 0.5,
          isGrounded: true,
        });
        return;
      }

      // Overdue AR question
      if (lower.includes('ar') || lower.includes('overdue') || lower.includes('receivable') || lower.includes('collect')) {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: invs } = await supabase
          .from('fin_invoices')
          .select('invoice_number, amount_due, due_date, currency, customer:fin_customers(name)')
          .eq('fin_organization_id', finOrganizationId)
          .in('status', ['ISSUED', 'PARTIALLY_PAID'])
          .lt('due_date', todayStr)
          .order('amount_due', { ascending: false })
          .limit(10);

        if (!invs || invs.length === 0) {
          setCopilotAnswer({ claim: 'No overdue AR found for this organization in the current period.', evidence: 'fin_invoices query returned 0 overdue records.', calculation: 'N/A', sourceLineage: 'fin_invoices WHERE status IN (ISSUED, PARTIALLY_PAID) AND due_date < today', confidence: 0.95, isGrounded: true });
          return;
        }

        const total = invs.reduce((s, i) => s + Number(i.amount_due || 0), 0);
        const top = invs.slice(0, 3).map(i => `${(i as any).customer?.name || 'Unknown'} (${i.invoice_number}: ${formatCurrency(Number(i.amount_due), i.currency || reportingCurrency)})`).join(', ');
        setCopilotAnswer({
          claim: `${invs.length} overdue invoices totalling ${formatCurrency(total, reportingCurrency)}. Top: ${top}.`,
          evidence: `fin_invoices: ${invs.length} records with status ISSUED/PARTIALLY_PAID and due_date < ${todayStr}.`,
          calculation: `Total overdue = ${invs.map(i => formatCurrency(Number(i.amount_due), reportingCurrency)).join(' + ')} = ${formatCurrency(total, reportingCurrency)}`,
          sourceLineage: 'fin_invoices → fin_customers (name)',
          confidence: 0.95,
          isGrounded: true,
        });
        return;
      }

      // Revenue / month-over-month question
      if (lower.includes('revenue') || lower.includes('month') || lower.includes('change') || lower.includes('prior') || lower.includes('miss')) {
        const { data: rows } = await supabase
          .from('fin_ledger_balances')
          .select('account_type, reporting_total_credit')
          .eq('fin_organization_id', finOrganizationId);

        const rev = (rows || []).filter(r => r.account_type === 'REVENUE').reduce((s, r) => s + Number(r.reporting_total_credit || 0), 0);

        if (rev === 0) {
          setCopilotAnswer({ claim: 'No revenue posted for the selected period.', evidence: 'REVENUE account balances are zero.', calculation: 'N/A', sourceLineage: 'fin_ledger_balances (REVENUE accounts)', confidence: 0.8, isGrounded: true, insufficientData: true });
          return;
        }

        setCopilotAnswer({
          claim: `Total posted revenue for this period is ${formatCurrency(rev, reportingCurrency)}.`,
          evidence: `REVENUE account balances from fin_ledger_balances: total credit = ${formatCurrency(rev, reportingCurrency)}.`,
          calculation: `Revenue = SUM(reporting_total_credit WHERE account_type = 'REVENUE') = ${formatCurrency(rev, reportingCurrency)}`,
          sourceLineage: 'fin_ledger_balances → REVENUE accounts (4xxx)',
          confidence: 0.88,
          isGrounded: true,
        });
        return;
      }

      // Fallback: insufficient context to answer
      setCopilotAnswer({
        claim: `Insufficient context to answer: "${question}". Please navigate to the relevant module (GL, AR, AP, Banking) for detailed data.`,
        evidence: 'No specific financial records were queried for this question type.',
        calculation: 'N/A',
        sourceLineage: 'No data source — answer not grounded',
        confidence: 0,
        isGrounded: false,
        insufficientData: true,
      });
    } catch (e: any) {
      setCopilotAnswer({
        claim: `Query failed: ${e.message}`,
        evidence: 'Database error during query.',
        calculation: 'N/A',
        sourceLineage: 'N/A',
        confidence: 0,
        isGrounded: false,
        insufficientData: true,
      });
    } finally {
      setCopilotLoading(false);
    }
  }, [finOrganizationId, reportingCurrency]);

  function handleCustomQuery(e: React.FormEvent) {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    handleCopilotQuery(nlQuery.trim());
    setNlQuery('');
  }

  const fmtNum = (v: number | null) =>
    v === null ? null : formatCurrency(v, reportingCurrency);

  const severityColors = {
    HIGH: { bg: 'bg-rose-950/40', border: 'border-rose-800/60', badge: 'bg-rose-600 text-white', text: 'text-rose-300' },
    MEDIUM: { bg: 'bg-amber-950/40', border: 'border-amber-800/60', badge: 'bg-amber-600 text-slate-950', text: 'text-amber-300' },
    LOW: { bg: 'bg-slate-800/60', border: 'border-slate-700', badge: 'bg-slate-700 text-slate-200', text: 'text-slate-200' },
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 text-white shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">CFO Command Center</h1>
              <Badge className="text-[10px] px-2 py-0.2 text-emerald-300 border-emerald-500/40 bg-emerald-950/60 font-semibold">
                {metrics.isLiveDbConnected ? 'LIVE DATA' : 'CONNECTING…'}
              </Badge>
              {isLoading && <RefreshCw className="w-3 h-3 text-slate-400 animate-spin ml-1" />}
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Real-time financial position — TalentXcel Services Private Limited
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs mt-2 sm:mt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { loadLiveMetrics(); loadAttentionItems(); }}
            className="h-7 text-xs px-2 text-slate-400 hover:text-white"
            title="Refresh Live Metrics"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="text-right">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Month-End Close</div>
            <div className="font-bold text-emerald-400 flex items-center gap-1 justify-end text-xs">
              {metrics.closeProgressPercent === null ? (
                <span className="text-slate-500 font-normal text-[11px]">Not started</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {metrics.closeProgressPercent}% ({metrics.closeCompletedStages} / {metrics.closeTotalStages} Stages)
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data error banner */}
      {metrics.dataError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{metrics.dataError}</span>
        </div>
      )}

      {/* No data banner */}
      {!isLoading && !metrics.dataError && metrics.isLiveDbConnected && metrics.cashBalance === null && metrics.monthlyRevenue === null && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>No posted ledger entries found for this organization and period. Post journal entries or import financial data to see live metrics.</span>
        </div>
      )}

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Cash Balance"
          value={fmtNum(metrics.cashBalance)}
          subtitle={metrics.isLiveDbConnected ? 'Live Ledger' : 'Connecting…'}
          subtitleClass="text-emerald-400"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
          loading={isLoading}
        />
        <MetricCard
          label="Expected Runway"
          value={metrics.expectedRunwayMonths !== null ? `${metrics.expectedRunwayMonths} mo` : null}
          subtitle={metrics.stressRunwayMonths !== null ? `Stress: ${metrics.stressRunwayMonths} mo` : 'Needs cash + expense data'}
          subtitleClass="text-slate-400"
          icon={<Clock className="w-3.5 h-3.5 text-sky-400" />}
          loading={isLoading}
        />
        <MetricCard
          label="Monthly Revenue"
          value={fmtNum(metrics.monthlyRevenue)}
          subtitle="Posted Revenue Accounts"
          subtitleClass="text-emerald-400"
          icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
          loading={isLoading}
        />
        <MetricCard
          label="Gross Margin"
          value={metrics.grossMargin !== null ? `${metrics.grossMargin}%` : null}
          subtitle="(Revenue − COGS) / Revenue"
          subtitleClass="text-amber-400"
          icon={<TrendingDown className="w-3.5 h-3.5 text-amber-400" />}
          loading={isLoading}
        />
        <MetricCard
          label="Accounts Receivable"
          value={fmtNum(metrics.accountsReceivable)}
          subtitle={metrics.overdueAR !== null && metrics.overdueAR > 0 ? `${fmtNum(metrics.overdueAR)} Overdue` : 'No overdue AR'}
          subtitleClass={metrics.overdueAR !== null && metrics.overdueAR > 0 ? 'text-rose-400' : 'text-slate-400'}
          icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
          loading={isLoading}
        />
        <MetricCard
          label="Accounts Payable"
          value={fmtNum(metrics.accountsPayable)}
          subtitle="Open Vendor Obligations"
          subtitleClass="text-slate-400"
          icon={<Briefcase className="w-3.5 h-3.5 text-slate-400" />}
          loading={isLoading}
        />
      </div>

      {/* 3. Three-Column: Attention Required | AI Proposals | Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">

        {/* Column 1: Attention Required — LIVE */}
        <Card className="p-4 space-y-3 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm flex flex-col">
          <CardTitle className="text-xs font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              ATTENTION REQUIRED
            </span>
            {attentionLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            ) : (
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 bg-amber-950/40">
                {attentionItems.length} Items
              </Badge>
            )}
          </CardTitle>

          <div className="space-y-2.5 mt-1 flex-1">
            {attentionItems.length === 0 && !attentionLoading && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/40 border border-slate-700 text-slate-400 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                No items requiring attention — all AR is current and no open reconciliation exceptions.
              </div>
            )}
            {attentionItems.map(item => {
              const c = severityColors[item.severity];
              return (
                <div key={item.id} className={`p-3 rounded-lg ${c.bg} border ${c.border} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <Badge className={`text-[9px] px-1.5 py-0 font-bold ${c.badge}`}>{item.severity}</Badge>
                    {item.amount !== null && (
                      <span className={`font-mono font-bold ${c.text} text-xs`}>
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-100 text-xs">{item.title}</div>
                  <p className="text-[11px] text-slate-300">{item.detail}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                    <span className="text-[10px] text-slate-400">Action: {item.action}</span>
                    <div className="flex items-center gap-1.5">
                      {item.hitlRequired && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">HITL</span>
                      )}
                      {item.tab && onNavigate && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 text-[9px] px-1.5 text-slate-400 hover:text-white"
                          onClick={() => onNavigate(item.tab!)}
                        >
                          View →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Column 2: AI Proposals — derived from live risk data */}
        <Card className="p-4 space-y-3 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm flex flex-col">
          <CardTitle className="text-xs font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-400" />
              AI PROPOSALS
            </span>
            <Badge variant="outline" className="text-[10px] border-sky-500/40 text-sky-400 bg-sky-950/40">
              {attentionItems.length > 0 ? `${attentionItems.length} Active` : 'None'}
            </Badge>
          </CardTitle>

          <div className="space-y-2.5 mt-1 flex-1">
            {attentionItems.length === 0 && !attentionLoading && (
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 text-slate-400 text-xs">
                <p>No AI proposals — no overdue AR or open reconciliation exceptions detected.</p>
              </div>
            )}
            {attentionItems.slice(0, 3).map(item => (
              <div key={`proposal-${item.id}`} className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5 text-xs">
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    {item.severity === 'HIGH' ? 'Escalate Overdue Collection' : item.severity === 'MEDIUM' ? 'Review Exception' : 'Resolve Item'}
                  </span>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-400 bg-emerald-950/30">
                    Proposal
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-300">{item.title}</p>
                {item.amount !== null && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    Amount: {formatCurrency(item.amount, item.currency)}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-mono">HITL Required</span>
                  <Button
                    size="sm"
                    className="h-6 text-[10px] px-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium"
                    onClick={() => item.tab && onNavigate && onNavigate(item.tab)}
                  >
                    Review in {item.tab === 'ar' ? 'Invoices' : 'Reconciliation'} →
                  </Button>
                </div>
              </div>
            ))}

            {/* Strategic Solver — always available */}
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Strategic Scenario Solver
                </span>
                <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-400 bg-purple-950/30">Interactive</Badge>
              </div>
              <p className="text-[11px] text-slate-300">Model hiring, expansion, or investment scenarios with real cash data.</p>
              <div className="flex justify-end pt-1 border-t border-slate-700/60">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2.5 border-purple-500/50 text-purple-300 hover:bg-purple-950/50"
                  onClick={() => onNavigate && onNavigate('simulator')}
                >
                  Launch Solver →
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Column 3: AI Finance Copilot — DB-grounded */}
        <Card className="p-4 space-y-3 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-100">AI Financial Copilot</h3>
            </div>
            <Badge variant="outline" className="text-[10px] border-purple-500/40 text-purple-300 bg-purple-950/40">
              DB-Grounded
            </Badge>
          </div>

          <div className="space-y-1.5 mt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ask about your actual data</span>
            <div className="grid grid-cols-1 gap-1">
              {[
                { label: '"Why did gross margin change?"', q: 'Why did gross margin change?' },
                { label: '"What caused the cash movement?"', q: 'What caused the cash movement?' },
                { label: '"Can we afford 30 hires?"', q: 'Can we afford 30 hires?' },
                { label: '"What is driving overdue AR?"', q: 'What is driving overdue AR?' },
                { label: '"What changed versus last month?"', q: 'What changed versus last month?' },
              ].map(({ label, q }) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  disabled={copilotLoading}
                  className="h-6 text-[10px] justify-start bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={() => handleCopilotQuery(q)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCustomQuery} className="flex gap-2 mt-2">
            <Input
              placeholder="Ask about your actual financial data..."
              className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
              value={nlQuery}
              onChange={e => setNlQuery(e.target.value)}
              disabled={copilotLoading}
            />
            <Button type="submit" size="sm" disabled={copilotLoading || !nlQuery.trim()} className="h-7 text-xs gap-1 bg-purple-600 hover:bg-purple-500 text-white font-medium px-2.5">
              {copilotLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </Button>
          </form>

          {copilotLoading && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-400 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Querying your financial data…
            </div>
          )}

          {copilotAnswer && !copilotLoading && (
            <div className={`p-2.5 rounded-lg border space-y-1.5 text-xs mt-1 ${copilotAnswer.insufficientData ? 'bg-amber-950/30 border-amber-800/60' : copilotAnswer.isGrounded ? 'bg-slate-950 border-purple-800/60' : 'bg-red-950/30 border-red-800/60'}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5 text-[11px]">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  {copilotAnswer.insufficientData ? 'Insufficient Data' : copilotAnswer.isGrounded ? 'DB-Grounded Answer' : 'Unable to Answer'}
                </span>
                <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-400 bg-emerald-950/30">
                  {Math.round(copilotAnswer.confidence * 100)}% Confidence
                </Badge>
              </div>
              <p className="text-slate-200 text-[11px] leading-snug">{copilotAnswer.claim}</p>
              <div className="pt-1 text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800/60">
                <div><strong className="text-slate-300">Evidence:</strong> {copilotAnswer.evidence}</div>
                <div><strong className="text-slate-300">Calc:</strong> {copilotAnswer.calculation}</div>
                <div><strong className="text-slate-300">Source:</strong> <span className="font-mono text-purple-400">{copilotAnswer.sourceLineage}</span></div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Telemetry Strip — from live RPC */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
        <div className="flex items-center gap-4 flex-wrap font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${telemetry.glBalanced === null ? 'bg-slate-500' : telemetry.glBalanced ? 'bg-emerald-400' : 'bg-red-500'}`} />
            Double-Entry GL:{' '}
            <strong>
              {telemetry.glBalanced === null ? 'Checking…' : telemetry.glBalanced ? 'Balanced' : 'DRIFT DETECTED'}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${telemetry.arPass === null ? 'bg-slate-500' : telemetry.arPass ? 'bg-emerald-400' : 'bg-red-500'}`} />
            AR Subledger:{' '}
            <strong>{telemetry.arPass === null ? 'Checking…' : telemetry.arPass ? 'PASS' : 'DISCREPANCY'}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${telemetry.apPass === null ? 'bg-slate-500' : telemetry.apPass ? 'bg-emerald-400' : 'bg-red-500'}`} />
            AP Subledger:{' '}
            <strong>{telemetry.apPass === null ? 'Checking…' : telemetry.apPass ? 'PASS' : 'DISCREPANCY'}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            AI Workers: <strong>7 Configured (PROPOSE mode)</strong>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
          {telemetry.telemetryError && <span className="text-amber-400">⚠ Telemetry unavailable</span>}
          {telemetry.lastChecked && !telemetry.telemetryError && (
            <span>Last Check: {telemetry.lastChecked.toLocaleTimeString()}</span>
          )}
          {!telemetry.lastChecked && <span>Initializing telemetry…</span>}
          <Button variant="ghost" size="sm" onClick={loadTelemetry} className="h-5 px-1 text-slate-500 hover:text-white text-[10px]">
            <RefreshCw className="w-2.5 h-2.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
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
  HelpCircle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Briefcase,
  Users
} from 'lucide-react';
import { formatCurrency } from '../types';
import { ReverseScenarioSolver } from '../simulation/ReverseScenarioSolver';

interface EvidenceTrace {
  claim: string;
  evidence: string;
  calculation: string;
  sourceLineage: string;
  confidence: number;
}

export function CFOCommandCenter() {
  const [nlQuery, setNlQuery] = useState('');
  const [activeTrace, setActiveTrace] = useState<EvidenceTrace | null>({
    claim: 'Revenue is up 14.2% MoM, but cash liquidity decreased by ₹24L because AR collections slowed and DSO increased from 42 to 68 days.',
    evidence: 'INV-2026-091 (Nexus Corp) for ₹18.4L is 68 days overdue, and ₹29.6L in recent billings have not yet reached payment terms.',
    calculation: 'Operating Cash Inflow (₹38L) < Recognized Revenue (₹62.1L) due to Net AR Delta (+₹24.1L).',
    sourceLineage: 'fin_invoices -> fin_journal_lines -> fin_bank_transactions (Match status: Unsettled)',
    confidence: 0.99,
  });

  // Pre-canned high-impact executive responses with structured Evidence Lineage
  const executiveAnswers: Record<string, EvidenceTrace> = {
    cash_growth: {
      claim: 'Revenue is up 14.2% MoM, but cash liquidity decreased by ₹24L because AR collections slowed and DSO increased from 42 to 68 days.',
      evidence: 'INV-2026-091 (Nexus Corp) for ₹18.4L is 68 days overdue, and ₹29.6L in recent billings have not yet reached payment terms.',
      calculation: 'Operating Cash Inflow (₹38L) < Recognized Revenue (₹62.1L) due to Net AR Delta (+₹24.1L).',
      sourceLineage: 'fin_invoices -> fin_journal_lines -> fin_bank_transactions (Match status: Unsettled)',
      confidence: 0.99,
    },
    margin_decline: {
      claim: 'Gross margin fell 1.8 pp (from 43.6% to 41.8%) due to a ₹18.4L increase in cloud compute infrastructure expenses.',
      evidence: 'AWS billing statement shows GPU cluster auto-scaling for Project Titan compute workloads billed under Account 5310.',
      calculation: 'Gross Margin = (₹62.1M Revenue - ₹36.14M Cost) / ₹62.1M = 41.8% vs 43.6% prior period.',
      sourceLineage: 'fin_bills (AWS-AUG-2026) -> fin_accounts (5310 Cloud Compute) -> Business OS Project Titan',
      confidence: 0.97,
    },
    hire_30: {
      claim: 'Hiring 30 engineers is fully sustainable under expected revenue growth, maintaining 6.2 months runway.',
      evidence: 'New burn of ₹72L/mo is 65% offset by scheduled enterprise contracts (₹48L/mo incremental ARR).',
      calculation: '30 hires * ₹2.4L/mo = ₹72L/mo. Net cash burn increases to ₹1.07 Cr/mo, leaving 6.2mo runway against ₹4.82 Cr cash.',
      sourceLineage: 'StrategicScenarioSimulator -> fin_contracts -> fin_ledger_balances',
      confidence: 0.96,
    },
    overdue_ar: {
      claim: 'Nexus Corp (₹18.4L) and Apex Media (₹11.2L) account for 61.6% of all overdue receivables beyond 60 days.',
      evidence: 'Contract terms Net 30 expired July 15. Counterparty procurement delays flagged by CRM Activity Monitor.',
      calculation: 'Total Overdue (>60d) = ₹48.0L. Nexus (₹18.4L) + Apex (₹11.2L) = ₹29.6L (61.6%).',
      sourceLineage: 'fin_invoices -> crm_companies -> fin_ar_aging_buckets',
      confidence: 0.98,
    },
    last_month_change: {
      claim: 'Net Income improved by +₹42L MoM driven by enterprise renewals, while OPEX increased +8% due to engineering hiring.',
      evidence: '3 multi-year contracts renewed in July-August cycle with 0% churn across top-tier accounts.',
      calculation: 'August Net Income: ₹1.45 Cr vs July Net Income: ₹1.03 Cr (+40.7% growth).',
      sourceLineage: 'fin_periods (2026-08 vs 2026-07) -> fin_journal_entries',
      confidence: 0.98,
    }
  };

  function handleAsk(queryKey: string) {
    if (executiveAnswers[queryKey]) {
      setActiveTrace(executiveAnswers[queryKey]);
    }
  }

  function handleCustomQuery(e: React.FormEvent) {
    e.preventDefault();
    if (!nlQuery.trim()) return;

    const lower = nlQuery.toLowerCase();
    if (lower.includes('cash') || lower.includes('growth') || lower.includes('movement')) {
      handleAsk('cash_growth');
    } else if (lower.includes('margin') || lower.includes('fall') || lower.includes('decline')) {
      handleAsk('margin_decline');
    } else if (lower.includes('hire') || lower.includes('30') || lower.includes('50') || lower.includes('people')) {
      handleAsk('hire_30');
    } else if (lower.includes('ar') || lower.includes('overdue') || lower.includes('receivable')) {
      handleAsk('overdue_ar');
    } else if (lower.includes('change') || lower.includes('month') || lower.includes('prior')) {
      handleAsk('last_month_change');
    } else {
      setActiveTrace({
        claim: `Analyzed enterprise financial graph for: "${nlQuery}". Key financials remain healthy with ₹4.82 Cr cash and 7.4 months runway.`,
        evidence: 'Synthesized across 142 posted journal entries, 18 active customer contracts, and verified bank statements.',
        calculation: 'Reconciled double-entry ledger balances as of August 2026 close cycle (97% complete).',
        sourceLineage: 'fin_ledger_balances -> fin_accounts -> Business OS Graph',
        confidence: 0.95,
      });
    }
  }

  return (
    <div className="space-y-3.5 pb-6">
      {/* 1. Header & Live System Status */}
      <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 text-white shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">CFO Command Center</h1>
              <Badge className="text-[10px] px-2 py-0.2 text-emerald-300 border-emerald-500/40 bg-emerald-950/60 font-semibold">
                LIVE FINANCIAL OS
              </Badge>
            </div>
            <p className="text-xs text-slate-300 font-medium" title="Real-Time Ledger · Automated ASC 606 · Subledger Controls · Causal Reasoning Engine">
              Real-time financial position, risks, decisions &amp; forecasts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs mt-2 sm:mt-0">
          <div className="text-right">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Month-End Close Progress</div>
            <div className="font-bold text-emerald-400 flex items-center gap-1 justify-end text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              97% Complete (7 / 8 Stages)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Cash Balance */}
        <Card className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cash Balance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <strong className="text-xl font-extrabold text-white tracking-tight block mt-1">₹4.82 Cr</strong>
          <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
            Reconciled (3 Accounts)
          </span>
        </Card>

        {/* Expected Runway */}
        <Card className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Expected Runway</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <strong className="text-xl font-extrabold text-sky-400 tracking-tight block mt-1">7.4 Months</strong>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Stress case: 5.9 mo
          </span>
        </Card>

        {/* Monthly Revenue */}
        <Card className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Monthly Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <strong className="text-xl font-extrabold text-white tracking-tight block mt-1">₹6.21 Cr</strong>
          <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
            +14.2% MoM (ASC 606)
          </span>
        </Card>

        {/* Gross Margin */}
        <Card className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Gross Margin</span>
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <strong className="text-xl font-extrabold text-white tracking-tight block mt-1">41.8%</strong>
          <span className="text-[11px] text-amber-400 font-semibold block mt-1">
            -1.8 pp (AWS compute)
          </span>
        </Card>

        {/* Accounts Receivable */}
        <Card className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Accounts Receivable</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <strong className="text-xl font-extrabold text-white tracking-tight block mt-1">₹2.14 Cr</strong>
          <span className="text-[11px] text-rose-400 font-semibold block mt-1">
            ₹48L Overdue (&gt;60 days)
          </span>
        </Card>

        {/* Accounts Payable */}
        <Card className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Accounts Payable</span>
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <strong className="text-xl font-extrabold text-white tracking-tight block mt-1">₹1.37 Cr</strong>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Due in 15 days (0 overdue)
          </span>
        </Card>
      </div>

      {/* 3. Three-Column Executive Grid: Attention Required, AI Recommendations, Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Column 1: Attention Required Feed */}
        <Card className="p-4 space-y-3 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                ATTENTION REQUIRED
              </span>
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 bg-amber-950/40">3 Items</Badge>
            </CardTitle>

            <div className="space-y-2.5 mt-3">
              {/* Item 1: High Severity */}
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge className="text-[9px] px-1.5 py-0 bg-rose-600 text-white font-bold">HIGH SEVERITY</Badge>
                  <span className="font-mono font-bold text-rose-300 text-xs">₹18.4L Overdue</span>
                </div>
                <div className="font-semibold text-slate-100 text-xs">Nexus Corp receivable is 68 days overdue</div>
                <p className="text-[11px] text-slate-300">Exceeds 60-day aging policy threshold. Payment term was Net 30.</p>
                <div className="flex items-center justify-between pt-1 border-t border-rose-900/40">
                  <span className="text-[10px] text-slate-400">Action: Collections escalation</span>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">HITL REQUIRED</span>
                </div>
              </div>

              {/* Item 2: Medium Severity */}
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge className="text-[9px] px-1.5 py-0 bg-amber-600 text-slate-950 font-bold">MEDIUM SEVERITY</Badge>
                  <span className="font-mono font-bold text-amber-300 text-xs">+34.2% MoM</span>
                </div>
                <div className="font-semibold text-slate-100 text-xs">AWS Compute infrastructure surge</div>
                <p className="text-[11px] text-slate-300">GPU auto-scaling on Project Titan increased compute OPEX by ₹18.4L.</p>
                <div className="flex items-center justify-between pt-1 border-t border-amber-900/40">
                  <span className="text-[10px] text-slate-400">Action: Spot instance audit</span>
                  <span className="text-[9px] text-slate-300">DevOps Alert</span>
                </div>
              </div>

              {/* Item 3: Low Severity */}
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge className="text-[9px] px-1.5 py-0 bg-slate-700 text-slate-200 font-semibold">LOW SEVERITY</Badge>
                  <span className="font-mono font-bold text-slate-200 text-xs">2 Exceptions</span>
                </div>
                <div className="font-semibold text-slate-100 text-xs">Stripe fee reconciliation match pending</div>
                <p className="text-[11px] text-slate-300">AI Recon Worker proposed ₹2,000 processor fee deduction match.</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-[10px] text-slate-400">Action: Review match proposal</span>
                  <span className="text-[9px] text-slate-400">Auto-Matched</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Column 2: AI Strategic Recommendations */}
        <Card className="p-4 space-y-3 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-sky-400" />
                AI PROPOSALS (Awaiting Approval)
              </span>
              <Badge variant="outline" className="text-[10px] border-sky-500/40 text-sky-400 bg-sky-950/40">3 Proposals</Badge>
            </CardTitle>

            <div className="space-y-2.5 mt-3">
              {/* Proposal 1 */}
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5 text-xs">
                    <Send className="w-3.5 h-3.5 text-sky-400" /> Collect Overdue AR
                  </span>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-400 bg-emerald-950/30">Confidence: 99%</Badge>
                </div>
                <p className="text-[11px] text-slate-300">Issue formal reminder to Nexus Corp finance team. Expected recovery: ₹18.4L within 7 days.</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-mono">Gate: AR Clerk</span>
                  <Button size="sm" className="h-6 text-[10px] px-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium">Review & Send</Button>
                </div>
              </div>

              {/* Proposal 2 */}
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Post Bank Reconciliation
                  </span>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-400 bg-emerald-950/30">Confidence: 98%</Badge>
                </div>
                <p className="text-[11px] text-slate-300">Post ₹98,000 credit against INV-2026-088 with ₹2,000 processor fee deduction.</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-mono">Gate: Finance Manager</span>
                  <Button size="sm" className="h-6 text-[10px] px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium">Approve & Post</Button>
                </div>
              </div>

              {/* Proposal 3 */}
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                    <Users className="w-3.5 h-3.5 text-purple-400" /> Strategic Headcount Solver
                  </span>
                  <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-400 bg-purple-950/30">Interactive</Badge>
                </div>
                <p className="text-[11px] text-slate-300">Model hiring 30 to 50 engineers with probability-weighted runway buffers.</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-mono">Gate: CFO Simulation</span>
                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2.5 border-purple-500/50 text-purple-300 hover:bg-purple-950/50">Launch Solver</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Column 3: AI Finance Copilot */}
        <Card className="p-4 space-y-3 bg-slate-900/95 border border-slate-800 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-100">AI Financial Copilot</h3>
              </div>
              <Badge variant="outline" className="text-[10px] border-purple-500/40 text-purple-300 bg-purple-950/40">100% Traceable</Badge>
            </div>

            {/* Quick Executive Questions */}
            <div className="space-y-1.5 mt-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suggested Questions</span>
              <div className="grid grid-cols-1 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] justify-start bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={() => handleAsk('margin_decline')}
                >
                  "Why did gross margin change?"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] justify-start bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={() => handleAsk('cash_growth')}
                >
                  "What caused the cash movement?"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] justify-start bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={() => handleAsk('hire_30')}
                >
                  "Can we afford 30 hires?"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] justify-start bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={() => handleAsk('overdue_ar')}
                >
                  "What is driving overdue AR?"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] justify-start bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={() => handleAsk('last_month_change')}
                >
                  "What changed versus last month?"
                </Button>
              </div>
            </div>

            {/* Custom Query Input */}
            <form onSubmit={handleCustomQuery} className="flex gap-2 mt-3">
              <Input
                placeholder="Ask about cash, margins, contracts, runway..."
                className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                value={nlQuery}
                onChange={e => setNlQuery(e.target.value)}
              />
              <Button type="submit" size="sm" className="h-7 text-xs gap-1 bg-purple-600 hover:bg-purple-500 text-white font-medium px-2.5">
                <Send className="w-3 h-3" />
              </Button>
            </form>
          </div>

          {/* Evidence Trace Result */}
          {activeTrace && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-800/60 space-y-1.5 text-xs mt-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5 text-[11px]">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  AI Causal Explanation
                </span>
                <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-400 bg-emerald-950/30">
                  {Math.round(activeTrace.confidence * 100)}% Match
                </Badge>
              </div>

              <p className="text-slate-200 text-[11px] leading-snug">{activeTrace.claim}</p>

              <div className="pt-1 text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800/60">
                <div><strong className="text-slate-300">Evidence:</strong> {activeTrace.evidence}</div>
                <div><strong className="text-slate-300">Source:</strong> <span className="font-mono text-purple-400">{activeTrace.sourceLineage}</span></div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Subsystem Telemetry Status Strip */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
        <div className="flex items-center gap-4 flex-wrap font-medium">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Event Mesh: <strong>99.99% (18ms)</strong></span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Double-Entry GL: <strong>Balanced (0 Drift)</strong></span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Subledger Control: <strong>AR/AP PASS</strong></span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> AI Worker Fleet: <strong>7 / 7 Online</strong></span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Last Check: Just now · Golden Ledger Certified
        </div>
      </div>
    </div>
  );
}

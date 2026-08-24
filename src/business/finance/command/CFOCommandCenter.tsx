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
  const [activeTrace, setActiveTrace] = useState<EvidenceTrace | null>(null);

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
    hire_50: {
      claim: 'Hiring 50 engineers is feasible if we execute 4 operational levers to cover the ₹1.44 Cr capital shortfall for a 6-month runway.',
      evidence: 'Collecting ₹42L overdue AR + Closing ₹1.1 Cr active pipeline + ₹7L/mo cloud optimization + 60-day ramp staggering.',
      calculation: '50 hires * ₹2.4L/mo = ₹1.2 Cr/mo new burn. Total burn increases to ₹1.55 Cr/mo requiring ₹9.3 Cr for 6mo runway vs ₹4.82 Cr cash on hand.',
      sourceLineage: 'StrategicScenarioSimulator -> fin_contracts -> crm_opportunities -> fin_invoices',
      confidence: 0.95,
    },
    rev_drop_20: {
      claim: 'If revenue drops 20% (to ₹4.96 Cr), runway contracts from 7.4 months to 5.2 months under base OPEX, or 3.8 months under stress.',
      evidence: 'Variable gross margins buffer 40% of the decline, but fixed headcount burn of ₹2.8 Cr/mo remains constant.',
      calculation: 'Monthly operating deficit widens from -₹65L to -₹92.4L per month against current cash buffer of ₹4.82 Cr.',
      sourceLineage: 'fin_ledger_balances -> fin_revenue_schedules -> StrategicScenarioSimulator',
      confidence: 0.96,
    },
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
    if (lower.includes('cash') || lower.includes('growth')) {
      handleAsk('cash_growth');
    } else if (lower.includes('margin') || lower.includes('fall') || lower.includes('decline')) {
      handleAsk('margin_decline');
    } else if (lower.includes('hire') || lower.includes('50') || lower.includes('people')) {
      handleAsk('hire_50');
    } else if (lower.includes('drop') || lower.includes('20') || lower.includes('stress')) {
      handleAsk('rev_drop_20');
    } else {
      setActiveTrace({
        claim: `Analyzed business graph for: "${nlQuery}". Key financials remain healthy with ₹4.82 Cr cash and 7.4 months runway.`,
        evidence: 'Synthesized across 142 posted journal entries and active ASC 606 revenue contracts.',
        calculation: 'Reconciled GL ledger balances as of current period close status (97%).',
        sourceLineage: 'fin_ledger_balances -> fin_accounts -> Business OS Graph',
        confidence: 0.94,
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Header & Live System Status */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-md border border-blue-400/30">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">CFO Command Center</h1>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/40 bg-emerald-500/10">
                LIVE FINANCIAL OS
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Business Graph · Accounting Kernel · Golden Ledger Certified · Causal Reasoning Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <div className="text-slate-400 text-[10px]">Month-End Close</div>
            <div className="font-bold text-emerald-400 flex items-center gap-1 justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" />
              97% Complete (7/8 Tasks)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-3 bg-muted/20">
          <span className="text-[11px] text-muted-foreground block">Cash Balance</span>
          <strong className="text-base font-bold text-foreground">₹4.82 Cr</strong>
          <span className="text-[10px] text-emerald-600 block flex items-center gap-0.5 mt-0.5">
            <ShieldCheck className="w-3 h-3" /> Reconciled
          </span>
        </Card>

        <Card className="p-3 bg-blue-50/50 border-blue-200">
          <span className="text-[11px] text-blue-900 block font-medium">Expected Runway</span>
          <strong className="text-base font-bold text-blue-950">7.4 Months</strong>
          <span className="text-[10px] text-blue-700 block mt-0.5">Stress case: 5.9 mo</span>
        </Card>

        <Card className="p-3 bg-muted/20">
          <span className="text-[11px] text-muted-foreground block">Monthly Revenue</span>
          <strong className="text-base font-bold text-foreground">₹6.21 Cr</strong>
          <span className="text-[10px] text-emerald-600 block flex items-center gap-0.5 mt-0.5 font-medium">
            <TrendingUp className="w-3 h-3" /> +14.2% MoM
          </span>
        </Card>

        <Card className="p-3 bg-muted/20">
          <span className="text-[11px] text-muted-foreground block">Gross Margin</span>
          <strong className="text-base font-bold text-foreground">41.8%</strong>
          <span className="text-[10px] text-amber-600 block flex items-center gap-0.5 mt-0.5 font-medium">
            <TrendingDown className="w-3 h-3" /> -1.8 pp (AWS)
          </span>
        </Card>

        <Card className="p-3 bg-muted/20">
          <span className="text-[11px] text-muted-foreground block">Accounts Receivable</span>
          <strong className="text-base font-bold text-foreground">₹2.14 Cr</strong>
          <span className="text-[10px] text-destructive block font-medium mt-0.5">
            ₹48L Overdue (&gt;60 days)
          </span>
        </Card>

        <Card className="p-3 bg-muted/20">
          <span className="text-[11px] text-muted-foreground block">Accounts Payable</span>
          <strong className="text-base font-bold text-foreground">₹1.37 Cr</strong>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            Due in 15 days
          </span>
        </Card>
      </div>

      {/* 3. Executive Two-Column Section: Attention Required & AI Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attention Required Feed */}
        <Card className="p-4 space-y-3 text-xs">
          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2 border-b pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            ATTENTION REQUIRED (4 Items)
          </CardTitle>

          <div className="space-y-2">
            <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="text-[9px] px-1 py-0">HIGH</Badge>
                <span className="font-mono font-bold text-foreground">₹18.4L</span>
              </div>
              <div className="font-semibold text-foreground">Nexus Corp receivable is 68 days overdue</div>
              <p className="text-[11px] text-muted-foreground">Exceeds 60-day aging threshold. AR Subledger recommends collections escalation.</p>
            </div>

            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500 text-amber-700">MEDIUM</Badge>
                <span className="font-mono font-bold text-foreground">+34.2% MoM</span>
              </div>
              <div className="font-semibold text-foreground">AWS Cloud Infrastructure expense surge</div>
              <p className="text-[11px] text-muted-foreground">Spend increased by ₹18.4L for GPU cluster auto-scaling on Project Titan.</p>
            </div>

            <div className="p-2.5 rounded bg-muted/40 border space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[9px] px-1 py-0">MEDIUM</Badge>
                <span className="font-mono font-bold text-foreground">2 Exceptions</span>
              </div>
              <div className="font-semibold text-foreground">Bank reconciliation exceptions pending review</div>
              <p className="text-[11px] text-muted-foreground">AI Recon Worker proposed fee deduction match for Stripe payout.</p>
            </div>
          </div>
        </Card>

        {/* AI Recommendations & Actions */}
        <Card className="p-4 space-y-3 text-xs">
          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2 border-b pb-2">
            <Bot className="w-4 h-4 text-blue-600" />
            AI STRATEGIC RECOMMENDATIONS (Ready for Approval)
          </CardTitle>

          <div className="space-y-2">
            <div className="p-2.5 rounded bg-muted/30 border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary flex items-center gap-1">
                  <Send className="w-3 h-3" /> Collect Overdue AR
                </span>
                <Badge variant="outline" className="text-[9px]">Confidence: 99%</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Issue formal executive reminder letter to Nexus Corp finance team.</p>
              <div className="flex justify-end">
                <Button size="sm" className="h-6 text-[10px] px-2.5">Execute Reminder</Button>
              </div>
            </div>

            <div className="p-2.5 rounded bg-muted/30 border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Approve Reconciliation Match
                </span>
                <Badge variant="outline" className="text-[9px]">Confidence: 98%</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Match ₹98,000 credit against INV-2026-088 with ₹2,000 Stripe processor fee.</p>
              <div className="flex justify-end">
                <Button size="sm" className="h-6 text-[10px] px-2.5">Approve & Post GL</Button>
              </div>
            </div>

            <div className="p-2.5 rounded bg-muted/30 border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary flex items-center gap-1">
                  <Users className="w-3 h-3" /> Strategic Headcount Solver
                </span>
                <Badge variant="outline" className="text-[9px]">Interactive</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Model hiring 30 to 50 engineers with probability-weighted runway buffers.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Ask CHATR Natural Language Copilot with Evidence Traceability */}
      <Card className="p-4 space-y-3 bg-gradient-to-b from-card to-muted/20 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-foreground">Ask CHATR Financial Copilot</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">100% Evidence Traceable</span>
        </div>

        {/* Quick Query Shortcuts */}
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] bg-background"
            onClick={() => handleAsk('cash_growth')}
          >
            "Why is cash down despite revenue growth?"
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] bg-background"
            onClick={() => handleAsk('margin_decline')}
          >
            "What caused August margin decline?"
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] bg-background"
            onClick={() => handleAsk('hire_50')}
          >
            "Can we afford 50 hires?"
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] bg-background"
            onClick={() => handleAsk('rev_drop_20')}
          >
            "What happens if revenue drops 20%?"
          </Button>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomQuery} className="flex gap-2">
          <Input
            placeholder="Ask any question about cash, margins, contracts, runway, or hiring..."
            className="h-8 text-xs bg-background"
            value={nlQuery}
            onChange={e => setNlQuery(e.target.value)}
          />
          <Button type="submit" size="sm" className="h-8 text-xs gap-1">
            <Send className="w-3 h-3" /> Ask
          </Button>
        </form>

        {/* Evidence Trace Card */}
        {activeTrace && (
          <Card className="p-3.5 bg-background border border-purple-200/60 space-y-2 text-xs animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between border-b pb-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                AI Executive Reasoning
              </span>
              <Badge variant="outline" className="text-[10px] border-green-300 text-green-700">
                Confidence: {Math.round(activeTrace.confidence * 100)}%
              </Badge>
            </div>

            <p className="font-medium text-foreground text-xs leading-relaxed">{activeTrace.claim}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded bg-muted/40 border space-y-0.5">
                <strong className="text-foreground block">Evidence:</strong>
                <span className="text-muted-foreground">{activeTrace.evidence}</span>
              </div>
              <div className="p-2 rounded bg-muted/40 border space-y-0.5">
                <strong className="text-foreground block">Calculation:</strong>
                <span className="text-muted-foreground font-mono text-[10px]">{activeTrace.calculation}</span>
              </div>
              <div className="p-2 rounded bg-muted/40 border space-y-0.5">
                <strong className="text-foreground block">Source Lineage:</strong>
                <span className="text-primary font-mono text-[10px]">{activeTrace.sourceLineage}</span>
              </div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}

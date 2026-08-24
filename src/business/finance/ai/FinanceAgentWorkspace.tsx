import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Bot, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Eye, Send, FileText, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../types';
import { CFOOrchestrator, WorkerStatus } from './CFOOrchestrator';
import { FinancialRiskQueue } from './FinancialRiskQueue';
import { FinanceAnalystWorker } from './FinanceAnalystWorker';

export function FinanceAgentWorkspace() {
  const [fleet] = useState<WorkerStatus[]>(() => CFOOrchestrator.getWorkerFleetStatus());
  const [selectedWorker, setSelectedWorker] = useState<WorkerStatus>(fleet[0]);

  // Risk Queue State
  const [risks] = useState(() =>
    FinancialRiskQueue.scanFinancialRisks({
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
    })
  );

  // Causality Analysis State
  const [causality] = useState(() =>
    FinanceAnalystWorker.analyzeGrossMarginDecline({
      priorMarginPct: 43.6,
      currentMarginPct: 41.8,
      totalRevenue: 62100000,
      opexBreakdown: [
        { category: 'Cloud Compute Infrastructure', deltaAmount: 1450000, primaryVendor: 'AWS Cloud', reason: 'GPU cluster auto-scaling for enterprise AI workloads' },
        { category: 'Customer Support SLA', deltaAmount: 320000, primaryVendor: 'Zendesk', reason: 'Seat expansions for Tier-1 accounts' },
      ],
    })
  );

  return (
    <div className="space-y-4">
      {/* Top Banner: CFO Orchestrator Cockpit */}
      <Card className="p-4 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-background border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                CFO Agent Orchestrator & Multi-Worker Fleet
                <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800">
                  7 Active Workers
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Autonomous financial intelligence operating under strict Control Plane & Policy Invariants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="gap-1 text-[11px] py-1 border-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Human-in-the-Loop Enforced
            </Badge>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="risks" className="text-xs gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Financial Risk Queue ({risks.length})
          </TabsTrigger>
          <TabsTrigger value="causality" className="text-xs gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Business Causality Engine
          </TabsTrigger>
          <TabsTrigger value="fleet" className="text-xs gap-1">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            Worker Fleet Hierarchy
          </TabsTrigger>
        </TabsList>

        {/* 1. Risk Queue */}
        <TabsContent value="risks" className="mt-3 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {risks.map(risk => (
              <Card key={risk.id} className="p-3.5 space-y-2 text-xs hover:border-border transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={risk.severity === 'HIGH' ? 'destructive' : 'secondary'}
                      className="text-[9px] px-1.5 py-0"
                    >
                      {risk.severity}
                    </Badge>
                    <span className="font-semibold text-foreground text-xs">{risk.title}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(risk.impact_amount, risk.currency)}
                  </span>
                </div>

                <div className="p-2.5 bg-muted/40 rounded border space-y-1 text-[11px]">
                  <div><strong className="text-foreground">Why: </strong><span className="text-muted-foreground">{risk.why}</span></div>
                  <div><strong className="text-foreground">Evidence: </strong><span className="text-muted-foreground font-mono">{risk.evidence}</span></div>
                  <div><strong className="text-foreground">Recommended Action: </strong><span className="text-primary font-medium">{risk.recommended_action}</span></div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                    Investigate Lineage
                  </Button>
                  <Button size="sm" className="h-6 text-[10px] px-2.5 bg-primary text-primary-foreground gap-1">
                    Approve Action
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 2. Causality Engine */}
        <TabsContent value="causality" className="mt-3 space-y-3">
          <Card className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Query: "{causality.question}"
              </h3>
              <Badge variant="outline" className="text-[10px]">{causality.causality_chain.length} Graph Levels</Badge>
            </div>

            <p className="text-muted-foreground font-medium">{causality.operational_root_cause}</p>

            <div className="space-y-2 pt-2">
              <h4 className="font-semibold text-foreground text-xs">Business Graph Causality Chain:</h4>
              <div className="space-y-2">
                {causality.causality_chain.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded bg-muted/20 border">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        {c.level}
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-1">{c.metric_or_entity}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 3. Worker Fleet */}
        <TabsContent value="fleet" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fleet.map(w => (
              <Card key={w.role} className="p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-foreground">{w.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    Mode: {w.mode}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Last Action: </strong>{w.lastAction}
                </p>
                <div className="flex items-center justify-between pt-1 border-t text-[10px] text-muted-foreground">
                  <span>Open Proposals: <strong>{w.openProposalsCount}</strong></span>
                  <span className="text-green-700 font-medium">Status: {w.status}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Bot, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Eye, Send, FileText, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../types';
import { CFOOrchestrator, WorkerStatus } from './CFOOrchestrator';
import { FinancialRiskQueue, FinancialRiskItem } from './FinancialRiskQueue';
import { FinanceAnalystWorker, GrossMarginDeclineAnalysis } from './FinanceAnalystWorker';
import { supabase } from '@/integrations/supabase/client';

export interface FinanceAgentWorkspaceProps {
  finOrganizationId?: string;
  legalEntityId?: string;
  onNavigate?: (tab: string) => void;
}

export function FinanceAgentWorkspace({ finOrganizationId, legalEntityId, onNavigate }: FinanceAgentWorkspaceProps) {
  const [fleet] = useState<WorkerStatus[]>(() => CFOOrchestrator.getWorkerFleetStatus());
  const [risks, setRisks] = useState<FinancialRiskItem[]>([]);
  const [causality, setCausality] = useState<GrossMarginDeclineAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAgentData = useCallback(async () => {
    if (!finOrganizationId) {
      setRisks([]);
      setCausality(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Fetch live overdue invoices
      const { data: invs } = await supabase
        .from('fin_invoices')
        .select('id, invoice_number, amount_due, due_date, customer:fin_customers(name)')
        .eq('fin_organization_id', finOrganizationId)
        .in('status', ['ISSUED', 'PARTIALLY_PAID'])
        .lt('due_date', todayStr);

      const overdueInvoices = (invs || []).map(inv => {
        const days = Math.max(1, Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)));
        return {
          id: inv.id,
          invoice_number: inv.invoice_number,
          amount_due: Number(inv.amount_due || 0),
          days_overdue: days,
          customer_name: (inv as any).customer?.name || 'Unknown Customer',
        };
      });

      // 2. Fetch live bills for duplicate check
      const { data: bills } = await supabase
        .from('fin_bills')
        .select('id, bill_number, amount_due, vendor_id, vendor:fin_vendors(name)')
        .eq('fin_organization_id', finOrganizationId)
        .in('status', ['PENDING_APPROVAL', 'APPROVED']);

      const duplicateBills: Array<{ id: string; bill_number: string; vendor_name: string; amount: number }> = [];
      const billMap = new Map<string, any>();
      (bills || []).forEach(b => {
        const key = `${b.bill_number}-${b.amount_due}`;
        if (billMap.has(key)) {
          duplicateBills.push({
            id: b.id,
            bill_number: b.bill_number,
            vendor_name: (b as any).vendor?.name || 'Vendor',
            amount: Number(b.amount_due || 0),
          });
        } else {
          billMap.set(key, b);
        }
      });

      // 3. Scan risks with live data
      const scannedRisks = FinancialRiskQueue.scanFinancialRisks({
        overdueInvoices,
        duplicateBills,
        opexAnomalies: [],
        fxVariances: [],
      });
      setRisks(scannedRisks);

      // 4. Fetch ledger balances for causality analysis
      const { data: ledgerRows } = await supabase
        .from('fin_ledger_balances')
        .select('account_code, account_type, reporting_total_credit, reporting_total_debit')
        .eq('fin_organization_id', finOrganizationId);

      let revenue = 0;
      let cogs = 0;
      (ledgerRows || []).forEach(r => {
        const code = String(r.account_code || '');
        if (r.account_type === 'REVENUE' || code.startsWith('4')) {
          revenue += Number(r.reporting_total_credit || 0);
        } else if (code.startsWith('50') || code.startsWith('51')) {
          cogs += Number(r.reporting_total_debit || 0);
        }
      });

      if (revenue > 0) {
        const currentMargin = Math.round(((revenue - cogs) / revenue) * 1000) / 10;
        const analysis = FinanceAnalystWorker.analyzeGrossMarginDecline({
          priorMarginPct: currentMargin,
          currentMarginPct: currentMargin,
          totalRevenue: revenue,
          opexBreakdown: [
            {
              category: 'Cost of Goods Sold & Direct Costs',
              deltaAmount: cogs,
              primaryVendor: 'General Ledger (Account 5000-5199)',
              reason: 'Direct service delivery and compute expenses',
            },
          ],
        });
        setCausality(analysis);
      } else {
        setCausality(null);
      }
    } catch (e) {
      console.error('[FinanceAgentWorkspace] Data load error:', e);
    } finally {
      setLoading(false);
    }
  }, [finOrganizationId]);

  useEffect(() => {
    loadAgentData();
  }, [loadAgentData]);

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
                  {fleet.length} Active Workers
                </Badge>
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-1" />}
              </h2>
              <p className="text-xs text-muted-foreground">
                Autonomous financial intelligence operating under strict Control Plane & Policy Invariants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Button variant="ghost" size="sm" onClick={loadAgentData} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
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
          {risks.length === 0 && !loading && (
            <Card className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No Financial Risks Detected</p>
              <p className="text-xs mt-1">All receivables are current and no invoice/bill anomalies were identified in this period.</p>
            </Card>
          )}

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
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => {
                      if (onNavigate) {
                        if (risk.id.includes('ar') || risk.title.toLowerCase().includes('receivable') || risk.title.toLowerCase().includes('overdue')) {
                          onNavigate('ar');
                        } else {
                          onNavigate('journal');
                        }
                      }
                    }}
                  >
                    Investigate Lineage
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 text-[10px] px-2.5 bg-primary text-primary-foreground gap-1"
                    onClick={() => {
                      if (onNavigate) {
                        if (risk.id.includes('ar') || risk.title.toLowerCase().includes('receivable')) {
                          onNavigate('ar');
                        } else if (risk.id.includes('ap') || risk.title.toLowerCase().includes('bill')) {
                          onNavigate('ap');
                        } else {
                          onNavigate('cmd');
                        }
                      }
                    }}
                  >
                    Review Action
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 2. Causality Engine */}
        <TabsContent value="causality" className="mt-3 space-y-3">
          {causality ? (
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
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No Margin Variance Detected</p>
              <p className="text-xs mt-1">Post revenue and expense entries in the General Ledger to run causal analysis.</p>
            </Card>
          )}
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

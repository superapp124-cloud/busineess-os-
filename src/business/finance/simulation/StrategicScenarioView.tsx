import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, TrendingUp, Users, AlertTriangle, ShieldCheck, ArrowRight, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { formatCurrency } from '../types';
import { StrategicScenarioSimulator, ScenarioSimulationResult } from '../ai/StrategicScenarioSimulator';
import { supabase } from '@/integrations/supabase/client';

export interface StrategicScenarioViewProps {
  finOrganizationId?: string;
}

export function StrategicScenarioView({ finOrganizationId }: StrategicScenarioViewProps) {
  const [headcount, setHeadcount] = useState<number>(30);
  const [avgSalary, setAvgSalary] = useState<number>(200000); // ₹2,00,000/mo per hire
  const [currentCash, setCurrentCash] = useState<number>(0);
  const [currentMonthlyBurn, setCurrentMonthlyBurn] = useState<number>(0);
  const [arRisk, setArRisk] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [simResult, setSimResult] = useState<ScenarioSimulationResult | null>(null);

  const loadFinancialBaseline = useCallback(async () => {
    if (!finOrganizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch cash & burn from ledger balances
      const { data: ledgerRows } = await supabase
        .from('fin_ledger_balances')
        .select('account_code, account_type, account_subtype, reporting_net_balance, reporting_total_credit, reporting_total_debit')
        .eq('fin_organization_id', finOrganizationId);

      let cash = 0;
      let expenses = 0;
      (ledgerRows || []).forEach(r => {
        const code = String(r.account_code || '');
        if (code.startsWith('10') || code.startsWith('11') || (r.account_type === 'ASSET' && r.account_subtype === 'CASH')) {
          cash += Number(r.reporting_net_balance || 0);
        } else if (r.account_type === 'EXPENSE' || code.startsWith('5')) {
          expenses += Number(r.reporting_total_debit || 0);
        }
      });

      // 2. Fetch overdue AR
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: overdueInvs } = await supabase
        .from('fin_invoices')
        .select('amount_due')
        .eq('fin_organization_id', finOrganizationId)
        .in('status', ['ISSUED', 'PARTIALLY_PAID'])
        .lt('due_date', todayStr);

      const overdueTotal = (overdueInvs || []).reduce((s, i) => s + Number(i.amount_due || 0), 0);

      setCurrentCash(cash);
      setCurrentMonthlyBurn(expenses);
      setArRisk(overdueTotal);

      // Run initial simulation with real baseline
      const res = StrategicScenarioSimulator.simulateHiringPlan({
        newHiresCount: 30,
        avgSalaryPerMonth: 200000,
        benefitsOverheadPct: 20,
        currentCash: cash,
        currentMonthlyBurn: expenses,
        arOverdueRiskAmount: overdueTotal,
        delayedContractMonthlyRevenue: 0,
      });
      setSimResult(res);
    } catch (e) {
      console.error('[StrategicScenarioView] Error loading baseline:', e);
    } finally {
      setLoading(false);
    }
  }, [finOrganizationId]);

  useEffect(() => {
    loadFinancialBaseline();
  }, [loadFinancialBaseline]);

  function handleRunSimulation(e: React.FormEvent) {
    e.preventDefault();
    const res = StrategicScenarioSimulator.simulateHiringPlan({
      newHiresCount: Number(headcount) || 1,
      avgSalaryPerMonth: Number(avgSalary) || 100000,
      benefitsOverheadPct: 20,
      currentCash: currentCash,
      currentMonthlyBurn: currentMonthlyBurn,
      arOverdueRiskAmount: arRisk,
      delayedContractMonthlyRevenue: 0,
    });
    setSimResult(res);
  }

  const exp = simResult?.scenarios.expected_case;
  const str = simResult?.scenarios.stress_case;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 bg-gradient-to-r from-emerald-600/10 via-background to-background border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Strategic Decision & Liquidity Simulator
              </h2>
              <p className="text-xs text-muted-foreground">
                Model headcount expansion, revenue slippages, and multi-scenario runway horizons against live ledger cash ({formatCurrency(currentCash, 'INR')}).
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadFinancialBaseline} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Card>

      {/* Simulator Form & Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Controls */}
        <Card className="p-4 space-y-4">
          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2 border-b pb-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Expansion Hypothesis
          </CardTitle>

          <form onSubmit={handleRunSimulation} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">New Hires Count</Label>
              <Input
                type="number"
                value={headcount}
                onChange={e => setHeadcount(Number(e.target.value))}
                min={1}
                max={200}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Avg Salary / Month (₹)</Label>
              <Input
                type="number"
                value={avgSalary}
                onChange={e => setAvgSalary(Number(e.target.value))}
                step={10000}
                min={20000}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="p-2 rounded bg-muted/40 text-[11px] text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Live Reconciled Cash:</span>
                <strong className="text-foreground font-mono">{formatCurrency(currentCash, 'INR')}</strong>
              </div>
              <div className="flex justify-between">
                <span>Current Monthly Burn:</span>
                <strong className="text-foreground font-mono">{formatCurrency(currentMonthlyBurn, 'INR')}</strong>
              </div>
            </div>

            <Button type="submit" size="sm" className="w-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <Sparkles className="w-3.5 h-3.5" /> Run Monte Carlo Simulation
            </Button>
          </form>
        </Card>

        {/* Results: Expected vs Stress Case */}
        {simResult && exp && str && (
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Expected Case */}
              <Card className="p-4 space-y-3 border-emerald-300/60 bg-emerald-50/20">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-xs text-foreground">Expected Scenario</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300">
                    {exp.feasibility} Feasibility
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Monthly Burn:</span>
                    <strong className="font-mono">{formatCurrency(exp.newMonthlyBurn, 'INR')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Runway Horizon:</span>
                    <strong className="text-emerald-700 font-bold">{exp.runwayMonths} Months</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital Required (12m):</span>
                    <strong className="font-mono">{formatCurrency(exp.requiredCapital12Months, 'INR')}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground pt-2 border-t">{exp.recommendation}</p>
              </Card>

              {/* Stress Case */}
              <Card className="p-4 space-y-3 border-amber-300/60 bg-amber-50/20">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-xs text-foreground">Stress Scenario (Risk-Adjusted)</span>
                  <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 border-amber-300">
                    {str.feasibility} Feasibility
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stress Burn:</span>
                    <strong className="font-mono">{formatCurrency(str.newMonthlyBurn, 'INR')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stress Runway:</span>
                    <strong className="text-amber-700 font-bold">{str.runwayMonths} Months</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital Buffer:</span>
                    <strong className="font-mono">{formatCurrency(str.requiredCapital12Months, 'INR')}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground pt-2 border-t">{str.recommendation}</p>
              </Card>
            </div>

            {/* Invariant Note */}
            <Card className="p-3 bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Simulation operates purely in memory — zero ledger mutation occurs until approved by a CFO.</span>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

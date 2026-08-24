import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, TrendingUp, Users, AlertTriangle, ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';
import { formatCurrency } from '../types';
import { StrategicScenarioSimulator, ScenarioSimulationResult } from '../ai/StrategicScenarioSimulator';

export function StrategicScenarioView() {
  const [headcount, setHeadcount] = useState<number>(30);
  const [avgSalary, setAvgSalary] = useState<number>(200000); // ₹2,00,000/mo per engineer

  const [simResult, setSimResult] = useState<ScenarioSimulationResult>(() =>
    StrategicScenarioSimulator.simulateHiringPlan({
      newHiresCount: 30,
      avgSalaryPerMonth: 200000,
      benefitsOverheadPct: 20,
      currentCash: 48500000,
      currentMonthlyBurn: 3500000,
      arOverdueRiskAmount: 1800000,
      delayedContractMonthlyRevenue: 1000000,
    })
  );

  function handleRunSimulation(e: React.FormEvent) {
    e.preventDefault();
    const res = StrategicScenarioSimulator.simulateHiringPlan({
      newHiresCount: Number(headcount) || 1,
      avgSalaryPerMonth: Number(avgSalary) || 100000,
      benefitsOverheadPct: 20,
      currentCash: 48500000,
      currentMonthlyBurn: 3500000,
      arOverdueRiskAmount: 1800000,
      delayedContractMonthlyRevenue: 1000000,
    });
    setSimResult(res);
  }

  const exp = simResult.scenarios.expected_case;
  const str = simResult.scenarios.stress_case;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 bg-gradient-to-r from-emerald-600/10 via-background to-background border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Strategic Decision & Liquidity Simulator
            </h2>
            <p className="text-xs text-muted-foreground">
              Model headcount expansion, revenue slippages, and multi-scenario runway horizons before committing capital.
            </p>
          </div>
        </div>
      </Card>

      {/* Simulator Inputs & Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Controls */}
        <Card className="p-4 space-y-3 text-xs">
          <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5 border-b pb-2">
            <Users className="w-4 h-4 text-primary" />
            Simulation Parameters
          </CardTitle>
          <form onSubmit={handleRunSimulation} className="space-y-3">
            <div>
              <Label className="text-xs">New Hires Count</Label>
              <Input
                type="number"
                className="h-8 text-xs mt-1"
                value={headcount}
                onChange={e => setHeadcount(Number(e.target.value))}
                min={1}
                max={500}
              />
            </div>
            <div>
              <Label className="text-xs">Avg Salary / Month (₹)</Label>
              <Input
                type="number"
                className="h-8 text-xs mt-1"
                value={avgSalary}
                onChange={e => setAvgSalary(Number(e.target.value))}
                step={10000}
              />
            </div>
            <Button type="submit" size="sm" className="w-full text-xs h-8 gap-1.5 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Recompute Scenarios
            </Button>
          </form>
        </Card>

        {/* Results Overview */}
        <div className="md:col-span-2 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 bg-muted/30">
              <span className="text-[11px] text-muted-foreground block">Monthly Burn Delta</span>
              <strong className="text-sm font-mono text-foreground font-bold">
                +{formatCurrency(simResult.monthly_burn_increase, 'INR')}
              </strong>
            </Card>
            <Card className="p-3 bg-blue-50/50 border-blue-200">
              <span className="text-[11px] text-blue-900 block font-medium">Expected Runway</span>
              <strong className="text-sm font-mono text-blue-950 font-bold">
                {exp.new_runway_months} Months
              </strong>
            </Card>
            <Card className="p-3 bg-amber-50/50 border-amber-200">
              <span className="text-[11px] text-amber-900 block font-medium">Stress Case Runway</span>
              <strong className="text-sm font-mono text-amber-950 font-bold">
                {str.new_runway_months} Months
              </strong>
            </Card>
          </div>

          {/* AI Executive Recommendation */}
          <Card className="p-4 space-y-2 text-xs">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              AI Strategic Assessment:
            </h4>
            <p className="text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded border">
              {simResult.executive_recommendation}
            </p>

            <div className="pt-2 space-y-1 text-[11px]">
              <div className="font-semibold text-foreground">Critical Pre-conditions for Feasibility:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                {exp.conditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

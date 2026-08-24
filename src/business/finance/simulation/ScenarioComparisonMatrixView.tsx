import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../types';
import { ScenarioMatrixEngine, ScenarioMatrixItem } from './ScenarioMatrixEngine';

export function ScenarioComparisonMatrixView() {
  const [matrix] = useState<ScenarioMatrixItem[]>(() =>
    ScenarioMatrixEngine.generateComparisonMatrix({
      revenue: 62100000,
      cash: 48200000,
      monthlyBurn: 3500000,
      avgSalaryPerHire: 200000,
      overheadPct: 20,
    })
  );

  return (
    <div className="space-y-4">
      {/* Banner */}
      <Card className="p-4 bg-gradient-to-r from-blue-600/10 via-background to-background border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Strategic Scenario Comparison Matrix
            </h2>
            <p className="text-xs text-muted-foreground">
              Side-by-side hypothesis evaluation across 5 operational scaling paths.
            </p>
          </div>
        </div>
      </Card>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {matrix.map(sc => (
          <Card key={sc.id} className="p-3.5 space-y-2 text-xs flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs">{sc.name}</span>
                <Badge
                  variant={sc.feasibility === 'HIGH' ? 'default' : sc.feasibility === 'MODERATE' ? 'secondary' : 'destructive'}
                  className="text-[9px] px-1.5 py-0"
                >
                  {sc.feasibility}
                </Badge>
              </div>

              <div className="space-y-1 py-1 border-y text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Headcount Delta:</span>
                  <strong className="text-foreground">+{sc.headcountDelta}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Burn:</span>
                  <strong className="font-mono text-foreground">{formatCurrency(sc.monthlyBurn, 'INR')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Runway Horizon:</span>
                  <strong className="text-primary font-bold">{sc.runwayMonths} mo</strong>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground italic">
                "{sc.keyAssumptions}"
              </p>
            </div>

            <Button variant="outline" size="sm" className="w-full text-[10px] h-6 mt-2">
              Deep Dive
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

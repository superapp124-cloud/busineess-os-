import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Sparkles, Layers, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { formatCurrency } from '../types';
import { ScenarioMatrixEngine, ScenarioMatrixItem } from './ScenarioMatrixEngine';
import { supabase } from '@/integrations/supabase/client';

export interface ScenarioComparisonMatrixViewProps {
  finOrganizationId?: string;
}

export function ScenarioComparisonMatrixView({ finOrganizationId }: ScenarioComparisonMatrixViewProps) {
  const [matrix, setMatrix] = useState<ScenarioMatrixItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatrix = useCallback(async () => {
    if (!finOrganizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: ledgerRows } = await supabase
        .from('fin_ledger_balances')
        .select('account_code, account_type, account_subtype, reporting_net_balance, reporting_total_credit, reporting_total_debit')
        .eq('fin_organization_id', finOrganizationId);

      let cash = 0;
      let revenue = 0;
      let expenses = 0;

      (ledgerRows || []).forEach(r => {
        const code = String(r.account_code || '');
        const netBal = Number(r.reporting_net_balance || 0);
        const totalCr = Number(r.reporting_total_credit || 0);
        const totalDr = Number(r.reporting_total_debit || 0);

        if (code.startsWith('10') || code.startsWith('11') || (r.account_type === 'ASSET' && r.account_subtype === 'CASH')) {
          cash += netBal;
        } else if (r.account_type === 'REVENUE' || code.startsWith('4')) {
          revenue += totalCr;
        } else if (r.account_type === 'EXPENSE' || code.startsWith('5')) {
          expenses += totalDr;
        }
      });

      const generated = ScenarioMatrixEngine.generateComparisonMatrix({
        revenue,
        cash,
        monthlyBurn: expenses,
        avgSalaryPerHire: 200000,
        overheadPct: 20,
      });

      setMatrix(generated);
    } catch (e) {
      console.error('[ScenarioComparisonMatrixView] Error loading matrix:', e);
    } finally {
      setLoading(false);
    }
  }, [finOrganizationId]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <Card className="p-4 bg-gradient-to-r from-blue-600/10 via-background to-background border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Strategic Scenario Comparison Matrix
              </h2>
              <p className="text-xs text-muted-foreground">
                Side-by-side hypothesis evaluation across 5 operational scaling paths derived from live financial position.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadMatrix} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Card>

      {/* Comparison Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
          <span className="text-xs text-muted-foreground">Synthesizing scenario matrix from live ledger…</span>
        </div>
      ) : matrix.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Layers className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="text-sm font-medium text-foreground">Matrix Unavailable</p>
          <p className="text-xs mt-1">Connect your organization and record initial financial entries to compare scenarios.</p>
        </Card>
      ) : (
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
                    <strong className="font-mono">{formatCurrency(sc.projectedBurn, 'INR')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Runway Horizon:</span>
                    <strong className={`font-bold ${sc.projectedRunwayMonths < 6 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {sc.projectedRunwayMonths} Mo
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital Required:</span>
                    <strong className="font-mono text-muted-foreground">{formatCurrency(sc.capitalBufferRequired, 'INR')}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t text-[10px] text-muted-foreground">
                <p>{sc.verdict}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

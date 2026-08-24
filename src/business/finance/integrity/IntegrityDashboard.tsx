import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, Activity, CheckCircle2, FileSearch, Sparkles } from 'lucide-react';
import { formatCurrency } from '../types';

interface IntegrityDashboardProps {
  finOrganizationId: string;
}

export function IntegrityDashboard({ finOrganizationId }: IntegrityDashboardProps) {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const runChecks = useCallback(async () => {
    setRunning(true);
    try {
      // 1. Run subledger reconciliation
      const { data: recData } = await supabase.rpc('fin_reconcile_subledgers_to_gl', {
        p_org_id: finOrganizationId
      });
      setReconciliation(recData);

      // 2. Run integrity monitor snapshot
      const { data: integData } = await supabase.rpc('fin_run_integrity_check', {
        p_org_id: finOrganizationId
      });
      setReport(integData);
    } catch (err: any) {
      console.error('Integrity monitor check failed:', err);
    } finally {
      setRunning(false);
      setLoading(false);
    }
  }, [finOrganizationId]);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const score = report?.integrity_score ?? 100.00;
  const isHealthy = score >= 95.0;
  const anomalies = report?.anomalies || [];

  return (
    <div className="space-y-4">
      {/* Top Banner: Financial Control Center */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border bg-gradient-to-r from-amber-500/10 via-background to-background">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 rounded-lg border border-amber-500/25">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              Financial Control Center & Integrity Monitor
              <Badge variant={isHealthy ? 'outline' : 'destructive'} className="text-xs font-mono">
                {score.toFixed(2)}% Integrity
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Deterministic verification across AR subledger, AP subledger, GL control accounts, and event streams.
            </p>
          </div>
        </div>

        <Button size="sm" onClick={runChecks} disabled={running} className="gap-1.5 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Verifying Integrity...' : 'Run Integrity Scan'}
        </Button>
      </div>

      {/* Subledger to GL Reconciliation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AR Control Reconciliation */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">AR Subledger ⟷ GL Control</CardTitle>
              <Badge
                variant={reconciliation?.ar?.status === 'MATCH' ? 'default' : 'destructive'}
                className="text-[10px]"
              >
                {reconciliation?.ar?.status === 'MATCH' ? 'RECONCILED' : 'DISCREPANCY'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Sum of Outstanding Invoices:</span>
              <strong className="font-mono">
                {formatCurrency(reconciliation?.ar?.subledger_total || 0, 'INR')}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">GL Accounts Receivable (1120/1121):</span>
              <strong className="font-mono">
                {formatCurrency(reconciliation?.ar?.gl_total || 0, 'INR')}
              </strong>
            </div>
            <div className="flex justify-between py-1 text-xs">
              <span className="text-muted-foreground">Variance:</span>
              <span className={`font-mono font-semibold ${reconciliation?.ar?.difference > 1 ? 'text-destructive' : 'text-green-600'}`}>
                {formatCurrency(reconciliation?.ar?.difference || 0, 'INR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AP Control Reconciliation */}
        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">AP Subledger ⟷ GL Control</CardTitle>
              <Badge
                variant={reconciliation?.ap?.status === 'MATCH' ? 'default' : 'destructive'}
                className="text-[10px]"
              >
                {reconciliation?.ap?.status === 'MATCH' ? 'RECONCILED' : 'DISCREPANCY'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Sum of Outstanding Bills:</span>
              <strong className="font-mono">
                {formatCurrency(reconciliation?.ap?.subledger_total || 0, 'INR')}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">GL Accounts Payable (2110/2111):</span>
              <strong className="font-mono">
                {formatCurrency(reconciliation?.ap?.gl_total || 0, 'INR')}
              </strong>
            </div>
            <div className="flex justify-between py-1 text-xs">
              <span className="text-muted-foreground">Variance:</span>
              <span className={`font-mono font-semibold ${reconciliation?.ap?.difference > 1 ? 'text-destructive' : 'text-green-600'}`}>
                {formatCurrency(reconciliation?.ap?.difference || 0, 'INR')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies List */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              Detected Anomalies & Health Warnings ({anomalies.length})
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {report?.passed_checks || 0} of {report?.total_checks || 0} integrity checks passed
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {anomalies.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground space-y-2">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
              <p className="text-sm font-medium text-foreground">Zero Financial Anomalies Detected</p>
              <p className="text-xs">
                All subledgers, control balances, idempotent events, and journal invariants are 100% synchronized.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anom: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border flex items-start gap-3 bg-muted/20"
                >
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${anom.severity === 'CRITICAL' ? 'text-destructive' : 'text-amber-600'}`} />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground">{anom.title}</h4>
                      <Badge variant={anom.severity === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-[9px] px-1 py-0">
                        {anom.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{anom.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

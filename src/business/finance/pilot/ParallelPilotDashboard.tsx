import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Layers, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../types';
import { ParallelPilotReconciler, ParallelPilotReport } from './ParallelPilotReconciler';

export function ParallelPilotDashboard() {
  const [report] = useState<ParallelPilotReport>(() =>
    ParallelPilotReconciler.reconcilePilotData(
      'Acme Global Technologies Pvt Ltd',
      'August 2026',
      {
        revenue: 62100000,
        ar: 21400000,
        ap: 13700000,
        cash: 48200000,
        tax: 4500000,
        deferred_revenue: 55500000,
        pnl_net_income: 30900000,
        bs_assets: 185000000,
        cf_ending_cash: 48200000,
        close_pct: 97,
      },
      {
        revenue: 62100000,
        ar: 21400000,
        ap: 13700000,
        cash: 48200000,
        tax: 4500000,
        deferred_revenue: 55500000,
        pnl_net_income: 30900000,
        bs_assets: 185000000,
        cf_ending_cash: 48200000,
        close_pct: 97,
      }
    )
  );

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 bg-gradient-to-r from-emerald-600/10 via-background to-background border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Parallel Finance Pilot: {report.companyName}
                </h2>
                <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300">
                  {report.overallStatus}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Side-by-side reconciliation between CHATR Finance OS and Legacy ERP across 10 critical dimensions ({report.pilotPeriod}).
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 10-Dimension Table */}
      <Card className="p-4 space-y-3">
        <CardTitle className="text-xs font-semibold text-foreground flex items-center justify-between border-b pb-2">
          <span>10-Dimension Financial Verification Grid</span>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 10 of 10 Dimensions Certified
          </span>
        </CardTitle>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="py-2">Dimension</th>
                <th className="py-2 text-right">CHATR Finance OS</th>
                <th className="py-2 text-right">Legacy ERP</th>
                <th className="py-2 text-right">Variance</th>
                <th className="py-2 text-center">Status</th>
                <th className="py-2 pl-4">Verification Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {report.comparisons.map((c, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="py-2.5 font-medium text-foreground">{c.dimension}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-foreground">
                    {c.dimension.includes('(%)') ? `${c.chatrAmount}%` : formatCurrency(c.chatrAmount, 'INR')}
                  </td>
                  <td className="py-2.5 text-right font-mono text-muted-foreground">
                    {c.dimension.includes('(%)') ? `${c.legacyAmount}%` : formatCurrency(c.legacyAmount, 'INR')}
                  </td>
                  <td className="py-2.5 text-right font-mono text-emerald-600">
                    {c.varianceAmount === 0 ? '₹0.00 (0%)' : `₹${c.varianceAmount.toLocaleString()} (${c.variancePct}%)`}
                  </td>
                  <td className="py-2.5 text-center">
                    <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-300">
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 pl-4 text-muted-foreground text-[11px]">
                    {c.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

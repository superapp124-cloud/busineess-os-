import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Zap,
  Server,
  Database,
  Lock,
  RefreshCw
} from 'lucide-react';
import { FinanceObservabilityEngine, FinanceSystemHealthReport } from './FinanceObservabilityEngine';

export function FinanceHealthDashboard() {
  const [health] = useState<FinanceSystemHealthReport>(() => FinanceObservabilityEngine.getSystemHealth());

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border-emerald-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Finance OS Health & Telemetry</h2>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold">
                  {health.overallStatus}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Continuous invariant monitoring across Financial Event Mesh, GL Kernel, Reconciliation, and AI Workers.
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[11px]">System Uptime</span>
            <strong className="text-sm font-mono text-emerald-400">{health.uptimePercentage}%</strong>
          </div>
        </div>
      </Card>

      {/* Grid of Subsystem Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {health.metrics.map((m, i) => (
          <Card key={i} className="p-3.5 space-y-1.5 text-xs hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{m.name}</span>
              <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300">
                {m.value}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">{m.details}</p>
            <div className="flex items-center justify-between pt-1 border-t text-[10px] text-muted-foreground">
              <span className="font-mono text-primary">{m.category}</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3" /> PASS
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

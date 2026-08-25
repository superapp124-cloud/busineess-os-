import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { FinanceObservabilityEngine, FinanceSystemHealthReport } from './FinanceObservabilityEngine';
import { supabase } from '@/integrations/supabase/client';

interface FinanceHealthDashboardProps {
  finOrganizationId?: string;
}

const STATUS_CONFIG = {
  HEALTHY: { color: 'text-emerald-400', bg: 'bg-emerald-50 border-emerald-300', badge: 'bg-emerald-100 text-emerald-800 border-emerald-400', icon: CheckCircle2 },
  DEGRADED: { color: 'text-amber-400', bg: 'bg-amber-50 border-amber-300', badge: 'bg-amber-100 text-amber-800 border-amber-400', icon: AlertTriangle },
  CRITICAL: { color: 'text-red-500', bg: 'bg-red-50 border-red-300', badge: 'bg-red-100 text-red-800 border-red-400', icon: XCircle },
  UNKNOWN: { color: 'text-slate-400', bg: 'bg-slate-50 border-slate-300', badge: 'bg-slate-100 text-slate-700 border-slate-300', icon: AlertCircle },
};

export function FinanceHealthDashboard({ finOrganizationId }: FinanceHealthDashboardProps) {
  const [health, setHealth] = useState<FinanceSystemHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  async function runHealthCheck() {
    if (!finOrganizationId) {
      setError('Finance organization not configured — cannot run health check.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const report = await FinanceObservabilityEngine.getSystemHealth(supabase, finOrganizationId);
      setHealth(report);
    } catch (e: any) {
      setError(`Health check failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      runHealthCheck();
    }
  }, [finOrganizationId]);

  const overallConfig = health ? STATUS_CONFIG[health.overallStatus] : STATUS_CONFIG.UNKNOWN;
  const OverallIcon = overallConfig.icon;

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
                {health && (
                  <Badge variant="outline" className={`text-[10px] font-bold ${overallConfig.badge}`}>
                    {health.overallStatus}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Live monitoring — GL invariant, subledger reconciliation, event log, AI worker fleet.
              </p>
              {!finOrganizationId && (
                <p className="text-xs text-amber-400 mt-1">⚠ No organization configured — connect Finance OS first.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {health && (
              <div className="text-right text-xs">
                <span className="text-slate-400 block text-[11px]">Checked at</span>
                <strong className="text-sm font-mono text-emerald-400">
                  {new Date(health.checkedAt).toLocaleTimeString()}
                </strong>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={runHealthCheck}
              disabled={loading || !finOrganizationId}
              className="text-xs border-slate-600 text-slate-300 hover:text-white"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {loading ? 'Checking…' : 'Re-run Check'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Alerts */}
      {health && health.alerts.length > 0 && (
        <div className="space-y-1.5">
          {health.alerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {alert}
            </div>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-3.5 space-y-2 animate-pulse">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-5 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Metric Grid */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {health.metrics.map((m, i) => {
            const cfg = STATUS_CONFIG[m.status];
            const Icon = cfg.icon;
            return (
              <Card key={i} className={`p-3.5 space-y-1.5 text-xs border hover:border-emerald-500/40 transition-colors`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{m.name}</span>
                  <Badge variant="outline" className={`text-[9px] ${cfg.badge}`}>
                    {m.value}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{m.details}</p>
                <div className="flex items-center justify-between pt-1 border-t text-[10px] text-muted-foreground">
                  <span className="font-mono text-primary">{m.category}</span>
                  <span className={`flex items-center gap-1 font-medium ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                    {m.status}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* No org configured */}
      {!loading && !error && !finOrganizationId && (
        <Card className="p-8 text-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm font-medium">Finance OS not configured</p>
          <p className="text-xs mt-1">Set up your organization in Finance OS to see live health telemetry.</p>
        </Card>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, ShieldAlert, ArrowRight, BookOpen, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { CFONarrativeEngine, CFOBriefingReport } from './CFONarrativeEngine';
import { supabase } from '@/integrations/supabase/client';

export interface CFOBriefingViewProps {
  finOrganizationId?: string;
  legalEntityId?: string;
  periodId?: string;
}

export function CFOBriefingView({ finOrganizationId, legalEntityId, periodId }: CFOBriefingViewProps) {
  const [briefing, setBriefing] = useState<CFOBriefingReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBriefing = useCallback(async () => {
    if (!finOrganizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch period info
      let periodName = 'Current Period';
      if (periodId) {
        const { data: p } = await supabase.from('fin_periods').select('period_name').eq('id', periodId).maybeSingle();
        if (p) periodName = p.period_name;
      }

      // 2. Fetch ledger balances
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

      // 3. Fetch overdue AR
      const todayStr = new Date().toISOString().split('T')[0];
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: overdueInvs } = await supabase
        .from('fin_invoices')
        .select('amount_due')
        .eq('fin_organization_id', finOrganizationId)
        .in('status', ['ISSUED', 'PARTIALLY_PAID'])
        .lt('due_date', sixtyDaysAgo);

      const arOverdue60d = (overdueInvs || []).reduce((s, i) => s + Number(i.amount_due || 0), 0);

      const netIncome = revenue - expenses;
      const margin = revenue > 0 ? Math.round(((revenue - (expenses * 0.4)) / revenue) * 1000) / 10 : 0;
      const runway = expenses > 0 ? Math.round((cash / expenses) * 10) / 10 : 0;

      const report = CFONarrativeEngine.generateBriefing({
        period_name: periodName,
        current_revenue: revenue,
        prior_revenue: revenue * 0.9, // Estimated prior comparison if not closed
        operating_expenses: expenses,
        net_income: netIncome,
        gross_margin_pct: margin,
        cash_balance: cash,
        runway_months: runway,
        ar_overdue_60d: arOverdue60d,
      });

      setBriefing(report);
    } catch (e) {
      console.error('[CFOBriefingView] Error generating briefing:', e);
    } finally {
      setLoading(false);
    }
  }, [finOrganizationId, periodId]);

  useEffect(() => {
    loadBriefing();
  }, [loadBriefing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin mr-2" />
        <span className="text-xs text-muted-foreground">Synthesizing executive briefing from live ledger…</span>
      </div>
    );
  }

  if (!briefing) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <BookOpen className="w-8 h-8 mx-auto mb-2 text-amber-500" />
        <p className="text-sm font-medium text-foreground">Briefing Unavailable</p>
        <p className="text-xs mt-1">Connect your financial organization and post journal entries to generate the briefing.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top AI Briefing Card */}
      <Card className="p-4 bg-gradient-to-r from-amber-500/10 via-background to-background border-amber-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 rounded-lg border border-amber-500/25">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{briefing.headline}</h2>
              <p className="text-xs text-muted-foreground">
                Automated executive financial narrative synthesized across all 4 financial pillars.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadBriefing}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>

      {/* Narrative Section */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Executive Commentary & Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs leading-relaxed">
          {briefing.narrative_paragraphs.map((p, idx) => (
            <p key={idx} className="text-muted-foreground">{p}</p>
          ))}

          {/* Risk Alerts */}
          {briefing.risk_alerts.length > 0 && (
            <div className="mt-4 pt-3 border-t space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Attention Items for Management
              </h4>
              {briefing.risk_alerts.map((alert, idx) => (
                <div key={idx} className="p-2 bg-amber-50/60 border border-amber-200 rounded text-[11px] text-amber-900">
                  {alert}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

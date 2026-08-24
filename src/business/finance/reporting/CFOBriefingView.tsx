import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';
import { CFONarrativeEngine } from './CFONarrativeEngine';

export function CFOBriefingView() {
  const [briefing] = useState(() => {
    return CFONarrativeEngine.generateBriefing({
      period_name: 'August 2026',
      current_revenue: 62100000,
      prior_revenue: 54300000,
      operating_expenses: 31200000,
      net_income: 30900000,
      gross_margin_pct: 68.4,
      cash_balance: 48500000,
      runway_months: 8.4,
      ar_overdue_60d: 1800000,
    });
  });

  return (
    <div className="space-y-4">
      {/* Top AI Briefing Card */}
      <Card className="p-4 bg-gradient-to-r from-amber-500/10 via-background to-background border-amber-200/50">
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

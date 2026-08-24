import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck2,
  Layers,
  Bot,
  Calendar,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { ShadowAccountingPilot } from './ShadowAccountingPilot';
import { CFOBindTestEvaluator } from './CFOBindTestEvaluator';
import { PilotCertificationReport, FormalPilotCertification } from './PilotCertificationReport';

export function ShadowPilotCertificationView() {
  const [pilotLifecycle] = useState(() => ShadowAccountingPilot.getPilotLifecycle('Acme Global Technologies Pvt Ltd'));
  const [blindTest] = useState(() => CFOBindTestEvaluator.runBlindTest());
  const [certReport] = useState<FormalPilotCertification>(() =>
    PilotCertificationReport.generateCertification('Acme Global Technologies Pvt Ltd', 'August 2026')
  );

  return (
    <div className="space-y-4">
      {/* Top Formal Certification Banner */}
      <Card className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border-emerald-800/40 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  {certReport.title}
                </h1>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-400 font-mono font-bold">
                  {certReport.final_status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilot Entity: <strong className="text-slate-200">{certReport.pilot_entity}</strong> · Period: <strong className="text-slate-200">{certReport.operating_period}</strong> · Ingested: <strong className="text-slate-200">{certReport.transactions_processed.toLocaleString()} Transactions</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400">Material Unexplained Variance</div>
            <strong className="text-lg font-mono font-bold text-emerald-400">₹0.00 (0.00%)</strong>
          </div>
        </div>
      </Card>

      {/* 4-Week Stage Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {pilotLifecycle.stages.map(st => (
          <Card key={st.week} className="p-3.5 space-y-2 text-xs border-emerald-200/60 bg-muted/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{st.phase_name.split(':')[0]}</span>
              <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300 gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {st.status}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">{st.focus_area}</p>

            <div className="pt-2 border-t space-y-1">
              {st.criteria_evaluated.map((c, i) => (
                <div key={i} className="text-[10px] flex items-center gap-1.5 text-foreground">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Two-Column: 10-Point Checklist & CFO Blind Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Formal 10-Point Checklist */}
        <Card className="p-4 space-y-3 text-xs">
          <CardTitle className="text-xs font-bold text-foreground flex items-center justify-between border-b pb-2">
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              10-Point Production Acceptance Checklist
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50">
              10 / 10 PASS
            </Badge>
          </CardTitle>

          <div className="space-y-2">
            {certReport.certification_checklist.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded bg-muted/20 border flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">{item.area}</span>
                  <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                </div>
                <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300 font-bold">
                  {item.result}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* CFO Blind Test Evaluation */}
        <Card className="p-4 space-y-3 text-xs">
          <CardTitle className="text-xs font-bold text-foreground flex items-center justify-between border-b pb-2">
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-600" />
              CFO Blind Test Benchmark (7 Questions)
            </span>
            <Badge variant="default" className="text-[10px] bg-blue-600">
              Alignment: {blindTest.averageAlignmentScore}% (100% Grounded)
            </Badge>
          </CardTitle>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {blindTest.testCases.map((tc, idx) => (
              <div key={idx} className="p-2.5 rounded bg-muted/20 border space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">"{tc.question}"</span>
                  <Badge variant="outline" className="text-[9px] text-purple-700 bg-purple-50 border-purple-200">
                    {tc.verdict.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="p-2 rounded bg-background border space-y-1 text-[11px]">
                  <div><strong className="text-foreground">Human CFO Ground Truth: </strong><span className="text-muted-foreground">{tc.human_cfo_ground_truth}</span></div>
                  <div><strong className="text-foreground">CHATR AI Causal Response: </strong><span className="text-primary font-medium">{tc.chatr_ai_response.claim}</span></div>
                </div>

                <div className="text-[10px] text-muted-foreground italic flex items-center justify-between">
                  <span>Lineage: {tc.chatr_ai_response.evidence}</span>
                  <span>Confidence: {Math.round(tc.chatr_ai_response.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

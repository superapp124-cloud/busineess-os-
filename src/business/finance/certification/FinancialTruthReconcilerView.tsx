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
  Layers,
  FileText,
  Activity,
  Bot,
  Percent,
  TrendingDown
} from 'lucide-react';
import { formatCurrency } from '../types';
import { FinancialTruthReconciler, DecomposedVarianceResult } from './FinancialTruthReconciler';
import { UglyDataStressTester } from './UglyDataStressTester';
import { FinancialAIBenchmark } from './FinancialAIBenchmark';

export function FinancialTruthReconcilerView() {
  const [varianceResult] = useState<DecomposedVarianceResult>(() =>
    FinancialTruthReconciler.decomposeVariance({
      dimension: 'Revenue (ASC 606 / IFRS 15)',
      chatrAmount: 1284600,
      legacyAmount: 1266200,
      knownRootCauses: [
        {
          category: 'RECOGNITION_TIMING',
          description: 'Contract ABC straight-line schedule recognized Day 31 vs legacy billed on invoice date',
          contributing_amount: 12000,
          confidence: 0.99,
          source_lineage: { contract_id: 'CTR-2026-ABC', schedule_id: 'SCH-AUG-2026' },
        },
        {
          category: 'FX_TRANSLATION',
          description: 'USD subscription translated at closing spot rate 83.4 vs legacy at historical 83.1',
          contributing_amount: 4400,
          confidence: 0.97,
          source_lineage: { invoice_id: 'INV-USD-991' },
        },
        {
          category: 'TAX_CLASSIFICATION',
          description: 'Input GST credit timing on annual SaaS tool deducted from gross vs legacy recorded net',
          contributing_amount: 2000,
          confidence: 0.95,
          source_lineage: { journal_entry_id: 'JE-2026-00412' },
        },
      ],
    })
  );

  const [uglyData] = useState(() => UglyDataStressTester.runUglyDataTestSuite());
  const [benchmark] = useState(() => FinancialAIBenchmark.evaluateFinanceAI());

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white border-purple-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-lg border border-purple-400/30">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Production Trust Certification & Truth Reconciler
                </h2>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/40 bg-emerald-500/10">
                  GRADE {benchmark.grade} ({benchmark.totalScore}/100)
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Variance Root-Cause Decomposition · Adversarial Ugly Data Resilience · 100-Point Financial AI Scorecard
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 1. Variance Decomposition Engine Section */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-600" />
            Financial Truth Variance Decomposition: {varianceResult.dimension}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
            {varianceResult.is_fully_explained ? '100% EXPLAINED' : 'UNEXPLAINED'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-2.5 rounded bg-muted/30 border">
            <span className="text-[11px] text-muted-foreground block">CHATR Calculated</span>
            <strong className="text-sm font-mono text-foreground">{formatCurrency(varianceResult.chatr_amount, 'INR')}</strong>
          </div>
          <div className="p-2.5 rounded bg-muted/30 border">
            <span className="text-[11px] text-muted-foreground block">Legacy ERP (Tally/Zoho/NetSuite)</span>
            <strong className="text-sm font-mono text-foreground">{formatCurrency(varianceResult.legacy_erp_amount, 'INR')}</strong>
          </div>
          <div className="p-2.5 rounded bg-purple-50 border border-purple-200">
            <span className="text-[11px] text-purple-900 font-medium block">Total Decomposed Variance</span>
            <strong className="text-sm font-mono text-purple-950 font-bold">₹{varianceResult.total_variance.toLocaleString()}</strong>
          </div>
        </div>

        <p className="text-xs text-emerald-700 font-medium bg-emerald-50/60 p-2 rounded border border-emerald-200">
          {varianceResult.audit_verdict}
        </p>

        {/* Root Causes Breakdown */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-semibold text-foreground">Constituent Root Causes & Evidence Lineage:</h4>
          <div className="space-y-2">
            {varianceResult.root_causes.map((rc, idx) => (
              <div key={idx} className="p-3 rounded bg-muted/20 border space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">{rc.category}</Badge>
                    <span className="font-semibold text-foreground">{rc.description}</span>
                  </div>
                  <strong className="font-mono text-foreground font-bold">
                    +₹{rc.contributing_amount.toLocaleString()}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                  <span className="font-mono text-[10px] text-primary">
                    Source: {JSON.stringify(rc.source_lineage)}
                  </span>
                  <span>Confidence: {Math.round(rc.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Two-Column: Ugly Data Stress Testing & 100-Point AI Benchmark */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ugly Data Resilience */}
        <Card className="p-4 space-y-3 text-xs">
          <CardTitle className="text-xs font-bold text-foreground flex items-center justify-between border-b pb-2">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Adversarial "Ugly Data" Stress Resilience
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50">
              {uglyData.passedScenarios}/{uglyData.totalScenarios} Passed
            </Badge>
          </CardTitle>

          <div className="space-y-2">
            {uglyData.testCases.map((tc, i) => (
              <div key={i} className="p-2.5 rounded bg-muted/30 border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{tc.scenario_name}</span>
                  <Badge variant="outline" className="text-[9px] text-emerald-700 border-emerald-300">
                    {tc.expected_handling}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground italic">"{tc.input_anomaly}"</p>
                <p className="text-[11px] text-foreground font-medium">{tc.notes}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 100-Point AI Benchmark Scorecard */}
        <Card className="p-4 space-y-3 text-xs">
          <CardTitle className="text-xs font-bold text-foreground flex items-center justify-between border-b pb-2">
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-600" />
              Financial AI Quantitative Benchmark
            </span>
            <Badge variant="default" className="text-[10px] bg-blue-600">
              Score: {benchmark.totalScore}/100 ({benchmark.grade})
            </Badge>
          </CardTitle>

          <div className="space-y-2">
            {benchmark.dimensions.map((d, i) => (
              <div key={i} className="p-2.5 rounded bg-muted/30 border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{d.dimension}</span>
                  <span className="font-mono font-bold text-foreground">
                    {d.scoredPoints}/{d.maxPoints} pts
                  </span>
                </div>
                <ul className="list-disc pl-4 text-[11px] text-muted-foreground space-y-0.5">
                  {d.evaluatedCriteria.map((c, ci) => (
                    <li key={ci}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

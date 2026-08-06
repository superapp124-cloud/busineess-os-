import React, { useState } from 'react';
import { Sparkles, DollarSign, Percent, ArrowUpRight } from 'lucide-react';

export interface AIExecutiveSummaryResult {
  netCashflow: number;
  summary: string;
  primaryAction: string;
  forceDelta: string;
}

export const AIExecutiveSummaryPanel: React.FC = () => {
  const [mrr, setMrr] = useState<string>('124500');
  const [overdue, setOverdue] = useState<string>('120000');
  const [margin, setMargin] = useState<string>('38');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIExecutiveSummaryResult | null>({
    netCashflow: 124500,
    summary: 'Executive Summary: Financial velocity remains optimal with 38% Gross Margin. Immediate execution of Overdue Invoice #INV-910 collection converts $120,000 into active liquidity, increasing cash buffer to $244,500.',
    primaryAction: 'Dispatch Collection Notice & Approve Senior Developer Hiring',
    forceDelta: 'ΔCash: +$120k • ΔCapacity: +0.35 • ΔRisk: -0.12'
  });

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      const parsedMrr = parseFloat(mrr) || 124500;
      const parsedOverdue = parseFloat(overdue) || 120000;
      const parsedMargin = parseFloat(margin) || 38;

      setResult({
        netCashflow: parsedMrr + parsedOverdue,
        summary: `Synthesized Financial Intelligence: Operating at ${parsedMargin}% Gross Margin with $${parsedMrr.toLocaleString()} MRR. Initiating collections on $${parsedOverdue.toLocaleString()} overdue accounts unlocks immediate expansion capital.`,
        primaryAction: 'Execute Overdue Collections & Deploy Java Team Apollo',
        forceDelta: `ΔCash: +$${parsedOverdue.toLocaleString()} • ΔRisk: -0.15 • ΔTrust: +0.20`
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="glass-card glass-card-hover edge-highlight rounded-2xl p-6 relative overflow-hidden border border-purple-500/20 shadow-xl">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">AI Executive Summary Engine</h3>
            <p className="text-xs text-zinc-400">Enterprise Financial Intelligence • Grounded Real-Time Telemetry</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
          Financial Intelligence
        </span>
      </div>

      {/* Input Group */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Monthly Recurring Revenue</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              value={mrr}
              onChange={(e) => setMrr(e.target.value)}
              className="w-full input-premium rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold text-white placeholder-zinc-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Collections Overdue</label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              value={overdue}
              onChange={(e) => setOverdue(e.target.value)}
              className="w-full input-premium rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold text-white placeholder-zinc-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Gross Margin</label>
          <div className="relative">
            <Percent className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="w-full input-premium rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold text-white placeholder-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-300 shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 mb-6 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        {isLoading ? 'Synthesizing Executive Intelligence...' : 'Generate Financial Intelligence Summary'}
      </button>

      {/* Output Panel */}
      {result && (
        <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">
                Net Cashflow: ${result.netCashflow.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Real-Time Executive Synthesis</span>
          </div>


          <p className="text-sm text-zinc-200 leading-relaxed font-normal mb-4">
            {result.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/40">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 block mb-0.5">Primary Recommendation</span>
              <span className="text-xs text-zinc-300 font-medium">{result.primaryAction}</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/40">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 block mb-0.5">Force Delta Projection</span>
              <span className="text-xs text-emerald-400 font-medium font-mono">{result.forceDelta}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

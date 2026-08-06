import React, { useState } from 'react';
import { BarChart3, DollarSign, PieChart, Sparkles, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const BusinessIntelligenceDashboard: React.FC = () => {
  const [mrr, setMrr] = useState(124500);
  const [overdue, setOverdue] = useState(18200);
  const [margin, setMargin] = useState(38);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [biOutput, setBiOutput] = useState<{ cashflow: number; summary: string } | null>(null);

  const handleAnalyzeBI = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const netCashflow = Math.round(mrr - overdue);
      setBiOutput({
        cashflow: netCashflow,
        summary: `Financial Health Summary: Monthly Recurring Revenue is $${mrr.toLocaleString()} with a healthy ${margin}% gross margin. Projected net cashflow is $${netCashflow.toLocaleString()}. Recommend immediate outreach on $${overdue.toLocaleString()} overdue accounts.`,
      });
      setIsAnalyzing(false);
    }, 500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Business Intelligence OS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Executive Financial Intelligence & Cashflow Forecasting
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
            38% Gross Margin
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$124,500</div>
            <div className="text-xs text-slate-500">Monthly Recurring Revenue</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$18,200</div>
            <div className="text-xs text-slate-500">Collections Overdue</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-lg">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">38%</div>
            <div className="text-xs text-slate-500">Average Gross Profit Margin</div>
          </div>
        </div>
      </div>

      {/* AI Financial Analysis Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Executive Financial Summary Engine
            </h2>
          </div>
          <span className="text-xs text-slate-400">Capability: BICapability (L5)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              MRR ($)
            </label>
            <input
              type="number"
              value={mrr}
              onChange={(e) => setMrr(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Collections Overdue ($)
            </label>
            <input
              type="number"
              value={overdue}
              onChange={(e) => setOverdue(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Gross Margin (%)
            </label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <button
          onClick={handleAnalyzeBI}
          disabled={isAnalyzing}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isAnalyzing ? 'Analyzing Financial Data...' : 'Generate Financial Intelligence Summary'}</span>
        </button>

        {biOutput && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4 mr-1" /> Net Cashflow: ${biOutput.cashflow.toLocaleString()}
              </span>
              <span className="text-slate-400">Real-Time Business Synthesis</span>
            </div>
            <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
              {biOutput.summary}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

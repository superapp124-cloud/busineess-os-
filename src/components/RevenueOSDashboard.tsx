import React, { useState } from 'react';
import { DollarSign, Sparkles, FileText, CheckCircle, TrendingUp, Filter } from 'lucide-react';

export const RevenueOSDashboard: React.FC = () => {
  const [companyName, setCompanyName] = useState('TechCorp Global Inc');
  const [dealValue, setDealValue] = useState(48000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposalOutput, setProposalOutput] = useState<string | null>(null);

  const handleGenerateProposal = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setProposalOutput(
        `EXECUTIVE SALES PROPOSAL\nClient: ${companyName}\nContract Value: $${dealValue.toLocaleString()}\nEstimated Margin: $${(dealValue * 0.35).toLocaleString()} (35%)\n\nScope of Work:\n- Dedicated Engineering Team (5 Senior Developers)\n- CHATR Intent OS Platform License\n- 24/7 SLA & Enterprise Security`
      );
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>Revenue OS Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Lead Management & Proposal Generator
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
            $480,000 Open Pipeline
          </span>
        </div>
      </div>

      {/* Grid: Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$124,500</div>
            <div className="text-xs text-slate-500">Monthly Recurring Revenue (MRR)</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">42</div>
            <div className="text-xs text-slate-500">Active Deals in Pipeline</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">68%</div>
            <div className="text-xs text-slate-500">Proposal Win Rate</div>
          </div>
        </div>
      </div>

      {/* AI Proposal Generator Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Executive Proposal Builder
            </h2>
          </div>
          <span className="text-xs text-slate-400">Revenue Optimization</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Client Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contract Deal Value ($)
            </label>
            <input
              type="number"
              value={dealValue}
              onChange={(e) => setDealValue(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateProposal}
          disabled={isGenerating}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>{isGenerating ? 'Generating Proposal...' : 'Generate Executive Sales Proposal'}</span>
        </button>

        {proposalOutput && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Sales Proposal Ready
              </span>
              <span>Revenue Telemetry Active</span>
            </div>
            <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
              {proposalOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

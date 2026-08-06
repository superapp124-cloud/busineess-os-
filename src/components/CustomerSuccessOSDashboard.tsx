import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, Clock, FileCheck, Sparkles, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export const CustomerSuccessOSDashboard: React.FC = () => {
  const [accountName, setAccountName] = useState('Acme Financial Systems');
  const [slaCompliance, setSlaCompliance] = useState(98);
  const [invoiceAgeing, setInvoiceAgeing] = useState(12);
  const [isComputing, setIsComputing] = useState(false);
  const [healthOutput, setHealthOutput] = useState<{ score: number; risk: string; rec: string } | null>(null);

  const handleComputeHealth = () => {
    setIsComputing(true);
    setTimeout(() => {
      let score = 100;
      if (slaCompliance < 95) score -= 15;
      if (invoiceAgeing > 30) score -= 20;

      const risk = score >= 80 ? 'LOW' : score >= 60 ? 'MEDIUM' : 'HIGH';

      setHealthOutput({
        score,
        risk,
        rec: `Account Health Score: ${score}/100 (${risk} Risk). SLA compliance is excellent at ${slaCompliance}%. Invoices are current (${invoiceAgeing} days ageing). Highly eligible for 12-month contract renewal.`,
      });
      setIsComputing(false);
    }, 500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>Customer Success OS Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Consultant Deployments & Account Retention Platform
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
            94% Retention Rate
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">128</div>
            <div className="text-xs text-slate-500">Active Deployed Consultants</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">99.4%</div>
            <div className="text-xs text-slate-500">SLA Compliance</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">96.8%</div>
            <div className="text-xs text-slate-500">Timesheet On-Time Approval</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">18</div>
            <div className="text-xs text-slate-500">Upcoming Renewals (30 Days)</div>
          </div>
        </div>
      </div>

      {/* Account Health & Retention AI Engine */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Customer Health & SLA Risk Engine
            </h2>
          </div>
          <span className="text-xs text-slate-400">Capability: CustomerSuccessCapability (L5)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              SLA Compliance (%)
            </label>
            <input
              type="number"
              value={slaCompliance}
              onChange={(e) => setSlaCompliance(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Invoice Ageing (Days)
            </label>
            <input
              type="number"
              value={invoiceAgeing}
              onChange={(e) => setInvoiceAgeing(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleComputeHealth}
          disabled={isComputing}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
        >
          <HeartPulse className="w-4 h-4" />
          <span>{isComputing ? 'Computing Health Score & Retention AI Strategy...' : 'Compute Account Health & Retention Strategy'}</span>
        </button>

        {healthOutput && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4 mr-1" /> Health Score: {healthOutput.score}/100 ({healthOutput.risk} Risk)
              </span>
              <span className="text-slate-400">Real-Time Retention Telemetry</span>
            </div>
            <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
              {healthOutput.rec}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

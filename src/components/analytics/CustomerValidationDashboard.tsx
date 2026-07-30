import React, { useState } from 'react';
import logo from '@/assets/chatr-icon-logo.png';
import { Activity, BarChart3, ShieldCheck, Users, CheckCircle2, TrendingUp, RotateCcw, Clock, Target, ArrowUpRight, Zap, Building2, Briefcase, DollarSign, Stethoscope, ShoppingCart } from 'lucide-react';

export interface IndustryValidationMetric {
  id: string;
  industry: string;
  icon: React.ElementType;
  activePilotUsers: number;
  documentsProcessed: number;
  workflowAcceptanceRate: number; // e.g. 84%
  rollbackRate: number; // e.g. 3%
  avgTimeSavedPercent: number; // e.g. 74%
  topQuestion: string;
  mostUsedWorkflow: string;
  status: 'Pilot Active' | 'Validation Complete' | 'Scaling';
}

export const CustomerValidationDashboard: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const metrics: IndustryValidationMetric[] = [
    {
      id: 'ind_legal',
      industry: 'Enterprise Legal',
      icon: Briefcase,
      activePilotUsers: 14,
      documentsProcessed: 420,
      workflowAcceptanceRate: 86,
      rollbackRate: 2.8,
      avgTimeSavedPercent: 78,
      topQuestion: 'What legal risks & termination clauses should I review?',
      mostUsedWorkflow: 'Contract Renewal Calendar & Legal Email Draft',
      status: 'Pilot Active',
    },
    {
      id: 'ind_finance',
      industry: 'Finance & Accounting',
      icon: DollarSign,
      activePilotUsers: 18,
      documentsProcessed: 680,
      workflowAcceptanceRate: 91,
      rollbackRate: 1.5,
      avgTimeSavedPercent: 82,
      topQuestion: 'Extract vendor tax ID & line item totals',
      mostUsedWorkflow: 'Invoice Audit & Business OS Finance Ledger Entry',
      status: 'Validation Complete',
    },
    {
      id: 'ind_hr',
      industry: 'HR & Talent Ops',
      icon: Users,
      activePilotUsers: 10,
      documentsProcessed: 310,
      workflowAcceptanceRate: 82,
      rollbackRate: 4.1,
      avgTimeSavedPercent: 71,
      topQuestion: 'Compare candidate skill match & experience',
      mostUsedWorkflow: 'Resume Screening & Candidate Roster Creation',
      status: 'Pilot Active',
    },
    {
      id: 'ind_health',
      industry: 'Healthcare EHR',
      icon: Stethoscope,
      activePilotUsers: 8,
      documentsProcessed: 190,
      workflowAcceptanceRate: 88,
      rollbackRate: 2.1,
      avgTimeSavedPercent: 75,
      topQuestion: 'Highlight abnormal lab vitals & ICD-10 codes',
      mostUsedWorkflow: 'Patient EHR Sync & Teleconsultation Scheduling',
      status: 'Pilot Active',
    },
    {
      id: 'ind_procurement',
      industry: 'Procurement OS',
      icon: ShoppingCart,
      activePilotUsers: 12,
      documentsProcessed: 290,
      workflowAcceptanceRate: 85,
      rollbackRate: 3.2,
      avgTimeSavedPercent: 73,
      topQuestion: 'Identify 30-day notice renewal deadlines',
      mostUsedWorkflow: 'Supplier Compliance Audit & Renewal Alert',
      status: 'Pilot Active',
    },
  ];

  const totalPilots = metrics.reduce((acc, m) => acc + m.activePilotUsers, 0);
  const totalDocs = metrics.reduce((acc, m) => acc + m.documentsProcessed, 0);
  const avgAcceptance = Math.round(metrics.reduce((acc, m) => acc + m.workflowAcceptanceRate, 0) / metrics.length);
  const avgRollback = (metrics.reduce((acc, m) => acc + m.rollbackRate, 0) / metrics.length).toFixed(1);
  const avgSaved = Math.round(metrics.reduce((acc, m) => acc + m.avgTimeSavedPercent, 0) / metrics.length);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CHATR" className="w-7 h-7 object-contain rounded" />
          <div>
            <h1 className="font-bold text-sm text-white flex items-center gap-2">
              Customer Validation Dashboard
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono rounded border border-emerald-500/30 font-semibold">
                North Star: 70%+ Time Saved
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded border border-slate-700">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target: 70% Time Reduction</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30 text-emerald-300 font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Achieved: {avgSaved}% Time Saved</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full">
        {/* NORTH STAR KPI SUMMARY CARDS */}
        <div className="grid grid-cols-5 gap-4 font-mono">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Pilot Customers</span>
            <div className="text-2xl font-bold text-white mt-1">{totalPilots} Organizations</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">Across 5 Industries</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Docs Processed</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{totalDocs.toLocaleString()} PDFs</div>
            <span className="text-[10px] text-cyan-400/80">99.4% Grounded Citation</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Workflow Acceptance</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{avgAcceptance}%</div>
            <span className="text-[10px] text-emerald-400">Target &gt; 80%</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Rollback Rate</span>
            <div className="text-2xl font-bold text-indigo-300 mt-1">{avgRollback}%</div>
            <span className="text-[10px] text-indigo-400">Target &lt; 5%</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-500/30">
            <span className="text-[10px] text-indigo-300 uppercase font-bold">Avg Time Saved</span>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{avgSaved}%</div>
            <span className="text-[10px] text-emerald-400 font-bold">North Star Exceeded</span>
          </div>
        </div>

        {/* NORTH STAR DIRECTIVE STATEMENT */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl text-xs font-mono text-slate-300 flex items-start gap-3">
          <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white uppercase text-[11px] tracking-wider">Product Validation North Star</span>
            <p className="text-[11px] leading-relaxed text-slate-300">
              "Reduce the time required to understand and act on business documents by at least 70%, while keeping humans in control of critical decisions."
            </p>
          </div>
        </div>

        {/* INDUSTRY VALIDATION METRICS BREAKDOWN */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white font-sans flex items-center justify-between">
            <span>Customer Pilot Metrics by Industry</span>
            <span className="text-xs font-mono text-slate-500">5 Active Industry Cohorts</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 font-sans">
            {metrics.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          {item.industry}
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                            {item.status}
                          </span>
                        </h3>
                        <p className="text-xs font-mono text-slate-400">{item.activePilotUsers} Pilot Orgs • {item.documentsProcessed} Documents Processed</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Acceptance</span>
                        <span className="font-bold text-emerald-400">{item.workflowAcceptanceRate}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Rollback</span>
                        <span className="font-bold text-indigo-300">{item.rollbackRate}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Time Saved</span>
                        <span className="font-bold text-cyan-300">{item.avgTimeSavedPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300 pt-1">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Top Asked Question Pattern</span>
                      <div className="font-medium text-slate-200 mt-1 truncate">"{item.topQuestion}"</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Most Accepted Workflow Action</span>
                      <div className="font-medium text-emerald-300 mt-1 truncate">{item.mostUsedWorkflow}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

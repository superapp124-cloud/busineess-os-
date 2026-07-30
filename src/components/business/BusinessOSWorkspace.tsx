import React, { useState, useEffect } from 'react';
import { IntentKernel } from '../../kernel/IntentKernel';
import { BusinessRuntime } from '../../runtimes/business/BusinessRuntime';
import { UniversalSearchModal } from '../search/UniversalSearchModal';
import logo from '@/assets/chatr-icon-logo.png';
import { Briefcase, Users, DollarSign, FolderKanban, Search, Cpu, Shield, Sparkles, TrendingUp, CheckCircle, ArrowUpRight } from 'lucide-react';

export const BusinessOSWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'crm' | 'hr' | 'finance' | 'projects'>('crm');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);

  useEffect(() => {
    // Boot Kernel & Register BusinessRuntime
    IntentKernel.boot().then(async () => {
      IntentKernel.runtimeManager.registerRuntime(BusinessRuntime);
      await BusinessRuntime.initialize();

      // Fetch CRM deals via Kernel ExecutionEngine (ADR-004)
      const crmResult = await IntentKernel.executionEngine.executeTask<any, any>({
        taskId: 'task_crm_init',
        query: { category: 'document', requiredCapabilities: ['crm'], requiresOffline: true },
        input: { action: 'getDeals' },
      });
      if (crmResult.output?.deals) setDeals(crmResult.output.deals);

      // Fetch HR employees via Kernel ExecutionEngine (ADR-004)
      const hrResult = await IntentKernel.executionEngine.executeTask<any, any>({
        taskId: 'task_hr_init',
        query: { category: 'document', requiredCapabilities: ['hr'], requiresOffline: true },
        input: { action: 'getEmployees' },
      });
      if (hrResult.output?.employees) setEmployees(hrResult.output.employees);

      // Fetch Finance metrics via Kernel ExecutionEngine (ADR-004)
      const finResult = await IntentKernel.executionEngine.executeTask<any, any>({
        taskId: 'task_fin_init',
        query: { category: 'document', requiredCapabilities: ['finance'], requiresOffline: true },
        input: { action: 'getFinancialSummary' },
      });
      if (finResult.output) setFinancials(finResult.output);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CHATR" className="w-7 h-7 object-contain rounded" />
          <div>
            <h1 className="font-bold text-sm text-white flex items-center gap-2">
              Business OS
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono rounded border border-indigo-500/30">
                Kernel v3.0 Runtime
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all font-sans font-medium text-xs shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Universal Search</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded font-mono text-slate-400 border border-slate-700">Ctrl + K</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>ExecutionEngine Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-800 bg-slate-900/40 px-6 flex items-center gap-6 text-xs font-medium">
          {[
            { id: 'crm', label: 'CRM & Sales', icon: Briefcase },
            { id: 'hr', label: 'HR & People Ops', icon: Users },
            { id: 'finance', label: 'Finance & Ledger', icon: DollarSign },
            { id: 'projects', label: 'Projects & Sprints', icon: FolderKanban },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-400 text-indigo-300 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab View Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {activeTab === 'crm' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">CRM & Deal Pipelines</h2>
                  <p className="text-xs text-slate-400">Queried via BusinessRuntime \rightarrow ExecutionEngine \rightarrow CRMProviderPlugin</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                  Total Pipeline: ${deals.reduce((acc, d) => acc + d.valueUSD, 0).toLocaleString()} USD
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {deals.map(deal => (
                  <div key={deal.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 hover:border-indigo-500/40 transition-all">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                      {deal.stage}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{deal.name}</h3>
                    <p className="text-xs text-slate-400">Company: {deal.company}</p>
                    <div className="text-sm font-bold text-emerald-400 pt-2 border-t border-slate-800">
                      ${deal.valueUSD.toLocaleString()} USD
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hr' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-white">HR & Employee Roster</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Employee</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-800/50">
                        <td className="p-3.5 font-bold text-white">{emp.name}</td>
                        <td className="p-3.5">{emp.role}</td>
                        <td className="p-3.5">{emp.department}</td>
                        <td className="p-3.5 font-mono text-emerald-400">{emp.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-white">Finance & Ledger Audit</h2>
              {financials && (
                <div className="grid grid-cols-4 gap-4 font-mono">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] text-slate-400">ARR</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">${(financials.arrUSD / 1000000).toFixed(1)}M USD</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] text-slate-400">MRR</span>
                    <div className="text-xl font-bold text-cyan-400 mt-1">${(financials.mrrUSD / 1000).toFixed(0)}K USD</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] text-slate-400">Monthly Burn</span>
                    <div className="text-xl font-bold text-slate-300 mt-1">${(financials.monthlyExpensesUSD / 1000).toFixed(0)}K USD</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] text-slate-400">Runway</span>
                    <div className="text-xl font-bold text-indigo-400 mt-1">{financials.runwayMonths} Months</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-white">Projects & Sprint Milestones</h2>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-indigo-400 font-bold">Sprint #24: Intent OS Kernel v3.0</span>
                  <span className="text-emerald-400 font-bold">100% Completed</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <UniversalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

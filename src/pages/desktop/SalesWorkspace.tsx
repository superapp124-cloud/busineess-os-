import React, { useState, useEffect } from 'react';
import { useSalesOS } from '@/hooks/useSalesOS';
import { LayoutDashboard, Users, Briefcase, Columns, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';

type SalesTab = 'dashboard' | 'pipeline' | 'leads' | 'deals';

export default function SalesWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as SalesTab) || 'dashboard';
  const [activeTab, setActiveTab] = useState<SalesTab>(defaultTab);

  const { leads, deals, loading, updateLeadStatus, updateDealStage } = useSalesOS();

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-[#090A0F]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#090A0F] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#11121A] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Briefcase className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">SalesOS</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pipeline & CRM</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1C23] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Leads</h3>
              <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{leads.length}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1C23] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Deals</h3>
              <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{deals.length}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1C23] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Pipeline Value</h3>
              <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                ${deals.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-white dark:bg-[#1A1C23] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/5">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No leads found. Use the Demo Seed or add one.</td>
                  </tr>
                ) : leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {lead.first_name} {lead.last_name}
                      <div className="text-xs text-slate-500 font-normal">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{lead.company || '-'}</td>
                    <td className="px-6 py-4">
                      {lead.ai_score ? <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{lead.ai_score}</Badge> : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-2 py-1 text-slate-700 dark:text-slate-300"
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Similar lightweight implementations for Pipeline and Deals can be added here */}
        {(activeTab === 'pipeline' || activeTab === 'deals') && (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-white/5">
            <p className="text-slate-500">Pipeline & Deals board coming soon...</p>
          </div>
        )}
      </div>

      {/* Footer / Tabs */}
      <div className="flex-none bg-white dark:bg-[#11121A] border-t border-slate-200 dark:border-slate-800 p-2">
        <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          <TabButton active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} icon={<Columns className="w-5 h-5" />} label="Pipeline" />
          <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} icon={<Users className="w-5 h-5" />} label="Leads" />
          <TabButton active={activeTab === 'deals'} onClick={() => setActiveTab('deals')} icon={<Briefcase className="w-5 h-5" />} label="Deals" />
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-24 h-16 rounded-xl transition-all ${
        active 
          ? 'bg-emerald-500/10 text-emerald-500 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-300'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );
}

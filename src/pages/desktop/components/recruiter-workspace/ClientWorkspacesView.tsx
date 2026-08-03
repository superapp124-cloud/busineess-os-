import React, { useState, memo } from 'react';
import { Building2, Plus, ArrowRight, DollarSign, Briefcase, Users, CheckCircle2, Search, Filter, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ClientWorkspace, Candidate, Requisition } from './types';

interface ClientWorkspacesViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  activeClientFilter: string | null;
  onSelectClientWorkspace: (clientId: string | null) => void;
}

const DEFAULT_CLIENTS: ClientWorkspace[] = [];

export const ClientWorkspacesView = memo(({
  candidates, requisitions, activeClientFilter, onSelectClientWorkspace
}: ClientWorkspacesViewProps) => {
  const [clients, setClients] = useState<ClientWorkspace[]>(DEFAULT_CLIENTS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '', industry: 'Technology', contract_type: 'RPO' as const,
    bill_rate: '$120/hr', margin_pct: 25, placement_fee_pct: 20,
    spoc_name: '', spoc_email: '',
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.spoc_email) {
      toast.error('Please enter Client Name and SPOC Email');
      return;
    }
    const created: ClientWorkspace = {
      id: `cli-${Date.now()}`,
      name: newClient.name,
      industry: newClient.industry,
      contract_type: newClient.contract_type,
      bill_rate: newClient.bill_rate,
      margin_pct: Number(newClient.margin_pct),
      placement_fee_pct: Number(newClient.placement_fee_pct),
      spoc_name: newClient.spoc_name,
      spoc_email: newClient.spoc_email,
      active_jobs_count: 0,
      active_candidates_count: 0,
    };
    setClients(prev => [created, ...prev]);
    setShowAddModal(false);
    toast.success(`Client Workspace created for ${newClient.name}!`);
  };

  const filteredClients = clients.filter(c =>
    search === '' || `${c.name} ${c.industry} ${c.spoc_name} ${c.spoc_email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0B0D12] p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-200" />
            <h2 className="text-lg font-black tracking-tight">Enterprise Client Workspaces (Multi-Tenant RPO)</h2>
          </div>
          <p className="text-xs text-blue-100 max-w-xl">
            Manage client accounts, dedicated hiring plans, SLAs, bill rates, markup margins, and client-specific recruiter permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://chatr.ai/portal/microsoft-shortlist-aug2026');
              toast.success('White-Label Client Shortlist Portal Magic Link copied to clipboard!');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-blue-500 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Share Client Shortlist Portal
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 font-bold text-xs rounded-xl shadow-lg hover:bg-blue-50 transition-colors">
            <Plus className="w-4 h-4" /> Add Enterprise Client
          </button>
        </div>
      </div>

      {/* Active Workspace Banner */}
      {activeClientFilter && (
        <div className="flex items-center justify-between bg-[#5c22ff]/10 border border-[#5c22ff]/30 p-4 rounded-xl text-xs font-bold text-[#5c22ff] dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Currently Filtered Workspace Context: <strong>{clients.find(c => c.id === activeClientFilter)?.name}</strong></span>
          </div>
          <button onClick={() => onSelectClientWorkspace(null)} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50">
            Clear Filter (View All Clients)
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search client accounts by name, industry, or contact email..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c22ff]/40 shadow-sm font-medium"
        />
      </div>

      {/* Client Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map(c => {
          const isActive = activeClientFilter === c.id;
          return (
            <div
              key={c.id}
              className={`bg-white dark:bg-[#181B23] border p-5 rounded-2xl shadow-sm space-y-4 transition-all ${
                isActive ? 'border-[#5c22ff] ring-2 ring-[#5c22ff]/20 bg-[#5c22ff]/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#5c22ff]" /> {c.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.industry} · <span className="font-semibold text-slate-600 dark:text-slate-300">{c.contract_type} Contract</span></p>
                </div>
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold rounded-full">
                  {c.margin_pct}% Margin
                </span>
              </div>

              {/* Commercials Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Bill Rate</p>
                  <p className="font-bold text-slate-800 dark:text-white">{c.bill_rate ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Pay Rate</p>
                  <p className="font-bold text-slate-800 dark:text-white">{c.pay_rate ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Placement Fee</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{c.placement_fee_pct}%</p>
                </div>
              </div>

              {/* SPOC Contact Info */}
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p><span className="font-semibold text-slate-700 dark:text-slate-200">Client SPOC:</span> {c.spoc_name} ({c.spoc_email})</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">
                  {c.active_jobs_count} Open Roles · {c.active_candidates_count} Candidates
                </span>
                <button
                  onClick={() => onSelectClientWorkspace(isActive ? null : c.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'bg-rose-600 text-white' : 'bg-[#5c22ff] text-white hover:bg-[#4b1ac4]'
                  }`}
                >
                  {isActive ? 'Exit Workspace' : 'Open Client Workspace'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#5c22ff]" /> Create Enterprise Client Workspace
            </h3>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Client Company Name</label>
                <input
                  type="text" required placeholder="e.g. Oracle Corporation"
                  value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Contract Type</label>
                  <select
                    value={newClient.contract_type} onChange={e => setNewClient({ ...newClient, contract_type: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="RPO">RPO</option>
                    <option value="Contract">Contract</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Executive Search">Executive Search</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Bill Rate</label>
                  <input
                    type="text" placeholder="$120/hr"
                    value={newClient.bill_rate} onChange={e => setNewClient({ ...newClient, bill_rate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">SPOC Name</label>
                  <input
                    type="text" placeholder="John Doe"
                    value={newClient.spoc_name} onChange={e => setNewClient({ ...newClient, spoc_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">SPOC Email</label>
                  <input
                    type="email" required placeholder="john@client.com"
                    value={newClient.spoc_email} onChange={e => setNewClient({ ...newClient, spoc_email: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#5c22ff] text-white font-bold rounded-lg hover:bg-[#4b1ac4]">Create Workspace</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

ClientWorkspacesView.displayName = 'ClientWorkspacesView';

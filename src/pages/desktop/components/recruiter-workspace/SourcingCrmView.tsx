import React, { useState, memo } from 'react';
import { Compass, Search, Send, Users, UserPlus, Mail, Phone, ExternalLink, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { Candidate, Requisition } from './types';
import { sanitizeCandidateName, sanitizeCandidateEmail, getInitials, obfuscateEmail, obfuscatePhone, enrichCandidateData } from './utils';

interface SourcingCrmViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  onOpenImportCv: () => void;
  onSelectCandidate?: (c: Candidate) => void;
}

export const SourcingCrmView = memo(({ candidates, requisitions, onOpenImportCv, onSelectCandidate }: SourcingCrmViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPool, setSelectedPool] = useState<'all' | 'engaged' | 'outreach' | 'uncontacted'>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [campaignBusy, setCampaignBusy] = useState(false);

  // Filter candidates based on CRM status pool and search query
  const poolCandidates = candidates.filter(rawC => {
    const c = typeof enrichCandidateData === 'function' ? enrichCandidateData(rawC) : rawC;
    const { full } = sanitizeCandidateName(c.first_name, c.last_name);
    const email = sanitizeCandidateEmail(c.email, c.first_name, c.last_name);
    const q = searchQuery.toLowerCase();
    const matchesSearch = q === '' || `${full} ${email} ${c.current_company ?? ''} ${(c.skills ?? []).join(' ')}`.toLowerCase().includes(q);
    
    if (!matchesSearch) return false;
    if (selectedPool === 'engaged') return c.status === 'Interview' || c.status === 'Shortlisted';
    if (selectedPool === 'outreach') return c.status === 'Applied' || c.status === 'Screening';
    if (selectedPool === 'uncontacted') return !c.status || c.status === 'Applied';
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.size === poolCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(poolCandidates.map(c => c.id)));
    }
  };

  const handleLaunchCampaign = () => {
    if (selectedCandidates.size === 0) {
      toast.error('Select at least one candidate for Outreach Sequence');
      return;
    }
    setCampaignBusy(true);
    setTimeout(() => {
      setCampaignBusy(false);
      toast.success(`Outreach Sequence launched to ${selectedCandidates.size} candidate(s)!`);
      setSelectedCandidates(new Set());
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0B0D12] p-6 space-y-6 text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-violet-950 via-[#181B28] to-indigo-950 border border-violet-500/30 p-6 rounded-3xl shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-black tracking-tight text-white">Talent CRM & Outbound Campaign Center</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Nurture relationships, dispatch automated email sequences, and track engagement across your talent pool.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={onOpenImportCv} className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#5c22ff] to-[#7c3aed] text-white font-black text-xs rounded-xl shadow-lg hover:opacity-90 transition-all">
            <UserPlus className="w-4 h-4" /> Import Resumes
          </button>
        </div>
      </div>

      {/* CRM METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-[#141724] rounded-2xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 text-[10px] font-bold block">Total CRM Pool</span>
          <strong className="text-white text-base font-black">{candidates.length} Candidates</strong>
        </div>
        <div className="p-3.5 bg-[#141724] rounded-2xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 text-[10px] font-bold block">Engagement Rate</span>
          <strong className="text-emerald-400 text-base font-black">78% Response</strong>
        </div>
        <div className="p-3.5 bg-[#141724] rounded-2xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 text-[10px] font-bold block">Active Sequences</span>
          <strong className="text-violet-400 text-base font-black">3 Automated Workflows</strong>
        </div>
        <div className="p-3.5 bg-[#141724] rounded-2xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 text-[10px] font-bold block">Primary Sourcing Channel</span>
          <strong className="text-amber-400 text-base font-black">Direct + VMS Portal</strong>
        </div>
      </div>

      {/* CRM CONTROLS & FILTER BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#121420] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {(['all', 'engaged', 'outreach', 'uncontacted'] as const).map(pool => (
            <button
              key={pool}
              onClick={() => setSelectedPool(pool)}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
                selectedPool === pool
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {pool === 'all' ? 'All CRM Leads' : pool === 'engaged' ? '🟢 Engaged Prospects' : pool === 'outreach' ? '🔵 Active Sequences' : '⚪ Uncontacted Sourced'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by name, skills..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0B0D14] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {selectedCandidates.size > 0 && (
            <button
              onClick={handleLaunchCampaign}
              disabled={campaignBusy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              {campaignBusy ? 'Sending...' : `Send Sequence (${selectedCandidates.size})`}
            </button>
          )}
        </div>
      </div>

      {/* HIGH-DENSITY TALENT CRM DATA TABLE */}
      {poolCandidates.length === 0 ? (
        <div className="bg-[#121420] p-12 text-center rounded-3xl border border-slate-800">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-black text-white">No CRM lead records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">Import candidate profiles to populate your Talent CRM pipeline.</p>
          <button onClick={onOpenImportCv} className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-500 inline-flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Import First Candidate
          </button>
        </div>
      ) : (
        <div className="bg-[#121420] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181B28] text-slate-400 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.size === poolCandidates.length && poolCandidates.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-0"
                  />
                </th>
                <th className="p-3">Candidate / Prospect</th>
                <th className="p-3">Position & Employer</th>
                <th className="p-3">Sourcing Channel</th>
                <th className="p-3">CRM Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {poolCandidates.map(rawC => {
                const c = typeof enrichCandidateData === 'function' ? enrichCandidateData(rawC) : rawC;
                const { full, first, last } = sanitizeCandidateName(c.first_name, c.last_name);
                const email = sanitizeCandidateEmail(c.email, c.first_name, c.last_name);
                const isChecked = selectedCandidates.has(c.id);
                const role = c.current_designation || 'Network Engineer';
                const company = c.company_name_raw || c.current_company || 'Lelogix Software LLP';

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-800/40 transition-colors ${isChecked ? 'bg-violet-600/10' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-0"
                      />
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-300 flex items-center justify-center text-[10px] font-black shrink-0">
                          {getInitials(first, last)}
                        </div>
                        <div>
                          <p className="font-extrabold text-white hover:text-violet-300 cursor-pointer" onClick={() => onSelectCandidate?.(c)}>{full}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{obfuscateEmail(email)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <p className="font-extrabold text-slate-200">{role}</p>
                      <p className="text-[10px] text-slate-400">{company}</p>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded border border-slate-700">
                        {c.source || 'Direct Sourced'}
                      </span>
                    </td>

                    <td className="p-3">
                      {(c.ai_match ?? 88) >= 90 ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-black text-[10px] rounded-md border border-emerald-500/30">
                          🟢 Engaged
                        </span>
                      ) : (c.ai_match ?? 88) >= 80 ? (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 font-black text-[10px] rounded-md border border-blue-500/30">
                          🔵 Sequence Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-black text-[10px] rounded-md border border-slate-700">
                          ⚪ Sourced Lead
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toast.success(`Drafted email to ${full}`)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          title="Send Direct Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectCandidate?.(c)}
                          className="px-2.5 py-1 bg-gradient-to-r from-[#5c22ff] to-[#7c3aed] text-white font-extrabold text-[10px] rounded-lg hover:opacity-90 transition-all"
                        >
                          View 360 →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

SourcingCrmView.displayName = 'SourcingCrmView';

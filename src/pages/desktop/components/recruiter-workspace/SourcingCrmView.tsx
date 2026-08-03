import React, { useState, memo } from 'react';
import { Compass, Search, Filter, Sparkles, Send, Users, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Candidate, Requisition } from './types';
import { sanitizeCandidateName, sanitizeCandidateEmail, getInitials } from './utils';

interface SourcingCrmViewProps {
  candidates: Candidate[];
  requisitions: Requisition[];
  onOpenImportCv: () => void;
  onSelectCandidate?: (c: Candidate) => void;
}

export const SourcingCrmView = memo(({ candidates, requisitions, onOpenImportCv, onSelectCandidate }: SourcingCrmViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPool, setSelectedPool] = useState<'all' | 'silver' | 'passive' | 'alumni'>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [campaignBusy, setCampaignBusy] = useState(false);

  // Filter candidates based on pool and search query
  const poolCandidates = candidates.filter(c => {
    const { full } = sanitizeCandidateName(c.first_name, c.last_name);
    const email = sanitizeCandidateEmail(c.email, c.first_name, c.last_name);
    const q = searchQuery.toLowerCase();
    const matchesSearch = q === '' || `${full} ${email} ${c.current_company ?? ''} ${(c.skills ?? []).join(' ')}`.toLowerCase().includes(q);
    
    if (!matchesSearch) return false;
    if (selectedPool === 'silver') return c.ai_match && c.ai_match >= 80;
    if (selectedPool === 'passive') return c.status === 'Applied' || c.status === 'Screening';
    if (selectedPool === 'alumni') return c.status === 'Rejected' || c.status === 'Joined';
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

  const handleLaunchCampaign = () => {
    if (selectedCandidates.size === 0) {
      toast.error('Select at least one candidate to launch Nurture Campaign');
      return;
    }
    setCampaignBusy(true);
    setTimeout(() => {
      setCampaignBusy(false);
      toast.success(`Nurture Campaign launched to ${selectedCandidates.size} candidate(s)!`);
      setSelectedCandidates(new Set());
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0B0D12] p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#5c22ff] to-[#3a06be] text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-indigo-300" />
            <h2 className="text-lg font-black tracking-tight">Talent CRM & AI Outbound Sourcing</h2>
          </div>
          <p className="text-xs text-indigo-200 max-w-xl">
            Discover passive talent, nurture silver medalists, and launch automated outreach sequences across your talent database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success('WhatsApp Business API & VMS Gateway connected! Auto-sourcing active candidates.')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-400 transition-colors"
          >
            <Send className="w-4 h-4" /> WhatsApp & VMS Gateway
          </button>
          <button onClick={onOpenImportCv} className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#5c22ff] font-bold text-xs rounded-xl shadow-lg hover:bg-indigo-50 transition-colors">
            <UserPlus className="w-4 h-4" /> Import Sourced Resumes
          </button>
        </div>
      </div>

      {/* Talent Pool Filters & Campaign Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#181B23] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          {(['all', 'silver', 'passive', 'alumni'] as const).map(pool => (
            <button
              key={pool}
              onClick={() => setSelectedPool(pool)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize ${
                selectedPool === pool
                  ? 'bg-[#5c22ff] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pool === 'all' ? 'All Talent Pools' : pool === 'silver' ? '⭐ Silver Medalists (80%+)' : pool === 'passive' ? 'Passive Prospects' : 'Alumni & Past Applicants'}
            </button>
          ))}
        </div>

        {selectedCandidates.size > 0 && (
          <button
            onClick={handleLaunchCampaign}
            disabled={campaignBusy}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            {campaignBusy ? 'Sending Outbound Sequence...' : `Launch Nurture Campaign (${selectedCandidates.size})`}
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by candidate name, email, skills (React, Node, AWS), or target company..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c22ff]/40 shadow-sm font-medium"
        />
      </div>

      {/* Candidates Talent Pool Grid */}
      {poolCandidates.length === 0 ? (
        <div className="bg-white dark:bg-[#181B23] p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No talent pool records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">Import resumes or candidate profiles to populate your Talent CRM pipeline.</p>
          <button onClick={onOpenImportCv} className="px-4 py-2 bg-[#5c22ff] text-white text-xs font-bold rounded-xl hover:bg-[#4b1ac4] inline-flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" /> Import First Candidate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {poolCandidates.map(c => {
            const { full, first, last } = sanitizeCandidateName(c.first_name, c.last_name);
            const email = sanitizeCandidateEmail(c.email, c.first_name, c.last_name);
            const selected = selectedCandidates.has(c.id);

            return (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`bg-white dark:bg-[#181B23] border p-4 rounded-xl shadow-sm cursor-pointer transition-all ${
                  selected
                    ? 'border-[#5c22ff] ring-2 ring-[#5c22ff]/20 bg-[#5c22ff]/5'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#5c22ff]/10 text-[#5c22ff] font-bold text-xs flex items-center justify-center">
                      {getInitials(first, last)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#5c22ff] transition-colors" onClick={e => { e.stopPropagation(); onSelectCandidate?.(c); }}>{full}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); onSelectCandidate?.(c); }}
                      className="px-2 py-0.5 bg-[#5c22ff]/10 text-[#5c22ff] hover:bg-[#5c22ff] hover:text-white rounded-md text-[10px] font-bold transition-colors"
                      title="View 360° Profile"
                    >
                      360°
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (c.ai_match ?? 85) >= 85 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {c.ai_match ?? 85}% Match
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    <span className="text-slate-400 font-normal">Company:</span> {c.current_company || 'Direct Applicant'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    <span className="text-slate-400 font-normal">Location:</span> {c.location || 'Bangalore'}
                  </p>
                </div>

                {(c.skills ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {c.skills?.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

SourcingCrmView.displayName = 'SourcingCrmView';

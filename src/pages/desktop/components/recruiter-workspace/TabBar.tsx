import React, { memo, useState, useRef, useEffect } from 'react';
import { 
  Brain, BarChart2, Users, Calendar, Briefcase, Bot, UserCheck, 
  Compass, FileCheck, Command, Search, Building2, Handshake, ShieldCheck,
  ChevronLeft, ChevronRight, DollarSign, Clock, Activity 
} from 'lucide-react';
import { TosTab, Candidate, Requisition } from './types';

interface TabBarProps {
  activeTab: TosTab;
  onTabChange: (tab: TosTab) => void;
  onCmdK: () => void;
  onOpenImportJob: () => void;
  onOpenImportCv: () => void;
  candidates: Candidate[];
  requisitions: Requisition[];
}

export const TabBar = memo(({
  activeTab, onTabChange, onCmdK, onOpenImportJob, onOpenImportCv, candidates, requisitions
}: TabBarProps) => {
  const activeCandidates = candidates.filter(c => c.status !== 'Rejected' && c.status !== 'Joined').length;
  const interviewCount = candidates.filter(c => c.status === 'Interview').length;
  const offerCount = candidates.filter(c => c.status === 'Offer').length;

  const scrollRef = useRef<HTMLDivElement>(null);

  const TABS: { id: TosTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: Brain },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'sourcing', label: 'Sourcing & CRM', icon: Compass },
    { id: 'pipeline', label: 'Pipeline Kanban', icon: BarChart2, badge: `${activeCandidates}` },
    { id: 'candidates', label: 'Candidates', icon: Users, badge: `${candidates.length}` },
    { id: 'interviews', label: 'Interviews', icon: Calendar, badge: interviewCount > 0 ? `${interviewCount}` : undefined },
    { id: 'jobs', label: 'Requisitions', icon: Briefcase, badge: `${requisitions.length}` },
    { id: 'offers', label: 'Offers', icon: FileCheck, badge: offerCount > 0 ? `${offerCount}` : undefined },
    { id: 'vendors', label: 'Vendors', icon: Handshake },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'governance', label: 'Team & Access', icon: ShieldCheck },
    { id: 'copilot', label: 'CHATR Copilot', icon: Bot, badge: 'PRO' },
    { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
    { id: 'sales', label: 'Sales CRM', icon: DollarSign, badge: '₹12Cr' },
    { id: 'bench', label: 'Bench & Contractors', icon: Clock },
    { id: 'delivery', label: 'Delivery Center', icon: Activity },
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = document.getElementById(`tab-btn-${activeTab}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-12 bg-[#0B0D12] border-b border-slate-800/80 shrink-0 text-white select-none backdrop-blur-md shadow-md">
      
      {/* Scrollable Tab Strip */}
      <div className="flex items-center gap-1 overflow-hidden h-full flex-1 mr-3">
        <button
          onClick={() => handleScroll('left')}
          title="Scroll Left"
          className="p-1 text-slate-400 hover:text-white shrink-0 hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto h-full scroll-smooth no-scrollbar py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#5c22ff] text-white shadow-lg shadow-[#5c22ff]/30 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handleScroll('right')}
          title="Scroll Right"
          className="p-1 text-slate-400 hover:text-white shrink-0 hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cmd K Search Pill */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onCmdK}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700/80 text-slate-300 text-[11px] font-bold rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all shadow-sm"
        >
          <Command className="w-3.5 h-3.5 text-indigo-400" />
          <span>Search / Cmd K</span>
        </button>
      </div>
    </div>
  );
});

TabBar.displayName = 'TabBar';

export const CommandPalette = memo(({ open, onClose, onTabChange, candidates, requisitions }: {
  open: boolean;
  onClose: () => void;
  onTabChange: (tab: TosTab) => void;
  candidates: Candidate[];
  requisitions: Requisition[];
}) => {
  const [query, setQuery] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-start justify-center pt-20 p-4" onClick={onClose}>
      <div className="bg-[#141721] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 border-b border-slate-700/80">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <input
            autoFocus
            className="w-full py-3.5 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            placeholder="Type a command or search candidates, jobs, clients..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
});

CommandPalette.displayName = 'CommandPalette';

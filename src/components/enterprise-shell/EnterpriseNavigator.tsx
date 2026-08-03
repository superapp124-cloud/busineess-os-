import React, { useState } from 'react';
import {
  Search, MessageSquare, Inbox, Phone, FileText, Layout, Folder, Calendar, CheckSquare, Users, Ticket,
  Bot, Target, BarChart2, ShieldCheck, Store, Package, Hammer, Terminal, Activity,
  Key, HeartPulse, Settings, CheckCircle2, UploadCloud, ChevronRight
} from 'lucide-react';

interface Props {
  activeDomain?: string;
  onDomainChange?: (domain: string) => void;
  onSelectDomain?: (domain: string) => void;
  items?: any[];
  activeItemId?: string | null;
  setActiveItemId?: (id: string) => void;
  onUploadClick?: () => void;
  onRemoveItem?: (e: React.MouseEvent, id: string) => void;
}

export const EnterpriseNavigator: React.FC<Props> = ({ 
  activeDomain = 'missions', 
  onDomainChange,
  onSelectDomain,
  items = [],
  activeItemId,
  setActiveItemId,
  onUploadClick,
  onRemoveItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDomainSelect = (domain: string) => {
    onDomainChange?.(domain);
    onSelectDomain?.(domain);
  };

  const navigationLayers = [
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'inbox', label: 'Inbox', icon: Inbox },
        { id: 'calls', label: 'Calls', icon: Phone },
      ]
    },
    {
      title: 'KNOWLEDGE',
      items: [
        { id: 'docs', label: 'Documents', icon: FileText },
        { id: 'canvas', label: 'AI Canvas', icon: Layout },
        { id: 'files', label: 'Files', icon: Folder },
      ]
    },
    {
      title: 'WORK',
      items: [
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'crm', label: 'CRM', icon: Users },
        { id: 'tickets', label: 'Tickets', icon: Ticket },
      ]
    },
    {
      title: 'AI',
      items: [
        { id: 'agents', label: 'Your AI Team', icon: Bot },
        { id: 'business_os', label: 'Business Dashboard', icon: BarChart2 },
        { id: 'governance', label: 'Security & Governance', icon: ShieldCheck },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'health', label: 'Platform Health', icon: HeartPulse },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    },
  ];

  const installedSolutions = [
    { id: 'ws_recruitment', label: 'RecruitmentOS', version: 'v2.1.4', publisher: 'CHATR Enterprise', initial: 'R', color: 'bg-emerald-600' },
    { id: 'ws_hospital', label: 'Healthcare OS', version: 'v2.0.0', publisher: 'CHATR Health', initial: 'H', color: 'bg-rose-600' },
    { id: 'ws_sales', label: 'Sales Intelligence', version: 'v1.8.2', publisher: 'CHATR Sales', initial: 'S', color: 'bg-indigo-600' },
    { id: 'ws_legal', label: 'Legal Reviewer', version: 'v1.5.0', publisher: 'CHATR Legal', initial: 'L', color: 'bg-violet-600' },
    { id: 'ws_finance', label: 'Finance & Accounting', version: 'v2.0.1', publisher: 'CHATR Finance', initial: 'F', color: 'bg-amber-600' },
  ];

  return (
    <nav className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden shrink-0">
      
      {/* 1. Global Universal Search Bar (Top Priority) */}
      <div className="p-3 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Everything... (⌘F)"
            className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* 2. Scrollable Navigation Layers */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navigationLayers.map(layer => (
          <div key={layer.title}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2.5">
              {layer.title}
            </div>
            <div className="space-y-0.5">
              {layer.items.map(item => {
                const isActive = item.id === activeDomain;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleDomainSelect(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive 
                        ? 'bg-white shadow-sm border border-slate-200 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* 3. Installed Solution Packs Layer */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2.5 flex justify-between items-center">
            <span>INSTALLED SOLUTIONS</span>
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-normal">Packs</span>
          </div>
          <div className="space-y-1.5">
            {installedSolutions.map(ws => (
              <button
                key={ws.id}
                onClick={() => handleDomainSelect(ws.id)}
                className="w-full flex flex-col p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${ws.color} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                      {ws.initial}
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{ws.label}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[8px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{ws.version}</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 pl-6 truncate font-mono">
                  {ws.publisher}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Active Missions Detail (When Mission Center selected) */}
      {activeDomain === 'missions' && (
        <div className="border-t border-slate-200 p-3 bg-white shrink-0">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Missions</div>
            <button onClick={onUploadClick} className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors" title="New Mission">
              <UploadCloud className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1">
            {items.map(item => {
              const isSelected = activeItemId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItemId?.(item.id)}
                  className={`w-full text-left px-2 py-1 rounded text-xs truncate transition-colors ${
                    isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.sourceUri}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </nav>
  );
};

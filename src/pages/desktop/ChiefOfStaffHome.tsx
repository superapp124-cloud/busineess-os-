/**
 * CHATR — Universal Business OS (Home Page)
 *
 * User-Driven Command Center for Communications, AI Assistant & Workspace.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Mail, MessageSquare, Calendar,
  CheckCircle2, Clock, Inbox, Zap, ChevronRight, Search,
  X, Users, Phone, FileText, RefreshCw, Filter, Shield,
  Layers, Send, Plus, Settings, UserPlus, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import chatrLogo from '@/assets/chatr-icon-logo.png';
import { supabase } from '@/integrations/supabase/client';

// ── Source badge helper ──────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  gmail:    { color: '#ffffff', bg: '#EA4335', label: 'Gm' },
  outlook:  { color: '#ffffff', bg: '#0078D4', label: 'Ol' },
  whatsapp: { color: '#ffffff', bg: '#25D366', label: 'Wa' },
  linkedin: { color: '#ffffff', bg: '#0A66C2', label: 'Li' },
  slack:    { color: '#ffffff', bg: '#4A154B', label: 'Sl' },
  teams:    { color: '#ffffff', bg: '#6264A7', label: 'Te' },
  system:   { color: '#ffffff', bg: '#8B5CF6', label: 'OS' },
};

const SourceBadge: React.FC<{ source: string; size?: 'sm' | 'md' }> = ({ source, size = 'sm' }) => {
  const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG['system'];
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold flex-shrink-0',
        size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[11px]'
      )}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
};

// ── User-driven Starter Timeline Items ────────────────────────────────────────

interface TimelineItem {
  id: string;
  source: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  priority: 'urgent' | 'action' | 'fyi';
  category: string;
  read: boolean;
  actionPath?: string;
}

const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: '1',
    source: 'system',
    sender: 'CHATR Operating Hub',
    subject: 'Welcome to your AI Business Workspace',
    preview: 'Your communication dashboard is active. Connect your messaging apps, email accounts, and AI assistants to stream all updates here.',
    time: 'Just now',
    priority: 'action',
    category: 'Getting Started',
    read: false,
    actionPath: '/desktop/settings',
  },
  {
    id: '2',
    source: 'system',
    sender: 'AI Executive Assistant',
    subject: 'AI Copilot standing by',
    preview: 'Ask AI to summarize messages, draft responses, manage schedule, and analyze work documents in real-time.',
    time: '5m ago',
    priority: 'action',
    category: 'AI Assistant',
    read: false,
    actionPath: '/desktop/ai-agents',
  },
  {
    id: '3',
    source: 'teams',
    sender: 'Universal Inbox',
    subject: 'Cross-channel messages unified',
    preview: 'All your chats, calls, and emails are synchronized into a single intelligent view for quick action.',
    time: '15m ago',
    priority: 'action',
    category: 'Workspace',
    read: true,
    actionPath: '/desktop/inbox',
  },
  {
    id: '4',
    source: 'system',
    sender: 'Security & Privacy',
    subject: 'Private memory & storage enabled',
    preview: 'Your conversations and private files are protected with device-level encryption.',
    time: '1h ago',
    priority: 'fyi',
    category: 'Security',
    read: true,
    actionPath: '/desktop/settings',
  },
];

// ── AI Brief Summary ────────────────────────────────────────────────────────

const AI_BRIEF = {
  urgent: 0,
  action: 3,
  canWait: 1,
  fyi: 4,
  topActions: [
    { id: 'a1', label: 'Explore AI Assistant', category: 'AI Assistant', icon: Sparkles, urgent: false, path: '/desktop/ai-agents' },
    { id: 'a2', label: 'Connect Communications', category: 'Workspace', icon: Inbox, urgent: false, path: '/desktop/settings' },
    { id: 'a3', label: 'Manage Profile & Security', category: 'Security', icon: Shield, urgent: false, path: '/desktop/settings' },
  ],
  categories: [
    { name: 'Getting Started', count: 1, color: 'bg-violet-500', path: '/desktop/settings' },
    { name: 'AI Assistant', count: 2, color: 'bg-cyan-500', path: '/desktop/ai-agents' },
    { name: 'Workspace', count: 2, color: 'bg-emerald-500', path: '/desktop/inbox' },
    { name: 'Security', count: 1, color: 'bg-amber-500', path: '/desktop/settings' },
  ],
};

// ── User Active Copilots ──────────────────────────────────────────────────────

const ACTIVE_COPILOTS = [
  { id: '1', name: 'Smart Communication Sync', status: 'Active', path: '/desktop/inbox' },
  { id: '2', name: 'AI Executive Assistant', status: 'Ready', path: '/desktop/ai-agents' },
  { id: '3', name: 'Encrypted Memory Vault', status: 'Protected', path: '/desktop/settings' },
];

// ── Priority Badge ────────────────────────────────────────────────────────────

const PriorityBadge: React.FC<{ priority: TimelineItem['priority'] }> = ({ priority }) => {
  if (priority === 'urgent') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">URGENT</span>;
  if (priority === 'action') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">ACTION</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 border border-zinc-700">FYI</span>;
};

// ── Main Component ────────────────────────────────────────────────────────────

export const ChiefOfStaffHome: React.FC = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('User');
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(DEFAULT_TIMELINE_ITEMS);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(DEFAULT_TIMELINE_ITEMS[0]);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'action'>('all');
  const [dismissedActions, setDismissedActions] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    const t = setInterval(() => setCurrentTime(new Date()), 60000);

    const loadUserProfile = async (userObj?: any) => {
      try {
        let user = userObj;
        if (!user) {
          const { data: sessionData } = await supabase.auth.getSession();
          user = sessionData?.session?.user;
        }
        if (!user) {
          const { data: userData } = await supabase.auth.getUser();
          user = userData?.user;
        }
        if (!user) return;

        // Fetch from Supabase profiles table using select('*')
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const candidateName =
          profile?.full_name ||
          profile?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (profile?.username && !profile.username.startsWith('user_') ? profile.username : '') ||
          user.user_metadata?.username ||
          '';

        const cleaned = (candidateName || '').trim();
        if (cleaned) {
          const firstName = cleaned.split(' ')[0];
          setUserName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
        } else if (profile?.phone_number || user?.phone) {
          setUserName(profile?.phone_number || user?.phone);
        } else {
          setUserName('User');
        }
      } catch (err) {
        console.warn('[ChiefOfStaffHome] Profile query error:', err);
      }
    };

    loadUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
    });

    return () => {
      clearInterval(t);
      subscription.unsubscribe();
    };
  }, []);

  const filteredItems = timelineItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return item.priority === 'urgent';
    if (filter === 'action') return item.priority === 'action';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F8F5] text-[#111817] overflow-hidden">

      {/* ── Top Welcome & Quick Action Bar (Single Clean Strip, No Duplicate Logout) ── */}
      <header className="px-6 py-4 border-b border-[#DDE3DF] flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0EB] flex items-center justify-center p-2 shadow-sm border border-[#DDE3DF] shrink-0">
            <img src={chatrLogo} alt="CHATR OS" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-[#111817] leading-tight flex items-center gap-2">
              {greeting}, <span className="text-[#164E3F]">{userName}</span> 👋
            </span>
            <span className="text-xs text-[#53605C]">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · All services operational
            </span>
          </div>
        </div>

        {/* User Action Launchers */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/desktop/chat')}
            className="flex items-center gap-2 bg-[#164E3F] hover:bg-[#2E6B59] text-white rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => navigate('/desktop/calls')}
            className="flex items-center gap-2 bg-[#2E6B59] hover:bg-[#3d8a73] text-white rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Start Call</span>
          </button>

          <button
            onClick={() => navigate('/desktop/inbox')}
            className="flex items-center gap-2 bg-white hover:bg-[#E8F0EB] text-[#53605C] border border-[#DDE3DF] rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
          >
            <Inbox className="w-4 h-4 text-[#164E3F]" />
            <span>Universal Inbox</span>
          </button>
        </div>
      </header>

      {/* ── Summary & Quick Filters Bar ────────────────────────────────────────── */}
      <div className="h-12 border-b border-[#DDE3DF] px-6 flex items-center gap-6 shrink-0 bg-white/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#53605C] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#164E3F]" />
          Executive Overview
        </div>
        <div className="w-px h-4 bg-[#DDE3DF]" />
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-amber-600">{AI_BRIEF.action}</span>
            <span className="text-[#53605C] text-xs">Actions required</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#DDE3DF]" />
            <span className="font-bold text-[#111817]">{AI_BRIEF.canWait}</span>
            <span className="text-[#53605C] text-xs">Can wait</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#E8F0EB]" />
            <span className="font-bold text-[#53605C]">{AI_BRIEF.fyi}</span>
            <span className="text-[#53605C] text-xs">Info updates</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[#53605C]">Live Workspace Sync</span>
          <RefreshCw className="w-3.5 h-3.5 text-[#53605C] hover:text-[#164E3F] cursor-pointer transition-colors" />
        </div>
      </div>

      {/* ── Main 3-Column Body ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT COLUMN: User Actions & Quick Navigation ────────────────── */}
        <aside className="w-[280px] border-r border-[#DDE3DF] flex flex-col shrink-0 bg-white overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-4 border-b border-[#DDE3DF]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#53605C]">Quick Actions</span>
              <span className="text-[10px] text-[#53605C]">{AI_BRIEF.topActions.length} items</span>
            </div>
            <div className="space-y-2">
              {AI_BRIEF.topActions.filter(a => !dismissedActions.has(a.id)).map(action => (
                <div
                  key={action.id}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#DDE3DF] bg-[#F8F8F5] hover:bg-[#E8F0EB] hover:border-[#164E3F]/20 cursor-pointer group transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E8F0EB] flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-3.5 h-3.5 text-[#164E3F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#111817] truncate">{action.label}</div>
                    <div className="text-[10px] text-[#53605C]">{action.category}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#DDE3DF] group-hover:text-[#164E3F] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Context Categories */}
          <div className="p-4 border-b border-[#DDE3DF]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#53605C]">Workspace Context</span>
            </div>
            <div className="space-y-2">
              {AI_BRIEF.categories.map(cat => (
                <div 
                  key={cat.name} 
                  onClick={() => navigate(cat.path)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#E8F0EB] cursor-pointer group transition-all"
                >
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cat.color)} />
                  <span className="text-xs text-[#53605C] group-hover:text-[#164E3F] transition-colors flex-1">{cat.name}</span>
                  <span className="text-xs text-[#53605C]">{cat.count}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#DDE3DF] group-hover:text-[#164E3F] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Active Copilots */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#53605C]">Active Copilots</span>
              <button onClick={() => navigate('/desktop/ai-agents')} className="text-[10px] text-[#164E3F] hover:text-[#2E6B59] transition-colors">Manage</button>
            </div>
            <div className="space-y-2">
              {ACTIVE_COPILOTS.map(agent => (
                <div 
                  key={agent.id} 
                  onClick={() => navigate(agent.path)}
                  className="p-2.5 rounded-xl bg-[#F8F8F5] hover:bg-[#E8F0EB] border border-[#DDE3DF] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-[#111817] font-medium">{agent.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">{agent.status}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CENTER COLUMN: Interactive Activity Stream ───────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-11 border-b border-[#DDE3DF] px-4 flex items-center justify-between shrink-0 bg-white/60">
            <div className="flex items-center gap-1">
              {(['all', 'urgent', 'action'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer',
                    filter === f
                      ? 'bg-[#164E3F] text-white shadow-sm'
                      : 'text-[#53605C] hover:text-[#164E3F] hover:bg-[#E8F0EB]'
                  )}
                >
                  {f === 'all' ? `All Updates (${timelineItems.length})` : f === 'urgent' ? `Urgent (${AI_BRIEF.urgent})` : `Action Items (${AI_BRIEF.action})`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/desktop/inbox')}
                className="flex items-center gap-1.5 text-xs text-[#164E3F] hover:text-[#2E6B59] px-3 py-1 rounded-lg hover:bg-[#E8F0EB] transition-all font-semibold cursor-pointer"
              >
                <Inbox className="w-3.5 h-3.5" /> Open Full Inbox
              </button>
            </div>
          </div>

          {/* Timeline list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#53605C] bg-[#F8F8F5] border-b border-[#DDE3DF] sticky top-0 z-10">
              Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  'w-full text-left px-4 py-3.5 border-b border-[#DDE3DF] flex items-start gap-3 transition-all group cursor-pointer',
                  selectedItem?.id === item.id
                    ? 'bg-[#E8F0EB] border-l-2 border-l-[#164E3F]'
                    : 'hover:bg-[#F8F8F5] border-l-2 border-l-transparent',
                  !item.read && 'bg-white'
                )}
              >
                <SourceBadge source={item.source} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={cn('text-xs font-semibold truncate', item.read ? 'text-[#53605C]' : 'text-[#111817]')}>
                      {item.sender}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-[#53605C]">{item.time}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </div>
                  <div className={cn('text-xs truncate mb-0.5', item.read ? 'text-[#53605C]' : 'text-[#111817] font-medium')}>
                    {item.subject}
                  </div>
                  <div className="text-[11px] text-[#53605C] truncate leading-relaxed">
                    {item.preview}
                  </div>
                </div>
              </button>
            ))}

            <div className="px-4 py-6 text-center">
              <button
                onClick={() => navigate('/desktop/inbox')}
                className="text-xs text-[#164E3F] hover:text-[#2E6B59] transition-colors font-semibold flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <Inbox className="w-3.5 h-3.5" />
                View all workspace communications
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* ── RIGHT COLUMN: Selected Item Action Context ────────────────────── */}
        <aside className="w-[320px] border-l border-[#DDE3DF] flex flex-col shrink-0 bg-white overflow-y-auto pb-24">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#DDE3DF]">
                <div className="flex items-start gap-3 mb-3">
                  <SourceBadge source={selectedItem.source} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#111817] leading-tight">{selectedItem.sender}</div>
                    <div className="text-xs text-[#53605C] mt-0.5 leading-snug">{selectedItem.subject}</div>
                  </div>
                  <PriorityBadge priority={selectedItem.priority} />
                </div>
                <p className="text-xs text-[#53605C] leading-relaxed bg-[#F8F8F5] rounded-xl p-3 border border-[#DDE3DF]">
                  {selectedItem.preview}
                </p>
              </div>

              {/* AI Summary */}
              <div className="p-4 border-b border-[#DDE3DF]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#164E3F]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#53605C]">AI Recommendation</span>
                </div>
                <p className="text-xs text-[#53605C] leading-relaxed">
                  {selectedItem.priority === 'urgent'
                    ? 'Immediate action requested. Click Reply or Delegate to handle now.'
                    : selectedItem.priority === 'action'
                    ? 'Action recommended. You can respond directly or connect relevant tools.'
                    : 'Informational update. Saved to your workspace memory.'}
                </p>
              </div>

              {/* Smart Replies */}
              <div className="p-4 border-b border-[#DDE3DF]">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#53605C] mb-2">Quick Responses</div>
                <div className="space-y-1.5">
                  {[
                    'Acknowledge & Proceed',
                    'Schedule a sync meeting',
                    'Request more details',
                  ].map(reply => (
                    <button
                      key={reply}
                      onClick={() => navigate(selectedItem.actionPath || '/desktop/chat')}
                      className="w-full text-left text-xs text-[#53605C] hover:text-[#164E3F] bg-[#F8F8F5] hover:bg-[#E8F0EB] border border-[#DDE3DF] hover:border-[#164E3F]/20 rounded-xl px-3 py-2 transition-all cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => navigate(selectedItem.actionPath || '/desktop/chat')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#164E3F] hover:bg-[#2E6B59] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Take Action Now
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setTimelineItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, read: true } : i));
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F8F8F5] hover:bg-[#E8F0EB] border border-[#DDE3DF] text-[#53605C] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mark Done
                  </button>
                  <button 
                    onClick={() => navigate('/desktop/ai-agents')}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F8F8F5] hover:bg-[#E8F0EB] border border-[#DDE3DF] text-[#53605C] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#164E3F]" /> Delegate to AI
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Inbox className="w-10 h-10 text-[#DDE3DF] mb-4" />
              <div className="text-sm font-semibold text-[#53605C]">Select an item</div>
              <div className="text-xs text-[#53605C]/60 mt-1">Details & quick actions will appear here</div>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};

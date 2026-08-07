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
          profile?.username ||
          profile?.first_name ||
          profile?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.username ||
          (user.email ? user.email.split('@')[0] : '');

        const cleaned = (candidateName || '').trim();
        const isNumericPhone = !cleaned || /^\+?[0-9\s\-]+$/.test(cleaned);

        if (isNumericPhone) {
          setUserName('User');
        } else {
          const firstName = cleaned.split(' ')[0];
          setUserName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
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
    <div className="flex flex-col h-full bg-[#080810] text-white overflow-hidden">

      {/* ── Top Welcome & Quick Action Bar (Single Clean Strip, No Duplicate Logout) ── */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0d0d18]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center p-2 shadow-md border border-white/10 shrink-0">
            <img src={chatrLogo} alt="CHATR OS" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white leading-tight flex items-center gap-2">
              {greeting}, <span className="text-violet-400">{userName}</span> 👋
            </span>
            <span className="text-xs text-zinc-400">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · All services operational
            </span>
          </div>
        </div>

        {/* User Action Launchers */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/desktop/chat')}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-violet-900/30 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => navigate('/desktop/calls')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Start Call</span>
          </button>

          <button
            onClick={() => navigate('/desktop/inbox')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
          >
            <Inbox className="w-4 h-4 text-violet-400" />
            <span>Universal Inbox</span>
          </button>
        </div>
      </header>

      {/* ── Summary & Quick Filters Bar ────────────────────────────────────────── */}
      <div className="h-12 border-b border-white/5 px-6 flex items-center gap-6 shrink-0 bg-[#0d0d18]/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          Executive Overview
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-amber-400">{AI_BRIEF.action}</span>
            <span className="text-zinc-400 text-xs">Actions required</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="font-bold text-zinc-300">{AI_BRIEF.canWait}</span>
            <span className="text-zinc-400 text-xs">Can wait</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-zinc-700" />
            <span className="font-bold text-zinc-400">{AI_BRIEF.fyi}</span>
            <span className="text-zinc-400 text-xs">Info updates</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-500">Live Workspace Sync</span>
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* ── Main 3-Column Body ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT COLUMN: User Actions & Quick Navigation ────────────────── */}
        <aside className="w-[280px] border-r border-white/5 flex flex-col shrink-0 bg-[#0d0d18]/60 overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Quick Actions</span>
              <span className="text-[10px] text-zinc-500">{AI_BRIEF.topActions.length} items</span>
            </div>
            <div className="space-y-2">
              {AI_BRIEF.topActions.filter(a => !dismissedActions.has(a.id)).map(action => (
                <div
                  key={action.id}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 bg-white/3 hover:bg-white/8 hover:border-violet-500/30 cursor-pointer group transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{action.label}</div>
                    <div className="text-[10px] text-zinc-400">{action.category}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Context Categories */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Workspace Context</span>
            </div>
            <div className="space-y-2">
              {AI_BRIEF.categories.map(cat => (
                <div 
                  key={cat.name} 
                  onClick={() => navigate(cat.path)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer group transition-all"
                >
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cat.color)} />
                  <span className="text-xs text-zinc-300 group-hover:text-white transition-colors flex-1">{cat.name}</span>
                  <span className="text-xs text-zinc-500">{cat.count}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Active Copilots */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Active Copilots</span>
              <button onClick={() => navigate('/desktop/ai-agents')} className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors">Manage</button>
            </div>
            <div className="space-y-2">
              {ACTIVE_COPILOTS.map(agent => (
                <div 
                  key={agent.id} 
                  onClick={() => navigate(agent.path)}
                  className="p-2.5 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-zinc-200 font-medium">{agent.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">{agent.status}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CENTER COLUMN: Interactive Activity Stream ───────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-11 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-[#0d0d18]/40">
            <div className="flex items-center gap-1">
              {(['all', 'urgent', 'action'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer',
                    filter === f
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {f === 'all' ? `All Updates (${timelineItems.length})` : f === 'urgent' ? `Urgent (${AI_BRIEF.urgent})` : `Action Items (${AI_BRIEF.action})`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/desktop/inbox')}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 px-3 py-1 rounded-lg hover:bg-violet-500/10 transition-all font-semibold cursor-pointer"
              >
                <Inbox className="w-3.5 h-3.5" /> Open Full Inbox
              </button>
            </div>
          </div>

          {/* Timeline list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-[#0d0d18]/20 border-b border-white/3 sticky top-0 z-10">
              Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  'w-full text-left px-4 py-3.5 border-b border-white/4 flex items-start gap-3 transition-all group cursor-pointer',
                  selectedItem?.id === item.id
                    ? 'bg-violet-500/8 border-l-2 border-l-violet-500'
                    : 'hover:bg-white/3 border-l-2 border-l-transparent',
                  !item.read && 'bg-white/[0.015]'
                )}
              >
                <SourceBadge source={item.source} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={cn('text-xs font-semibold truncate', item.read ? 'text-zinc-300' : 'text-white')}>
                      {item.sender}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-zinc-500">{item.time}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </div>
                  <div className={cn('text-xs truncate mb-0.5', item.read ? 'text-zinc-400' : 'text-zinc-200 font-medium')}>
                    {item.subject}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate leading-relaxed">
                    {item.preview}
                  </div>
                </div>
              </button>
            ))}

            <div className="px-4 py-6 text-center">
              <button
                onClick={() => navigate('/desktop/inbox')}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-semibold flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <Inbox className="w-3.5 h-3.5" />
                View all workspace communications
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* ── RIGHT COLUMN: Selected Item Action Context ────────────────────── */}
        <aside className="w-[320px] border-l border-white/5 flex flex-col shrink-0 bg-[#0d0d18]/60 overflow-y-auto pb-24">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-start gap-3 mb-3">
                  <SourceBadge source={selectedItem.source} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white leading-tight">{selectedItem.sender}</div>
                    <div className="text-xs text-zinc-400 mt-0.5 leading-snug">{selectedItem.subject}</div>
                  </div>
                  <PriorityBadge priority={selectedItem.priority} />
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed bg-white/3 rounded-xl p-3 border border-white/5">
                  {selectedItem.preview}
                </p>
              </div>

              {/* AI Summary */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">AI Recommendation</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {selectedItem.priority === 'urgent'
                    ? 'Immediate action requested. Click Reply or Delegate to handle now.'
                    : selectedItem.priority === 'action'
                    ? 'Action recommended. You can respond directly or connect relevant tools.'
                    : 'Informational update. Saved to your workspace memory.'}
                </p>
              </div>

              {/* Smart Replies */}
              <div className="p-4 border-b border-white/5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Quick Responses</div>
                <div className="space-y-1.5">
                  {[
                    'Acknowledge & Proceed',
                    'Schedule a sync meeting',
                    'Request more details',
                  ].map(reply => (
                    <button
                      key={reply}
                      onClick={() => navigate(selectedItem.actionPath || '/desktop/chat')}
                      className="w-full text-left text-xs text-zinc-300 hover:text-white bg-white/3 hover:bg-white/8 border border-white/5 hover:border-violet-500/40 rounded-xl px-3 py-2 transition-all cursor-pointer"
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Take Action Now
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setTimelineItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, read: true } : i));
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark Done
                  </button>
                  <button 
                    onClick={() => navigate('/desktop/ai-agents')}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-cyan-400" /> Delegate to AI
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Inbox className="w-10 h-10 text-zinc-600 mb-4" />
              <div className="text-sm font-semibold text-zinc-400">Select an item</div>
              <div className="text-xs text-zinc-600 mt-1">Details & quick actions will appear here</div>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};

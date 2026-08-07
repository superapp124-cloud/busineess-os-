/**
 * CHATR — Universal Intelligence Hub (Home v4.0)
 *
 * The Command Center of the Communication OS.
 * Shows: AI Brief | Universal Timeline | Quick Actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Mail, MessageSquare, Calendar,
  CheckCircle2, Clock, AlertTriangle, Bot, Star, Inbox,
  Zap, ChevronRight, Search, Building2, X, Check,
  AlertCircle, TrendingUp, Users, Phone, FileText,
  Github, Linkedin, Bell, Globe, RefreshCw, Filter,
  Brain, Target, Shield, Layers, BarChart2, Send,
  ChevronDown, MoreHorizontal, Plus, Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Source badge helper ──────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  gmail:    { color: '#ffffff', bg: '#EA4335', label: 'Gm' },
  outlook:  { color: '#ffffff', bg: '#0078D4', label: 'Ol' },
  yahoo:    { color: '#ffffff', bg: '#6001D2', label: 'Ya' },
  whatsapp: { color: '#ffffff', bg: '#25D366', label: 'Wa' },
  instagram:{ color: '#ffffff', bg: '#E1306C', label: 'In' },
  linkedin: { color: '#ffffff', bg: '#0A66C2', label: 'Li' },
  slack:    { color: '#ffffff', bg: '#4A154B', label: 'Sl' },
  teams:    { color: '#ffffff', bg: '#6264A7', label: 'Te' },
  discord:  { color: '#ffffff', bg: '#5865F2', label: 'Di' },
  github:   { color: '#ffffff', bg: '#24292e', label: 'Gh' },
  twitter:  { color: '#ffffff', bg: '#000000', label: 'X'  },
  telegram: { color: '#ffffff', bg: '#0088CC', label: 'Tg' },
  signal:   { color: '#ffffff', bg: '#3A76F0', label: 'Si' },
  facebook: { color: '#ffffff', bg: '#1877F2', label: 'Fb' },
};

const SourceBadge: React.FC<{ source: string; size?: 'sm' | 'md' }> = ({ source, size = 'sm' }) => {
  const cfg = SOURCE_CONFIG[source] || { color: '#fff', bg: '#555', label: '?' };
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

// ── Mock timeline data ───────────────────────────────────────────────────────

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
}

const TIMELINE_ITEMS: TimelineItem[] = [
  { id: '1', source: 'slack',    sender: '#engineering', subject: 'Deploy failed on prod',          preview: 'The latest deployment to production failed at 08:41. Rollback initiated.',  time: '1h ago',   priority: 'urgent',  category: 'Engineering', read: false },
  { id: '2', source: 'gmail',    sender: 'Amazon',       subject: 'Invoice ₹4,599 due',             preview: 'Your invoice #INV-2026-4891 for ₹4,599 is due in 3 days.',              time: '2h ago',   priority: 'urgent',  category: 'Finance',     read: false },
  { id: '3', source: 'teams',    sender: 'HR Dept',      subject: 'Policy update: Acknowledge',     preview: 'New remote work policy effective Aug 1. Requires your digital signature.', time: '2h ago',   priority: 'action',  category: 'Internal',    read: false },
  { id: '4', source: 'linkedin', sender: 'Priya S.',     subject: 'Recruiter: Senior role @ FAANG', preview: 'We have a senior engineering role that matches your profile...', time: '32m ago',  priority: 'action',  category: 'Hiring',      read: false },
  { id: '5', source: 'github',   sender: 'Gaurav B.',    subject: 'PR #847 review requested',       preview: 'Gaurav requested your review on: feat/universal-inbox-v2',               time: '2h ago',   priority: 'action',  category: 'Engineering', read: false },
  { id: '6', source: 'outlook',  sender: 'Microsoft',    subject: 'Partnership meeting confirmed',  preview: 'Your meeting "Q3 Partnership Sync" with Microsoft is confirmed for 3PM.', time: '15m ago',  priority: 'action',  category: 'Sales',       read: false },
  { id: '7', source: 'telegram', sender: 'Customer',     subject: 'Order not received',             preview: 'Hello, I placed order #88234 5 days ago and still haven\'t received it.', time: '4h ago',   priority: 'urgent',  category: 'Support',     read: false },
  { id: '8', source: 'whatsapp', sender: 'Family Group', subject: "Mama's birthday tomorrow!",     preview: 'Don\'t forget — cake from bakery, flowers from the garden!',       time: '1h ago',   priority: 'fyi',     category: 'Family',      read: true  },
  { id: '9', source: 'twitter',  sender: '@techcrunch',  subject: 'Mentioned you in a post',        preview: 'Great thread on Communication OS design patterns!',                      time: '3h ago',   priority: 'fyi',     category: 'Social',      read: true  },
  { id: '10',source: 'gmail',    sender: 'Indigo',       subject: 'Flight DEL → BOM tomorrow',     preview: 'Your flight 6E-2241 departs at 06:30 AM. Check-in opens now.',           time: '4h ago',   priority: 'fyi',     category: 'Travel',      read: true  },
  { id: '11',source: 'discord',  sender: '#builds',      subject: 'CI Pipeline passed ✓',          preview: 'Build #2041: All 247 tests passed. Coverage: 94.2%',                    time: '5h ago',   priority: 'fyi',     category: 'Engineering', read: true  },
  { id: '12',source: 'instagram',sender: 'design_lead',  subject: 'New DM',                        preview: 'Hey! Loved the new CHATR UI. Can we collaborate?',                      time: '3h ago',   priority: 'fyi',     category: 'Social',      read: true  },
];

// ── AI Brief summary ─────────────────────────────────────────────────────────

const AI_BRIEF = {
  urgent: 3,
  action: 8,
  canWait: 14,
  fyi: 261,
  total: 286,
  topActions: [
    { id: 'a1', label: 'Approve Payroll', category: 'Finance',     icon: CheckCircle2, urgent: true  },
    { id: 'a2', label: 'Reply to CEO',    category: 'Internal',    icon: Send,         urgent: true  },
    { id: 'a3', label: 'Review PR #847',  category: 'Engineering', icon: Github,       urgent: false },
    { id: 'a4', label: 'Interview Call',  category: 'Hiring',      icon: Phone,        urgent: false },
    { id: 'a5', label: 'Pay Electricity', category: 'Finance',     icon: Zap,          urgent: false },
  ],
  categories: [
    { name: 'Hiring',      count: 4,  color: 'bg-violet-500' },
    { name: 'Finance',     count: 6,  color: 'bg-amber-500'  },
    { name: 'Engineering', count: 8,  color: 'bg-cyan-500'   },
    { name: 'Travel',      count: 2,  color: 'bg-emerald-500'},
    { name: 'Family',      count: 3,  color: 'bg-pink-500'   },
    { name: 'Support',     count: 5,  color: 'bg-red-500'    },
  ],
};

// ── Running agents mock ──────────────────────────────────────────────────────

const RUNNING_AGENTS = [
  { id: '1', name: 'Sales Automation',  status: 'running', progress: 72 },
  { id: '2', name: 'Invoice Processor', status: 'running', progress: 45 },
  { id: '3', name: 'Candidate Screen',  status: 'waiting', progress: 0  },
];

// ── Priority badge ────────────────────────────────────────────────────────────

const PriorityBadge: React.FC<{ priority: TimelineItem['priority'] }> = ({ priority }) => {
  if (priority === 'urgent') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">URGENT</span>;
  if (priority === 'action') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">ACTION</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 border border-zinc-700">FYI</span>;
};

// ── Main component ────────────────────────────────────────────────────────────

import chatrLogo from '@/assets/chatr-icon-logo.png';
import { supabase } from '@/integrations/supabase/client';
import { LogOut } from 'lucide-react';

export const ChiefOfStaffHome: React.FC = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('User');
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(TIMELINE_ITEMS[0]);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'action'>('all');
  const [dismissedActions, setDismissedActions] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    const t = setInterval(() => setCurrentTime(new Date()), 60000);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const rawName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const formatted = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        setUserName(formatted);
      }
    });

    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const filteredItems = TIMELINE_ITEMS.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return item.priority === 'urgent';
    if (filter === 'action') return item.priority === 'action';
    return true;
  });

  return (
    <div className="flex flex-col h-screen bg-[#080810] text-white overflow-hidden">

      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <header className="h-[60px] border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-[#0d0d18]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center p-1.5 shadow-md border border-white/10 shrink-0">
            <img src={chatrLogo} alt="CHATR OS" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-tight">
              {greeting}, <span className="text-violet-400">{userName}</span> 👋
            </span>
            <span className="text-[11px] text-zinc-500">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · AI processed {TIMELINE_ITEMS.length} events today
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Universal search pill */}
          <button
            onClick={() => navigate('/desktop/inbox')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl px-4 py-2 text-zinc-400 text-sm transition-all w-80 group"
          >
            <Search className="w-4 h-4 text-zinc-500" />
            <span className="flex-1 text-left text-zinc-500 group-hover:text-zinc-300 transition-colors">Search emails, messages, files…</span>
            <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-zinc-500">⌘K</kbd>
          </button>

          <button
            onClick={() => navigate('/desktop/inbox')}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-violet-900/30"
          >
            <Inbox className="w-4 h-4" />
            Universal Inbox
            <span className="bg-white/20 text-xs font-bold px-1.5 py-0.5 rounded-full">286</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all shadow-sm cursor-pointer ml-1"
            title="Sign Out of CHATR OS"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── AI Brief Strip ─────────────────────────────────────────────────── */}
      <div className="h-12 border-b border-white/5 px-6 flex items-center gap-6 shrink-0 bg-[#0d0d18]/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          AI Brief
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-red-400">{AI_BRIEF.urgent}</span>
            <span className="text-zinc-500">Urgent</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-amber-400">{AI_BRIEF.action}</span>
            <span className="text-zinc-500">Action needed</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="font-bold text-zinc-300">{AI_BRIEF.canWait}</span>
            <span className="text-zinc-500">Can wait</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-zinc-700" />
            <span className="font-bold text-zinc-500">{AI_BRIEF.fyi}</span>
            <span className="text-zinc-600">FYI</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-600">Updated just now</span>
          <RefreshCw className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* ── Main 3-Column Body ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT COLUMN: AI Brief ────────────────────────────────────────── */}
        <aside className="w-[280px] border-r border-white/5 flex flex-col shrink-0 bg-[#0d0d18]/60 overflow-y-auto">
          {/* Top actions */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Requires Your Attention</span>
              <span className="text-[10px] text-zinc-600">{AI_BRIEF.action + AI_BRIEF.urgent} items</span>
            </div>
            <div className="space-y-2">
              {AI_BRIEF.topActions.filter(a => !dismissedActions.has(a.id)).map(action => (
                <div
                  key={action.id}
                  className={cn(
                    'flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer group transition-all',
                    action.urgent
                      ? 'bg-red-500/8 border-red-500/20 hover:bg-red-500/12'
                      : 'bg-white/3 border-white/5 hover:bg-white/6'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                    action.urgent ? 'bg-red-500/20' : 'bg-violet-500/20'
                  )}>
                    <action.icon className={cn('w-3.5 h-3.5', action.urgent ? 'text-red-400' : 'text-violet-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{action.label}</div>
                    <div className="text-[10px] text-zinc-500">{action.category}</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDismissedActions(prev => new Set([...prev, action.id]))}
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-zinc-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">By Context</span>
            </div>
            <div className="space-y-2">
              {AI_BRIEF.categories.map(cat => (
                <div key={cat.name} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cat.color)} />
                  <span className="text-xs text-zinc-300 group-hover:text-white transition-colors flex-1">{cat.name}</span>
                  <span className="text-xs text-zinc-600">{cat.count}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Running agents */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Running Agents</span>
              <button onClick={() => navigate('/desktop/ai-agents')} className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors">View all</button>
            </div>
            <div className="space-y-2.5">
              {RUNNING_AGENTS.map(agent => (
                <div key={agent.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        agent.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      )} />
                      <span className="text-xs text-zinc-300">{agent.name}</span>
                    </div>
                    {agent.progress > 0 && <span className="text-[10px] text-zinc-600">{agent.progress}%</span>}
                  </div>
                  {agent.progress > 0 && (
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-1000"
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CENTER COLUMN: Universal Timeline ────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-11 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-[#0d0d18]/40">
            <div className="flex items-center gap-1">
              {(['all', 'urgent', 'action'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all',
                    filter === f
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  )}
                >
                  {f === 'all' ? `All (${TIMELINE_ITEMS.length})` : f === 'urgent' ? `Urgent (${AI_BRIEF.urgent})` : `Action (${AI_BRIEF.action})`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-all">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
              <button
                onClick={() => navigate('/desktop/inbox')}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 px-2 py-1 rounded-lg hover:bg-violet-500/10 transition-all font-semibold"
              >
                <Inbox className="w-3.5 h-3.5" /> Open Full Inbox
              </button>
            </div>
          </div>

          {/* Timeline list */}
          <div className="flex-1 overflow-y-auto">
            {/* Date group */}
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 bg-[#0d0d18]/20 border-b border-white/3 sticky top-0 z-10">
              Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  'w-full text-left px-4 py-3.5 border-b border-white/4 flex items-start gap-3 transition-all group',
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
                      <span className="text-[10px] text-zinc-600">{item.time}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </div>
                  <div className={cn('text-xs truncate mb-0.5', item.read ? 'text-zinc-400' : 'text-zinc-200 font-medium')}>
                    {item.subject}
                  </div>
                  <div className="text-[11px] text-zinc-600 truncate leading-relaxed">
                    {item.preview}
                  </div>
                </div>
              </button>
            ))}

            <div className="px-4 py-6 text-center">
              <button
                onClick={() => navigate('/desktop/inbox')}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-semibold flex items-center gap-1.5 mx-auto"
              >
                <Inbox className="w-3.5 h-3.5" />
                View all 286 items in Universal Inbox
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* ── RIGHT COLUMN: Selected Item Context ──────────────────────────── */}
        <aside className="w-[320px] border-l border-white/5 flex flex-col shrink-0 bg-[#0d0d18]/60 overflow-y-auto">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-start gap-3 mb-3">
                  <SourceBadge source={selectedItem.source} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white leading-tight">{selectedItem.sender}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 leading-snug">{selectedItem.subject}</div>
                  </div>
                  <PriorityBadge priority={selectedItem.priority} />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed bg-white/3 rounded-xl p-3 border border-white/5">
                  {selectedItem.preview}
                </p>
              </div>

              {/* AI Summary */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">AI Summary</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {selectedItem.priority === 'urgent'
                    ? 'This requires immediate attention. AI suggests addressing this within the next 2 hours to prevent escalation.'
                    : selectedItem.priority === 'action'
                    ? 'This requires a response or decision from you. Recommended: Handle before end of day.'
                    : 'This is informational. No immediate action needed — archived for your reference.'}
                </p>
              </div>

              {/* Smart Replies */}
              <div className="p-4 border-b border-white/5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Smart Replies</div>
                <div className="space-y-1.5">
                  {[
                    'On it, will update you shortly.',
                    'Can we discuss this in our next sync?',
                    'Please share more details on this.',
                  ].map(reply => (
                    <button
                      key={reply}
                      className="w-full text-left text-xs text-zinc-300 hover:text-white bg-white/3 hover:bg-white/6 border border-white/5 hover:border-violet-500/30 rounded-xl px-3 py-2 transition-all"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Related items */}
              <div className="p-4 border-b border-white/5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Related</div>
                <div className="space-y-1.5">
                  {[
                    { icon: FileText, label: 'Q3 Proposal.pdf',    sub: 'Shared 2 days ago' },
                    { icon: Calendar, label: 'Sync Meeting — 3PM', sub: 'Today' },
                  ].map(r => (
                    <div key={r.label} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
                      <r.icon className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-zinc-300 truncate">{r.label}</div>
                        <div className="text-[10px] text-zinc-600">{r.sub}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-zinc-700" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all">
                    <Send className="w-3.5 h-3.5" /> Reply
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 text-zinc-300 text-xs font-semibold transition-all">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 text-zinc-300 text-xs font-semibold transition-all">
                    <Clock className="w-3.5 h-3.5" /> Snooze
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 text-zinc-300 text-xs font-semibold transition-all">
                    <Bot className="w-3.5 h-3.5" /> Delegate
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Inbox className="w-10 h-10 text-zinc-700 mb-4" />
              <div className="text-sm font-semibold text-zinc-500">Select a message</div>
              <div className="text-xs text-zinc-700 mt-1">AI context will appear here</div>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};

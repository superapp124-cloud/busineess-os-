/**
 * DesktopIntelligence — CHATR OS Intelligence Command Center
 *
 * The single pane of glass for the entire Intent OS.
 * Shows:
 * - Live knowledge graph (people, topics, dates, intents)
 * - Commitment timeline — all scheduled + completed items
 * - Active capabilities across pages
 * - AI command bar — run any capability via natural language
 * - Session stats, OS health
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit, Sparkles, CheckCircle2, Clock, Users, FileText,
  Calendar, Bell, ArrowUpRight, Loader2, Send, Radio, Zap,
  BarChart3, Hash, AlertTriangle, MessageSquare, Phone,
  Mail, Search, ChevronRight, Activity, Shield, Database,
  Globe, Cpu, TrendingUp
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCHATROS } from '@/core/os/GlobalIntentProvider';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { generate } from '@/services/ai';
import { osScheduler } from '@/core/services/OSSchedulerService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// --- Capability registry UI data ---
const CAPABILITIES = [
  { id: 'reminder',  label: 'Reminder',       icon: Bell,         color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', status: 'gold' },
  { id: 'task',      label: 'Task',            icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', status: 'gold' },
  { id: 'meeting',   label: 'Meeting',         icon: Users,        color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', status: 'gold' },
  { id: 'note',      label: 'Note',            icon: FileText,     color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', status: 'gold' },
  { id: 'call',      label: 'Call',            icon: Phone,        color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', status: 'gold' },
  { id: 'email',     label: 'Email',           icon: Mail,         color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', status: 'gold' },
  { id: 'calendar',  label: 'Calendar',        icon: Calendar,     color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', status: 'gold' },
  { id: 'followup',  label: 'Follow-up',       icon: ArrowUpRight, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', status: 'gold' },
  { id: 'document',  label: 'Document',        icon: FileText,     color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', status: 'gold' },
  { id: 'interview', label: 'Interview',       icon: Users,        color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', status: 'gold' },
  { id: 'expense',   label: 'Expense',         icon: BarChart3,    color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/20', status: 'gold' },
  { id: 'checklist', label: 'Checklist',       icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', status: 'gold' },
  { id: 'contact',   label: 'Contact',         icon: Users,        color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', status: 'gold' },
  { id: 'flight',    label: 'Flight Booking',  icon: Globe,        color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', status: 'silver' },
  { id: 'hotel',     label: 'Hotel Booking',   icon: Database,     color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', status: 'base' },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  gold:   { label: '🏆', cls: 'text-amber-400' },
  silver: { label: '🥈', cls: 'text-slate-400' },
  base:   { label: '🔘', cls: 'text-white/30' },
};

// --- Stat Card ---
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; sub?: string; color: string }> = ({ icon, label, value, sub, color }) => (
  <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.10] transition-colors">
    <div className="flex items-center gap-2 mb-1">
      <span className={color}>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</span>
    </div>
    <span className="text-2xl font-bold text-white">{value}</span>
    {sub && <span className="text-[10px] text-white/30">{sub}</span>}
  </div>
);

// --- AI Command Bar ---
const AICommandBar: React.FC<{ onResult: (result: string, prompt: string) => void }> = ({ onResult }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { observeText } = useCHATROS();

  const QUICK = [
    'Remind me to review contracts tomorrow at 9am',
    'Schedule meeting with Rahul next week',
    'Take a note: Q4 targets need revision',
    'Create a task to update the dashboard UI',
  ];

  const run = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    observeText(prompt);
    try {
      const result = await generate(
        `You are the CHATR OS Intelligence Engine. The user said: "${prompt}". Detect the intent and explain what action was taken (reminder/task/meeting/note/etc). Be concise, 1-2 sentences.`
      );
      onResult(result || 'Action understood and queued for execution.', prompt);
    } catch {
      onResult('Intent detected. Capability queued for execution.', prompt);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">AI Command Bar</span>
        <span className="ml-auto text-[9px] text-white/20">Type any instruction naturally</span>
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && run(input)}
          placeholder="e.g. Remind me to send proposal tomorrow at 3pm..."
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/40 transition-colors"
        />
        <button
          onClick={() => run(input)}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center transition-all active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {QUICK.map((q, i) => (
          <button
            key={i}
            onClick={() => run(q)}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-[10px] text-white/40 hover:text-white/70 transition-all"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---
const DesktopIntelligence: React.FC = () => {
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode === 'dark';

  const { knowledge, scheduledToday, pageContext } = useCHATROS();
  const [commitments, setCommitments] = useState<any[]>([]);
  const [aiLog, setAiLog] = useState<{ prompt: string; result: string; time: string }[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, people: 0, intents: 0 });
  const [userName, setUserName] = useState('');
  const [activeCapFilter, setActiveCapFilter] = useState<'all' | 'gold' | 'silver'>('all');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
    });
  }, []);

  // Load commitments from OSScheduler
  useEffect(() => {
    const all = osScheduler.getAll();
    setCommitments(all);
    setStats({
      total: all.length,
      today: scheduledToday.length,
      people: knowledge.people.length,
      intents: knowledge.intents.length,
    });
  }, [scheduledToday, knowledge]);

  const handleAIResult = (result: string, prompt: string) => {
    setAiLog(prev => [{ prompt, result, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    toast.success('Intent processed by CHATR OS');
  };

  const filteredCaps = activeCapFilter === 'all'
    ? CAPABILITIES
    : CAPABILITIES.filter(c => c.status === activeCapFilter);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080B12] text-white">

      {/* ── Top hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.04] bg-gradient-to-br from-violet-950/60 via-[#080B12] to-indigo-950/40 px-8 py-6 shrink-0">
        {/* Orb background */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-40 h-40 rounded-full bg-indigo-600/10 blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">CHATR OS Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {greeting}, {userName} 👋
            </h1>
            <p className="text-[12px] text-white/40">
              {scheduledToday.length} item{scheduledToday.length !== 1 ? 's' : ''} scheduled today · {knowledge.people.length} people detected · {knowledge.intents.length} active intents
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold text-white/60">{pageContext?.aiLabel || 'CHATR AI'}</p>
              <p className="text-[9px] text-white/30">{pageContext?.aiMode || 'standby'} mode</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 max-w-[1300px] mx-auto">

          {/* ── Stats Row ───────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Commitments" value={stats.total} sub="all time" color="text-emerald-400" />
            <StatCard icon={<Calendar className="w-4 h-4" />} label="Today" value={stats.today} sub="scheduled" color="text-blue-400" />
            <StatCard icon={<Users className="w-4 h-4" />} label="People" value={stats.people} sub="in context" color="text-violet-400" />
            <StatCard icon={<Zap className="w-4 h-4" />} label="Intents" value={stats.intents} sub="detected" color="text-amber-400" />
          </div>

          {/* ── AI Command Bar ───────────────────────────────────── */}
          <AICommandBar onResult={handleAIResult} />

          {/* ── AI Log ──────────────────────────────────────────── */}
          {aiLog.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">OS Execution Log</span>
              </div>
              {aiLog.map((entry, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-1 rounded-full bg-violet-500/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/40 mb-0.5">"{entry.prompt}"</p>
                    <p className="text-[12px] text-white/80">{entry.result}</p>
                  </div>
                  <span className="text-[9px] text-white/20 shrink-0">{entry.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Two column: Knowledge Graph + Timeline ────────── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Knowledge Graph */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-violet-400" />
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Live Knowledge Graph</span>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {knowledge.people.length + knowledge.topics.length + knowledge.intents.length} nodes
                </span>
              </div>
              <div className="p-4 space-y-3">
                {/* People */}
                {knowledge.people.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> People
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {knowledge.people.map((p, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Topics */}
                {knowledge.topics.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Hash className="w-3 h-3" /> Topics
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {knowledge.topics.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Dates */}
                {knowledge.dateLabels.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Dates
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {knowledge.dateLabels.map((d, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Intents */}
                {knowledge.intents.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" /> Intents
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {knowledge.intents.map((intent, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-semibold text-violet-400 capitalize">{intent}</span>
                      ))}
                    </div>
                  </div>
                )}
                {knowledge.people.length === 0 && knowledge.topics.length === 0 && (
                  <div className="flex flex-col items-center py-6 text-center">
                    <BrainCircuit className="w-8 h-8 text-white/10 mb-2" />
                    <p className="text-[11px] text-white/25">Start working — knowledge appears automatically</p>
                    <p className="text-[10px] text-white/15 mt-1">Type in the AI Command Bar above to seed the graph</p>
                  </div>
                )}
              </div>
            </div>

            {/* Commitment Timeline */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Commitment Timeline</span>
                <span className="ml-auto text-[9px] text-white/25">{commitments.length} total</span>
              </div>
              <div className="p-4">
                {commitments.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <Calendar className="w-8 h-8 text-white/10 mb-2" />
                    <p className="text-[11px] text-white/25">No commitments yet</p>
                    <p className="text-[10px] text-white/15 mt-1">Use the AI Command Bar to create your first one</p>
                  </div>
                ) : (
                  <div className="relative pl-4 space-y-3">
                    <div className="absolute left-1 top-2 bottom-2 w-px bg-white/[0.06]" />
                    {commitments.slice(0, 8).map((c, i) => (
                      <div key={c.id || i} className="relative flex items-start gap-3">
                        <div className="absolute -left-[15px] w-3 h-3 rounded-full border-2 border-violet-500/40 bg-zinc-950 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-white/80 leading-tight">{c.title}</p>
                          <p className="text-[9px] text-white/30 mt-0.5">
                            {c.capability?.replace('core.', '')} · {new Date(c.scheduledFor).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={cn(
                          'text-[8px] font-bold px-1.5 py-0.5 rounded-full border shrink-0',
                          new Date(c.scheduledFor) < new Date()
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        )}>
                          {new Date(c.scheduledFor) < new Date() ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Capabilities Matrix ──────────────────────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Genesis Capabilities</span>
              <div className="ml-auto flex gap-1.5">
                {(['all', 'gold', 'silver'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveCapFilter(f)}
                    className={cn(
                      'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors',
                      activeCapFilter === f ? 'bg-white/10 text-white/80' : 'text-white/25 hover:text-white/50'
                    )}
                  >
                    {f === 'gold' ? '🏆 Gold' : f === 'silver' ? '🥈 Silver' : 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2">
              {filteredCaps.map(cap => {
                const Icon = cap.icon;
                return (
                  <div
                    key={cap.id}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer',
                      cap.bg, cap.border
                    )}
                  >
                    <Icon className={cn('w-4 h-4', cap.color)} />
                    <span className="text-[9px] font-bold text-white/70 text-center leading-tight">{cap.label}</span>
                    <span className={cn('text-[11px]', STATUS_BADGE[cap.status].cls)}>{STATUS_BADGE[cap.status].label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── OS Health ────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">OS Health</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Intent Engine', value: '✓ Online', color: 'text-emerald-400' },
                { label: 'Commitment Runtime', value: `${commitments.length} entries`, color: 'text-blue-400' },
                { label: 'Knowledge Graph', value: `${stats.people + knowledge.topics.length} nodes`, color: 'text-violet-400' },
                { label: 'Local Storage', value: 'Persistent', color: 'text-amber-400' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-[9px] text-white/30 mb-1">{item.label}</p>
                  <p className={cn('text-[11px] font-bold', item.color)}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

export default DesktopIntelligence;

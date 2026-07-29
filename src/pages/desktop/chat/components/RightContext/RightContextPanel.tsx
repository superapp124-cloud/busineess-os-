import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle, Clock, ArrowRight, Zap, Brain, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { cn } from '@/lib/utils';

const RUNNING = [
  { label: 'Sales Automation',    route: '/desktop/studio',           color: 'text-emerald-500', bg: 'border-emerald-500/25', iconBg: 'bg-emerald-500/12' },
  { label: 'Invoice Processor',   route: '/desktop/pro/business/crm', color: 'text-emerald-500', bg: 'border-emerald-500/25', iconBg: 'bg-emerald-500/12' },
  { label: 'Candidate Screening', route: '/desktop/recruitment',      color: 'text-emerald-500', bg: 'border-emerald-500/25', iconBg: 'bg-emerald-500/12' },
];

const WAITING = [
  { label: 'Approval Required',     route: '/desktop/tickets',     icon: Clock, color: 'text-amber-500',  bg: 'border-amber-500/25',  iconBg: 'bg-amber-500/12' },
  { label: 'Meeting in 18 min',     route: '/desktop/calls',       icon: Bell,  color: 'text-blue-500',   bg: 'border-blue-500/25',   iconBg: 'bg-blue-500/12' },
  { label: '2 messages need reply', route: '/desktop/smart-inbox', icon: Clock, color: 'text-violet-500', bg: 'border-violet-500/25', iconBg: 'bg-violet-500/12' },
];

export const RightContextPanel: React.FC = () => {
  const navigate = useNavigate();
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleRunningClick = (item: typeof RUNNING[0]) => {
    toast.info(`Opening ${item.label} execution log...`);
    navigate(item.route);
  };

  const handleWaitingClick = (item: typeof WAITING[0]) => {
    toast.info(`Opening ${item.label}...`);
    navigate(item.route);
  };

  const handleSuggestedClick = () => {
    toast.success('Opening CHATR AI to compose proposal email to John...');
    window.dispatchEvent(new CustomEvent('open-chatr-ai'));
  };

  return (
    <div
      className="w-[300px] lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col h-full overflow-hidden relative border-l transition-colors duration-300"
      style={{
        background: isDark ? 'hsl(240, 13%, 8%)' : 'hsl(0, 0%, 100%)',
        borderColor: isDark ? 'hsl(240, 8%, 16%)' : 'hsl(220, 13%, 90%)',
      }}
    >
      {/* Ambient glow — dark only */}
      {isDark && (
        <>
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/8 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/6 blur-[60px] rounded-full pointer-events-none" />
        </>
      )}

      {/* Panel header */}
      <div
        className="relative z-10 px-4 py-3.5 flex items-center justify-between border-b"
        style={{ borderColor: isDark ? 'hsl(240, 8%, 16%)' : 'hsl(220, 13%, 90%)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md overflow-hidden border border-violet-500/30 shadow-sm shrink-0">
            <img src="/chatr-ai-logo.jpg" alt="chatrAI" className="w-full h-full object-cover" />
          </div>
          <span className={cn('text-[11px] font-black uppercase tracking-[0.16em]', isDark ? 'text-white/70' : 'text-zinc-500')}>
            AI Context
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-semibold">Active</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-6">

        {/* ── Running ─────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Zap className={cn('w-3.5 h-3.5', isDark ? 'text-white/25' : 'text-zinc-300')} />
            <h3 className={cn('text-[10px] font-black uppercase tracking-[0.20em]', isDark ? 'text-white/35' : 'text-zinc-400')}>
              Running
            </h3>
          </div>
          <ul className="space-y-1.5">
            {RUNNING.map((item) => (
              <li
                key={item.label}
                onClick={() => handleRunningClick(item)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]',
                  item.bg,
                  isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-zinc-50/80'
                )}
                style={{ background: isDark ? 'hsl(240, 11%, 12%)' : 'hsl(145, 60%, 97%)' }}
              >
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', item.iconBg)}>
                  <CheckCircle className={cn('w-4 h-4', item.color)} />
                </div>
                <span className={cn('text-[13px] font-semibold truncate', isDark ? 'text-white/85' : 'text-zinc-800')}>
                  {item.label}
                </span>
                <span className="ml-auto flex gap-0.5 shrink-0">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-emerald-400/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-px" style={{ background: isDark ? 'hsl(240, 8%, 18%)' : 'hsl(220, 13%, 91%)' }} />

        {/* ── Waiting ─────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Clock className={cn('w-3.5 h-3.5', isDark ? 'text-white/25' : 'text-zinc-300')} />
            <h3 className={cn('text-[10px] font-black uppercase tracking-[0.20em]', isDark ? 'text-white/35' : 'text-zinc-400')}>
              Waiting
            </h3>
          </div>
          <ul className="space-y-1.5">
            {WAITING.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  onClick={() => handleWaitingClick(item)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]',
                    item.bg,
                    isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-zinc-50/80'
                  )}
                  style={{ background: isDark ? 'hsl(240, 11%, 12%)' : 'hsl(0, 0%, 98%)' }}
                >
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', item.iconBg)}>
                    <Icon className={cn('w-4 h-4', item.color)} />
                  </div>
                  <span className={cn('text-[13px] font-semibold truncate', isDark ? 'text-white/85' : 'text-zinc-800')}>
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="h-px" style={{ background: isDark ? 'hsl(240, 8%, 18%)' : 'hsl(220, 13%, 91%)' }} />

        {/* ── Memory ──────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Brain className={cn('w-3.5 h-3.5', isDark ? 'text-white/25' : 'text-zinc-300')} />
            <h3 className={cn('text-[10px] font-black uppercase tracking-[0.20em]', isDark ? 'text-white/35' : 'text-zinc-400')}>
              Memory
            </h3>
          </div>
          <div
            className="relative p-4 rounded-2xl border"
            style={{
              background: isDark ? 'hsl(240, 11%, 12%)' : 'hsl(0, 0%, 98%)',
              borderColor: isDark ? 'hsl(240, 8%, 20%)' : 'hsl(220, 13%, 90%)'
            }}
          >
            <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full" />
            <p className={cn('text-[13px] leading-relaxed pl-2', isDark ? 'text-white/75' : 'text-zinc-700')}>
              Yesterday you promised{' '}
              <span className="text-violet-500 font-semibold">John</span> the proposal.
            </p>
          </div>
        </div>

        <div className="h-px" style={{ background: isDark ? 'hsl(240, 8%, 18%)' : 'hsl(220, 13%, 91%)' }} />

        {/* ── Suggested Action ────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className={cn('w-3.5 h-3.5', isDark ? 'text-white/25' : 'text-zinc-300')} />
            <h3 className={cn('text-[10px] font-black uppercase tracking-[0.20em]', isDark ? 'text-white/35' : 'text-zinc-400')}>
              Suggested
            </h3>
          </div>
          <button
            onClick={handleSuggestedClick}
            className="w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all flex items-center justify-between group shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span className="font-bold text-[13px]">Send proposal now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

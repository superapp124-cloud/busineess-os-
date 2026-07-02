import React from 'react';
import { MessageSquare, Phone, Video, Users, Sparkles, Calendar, Plus, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  hoverColor: string;
  path: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: MessageSquare, label: 'New Chat',     color: 'text-emerald-400', hoverColor: 'hover:bg-emerald-500/10', path: '/contacts' },
  { icon: Phone,         label: 'Call',          color: 'text-blue-400',    hoverColor: 'hover:bg-blue-500/10',    path: '/contacts' },
  { icon: Video,         label: 'Video Meeting', color: 'text-violet-400',  hoverColor: 'hover:bg-violet-500/10', path: '/contacts' },
  { icon: Users,         label: 'New Group',     color: 'text-amber-400',   hoverColor: 'hover:bg-amber-500/10',  path: '/contacts' },
  { icon: Sparkles,      label: 'Ask AI',        color: 'text-pink-400',    hoverColor: 'hover:bg-pink-500/10',   path: '/ai-agents/chat/new' },
  { icon: Calendar,      label: 'Schedule',      color: 'text-cyan-400',    hoverColor: 'hover:bg-cyan-500/10',   path: '/desktop/calendar' },
  { icon: Hash,          label: 'New Ticket',    color: 'text-orange-400',  hoverColor: 'hover:bg-orange-500/10', path: '/desktop/smart-inbox' },
];

interface QuickActionsBarProps {
  isDark: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ isDark }) => {
  const navigate = useNavigate();

  return (
    <div className={cn(
      'h-11 flex items-center gap-1 px-4 border-b shrink-0',
      isDark ? 'border-white/5 bg-black/15 backdrop-blur-xl' : 'border-zinc-200/70 bg-white/50 backdrop-blur-xl'
    )}>
      {/* Label */}
      <span className={cn('text-[10px] font-semibold uppercase tracking-widest mr-2 shrink-0', isDark ? 'text-white/25' : 'text-zinc-400')}>
        Quick Actions
      </span>
      <div className={cn('w-px h-4 mr-2', isDark ? 'bg-white/10' : 'bg-zinc-200')} />

      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
              action.hoverColor,
              isDark ? 'text-white/50 hover:text-white/90' : 'text-zinc-500 hover:text-zinc-800',
            )}
            title={action.label}
          >
            <Icon className={cn('w-3.5 h-3.5', action.color)} />
            <span className="hidden lg:block">{action.label}</span>
          </button>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Add custom action */}
      <button className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors',
        isDark ? 'text-white/25 hover:text-white/50 hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
      )}>
        <Plus className="w-3 h-3" />
        <span className="hidden xl:block">Customize</span>
      </button>
    </div>
  );
};

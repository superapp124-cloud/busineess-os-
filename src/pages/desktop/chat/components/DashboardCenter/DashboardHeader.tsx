import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { cn } from '@/lib/utils';

export const DashboardHeader: React.FC<{
  onCreateNew?: () => void;
}> = ({ onCreateNew }) => {
  const [userName, setUserName] = useState('there');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, primary_handle')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        } else if (profile?.primary_handle) {
          setUserName(profile.primary_handle);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left: Greeting */}
      <div className="flex items-center gap-4">
        {/* Animated icon */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-violet-500/40 shadow-xl shadow-violet-500/20 shrink-0">
            <img src="/chatr-ai-logo.jpg" alt="chatrAI" className="w-full h-full object-cover" />
          </div>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl bg-violet-500/15 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className={cn('text-3xl font-black tracking-tight capitalize leading-none', isDark ? 'text-white' : 'text-zinc-900')}>
              {greeting()},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-400">
                {userName}
              </span>
              {' '}👋
            </h1>
            {/* Live clock pill */}
            {currentTime && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-mono backdrop-blur-md shadow-sm border',
                  isDark
                    ? 'bg-white/[0.06] border-white/[0.10] text-white/60'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                )}
              >
                <Clock className="w-3.5 h-3.5 text-violet-400" />
                {currentTime}
              </span>
            )}
          </div>
          {currentDate && (
            <p className={cn('text-sm mt-1.5 font-medium', isDark ? 'text-white/40' : 'text-zinc-400')}>
              {currentDate} — Here's what's happening in your workspace.
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 mt-1">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
            isDark
              ? 'bg-white/[0.05] hover:bg-white/[0.09] text-white/60 hover:text-white border-white/[0.08] hover:border-white/[0.14]'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border-zinc-200 hover:border-zinc-300'
          )}
        >
          Customize
        </button>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>
    </div>
  );
};

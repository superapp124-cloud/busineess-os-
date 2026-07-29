import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useCHATROS } from '@/core/os/hooks';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { cn } from '@/lib/utils';

export const UniversalCommandBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const chatrOS = useCHATROS();
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="w-full">
      <div
        className={cn(
          'border rounded-2xl p-3.5 flex items-center gap-3.5 transition-all group cursor-text',
          isDark
            ? 'bg-white/[0.04] border-white/[0.07] hover:border-violet-500/40 shadow-lg'
            : 'bg-white border-zinc-200 hover:border-violet-300 shadow-sm hover:shadow-md'
        )}
        onClick={() => document.getElementById('universal-search-input')?.focus()}
      >
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
          isDark ? 'bg-violet-600/20' : 'bg-violet-50'
        )}>
          <Sparkles className="w-4.5 h-4.5 text-violet-500" />
        </div>

        <input
          id="universal-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              chatrOS.submitIntent(query.trim());
              setQuery('');
            }
          }}
          placeholder='Search anything... try "book hotel in Srinagar" or "create payroll"'
          className={cn(
            'flex-1 bg-transparent border-none outline-none text-[13px] font-medium placeholder-opacity-50',
            isDark ? 'text-white/80 placeholder:text-white/30' : 'text-zinc-700 placeholder:text-zinc-400'
          )}
        />

        <div className="flex items-center gap-1.5 pr-1 shrink-0">
          <kbd className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-lg border font-mono',
            isDark ? 'text-white/30 bg-white/5 border-white/5' : 'text-zinc-400 bg-zinc-100 border-zinc-200'
          )}>
            ⌘ K
          </kbd>
        </div>
      </div>
    </div>
  );
};

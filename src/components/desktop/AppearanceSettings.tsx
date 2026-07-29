import React, { useEffect } from 'react';
import { Sliders, CheckCircle2, Sun, Moon, MonitorSmartphone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export const AppearanceSettings: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const {
    themeMode, setThemeMode,
    accentColor, setAccentColor,
    fontScale, setFontScale,
    fontFamily, setFontFamily,
    applyToDOM
  } = useAppearanceStore();

  useEffect(() => { applyToDOM(); }, [applyToDOM]);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const ACCENT_OPTIONS = [
    { id: 'purple',  hex: '#8b5cf6', label: 'Violet'  },
    { id: 'blue',    hex: '#3b82f6', label: 'Blue'    },
    { id: 'emerald', hex: '#10b981', label: 'Emerald' },
    { id: 'rose',    hex: '#f43f5e', label: 'Rose'    },
    { id: 'amber',   hex: '#f59e0b', label: 'Amber'   },
  ];

  const THEMES = [
    { id: 'light',  label: 'Light',  icon: Sun,               bg: 'bg-gradient-to-br from-white to-slate-100', border: 'border-slate-200', iconColor: 'text-slate-600' },
    { id: 'dark',   label: 'Dark',   icon: Moon,              bg: 'bg-gradient-to-br from-zinc-900 to-zinc-950', border: 'border-zinc-700', iconColor: 'text-zinc-300' },
    { id: 'system', label: 'System', icon: MonitorSmartphone, bg: 'bg-gradient-to-br from-slate-200 via-slate-400 to-zinc-800', border: 'border-slate-500', iconColor: 'text-white' },
  ];

  const panelBg = isDark ? 'bg-[#141418] border-white/[0.08]' : 'bg-white border-zinc-200/80';
  const labelColor = isDark ? 'text-white/40' : 'text-zinc-400';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const subText = isDark ? 'text-white/50' : 'text-zinc-500';
  const divider = isDark ? 'border-white/[0.07]' : 'border-zinc-100';
  const itemHover = isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-zinc-50';
  const itemActive = isDark ? 'bg-white/[0.08] border-white/[0.12]' : 'bg-violet-50 border-violet-200/60';
  const segBg = isDark ? 'bg-white/[0.05]' : 'bg-zinc-100';
  const segActive = isDark ? 'bg-white/[0.14] text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm border border-zinc-200';
  const segInactive = isDark ? 'text-white/40 hover:text-white/60' : 'text-zinc-400 hover:text-zinc-600';

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <button
            className={cn(
              'relative transition-all duration-200 p-2 rounded-xl cursor-pointer',
              isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.08]' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
            )}
            title="Appearance"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}
      </PopoverTrigger>

      {/* ── Panel ── */}
      <PopoverContent
        align="end"
        className={cn(
          'w-[340px] p-0 rounded-3xl border shadow-2xl overflow-hidden -mt-1 mr-2 z-50 outline-none',
          panelBg
        )}
      >
        <ScrollArea className="max-h-[520px]">
          <div className="p-5 space-y-6">

            {/* Header */}
            <div>
              <h2 className={cn('text-[15px] font-black tracking-tight mb-0.5', textColor)}>Appearance</h2>
              <p className={cn('text-[11px]', subText)}>Customize your workspace</p>
            </div>

            {/* ── Theme ── */}
            <div className="space-y-3">
              <h3 className={cn('text-[10px] font-bold uppercase tracking-[0.12em]', labelColor)}>Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setThemeMode(theme.id as any);
                      toast.success(`${theme.label} theme applied`);
                    }}
                    className="flex flex-col items-center gap-1.5 group outline-none cursor-pointer"
                  >
                    <div className={cn(
                      'w-full aspect-[3/2] rounded-2xl border-2 flex items-center justify-center transition-all duration-200',
                      theme.bg,
                      themeMode === theme.id
                        ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.04]'
                        : `${theme.border} opacity-70 group-hover:opacity-100 group-hover:scale-[1.02]`
                    )}>
                      <theme.icon className={cn('w-5 h-5', theme.iconColor)} />
                    </div>
                    <span className={cn(
                      'text-[11px] font-semibold transition-colors',
                      themeMode === theme.id ? (isDark ? 'text-white' : 'text-zinc-900') : subText
                    )}>
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={cn('border-t', divider)} />

            {/* ── Accent Color ── */}
            <div className="space-y-3">
              <h3 className={cn('text-[10px] font-bold uppercase tracking-[0.12em]', labelColor)}>Accent Color</h3>
              <div className="flex items-center gap-2.5">
                {ACCENT_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setAccentColor(c.id as any);
                      toast.success(`${c.label} accent applied`);
                    }}
                    title={c.label}
                    className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 outline-none cursor-pointer"
                    style={{ backgroundColor: c.hex }}
                  >
                    {accentColor === c.id && (
                      <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />
                    )}
                    {accentColor === c.id && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-transparent" style={{ boxShadow: `0 0 0 2px white, 0 0 0 4px ${c.hex}` }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={cn('border-t', divider)} />

            {/* ── Layout Density ── */}
            <div className="space-y-3">
              <h3 className={cn('text-[10px] font-bold uppercase tracking-[0.12em]', labelColor)}>Layout Density</h3>
              <div className={cn('p-1 rounded-2xl flex gap-1', segBg)}>
                {[
                  { id: 'compact',  label: 'Compact'  },
                  { id: 'standard', label: 'Standard' },
                  { id: 'large',    label: 'Spacious' },
                ].map(scale => (
                  <button
                    key={scale.id}
                    onClick={() => {
                      setFontScale(scale.id as any);
                      toast.success(`${scale.label} density applied`);
                    }}
                    className={cn(
                      'flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 outline-none cursor-pointer',
                      fontScale === scale.id ? segActive : segInactive
                    )}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={cn('border-t', divider)} />

            {/* ── Typography ── */}
            <div className="space-y-2.5">
              <h3 className={cn('text-[10px] font-bold uppercase tracking-[0.12em]', labelColor)}>Typography</h3>
              <div className="space-y-1.5">
                {[
                  { id: 'inter', label: 'System',     desc: 'San Francisco · Inter' },
                  { id: 'sans',  label: 'Rounded',    desc: 'Friendly & modern'     },
                  { id: 'serif', label: 'Serif',      desc: 'Elegant & editorial'   },
                  { id: 'mono',  label: 'Monospace',  desc: 'Crisp & technical'     },
                ].map(font => (
                  <button
                    key={font.id}
                    onClick={() => {
                      setFontFamily(font.id as any);
                      toast.success(`${font.label} typography applied`);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all duration-200 text-left outline-none cursor-pointer',
                      fontFamily === font.id
                        ? itemActive
                        : cn('border-transparent', itemHover)
                    )}
                  >
                    <div>
                      <div className={cn('text-[12px] font-semibold', fontFamily === font.id ? (isDark ? 'text-white' : 'text-zinc-900') : (isDark ? 'text-white/70' : 'text-zinc-600'))}>
                        {font.label}
                      </div>
                      <div className={cn('text-[10px] mt-0.5', subText)}>{font.desc}</div>
                    </div>
                    <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0', fontFamily === font.id ? 'border-violet-500' : (isDark ? 'border-white/20' : 'border-zinc-300'))}>
                      {fontFamily === font.id && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

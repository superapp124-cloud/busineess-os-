import React from 'react';
import { Settings2, CheckCircle2, ChevronRight, Monitor, Moon, Sun, MonitorSmartphone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AppearanceSettings: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { 
    themeMode, setThemeMode, 
    accentColor, setAccentColor,
    fontScale, setFontScale,
    fontFamily, setFontFamily 
  } = useAppearanceStore();

  const colors = [
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'emerald', class: 'bg-emerald-500' },
    { id: 'rose', class: 'bg-rose-500' },
    { id: 'amber', class: 'bg-amber-500' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <button className={cn("relative transition-colors", themeMode === 'dark' ? "text-white/60 hover:text-white/90" : "text-zinc-500 hover:text-zinc-900")}>
            <Settings2 className="w-5 h-5" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 rounded-[24px] bg-[#1C1C1E]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden -mt-1 mr-2 z-50">
        <ScrollArea className="h-[480px]">
          <div className="p-6 space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-1">Appearance</h2>
              <p className="text-sm text-white/50">Customize your workspace</p>
            </div>

            {/* Themes */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: Sun, preview: 'bg-white border-zinc-200' },
                  { id: 'dark', label: 'Dark', icon: Moon, preview: 'bg-[#000000] border-[#333333]' },
                  { id: 'system', label: 'System', icon: MonitorSmartphone, preview: 'bg-gradient-to-br from-zinc-200 to-zinc-900 border-zinc-500' },
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setThemeMode(theme.id as any)}
                    className="flex flex-col gap-2 group outline-none"
                  >
                    <div className={cn(
                      "w-full aspect-[4/3] rounded-xl border-2 flex items-center justify-center transition-all duration-200",
                      theme.preview,
                      themeMode === theme.id ? "border-purple-500 shadow-md scale-105" : "border-white/10 group-hover:border-white/20"
                    )}>
                      <theme.icon className={cn("w-6 h-6", theme.id === 'light' ? 'text-zinc-400' : 'text-zinc-500')} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center transition-colors",
                      themeMode === theme.id ? "text-white" : "text-white/50 group-hover:text-white/70"
                    )}>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Accent Color</h3>
              <div className="flex gap-3">
                {colors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id as any)}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center border-2 shadow-sm outline-none",
                      color.class,
                      accentColor === color.id ? "border-white scale-110" : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
                    )}
                  >
                    {accentColor === color.id && <CheckCircle2 className="w-5 h-5 text-white shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Scale */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Layout Density</h3>
              <div className="bg-white/5 p-1 rounded-xl flex">
                {[
                  { id: 'compact', label: 'Compact' },
                  { id: 'standard', label: 'Standard' },
                  { id: 'large', label: 'Spacious' },
                ].map(scale => (
                  <button
                    key={scale.id}
                    onClick={() => setFontScale(scale.id as any)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 outline-none",
                      fontScale === scale.id ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white/70 hover:bg-white/5"
                    )}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Typography</h3>
              <div className="space-y-2">
                {[
                  { id: 'inter', label: 'System Sans', desc: 'San Francisco, Inter' },
                  { id: 'sans', label: 'Rounded', desc: 'Friendly & modern' },
                  { id: 'serif', label: 'Serif', desc: 'Elegant & traditional' },
                  { id: 'mono', label: 'Monospace', desc: 'Crisp & technical' },
                ].map(font => (
                  <button
                    key={font.id}
                    onClick={() => setFontFamily(font.id as any)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left outline-none",
                      fontFamily === font.id ? "bg-white/10 border-white/20" : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                    )}
                  >
                    <div>
                      <h4 className={cn("text-sm font-medium", fontFamily === font.id ? "text-white" : "text-white/80")}>{font.label}</h4>
                      <p className="text-xs text-white/50">{font.desc}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      fontFamily === font.id ? "border-purple-500" : "border-white/20"
                    )}>
                      {fontFamily === font.id && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
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

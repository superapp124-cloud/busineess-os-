import React, { useState, useEffect } from 'react';
import {
  Bell, BellOff, Utensils, Droplets, Footprints,
  Moon, Zap, Check, ChevronRight, Info
} from 'lucide-react';
import { WellnessCoachService, WellnessCoachPrefs, DEFAULT_PREFS } from '@/services/health/wellness/WellnessCoachService';
import { cn } from '@/lib/utils';

interface WellnessCoachCardProps {
  /** If true, renders as a compact banner instead of the full card */
  compact?: boolean;
}

interface Category {
  key: keyof Omit<WellnessCoachPrefs, 'enabled'>;
  label: string;
  emoji: string;
  description: string;
  count: string;
  color: string;
  activeBg: string;
  activeBorder: string;
}

const CATEGORIES: Category[] = [
  {
    key: 'meals',
    label: 'Meals',
    emoji: '🍽️',
    description: 'Breakfast, lunch, snack & dinner reminders',
    count: '4x / day',
    color: 'text-amber-400',
    activeBg: 'bg-amber-500/20',
    activeBorder: 'border-amber-500/40',
  },
  {
    key: 'hydration',
    label: 'Hydration',
    emoji: '💧',
    description: 'Water nudges every 2 hrs (7 AM – 8 PM)',
    count: '7x / day',
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-500/20',
    activeBorder: 'border-cyan-500/40',
  },
  {
    key: 'walk',
    label: 'Walk',
    emoji: '🚶',
    description: 'Morning, post-lunch & evening walk prompts',
    count: '3x / day',
    color: 'text-emerald-400',
    activeBg: 'bg-emerald-500/20',
    activeBorder: 'border-emerald-500/40',
  },
  {
    key: 'sleep',
    label: 'Sleep',
    emoji: '😴',
    description: 'Gradual wind-down cues (9:30 – 10:30 PM)',
    count: '3x / night',
    color: 'text-indigo-400',
    activeBg: 'bg-indigo-500/20',
    activeBorder: 'border-indigo-500/40',
  },
];

export const WellnessCoachCard: React.FC<WellnessCoachCardProps> = ({ compact = false }) => {
  const [prefs, setPrefs] = useState<WellnessCoachPrefs>(() => WellnessCoachService.loadPrefs());
  const [isSaving, setIsSaving] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const apply = async (updated: WellnessCoachPrefs) => {
    setIsSaving(true);
    WellnessCoachService.savePrefs(updated);
    await WellnessCoachService.scheduleAll(updated);
    setPrefs(updated);
    setIsSaving(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const toggleEnabled = () => apply({ ...prefs, enabled: !prefs.enabled });

  const toggleCategory = (key: keyof Omit<WellnessCoachPrefs, 'enabled'>) => {
    apply({ ...prefs, [key]: !prefs[key] });
  };

  const activeCount = WellnessCoachService.getCategoryCount(prefs);

  // Compact banner variant
  if (compact) {
    return (
      <div
        className="flex items-center justify-between p-3.5 rounded-2xl cursor-pointer active:scale-[0.99] transition-all"
        style={{
          background: prefs.enabled
            ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.05) 100%)'
            : 'rgba(255,255,255,0.02)',
          border: `1px solid ${prefs.enabled ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
        }}
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl',
            prefs.enabled ? 'bg-emerald-500/20' : 'bg-white/[0.06]'
          )}>
            {prefs.enabled ? <Bell className="w-4 h-4 text-emerald-400" /> : <BellOff className="w-4 h-4 text-slate-400" />}
          </div>
          <div>
            <span className="text-[14px] font-extrabold text-white block leading-none">
              Wellness Coach
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {prefs.enabled ? `${activeCount} habits active` : 'Reminders paused'}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  return (
    <div
      className="rounded-[28px] overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
      }}
    >
      {/* ── Header ── */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl transition-all',
              prefs.enabled
                ? 'bg-gradient-to-br from-emerald-500/25 to-cyan-500/15 border border-emerald-500/30'
                : 'bg-white/[0.06] border border-white/10'
            )}>
              {prefs.enabled ? (
                <Bell className="w-5 h-5 text-emerald-400" />
              ) : (
                <BellOff className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-white leading-none">Wellness Coach</h3>
              <p className="text-[12px] text-slate-400 mt-0.5">Daily lifestyle habit reminders</p>
            </div>
          </div>

          {/* Master toggle */}
          <button
            type="button"
            onClick={toggleEnabled}
            disabled={isSaving}
            className={cn(
              'relative h-7 w-12 rounded-full transition-all active:scale-95 flex items-center px-0.5',
              prefs.enabled
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-white/[0.12]'
            )}
          >
            <div className={cn(
              'h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200',
              prefs.enabled ? 'translate-x-5' : 'translate-x-0'
            )} />
          </button>
        </div>

        {/* Status Banner */}
        <div className="p-3 rounded-2xl bg-black/30 border border-white/[0.07] flex items-start gap-2.5">
          <Zap className={cn('w-4 h-4 shrink-0 mt-0.5', prefs.enabled ? 'text-amber-400' : 'text-slate-500')} />
          <p className="text-[12.5px] leading-relaxed text-slate-300">
            {prefs.enabled
              ? <><span className="font-bold text-white">{WellnessCoachService.getSummary(prefs)}</span> — scheduled and active on your device.</>
              : 'All lifestyle reminders are paused. Enable to start building healthy daily habits.'}
          </p>
        </div>
      </div>

      {/* ── Toast ── */}
      {savedToast && (
        <div className="mx-5 mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 text-[12px] font-bold text-emerald-300 animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>Notifications rescheduled on your device!</span>
        </div>
      )}

      {/* ── Category Toggles ── */}
      {prefs.enabled && (
        <div className="px-5 pb-5 space-y-2.5">
          <p className="text-[11.5px] font-extrabold text-slate-400 uppercase tracking-widest px-0.5">
            Customize Reminders
          </p>
          {CATEGORIES.map(cat => {
            const isOn = prefs[cat.key] as boolean;
            return (
              <div
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className={cn(
                  'p-3.5 rounded-[22px] flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] border',
                  isOn ? `${cat.activeBg} ${cat.activeBorder}` : 'bg-white/[0.02] border-white/[0.06]'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[22px] shrink-0">{cat.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[14px] font-extrabold', isOn ? cat.color : 'text-slate-400')}>
                        {cat.label}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-black border',
                        isOn
                          ? `${cat.activeBg} ${cat.color} ${cat.activeBorder}`
                          : 'bg-white/[0.04] text-slate-500 border-white/[0.06]'
                      )}>
                        {cat.count}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-400 truncate">{cat.description}</p>
                  </div>
                </div>

                {/* Category toggle pill */}
                <div className={cn(
                  'h-6 w-10 rounded-full shrink-0 flex items-center px-0.5 transition-all',
                  isOn ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-white/[0.10]'
                )}>
                  <div className={cn(
                    'h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200',
                    isOn ? 'translate-x-4' : 'translate-x-0'
                  )} />
                </div>
              </div>
            );
          })}

          {/* Schedule Preview */}
          <div className="mt-1 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Today's Schedule</p>
            <div className="grid grid-cols-2 gap-1.5 text-[12px]">
              {[
                prefs.meals && { time: '8:00 AM', label: '🍽️ Breakfast', color: 'text-amber-300' },
                prefs.hydration && { time: '9:30 AM', label: '💧 Hydration', color: 'text-cyan-300' },
                prefs.walk && { time: '12:45 PM', label: '🚶 Lunch walk', color: 'text-emerald-300' },
                prefs.meals && { time: '1:00 PM', label: '🥗 Lunch', color: 'text-amber-300' },
                prefs.hydration && { time: '2:00 PM', label: '💧 Hydration', color: 'text-cyan-300' },
                prefs.meals && { time: '4:30 PM', label: '🍿 Snack', color: 'text-amber-300' },
                prefs.walk && { time: '6:30 PM', label: '🌆 Evening walk', color: 'text-emerald-300' },
                prefs.meals && { time: '7:30 PM', label: '🌙 Dinner', color: 'text-amber-300' },
                prefs.sleep && { time: '9:30 PM', label: '🌙 Wind down', color: 'text-indigo-300' },
                prefs.sleep && { time: '10:30 PM', label: '💤 Sleep', color: 'text-indigo-300' },
              ].filter(Boolean).slice(0, 8).map((item: any, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-mono text-[11px] shrink-0">{item.time}</span>
                  <span className={cn('font-semibold truncate', item.color)}>{item.label}</span>
                </div>
              ))}
            </div>
            {activeCount < 4 && (
              <p className="text-[11px] text-slate-500 italic">Enable more habits above to see the full schedule.</p>
            )}
          </div>

          {/* Privacy note */}
          <p className="text-[11px] text-slate-500 text-center px-3 leading-relaxed">
            🔒 All reminders run locally on your device — nothing is tracked or sent to any server.
          </p>
        </div>
      )}
    </div>
  );
};

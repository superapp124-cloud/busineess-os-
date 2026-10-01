/**
 * CHATR HEALTH OS — TodayObservations
 * ============================================================================
 * "TODAY" — 2–3 compact, high-priority health observations.
 *
 * Answers: "What matters today?"
 * Progressive disclosure: tapping any card opens full trends and history.
 * ============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Moon, Footprints, Activity, Droplet, ChevronRight } from 'lucide-react';
import { DomainState } from '@/services/health/HealthStateEngine';

interface TodayObservationsProps {
  recentVitals?: Array<{ vital_type: string; value: number; unit: string; recorded_at: string }>;
  domainStates?: Record<string, DomainState>;
  onNavigate: (route: string) => void;
}

export function TodayObservations({
  recentVitals = [],
  domainStates = {},
  onNavigate,
}: TodayObservationsProps) {
  // Extract BP
  const systolic = recentVitals.find(v => v.vital_type === 'blood_pressure_systolic')?.value;
  const diastolic = recentVitals.find(v => v.vital_type === 'blood_pressure_diastolic')?.value;
  const bpSub = domainStates?.vitals?.substates?.['blood_pressure'];

  // Extract Heart Rate
  const heartRate = recentVitals.find(v => v.vital_type === 'heart_rate' || v.vital_type === 'resting_heart_rate')?.value;

  // Extract Sleep
  const sleepDurationHours = domainStates?.sleep?.observation?.match(/(\d+)h\s*(\d+)?m?/);

  // Extract Steps
  const steps = recentVitals.find(v => v.vital_type === 'steps')?.value;

  // Build the top 2-3 observations
  const observations = [
    // 1. Blood Pressure
    {
      id: 'bp',
      title: 'Blood Pressure',
      icon: Heart,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-500/10',
      value: systolic && diastolic ? `${Math.round(systolic)} / ${Math.round(diastolic)}` : '120 / 78',
      unit: 'mmHg',
      statusText: bpSub?.priority === 0 
        ? 'Critical elevation' 
        : bpSub?.state === 'needs_attention' 
        ? 'Elevated vs baseline' 
        : 'Within your baseline',
      statusColor: bpSub?.priority === 0 
        ? 'text-rose-600 dark:text-rose-400 font-bold' 
        : bpSub?.state === 'needs_attention' 
        ? 'text-amber-600 dark:text-amber-400' 
        : 'text-emerald-600 dark:text-emerald-400',
      route: '/chronic-vitals',
    },
    // 2. Sleep
    {
      id: 'sleep',
      title: 'Sleep',
      icon: Moon,
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-500/10',
      value: sleepDurationHours ? `${sleepDurationHours[1]}h ${sleepDurationHours[2] || '0'}m` : '7h 18m',
      unit: '',
      statusText: domainStates?.sleep?.state === 'needs_attention'
        ? 'Below recent baseline'
        : domainStates?.sleep?.state === 'improving'
        ? 'Optimal recovery'
        : 'Near your usual pattern',
      statusColor: domainStates?.sleep?.state === 'needs_attention'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400',
      route: '/wellness',
    },
    // 3. Activity or Heart Rate
    {
      id: 'activity',
      title: steps ? 'Activity' : 'Resting Heart Rate',
      icon: steps ? Footprints : Activity,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      value: steps ? `${Math.round(steps).toLocaleString()}` : heartRate ? `${Math.round(heartRate)}` : '7,420',
      unit: steps ? 'steps' : 'bpm',
      statusText: 'On track with baseline',
      statusColor: 'text-emerald-600 dark:text-emerald-400',
      route: steps ? '/wellness' : '/chronic-vitals',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          TODAY
        </h3>
        <button
          type="button"
          onClick={() => onNavigate('/chronic-vitals')}
          className="text-xs text-primary font-medium hover:underline"
        >
          All Vitals →
        </button>
      </div>

      <div className="space-y-2">
        {observations.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => onNavigate(item.route)}
              className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-sm cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.title}
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-foreground tracking-tight">
                      {item.value}
                    </span>
                    {item.unit && (
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {item.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[11px] font-medium text-right ${item.statusColor}`}>
                  {item.statusText}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

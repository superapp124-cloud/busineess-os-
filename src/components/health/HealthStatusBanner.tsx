/**
 * CHATR HEALTH OS — HealthStatusBanner
 *
 * Shows the computed health state: Stable / Improving / Needs Attention / Not Enough Data
 * Uses calm clinical language — never alarming, never fake.
 *
 * "CHATR HEALTH OS — Your Health State, Explained"
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, TrendingUp, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { HealthStateValue, DataSufficiency } from '@/hooks/useHealthOS';
import type { DomainState } from '@/services/health/HealthStateEngine';

interface HealthStatusBannerProps {
  state: HealthStateValue;
  label: string;
  score: number | null;
  confidence: number;
  domainStates: Record<string, DomainState>;
  dataSufficiency: DataSufficiency;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<HealthStateValue, {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  textColor: string;
}> = {
  stable: {
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-800',
  },
  improving: {
    icon: TrendingUp,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-800',
  },
  needs_attention: {
    icon: AlertCircle,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-800',
  },
  unknown: {
    icon: HelpCircle,
    iconColor: 'text-slate-400',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-600',
  },
};

const DOMAIN_LABELS: Record<string, string> = {
  medications: 'Medications',
  vitals: 'Vitals',
  labs: 'Labs',
  appointments: 'Appointments',
  mental: 'Mental',
  activity: 'Activity',
  sleep: 'Sleep',
};

const DOMAIN_ICONS: Record<string, string> = {
  medications: '💊',
  vitals: '❤️',
  labs: '🧪',
  appointments: '📅',
  mental: '🧠',
  activity: '⚡',
  sleep: '🌙',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function HealthStatusBanner({
  state,
  label,
  score,
  confidence,
  domainStates,
  dataSufficiency,
}: HealthStatusBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  const domainsWithData = Object.entries(domainStates).filter(([, d]) => d.hasData);
  const hasDomainData = domainsWithData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border ${config.bgColor} ${config.borderColor} overflow-hidden`}
    >
      {/* Main row */}
      <button
        className="w-full px-4 py-3.5 flex items-center justify-between"
        onClick={() => hasDomainData && setExpanded(e => !e)}
        disabled={!hasDomainData}
      >
        <div className="flex items-center gap-3">
          {/* Animated status dot */}
          <div className="relative flex-shrink-0">
            {state !== 'unknown' && (
              <span className={`absolute inset-0 rounded-full ${config.dotColor} opacity-30 animate-ping`} />
            )}
            <span className={`relative block w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
          </div>

          {/* State info */}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
              <span className={`text-sm font-semibold ${config.textColor}`}>
                {label}
              </span>
              {score !== null && (
                <span className={`text-sm font-black tabular-nums ${config.textColor} opacity-70`}>
                  {score}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {state === 'unknown'
                ? 'Add health data to get your personal health state'
                : confidence < 0.5
                  ? 'Based on limited available data'
                  : 'Based on your available health data'}
            </p>
          </div>
        </div>

        {hasDomainData && (
          <div className={`${config.iconColor} opacity-60`}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </button>

      {/* Expanded domain breakdown */}
      <AnimatePresence>
        {expanded && hasDomainData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-inherit pt-3">
              {domainsWithData.map(([domain, domainState]) => (
                <DomainRow key={domain} domain={domain} domainState={domainState} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Domain Row ───────────────────────────────────────────────────────────────

function DomainRow({ domain, domainState }: { domain: string; domainState: DomainState }) {
  const stateColors: Record<string, string> = {
    stable: 'text-emerald-600',
    improving: 'text-blue-600',
    needs_attention: 'text-amber-600',
    unknown: 'text-slate-400',
  };

  const stateIndicator: Record<string, string> = {
    stable: '●',
    improving: '↑',
    needs_attention: '⚠',
    unknown: '—',
  };

  const activeSubstates = domainState.substates 
    ? Object.values(domainState.substates).filter(s => s.state !== 'unknown')
    : [];

  return (
    <div className="flex flex-col gap-1 py-1.5 border-b border-inherit/40 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{DOMAIN_ICONS[domain] || '•'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-foreground">
                {DOMAIN_LABELS[domain] || domain}
              </span>
              <span className={`text-xs font-semibold ${stateColors[domainState.state]}`}>
                {stateIndicator[domainState.state]} {domainState.label}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
              {domainState.observation}
            </p>
          </div>
        </div>
      </div>

      {/* Granular sub-vital breakdown when available */}
      {activeSubstates.length > 0 && (
        <div className="ml-6 pl-2 border-l-2 border-inherit/60 space-y-1 mt-1">
          {activeSubstates.map(sub => {
            const isCritical = sub.priority === 0;
            const subColor = isCritical 
              ? 'text-red-600 font-semibold' 
              : sub.state === 'needs_attention' 
                ? 'text-amber-600 font-medium' 
                : 'text-emerald-600';
            const subBadge = isCritical 
              ? '🚨 Critical' 
              : sub.state === 'needs_attention' 
                ? '⚠ Review' 
                : '● Stable';

            return (
              <div key={sub.metric} className="flex items-center justify-between text-[11px] pr-1">
                <span className="text-foreground/80 font-medium">
                  {sub.label}
                  {sub.latestReading && (
                    <span className="ml-1 text-[10px] text-muted-foreground font-normal">
                      ({sub.latestReading})
                    </span>
                  )}
                </span>
                <span className={subColor}>
                  {subBadge}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

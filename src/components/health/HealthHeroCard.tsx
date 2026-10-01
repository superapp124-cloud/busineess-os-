/**
 * CHATR HEALTH OS — HealthHeroCard
 * ============================================================================
 * "YOUR HEALTH TODAY" — Primary Health State Card
 *
 * Core architectural principle:
 *   ONE calm, premium, intelligent card that answers: "How am I doing?"
 *   Semantic status driven by HealthStateEngine.
 *   Progressive disclosure: no nested device buttons, no metric overload.
 * ============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Radio, 
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { HealthStateValue, DomainState } from '@/services/health/HealthStateEngine';

interface HealthHeroCardProps {
  healthState?: HealthStateValue;
  healthStateLabel?: string;
  healthScore?: number | null;
  domainStates?: Record<string, DomainState>;
  userName?: string;
  connectedDevicesCount?: number;
  onOpenDevices?: () => void;
  onOpenDetails?: () => void;
}

export function HealthHeroCard({ 
  healthState = 'unknown',
  healthStateLabel,
  healthScore, 
  domainStates = {},
  userName,
  connectedDevicesCount = 0,
  onOpenDevices,
  onOpenDetails
}: HealthHeroCardProps) {

  // Map state to semantic presentation
  const getConfig = () => {
    switch (healthState) {
      case 'stable':
        return {
          title: 'STABLE',
          narrative: 'Your health is within your recent personal baseline.',
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
          cardBorder: 'border-emerald-500/20 dark:border-emerald-500/15',
          cardGlow: 'from-emerald-500/5 via-teal-500/5 to-transparent',
        };
      case 'improving':
        return {
          title: 'IMPROVING',
          narrative: 'Your biometrics are trending positively above baseline.',
          icon: TrendingUp,
          iconColor: 'text-cyan-500',
          badgeBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
          cardBorder: 'border-cyan-500/20 dark:border-cyan-500/15',
          cardGlow: 'from-cyan-500/5 via-blue-500/5 to-transparent',
        };
      case 'needs_attention':
        return {
          title: 'NEEDS ATTENTION',
          narrative: 'One or more health signals deviate from your normal baseline.',
          icon: AlertCircle,
          iconColor: 'text-amber-500',
          badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
          cardBorder: 'border-amber-500/25 dark:border-amber-500/20',
          cardGlow: 'from-amber-500/5 via-orange-500/5 to-transparent',
        };
      case 'unknown':
      default:
        return {
          title: 'BUILDING BASELINE',
          narrative: 'Connect a device or log health signals to establish your baseline.',
          icon: Radio,
          iconColor: 'text-primary',
          badgeBg: 'bg-primary/10 text-primary border-primary/20',
          cardBorder: 'border-primary/20 dark:border-primary/15',
          cardGlow: 'from-primary/5 via-indigo-500/5 to-transparent',
        };
    }
  };

  const config = getConfig();
  const StateIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-3xl p-5 bg-card border ${config.cardBorder} shadow-sm`}
    >
      {/* Subtle ambient gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.cardGlow} pointer-events-none`} />

      <div className="relative z-10 space-y-3">
        {/* Top meta row */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
            YOUR HEALTH TODAY
          </p>
          {healthScore !== null && healthScore !== undefined && (
            <span className="text-[10px] font-semibold text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
              Index: {healthScore}
            </span>
          )}
        </div>

        {/* Primary Health State headline */}
        <div className="pt-0.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.badgeBg}`}>
              <StateIcon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {config.title}
            </h2>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            {config.narrative}
          </p>
        </div>

        {/* Source summary link (Progressive disclosure to Device Center) */}
        <div className="pt-1 flex items-center justify-between border-t border-border/40">
          <button
            type="button"
            onClick={onOpenDevices}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors py-1 group"
          >
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>
              {connectedDevicesCount === 0 
                ? 'No data sources connected' 
                : `${connectedDevicesCount} data source${connectedDevicesCount !== 1 ? 's' : ''}`}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          {onOpenDetails && (
            <button
              type="button"
              onClick={onOpenDetails}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Details
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

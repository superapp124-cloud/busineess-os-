/**
 * CHATR HEALTH OS — TodayFocusCard
 *
 * Shows the 3 most important health actions for today.
 * If there are no focus items: shows nothing (not a placeholder card).
 * Each item has: icon, title, description, action button.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Pill, Activity, FlaskConical, Calendar, Sparkles,
  Heart, AlertTriangle, Brain, ArrowRight
} from 'lucide-react';
import type { FocusItem } from '@/services/health/AttentionEngine';

interface TodayFocusCardProps {
  items: FocusItem[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Pill, Activity, FlaskConical, Calendar, Sparkles,
  Heart, AlertTriangle, Brain,
};

const PRIORITY_STYLES: Record<number, { dot: string; bg: string }> = {
  0: { dot: 'bg-red-500', bg: 'bg-red-50 border-red-200' },
  1: { dot: 'bg-orange-500', bg: 'bg-orange-50 border-orange-200' },
  2: { dot: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200' },
  3: { dot: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200' },
  4: { dot: 'bg-slate-400', bg: 'bg-slate-50 border-slate-200' },
};

export function TodayFocusCard({ items }: TodayFocusCardProps) {
  const navigate = useNavigate();

  // If nothing to show — show nothing. No placeholder.
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">TODAY'S FOCUS</h3>
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {items.length} action{items.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const Icon = ICON_MAP[item.icon] || Heart;
          const style = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES[3];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${style.bg} cursor-pointer active:scale-[0.98] transition-transform`}
              onClick={() => navigate(item.actionRoute)}
            >
              {/* Priority dot */}
              <span className={`flex-shrink-0 w-2 h-2 rounded-full ${style.dot}`} />

              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-white/70 rounded-lg flex items-center justify-center shadow-sm">
                <Icon className="w-4 h-4 text-foreground/70" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 flex items-center gap-1 text-xs text-primary font-medium">
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

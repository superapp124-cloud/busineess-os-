/**
 * CHATR HEALTH OS — HealthInbox
 *
 * Priority-ordered health action center.
 * NOT a generic notification list — this is where health tasks live.
 *
 * Sections:
 *   TODAY     — overdue + due now + due today
 *   UPCOMING  — due in next 7 days
 *   INSIGHTS  — AI-backed health observations
 *   COMPLETED — recently completed (medication taken, etc.)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Pill, Activity, FlaskConical, Calendar, Sparkles,
  Heart, AlertTriangle, Brain, CheckCircle, AlertCircle,
  ChevronRight, InboxIcon
} from 'lucide-react';
import type { InboxItem } from '@/hooks/useHealthOS';

interface HealthInboxProps {
  items: InboxItem[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Pill, Activity, FlaskConical, Calendar, Sparkles,
  Heart, AlertTriangle, Brain, CheckCircle, AlertCircle,
};

const STATUS_CONFIG: Record<InboxItem['status'], {
  label: string;
  chip: string;
  section: 'today' | 'upcoming' | 'done';
}> = {
  overdue: { label: 'Overdue', chip: 'bg-red-100 text-red-700', section: 'today' },
  now: { label: 'Now', chip: 'bg-orange-100 text-orange-700', section: 'today' },
  today: { label: 'Today', chip: 'bg-blue-100 text-blue-700', section: 'today' },
  upcoming: { label: 'Upcoming', chip: 'bg-slate-100 text-slate-600', section: 'upcoming' },
  done: { label: 'Done', chip: 'bg-emerald-100 text-emerald-700', section: 'done' },
};

type SectionKey = 'today' | 'upcoming' | 'insights' | 'done';

export function HealthInbox({ items }: HealthInboxProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>('today');

  if (!items || items.length === 0) {
    return (
      <div className="space-y-2">
        <SectionHeader title="HEALTH INBOX" />
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <InboxIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Nothing important needs your attention right now.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">CHATR is watching your health data.</p>
        </div>
      </div>
    );
  }

  const todayItems = items.filter(i => STATUS_CONFIG[i.status].section === 'today');
  const upcomingItems = items.filter(i => STATUS_CONFIG[i.status].section === 'upcoming');
  const insightItems = items.filter(i => i.type === 'prediction_fired' || i.type === 'insight_generated');
  const doneItems = items.filter(i => STATUS_CONFIG[i.status].section === 'done');

  const sections: { key: SectionKey; label: string; count: number }[] = [
    { key: 'today', label: 'Today', count: todayItems.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingItems.length },
    { key: 'insights', label: 'Insights', count: insightItems.length },
    { key: 'done', label: 'Done', count: doneItems.length },
  ].filter(s => s.count > 0);

  const currentItems = {
    today: todayItems,
    upcoming: upcomingItems,
    insights: insightItems,
    done: doneItems,
  }[activeSection] || todayItems;

  return (
    <div className="space-y-3">
      <SectionHeader title="HEALTH INBOX" badge={items.length} />

      {/* Section tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {sections.map(section => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeSection === section.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {section.label}
            {section.count > 0 && (
              <span className={`text-[10px] px-1 py-0.5 rounded-full ${
                activeSection === section.key
                  ? 'bg-white/20'
                  : 'bg-muted-foreground/20'
              }`}>
                {section.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {currentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No {activeSection} items.
            </p>
          ) : (
            currentItems.map((item, idx) => (
              <InboxItemRow
                key={item.id}
                item={item}
                idx={idx}
                onTap={() => navigate(item.actionRoute)}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function InboxItemRow({
  item,
  idx,
  onTap,
}: {
  item: InboxItem;
  idx: number;
  onTap: () => void;
}) {
  const Icon = ICON_MAP[item.icon] || Heart;
  const statusConfig = STATUS_CONFIG[item.status];

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      onClick={onTap}
      className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-muted/30 active:scale-[0.98] transition-all text-left"
    >
      <div className="flex-shrink-0 w-9 h-9 bg-muted/50 rounded-xl flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-foreground/70" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
          <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusConfig.chip}`}>
            {statusConfig.label}
          </span>
        </div>
        {item.subtitle && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.subtitle}</p>
        )}
        {item.dueAt && item.status !== 'done' && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatDueTime(item.dueAt)}
          </p>
        )}
      </div>

      <ChevronRight className="flex-shrink-0 w-4 h-4 text-muted-foreground/50" />
    </motion.button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <InboxIcon className="w-4 h-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {badge !== undefined && badge > 0 && (
        <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
          {badge}
        </span>
      )}
    </div>
  );
}

function formatDueTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / (1000 * 60));
  const diffH = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMin < -60) return `${Math.abs(Math.round(diffH))}h ago`;
  if (diffMin < 0) return `${Math.abs(diffMin)}m ago`;
  if (diffMin < 60) return `In ${diffMin} minute${diffMin !== 1 ? 's' : ''}`;
  if (diffH < 24) return `In ${diffH} hour${diffH !== 1 ? 's' : ''}`;
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

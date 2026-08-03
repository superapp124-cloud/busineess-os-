import React, { memo } from 'react';
import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Candidate, CandidateStage, PriorityLevel, RiskLevel, STAGE_COLORS } from './types';
import { getDaysInStage, isSLABreached } from './utils';

export const Skeleton = memo(({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
));
Skeleton.displayName = 'Skeleton';

export const AiMatchBadge = memo(({ pct, onClick }: { pct: number; onClick?: (e?: React.MouseEvent) => void }) => {
  const color = pct >= 90 ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300'
    : pct >= 80 ? 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
    : 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300';
  return (
    <button onClick={onClick} title="Click for AI breakdown"
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${color}`}>
      <Sparkles className="w-2.5 h-2.5" /> {pct}%
    </button>
  );
});
AiMatchBadge.displayName = 'AiMatchBadge';

export const StatusBadge = memo(({ stage }: { stage: CandidateStage }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${STAGE_COLORS[stage]}`}>
    {stage}
  </span>
));
StatusBadge.displayName = 'StatusBadge';

export const SlaBadge = memo(({ candidate }: { candidate: Candidate }) => {
  const breached = isSLABreached(candidate);
  const days = getDaysInStage(candidate);
  if (breached) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded-full" title={`SLA Breached! ${days} days in current stage`}>
        <AlertTriangle className="w-2.5 h-2.5" /> {days}d (SLA)
      </span>
    );
  }
  return (
    <span className="text-[10px] text-slate-400 font-medium">{days}d in stage</span>
  );
});
SlaBadge.displayName = 'SlaBadge';

export const PriorityBadge = memo(({ priority }: { priority?: PriorityLevel }) => {
  if (priority === 'High') return <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700">🔴 High</span>;
  if (priority === 'Medium') return <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700">🟡 Med</span>;
  return <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600">⚪ Low</span>;
});
PriorityBadge.displayName = 'PriorityBadge';

export const RiskBadge = memo(({ risk }: { risk?: RiskLevel }) => {
  if (risk === 'High') return <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-900/40 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Drop Risk</span>;
  if (risk === 'Medium') return <span className="text-[10px] font-medium text-amber-700 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full">Med Risk</span>;
  return <span className="text-[10px] text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><ShieldCheck className="w-2.5 h-2.5" /> Stable</span>;
});
RiskBadge.displayName = 'RiskBadge';

export const KpiCard = memo(({ icon: Icon, label, value, trend, up, color }: {
  icon: React.ElementType; label: string; value: string; trend: string; up: boolean; color: string;
}) => (
  <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      <div className={`p-1.5 rounded-lg bg-${color}-50 dark:bg-${color}-950/40 text-${color}-600 dark:text-${color}-400`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className={`text-[10px] font-bold mt-0.5 ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{trend}</p>
    </div>
  </div>
));
KpiCard.displayName = 'KpiCard';

export const InlineSparkline = memo(({ up = true }: { up?: boolean }) => (
  <svg className="w-10 h-4 shrink-0" viewBox="0 0 40 15">
    {up
      ? <path d="M 0 12 Q 10 8, 20 9 T 40 3" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
      : <path d="M 0 3 Q 10 7, 20 6 T 40 12" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />}
  </svg>
));
InlineSparkline.displayName = 'InlineSparkline';

export const ConfettiEffect = memo(() => {
  const colors = ['#5c22ff', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i, color: colors[i % colors.length], left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`, size: `${6 + Math.random() * 8}px`, duration: `${1.2 + Math.random() * 0.8}s`,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden>
      {particles.map(p => (
        <div key={p.id} className="absolute top-0 rounded-sm opacity-0"
          style={{ left: p.left, width: p.size, height: p.size, background: p.color, animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards` }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
});
ConfettiEffect.displayName = 'ConfettiEffect';

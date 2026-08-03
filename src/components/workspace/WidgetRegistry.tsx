// ─────────────────────────────────────────────────────────────────────────────
// CHATR Work OS v2.1 — WidgetRegistry
// Self-registering card renderers. The Universal Workspace iterates WorkspaceCard[]
// and calls WidgetRegistry.render(card). No switch statements. No document types.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { WorkspaceCard } from '../../core/types';
import {
  AlertTriangle, Activity, SearchCode, Lightbulb,
  CheckCircle2, Check, FileText, ChevronRight
} from 'lucide-react';

type CardRenderer = (card: WorkspaceCard, ctx: WidgetContext) => React.ReactNode;

export interface WidgetContext {
  onToggleChecklist?: (cardId: string, index: number) => void;
  checkedItems?: Record<string, boolean[]>;
}

const registry = new Map<string, CardRenderer>();

function register(type: string, renderer: CardRenderer) {
  registry.set(type, renderer);
}

function render(card: WorkspaceCard, ctx: WidgetContext = {}): React.ReactNode {
  const renderer = registry.get(card.type);
  if (!renderer) return null;
  return renderer(card, ctx);
}

// ── Warning Card ─────────────────────────────────────────────────────────────
register('warning', (card) => (
  <div key={card.id} className="bg-rose-50 rounded-2xl border border-rose-200 shadow-sm p-4 animate-in fade-in slide-in-from-top-2">
    <div className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-1.5">
      <AlertTriangle className="w-3.5 h-3.5" />
      {card.title}
    </div>
    <div className="space-y-1.5">
      {(card.data.items as string[]).map((item, i) => (
        <p key={i} className="text-xs text-rose-900 font-medium leading-relaxed">{item}</p>
      ))}
    </div>
  </div>
));

// ── Summary Card ─────────────────────────────────────────────────────────────
register('summary', (card) => (
  <div key={card.id} className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-indigo-500" />
        {card.title}
      </div>
      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
        {Math.round((card.data.confidence ?? 0.8) * 100)}% CONF
      </span>
    </div>
    <div className="space-y-2">
      {(card.data.items as string[]).map((item, i) => (
        <div key={i} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-slate-700">{item}</p>
        </div>
      ))}
    </div>
  </div>
));

// ── Extraction Card ───────────────────────────────────────────────────────────
register('extraction', (card) => {
  const fields = card.data.fields as Record<string, { value: string; confidence: number }>;
  const entries = Object.entries(fields);
  return (
    <div key={card.id} className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <SearchCode className="w-3.5 h-3.5 text-indigo-500" />
          {card.title}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <tbody className="divide-y divide-slate-50">
            {entries.map(([key, { value, confidence }]) => (
              <tr key={key} className={`hover:bg-slate-50 ${confidence >= 0.95 ? '' : 'bg-amber-50/30'}`}>
                <td className="py-2.5 px-3 font-semibold text-slate-500 w-1/2">{key}</td>
                <td className="py-2.5 px-3 font-bold text-slate-900">
                  {value}
                  {confidence < 0.95 && (
                    <span className="ml-1.5 text-[9px] text-amber-500 font-semibold">~{Math.round(confidence * 100)}%</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// ── Insight Card ──────────────────────────────────────────────────────────────
register('insight', (card) => (
  <div key={card.id} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 shadow-sm p-4">
    <div className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-1.5">
      <Lightbulb className="w-3.5 h-3.5" />
      {card.title}
    </div>
    <div className="space-y-2">
      {(card.data.items as string[]).map((item, i) => {
        const isWarning = item.toLowerCase().startsWith('provisional') || item.toLowerCase().includes('warning') || item.toLowerCase().includes('caution');
        return (
          <div key={i} className="flex items-start gap-2 text-indigo-900 text-xs">
            {isWarning
              ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              : <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            }
            <p dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      })}
    </div>
  </div>
));

// ── Checklist Card ────────────────────────────────────────────────────────────
register('checklist', (card, ctx) => {
  const steps = card.data.steps as Array<{ task: string; completed: boolean }>;
  const checkedOverride = ctx.checkedItems?.[card.id];
  return (
    <div key={card.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          {card.title}
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
          {card.data.completedCount}/{card.data.totalCount}
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isDone = checkedOverride ? checkedOverride[i] : step.completed;
          return (
            <div
              key={i}
              onClick={() => ctx.onToggleChecklist?.(card.id, i)}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-indigo-400 bg-white'
              }`}>
                {isDone && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </div>
              <p className={`text-xs font-bold leading-snug ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                {step.task}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ── Actions Card ──────────────────────────────────────────────────────────────
register('actions', (card) => {
  const items = card.data.items as string[];
  const nextStep = card.data.nextStep as { title: string; estimatedTime: string; actionLabel: string } | undefined;
  return (
    <div key={card.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
        <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
        {card.title}
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-700 py-1 border-b border-slate-50 last:border-0">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            {item}
          </div>
        ))}
      </div>
      {nextStep && (
        <div className="mt-3 p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-800">
          <span className="font-bold">Next: </span>{nextStep.title}
          <span className="ml-1 text-indigo-400 text-[10px]">({nextStep.estimatedTime})</span>
        </div>
      )}
    </div>
  );
});

export const WidgetRegistry = { render, register };

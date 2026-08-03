// ─────────────────────────────────────────────────────────────────────────────
// CHATR Work OS v2.1 — Universal Workspace Pane
//
// THIS FILE CONTAINS ZERO BUSINESS LOGIC.
// It renders a WorkspaceDefinition object. Nothing else.
// No document types. No industries. No if/switch statements.
//
// To support a new industry:
//   1. Add a plugin to GoalIntelligence.ts
//   2. Register a new widget in WidgetRegistry.tsx (if needed)
//   That's it. This file never changes.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { WorkspaceDefinition } from '../../core/types';
import { WidgetRegistry } from './WidgetRegistry';
import { Loader2, Zap, DownloadCloud } from 'lucide-react';

interface UniversalWorkspacePaneProps {
  definition: WorkspaceDefinition | null;
  isProcessing?: boolean;
  onPrimaryAction?: (actionId: string, payload?: Record<string, any>) => void;
}

export const GoalDrivenWorkspacePane: React.FC<UniversalWorkspacePaneProps> = ({
  definition,
  isProcessing = false,
  onPrimaryAction,
}) => {
  // Local checklist override state (toggled by user clicks)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean[]>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  const handleToggleChecklist = useCallback((cardId: string, index: number) => {
    setCheckedItems(prev => {
      const card = definition?.cards.find(c => c.id === cardId);
      const steps = card?.data.steps as Array<{ task: string; completed: boolean }> ?? [];
      const current = prev[cardId] ?? steps.map(s => s.completed);
      const next = [...current];
      next[index] = !next[index];
      return { ...prev, [cardId]: next };
    });
  }, [definition]);

  const handlePrimaryAction = () => {
    if (!definition) return;
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      onPrimaryAction?.(definition.primaryAction.id, definition.primaryAction.payload);
    }, 1200);
  };

  // ── Processing state ───────────────────────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-slate-400 p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold text-slate-500">Analyzing document...</p>
        <p className="text-xs text-slate-400 text-center max-w-[180px]">
          Extracting entities, goals, and recommended actions
        </p>
      </div>
    );
  }

  // ── No definition yet ──────────────────────────────────────────────────────
  if (!definition) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-slate-300 p-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Zap className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-400 text-center">
          Upload a document to activate intelligence
        </p>
      </div>
    );
  }

  // ── Status badge ───────────────────────────────────────────────────────────
  const statusColors = {
    ready: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    needs_attention: 'bg-rose-100 text-rose-700 border-rose-200',
    processing: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className="flex flex-col h-full text-slate-800 overflow-y-auto pr-0.5 pb-8 space-y-3">

      {/* ── Header ── */}
      <div className="px-1 pt-2">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-[15px] font-black text-slate-900 tracking-tight leading-snug">
            {definition.title}
          </h2>
          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 mt-0.5 ${statusColors[definition.status]}`}>
            {definition.status === 'needs_attention' ? 'Needs Review' : definition.status === 'ready' ? 'Ready' : 'In Progress'}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {definition.subtitle}
        </p>
      </div>

      {/* ── Dynamic Cards — sorted by priority, rendered by WidgetRegistry ── */}
      {definition.cards
        .slice()
        .sort((a, b) => a.priority - b.priority)
        .map(card => (
          <React.Fragment key={card.id}>
            {WidgetRegistry.render(card, {
              onToggleChecklist: handleToggleChecklist,
              checkedItems,
            })}
          </React.Fragment>
        ))
      }

      {/* ── Primary Action Button ── */}
      <button
        onClick={handlePrimaryAction}
        disabled={isExecuting}
        className="mx-0 mt-1 w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExecuting ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing...</>
        ) : definition.primaryAction.payload?.goalCategory === 'finance' ? (
          <><DownloadCloud className="w-3.5 h-3.5 text-emerald-400" /> {definition.primaryAction.label}</>
        ) : (
          <><Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {definition.primaryAction.label}</>
        )}
      </button>

    </div>
  );
};

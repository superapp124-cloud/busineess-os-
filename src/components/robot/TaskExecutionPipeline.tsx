/**
 * CHATR-Meera Task Execution Pipeline
 * Real-time 10-step autonomous task decomposition with progress tracking.
 */

import React from 'react';

export const TaskExecutionPipeline: React.FC = () => {
  const steps = [
    { num: 1, label: 'Understand command (Hindi)', status: 'COMPLETED' },
    { num: 2, label: 'Plan task', status: 'COMPLETED' },
    { num: 3, label: 'Navigate to kitchen', status: 'COMPLETED' },
    { num: 4, label: 'Detect water bottle', status: 'COMPLETED' },
    { num: 5, label: 'Approach and reach', status: 'COMPLETED' },
    { num: 6, label: 'Grasp (Contact Force: 14.2 N)', status: 'COMPLETED' },
    { num: 7, label: 'Lift and carry', status: 'COMPLETED' },
    { num: 8, label: 'Return to user', status: 'IN_PROGRESS' },
    { num: 9, label: 'Handover', status: 'PENDING' },
    { num: 10, label: 'Complete', status: 'PENDING' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-2.5 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-200 tracking-wider">TASK EXECUTION</span>
          <span className="text-[10px] text-cyan-400 font-bold">
            FETCH_OBJECT (Kitchen → User)
          </span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse">
          In Progress...
        </span>
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px] pr-1">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] ${
              s.status === 'COMPLETED'
                ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                : s.status === 'IN_PROGRESS'
                ? 'bg-cyan-950/70 border-cyan-700 text-cyan-200 font-bold shadow'
                : 'bg-slate-950/30 border-transparent text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">{s.num}.</span>
              <span>{s.label}</span>
            </div>

            {s.status === 'COMPLETED' ? (
              <span className="text-emerald-400 font-bold">✔</span>
            ) : s.status === 'IN_PROGRESS' ? (
              <span className="text-cyan-400 text-[9px] font-bold tracking-wider animate-pulse">
                (In Progress...)
              </span>
            ) : (
              <span className="text-slate-600 text-[10px]">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

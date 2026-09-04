/**
 * CHATR-Meera Task Execution Pipeline
 * Real-time dynamic autonomous task decomposition with live progress tracking,
 * sub-step state progression, and mission status badges.
 */

import React, { useState, useEffect } from 'react';
import { RobotCommandEngine, ActiveTaskState } from '../../services/robotCommandEngine';

export const TaskExecutionPipeline: React.FC = () => {
  const [activeTask, setActiveTask] = useState<ActiveTaskState>(() => RobotCommandEngine.getActiveTask());

  useEffect(() => {
    const unsub = RobotCommandEngine.onTaskUpdate((task) => {
      setActiveTask({ ...task });
    });
    return () => unsub();
  }, []);

  const completedCount = activeTask.steps.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / activeTask.steps.length) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-2.5 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200 tracking-wider">TASK EXECUTION</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
              {activeTask.category}
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold truncate max-w-[220px]">
            {activeTask.taskTitle}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              activeTask.status === 'COMPLETED'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : activeTask.status === 'EMERGENCY_STOPPED'
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                : 'bg-cyan-950 text-cyan-300 border-cyan-700 animate-pulse'
            }`}
          >
            {activeTask.status === 'COMPLETED'
              ? 'Completed ✔'
              : activeTask.status === 'EMERGENCY_STOPPED'
              ? 'E-Stop Locked'
              : 'In Progress...'}
          </span>
          <span className="text-[9px] text-slate-400 font-semibold">
            {completedCount}/{activeTask.steps.length} steps ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[210px] pr-1">
        {activeTask.steps.map((s) => (
          <div
            key={s.num}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] transition-all duration-300 ${
              s.status === 'COMPLETED'
                ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                : s.status === 'IN_PROGRESS'
                ? 'bg-cyan-950/70 border-cyan-700 text-cyan-200 font-bold shadow-lg shadow-cyan-950/50'
                : 'bg-slate-950/30 border-transparent text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">{s.num}.</span>
              <span className="truncate max-w-[200px] sm:max-w-[240px]">{s.label}</span>
            </div>

            {s.status === 'COMPLETED' ? (
              <span className="text-emerald-400 font-bold text-xs">✔</span>
            ) : s.status === 'IN_PROGRESS' ? (
              <span className="text-cyan-400 text-[9px] font-bold tracking-wider animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Active
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

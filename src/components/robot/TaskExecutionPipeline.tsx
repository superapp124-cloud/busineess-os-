/**
 * CHATR-Meera Task Execution Pipeline
 * Displays the live 11-step autonomous task decomposition graph directly from the simulator.
 */

import React, { useEffect, useState } from 'react';
import { SimBridgeClient, SimBridgeState, TaskStep } from '../../../packages/sim-bridge/src';

const DEFAULT_11_STEPS: TaskStep[] = [
  { num: 1, label: 'Understand command', status: 'COMPLETED' },
  { num: 2, label: 'Locate kitchen', status: 'COMPLETED' },
  { num: 3, label: 'Locate bottle', status: 'COMPLETED' },
  { num: 4, label: 'Navigate', status: 'RUNNING' },
  { num: 5, label: 'Approach bottle', status: 'QUEUED' },
  { num: 6, label: 'Solve reach', status: 'QUEUED' },
  { num: 7, label: 'Grasp', status: 'QUEUED' },
  { num: 8, label: 'Lift', status: 'QUEUED' },
  { num: 9, label: 'Navigate to user', status: 'QUEUED' },
  { num: 10, label: 'Handover', status: 'QUEUED' },
  { num: 11, label: 'Verify completion', status: 'QUEUED' },
];

export const TaskExecutionPipeline: React.FC = () => {
  const [simState, setSimState] = useState<SimBridgeState | null>(null);

  useEffect(() => {
    SimBridgeClient.getState().then((s) => setSimState(s)).catch(() => {});
    const unsub = SimBridgeClient.onStateUpdate((s) => setSimState(s));
    return () => unsub();
  }, []);

  const task = simState?.task_state;
  const steps: TaskStep[] = task?.steps || DEFAULT_11_STEPS;
  const isRunning = task ? task.status === 'RUNNING' : true;
  const isCompleted = task?.status === 'COMPLETED';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-2.5 shadow-xl font-mono text-xs">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-200 tracking-wider">TASK GRAPH</span>
          <span className="text-[10px] text-cyan-400 font-bold">
            FETCH_OBJECT (Kitchen → User)
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isCompleted
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : isRunning
              ? 'bg-cyan-950 text-cyan-300 border-cyan-700 animate-pulse'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isCompleted ? '✔ COMPLETED' : isRunning ? '⚡ RUNNING...' : 'IDLE'}
        </span>
      </div>

      {/* ── 11-Step Task Graph Nodes ── */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px] pr-1">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] transition ${
              s.status === 'COMPLETED'
                ? 'bg-slate-950/70 border-emerald-900/60 text-slate-300'
                : s.status === 'RUNNING'
                ? 'bg-cyan-950/80 border-cyan-600 text-cyan-200 font-bold shadow-[0_0_8px_#06b6d4]'
                : s.status === 'FAILED'
                ? 'bg-rose-950 border-rose-700 text-rose-300 font-bold'
                : s.status === 'BLOCKED'
                ? 'bg-amber-950 border-amber-800 text-amber-300'
                : 'bg-slate-950/30 border-transparent text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">{s.num}.</span>
              <span>{s.label}</span>
            </div>

            {s.status === 'COMPLETED' ? (
              <span className="text-emerald-400 font-bold">✔</span>
            ) : s.status === 'RUNNING' ? (
              <span className="text-cyan-400 text-[9px] font-bold tracking-wider animate-pulse">
                (RUNNING...)
              </span>
            ) : s.status === 'FAILED' ? (
              <span className="text-rose-400 font-bold text-[9px]">FAILED</span>
            ) : s.status === 'BLOCKED' ? (
              <span className="text-amber-400 font-bold text-[9px]">BLOCKED</span>
            ) : (
              <span className="text-slate-600 text-[10px]">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

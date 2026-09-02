/**
 * CHATR Task Execution Graph Panel (Gate 7 UI)
 * Renders the 8-step decomposed execution graph and tracks active sub-task progression.
 */

import React from 'react';
import { ValidatedRobotTaskPlan } from '../../../packages/robot-ai-bridge/src/types';

interface ExecutionGraphPanelProps {
  activePlan: ValidatedRobotTaskPlan | null;
  currentStepIndex: number;
}

export const ExecutionGraphPanel: React.FC<ExecutionGraphPanelProps> = ({
  activePlan,
  currentStepIndex,
}) => {
  const subTasks = activePlan?.subTasks || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-sm font-bold text-slate-200">DECOMPOSED TASK EXECUTION GRAPH</span>
        <span className="text-[11px] font-mono text-cyan-400">
          PROGRESS: {subTasks.length > 0 ? `${Math.min(currentStepIndex, subTasks.length)} / ${subTasks.length} Steps` : 'IDLE'}
        </span>
      </div>

      {subTasks.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-mono">
          No active task graph. Issue a command to generate sub-tasks.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {subTasks.map((step) => {
            const isCompleted = step.stepIndex < currentStepIndex;
            const isCurrent = step.stepIndex === currentStepIndex;

            let badgeClass = 'bg-slate-950 border-slate-800 text-slate-400';
            if (isCompleted) {
              badgeClass = 'bg-emerald-950/50 border-emerald-600 text-emerald-300';
            } else if (isCurrent) {
              badgeClass = 'bg-cyan-950 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500 animate-pulse';
            }

            return (
              <div key={step.stepIndex} className={`p-2 rounded-lg border flex flex-col gap-1 transition ${badgeClass}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold">STEP {step.stepIndex}</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900">
                    {step.subTaskType}
                  </span>
                </div>
                <span className="text-[11px] font-semibold truncate text-slate-200">{step.description}</span>
                <span className="text-[9px] text-slate-400 truncate">Target: {step.targetLocationOrId}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

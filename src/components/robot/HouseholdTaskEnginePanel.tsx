/**
 * CHATR Household Task Engine Panel (Gate 8 UI)
 * Live interactive cockpit executing 11 household tasks across 30 canonical skills with state machine visualizer.
 */

import React, { useState } from 'react';
import { TaskType, TaskState, TaskExecutionProgress } from '../../../packages/robot-tasks/src/types';
import { HouseholdTaskEngine } from '../../../packages/robot-tasks/src/engine/householdTaskEngine';
import { PerceptionWorldModelSnapshot } from '../../../packages/robot-perception/src/types';
import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';
import { Quaternion } from '../../../packages/robot-physics/src/math/quaternion';
import { ArmSide, ArmJointAngles, HumanSafetyZone } from '../../../packages/robot-manipulation/src/types';

interface HouseholdTaskEnginePanelProps {
  worldModelSnapshot: PerceptionWorldModelSnapshot;
  robotPose: { position: Vector3; orientation: Quaternion };
  batterySoc: number;
  safetyZone: HumanSafetyZone;
  isEstopActive: boolean;
  activeArmJoints: Record<ArmSide, ArmJointAngles>;
  onUpdateTaskState?: (progress: TaskExecutionProgress) => void;
}

const TASK_OPTIONS: { id: TaskType; name: string; icon: string; category: string }[] = [
  { id: 'FETCH_OBJECT', name: '1. Fetch Object & Delivery', icon: '🚰', category: 'Manipulation' },
  { id: 'NAVIGATE_ROOMS', name: '2. Multi-Room Transit', icon: '🚶', category: 'Locomotion' },
  { id: 'PICK_UP_CLOTHES', name: '3. Collect Floor Laundry', icon: '🧺', category: 'Deformable' },
  { id: 'CLEAN_TABLE', name: '4. Clear & Wipe Dining Table', icon: '🧽', category: 'Cleaning' },
  { id: 'SERVE_WATER', name: '5. Pour & Serve Water', icon: '🥛', category: 'Assistance' },
  { id: 'PUT_AWAY_GROCERIES', name: '6. Store Groceries in Cabinet', icon: '🥫', category: 'Storage' },
  { id: 'EMPTY_TRASH_BIN', name: '7. Empty Waste Bin', icon: '🗑️', category: 'Sanitation' },
  { id: 'PATROL_AND_REPORT', name: '8. Patrol & Inspect Home', icon: '🛡️', category: 'Security' },
  { id: 'BED_MAKING_ASSIST', name: '9. Bed Making & Sheet Tug', icon: '🛏️', category: 'Deformable' },
  { id: 'MEDICINE_REMINDER', name: '10. Medicine Box Handover', icon: '💊', category: 'Healthcare' },
  { id: 'AUTONOMOUS_RECHARGE', name: '11. Dock to 48V Station', icon: '⚡', category: 'Power' },
];

export const HouseholdTaskEnginePanel: React.FC<HouseholdTaskEnginePanelProps> = ({
  worldModelSnapshot,
  robotPose,
  batterySoc,
  safetyZone,
  isEstopActive,
  activeArmJoints,
  onUpdateTaskState,
}) => {
  const [selectedTask, setSelectedTask] = useState<TaskType>('FETCH_OBJECT');
  const [engine] = useState(() => new HouseholdTaskEngine());
  const [taskProgress, setTaskProgress] = useState<TaskExecutionProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const decomposedSteps = engine.getTaskDecomposition(selectedTask);

  const handleRunTask = async () => {
    setIsRunning(true);
    try {
      const progress = await engine.executeTask(
        {
          taskId: `TASK-${Date.now()}`,
          taskType: selectedTask,
          worldModelSnapshot,
          robotPoseWorld: robotPose,
          batterySocPercent: batterySoc,
          safetyZone,
          isEstopActive,
          activeArmJoints,
          provenance: 'SIMULATION_KERNEL',
        },
        (p) => {
          setTaskProgress({ ...p });
          onUpdateTaskState?.(p);
        }
      );
      setTaskProgress(progress);
    } finally {
      setIsRunning(false);
    }
  };

  const getStateColor = (state: TaskState) => {
    switch (state) {
      case 'COMPLETE':
        return 'bg-emerald-600 text-white border-emerald-400';
      case 'EXECUTING':
      case 'PLANNING':
      case 'VALIDATING':
      case 'VERIFYING':
        return 'bg-cyan-600 text-white animate-pulse border-cyan-400';
      case 'FAILED':
      case 'ABORTED':
        return 'bg-rose-600 text-white border-rose-400';
      case 'IDLE':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200">HOUSEHOLD TASK ENGINE (11 TASKS / 30 SKILLS)</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
            PROVENANCE: SIMULATION_KERNEL
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">PRE/POST-CONDITION GATING</span>
      </div>

      {/* Task Selector Dropdown & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <select
          value={selectedTask}
          onChange={(e) => {
            setSelectedTask(e.target.value as TaskType);
            setTaskProgress(null);
          }}
          disabled={isRunning}
          className="flex-1 bg-slate-950 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none"
        >
          {TASK_OPTIONS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.name} ({t.category})
            </option>
          ))}
        </select>

        <button
          onClick={handleRunTask}
          disabled={isRunning}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-40 shadow flex items-center justify-center gap-2"
        >
          {isRunning ? '⏳ EXECUTING...' : '▶️ DISPATCH TASK'}
        </button>
      </div>

      {/* State Machine Progress Bar */}
      <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-mono font-bold">
        {(['VALIDATING', 'PLANNING', 'EXECUTING', 'VERIFYING', 'COMPLETE'] as TaskState[]).map((st) => {
          const isActive = taskProgress?.currentState === st;
          const isDone =
            taskProgress?.currentState === 'COMPLETE' ||
            (taskProgress?.currentState === 'VERIFYING' && (st === 'VALIDATING' || st === 'PLANNING' || st === 'EXECUTING')) ||
            (taskProgress?.currentState === 'EXECUTING' && (st === 'VALIDATING' || st === 'PLANNING')) ||
            (taskProgress?.currentState === 'PLANNING' && st === 'VALIDATING');

          return (
            <div
              key={st}
              className={`py-1 rounded border transition ${
                isActive
                  ? getStateColor(st)
                  : isDone
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-950 text-slate-600 border-slate-800'
              }`}
            >
              {st}
            </div>
          );
        })}
      </div>

      {/* Decomposed Skill Steps Flow */}
      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
        <span className="text-[10px] font-mono text-slate-400">
          DECOMPOSED SKILLS PIPELINE ({decomposedSteps.length} SKILLS):
        </span>
        {decomposedSteps.map((step) => {
          const isCurrent = taskProgress?.currentStepIndex === step.stepIndex;
          const isPassed = taskProgress ? taskProgress.currentStepIndex > step.stepIndex || taskProgress.isComplete : false;

          return (
            <div
              key={step.stepIndex}
              className={`flex items-center justify-between p-2 rounded text-xs font-mono border transition ${
                isCurrent
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                  : isPassed
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isCurrent ? 'bg-cyan-500 text-slate-950' : isPassed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isPassed ? '✓' : step.stepIndex}
                </span>
                <span>{step.description}</span>
              </div>
              <span className="text-[9px] text-slate-500">[{step.skillType}]</span>
            </div>
          );
        })}
      </div>

      {/* Diagnostics / Outcome Console */}
      {taskProgress && (
        <div className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col gap-1 ${
          taskProgress.isFailed
            ? 'bg-rose-950/60 border-rose-700 text-rose-300'
            : taskProgress.isComplete
            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
            : 'bg-slate-950 border-cyan-800 text-cyan-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold">ENGINE DIAGNOSTICS</span>
            <span>STATE: {taskProgress.currentState}</span>
          </div>
          <p className="text-[11px]">{taskProgress.diagnostics}</p>
          {taskProgress.failureReason && (
            <span className="text-[10px] text-rose-400 font-bold">
              FAILURE REASON: {taskProgress.failureReason}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

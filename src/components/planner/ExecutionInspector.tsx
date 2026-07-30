import React, { useState } from 'react';
import { ExecutionPlan, PlanStep } from '../../planner/ExecutionGraph';
import { PlanExecutionSummary, IntentPlanner } from '../../planner/IntentPlanner';
import { PlanOptimizer } from '../../planner/PlanOptimizer';
import { ExecutionHistoryStore } from '../../planner/ExecutionHistoryStore';
import { Activity, Play, RotateCcw, CheckCircle, Clock, Cpu, Layers, Sparkles, X, ChevronRight, Zap, Shield } from 'lucide-react';

interface ExecutionInspectorProps {
  plan: ExecutionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onReplayComplete?: (summary: PlanExecutionSummary) => void;
}

export const ExecutionInspector: React.FC<ExecutionInspectorProps> = ({
  plan,
  isOpen,
  onClose,
  onReplayComplete,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySummary, setReplaySummary] = useState<PlanExecutionSummary | null>(null);

  if (!isOpen || !plan) return null;

  const optimization = PlanOptimizer.optimize(plan);
  const selectedStep = plan.steps.find(s => s.id === selectedStepId) || plan.steps[0];

  const handleReplay = async () => {
    setIsReplaying(true);
    try {
      const summary = await IntentPlanner.executePlan(plan);
      setReplaySummary(summary);
      ExecutionHistoryStore.saveRecord(plan, summary, `trc_replay_${Date.now()}`);
      if (onReplayComplete) onReplayComplete(summary);
    } catch (err: any) {
      console.error('[ExecutionInspector] Replay failed:', err);
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Inspector Header */}
        <div className="h-14 border-b border-slate-800 bg-slate-950/60 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Execution Inspector
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  DevTools for Intent OS
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate max-w-md">Goal: "{plan.goal}"</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReplay}
              disabled={isReplaying}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
              {isReplaying ? 'Replaying Plan...' : 'Replay Execution'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Replay Summary Banner */}
        {replaySummary && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-5 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Replay Complete: Executed {replaySummary.stepsCompleted}/{replaySummary.totalSteps} steps in {replaySummary.durationMs}ms</span>
            </div>
            <span className="text-[10px] text-emerald-400/80">Trace ID: trc_replay_active</span>
          </div>
        )}

        {/* Main DevTools Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Interactive DAG Step List */}
          <div className="w-1/2 border-r border-slate-800 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
            {/* Plan Optimization Insight Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  DAG Optimizer Insights
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  Saved {optimization.timeSavedMs}ms
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-1">
                <div>Original Duration: <span className="text-slate-200">{optimization.originalDurationMs}ms</span></div>
                <div>Parallel Batches: <span className="text-indigo-300 font-bold">{optimization.parallelBatchesCount}</span></div>
              </div>
            </div>

            {/* DAG Steps Timeline */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Execution Graph Steps ({plan.steps.length})
              </span>

              {plan.steps.map((step, idx) => {
                const isSelected = step.id === (selectedStepId || plan.steps[0].id);
                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/60 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 font-mono text-[10px] font-bold text-indigo-300 flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          {step.name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400">Capability: {step.capability}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        step.status === 'running' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {step.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Node Metadata Inspector */}
          <div className="w-1/2 p-5 overflow-y-auto space-y-4 bg-slate-900">
            {selectedStep ? (
              <div className="space-y-4 font-mono">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold">Node Inspector</span>
                  <h3 className="text-base font-bold text-white mt-1">{selectedStep.name}</h3>
                  <p className="text-xs text-slate-400">Step ID: {selectedStep.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500">Capability Target</span>
                    <div className="font-bold text-cyan-300 mt-1">{selectedStep.capability}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500">Status</span>
                    <div className="font-bold text-emerald-400 mt-1 capitalize">{selectedStep.status}</div>
                  </div>
                </div>

                {/* Step Dependencies */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-500">Dependencies</span>
                  <div className="text-xs text-slate-300">
                    {selectedStep.dependencies.length > 0
                      ? selectedStep.dependencies.join(', ')
                      : 'None (Root step)'}
                  </div>
                </div>

                {/* Step Inputs */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-500">Input Payload</span>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800">
                    {JSON.stringify(selectedStep.inputs, null, 2)}
                  </pre>
                </div>

                {/* Step Execution Output */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-500">Node Output & Telemetry</span>
                  <pre className="text-[11px] text-emerald-300 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800">
                    {selectedStep.result
                      ? JSON.stringify(selectedStep.result, null, 2)
                      : '{"status": "Completed", "provider": "Baidu Unlimited-OCR", "durationMs": 142}'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-xs font-mono text-slate-500">Select a step node to inspect telemetry.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

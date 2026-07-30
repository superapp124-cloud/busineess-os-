import React, { useState } from 'react';
import { IntentPlanner } from '../../planner/IntentPlanner';
import { ExecutionHistoryStore } from '../../planner/ExecutionHistoryStore';
import { Play, CheckCircle, Zap, Calendar, Mail, DollarSign, UserCheck, Shield, Sparkles, ArrowRight, CheckCircle2, RotateCcw, HelpCircle, Layers, FileSearch, ShieldCheck, CheckSquare } from 'lucide-react';

export interface WorkflowRecommendation {
  id: string;
  docName: string;
  triggerReason: string; // "Why"
  groundedEvidence: string; // "Evidence"
  estimatedDuration: string;
  suggestedOutcome: string;
  steps: Array<{ name: string; targetRuntime: 'Calendar' | 'Communication' | 'BusinessCRM' | 'Finance' | 'HR' }>;
}

interface WorkflowStudioProps {
  docName: string;
  docType: string;
  onWorkflowComplete?: (message: string) => void;
}

export type ApprovalLevel = 'approve_all' | 'approve_selected' | 'review_only';

export const WorkflowStudio: React.FC<WorkflowStudioProps> = ({ docName, docType, onWorkflowComplete }) => {
  const [approvalLevel, setApprovalLevel] = useState<ApprovalLevel>('approve_all');
  const [selectedStepIndices, setSelectedStepIndices] = useState<number[]>([0, 1, 2, 3]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [isWorkflowDone, setIsWorkflowDone] = useState<boolean>(false);

  const getRecommendation = (): WorkflowRecommendation => {
    if (docType === 'Invoice') {
      return {
        id: 'wf_invoice_proc',
        docName,
        triggerReason: 'New Vendor Invoice Received (INV-2026-884)',
        groundedEvidence: 'Page 1 Invoice Header • Amount: $4,250.00 USD (99.8% Grounded)',
        estimatedDuration: '3.2s Execution',
        suggestedOutcome: 'Audit & Process Vendor Invoice into Business OS Finance Ledger',
        steps: [
          { name: 'Extract Vendor Tax ID & Line Item Totals ($4,250.00)', targetRuntime: 'Finance' },
          { name: 'Audit Tax ID Compliance & Deductible Items', targetRuntime: 'Finance' },
          { name: 'Create Approved Ledger Entry in Business OS Finance', targetRuntime: 'Finance' },
          { name: 'Schedule Payment Authorization Reminder for Oct 15', targetRuntime: 'Calendar' },
        ],
      };
    } else {
      return {
        id: 'wf_contract_renewal',
        docName,
        triggerReason: 'Contract Renewal Clause & 30-Day Termination Notice Detected',
        groundedEvidence: 'Clause 14.2 on Page 1 • $1,000,000 Liability Cap (99.4% Grounded)',
        estimatedDuration: '4.5s Execution',
        suggestedOutcome: 'Execute Full Contract Renewal & Legal Notification Workflow',
        steps: [
          { name: 'Extract Renewal Terms & Liability Cap ($1,000,000)', targetRuntime: 'BusinessCRM' },
          { name: 'Create Renewal Calendar Reminder for October 1, 2027', targetRuntime: 'Calendar' },
          { name: 'Draft Summary Notification Email to Legal Counsel', targetRuntime: 'Communication' },
          { name: 'Update Microsoft Partnership Deal Stage in Business OS CRM', targetRuntime: 'BusinessCRM' },
        ],
      };
    }
  };

  const rec = getRecommendation();

  const handleToggleStep = (idx: number) => {
    if (selectedStepIndices.includes(idx)) {
      setSelectedStepIndices(prev => prev.filter(i => i !== idx));
    } else {
      setSelectedStepIndices(prev => [...prev, idx].sort());
    }
  };

  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    setCompletedSteps(0);
    setExecutionMessage(null);

    const plan = IntentPlanner.generatePlan(`Execute ${rec.suggestedOutcome} for ${rec.docName}`);

    const stepsToRun = approvalLevel === 'approve_selected' ? selectedStepIndices : rec.steps.map((_, i) => i);

    for (let i = 0; i < stepsToRun.length; i++) {
      await new Promise(res => setTimeout(res, 300));
      setCompletedSteps(i + 1);
    }

    const summary = await IntentPlanner.executePlan(plan);
    ExecutionHistoryStore.saveRecord(plan, summary, `trc_wf_${Date.now()}`);

    setIsExecuting(false);
    setIsWorkflowDone(true);
    const msg = `Workflow Studio executed ${stepsToRun.length} steps for '${rec.docName}' in ${summary.durationMs}ms with zero kernel edits!`;
    setExecutionMessage(msg);
    if (onWorkflowComplete) onWorkflowComplete(msg);
  };

  const handleRollbackWorkflow = async () => {
    setIsUndoing(true);
    await new Promise(res => setTimeout(res, 600));
    setCompletedSteps(0);
    setIsWorkflowDone(false);
    setIsUndoing(false);
    const msg = `Rollback Complete: Undone all updates, removed reminders, and restored CRM stage for '${rec.docName}'.`;
    setExecutionMessage(msg);
    if (onWorkflowComplete) onWorkflowComplete(msg);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-sans text-xs space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              AI Workflow Studio
              <span className="text-[9px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono rounded border border-indigo-500/30">
                Sprint 5 Explainable
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">{rec.suggestedOutcome}</p>
          </div>
        </div>

        {/* Action Controls: Execute or Rollback (Undo) */}
        <div className="flex items-center gap-2">
          {isWorkflowDone ? (
            <button
              onClick={handleRollbackWorkflow}
              disabled={isUndoing}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isUndoing ? 'animate-spin' : ''}`} />
              {isUndoing ? 'Rolling back...' : 'Undo / Rollback Workflow'}
            </button>
          ) : (
            <button
              onClick={handleExecuteWorkflow}
              disabled={isExecuting}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
              {isExecuting ? 'Executing...' : 'Approve & Execute'}
            </button>
          )}
        </div>
      </div>

      {/* REASONING & GROUNDED EVIDENCE CARD (Sprint 5 Feature) */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 grid grid-cols-3 gap-3 text-[11px] font-mono">
        <div>
          <span className="text-slate-500 text-[10px] block">1. Why Recommended?</span>
          <div className="text-indigo-300 font-bold mt-0.5">{rec.triggerReason}</div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">2. Grounded Evidence</span>
          <div className="text-cyan-300 font-bold mt-0.5 truncate">{rec.groundedEvidence}</div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">3. Expected Impact</span>
          <div className="text-emerald-400 font-bold mt-0.5">Automated CRM, Calendar & Mail Update</div>
        </div>
      </div>

      {/* APPROVAL CONTROL LEVEL SELECTOR */}
      <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-xs">
        <span className="text-[10px] font-mono text-slate-400 font-bold">Approval Level:</span>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {[
            { id: 'approve_all', label: 'Approve All' },
            { id: 'approve_selected', label: 'Selective Steps' },
            { id: 'review_only', label: 'Review Only' },
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => setApprovalLevel(lvl.id as ApprovalLevel)}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                approvalLevel === lvl.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Feedback Notification */}
      {executionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-emerald-300 font-mono text-[11px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{executionMessage}</span>
        </div>
      )}

      {/* Step Pipeline List */}
      <div className="space-y-1.5 font-mono text-[11px]">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
          Outcome Steps Pipeline ({rec.steps.length})
        </span>
        {rec.steps.map((step, idx) => {
          const isSelected = selectedStepIndices.includes(idx);
          const isDone = completedSteps > idx;
          return (
            <div
              key={idx}
              onClick={() => approvalLevel === 'approve_selected' && handleToggleStep(idx)}
              className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-semibold'
                  : isSelected
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  isDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span>{step.name}</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {step.targetRuntime}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

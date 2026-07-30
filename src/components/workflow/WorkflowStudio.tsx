import React, { useState } from 'react';
import { IntentPlanner } from '../../planner/IntentPlanner';
import { ExecutionPlan } from '../../planner/ExecutionGraph';
import { Play, CheckCircle, Zap, Calendar, Mail, DollarSign, UserCheck, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface WorkflowRecommendation {
  id: string;
  docName: string;
  triggerEvent: string;
  suggestedOutcome: string;
  steps: Array<{ name: string; targetRuntime: 'Calendar' | 'Communication' | 'BusinessCRM' | 'Finance' | 'HR' }>;
}

interface WorkflowStudioProps {
  docName: string;
  docType: string;
  onWorkflowComplete?: (message: string) => void;
}

export const WorkflowStudio: React.FC<WorkflowStudioProps> = ({ docName, docType, onWorkflowComplete }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  const getRecommendation = (): WorkflowRecommendation => {
    if (docType === 'Invoice') {
      return {
        id: 'wf_invoice_proc',
        docName,
        triggerEvent: 'Detected New Vendor Invoice (INV-2026-884)',
        suggestedOutcome: 'Audit & Process Vendor Invoice into Finance Ledger',
        steps: [
          { name: 'Extract Vendor Tax ID & Line Item Totals ($4,250.00)', targetRuntime: 'Finance' },
          { name: 'Audit Tax ID Compliance & Deductible Items', targetRuntime: 'Finance' },
          { name: 'Create Approved Ledger Entry in Business OS Finance', targetRuntime: 'Finance' },
          { name: 'Schedule Payment Authorization Reminder for Oct 15', targetRuntime: 'Calendar' },
        ],
      };
    } else if (docType === 'Medical') {
      return {
        id: 'wf_medical_record',
        docName,
        triggerEvent: 'Detected Patient Health Records (Starlight EHR)',
        suggestedOutcome: 'Sync Vitals & Schedule Follow-Up Consultation',
        steps: [
          { name: 'Extract Lab Vitals & Abnormal ICD-10 Metrics', targetRuntime: 'HR' },
          { name: 'Update Secure Encrypted Patient Profile', targetRuntime: 'HR' },
          { name: 'Schedule Teleconsultation Review Session', targetRuntime: 'Calendar' },
        ],
      };
    } else {
      return {
        id: 'wf_contract_renewal',
        docName,
        triggerEvent: 'Detected Contract Expiration & Renewal Clause (30-Day Notice)',
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

  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    setCompletedSteps(0);
    setExecutionMessage(null);

    // Compile Intent Plan via IntentPlanner (DAG)
    const plan = IntentPlanner.generatePlan(`Execute ${rec.suggestedOutcome} for ${rec.docName}`);

    for (let i = 0; i < rec.steps.length; i++) {
      await new Promise(res => setTimeout(res, 350));
      setCompletedSteps(i + 1);
    }

    // Execute via IntentPlanner
    const summary = await IntentPlanner.executePlan(plan);

    setIsExecuting(false);
    const msg = `Workflow Studio executed all ${rec.steps.length} outcome actions for '${rec.docName}' in ${summary.durationMs}ms with zero kernel changes!`;
    setExecutionMessage(msg);
    if (onWorkflowComplete) onWorkflowComplete(msg);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-sans text-xs space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              AI Workflow Studio
              <span className="text-[9px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono rounded border border-indigo-500/30">
                Outcome-Driven
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">{rec.triggerEvent}</p>
          </div>
        </div>

        <button
          onClick={handleExecuteWorkflow}
          disabled={isExecuting}
          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
          {isExecuting ? 'Executing Workflow...' : 'Approve & Execute All Steps'}
        </button>
      </div>

      {executionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-emerald-300 font-mono text-[11px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{executionMessage}</span>
        </div>
      )}

      {/* Suggested Outcome Steps Pipeline */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
          Suggested Outcome Execution Graph ({rec.steps.length} Steps)
        </span>
        <div className="space-y-1.5 font-mono text-[11px]">
          {rec.steps.map((step, idx) => {
            const isDone = completedSteps > idx;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
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
                  Runtime: {step.targetRuntime}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

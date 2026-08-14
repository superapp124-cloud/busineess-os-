/**
 * ExecutionInspectPage
 *
 * Route: /desktop/execution/:executionId
 *
 * CHATR Product Unification Contract — Gate 1: Canonical Object Deep Links
 *
 * 3-Tier Execution Inspection (CTO Directive, Point 4):
 *
 *   Tier 1 — recruiter  : "Interview scheduled successfully · Rajesh Kumar"
 *   Tier 2 — manager    : Qualified → Approved → Scheduled. 18.5 min saved.
 *   Tier 3 — admin      : Full trace: Execution ID · Task ID · Idempotency Key ·
 *                          Evidence · Model Decision · Policy · Provider · Events · Retry history
 *
 * The execution page internally resolves:
 *   executionId → taskExecutionId → idempotencyKey → evidence → approval → BusinessOutcomeId
 *
 * KERNEL CONTRACT: This page is a READ-ONLY projection consumer.
 * It does not modify ExecutionKernel, EventStore, BusinessGraph,
 * PersistentIdempotencyStore, or ModelRouter.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, ChevronLeft, ChevronRight, Clock, Shield,
  Activity, AlertTriangle, Info, FileText, User, Zap, Hash
} from 'lucide-react';

import { supabase } from '../../integrations/supabase/client';

// ─── Role Resolution (PermissionEngine / Auth Session Invariant) ─────────────
// Normal users (recruiter / manager) see business outcomes, NOT engineering telemetry.
// Admin / Inspector role sees full execution trace (execution ID, idempotency key, model decision, logs).

type InspectionTier = 'recruiter' | 'manager' | 'admin';

async function resolveUserTier(): Promise<InspectionTier> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role || localStorage.getItem('chatr_user_role') || 'recruiter';
    if (role === 'admin' || role === 'inspector' || role === 'chatr_admin') return 'admin';
    if (role === 'manager' || role === 'hiring_manager') return 'manager';
  } catch { /* fallback */ }
  return 'recruiter';
}

// ─── Mock Execution Resolution ────────────────────────────────────────────────
// In production: replace with EventStore query by workflowExecutionId.
// Resolution chain: executionId → taskExecutionId → idempotencyKey → evidence → approval → BusinessOutcomeId

interface ExecutionRecord {
  workflowExecutionId: string;
  taskExecutionId: string;
  idempotencyKey: string;
  customerWorkflowId: string;
  tenantId: string;
  status: 'COMPLETED' | 'AWAITING_CONFIRMATION' | 'FAILED' | 'REJECTED';
  capability: string;
  entityId: string;
  entityLabel: string;
  outcomeLabel: string;
  timeSavedMinutes: number;
  modelDecision: { model: string; policyVersion: string; decisionId: string; approvalRequired: boolean };
  evidence: { type: string; summary: string; confidence: number };
  approval: { approvedBy: string; approvedAt: string; method: string };
  externalConfirmation: { provider: string; reference: string; confirmedAt: string };
  businessOutcomeId: string;
  events: { timestamp: string; type: string; description: string }[];
  retryCount: number;
}

function resolveExecution(executionId: string): ExecutionRecord {
  // Mock resolution — in production this queries sys_execution_records via EventStore projection
  return {
    workflowExecutionId: executionId,
    taskExecutionId: `task_${executionId.slice(-8)}`,
    idempotencyKey: `idem_${executionId.slice(-12)}`,
    customerWorkflowId: `cwf_talentxcel_001`,
    tenantId: 'talentxcel',
    status: 'COMPLETED',
    capability: 'recruitment.interview.schedule',
    entityId: 'candidate_java_847',
    entityLabel: 'Rajesh Kumar',
    outcomeLabel: 'Interview scheduled for Rajesh Kumar',
    timeSavedMinutes: 18.5,
    modelDecision: {
      model: 'gemini-2.0-flash',
      policyVersion: 'v1.2',
      decisionId: `dec_${executionId.slice(-6)}`,
      approvalRequired: true,
    },
    evidence: {
      type: 'candidate_qualification',
      summary: '4+ years Java experience verified. 3 references checked. Skills match JD 94.2%.',
      confidence: 0.942,
    },
    approval: {
      approvedBy: 'Priya Sharma (Senior Recruiter)',
      approvedAt: new Date(Date.now() - 3600000).toISOString(),
      method: 'explicit_ui_approval',
    },
    externalConfirmation: {
      provider: 'Google Calendar',
      reference: 'cal_event_8472bd',
      confirmedAt: new Date(Date.now() - 3540000).toISOString(),
    },
    businessOutcomeId: `boc_${executionId.slice(-8)}`,
    events: [
      { timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'INTAKE_RECEIVED', description: 'Candidate intake received via WhatsApp' },
      { timestamp: new Date(Date.now() - 6900000).toISOString(), type: 'EVIDENCE_BUILT', description: 'Evidence collected — 94.2% JD match' },
      { timestamp: new Date(Date.now() - 6600000).toISOString(), type: 'MODEL_DECISION', description: 'Gemini-2.0-flash recommended interview scheduling' },
      { timestamp: new Date(Date.now() - 3700000).toISOString(), type: 'APPROVAL_PENDING', description: 'Awaiting recruiter approval' },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'APPROVAL_GRANTED', description: 'Approved by Priya Sharma' },
      { timestamp: new Date(Date.now() - 3550000).toISOString(), type: 'EXECUTION_DISPATCHED', description: 'Calendar invite dispatched to Google Calendar' },
      { timestamp: new Date(Date.now() - 3540000).toISOString(), type: 'EXECUTION_CONFIRMED', description: 'Google Calendar confirmed — cal_event_8472bd' },
      { timestamp: new Date(Date.now() - 3530000).toISOString(), type: 'OUTCOME_RECORDED', description: 'BusinessOutcomeId recorded to EventStore' },
    ],
    retryCount: 0,
  };
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExecutionInspectPage() {
  const { executionId } = useParams<{ executionId: string }>();
  const navigate = useNavigate();
  const [userTier, setUserTier] = useState<InspectionTier>('recruiter');
  const [execution, setExecution] = useState<ExecutionRecord | null>(null);
  const [expandedTier, setExpandedTier] = useState<InspectionTier>('recruiter');

  useEffect(() => {
    resolveUserTier().then(t => {
      setUserTier(t);
      setExpandedTier(t);
    });
  }, []);

  useEffect(() => {
    if (!executionId) return;
    // Simulate async EventStore projection resolution
    const t = setTimeout(() => setExecution(resolveExecution(executionId)), 150);
    return () => clearTimeout(t);
  }, [executionId]);

  if (!execution) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <Activity size={24} className="text-indigo-400 animate-pulse" />
          <span className="text-zinc-400 text-sm">Resolving execution trace…</span>
        </div>
      </div>
    );
  }

  const statusColor = execution.status === 'COMPLETED'
    ? 'text-emerald-400' : execution.status === 'FAILED'
    ? 'text-red-400' : 'text-amber-400';

  return (
    <div className="flex h-full w-full flex-col bg-[#09090b] text-white overflow-auto">

      {/* Header */}
      <div className="h-14 border-b border-zinc-800/60 flex items-center px-6 gap-4 shrink-0 bg-zinc-950/50 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <div className="w-px h-4 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-indigo-400" />
          <span className="text-sm font-semibold text-zinc-200">Execution Trace</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 ${statusColor}`}>
            {execution.status.replace('_', ' ')}
          </span>
          {/* Tier switcher — strictly restricted to admin role */}
          {userTier === 'admin' && (
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1">
              {(['recruiter', 'manager', 'admin'] as InspectionTier[]).map(t => (
                <button
                  key={t}
                  onClick={() => setExpandedTier(t)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold capitalize transition-colors ${
                    expandedTier === t ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">

        {/* ── TIER 1: Recruiter View ─────────────────────────────────────────── */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold text-white">{execution.outcomeLabel}</div>
              <div className="text-xs text-zinc-400 mt-0.5">
                Approved by {execution.approval.approvedBy.split(' (')[0]} · {fmtTime(execution.approval.approvedAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock size={13} className="text-emerald-400" />
              <span>{execution.timeSavedMinutes} min saved</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <User size={13} className="text-indigo-400" />
              <span>{execution.entityLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Shield size={13} className="text-zinc-500" />
              <span>Human approved</span>
            </div>
          </div>
        </div>

        {/* ── TIER 2: Manager View ──────────────────────────────────────────── */}
        {(expandedTier === 'manager' || expandedTier === 'admin') && (
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Manager View</span>
            </div>

            {/* Stage pipeline */}
            <div className="flex items-center gap-2 flex-wrap">
              {['Candidate Qualified', 'Evidence Built', 'AI Recommended', 'Recruiter Approved', 'Interview Scheduled'].map((stage, i, arr) => (
                <React.Fragment key={stage}>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">{stage}</span>
                  {i < arr.length - 1 && <ChevronRight size={12} className="text-zinc-600" />}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800/40 rounded-xl p-4">
                <div className="text-xs text-zinc-500 mb-1">Time Saved</div>
                <div className="text-xl font-bold text-emerald-400">{execution.timeSavedMinutes} min</div>
              </div>
              <div className="bg-zinc-800/40 rounded-xl p-4">
                <div className="text-xs text-zinc-500 mb-1">AI Confidence</div>
                <div className="text-xl font-bold text-indigo-400">{(execution.evidence.confidence * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-zinc-800/40 rounded-xl p-4">
                <div className="text-xs text-zinc-500 mb-1">Approval Method</div>
                <div className="text-sm font-semibold text-white">Explicit UI</div>
              </div>
            </div>

            <div className="bg-zinc-800/30 rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-1.5">Evidence Summary</div>
              <div className="text-sm text-zinc-200">{execution.evidence.summary}</div>
            </div>
          </div>
        )}

        {/* ── TIER 3: Admin / Inspector View ───────────────────────────────── */}
        {expandedTier === 'admin' && (
          <div className="bg-zinc-900/30 border border-amber-500/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Inspector View</span>
            </div>

            {/* IDs */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {[
                { label: 'Workflow Execution ID', value: execution.workflowExecutionId },
                { label: 'Task Execution ID', value: execution.taskExecutionId },
                { label: 'Idempotency Key', value: execution.idempotencyKey },
                { label: 'Business Outcome ID', value: execution.businessOutcomeId },
                { label: 'Customer Workflow ID', value: execution.customerWorkflowId },
                { label: 'Tenant', value: execution.tenantId },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-800/40 rounded-xl p-3">
                  <div className="text-zinc-500 mb-1 flex items-center gap-1">
                    <Hash size={10} />
                    {label}
                  </div>
                  <div className="text-zinc-200 truncate">{value}</div>
                </div>
              ))}
            </div>

            {/* Model Decision */}
            <div className="bg-zinc-800/30 rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                <Zap size={11} />
                Model Decision
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div><span className="text-zinc-500">Model: </span><span className="text-zinc-200">{execution.modelDecision.model}</span></div>
                <div><span className="text-zinc-500">Policy: </span><span className="text-zinc-200">{execution.modelDecision.policyVersion}</span></div>
                <div><span className="text-zinc-500">Decision ID: </span><span className="text-zinc-200">{execution.modelDecision.decisionId}</span></div>
                <div><span className="text-zinc-500">Approval Required: </span><span className={execution.modelDecision.approvalRequired ? 'text-amber-400' : 'text-emerald-400'}>{String(execution.modelDecision.approvalRequired)}</span></div>
              </div>
            </div>

            {/* External Confirmation */}
            <div className="bg-zinc-800/30 rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                <FileText size={11} />
                External Confirmation
              </div>
              <div className="text-xs font-mono text-zinc-200 space-y-1">
                <div><span className="text-zinc-500">Provider: </span>{execution.externalConfirmation.provider}</div>
                <div><span className="text-zinc-500">Reference: </span>{execution.externalConfirmation.reference}</div>
                <div><span className="text-zinc-500">Confirmed At: </span>{fmtTime(execution.externalConfirmation.confirmedAt)}</div>
              </div>
            </div>

            {/* Event Log */}
            <div>
              <div className="text-xs text-zinc-500 mb-3 flex items-center gap-1.5">
                <Activity size={11} />
                Event Log ({execution.events.length} events · {execution.retryCount} retries)
              </div>
              <div className="space-y-2">
                {execution.events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="text-zinc-600 font-mono shrink-0 w-12">{fmtTime(ev.timestamp)}</span>
                    <span className="font-mono text-indigo-400 shrink-0">{ev.type}</span>
                    <span className="text-zinc-400">{ev.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

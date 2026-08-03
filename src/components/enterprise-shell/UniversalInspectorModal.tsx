import React from 'react';
import {
  X, ShieldAlert, CheckCircle2, AlertTriangle, Activity, Clock, Zap, TrendingUp, DollarSign,
  FileText, ExternalLink, HelpCircle, Layers, Users, GitBranch, ArrowRight, Award, Lock, Search
} from 'lucide-react';

export type InspectorModalType =
  | 'kpi_drilldown'
  | 'confidence_inspector'
  | 'status_inspector'
  | 'risk_explorer'
  | 'action_executor'
  | 'pipeline_inspector'
  | 'plugin_inspector'
  | 'audit_inspector';

export interface InspectorPayload {
  title: string;
  subtitle?: string;
  type: InspectorModalType;
  data?: Record<string, any>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payload: InspectorPayload | null;
  onExecuteAction?: (actionId: string) => void;
}

export const UniversalInspectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  payload,
  onExecuteAction,
}) => {
  if (!isOpen || !payload) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">{payload.title}</h2>
            </div>
            {payload.subtitle && <p className="text-xs text-slate-400 mt-0.5">{payload.subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          
          {/* KPI Drilldown View */}
          {payload.type === 'kpi_drilldown' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-indigo-900">Total Value Impact</div>
                  <div className="text-2xl font-bold text-indigo-700 font-mono">{payload.data?.value || '$214,000 USD'}</div>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
                  +18.4% Efficiency Gain
                </span>
              </div>

              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Breakdown by Department</h4>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">Healthcare OS (Prescription Review)</div>
                    <div className="text-[10px] text-slate-500">142 Missions Automated · 0 Clinical Errors</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">1,820 hrs saved</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">Finance OS (Invoice Matching)</div>
                    <div className="text-[10px] text-slate-500">98 SAP Disbursals · PO Matching Active</div>
                  </div>
                  <span className="font-mono font-bold text-indigo-600">1,460 hrs saved</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">RecruitmentOS (Candidate Screening)</div>
                    <div className="text-[10px] text-slate-500">410 Resumes Screened · 40% Faster Hire</div>
                  </div>
                  <span className="font-mono font-bold text-violet-600">1,000 hrs saved</span>
                </div>
              </div>
            </div>
          )}

          {/* Confidence Inspector View */}
          {payload.type === 'confidence_inspector' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-emerald-900">Confidence Calibration Score</div>
                  <div className="text-2xl font-bold text-emerald-700 font-mono">{payload.data?.score || '98%'}</div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  High Evidence Confidence
                </span>
              </div>

              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Calibrated Factors & Policy Signals</h4>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>1. Policy Compliance Check</span>
                    <span className="text-emerald-600 font-mono">100% Pass</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Verified against HR Executive Salary Policy SOP-2026-A.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>2. Vector RAG Provenance</span>
                    <span className="text-indigo-600 font-mono">96% Similarity</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Matched 4 dense embedding vectors in Knowledge Fabric vector store.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>3. Enterprise Graph Context</span>
                    <span className="text-emerald-600 font-mono">Verified Node Edge</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Node path: Candidate (Deepu Kumar) ➔ BelongsTo ➔ Engineering Team.</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Inspector & SLA Countdown View */}
          {payload.type === 'status_inspector' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-amber-900">Current Mission Status</div>
                  <div className="text-lg font-bold text-amber-700 font-mono">{payload.data?.status || 'PENDING_APPROVAL'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-amber-800 font-bold">SLA Countdown</div>
                  <div className="text-sm font-mono font-bold text-amber-900">47h 52m remaining</div>
                </div>
              </div>

              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Approval Escalation History</h4>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">Step 1: Automated Policy Evaluation</div>
                    <div className="text-[10px] text-slate-500">Triggered by PolicyEvaluationPlugin · 23ms ago</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Completed</span>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">Step 2: Human Executive Sign-Off</div>
                    <div className="text-[10px] text-slate-500">Pending Reviewer: Arshid Hussain Wani (Operations Lead)</div>
                  </div>
                  <button
                    onClick={() => {
                      onExecuteAction?.('approve');
                      onClose();
                    }}
                    className="px-3 py-1 bg-amber-600 text-white font-bold rounded hover:bg-amber-700 transition-colors shadow-2xs text-[11px]"
                  >
                    Execute Approval
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Risk Explorer View */}
          {payload.type === 'risk_explorer' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-xs font-semibold text-rose-900">Risk Assessment Score</div>
                  <div className="text-2xl font-bold text-rose-700 font-mono">{payload.data?.score || '72% Critical'}</div>
                </div>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
                  1 Critical Alert Triggered
                </span>
              </div>

              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Risk Factors & Mitigation Plan</h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Clinical Risk: Metformin + Contrast Dye Interaction</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Administering Metformin within 48 hours of IV iodinated contrast dye creates severe risk of lactic acidosis.
                </p>
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] font-medium">
                  Mitigation Action: Temporary 48-hour Metformin hold ordered & care plan updated automatically.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-500 text-[11px]">
          <span>Trace ID: <span className="font-mono text-slate-700">{payload.data?.traceId || 'tr_99182301'}</span></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

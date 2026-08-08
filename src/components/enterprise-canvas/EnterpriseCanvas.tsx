import React, { useState } from 'react';
import { ContextBar } from './ContextBar';
import { MissionExecutionContext } from '../../core/types';
import { WorkspaceViewport } from '../workspace/adapters/WorkspaceViewport';
import { MissionSummaryCard } from './MissionSummaryCard';
import {
  Target, FileText, CheckCircle, Activity, Loader2,
  ChevronRight, AlertTriangle, ChevronDown, ChevronUp, Info,
  BarChart2, GitBranch, Cpu, Clock, UploadCloud
} from 'lucide-react';

interface Props {
  missionContext: MissionExecutionContext | null;
  mode: 'Review' | 'Decision' | 'Execution' | 'Audit';
  isProcessing?: boolean;
  onUploadClick?: () => void;
  onBackToHome?: () => void;
}

// ─── Interactive Pipeline Step Detail ─────────────────────────────────────────
interface PipelineStep {
  layer: string;
  status: 'Completed' | 'Waiting' | 'Pending' | 'Running';
  plugin?: string;
  duration?: string;
  output?: string;
}

function getPipelineSteps(missionContext: MissionExecutionContext | null): PipelineStep[] {
  return [
    { layer: 'Observation', status: 'Completed', plugin: 'ObservationEngine', duration: '2ms', output: 'ArtifactObserved event published' },
    { layer: 'Event', status: 'Completed', plugin: 'EnterpriseEventBus', duration: '1ms', output: 'Routed to 4 subscribers' },
    { layer: 'Projection', status: 'Completed', plugin: 'GraphProjection', duration: '8ms', output: 'Enterprise graph updated' },
    { layer: 'Inference', status: 'Completed', plugin: 'MissionRecommendationPlugin', duration: '18ms', output: `${missionContext?.recommendations?.length ?? 0} hypotheses generated` },
    { layer: 'Mission', status: 'Completed', plugin: 'MissionIntelligence', duration: '22ms', output: missionContext?.mission ?? 'Mission created' },
    { layer: 'Approval', status: 'Waiting', plugin: 'HumanApprovalGate', duration: '—', output: 'Waiting for human decision' },
    { layer: 'Execution', status: 'Pending', plugin: 'ExecutionIntelligence', duration: '—', output: 'Pending approval' },
    { layer: 'Audit', status: 'Pending', plugin: 'AuditProjection', duration: '—', output: 'Pending execution' },
    { layer: 'State', status: 'Pending', plugin: 'EnterpriseStateEngine', duration: '—', output: 'Pending' },
  ];
}

export const EnterpriseCanvas: React.FC<Props> = ({ missionContext, mode, isProcessing, onUploadClick, onBackToHome }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showTechnicalPipeline, setShowTechnicalPipeline] = useState(false);

  // ─── Processing Loading State ─────────────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        <ContextBar breadcrumbs={['Enterprise', 'Processing Work...']} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-sm font-bold text-slate-800 mb-6">Aligning Enterprise Context</h3>
            <div className="flex items-center w-full justify-between gap-2 max-w-xl opacity-75">
              {[
                { layer: 'Event Recorded', status: 'Completed' as const },
                { layer: 'Projection Updated', status: 'Completed' as const },
                { layer: 'Enterprise Graph', status: 'Running' as const },
                { layer: 'Context Resolution', status: 'Pending' as const },
                { layer: 'Mission Created', status: 'Pending' as const },
              ].map((step, idx, arr) => (
                <React.Fragment key={step.layer}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-colors ${
                      step.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                      step.status === 'Running' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
                      'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      {step.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> :
                       step.status === 'Running' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                       idx + 1}
                    </div>
                    <div className="text-[9px] font-bold text-slate-700 text-center">{step.layer}</div>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className={`flex-1 h-px ${step.status === 'Completed' ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Idle State ───────────────────────────────────────────────────────────
  if (!missionContext) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        <ContextBar breadcrumbs={['Docs Workspace', 'Upload Document']} onBackToHome={onBackToHome} />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
          <div
            onClick={onUploadClick}
            className="w-full max-w-xl bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-3xl p-10 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center space-y-5 group cursor-pointer"
          >
            <div className="w-16 h-16 bg-indigo-50 group-hover:bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 transition-colors">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upload & Analyze Document</h2>
              <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                Drag & drop your PDF, Word document, Resume, Medical Report, Contract, or Invoice here to perform instant AI Document Intelligence.
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onUploadClick?.(); }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select File from Computer</span>
            </button>
            <div className="text-[11px] text-slate-400 font-mono pt-2">
              Supports PDF, DOCX, TXT, CSV, JSON, PNG, JPG (Up to 50MB)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Breadcrumbs ──────────────────────────────────────────────────────────
  const docTitle = missionContext.mission.replace(/^Analyze and Structure\s*/i, '');
  const breadcrumbs = [
    'Docs Workspace',
    'Document Review',
    docTitle,
  ];

  const mockItem = {
    id: missionContext.id,
    sourceUri: (missionContext.trigger?.payload as any)?.sourceUri || 'Document',
    typeHint: 'pdf' as const,
    rawFile: (missionContext.trigger?.payload as any)?.rawFile || new File([], 'Document.pdf'),
  };

  const pipelineSteps = getPipelineSteps(missionContext);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden h-full">
      <ContextBar breadcrumbs={breadcrumbs} onBackToHome={onBackToHome} />

      <div className="flex-1 overflow-y-auto flex flex-col relative">

        {/* ─── REVIEW MODE ─────────────────────────────────────────────────── */}
        {mode === 'Review' && (
          <div className="h-full p-4">
            <div className="h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <WorkspaceViewport item={mockItem} />
            </div>
          </div>
        )}

        {/* ─── DECISION / WORKSPACE MODE ────────────────────────────────────── */}
        {mode === 'Decision' && (
          <div className="max-w-4xl mx-auto w-full p-6 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* 1. CANDIDATE / DOCUMENT SUMMARY CARD */}
            <MissionSummaryCard missionContext={missionContext} />

            {/* 2. REAL DOCUMENT READER PANE (Full Height, Readable, No Blur Overlays) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Document Reader & Original File Content</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {docTitle}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200 min-h-[500px]">
                <WorkspaceViewport item={mockItem} />
              </div>
            </div>
          </div>
        )}

        {/* ─── AUDIT MODE ──────────────────────────────────────────────────── */}
        {mode === 'Audit' && (
          <div className="max-w-4xl mx-auto w-full p-8 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Execution Audit Trail</h2>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {((missionContext.auditTrail as any[]) || []).map((audit: any, idx: number) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-indigo-50 text-slate-500 group-[.is-active]:text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{audit.label}</h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{audit.detail}</p>
                  </div>
                </div>
              ))}
              {(!(missionContext.auditTrail as any[])?.length) && (
                <div className="text-center text-slate-400 text-sm py-8">No audit trail available for this mission.</div>
              )}
            </div>
          </div>
        )}

        {/* ─── EXECUTION MODE ──────────────────────────────────────────────── */}
        {mode === 'Execution' && (
          <div className="max-w-3xl mx-auto w-full p-8 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">Awaiting Human Approval</h3>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  This mission is in <strong>PENDING_APPROVAL</strong> state. Switch to the Decision tab to review and approve the recommended actions before execution can begin.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Execution Plan</h3>
              {missionContext.executionPlan?.length > 0 ? (
                <div className="space-y-2">
                  {missionContext.executionPlan.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{idx + 1}</div>
                      <span className="text-xs font-semibold text-slate-700">{step.action}</span>
                      <span className="ml-auto text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">{step.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Execution plan will be generated once mission is approved.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Rich Decision Card Component ─────────────────────────────────────────────
interface RichDecisionCardProps {
  rec: any;
}

const RichDecisionCard: React.FC<RichDecisionCardProps> = ({ rec }) => {
  const [expanded, setExpanded] = useState(false);
  const [showConfidenceBreakdown, setShowConfidenceBreakdown] = useState(false);
  const [showAltActions, setShowAltActions] = useState(false);

  const riskLevel: 'critical' | 'high' | 'medium' | 'low' = rec.riskLevel || 'low';
  const confidence: number = rec.confidence || 84;

  const riskConfig = {
    critical: { border: 'border-red-300', headerBg: 'bg-red-50/50', badge: 'bg-red-100 text-red-700 border-red-200', badgeLabel: 'CRITICAL', actionBg: 'bg-red-600 hover:bg-red-700', actionLabel: 'Escalate', rejectLabel: 'Override' },
    high:     { border: 'border-amber-200', headerBg: 'bg-amber-50/30', badge: 'bg-amber-100 text-amber-700 border-amber-200', badgeLabel: 'HIGH', actionBg: 'bg-slate-900 hover:bg-amber-700', actionLabel: 'Approve', rejectLabel: 'Defer' },
    medium:   { border: 'border-slate-200', headerBg: '', badge: 'bg-blue-50 text-blue-700 border-blue-200', badgeLabel: 'MEDIUM', actionBg: 'bg-slate-900 hover:bg-indigo-700', actionLabel: 'Approve', rejectLabel: 'Reject' },
    low:      { border: 'border-slate-200', headerBg: '', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', badgeLabel: 'LOW', actionBg: 'bg-slate-900 hover:bg-indigo-700', actionLabel: 'Approve', rejectLabel: 'Reject' },
  }[riskLevel];

  const policyPoints = [
    rec.reason.includes('LOW') || rec.reason.includes('within') || rec.reason.includes('policy') ? '✓ Within policy bounds' : null,
    rec.reason.includes('precedent') || rec.reason.includes('historical') || rec.reason.includes('prior') ? '✓ Historical precedent confirmed' : null,
    rec.reason.includes('KYC') || rec.reason.includes('verified') || rec.reason.includes('validated') || rec.reason.includes('compliant') ? '✓ Entity verified' : null,
    rec.reason.includes('87%') || rec.reason.includes('92/100') || rec.reason.includes('match') || rec.reason.includes('Score') ? '✓ Strong match score' : null,
    rec.reason.includes('insurance') || rec.reason.includes('pre-auth') || rec.reason.includes('authorized') ? '✓ Insurance pre-authorized' : null,
    rec.reason.includes('band') || rec.reason.includes('expectation') ? '✓ Compensation within band' : null,
  ].filter(Boolean);

  const confidenceBreakdown = [
    { factor: 'Document Parsing & Extraction', score: '+25%' },
    { factor: 'Enterprise Policy Match', score: '+21%' },
    { factor: 'Historical Precedent Match', score: '+20%' },
    { factor: 'Graph Entity Alignment', score: '+18%' },
  ];

  return (
    <div className={`rounded-xl border ${riskConfig.border} bg-white overflow-hidden shadow-sm`}>
      <div className={`flex items-start gap-4 p-4 ${riskConfig.headerBg}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${riskConfig.badge}`}>
              {riskConfig.badgeLabel} RISK
            </span>
            {rec.plugin && (
              <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {rec.plugin}
              </span>
            )}
            
            {/* Interactive Confidence Score Breakdown Pill */}
            <button
              onClick={() => setShowConfidenceBreakdown(!showConfidenceBreakdown)}
              className="text-[9px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-200 transition-colors flex items-center gap-1"
              title="Click to view confidence score breakdown"
            >
              <span>{confidence}% conf.</span>
              <Info className="w-2.5 h-2.5 text-slate-400" />
            </button>
          </div>

          {/* Confidence Score Breakdown Popup Panel */}
          {showConfidenceBreakdown && (
            <div className="mb-3 bg-indigo-950 text-indigo-100 rounded-xl p-3 border border-indigo-800 animate-in slide-in-from-top-1 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center justify-between">
                <span>Confidence Score Weighting Breakdown ({confidence}%)</span>
                <button onClick={() => setShowConfidenceBreakdown(false)} className="text-indigo-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {confidenceBreakdown.map((item, idx) => (
                  <div key={idx} className="bg-indigo-900/60 border border-indigo-700/50 rounded-lg p-2 flex items-center justify-between text-[10px]">
                    <span className="text-indigo-200">{item.factor}:</span>
                    <span className="font-mono font-bold text-emerald-400">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-sm font-bold text-slate-900">{rec.action}</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rec.reason}</p>
          {policyPoints.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {policyPoints.map((pt, i) => (
                <span key={i} className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">{pt}</span>
              ))}
            </div>
          )}
          {rec.missingEvidence && rec.missingEvidence.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 w-fit">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Needs: {rec.missingEvidence.join(' · ')}
            </div>
          )}
        </div>

        {/* Action Buttons & Alternative Dropdown */}
        <div className="flex flex-col gap-2 min-w-[120px] shrink-0 relative">
          <button className={`px-4 py-2 ${riskConfig.actionBg} text-white rounded-lg text-xs font-bold shadow transition-colors flex justify-center items-center gap-1.5`}>
            {riskConfig.actionLabel} <ChevronRight className="w-3 h-3" />
          </button>
          
          <div className="flex items-center gap-1">
            <button className="flex-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition-colors">
              {riskConfig.rejectLabel}
            </button>
            <button
              onClick={() => setShowAltActions(!showAltActions)}
              className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs transition-colors"
              title="More alternative actions"
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Alternative Actions Dropdown Menu */}
          {showAltActions && (
            <div className="absolute right-0 top-16 z-20 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 text-xs font-semibold text-slate-700 animate-in fade-in duration-100">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Alternative Actions</div>
              <button onClick={() => setShowAltActions(false)} className="w-full text-left px-2 py-1.5 hover:bg-indigo-50 rounded hover:text-indigo-600">⚡ Ask AI Assistant</button>
              <button onClick={() => setShowAltActions(false)} className="w-full text-left px-2 py-1.5 hover:bg-indigo-50 rounded hover:text-indigo-600">👤 Assign Domain Expert</button>
              <button onClick={() => setShowAltActions(false)} className="w-full text-left px-2 py-1.5 hover:bg-indigo-50 rounded hover:text-indigo-600">🔄 Reclassify Document</button>
              <button onClick={() => setShowAltActions(false)} className="w-full text-left px-2 py-1.5 hover:bg-amber-50 rounded hover:text-amber-700">⏳ Defer Decision</button>
              <button onClick={() => setShowAltActions(false)} className="w-full text-left px-2 py-1.5 hover:bg-rose-50 rounded hover:text-rose-600">🚨 Escalate to Lead</button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 hover:bg-slate-100 transition-colors text-[10px] text-slate-500 font-semibold"
      >
        <div className="flex items-center gap-1.5">
          <BarChart2 className="w-3 h-3 text-slate-400" />
          Why · Impact · Risk Score · Alternative
        </div>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 grid grid-cols-3 gap-4 animate-in slide-in-from-top-1 duration-150">
          <div>
            <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Impact</div>
            <div className="text-[10px] text-slate-600 leading-snug">
              {riskLevel === 'critical' ? 'Patient safety risk — immediate clinical escalation required' :
               rec.reason.includes('contract') || rec.reason.includes('Addendum') ? 'Contract signed → vendor active' :
               rec.reason.includes('ATS') || rec.reason.includes('hire') ? 'Candidate advances to next round' :
               rec.reason.includes('lab') || rec.reason.includes('Test') ? 'Diagnostics clarity within 48h' :
               'Document processed and archived'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Risk Score</div>
            <div className={`text-xl font-black ${
              riskLevel === 'critical' ? 'text-red-600' : riskLevel === 'high' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {riskLevel === 'critical' ? '72%' : riskLevel === 'high' ? '38%' : riskLevel === 'medium' ? '24%' : '18%'}
            </div>
            <div className={`text-[9px] font-bold ${
              riskLevel === 'critical' ? 'text-red-500' : riskLevel === 'high' ? 'text-amber-500' : 'text-emerald-500'
            }`}>{riskLevel.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Alternative</div>
            <div className="text-[10px] text-slate-600 leading-snug">
              {riskLevel === 'critical' ? 'Override with specialist sign-off only' :
               riskLevel === 'high' ? 'Defer pending additional evidence' :
               'Request manual domain expert review'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




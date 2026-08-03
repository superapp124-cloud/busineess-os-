import React, { useState } from 'react';
import { Activity, CheckCircle, ChevronRight, ClipboardCheck, Clock3, FileSearch, Loader2, Shield, Sparkles, AlertTriangle } from 'lucide-react';
import { MissionAuditEntry, Recommendation, MissionExecutionContext } from '../../core/types';
import { EnterpriseEventBus } from '../../core/runtime/EnterpriseEventBus';

interface Props {
  missionContext: MissionExecutionContext | null;
  isProcessing: boolean;
}

export const CERWorkSessionPane: React.FC<Props> = ({ missionContext, isProcessing }) => {
  const [approved, setApproved] = useState<number | null>(null);
  const [auditEntries, setAuditEntries] = useState<MissionAuditEntry[]>([]);

  const handleApprove = async (recommendation: Recommendation, index: number) => {
    setApproved(index);
    await EnterpriseEventBus.getInstance().publish({
      id: `evt_approve_${Date.now()}`,
      type: 'RecommendationApproved',
      timestamp: new Date().toISOString(),
      payload: recommendation,
      source: 'Workspace review'
    });
    setAuditEntries(previous => [{
      id: `audit_approved_${Date.now()}`,
      label: 'Review confirmed',
      detail: `${recommendation.action || 'Recommendation'} was approved from this mission.`,
      timestamp: new Date().toISOString()
    }, ...previous]);
  };

  if (isProcessing) {
    return <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center"><Loader2 className="w-6 h-6 text-indigo-600 animate-spin" /></div>
      <div><h3 className="text-sm font-bold text-slate-800">Preparing mission</h3><p className="text-xs text-slate-500 mt-1">Checking context, policy, and possible next steps.</p></div>
    </div>;
  }

  if (!missionContext) {
    return <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400"><FileSearch className="w-9 h-9 mb-3 opacity-30" /><p className="text-xs font-semibold">Select an artifact to start a mission.</p></div>;
  }

  const audits = [...auditEntries, ...(missionContext.auditTrail || [])];
  const reviewRequired = missionContext.actionRequired !== 'AI Completed';

  return <div className="flex flex-col gap-4 pb-5">
    <section className="rounded-2xl bg-slate-950 text-white p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20">{reviewRequired ? 'Review required' : 'Mission complete'}</span><span className="text-[10px] text-slate-400">Mission</span></div>
      <h2 className="mt-3 text-base leading-snug font-bold">{missionContext.mission}</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-300">{reviewRequired ? 'Nothing will be filed or sent until you confirm the next step.' : 'The approved actions have been recorded.'}</p>
      <div className="grid grid-cols-2 gap-3 mt-5 border-t border-white/10 pt-4">
        <div><div className="text-[10px] uppercase tracking-wide text-slate-500">Time to act</div><div className="mt-1 text-sm font-bold text-indigo-300">{missionContext.recommendations[0]?.implementationTime || 'Review now'}</div></div>
        <div><div className="text-[10px] uppercase tracking-wide text-slate-500">Outcome</div><div className="mt-1 text-sm font-bold text-emerald-300">{missionContext.businessOutcomes.financialValueCreated}</div></div>
      </div>
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-600" /><h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">What CHATR found</h3></div>
      <div className="mt-3 space-y-3">{(missionContext.findings || []).map(finding => <div key={finding.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3"><div className="flex items-start justify-between gap-2"><p className="text-xs font-bold text-slate-800">{finding.title}</p><span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${finding.confidence === 'High' ? 'bg-emerald-100 text-emerald-700' : finding.confidence === 'Needs review' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'}`}>{finding.confidence}</span></div><p className="mt-1 text-xs leading-relaxed text-slate-600">{finding.detail}</p><p className="mt-2 text-[10px] text-slate-400">Source: {finding.source}</p></div>)}</div>
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-slate-600" /><h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Context and evidence</h3></div>
      <div className="mt-3 space-y-2">{(missionContext.contextSummary || []).map(context => <div key={context} className="flex gap-2 text-xs text-slate-600"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{context}</div>)}</div>
    </section>

    <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
      <div className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-indigo-600" /><h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Recommended next step</h3></div>
      {missionContext.recommendations.map((recommendation, index) => <div key={recommendation.id || index} className="mt-3"><p className="text-sm font-bold text-slate-900">{recommendation.action}</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{recommendation.reason}</p>{recommendation.missingEvidence && recommendation.missingEvidence.length > 0 && <div className="mt-3 flex gap-2 text-xs text-amber-800"><AlertTriangle className="w-4 h-4 shrink-0" />Needs: {recommendation.missingEvidence.join(', ')}</div>}{approved === index ? <div className="mt-4 rounded-lg bg-emerald-100 text-emerald-800 py-2.5 text-xs font-bold flex justify-center gap-2"><CheckCircle className="w-4 h-4" />Recorded in mission audit</div> : <button onClick={() => handleApprove(recommendation, index)} className="mt-4 w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-bold flex items-center justify-center gap-2">{missionContext.actionRequired === 'Human Action Required' ? 'Mark reviewed' : 'Approve and continue'}<ChevronRight className="w-4 h-4" /></button>}</div>)}
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-slate-500" /><h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Mission audit</h3></div>
      <div className="mt-3 space-y-3">{audits.map(entry => <div key={entry.id} className="flex gap-2"><Activity className="w-3.5 h-3.5 mt-0.5 text-indigo-500 shrink-0" /><div><p className="text-xs font-semibold text-slate-700">{entry.label}</p><p className="text-[11px] leading-relaxed text-slate-500">{entry.detail}</p></div></div>)}</div>
    </section>
  </div>;
};

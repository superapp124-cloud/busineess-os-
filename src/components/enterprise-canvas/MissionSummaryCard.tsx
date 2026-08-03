import React, { useState } from 'react';
import { MissionExecutionContext } from '../../core/types';
import { UniversalInspectorModal } from '../enterprise-shell/UniversalInspectorModal';
import {
  Target, Clock, TrendingUp, CheckCircle, AlertTriangle,
  ChevronRight, FileText, Shield, Zap, GitBranch, ChevronDown,
  ChevronUp, Brain, Info, Heart, Users, Briefcase, Activity,
  Stethoscope, FlaskConical, UserCheck, Award
} from 'lucide-react';

interface Props {
  missionContext: MissionExecutionContext;
}

// ─── Domain Detection ─────────────────────────────────────────────────────────
type DomainKey = 'healthcare' | 'talent' | 'legal' | 'finance' | 'insurance' | 'general';

function detectDomain(mc: MissionExecutionContext): DomainKey {
  const text = mc.mission.toLowerCase();
  if (text.includes('diabetes') || text.includes('prescription') || text.includes('pathology') ||
      text.includes('clinical') || text.includes('diagnostic') || text.includes('medication') ||
      text.includes('care plan') || text.includes('evaluation') && text.includes('drug'))
    return 'healthcare';
  if (text.includes('candidate') || text.includes('hire') || text.includes('ats') ||
      text.includes('resume') || text.includes('interview') || text.includes('talent') ||
      text.includes('recruitment') || text.includes('engineer') || text.includes('platform engineer'))
    return 'talent';
  if (text.includes('agreement') || text.includes('contract') || text.includes('signing'))
    return 'legal';
  if (text.includes('financial') || text.includes('tax') || text.includes('invoice'))
    return 'finance';
  if (text.includes('insurance') || text.includes('motor') || text.includes('renew'))
    return 'insurance';
  return 'general';
}

const DOMAIN_CONFIG: Record<DomainKey, {
  label: string;
  badgeColor: string;
  headerFrom: string;
  headerTo: string;
  icon: React.ReactNode;
  priorityLabel: string;
  priorityColor: string;
}> = {
  healthcare: {
    label: 'Healthcare',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    headerFrom: 'from-rose-950',
    headerTo: 'to-slate-900',
    icon: <Stethoscope className="w-5 h-5 text-rose-300" />,
    priorityLabel: 'CRITICAL ALERTS',
    priorityColor: 'text-red-400 bg-red-400/10 border-red-400/20',
  },
  talent: {
    label: 'Talent · ATS',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    headerFrom: 'from-emerald-950',
    headerTo: 'to-slate-900',
    icon: <Users className="w-5 h-5 text-emerald-300" />,
    priorityLabel: 'STRONG HIRE',
    priorityColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  legal: {
    label: 'Legal',
    badgeColor: 'bg-violet-100 text-violet-700 border-violet-200',
    headerFrom: 'from-violet-950',
    headerTo: 'to-slate-900',
    icon: <Briefcase className="w-5 h-5 text-violet-300" />,
    priorityLabel: 'HIGH PRIORITY',
    priorityColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  finance: {
    label: 'Finance',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    headerFrom: 'from-amber-950',
    headerTo: 'to-slate-900',
    icon: <Award className="w-5 h-5 text-amber-300" />,
    priorityLabel: 'URGENT — DEADLINE',
    priorityColor: 'text-red-400 bg-red-400/10 border-red-400/20',
  },
  insurance: {
    label: 'Operations',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    headerFrom: 'from-blue-950',
    headerTo: 'to-slate-900',
    icon: <Shield className="w-5 h-5 text-blue-300" />,
    priorityLabel: 'HIGH PRIORITY',
    priorityColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  general: {
    label: 'General',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    headerFrom: 'from-slate-900',
    headerTo: 'to-slate-800',
    icon: <FileText className="w-5 h-5 text-slate-300" />,
    priorityLabel: 'NORMAL',
    priorityColor: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  },
};

function getConfidence(mc: MissionExecutionContext): number {
  const topRec = mc.recommendations?.[0] as any;
  if (topRec?.confidence) return topRec.confidence;
  const domain = detectDomain(mc);
  const map: Record<DomainKey, number> = { healthcare: 94, talent: 92, legal: 96, finance: 92, insurance: 90, general: 84 };
  return map[domain];
}

function getEstimatedTime(mc: MissionExecutionContext): string {
  const domain = detectDomain(mc);
  const map: Record<DomainKey, string> = {
    healthcare: '5 min', talent: '4 min', legal: '3 min',
    finance: '2 min', insurance: '2 min', general: '5 min',
  };
  return map[domain];
}

function getImpact(mc: MissionExecutionContext): string {
  const domain = detectDomain(mc);
  const map: Record<DomainKey, string> = {
    healthcare: 'Drug risk prevented · Care plan active',
    talent: 'Candidate shortlisted · Interview booked',
    legal: 'Contract ready for signing',
    finance: 'ERP sync unlocked · TDS reconciled',
    insurance: 'Policy renewed · ₹6,100 saved',
    general: 'Document classified',
  };
  return map[domain];
}

function getExplainabilityChain(mc: MissionExecutionContext, domain: DomainKey) {
  if (domain === 'healthcare') return [
    { label: 'Detected', value: 'T2DM Prescription — 4 medicines', icon: <FileText className="w-3 h-3 text-rose-400" /> },
    { label: 'Drug Alert', value: 'Metformin + Contrast — HIGH RISK', icon: <AlertTriangle className="w-3 h-3 text-red-400" /> },
    { label: 'Tests Recommended', value: '8-panel diabetic workup', icon: <FlaskConical className="w-3 h-3 text-blue-400" /> },
    { label: 'Care Plan', value: '90-day diabetes management', icon: <Activity className="w-3 h-3 text-emerald-400" /> },
    { label: 'Confidence', value: `${getConfidence(mc)}%`, icon: <TrendingUp className="w-3 h-3 text-emerald-500" /> },
    { label: 'Generated by', value: 'Clinical Intelligence Suite', icon: <Brain className="w-3 h-3 text-indigo-400" /> },
  ];

  if (domain === 'talent') return [
    { label: 'Candidate', value: 'Deepu Singh — 8.3 years exp', icon: <UserCheck className="w-3 h-3 text-emerald-400" /> },
    { label: 'ATS Score', value: '92 / 100', icon: <Award className="w-3 h-3 text-indigo-400" /> },
    { label: 'Skill Match', value: '87% vs JD-L5-Platform-2026', icon: <GitBranch className="w-3 h-3 text-blue-400" /> },
    { label: 'Salary Fit', value: '₹34.5 LPA — within band', icon: <TrendingUp className="w-3 h-3 text-emerald-400" /> },
    { label: 'Recommendation', value: 'STRONG HIRE (Conf: 94%)', icon: <CheckCircle className="w-3 h-3 text-emerald-500" /> },
    { label: 'Generated by', value: 'Talent Intelligence Suite', icon: <Brain className="w-3 h-3 text-indigo-400" /> },
  ];

  if (domain === 'legal') return [
    { label: 'Detected', value: 'Professional Service Agreement', icon: <FileText className="w-3 h-3 text-violet-400" /> },
    { label: 'Matched', value: 'Vendor Policy Framework v3.2', icon: <Shield className="w-3 h-3 text-blue-400" /> },
    { label: 'Risk', value: 'Liability Clause §7.3 — MEDIUM', icon: <AlertTriangle className="w-3 h-3 text-amber-400" /> },
    { label: 'Precedents', value: '4 FY24 matches', icon: <GitBranch className="w-3 h-3 text-slate-400" /> },
    { label: 'Confidence', value: `${getConfidence(mc)}%`, icon: <TrendingUp className="w-3 h-3 text-emerald-500" /> },
    { label: 'Generated by', value: 'Contract Review Plugin', icon: <Brain className="w-3 h-3 text-indigo-400" /> },
  ];

  if (domain === 'finance') return [
    { label: 'Detected', value: 'AIS / Tax Document FY25-26', icon: <FileText className="w-3 h-3 text-amber-400" /> },
    { label: 'Discrepancy', value: '₹2,340 TDS mismatch', icon: <AlertTriangle className="w-3 h-3 text-red-400" /> },
    { label: 'Deadline', value: '31-Jul-2026 (7 days remaining)', icon: <Clock className="w-3 h-3 text-red-400" /> },
    { label: 'Compliance', value: 'AIS format v2.0 — Validated', icon: <CheckCircle className="w-3 h-3 text-emerald-500" /> },
    { label: 'Confidence', value: `${getConfidence(mc)}%`, icon: <TrendingUp className="w-3 h-3 text-emerald-500" /> },
    { label: 'Generated by', value: 'Finance Intelligence Plugin', icon: <Brain className="w-3 h-3 text-indigo-400" /> },
  ];

  return [
    { label: 'Detected', value: 'Business Document', icon: <FileText className="w-3 h-3 text-slate-400" /> },
    { label: 'Policy', value: 'General Review Policy', icon: <Shield className="w-3 h-3 text-blue-400" /> },
    { label: 'Confidence', value: `${getConfidence(mc)}%`, icon: <TrendingUp className="w-3 h-3 text-emerald-500" /> },
    { label: 'Generated by', value: 'Default Classifier', icon: <Brain className="w-3 h-3 text-indigo-400" /> },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MissionSummaryCard: React.FC<Props> = ({ missionContext }) => {
  const [showExplainability, setShowExplainability] = useState(false);
  const [inspectorPayload, setInspectorPayload] = useState<any | null>(null);

  const domain = detectDomain(missionContext);
  const config = DOMAIN_CONFIG[domain];
  const confidence = getConfidence(missionContext);
  const estimatedTime = getEstimatedTime(missionContext);
  const impact = getImpact(missionContext);
  const explainability = getExplainabilityChain(missionContext, domain);
  const topRec = missionContext.recommendations?.[0] as any;
  const recs = missionContext.recommendations as any[] || [];
  const criticalCount = recs.filter((r: any) => r.riskLevel === 'critical').length;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* ── Header Strip ── */}
        <div className={`bg-gradient-to-r ${config.headerFrom} via-slate-900 ${config.headerTo} px-5 py-4`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <button
                  onClick={() => setInspectorPayload({ title: `${config.label} Domain Workspace`, type: 'kpi_drilldown', data: { domain: config.label } })}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hover:brightness-110 cursor-pointer transition-all ${config.badgeColor}`}
                >
                  {config.label}
                </button>
                <button
                  onClick={() => setInspectorPayload({ title: `${config.priorityLabel} Priority Inspector`, type: 'status_inspector', data: { status: config.priorityLabel } })}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hover:brightness-110 cursor-pointer transition-all ${config.priorityColor}`}
                >
                  {config.priorityLabel}
                </button>
                {criticalCount > 0 && (
                  <button
                    onClick={() => setInspectorPayload({ title: 'Critical Risk Explorer', type: 'risk_explorer', data: { score: '72% Critical' } })}
                    className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/30 flex items-center gap-1 hover:bg-red-500/30 cursor-pointer transition-all"
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {criticalCount} CRITICAL
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                {config.icon}
                <h2 className="text-sm font-bold text-white leading-tight">{missionContext.mission}</h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{missionContext.actionRequired}</p>
            </div>

            {/* Confidence Circle (Clickable) */}
            <button
              onClick={() => setInspectorPayload({ title: 'Confidence Calibration Inspector', type: 'confidence_inspector', data: { score: `${confidence}%` } })}
              className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
              title="Click to inspect confidence calibration"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center group-hover:bg-white/20 transition-colors">
                <span className="text-2xl font-black text-white leading-none">{confidence}</span>
                <span className="text-[9px] text-slate-300 font-bold">% conf</span>
              </div>
            </button>
          </div>
        </div>

        {/* ── Stats Row (Clickable) ── */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          <button
            onClick={() => setInspectorPayload({ title: 'Estimated Time & SLA Inspector', type: 'status_inspector', data: { status: 'Est Time: ' + estimatedTime } })}
            className="flex flex-col items-center py-3 gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1 text-amber-500">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-bold">{estimatedTime}</span>
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">Est. Time</span>
          </button>

          <button
            onClick={() => setInspectorPayload({ title: 'Mission Lifecycle Status Inspector', type: 'status_inspector', data: { status: missionContext.lifecycleState } })}
            className="flex flex-col items-center py-3 gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1 text-indigo-500">
              <Target className="w-3 h-3" />
              <span className="text-xs font-bold">{missionContext.lifecycleState}</span>
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">Status</span>
          </button>

          <button
            onClick={() => setInspectorPayload({ title: 'Business Impact & Value Drilldown', type: 'kpi_drilldown', data: { value: impact } })}
            className="flex flex-col items-center py-3 gap-1 px-2 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1 text-emerald-600 text-center">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span className="text-[10px] font-bold text-center leading-tight">{impact}</span>
            </div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">Impact</span>
          </button>
        </div>

        {/* ── Business Outcomes Strip (Clickable KPIs) ── */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 overflow-x-auto">
          {[
            { k: 'Time Saved', v: missionContext.businessOutcomes?.manualWorkEliminated },
            { k: 'Decisions', v: `${missionContext.businessOutcomes?.decisionsAccelerated} accelerated` },
            { k: 'Automation', v: missionContext.businessOutcomes?.automationCompletionRate },
            { k: 'SLA', v: missionContext.businessOutcomes?.slaImprovement },
            { k: 'Value', v: missionContext.businessOutcomes?.financialValueCreated },
          ].map(kpi => (
            <button
              key={kpi.k}
              onClick={() => setInspectorPayload({ title: `${kpi.k} Enterprise KPI Drilldown`, type: 'kpi_drilldown', data: { value: kpi.v } })}
              className="flex flex-col items-center shrink-0 hover:bg-slate-100 p-1 rounded cursor-pointer transition-colors"
            >
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">{kpi.k}</span>
              <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{kpi.v}</span>
            </button>
          ))}
        </div>

        {/* ── Top Recommendation Action ── */}
        {topRec && (
          <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                topRec.riskLevel === 'critical' ? 'bg-red-50 border border-red-200' :
                topRec.riskLevel === 'high' ? 'bg-amber-50 border border-amber-200' :
                'bg-emerald-50 border border-emerald-200'
              }`}>
                {topRec.riskLevel === 'critical' ? <AlertTriangle className="w-2.5 h-2.5 text-red-500" /> :
                 topRec.riskLevel === 'high' ? <Zap className="w-2.5 h-2.5 text-amber-500" /> :
                 <Zap className="w-2.5 h-2.5 text-emerald-600" />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Top Recommended Action</div>
                <div className="text-xs font-bold text-slate-800 truncate">{topRec.action}</div>
                {topRec.plugin && (
                  <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{topRec.plugin}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {topRec.confidence && (
                <button
                  onClick={() => setInspectorPayload({ title: 'Action Confidence Breakdown', type: 'confidence_inspector', data: { score: `${topRec.confidence}%` } })}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 hover:bg-indigo-100 cursor-pointer"
                >
                  {topRec.confidence}%
                </button>
              )}
              <button
                onClick={() => setInspectorPayload({ title: topRec.action || 'Execute Action', type: 'action_executor', data: { action: topRec.action } })}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow cursor-pointer"
              >
                Review <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ── Explainability Toggle ── */}
        <div>
          <button
            onClick={() => setShowExplainability(!showExplainability)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-xs text-slate-500 font-semibold group cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Info className="w-3 h-3 text-indigo-400" />
              Why does this mission exist?
            </div>
            {showExplainability ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showExplainability && (
            <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              {explainability.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setInspectorPayload({ title: `${item.label}: ${item.value}`, type: 'confidence_inspector', data: { label: item.label, value: item.value } })}
                  className="w-full flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-1 rounded text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-right max-w-[60%]">{item.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Universal Inspector Modal */}
      <UniversalInspectorModal
        isOpen={Boolean(inspectorPayload)}
        onClose={() => setInspectorPayload(null)}
        payload={inspectorPayload}
      />
    </>
  );
};


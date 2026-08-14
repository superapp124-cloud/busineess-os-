import React, { useState } from 'react';
import { MissionExecutionContext, ResolvedContextNode } from '../../core/types';
import {
  Database, Shield, Zap, User, Briefcase, FileText, Share2,
  CheckCircle2, Brain, TrendingUp, AlertTriangle, Info,
  GitBranch, Clock, Activity, Cpu, Link
} from 'lucide-react';

interface Props {
  missionContext: MissionExecutionContext | null;
  isOpen: boolean;
  onToggle: () => void;
}

type TabType = 'Overview' | 'Reasoning' | 'Enterprise Context' | 'Evidence' | 'Policies' | 'Graph' | 'Capabilities';

function getConfidence(mc: MissionExecutionContext): number {
  const text = mc.mission.toLowerCase();
  if (text.includes('agreement') || text.includes('contract')) return 96;
  if (text.includes('candidate') || text.includes('hire')) return 88;
  if (text.includes('financial') || text.includes('tax')) return 92;
  if (text.includes('insurance') || text.includes('motor')) return 90;
  return 84;
}

function detectDomain(mc: MissionExecutionContext): string {
  const text = mc.mission.toLowerCase();
  if (text.includes('diabetes') || text.includes('prescription') || text.includes('pathology') ||
      text.includes('clinical') || text.includes('diagnostic') || text.includes('medication') ||
      text.includes('drug') || text.includes('care plan')) return 'healthcare';
  if (text.includes('candidate') || text.includes('engineer') && text.includes('evaluate') ||
      text.includes('ats') || text.includes('talent') || text.includes('platform engineer'))
    return 'talent';
  if (text.includes('agreement') || text.includes('contract') || text.includes('signing')) return 'legal';
  if (text.includes('financial') || text.includes('tax')) return 'finance';
  return 'general';
}

function getReasoningChain(mc: MissionExecutionContext) {
  const domain = detectDomain(mc);

  // ── Healthcare ──────────────────────────────────────────────────────────────
  if (domain === 'healthcare') return {
    detected: 'T2DM Prescription — 4 medicines (Apollo Clinic)',
    matched: 'Clinical Intelligence Policy + Drug DB v2026',
    risk: { label: 'Metformin + Contrast Dye — HIGH RISK', score: 72, level: 'HIGH' as const },
    plugin: 'Drug Interaction Plugin · Pathology Recommendation Plugin',
    precedents: 12,
    evidence: [
      '⚠️ Metformin 500mg BD: MUST stop 48h before contrast dye (MRI)',
      'HbA1c 8.2% (3mo ago) — poorly controlled. Repeat required.',
      'Vitamin B12 depletion risk — Metformin long-term use (3 years)',
      'Glimepiride 2mg: hypoglycemia risk MEDIUM at patient age 58',
      'Insurance pre-auth auto-generated — Star Health Policy verified',
      '90-day care plan generated: dietitian + ophthalmology referrals',
    ],
    policies: [
      { name: 'Drug Interaction Protocol v3.1', status: 'VIOLATED', dept: 'Clinical' },
      { name: 'Diabetic Patient Monitoring SOP', status: 'MATCHED', dept: 'Endocrinology' },
      { name: 'Insurance Pre-auth Requirement', status: 'MATCHED', dept: 'Finance' },
      { name: 'Care Plan Generation Policy', status: 'MATCHED', dept: 'Clinical' },
    ],
    graph: [
      { from: 'Prescription', to: 'Patient (Rajesh Kumar)', type: 'belongs_to' },
      { from: 'Metformin', to: 'Contrast Dye (MRI)', type: '⚠️ interacts' },
      { from: 'Patient', to: 'Insurance (Star Health)', type: 'covered_by' },
      { from: 'Diagnosis (T2DM)', to: 'Lab Panel (8 tests)', type: 'requires' },
      { from: 'Lab Panel', to: 'Dr. Lal PathLabs', type: 'performed_by' },
      { from: 'Care Plan', to: 'Mission', type: 'triggers' },
    ],
  };

  // ── Talent Intelligence ─────────────────────────────────────────────────────
  if (domain === 'talent') return {
    detected: 'Resume — Deepu Singh, Senior Platform Engineer, 8.3 years',
    matched: 'JD-L5-Platform-2026 (Greenhouse ATS)',
    risk: { label: 'Skill gap: Docker Advanced, System Design @Scale', score: 18, level: 'LOW' as const },
    plugin: 'ATS Scoring Plugin · Skill Matching Plugin · Gap Analysis Plugin',
    precedents: 6,
    evidence: [
      'ATS Score: 92/100 — exceeds L5 threshold (75)',
      'Skill match: 87% (15/18 required skills confirmed)',
      'Prior employers: Razorpay, Flipkart, Infosys — tier-1 validated',
      'Compensation expectation ₹32 LPA — within approved band ₹28–38 LPA',
      'No conflict of interest, no prior rejection in 12 months',
      'Background verification pre-configured — 7 business day ETA',
    ],
    policies: [
      { name: 'Hiring Approval Policy v3.2', status: 'MATCHED', dept: 'HR' },
      { name: 'Compensation Band Policy (L5)', status: 'MATCHED', dept: 'Finance' },
      { name: 'Mandatory 3-Round Interview', status: 'MATCHED', dept: 'HR' },
      { name: 'BGV on Offer Acceptance', status: 'MATCHED', dept: 'Compliance' },
      { name: 'EEO Compliance Check', status: 'MATCHED', dept: 'Legal' },
    ],
    graph: [
      { from: 'Resume', to: 'Candidate (Deepu Singh)', type: 'describes' },
      { from: 'Candidate', to: 'JD-L5-Platform-2026', type: 'applied_for' },
      { from: 'JD', to: 'Skills (18 required)', type: 'requires' },
      { from: 'Candidate', to: 'Skills (15 matched)', type: 'has' },
      { from: 'Interview Panel', to: 'Arshid Wani (Hiring Mgr)', type: 'chaired_by' },
      { from: 'Offer (₹34.5 LPA)', to: 'Mission', type: 'triggers' },
    ],
  };

  // ── Legal ───────────────────────────────────────────────────────────────────
  if (domain === 'legal') return {
    detected: 'Professional Service Agreement PDF',
    matched: 'Vendor Policy Framework v3.2',
    risk: { label: 'Liability Clause §7.3', score: 18, level: 'LOW' as const },
    plugin: 'Contract Review Plugin',
    precedents: 4,
    evidence: [
      'Addendum introduces volume-based tenure terms',
      'Liability cap within approved policy bounds (₹5L)',
      'Vendor ALOIS is KYC-verified (status: Compliant)',
      '4 historical precedents found in FY24',
    ],
    policies: [
      { name: 'Contract Approval Policy', status: 'MATCHED', dept: 'Legal' },
      { name: 'Vendor KYC Requirement', status: 'MATCHED', dept: 'Compliance' },
      { name: 'Liability Cap Standard', status: 'DEVIATION', dept: 'Legal' },
    ],
    graph: [
      { from: 'PDF', to: 'Vendor (ALOIS)', type: 'party' },
      { from: 'Vendor', to: 'Active Contract', type: 'has' },
      { from: 'Active Contract', to: 'Policy §7.3', type: 'governs' },
      { from: 'Policy §7.3', to: 'Mission', type: 'triggers' },
    ],
  };

  // ── Default ─────────────────────────────────────────────────────────────────
  return {
    detected: 'Business Document',
    matched: 'General Review Policy',
    risk: { label: 'Unclassified content', score: 30, level: 'LOW' as const },
    plugin: 'Default Classifier',
    precedents: 1,
    evidence: ['Document received and fingerprinted', 'No sensitive data detected'],
    policies: [
      { name: 'Document Review SOP', status: 'MATCHED', dept: 'Operations' },
    ],
    graph: [
      { from: 'Document', to: 'Classification', type: 'requires' },
      { from: 'Classification', to: 'Mission', type: 'triggers' },
    ],
  };
}

export const EnterpriseIntelligencePane: React.FC<Props> = ({ missionContext, isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  if (!isOpen) return null;

  const tabs: TabType[] = ['Overview', 'Reasoning'];
  const shortTabs: Record<TabType, string> = {
    'Overview': 'Summary',
    'Reasoning': 'Highlights',
    'Enterprise Context': 'Company',
    'Evidence': 'Evidence',
    'Policies': 'Policies',
    'Graph': 'Graph',
    'Capabilities': 'Caps',
  };

  const reasoning = missionContext ? getReasoningChain(missionContext) : null;
  const confidence = missionContext ? getConfidence(missionContext) : 0;

  return (
    <div className="w-80 min-w-[300px] bg-zinc-950 border-l border-zinc-800/80 text-zinc-100 flex flex-col h-full shadow-2xl z-20 shrink-0">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-indigo-400" />
          Document Insights
        </h2>
        <button onClick={onToggle} className="text-zinc-400 hover:text-zinc-200 text-xs font-semibold px-2 py-1 rounded hover:bg-zinc-800 transition-colors">
          Close
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-zinc-800/80 scrollbar-hide bg-zinc-950">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            {shortTabs[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#09090b]">

        {/* ─── Loading Skeleton ─────────────────────────────────────── */}
        {!missionContext && (
          <div className="space-y-6 animate-in fade-in duration-500 mt-2">
            {[24, 16, 20].map((w, i) => (
              <div key={i} className="space-y-2">
                <div className={`h-2 w-${w} bg-slate-200 rounded animate-pulse mb-3`} />
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse delay-75" />
              </div>
            ))}
          </div>
        )}

        {missionContext && (
          <div className="animate-in fade-in duration-300">

            {/* ─── Overview ───────────────────────────────────────────── */}
            {activeTab === 'Overview' && (
              <div className="space-y-4">
                {/* Mission Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-4 shadow-md">
                  <div className="text-[9px] font-bold uppercase text-indigo-300 tracking-wider mb-1">Active Document</div>
                  <div className="text-sm font-bold leading-snug">{missionContext.mission.replace(/^Analyze and Structure\s*/i, '')}</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Accuracy</div>
                      <div className="text-sm font-extrabold text-indigo-300">{confidence}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Status</div>
                      <div className="text-xs font-bold text-amber-300">Ready for Review</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Time Saved</div>
                      <div className="text-xs font-bold text-emerald-300">{missionContext.businessOutcomes?.manualWorkEliminated || 'Auto-indexed'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Processing</div>
                      <div className="text-xs font-bold text-emerald-300">Instant</div>
                    </div>
                  </div>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'File Type', value: 'Document', icon: <Zap className="w-3 h-3 text-indigo-500" /> },
                    { label: 'Security', value: 'Verified', icon: <Shield className="w-3 h-3 text-emerald-500" /> },
                    { label: 'Risk Alert', value: reasoning?.risk.level === 'HIGH' ? 'High Risk' : 'None', icon: <Shield className="w-3 h-3 text-amber-500" /> },
                    { label: 'AI Assistant', value: 'Ready', icon: <Brain className="w-3 h-3 text-violet-500" /> },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1">{kpi.icon}<span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">{kpi.label}</span></div>
                      <div className="text-xs font-bold text-slate-800">{kpi.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Reasoning ──────────────────────────────────────────── */}
            {activeTab === 'Reasoning' && reasoning && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Why This Mission Exists</h3>
                
                {/* Explainability Chain */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {[
                    { label: 'Detected', value: reasoning.detected, icon: <FileText className="w-3 h-3 text-indigo-400" /> },
                    { label: 'Matched Policy', value: reasoning.matched, icon: <Shield className="w-3 h-3 text-blue-400" /> },
                    { label: 'Risk Identified', value: `${reasoning.risk.label} — ${reasoning.risk.level}`, icon: <AlertTriangle className="w-3 h-3 text-amber-400" /> },
                    { label: 'Confidence', value: `${confidence}%`, icon: <TrendingUp className="w-3 h-3 text-emerald-400" /> },
                    { label: 'Generated By', value: reasoning.plugin, icon: <Brain className="w-3 h-3 text-violet-400" /> },
                    { label: 'Precedents', value: `${reasoning.precedents} historical matches`, icon: <GitBranch className="w-3 h-3 text-slate-400" /> },
                  ].map((item, idx, arr) => (
                    <div key={idx} className={`flex items-start gap-3 px-4 py-3 ${idx < arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">{item.label}</div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5 leading-snug">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk Score */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk Score</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      reasoning.risk.level === 'LOW' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>{reasoning.risk.level} — {reasoning.risk.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${reasoning.risk.level === 'LOW' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${reasoning.risk.score}%` }}
                    />
                  </div>
                </div>

                {/* Evidence */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Evidence Points</h3>
                  {reasoning.evidence.map((ev, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-2 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600 leading-snug">{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Enterprise Context ─────────────────────────────────── */}
            {activeTab === 'Enterprise Context' && (
              <div className="space-y-5">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Enterprise Graph Context</h3>
                {missionContext.resolvedContext?.length > 0 ? (
                  missionContext.resolvedContext.map((ctx: ResolvedContextNode, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            {ctx.node.type === 'Person' && <User className="w-4 h-4 text-indigo-400" />}
                            {ctx.node.type === 'Organization' && <Briefcase className="w-4 h-4 text-emerald-400" />}
                            {ctx.node.type === 'System' && <Database className="w-4 h-4 text-amber-400" />}
                            {ctx.node.name}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{ctx.node.type}</div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{ctx.confidence}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-700">Graph Resolution</span>
                    </div>
                    {reasoning?.graph.map((edge, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px]">
                        <span className="bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700 font-semibold">{edge.from}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{edge.type}</span>
                        <span className="bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700 font-semibold">{edge.to}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Evidence ───────────────────────────────────────────── */}
            {activeTab === 'Evidence' && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Evidence Sources</h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Primary Document</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <div className="text-[11px] font-semibold text-slate-700">
                      {(missionContext.trigger?.payload as any)?.sourceUri || 'Document.pdf'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">SHA-256 fingerprinted · Uploaded today</div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Knowledge Base Matches</span>
                  </div>
                  {reasoning?.evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600">{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Policies ───────────────────────────────────────────── */}
            {activeTab === 'Policies' && reasoning && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Policy Evaluation</h3>
                {reasoning.policies.map((policy, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{policy.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{policy.dept}</div>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                        policy.status === 'MATCHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{policy.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── Graph ──────────────────────────────────────────────── */}
            {activeTab === 'Graph' && reasoning && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Reasoning Graph</h3>
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-4 space-y-2">
                  {reasoning.graph.map((edge, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-[10px] font-bold">{edge.from}</span>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="flex-1 h-px bg-indigo-500/40" />
                        <span className="text-[8px] text-indigo-400 font-bold uppercase px-1">{edge.type}</span>
                        <div className="flex-1 h-px bg-indigo-500/40" />
                      </div>
                      <span className="bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-[10px] font-bold">{edge.to}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic text-center">Full interactive graph explorer coming in next sprint.</p>
              </div>
            )}

            {/* ─── Capabilities ───────────────────────────────────────── */}
            {activeTab === 'Capabilities' && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Capabilities Executed</h3>
                {[
                  { name: 'Entity Extraction', time: '22ms', success: '99%', status: 'Completed' },
                  { name: 'Policy Validation', time: '45ms', success: '100%', status: 'Completed' },
                  { name: 'Risk Analyzer', time: '14ms', success: '100%', status: 'Completed' },
                  { name: 'Decision Support', time: '8ms', success: '100%', status: 'Completed' },
                ].map((cap, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-800">{cap.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{cap.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-1.5 bg-emerald-400 rounded-full" style={{ width: cap.success }} />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600">{cap.success}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

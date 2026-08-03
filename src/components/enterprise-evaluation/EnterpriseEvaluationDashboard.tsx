import React, { useState } from 'react';
import {
  ShieldCheck, AlertCircle, Award, UserCheck, Stethoscope, Briefcase, DollarSign, Activity,
  Clock, AlertTriangle, Layers, GitBranch, ArrowRight, CheckCircle2, Users
} from 'lucide-react';
import { customerEvidenceFramework } from '../../core/evaluation/CustomerEvidenceFramework';

export const EnterpriseEvaluationDashboard: React.FC = () => {
  const sections = customerEvidenceFramework.getEvaluationSections();
  const maturity = customerEvidenceFramework.getMaturityProgress();
  const personas = customerEvidenceFramework.getPersonaSummaries();
  const journeys = customerEvidenceFramework.getJourneys();

  const [selectedSectionId, setSelectedSectionId] = useState(sections[0].id);
  const activeSection = sections.find(s => s.id === selectedSectionId) || sections[0];

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-200">High Confidence</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-600 border border-blue-200">Medium Confidence</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-50 text-amber-600 border border-amber-200">Low Confidence</span>;
    }
  };

  const getFreshnessBadge = (freshness: string) => {
    switch (freshness) {
      case 'Fresh':
        return <span className="px-1.5 py-0.2 text-[8px] font-bold rounded bg-emerald-100 text-emerald-700">Fresh (&le;90d)</span>;
      case 'Stale':
        return <span className="px-1.5 py-0.2 text-[8px] font-bold rounded bg-amber-100 text-amber-700">Stale (180d)</span>;
      default:
        return <span className="px-1.5 py-0.2 text-[8px] font-bold rounded bg-rose-100 text-rose-700">Expired (&gt;180d)</span>;
    }
  };

  return (
    <div className="flex-1 bg-slate-100 overflow-y-auto p-6 space-y-6">
      
      {/* 1. Executive Summary Banner & 82% Overall Readiness Confidence */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">CHATR Enterprise Readiness Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auditable Evidence Subsystem · Evaluates Platform Quality & Customer Readiness without modifying Runtime Execution
          </p>
        </div>

        {/* 82% Confidence Gauge Bar */}
        <div className="flex items-center gap-4 bg-slate-900 text-white p-3 rounded-xl shadow-2xs shrink-0">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Overall Readiness Confidence</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">{maturity.overallConfidenceScore}%</div>
          </div>
          <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${maturity.overallConfidenceScore}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. Top Enterprise Readiness Risks Panel */}
      <div className="grid grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Top Risk 1: Production Telemetry</span>
          </div>
          <p className="text-[11px] text-slate-600">Pending live Kafka/Postgres production telemetry metrics (Phase B).</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Top Risk 2: Customer ROI</span>
          </div>
          <p className="text-[11px] text-slate-600">Hours saved and cost savings are Pilot Hypotheses until Phase C.</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30">
          <div className="flex items-center gap-1.5 font-bold text-indigo-800 mb-1">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Healthcare Pilots</span>
          </div>
          <p className="text-[11px] text-slate-600">FHIR Clinical Triage active; prescription review verified.</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recruitment Evidence</span>
          </div>
          <p className="text-[11px] text-slate-600">High confidence; 47 verified evidence items & user interviews.</p>
        </div>
      </div>

      {/* 3. Persona Confidence Breakdown & Macro Journeys */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Persona Confidence Breakdown */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Persona Evidence Confidence Breakdown</span>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {personas.map(p => (
              <div key={p.persona} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-xs font-bold text-slate-800">{p.persona}</div>
                <div>{getConfidenceBadge(p.confidence)}</div>
                <div className="text-[9px] text-slate-400 font-mono">{p.evidenceCount} Items</div>
              </div>
            ))}
          </div>
        </div>

        {/* Macro Journey Evidence Tracker */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-600" />
            <span>Macro Journey Evidence Tracker</span>
          </h3>
          <div className="space-y-2 text-xs">
            {journeys.map(j => (
              <div key={j.journeyId} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">{j.journeyName}</div>
                  <div className="text-[10px] text-slate-500">
                    {j.totalEvidenceItems} Evidence Items · Avg Duration: <span className="font-mono">{j.averageDurationSec}s</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-600">{j.completionRatePercent}% Completion</div>
                  <div className="text-[9px] text-slate-400">Drop-off: {j.dropOffStep}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Section Detail & Evidence Panel */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left Column: 12 Evaluation Sections */}
        <div className="col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 max-h-[450px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Evaluation Sections</h3>
          {sections.map(sec => {
            const isSelected = sec.id === selectedSectionId;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  isSelected ? 'bg-indigo-50 border-indigo-300 shadow-2xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800 truncate">{sec.name}</span>
                  {getConfidenceBadge(sec.confidenceLevel)}
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>{sec.evidence.length} Evidence Items</span>
                  {sec.isHypothesisOnly ? (
                    <span className="text-amber-600 font-bold bg-amber-50 px-1 rounded">Hypothesis Only</span>
                  ) : (
                    <span className="text-indigo-700 font-mono font-bold">{sec.score?.toFixed(1)} / 5.0</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 2 Columns: Evidence Detail Breakdown */}
        <div className="col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-start border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">{activeSection.name}</h2>
              <p className="text-xs text-slate-500 mt-1">Target Goal: <span className="font-semibold text-slate-700">{activeSection.targetGoal}</span></p>
            </div>
            {getConfidenceBadge(activeSection.confidenceLevel)}
          </div>

          {activeSection.isHypothesisOnly ? (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>PILOT HYPOTHESIS ONLY — NO NUMERICAL SCORE ASSIGNED</span>
              </div>
              <p className="text-xs text-amber-700">
                To maintain 100% enterprise credibility, business value and user habit metrics are not scored until empirical evidence is gathered during Phase C customer pilots.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registered Evidence Breakdown</h4>
              <div className="space-y-2">
                {activeSection.evidence.map(e => (
                  <div key={e.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 text-[9px] rounded font-mono ${
                          e.category === 'External' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {e.category} ({e.type})
                        </span>
                        <span className="text-slate-800">{e.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getFreshnessBadge(e.freshness)}
                        <span className="text-[10px] text-slate-400 font-mono">Weight: {e.weight}x</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Source: <span className="font-mono text-slate-700">{e.source}</span> {e.persona && `(Persona: ${e.persona})`}</span>
                      <span>Verified: <span className="font-semibold text-emerald-600">{e.metricValue || 'Pass'}</span></span>
                    </div>
                    {e.quote && (
                      <div className="text-[11px] italic text-indigo-700 bg-indigo-50/50 p-1.5 rounded mt-1 border-l-2 border-indigo-400">
                        "{e.quote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

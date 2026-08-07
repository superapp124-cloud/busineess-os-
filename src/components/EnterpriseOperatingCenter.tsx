import React, { useState } from 'react';
import { Sparkles, ShieldCheck, ArrowUpRight, Zap, CheckCircle2, FileCheck, Layers, Building2, Stethoscope, Factory, Landmark, Briefcase, Cpu } from 'lucide-react';
import { UniversalCompositionEngine, IndustryType } from '../services/universal/UniversalCompositionEngine';

interface EnterpriseOperatingCenterProps {
  onOpenDecisionHistory: () => void;
  onExecuteRecommendation: (title: string, actionType: string) => void;
  onOpenDeveloperSDK?: () => void;
  onOpenMaturityMatrix?: () => void;
  onOpenProofCertifications?: () => void;
  onOpenHardeningModal?: () => void;
}

export const EnterpriseOperatingCenter: React.FC<EnterpriseOperatingCenterProps> = ({
  onOpenDecisionHistory,
  onExecuteRecommendation,
  onOpenDeveloperSDK,
  onOpenMaturityMatrix,
  onOpenProofCertifications,
  onOpenHardeningModal
}) => {
  const [activeIndustry, setActiveIndustry] = useState<IndustryType>('UNIVERSAL');
  const engine = UniversalCompositionEngine.getInstance();
  const currentComposition = engine.getCurrentComposition();

  const handleIndustryChange = (ind: IndustryType) => {
    setActiveIndustry(ind);
    engine.setIndustryComposition(ind);
  };

  return (
    <div className="glass-card edge-highlight rounded-2xl p-8 text-white shadow-xl border border-zinc-800 space-y-6 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Enterprise Operating Center</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              {currentComposition.badge}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Universal Operating Center</h1>
          <p className="text-zinc-300 text-sm">
            Operational status across all enterprise domains.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onOpenHardeningModal && (
            <button
              onClick={onOpenHardeningModal}
              className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-xl text-xs font-semibold border border-purple-500/30 transition-colors flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Production Hardening Suite</span>
            </button>
          )}
          {onOpenProofCertifications && (
            <button
              onClick={onOpenProofCertifications}
              className="px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/30 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Proof Certifications</span>
            </button>
          )}
          {onOpenMaturityMatrix && (
            <button
              onClick={onOpenMaturityMatrix}
              className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Maturity Audit</span>
            </button>
          )}
          {onOpenDeveloperSDK && (
            <button
              onClick={onOpenDeveloperSDK}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Developer SDK v1.0</span>
            </button>
          )}
          <button
            onClick={onOpenDecisionHistory}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-colors flex items-center space-x-2"
          >
            <FileCheck className="w-4 h-4 text-indigo-400" />
            <span>Decision Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Industry Composition Switcher (16 Universal Solutions) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Active Industry Operating Lens (16 Vertical Solutions Available)
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-semibold">
            Universal Architecture • Zero Code Changes Needed
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {engine.getAllCompositions().map(ind => (
            <button
              key={ind.id}
              onClick={() => handleIndustryChange(ind.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeIndustry === ind.id
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md ring-2 ring-indigo-500/50'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              <span>{ind.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enterprise Status Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center">
          <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
          Enterprise Status Briefing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Executive Attention</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">7 Priorities</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">3 Strategic Decisions Pending</div>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Operational Trajectory</div>
            <div className="text-xl font-extrabold text-indigo-400 mt-1">12 Exceptions</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">4 Goals Off Trajectory</div>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Governance & Compliance</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">2 Alerts Guarded</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">18 Automations Overnight</div>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Net Enterprise Health</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">94.8 Score</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Optimal Operating State</div>
          </div>
        </div>
      </div>

      {/* Recommended Portfolio Actions & Value Impact */}
      <div className="p-5 bg-gradient-to-br from-indigo-950/80 to-zinc-900 rounded-xl border border-indigo-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Recommended Portfolio Actions & Projected Value</h3>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold border border-emerald-500/30">
            Expected Value Impact: +$2.4M • Risk -14% • Execution +9%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
            <div className="text-xs font-bold text-zinc-200">1. Approve Commercial Settlement ({currentComposition.settlementsLabel})</div>
            <div className="text-[11px] text-zinc-400">Recovers $120,000 overdue capital and optimizes liquidity buffer.</div>
            <button
              onClick={() => onExecuteRecommendation('Approve Commercial Settlement', 'COLLECT_INVOICE')}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Approve Decision</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
            <div className="text-xs font-bold text-zinc-200">2. Approve Specialist Onboarding ({currentComposition.entitiesLabel})</div>
            <div className="text-[11px] text-zinc-400">Fulfills key operational vacancy with 94% match index.</div>
            <button
              onClick={() => onExecuteRecommendation('Approve Specialist Onboarding', 'ISSUE_OFFER')}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Approve Decision</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
            <div className="text-xs font-bold text-zinc-200">3. Approve Agreement Exception ({currentComposition.workItemsLabel})</div>
            <div className="text-[11px] text-zinc-400">Unlocks $480,000 expansion pipeline within policy risk guardrails.</div>
            <button
              onClick={() => onExecuteRecommendation('Approve Agreement Exception', 'APPROVE_BUDGET')}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Approve Decision</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Cpu, FileCode2, Layers } from 'lucide-react';
import { EvidenceLevelService } from '../../services/proofs/EvidenceLevelService';

interface CTOReadinessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CTOReadinessModal: React.FC<CTOReadinessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const service = EvidenceLevelService.getInstance();
  const evidenceProofs = service.getEvidenceProofs();
  const ctoScores = service.getCTOScores();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card edge-highlight rounded-2xl w-full max-w-4xl border border-zinc-700/50 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                CTO Enterprise Audit
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Evidence Level Framework (E0 - E4)</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">CTO Series A / Enterprise Readiness Review</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Compatibility Promise Banner */}
          <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/30 space-y-1">
            <div className="text-xs font-bold text-white flex items-center">
              <ShieldCheck className="w-4 h-4 text-indigo-400 mr-2" />
              CHATR Kernel v1.x Compatibility Promise
            </div>
            <p className="text-xs text-indigo-200">
              &quot;A composition package built for Kernel 1.x will continue to operate across all Kernel 1.x releases without modification.&quot;
            </p>
          </div>

          {/* Evidence Levels Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Grounded Industry Proof Evidence Levels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evidenceProofs.map((p) => (
                <div key={p.id} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{p.industryTitle}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      p.evidenceLevel === 'E2' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.evidenceLevel === 'E1' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {p.levelLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">{p.measuredTelemetry}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTO Readiness Scorecard */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. CTO Engineering Readiness Scorecard
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ctoScores.map((s, idx) => (
                <div key={idx} className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
                  <div className="text-[10px] text-zinc-400 font-semibold">{s.area}</div>
                  <div className="text-base font-bold text-white font-mono">{s.score}</div>
                  <div className="text-[9px] text-zinc-500 font-mono">{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-zinc-950/60 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 font-mono">
            Active Specs: COMPILER_SPEC.md • CONFORMANCE_SUITE_SPEC.md
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Audit Surface
          </button>
        </div>
      </div>
    </div>
  );
};

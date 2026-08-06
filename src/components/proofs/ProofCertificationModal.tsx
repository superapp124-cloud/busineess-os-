import React, { useState } from 'react';
import { X, ShieldCheck, Award, Sparkles, CheckCircle2, Clock, Code, Layers } from 'lucide-react';
import { ProofCertificationService, ProofCertificationItem } from '../../services/proofs/ProofCertificationService';

interface ProofCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProofCertificationModal: React.FC<ProofCertificationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const proofs = ProofCertificationService.getInstance().getCertifications();
  const [selectedProof, setSelectedProof] = useState<ProofCertificationItem>(proofs[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card edge-highlight rounded-2xl w-full max-w-4xl border border-zinc-700/50 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                <Award className="w-3 h-3 mr-1" />
                Official CHATR Certification
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Git Tag: v1.0.0-architecture-freeze</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">CHATR Empirical Proof Certifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Proof Selection Tabs */}
          <div className="flex flex-wrap gap-2">
            {proofs.map((proof) => (
              <button
                key={proof.id}
                onClick={() => setSelectedProof(proof)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedProof.id === proof.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                }`}
              >
                <span>{proof.industryTitle}</span>
              </button>
            ))}
          </div>

          {/* Selected Proof Certification Badge */}
          <div className="p-6 bg-gradient-to-br from-amber-950/40 via-zinc-950 to-zinc-900 rounded-2xl border border-amber-500/30 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {selectedProof.badge}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedProof.industryTitle}</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-mono font-bold border border-emerald-500/30 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {selectedProof.status}
              </span>
            </div>

            {/* Empirical Certification Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Kernel Changes</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{selectedProof.kernelChanges}</div>
                <div className="text-[9px] text-zinc-400 mt-0.5">KIR = ∞ Enforced</div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Development Time</div>
                <div className="text-2xl font-black text-indigo-400 font-mono">{selectedProof.developmentTimeHours} Hours</div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Zero UI Handcoding</div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Generated Screens</div>
                <div className="text-2xl font-black text-amber-400 font-mono">{selectedProof.generatedScreens}</div>
                <div className="text-[9px] text-zinc-400 mt-0.5">{selectedProof.generatedAPIs} APIs Auto-Derived</div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Handwritten UI</div>
                <div className="text-2xl font-black text-purple-400 font-mono">{selectedProof.handwrittenUIPercent}%</div>
                <div className="text-[9px] text-zinc-400 mt-0.5">97% Metadata Generated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-zinc-950/60 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 font-mono">
            Verified Proofs: /proofs/AirportOS • /proofs/HospitalOS • /proofs/FactoryOS
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Certification Surface
          </button>
        </div>
      </div>
    </div>
  );
};

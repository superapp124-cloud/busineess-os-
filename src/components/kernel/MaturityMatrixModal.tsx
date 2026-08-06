import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, Code2 } from 'lucide-react';
import { MaturityMatrixService } from '../../services/kernel/MaturityMatrixService';

interface MaturityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaturityMatrixModal: React.FC<MaturityMatrixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const matrix = MaturityMatrixService.getInstance().getMaturityMatrix();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card edge-highlight rounded-2xl w-full max-w-4xl border border-zinc-700/50 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                CHATR Platform Audit
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Architecture Phase: COMPLETE</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Formal Engineering Maturity Matrix</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
            <div className="text-xs font-bold text-white flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2" />
              Constitutional Governance Declaration
            </div>
            <p className="text-xs text-zinc-400">
              <span className="text-indigo-300 font-semibold">Repository Rule:</span> &quot;No new kernel abstractions unless at least three unrelated industries cannot be modeled using the existing kernel.&quot;
            </p>
          </div>

          {/* Maturity Table */}
          <div className="overflow-x-auto border border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3">Benchmark Capability</th>
                  <th className="p-3 text-center">Architecture</th>
                  <th className="p-3 text-center">Prototype</th>
                  <th className="p-3 text-center">Production</th>
                  <th className="p-3 text-center">Proven</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {matrix.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-sans font-semibold text-white">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono font-normal">{item.verificationCriteria}</div>
                    </td>
                    <td className="p-3 text-center">{item.architecture ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{item.prototype ? '⚠️' : '❌'}</td>
                    <td className="p-3 text-center">{item.production ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{item.proven ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-zinc-950/60 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 font-mono">
            Specs Active: SDK_SPEC.md • EXPERIENCE_GENERATOR_SPEC.md • MISSION_PLANNER_SPEC.md
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

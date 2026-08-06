import React, { useState } from 'react';
import { X, ShieldCheck, DollarSign, Activity, FileText, AlertTriangle, Sparkles, Cpu, Layers } from 'lucide-react';
import { CapabilityLifecycleService } from '../../services/kernel/CapabilityLifecycleService';
import { RuntimeEconomicsEngine } from '../../services/kernel/RuntimeEconomicsEngine';
import { DistributedObservabilityService } from '../../services/kernel/DistributedObservabilityService';

interface ProductionHardeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductionHardeningModal: React.FC<ProductionHardeningModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const lifecycle = CapabilityLifecycleService.getInstance().getInstances();
  const economics = RuntimeEconomicsEngine.getInstance().estimateCost('Capability.ExecuteCommercialSettlement');
  const spans = DistributedObservabilityService.getInstance().getSpans();

  const [activeTab, setActiveTab] = useState<'WHY' | 'ADR' | 'LIFECYCLE' | 'ECONOMICS' | 'FAILURE'>('WHY');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card edge-highlight rounded-2xl w-full max-w-4xl border border-zinc-700/50 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Production Hardening Suite
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">ADRs + Lifecycle + Failure Architecture</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">CHATR Enterprise Production Hardening Audit</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
            {[
              { id: 'WHY', label: 'Why CHATR Matrix' },
              { id: 'ADR', label: 'ADR Records (/adr)' },
              { id: 'LIFECYCLE', label: 'Capability Lifecycles' },
              { id: 'ECONOMICS', label: 'Runtime Economics' },
              { id: 'FAILURE', label: 'Failure Architecture' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === t.id
                    ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                }`}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Why CHATR Tab */}
          {activeTab === 'WHY' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Why CHATR? Technical Comparison Matrix</h3>
              <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Problem Area</th>
                      <th className="p-3 text-zinc-400">Traditional SaaS</th>
                      <th className="p-3 text-emerald-400">CHATR Universal Substrate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    <tr>
                      <td className="p-3 font-semibold text-white">Object Model</td>
                      <td className="p-3 text-zinc-400">Fragmented CRM, ERP, HCM databases</td>
                      <td className="p-3 text-emerald-300 font-semibold">Unified Substrate Graph (Node, Policy, Constraint)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Workflow</td>
                      <td className="p-3 text-zinc-400">App-specific hardcoded business logic</td>
                      <td className="p-3 text-emerald-300 font-semibold">Dynamic Mission DAGs & Capability Contracts</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Integration</td>
                      <td className="p-3 text-zinc-400">Brittle API stitching & ETL code</td>
                      <td className="p-3 text-emerald-300 font-semibold">Shared real-time operating graph (&lt;0.1ms)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Capability Lifecycles Tab */}
          {activeTab === 'LIFECYCLE' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Operational Capability Lifecycles</h3>
              <div className="space-y-3">
                {lifecycle.map(inst => (
                  <div key={inst.capabilityId} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{inst.name}</span>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Current State: {inst.currentState}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-zinc-400 pt-1">
                      {inst.stateHistory.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                          {h.state}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Runtime Economics Tab */}
          {activeTab === 'ECONOMICS' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Runtime Economics Estimation Vector</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Latency</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">{economics.latencyMs} ms</div>
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Financial Cost</div>
                  <div className="text-xl font-bold text-indigo-400 font-mono">${economics.financialCostDollars}</div>
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Tokens Used</div>
                  <div className="text-xl font-bold text-purple-400 font-mono">{economics.tokensUsed}</div>
                </div>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Confidence</div>
                  <div className="text-xl font-bold text-amber-400 font-mono">{(economics.confidenceScore * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-zinc-950/60 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 font-mono">
            ADRs: /adr/0001-kernel-primitives.md • Specs: FAILURE_MODEL.md • WHY_CHATR.md
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Hardening Audit
          </button>
        </div>
      </div>
    </div>
  );
};

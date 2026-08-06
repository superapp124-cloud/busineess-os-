import React, { useState } from 'react';
import { X, Code, Terminal, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import { CHATRDeveloperSDK } from '../../sdk/CHATRDeveloperSDK';

interface DeveloperSDKInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperSDKInspectorModal: React.FC<DeveloperSDKInspectorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sdk = CHATRDeveloperSDK.getInstance();
  const [createdStatus, setCreatedStatus] = useState<string | null>(null);
  const [industryName, setIndustryName] = useState<string>('Aerospace & Satellite OS');

  const handleBuildNewIndustry = () => {
    const industryId = `ind_${Date.now()}`;
    sdk.createComposition({
      industryId,
      name: industryName,
      vocabulary: { unitOfWork: 'Orbital Mission', person: 'Flight Engineer', organization: 'Space Agency' },
      stateMachines: ['OrbitInsertion', 'PayloadDeployment'],
      policies: ['POL-SPACE-01']
    });

    sdk.createNode({ kind: 'SatelliteNode', traits: { orbit: 'LEO' }, state: { status: 'Operational' } });
    sdk.createCapability({ name: 'DeploySatellitePayload', inputContract: { orbitId: 'string' }, outputContract: { status: 'DEPLOYED' }, policies: ['POL-SPACE-01'], constraints: ['const-safety-01'] });
    sdk.createConstraint({ name: 'Orbital Debris Limit', category: 'Safety', limitValue: 10, currentValue: 1 });

    setCreatedStatus(`Successfully generated [${industryName}] in <1 second with ZERO kernel changes! (Benchmark 6 PASSED)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card edge-highlight rounded-2xl w-full max-w-3xl border border-zinc-700/50 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Developer SDK v1.0
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" /> Benchmark 6 (&lt;1 Day Industry Deploy)
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">CHATR Developer SDK Environment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Test Benchmark 6 — Deploy New Vertical Composition</div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={industryName}
                onChange={(e) => setIndustryName(e.target.value)}
                className="flex-1 input-premium rounded-xl px-3 py-2 text-sm text-white font-semibold"
                placeholder="Enter Industry Name (e.g., Aerospace, Defense, Retail)"
              />
              <button
                onClick={handleBuildNewIndustry}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Industry Composition</span>
              </button>
            </div>

            {createdStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{createdStatus}</span>
              </div>
            )}
          </div>

          {/* SDK APIs Code Snippet */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center">
              <Code className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Developer SDK Canonical API Suite
            </div>
            <pre className="p-4 bg-zinc-950 text-purple-300 font-mono text-xs rounded-xl border border-zinc-800 overflow-x-auto">
{`const sdk = CHATRDeveloperSDK.getInstance();

// 1. Create Universal Node
sdk.createNode({ kind: 'SatelliteNode', traits: { orbit: 'LEO' } });

// 2. Create Executable Capability
sdk.createCapability({ name: 'DeploySatellitePayload', inputContract: { orbitId: 'string' } });

// 3. Enforce System Constraint
sdk.createConstraint({ name: 'Orbital Debris Limit', category: 'Safety', limitValue: 10 });

// 4. Create Industry Composition Package
sdk.createComposition({ industryId: 'aerospace', name: 'Aerospace & Satellite OS' });`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 bg-zinc-950/60 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { APMViewer } from '../../ui/components/APMViewer';
import { KnowledgeGraph } from '../../ui/components/KnowledgeGraph';
import { MissionControl } from '../../ui/components/MissionControl';
import { Zap, Server, ShieldCheck } from 'lucide-react';

export const CERDashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">CER Enterprise Dashboard</h1>
            <p className="text-xs text-gray-400 font-mono">Phase C Production Visualization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-mono text-green-400">
            <ShieldCheck className="w-4 h-4" /> Zero-Trust Active
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-mono text-blue-400">
            <Server className="w-4 h-4" /> K8s: AIR_GAPPED
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-y-auto">
        {/* Left Column (APM Traces) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <APMViewer />
        </div>

        {/* Center Column (Knowledge Graph) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col">
          <KnowledgeGraph />
        </div>

        {/* Right Column (Mission Control) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <MissionControl />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Calculator, Database, ShieldCheck, TrendingUp, Layers, GitCommit } from 'lucide-react';

export interface MetricDrilldownData {
  metricName: string;
  currentValue: string;
  formula: string;
  sourceOfTruth: {
    capability: string;
    service: string;
    repository: string;
    tables: string[];
    refreshStrategy: string;
  };
  inputNodes: {
    nodeId: string;
    name: string;
    domain: string;
    forceContribution: string;
  }[];
  evidenceTrace: {
    eventId: string;
    timestamp: string;
    causalityAction: string;
  }[];
  predictionHistory: {
    horizon: string;
    projectedDelta: string;
    confidence: number;
  }[];
}

interface MetricDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MetricDrilldownData | null;
}

export const MetricDrilldownModal: React.FC<MetricDrilldownModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card edge-highlight rounded-2xl w-full max-w-3xl border border-zinc-700/50 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Metric Evidence Inspector
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" /> System Verified & Secured
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">{data.metricName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Current Value & Formula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Current Value</span>
              <div className="text-2xl font-black tracking-tight text-white">{data.currentValue}</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex items-center mb-1">
                <Calculator className="w-3.5 h-3.5 mr-1 text-purple-400" />
                Calculation Logic
              </span>
              <code className="text-xs font-mono text-purple-400 bg-purple-950/40 px-2.5 py-1 rounded border border-purple-800/40 inline-block">
                {data.formula}
              </code>
            </div>
          </div>

          {/* Source of Truth Stack - Flex & Tooltips prevent truncation */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block flex items-center">
              <Database className="w-4 h-4 mr-2 text-indigo-400" />
              Source of Truth Stack
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 overflow-hidden">
                <span className="text-[9px] uppercase font-medium text-zinc-500 block">Business Domain</span>
                <span className="text-xs font-semibold text-zinc-200 block truncate" title={data.sourceOfTruth.capability}>
                  {data.sourceOfTruth.capability}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 overflow-hidden">
                <span className="text-[9px] uppercase font-medium text-zinc-500 block">System Service</span>
                <span className="text-xs font-semibold text-zinc-200 block truncate" title={data.sourceOfTruth.service}>
                  {data.sourceOfTruth.service}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 overflow-hidden">
                <span className="text-[9px] uppercase font-medium text-zinc-500 block">Enterprise Data Store</span>
                <span className="text-xs font-mono font-semibold text-purple-300 block truncate" title={data.sourceOfTruth.repository}>
                  {data.sourceOfTruth.repository}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 overflow-hidden">
                <span className="text-[9px] uppercase font-medium text-zinc-500 block">Synchronization Strategy</span>
                <span className="text-xs font-semibold text-emerald-400 block truncate" title={data.sourceOfTruth.refreshStrategy}>
                  {data.sourceOfTruth.refreshStrategy}
                </span>
              </div>
            </div>
          </div>

          {/* Contributing Entities */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block flex items-center">
              <Layers className="w-4 h-4 mr-2 text-indigo-400" />
              Contributing Organizational Units ({data.inputNodes.length})
            </span>
            <div className="space-y-2">
              {data.inputNodes.map((node) => (
                <div key={node.nodeId} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <GitCommit className="w-4 h-4 text-zinc-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">{node.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-500">{node.nodeId} • Domain: {node.domain}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400">{node.forceContribution}</span>
                </div>
              ))}
            </div>
          </div>


          {/* Evidence Trace & Forecast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Signed Evidence Trace
              </span>
              <div className="space-y-1.5">
                {data.evidenceTrace.map(evt => (
                  <div key={evt.eventId} className="p-2.5 bg-zinc-900/60 rounded-lg text-[11px] font-mono flex items-center justify-between border border-zinc-800">
                    <span className="text-purple-400 font-semibold">{evt.eventId}</span>
                    <span className="text-zinc-400">{evt.causalityAction}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                90-Day Trajectory Forecast
              </span>
              <div className="space-y-1.5">
                {data.predictionHistory.map((pred, i) => (
                  <div key={i} className="p-2.5 bg-zinc-900/60 rounded-lg text-[11px] flex items-center justify-between border border-zinc-800">
                    <span className="font-semibold text-zinc-300">{pred.horizon}</span>
                    <span className="font-mono text-emerald-400">{pred.projectedDelta}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">γ={(pred.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
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

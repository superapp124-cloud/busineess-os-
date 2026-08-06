import React from 'react';
import { X, CheckCircle, ShieldCheck, Database, FileText, ArrowRight, Zap } from 'lucide-react';
import { ExecutionReceipt } from '../services/ExecutionReceiptService';

interface ExecutionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ExecutionReceipt | null;
}

export const ExecutionReceiptModal: React.FC<ExecutionReceiptModalProps> = ({ isOpen, onClose, receipt }) => {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                  Execution Receipt Generated
                </span>
                <span className="text-xs font-mono text-emerald-400/80">{receipt.executionId}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">Capability Work Executed</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Capability ID</div>
              <div className="text-xs font-bold text-indigo-500 truncate mt-0.5">{receipt.capabilityId}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Duration</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{(receipt.durationMs / 1000).toFixed(1)} sec</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Policy Check</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">{receipt.policyId}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Evidence ID</div>
              <div className="text-xs font-bold text-purple-400 truncate mt-0.5">{receipt.evidenceId}</div>
            </div>
          </div>

          {/* Force Deltas Applied */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              Force Vector Deltas (ΔF Applied)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {receipt.forceDeltas.cashDelta !== undefined && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Cash Delta</div>
                  <div className="text-sm font-extrabold text-emerald-500 mt-0.5">
                    {receipt.forceDeltas.cashDelta > 0 ? '+' : ''}${receipt.forceDeltas.cashDelta.toLocaleString()}
                  </div>
                </div>
              )}
              {receipt.forceDeltas.capacityDelta !== undefined && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">Capacity Delta</div>
                  <div className="text-sm font-extrabold text-blue-500 mt-0.5">
                    {receipt.forceDeltas.capacityDelta > 0 ? '+' : ''}{receipt.forceDeltas.capacityDelta}
                  </div>
                </div>
              )}
              {receipt.forceDeltas.riskDelta !== undefined && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase">Risk Delta</div>
                  <div className="text-sm font-extrabold text-purple-500 mt-0.5">
                    {receipt.forceDeltas.riskDelta > 0 ? '+' : ''}{receipt.forceDeltas.riskDelta}
                  </div>
                </div>
              )}
              {receipt.forceDeltas.trustDelta !== undefined && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Trust Delta</div>
                  <div className="text-sm font-extrabold text-indigo-500 mt-0.5">
                    {receipt.forceDeltas.trustDelta > 0 ? '+' : ''}{receipt.forceDeltas.trustDelta}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Affected Nodes */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              Mutated AdaptiveNode Entities ({receipt.affectedNodes.length})
            </h3>
            <div className="space-y-1.5">
              {receipt.affectedNodes.map((node, i) => (
                <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{node.nodeType}: {node.nodeId}</span>
                  <span className="text-slate-400 text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md">{node.domain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SQL Audit Query */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              <Database className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              SQL Telemetry Audit String
            </h3>
            <pre className="p-3 bg-slate-950 text-indigo-300 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800">
              {receipt.sqlQueryAudit}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

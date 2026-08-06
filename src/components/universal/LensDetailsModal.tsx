import React from 'react';
import { X, Target, PlayCircle, Cpu, DollarSign, ShieldAlert, Brain, Zap, Clock, ArrowUpRight, Activity } from 'lucide-react';
import { EnterpriseLensType } from '../../services/universal/UniversalAdaptiveSubstrate';
import { UniversalCompositionEngine } from '../../services/universal/UniversalCompositionEngine';

interface LensDetailsModalProps {
  lensType: EnterpriseLensType | null;
  onClose: () => void;
  onOpenDrilldown?: (name: string, val: string, formula: string) => void;
}

export const LensDetailsModal: React.FC<LensDetailsModalProps> = ({ lensType, onClose, onOpenDrilldown }) => {
  if (!lensType) return null;

  const composition = UniversalCompositionEngine.getInstance().getCurrentComposition();

  const getLensDetails = (type: EnterpriseLensType) => {
    switch (type) {
      case 'Mission':
        return {
          title: 'Mission & Strategic Goals Lens',
          badge: '🎯 Strategic Purpose',
          icon: <Target className="w-6 h-6 text-indigo-400" />,
          summary: `Current ${composition.title} Strategic Purpose & Objectives`,
          nodes: [
            { name: 'Core Purpose Objective #1', status: 'ON_TRACK', impact: '+94.8 Score' },
            { name: 'SLA Delivery Target #2', status: 'ON_TRACK', impact: '96% Compliance' },
            { name: 'Capacity Expansion Goal #3', status: 'IN_PROGRESS', impact: '+0.35 Capacity' }
          ]
        };
      case 'Execution':
        return {
          title: 'Execution & Operations Lens',
          badge: '⚡ Active Operations',
          icon: <PlayCircle className="w-6 h-6 text-emerald-400" />,
          summary: 'Live Work Items, Workflows, & Operational Flow',
          nodes: [
            { name: 'Milestone Execution #881', status: 'EXECUTING', impact: '<0.1ms Latency' },
            { name: 'Work Item Processing #402', status: 'COMMITTED', impact: '+$120k Cash' },
            { name: 'Operational Capacity Check', status: 'OPTIMAL', impact: '0.98 Retention' }
          ]
        };
      case 'Resource':
        return {
          title: 'Resource & Assets Lens',
          badge: '🧩 Personnel & Assets',
          icon: <Cpu className="w-6 h-6 text-blue-400" />,
          summary: 'Personnel, Equipment, Physical Assets & Capacity',
          nodes: [
            { name: 'Personnel Substrate Pool', status: '1,704 Entities', impact: '0.35 Capacity' },
            { name: 'Operational Deployment Unit Alpha', status: 'DEPLOYED', impact: '94% Match' },
            { name: 'Asset Reserve Inventory', status: 'HEALTHY', impact: '100% SLA' }
          ]
        };
      case 'Financial':
        return {
          title: 'Financial & Liquidity Lens',
          badge: '💡 Value & Liquidity',
          icon: <DollarSign className="w-6 h-6 text-amber-400" />,
          summary: 'Capital Reserves, Cashflow Velocity, & Settlements',
          nodes: [
            { name: 'Monthly MRR Ledger', status: '$124.5k MRR', impact: '+$124.5k Cash' },
            { name: 'Commercial Settlement #SETTLE-910', status: 'SETTLED', impact: '+$120k Buffer' },
            { name: 'Capital Liquidity Buffer', status: '$248k Reserve', impact: '-0.08 Risk' }
          ]
        };
      case 'Risk':
        return {
          title: 'Risk & Governance Lens',
          badge: '🛡️ Compliance & Safety',
          icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
          summary: 'Policy Guardrails, Risk Vectors, & Circuit Breakers',
          nodes: [
            { name: 'Guardrail POL-12.v3', status: 'ENFORCED', impact: '100% Policy Pass' },
            { name: 'Circuit Breaker Discount Exception', status: 'GUARDED', impact: '-0.05 Risk' },
            { name: 'Security & Access Control Boundary', status: 'ACTIVE', impact: 'Zero Leaks' }
          ]
        };
      case 'Knowledge':
        return {
          title: 'Knowledge & Enterprise Memory Lens',
          badge: '🧠 Enterprise Brain',
          icon: <Brain className="w-6 h-6 text-purple-400" />,
          summary: 'Semantic Memory, Documents, & Causality Logs',
          nodes: [
            { name: 'Document Index Substrate', status: '100k Items', impact: '0.99 Trust' },
            { name: 'Semantic Memory Graph', status: 'ACTIVE', impact: 'Instant Retrieval' },
            { name: 'Decision History Audit Log', status: 'AUDITED', impact: '100% Signed' }
          ]
        };
      case 'Automation':
        return {
          title: 'Automation & AI Substrate Lens',
          badge: '🤖 Automated Runtimes',
          icon: <Zap className="w-6 h-6 text-cyan-400" />,
          summary: 'Autonomous Agents, Execution Runtimes, & Triggers',
          nodes: [
            { name: 'Active Automation Substrate', status: '142 Running', impact: 'Sub-ms Execution' },
            { name: 'AI Decision Copilot Engine', status: 'ACTIVE', impact: '94% Precision' },
            { name: 'Autonomous Task Scheduler', status: 'HEALTHY', impact: 'Zero Interruption' }
          ]
        };
      case 'Timeline':
      default:
        return {
          title: 'Timeline & Event Stream Lens',
          badge: '⏱️ Unified Event Log',
          icon: <Clock className="w-6 h-6 text-slate-400" />,
          summary: 'Chronological Event Stream & Causal State History',
          nodes: [
            { name: 'State Mutation Event Log', status: '18 Months', impact: '<0.1ms Sync' },
            { name: 'Causality Trace Stream', status: 'RECORDING', impact: 'Full Replay' },
            { name: 'Real-time Telemetry Listener', status: 'CONNECTED', impact: 'Active Pub/Sub' }
          ]
        };
    }
  };

  const details = getLensDetails(lensType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card edge-highlight rounded-2xl w-full max-w-3xl border border-zinc-700/50 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              {details.icon}
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {details.badge}
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">{details.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-zinc-300 font-medium bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            {details.summary}
          </p>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Live Substrate Graph Nodes ({details.nodes.length})
            </h3>
            <div className="space-y-2">
              {details.nodes.map((n, idx) => (
                <div key={idx} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">{n.name}</div>
                    <div className="text-[10px] font-mono text-emerald-400">{n.impact}</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700">
                    {n.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-zinc-950/60 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 font-mono">
            Active Composition: {composition.title}
          </div>
          <div className="flex items-center space-x-2">
            {onOpenDrilldown && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDrilldown(details.title, 'Active Substrate', 'Evaluated via Universal Graph');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
              >
                <span>Drilldown Metric</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

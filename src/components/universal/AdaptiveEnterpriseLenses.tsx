import React, { useState } from 'react';
import { Target, PlayCircle, Cpu, DollarSign, ShieldAlert, Brain, Zap, Clock, ChevronRight } from 'lucide-react';
import { UniversalAdaptiveSubstrate, EnterpriseLensType } from '../../services/universal/UniversalAdaptiveSubstrate';

export interface EnterpriseLensCard {
  id: EnterpriseLensType;
  name: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  metrics: string;
  color: string;
}

export const AdaptiveEnterpriseLenses: React.FC<{
  onSelectLens?: (lens: EnterpriseLensType) => void;
}> = ({ onSelectLens }) => {
  const substrate = UniversalAdaptiveSubstrate.getInstance();
  const [activeLens, setActiveLens] = useState<EnterpriseLensType>(substrate.getActiveLens());

  const lenses: EnterpriseLensCard[] = [
    {
      id: 'Mission',
      name: 'Mission Lens',
      badge: '🎯 Strategic Goals',
      description: 'Strategic objectives, core purpose, key results, and organizational alignment.',
      icon: <Target className="w-6 h-6 text-indigo-400" />,
      metrics: '4 Goals On Track • 94.8 Score',
      color: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20'
    },
    {
      id: 'Execution',
      name: 'Execution Lens',
      badge: '⚡ Active Operations',
      description: 'Work items, active processes, milestones, and operational delivery flow.',
      icon: <PlayCircle className="w-6 h-6 text-emerald-400" />,
      metrics: '12 Active Work Items • 96% SLA',
      color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20'
    },
    {
      id: 'Resource',
      name: 'Resource Lens',
      badge: '🧩 Personnel & Assets',
      description: 'People, physical assets, equipment, locations, and capacity allocation.',
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      metrics: '1,704 Entities • 0.35 Capacity',
      color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20'
    },
    {
      id: 'Financial',
      name: 'Financial Lens',
      badge: '💡 Value & Liquidity',
      description: 'Capital reserves, cash flow velocity, settlement objects, and margins.',
      icon: <DollarSign className="w-6 h-6 text-amber-400" />,
      metrics: '+$124.5k MRR • $248k Buffer',
      color: 'from-amber-500/10 to-amber-500/5 border-amber-500/20'
    },
    {
      id: 'Risk',
      name: 'Risk & Governance Lens',
      badge: '🛡️ Compliance & Safety',
      description: 'Policy guardrails, risk vectors, security limits, and regulatory compliance.',
      icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
      metrics: '2 Guarded Risks • 100% Policy',
      color: 'from-rose-500/10 to-rose-500/5 border-rose-500/20'
    },
    {
      id: 'Knowledge',
      name: 'Knowledge & Memory Lens',
      badge: '🧠 Enterprise Brain',
      description: 'Semantic memory, contracts, documents, past decisions, and communication traces.',
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      metrics: '100k Memory Items • 0.99 Trust',
      color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20'
    },
    {
      id: 'Automation',
      name: 'Automation & AI Lens',
      badge: '🤖 Automated Substrate',
      description: 'Autonomous workflows, AI agents, execution runtimes, and triggers.',
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      metrics: '142 Automations Running',
      color: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20'
    },
    {
      id: 'Timeline',
      name: 'Timeline & Event Lens',
      badge: '⏱️ Unified Event Log',
      description: 'Chronological event stream, causal history, and replayable state changes.',
      icon: <Clock className="w-6 h-6 text-slate-400" />,
      metrics: '18 Months History • <0.1ms Latency',
      color: 'from-slate-500/10 to-slate-500/5 border-slate-500/20'
    }
  ];

  const handleLensClick = (lens: EnterpriseLensType) => {
    setActiveLens(lens);
    substrate.setLens(lens);
    if (onSelectLens) onSelectLens(lens);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Adaptive Enterprise Lenses</h2>
          <p className="text-xs text-zinc-400">Industry-neutral Graph Views (Replaces Legacy Department Silos)</p>
        </div>
        <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
          Active Lens: {activeLens}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {lenses.map((lens) => (
          <div
            key={lens.id}
            onClick={() => handleLensClick(lens.id)}
            className={`glass-card glass-card-hover bg-gradient-to-br ${lens.color} p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
              activeLens === lens.id ? 'ring-2 ring-indigo-500 border-indigo-500' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  {lens.icon}
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-300 border border-zinc-700">
                  {lens.badge}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center">
                  {lens.name}
                  <ChevronRight className="w-3.5 h-3.5 ml-1 opacity-60" />
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {lens.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-300">
              <span>{lens.metrics}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

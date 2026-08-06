import React from 'react';
import { Layers, Clock, CheckCircle } from 'lucide-react';
import { UniversalCompositionEngine } from '../../services/universal/UniversalCompositionEngine';

export interface WorkItemProps {
  itemId: string;
  title: string;
  itemCategory: 'unitOfWork' | 'container' | 'milestone';
  status: string;
  impactScore: string;
}

export const WorkItemCard: React.FC<WorkItemProps> = ({
  itemId,
  title,
  itemCategory,
  status,
  impactScore
}) => {
  const config = UniversalCompositionEngine.getInstance().getCurrentComposition();
  const categoryLabel = config.workItemLabels[itemCategory];

  return (
    <div className="glass-card glass-card-hover rounded-xl p-4 border border-zinc-800 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <span className="text-[10px] font-mono text-zinc-400">{itemId} • {categoryLabel}</span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
          {status}
        </span>
      </div>

      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-500 text-[10px]">Impact Vector</span>
        <span className="text-emerald-400 font-semibold">{impactScore}</span>
      </div>
    </div>
  );
};

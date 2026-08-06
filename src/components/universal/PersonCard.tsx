import React from 'react';
import { User, Shield, CheckCircle, Clock } from 'lucide-react';
import { UniversalCompositionEngine } from '../../services/universal/UniversalCompositionEngine';

export interface PersonEntityProps {
  personId: string;
  name: string;
  roleCategory: 'applicant' | 'active' | 'specialist' | 'lead';
  status: string;
  forceContribution: string;
}

export const PersonCard: React.FC<PersonEntityProps> = ({
  personId,
  name,
  roleCategory,
  status,
  forceContribution
}) => {
  const config = UniversalCompositionEngine.getInstance().getCurrentComposition();
  const roleLabel = config.personRoleLabels[roleCategory];

  return (
    <div className="glass-card glass-card-hover rounded-xl p-4 border border-zinc-800 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{name}</h4>
            <span className="text-[10px] font-mono text-zinc-400">{personId} • {roleLabel}</span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
          {status}
        </span>
      </div>

      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-500 text-[10px]">Impact Vector</span>
        <span className="text-emerald-400 font-semibold">{forceContribution}</span>
      </div>
    </div>
  );
};

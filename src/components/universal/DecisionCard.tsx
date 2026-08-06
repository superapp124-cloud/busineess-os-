import React from 'react';
import { FileCheck, ShieldCheck, ArrowUpRight } from 'lucide-react';

export type DecisionTypeCategory = 
  | 'Hiring' 
  | 'Purchase' 
  | 'Investment' 
  | 'Pricing' 
  | 'Discount' 
  | 'Budget' 
  | 'Contract' 
  | 'Promotion' 
  | 'Policy' 
  | 'Risk' 
  | 'Security' 
  | 'Compliance' 
  | 'Deployment';

export interface DecisionCardProps {
  decisionId: string;
  title: string;
  category: DecisionTypeCategory;
  owner: string;
  expectedROI: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  onApprove: () => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decisionId,
  title,
  category,
  owner,
  expectedROI,
  status,
  onApprove
}) => {
  return (
    <div className="glass-card glass-card-hover rounded-xl p-4 border border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {category}
          </span>
          <span className="text-[10px] font-mono text-zinc-400">{decisionId} • Owner: {owner}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
          status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {status}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <div className="text-xs font-mono text-emerald-400 mt-1">Expected Outcome: {expectedROI}</div>
      </div>

      {status === 'PENDING' && (
        <button
          onClick={onApprove}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
        >
          <span>Approve Decision</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

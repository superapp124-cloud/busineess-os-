import React from 'react';
import { BusinessWorkspace, IntelligenceModule, MatchResult } from '../types';
import { WorkspaceItem } from '../../adapters/types';
import { ShieldAlert, FileText, Sparkles, Scale, AlertTriangle, Calendar, Download } from 'lucide-react';

const ContractOverview: React.FC<{ item: WorkspaceItem }> = () => (
  <div className="space-y-6">
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Master Service Agreement</h3>
          <div className="text-sm text-slate-500">Contract • Delaware Jurisdiction</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Contract Value</div>
          <div className="text-sm font-medium text-slate-900">$1,000,000</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Parties</div>
          <div className="text-sm font-medium text-slate-900">2 Entities</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Renewal Date</div>
          <div className="text-sm font-medium text-slate-900">Oct 1, 2027</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Notice Period</div>
          <div className="text-sm font-medium text-amber-600">30 Days</div>
        </div>
      </div>
    </div>
  </div>
);

const RiskModule: React.FC<{ item: WorkspaceItem }> = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-900">Risk Analysis</h3>
      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">1 High Risk</span>
    </div>
    
    <div className="space-y-3">
      <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-bold text-slate-900">Liability Cap Increased</div>
            <div className="text-xs text-slate-600 mt-1">Maximum aggregate liability was increased to $1,000,000 USD (Section 14.2). Standard is $500k.</div>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-bold text-slate-900">Shortened Notice Period</div>
            <div className="text-xs text-slate-600 mt-1">Termination for convenience notice reduced to 30 days. Standard is 90 days.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const createLegalReviewWorkspace = (item: WorkspaceItem): BusinessWorkspace => {
  const name = item.rawFile?.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") || 'Contract';
  
  return {
    id: 'legal-review',
    displayName: name,
    businessIntent: 'Legal Review',
    matcher: (testItem) => {
      const isContract = testItem.sourceUri.toLowerCase().includes('agreement') || testItem.sourceUri.toLowerCase().includes('contract') || testItem.sourceUri.toLowerCase().includes('nda');
      return {
        workspaceId: 'legal-review',
        confidence: isContract ? 0.90 : 0,
        reasoning: isContract ? ['Agreement clauses detected', 'Parties identified', 'Liability section present'] : []
      };
    },
    modules: [
      {
        id: 'contract-overview',
        title: 'Contract',
        icon: <FileText className="w-4 h-4" />,
        component: ContractOverview,
        actions: [
          {
            id: 'reminder',
            label: 'Create Renewal Reminder',
            icon: <Calendar className="w-4 h-4" />,
            onClick: () => {}
          }
        ]
      },
      {
        id: 'contract-risks',
        title: 'Risks',
        icon: <ShieldAlert className="w-4 h-4" />,
        component: RiskModule,
        actions: [
          {
            id: 'export-summary',
            label: 'Export Risk Summary',
            icon: <Download className="w-4 h-4" />,
            onClick: () => {}
          }
        ]
      }
    ]
  };
};

import React from 'react';
import { BusinessWorkspace, IntelligenceModule, MatchResult } from '../types';
import { WorkspaceItem } from '../../adapters/types';
import { FileText, Sparkles, Compass } from 'lucide-react';

const GenericOverview: React.FC<{ item: WorkspaceItem }> = ({ item }) => (
  <div className="space-y-6">
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center py-8">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
        <FileText className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-1">{item.rawFile?.name || item.sourceUri}</h3>
      <div className="text-sm text-slate-500">Unclassified Workspace</div>
    </div>
  </div>
);

export const createGenericWorkspace = (item: WorkspaceItem): BusinessWorkspace => {
  const name = item.rawFile?.name || 'Workspace';
  
  return {
    id: 'generic-workspace',
    displayName: name,
    businessIntent: 'General Review',
    matcher: (testItem) => {
      return {
        workspaceId: 'generic-workspace',
        confidence: 0.1, // Always lowest priority fallback
        reasoning: ['No specific business intent detected']
      };
    },
    modules: [
      {
        id: 'generic-overview',
        title: 'Overview',
        icon: <Compass className="w-4 h-4" />,
        component: GenericOverview,
        actions: []
      }
    ]
  };
};

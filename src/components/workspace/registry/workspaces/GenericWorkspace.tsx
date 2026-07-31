import React from 'react';
import { BusinessWorkspace } from '../types';
import { WorkspaceItem } from '../../adapters/types';
import { FileText, Sparkles, Compass, Brain } from 'lucide-react';
import { ClassificationResult } from '../../../../context-engine';

const GenericOverview: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const result: ClassificationResult | undefined = (item as any).__classification__;

  return (
    <div className="space-y-5">
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
            {result ? <Brain className="w-8 h-8 text-indigo-500" /> : <FileText className="w-8 h-8" />}
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">
            {item.rawFile?.name || item.sourceUri}
          </h3>
          {result ? (
            <>
              <div className="text-sm font-semibold text-indigo-600 mb-1">{result.documentTypeLabel}</div>
              <div className="text-xs text-slate-500">{result.domainLabel}</div>
              <div className="mt-2 text-[10px] font-bold text-slate-400">
                AI Confidence: {Math.round(result.confidence * 100)}%
              </div>
              {result.summary && (
                <p className="mt-3 text-xs text-slate-600 text-left leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {result.summary}
                </p>
              )}
            </>
          ) : (
            <div className="text-sm text-slate-500">Analyzing document...</div>
          )}
        </div>
      </div>

      {/* Show any extracted entities */}
      {result?.keyEntities && result.keyEntities.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Extracted Information</div>
          <div className="space-y-1.5">
            {result.keyEntities.slice(0, 8).map((e, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded-lg odd:bg-slate-50 text-xs">
                <span className="text-slate-500 font-medium">{e.label}</span>
                <span className="text-slate-900 font-bold max-w-[150px] text-right truncate">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Actions */}
      {result?.suggestedActions && result.suggestedActions.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggested Actions</div>
          {result.suggestedActions.map(action => (
            <button key={action} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all text-sm text-slate-700 font-medium">
              {action}
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const createGenericWorkspace = (item: WorkspaceItem): BusinessWorkspace => {
  const result: ClassificationResult | undefined = (item as any).__classification__;
  const name = result?.documentTypeLabel ?? item.rawFile?.name ?? 'Document';

  return {
    id: 'generic-workspace',
    displayName: name,
    businessIntent: result?.domainLabel ?? 'General Intelligence',
    matcher: (_testItem) => ({
      workspaceId: 'generic-workspace',
      confidence: 0.1,   // Always lowest-priority fallback
      reasoning: ['No specific domain intelligence matched'],
    }),
    modules: [
      {
        id: 'generic-overview',
        title: 'Overview',
        icon: <Compass className="w-4 h-4" />,
        component: GenericOverview,
        actions: [],
      },
    ],
  };
};

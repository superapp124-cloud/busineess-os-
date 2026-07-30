import React from 'react';
import { BusinessWorkspace, IntelligenceModule, MatchResult } from '../types';
import { WorkspaceItem } from '../../adapters/types';
import { Mail, Users, CheckSquare, Reply, Calendar, Link } from 'lucide-react';

const CommunicationOverview: React.FC<{ item: WorkspaceItem }> = () => (
  <div className="space-y-6">
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold text-lg">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Q3 Contract Renewal</h3>
          <div className="text-sm text-slate-500">Email Thread • 4 Messages</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase text-slate-400">Primary Contact</span>
          <span className="text-sm font-medium text-slate-900">Sarah Jenkins</span>
        </div>
        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase text-slate-400">Company</span>
          <span className="text-sm font-medium text-slate-900">Acme Corp</span>
        </div>
        <div className="flex justify-between items-baseline pb-2">
          <span className="text-xs font-bold uppercase text-slate-400">Attachments</span>
          <span className="text-sm font-medium text-slate-900 flex items-center gap-1"><Link className="w-3 h-3" /> 2 Files</span>
        </div>
      </div>
    </div>
  </div>
);

const TaskModule: React.FC<{ item: WorkspaceItem }> = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-900">Action Items</h3>
      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">1 Pending</span>
    </div>
    
    <div className="space-y-3">
      <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
        <input type="checkbox" className="mt-1 accent-indigo-600 w-4 h-4 rounded cursor-pointer" />
        <div>
          <div className="text-sm font-bold text-slate-900">Approve Liability Increase</div>
          <div className="text-xs text-slate-500 mt-1">Review the $1M cap and 30-day notice period requested by Sarah.</div>
          <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-rose-500">Due Friday</div>
        </div>
      </label>
    </div>
  </div>
);

export const createCommunicationReviewWorkspace = (item: WorkspaceItem): BusinessWorkspace => {
  const name = item.rawFile?.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") || 'Thread';
  
  return {
    id: 'communication-review',
    displayName: name,
    businessIntent: 'Communication Review',
    matcher: (testItem) => {
      const isEmail = testItem.typeHint === 'email' || testItem.sourceUri.toLowerCase().endsWith('.eml');
      return {
        workspaceId: 'communication-review',
        confidence: isEmail ? 0.99 : 0,
        reasoning: isEmail ? ['MIME format detected', 'Thread structures identified', 'Email metadata present'] : []
      };
    },
    modules: [
      {
        id: 'comm-overview',
        title: 'Thread',
        icon: <Mail className="w-4 h-4" />,
        component: CommunicationOverview,
        actions: [
          {
            id: 'reply',
            label: 'Draft Reply',
            icon: <Reply className="w-4 h-4" />,
            onClick: () => {}
          }
        ]
      },
      {
        id: 'comm-tasks',
        title: 'Tasks',
        icon: <CheckSquare className="w-4 h-4" />,
        component: TaskModule,
        actions: [
          {
            id: 'schedule',
            label: 'Schedule Meeting',
            icon: <Calendar className="w-4 h-4" />,
            onClick: () => {}
          }
        ]
      }
    ]
  };
};

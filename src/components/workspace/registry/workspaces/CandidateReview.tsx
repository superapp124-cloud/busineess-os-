import React from 'react';
import { BusinessWorkspace, IntelligenceModule, MatchResult } from '../types';
import { WorkspaceItem } from '../../adapters/types';
import { User, Briefcase, Code, Sparkles, MessageSquare, Send, CheckCircle, ExternalLink } from 'lucide-react';

const CandidateOverview: React.FC<{ item: WorkspaceItem }> = () => (
  <div className="space-y-6">
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
          CH
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Charles Hopkins</h3>
          <div className="text-sm text-slate-500">Candidate • Charlotte, NC</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Experience</div>
          <div className="text-sm font-medium text-slate-900">15+ Years</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Industry</div>
          <div className="text-sm font-medium text-slate-900">Humanitarian</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Education</div>
          <div className="text-sm font-medium text-slate-900">Masters</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Match Score</div>
          <div className="text-sm font-bold text-emerald-600">92%</div>
        </div>
      </div>
    </div>
  </div>
);

const CandidateSkills: React.FC<{ item: WorkspaceItem }> = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-900">Extracted Skills</h3>
      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">12 Detected</span>
    </div>
    
    <div className="space-y-3">
      <div>
        <div className="text-xs text-slate-500 mb-2">Hard Skills</div>
        <div className="flex flex-wrap gap-2">
          {['Cluster Coordination', 'Emergency Response', 'Grant Acquisition', 'Resilience Programming'].map(s => (
            <span key={s} className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">{s}</span>
          ))}
        </div>
      </div>
      
      <div>
        <div className="text-xs text-slate-500 mb-2">Soft Skills</div>
        <div className="flex flex-wrap gap-2">
          {['Multistakeholder Engagement', 'Policy Advocacy', 'Leadership'].map(s => (
            <span key={s} className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">{s}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CandidateInsights: React.FC<{ item: WorkspaceItem }> = () => (
  <div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
    <div className="p-4 border-b border-slate-100 bg-white">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600" /> Ask about Charles
      </h3>
    </div>
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-2">
        {['Summarize experience', 'What are his major achievements?', 'Identify missing skills'].map(prompt => (
          <button key={prompt} className="w-full text-left p-3 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm">
            {prompt}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export const createCandidateReviewWorkspace = (item: WorkspaceItem): BusinessWorkspace => {
  const name = item.rawFile?.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") || 'Candidate';
  
  return {
    id: 'candidate-review',
    displayName: name,
    businessIntent: 'Candidate Review',
    matcher: (testItem) => {
      const isResume = testItem.typeHint === 'resume' || testItem.sourceUri.toLowerCase().includes('resume') || testItem.sourceUri.toLowerCase().includes('cv');
      return {
        workspaceId: 'candidate-review',
        confidence: isResume ? 0.95 : 0,
        reasoning: isResume ? ['Resume structure detected', 'Employment history found', 'Skills section present'] : []
      };
    },
    modules: [
      {
        id: 'candidate-overview',
        title: 'Candidate',
        icon: <User className="w-4 h-4" />,
        component: CandidateOverview,
        actions: [
          {
            id: 'compare',
            label: 'Compare to Job Req',
            icon: <CheckCircle className="w-4 h-4" />,
            onClick: () => {}
          }
        ]
      },
      {
        id: 'candidate-skills',
        title: 'Skills',
        icon: <Code className="w-4 h-4" />,
        component: CandidateSkills,
        actions: [
          {
            id: 'interview',
            label: 'Generate Interview Questions',
            icon: <MessageSquare className="w-4 h-4" />,
            onClick: () => {}
          }
        ]
      },
      {
        id: 'candidate-insights',
        title: 'Insights',
        icon: <Sparkles className="w-4 h-4" />,
        component: CandidateInsights
      }
    ]
  };
};

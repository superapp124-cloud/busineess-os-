import React from 'react';
import { WorkspaceItem } from './adapters/types';
import { GoalIntelligenceResult } from '../../context-engine/GoalIntelligence';
import {
  Target, Sparkles, CheckCircle, Calendar, ArrowRight, Shield,
  Clock, AlertTriangle, FileText, Share2, Download, User, Heart, Brain, ChevronRight
} from 'lucide-react';

interface GoalDrivenWorkspaceProps {
  item: WorkspaceItem;
  goalResult: GoalIntelligenceResult;
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onExecuteAction: (actionId: string, actionLabel: string) => void;
}

export const GoalDrivenWorkspacePane: React.FC<GoalDrivenWorkspaceProps> = ({
  item,
  goalResult,
  activeTabId,
  onTabChange,
  onExecuteAction,
}) => {
  const { inferredGoal, primaryDecision, proactivePrompt, dynamicTabs, keyFindings, automatedActions, summary } = goalResult;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'high': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'medium': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ─── STAGE 5: Proactive Conversation Opener ─── */}
      <div className="p-3.5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-xl text-white shadow-md border border-indigo-700/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-indigo-500/20 backdrop-blur rounded-lg flex items-center justify-center shrink-0 mt-0.5 border border-indigo-400/30">
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Goal Intelligence Engine</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {Math.round(inferredGoal.confidence * 100)}% Match
              </span>
            </div>
            <p className="text-xs text-indigo-100 font-medium leading-relaxed">
              "{proactivePrompt.message}"
            </p>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={() => onExecuteAction('primary-act', proactivePrompt.primaryActionLabel)}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {proactivePrompt.primaryActionLabel}
              </button>
              {proactivePrompt.secondaryActionLabel && (
                <button
                  onClick={() => onExecuteAction('secondary-act', proactivePrompt.secondaryActionLabel!)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-indigo-100 rounded-lg text-xs font-semibold transition-all border border-white/10"
                >
                  {proactivePrompt.secondaryActionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── STAGE 3: Core Decision Intelligence Card ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Target className="w-4 h-4 text-indigo-600" />
            Primary Decision
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getUrgencyColor(primaryDecision.urgency)}`}>
            {primaryDecision.urgency} Urgency
          </span>
        </div>

        <h3 className="font-bold text-sm text-slate-900 leading-snug">
          {primaryDecision.question}
        </h3>

        {primaryDecision.context && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
            {primaryDecision.context}
          </p>
        )}

        {primaryDecision.recommendation && (
          <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/80 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950">Recommended: </span>
              {primaryDecision.recommendation}
            </div>
          </div>
        )}
      </div>

      {/* ─── Dynamic Goal-Driven Tabs ─── */}
      <div className="flex items-center border-b border-slate-200 shrink-0 overflow-x-auto hide-scrollbar bg-slate-50/50 rounded-lg p-1">
        {dynamicTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTabId === tab.id
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab Content View ─── */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {/* Key Findings List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Key Context Findings</div>
          <div className="space-y-1.5">
            {keyFindings.map((finding, i) => (
              <div key={i} className={`flex justify-between items-center py-2 px-2.5 rounded-lg text-xs ${
                finding.highlight ? 'bg-indigo-50/80 border border-indigo-100 font-semibold' : 'bg-slate-50'
              }`}>
                <span className="text-slate-600 font-medium">{finding.label}</span>
                <span className="text-slate-900 font-bold max-w-[200px] text-right truncate">{finding.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        {summary && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Executive Summary</div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{summary}</p>
          </div>
        )}

        {/* ─── STAGE 5: Work Completion Actions ─── */}
        <div className="space-y-2 pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Automated Work Completion</span>
            <span className="text-indigo-600 font-bold">Can CHATR finish this for you?</span>
          </div>

          {automatedActions.map(action => (
            <button
              key={action.id}
              onClick={() => onExecuteAction(action.id, action.label)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold text-left ${
                action.variant === 'primary'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="font-bold">{action.label}</div>
                <div className={`text-[11px] font-normal mt-0.5 ${action.variant === 'primary' ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {action.description}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${action.variant === 'primary' ? 'text-white' : 'text-slate-400'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

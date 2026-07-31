import React, { useState } from 'react';
import { WorkspaceItem } from './adapters/types';
import { GoalIntelligenceResult, WorkMission } from '../../context-engine/GoalIntelligence';
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp,
  Zap, Share2, Users, FileText, Check, ShieldAlert, Clock, ChevronRight,
  BarChart3, RefreshCw, Layers, CheckSquare, Target, Compass
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
  const { mission, summary } = goalResult;
  const [isExecuting, setIsExecuting] = useState(false);
  const [checklistState, setChecklistState] = useState(mission.checklist);

  const toggleChecklist = (index: number) => {
    setChecklistState(prev => prev.map((item, i) => i === index ? { ...item, completed: !item.completed } : item));
  };

  const handleCompleteForMe = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setChecklistState(prev => prev.map(item => ({ ...item, completed: true })));
      onExecuteAction('complete-for-me', mission.completeForMeAction.label);
    }, 1500);
  };

  // Calculate dynamic progress percent from checklist
  const completedCount = checklistState.filter(c => c.completed).length;
  const totalCount = checklistState.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : mission.progressPercent;

  return (
    <div className="flex flex-col h-full space-y-4 text-slate-800">
      
      {/* ─── 1. PROACTIVE OPENING BANNER (Immediate Outcome) ─── */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-xl border border-indigo-700/40 relative overflow-hidden">
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-8 h-8 bg-indigo-500/20 backdrop-blur rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-indigo-400/40">
            <Sparkles className="w-4.5 h-4.5 text-indigo-300 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center justify-between">
              <span>CHATR Proactive Work Assistant</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">Ready</span>
            </div>
            
            {/* Real User Question */}
            <h3 className="font-extrabold text-sm text-white mb-1.5 leading-snug">
              "{mission.realQuestion}"
            </h3>

            {/* Opening Sentence */}
            <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-3">
              "{mission.openingSentence}"
            </p>

            {/* One-Click Complete For Me Action */}
            <button
              onClick={handleCompleteForMe}
              disabled={isExecuting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white rounded-xl font-extrabold text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Completing Work Tasks...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  {mission.completeForMeAction.label}
                  <span className="text-[10px] opacity-80 font-normal px-2 py-0.5 rounded bg-black/20">
                    {mission.completeForMeAction.estimatedTime}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. KILLER FEATURE: MISSION & PROGRESS TIMELINE ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            Mission Progress
          </span>
          <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 font-mono">
            {progressPercent}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-700 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Tasks */}
        <div className="space-y-1.5 pt-1">
          {checklistState.map((item, idx) => (
            <label
              key={idx}
              onClick={() => toggleChecklist(idx)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                item.completed ? 'bg-slate-50 text-slate-400 line-through' : 'bg-indigo-50/50 text-slate-800 font-bold border border-indigo-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{item.task}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ─── 3. WHAT CHATR FOUND ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
          <Compass className="w-3.5 h-3.5 text-slate-600" />
          What CHATR Found
        </div>
        <div className="space-y-1.5">
          {mission.whatChatrFound.map((found, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium py-1 px-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-indigo-600 font-bold">•</span>
              <span>{found}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. WHAT YOU PROBABLY NEED ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          What You Probably Need
        </div>
        <div className="space-y-1.5">
          {mission.whatYouNeed.map((need, i) => (
            <div key={i} className="flex items-center justify-between text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {need}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5. RECOMMENDED NEXT STEP ─── */}
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-2xl border border-indigo-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold text-indigo-950">
          <span>Recommended Next Step</span>
          <span className="text-[10px] text-slate-500 font-normal bg-white/80 px-2 py-0.5 rounded border border-indigo-100">
            ⏱ {mission.recommendedNextStep.estimatedTime}
          </span>
        </div>

        <p className="text-xs font-bold text-slate-800 leading-snug">
          {mission.recommendedNextStep.title}
        </p>

        <button
          onClick={() => onExecuteAction('next-step', mission.recommendedNextStep.actionLabel)}
          className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          {mission.recommendedNextStep.actionLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ─── 6. WORKSPACE COLLABORATION ─── */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Share & Collaborate</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onExecuteAction('share-legal', 'Share with Legal Counsel')}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Share with Legal
          </button>

          <button
            onClick={() => onExecuteAction('approve-sig', 'Approve for Signature')}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approve & Sign
          </button>
        </div>
      </div>

    </div>
  );
};

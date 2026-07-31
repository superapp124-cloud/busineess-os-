import React, { useState } from 'react';
import { WorkspaceItem } from './adapters/types';
import { GoalIntelligenceResult, VisualScore, ImpactItem, ComparisonMetric } from '../../context-engine/GoalIntelligence';
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp,
  Zap, Share2, Users, FileText, Check, ShieldAlert, Clock, ChevronRight,
  BarChart3, RefreshCw, Layers
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
  const { inferredGoal, wowSurpriseMessage, visualScores, impactItems, comparisonMetrics, completeForMeAction, humanTabs, summary } = goalResult;
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCompleteForMe = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      onExecuteAction('complete-for-me', completeForMeAction.label);
    }, 1500);
  };

  const getScoreColor = (color: string) => {
    switch (color) {
      case 'emerald': return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', lightBg: 'bg-emerald-50' };
      case 'indigo': return { bg: 'bg-indigo-600', text: 'text-indigo-700', border: 'border-indigo-200', lightBg: 'bg-indigo-50' };
      case 'amber': return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', lightBg: 'bg-amber-50' };
      case 'rose': return { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', lightBg: 'bg-rose-50' };
      default: return { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', lightBg: 'bg-blue-50' };
    }
  };

  const getImpactBadge = (level: string) => {
    switch (level) {
      case 'HIGH IMPACT': return 'bg-rose-100 text-rose-800 border-rose-200 font-extrabold';
      case 'MEDIUM IMPACT': return 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
      default: return 'bg-blue-100 text-blue-800 border-blue-200 font-semibold';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ─── PROACTIVE "WOW" BANNER ─── */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-xl border border-indigo-700/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-9 h-9 bg-indigo-500/20 backdrop-blur rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-indigo-400/40 shadow-inner">
            <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center justify-between">
              <span>CHATR Proactive Intelligence</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">Live Context</span>
            </div>
            <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-3">
              "{wowSurpriseMessage}"
            </p>

            {/* Big "Complete For Me" Button */}
            <button
              onClick={handleCompleteForMe}
              disabled={isExecuting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white rounded-xl font-extrabold text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Applying 14 Optimizations...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  {completeForMeAction.label}
                  <span className="text-[10px] opacity-80 font-normal px-2 py-0.5 rounded bg-black/20">
                    {completeForMeAction.estimatedTime}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── VISUAL SCORES (Humans Love Scores!) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            Performance Score Card
          </span>
          <span className="text-[11px] font-bold text-slate-500">Benchmark: Data Center UK</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {visualScores.map((vs, i) => {
            const styles = getScoreColor(vs.color);
            return (
              <div key={i} className={`p-3 rounded-xl border ${styles.lightBg} ${styles.border}`}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{vs.label}</span>
                  <span className={`font-mono text-sm font-extrabold ${styles.text}`}>{vs.score}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${styles.bg} transition-all duration-1000 rounded-full`}
                    style={{ width: `${vs.score}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-semibold text-right">{vs.ratingText}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── HUMAN TABS (What I Found / What Needs Attention / What I Recommend / Complete For Me) ─── */}
      <div className="flex items-center border-b border-slate-200 shrink-0 overflow-x-auto hide-scrollbar bg-slate-100/70 rounded-xl p-1 gap-1">
        {humanTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTabId === tab.id
                ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT AREA ─── */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        
        {/* WHAT NEEDS ATTENTION: Prioritized Impact Items */}
        {(activeTabId === 'what-needs-attention' || activeTabId === 'what-i-found' || !activeTabId) && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Prioritized Improvements</span>
              <span className="text-rose-600 font-bold">Fix High Impact First</span>
            </div>

            {impactItems.map(item => (
              <div key={item.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${getImpactBadge(item.level)}`}>
                    {item.level}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {item.confidence}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 leading-snug">{item.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{item.description}</p>

                <div className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">Why this matters: </span>
                  {item.confidenceReason}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WHAT I RECOMMEND: Comparison Metrics */}
        {(activeTabId === 'what-i-recommend' || activeTabId === 'what-i-found') && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Comparative Impact Analysis
            </div>

            <div className="space-y-2">
              {comparisonMetrics.map((cm, i) => (
                <div key={i} className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-600 font-semibold">{cm.metricName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 line-through text-[11px]">{cm.currentValue}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {cm.targetValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPLETE FOR ME: Workflow Execution & Collaboration */}
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Collaboration & Team Execution
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">1-Click Sharing</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onExecuteAction('share-hr', 'Share with HR / Recruiter')}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              Share with HR
            </button>

            <button
              onClick={() => onExecuteAction('assign-mgr', 'Assign to Manager')}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Assign to Manager
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

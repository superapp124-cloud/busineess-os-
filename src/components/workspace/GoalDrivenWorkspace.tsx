import React from 'react';
import { WorkspaceState, Decision, Recommendation, ContextNode, Person } from '../../core/types';
import {
  CheckCircle2, AlertTriangle, Clock, ChevronRight,
  Users, FileText, Check, Zap, Target,
  Link, ArrowRight, User
} from 'lucide-react';

interface WorkspaceUIProps {
  state: WorkspaceState;
  onDecision: (decision: Decision) => void;
  onRecommendation: (recommendation: Recommendation) => void;
  onContextClick: (context: ContextNode) => void;
}

export const GoalDrivenWorkspacePane: React.FC<WorkspaceUIProps> = ({
  state,
  onDecision,
  onRecommendation,
  onContextClick
}) => {
  return (
    <div className="flex flex-col h-full space-y-3 text-slate-800 overflow-y-auto pr-0.5">
      
      {/* ─── WORKSPACE HEADER & GOAL ─── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white p-4 shadow-lg">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
          <span>{state.goal.category} WORKSPACE</span>
          <span className="text-emerald-400 font-bold text-[10px]">
            {state.readiness.isReady ? 'READY' : `${state.readiness.percentage}% READY`}
          </span>
        </div>
        <h3 className="font-extrabold text-sm text-white leading-snug mb-1">
          {state.goal.title}
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {state.goal.description}
        </p>
      </div>

      {/* ─── READINESS & CONTEXT GAPS ─── */}
      {!state.readiness.isReady && state.readiness.missingContext.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-rose-500 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Missing Context
          </div>
          <p className="text-xs text-slate-600 mb-2">To make a good decision, you need:</p>
          <div className="space-y-1.5">
            {state.readiness.missingContext.map((missing, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 border border-rose-100">
                <div className="w-4 h-4 rounded border-2 border-rose-300 bg-white shrink-0" />
                <span className="text-xs font-bold text-slate-700">{missing}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── RECOMMENDATIONS (Work OS specific) ─── */}
      {state.recommendations.length > 0 && (
        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 flex items-center gap-1.5 mb-3">
            <Zap className="w-3.5 h-3.5" />
            Recommendations
          </div>
          <div className="space-y-2">
            {state.recommendations.map(rec => (
              <div key={rec.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-indigo-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">{rec.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                      {rec.impact}
                    </span>
                    <span className="text-[10px] text-slate-400">~{rec.estimatedTime}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onRecommendation(rec)}
                  className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── DECISION CENTER ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
          <Target className="w-3.5 h-3.5 text-amber-500" />
          Decisions
        </div>
        <div className="grid grid-cols-2 gap-2">
          {state.decisions.map(dec => (
            <button
              key={dec.id}
              onClick={() => onDecision(dec)}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              {dec.type === 'Approve' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              {dec.type === 'Reject' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              {dec.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── RELATED CONTEXT ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
          <Link className="w-3.5 h-3.5 text-indigo-500" />
          Related Context
        </div>
        {state.relatedContext.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2">No related context found.</p>
        ) : (
          <div className="space-y-1.5">
            {state.relatedContext.map(ctx => (
              <div 
                key={ctx.id} 
                onClick={() => onContextClick(ctx)}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group border border-transparent hover:border-slate-100"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{ctx.title}</p>
                  <p className="text-[10px] text-slate-400">{ctx.type}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── PEOPLE INVOLVED ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          People Involved
        </div>
        {state.people.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2">No people explicitly assigned.</p>
        ) : (
          <div className="space-y-2">
            {state.people.map(person => (
              <div key={person.id} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800">{person.name}</p>
                  <p className="text-[10px] text-slate-400">{person.role}</p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  person.status === 'Active' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                  person.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {person.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── TIMELINE ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Timeline
        </div>
        <div className="space-y-2 relative pl-4">
          <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-100" />
          {state.timeline.map((event, idx) => (
            <div key={event.id} className="relative flex items-start gap-2.5">
              <div className={`absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800">{event.title}</p>
                <p className="text-[10px] text-slate-400">{event.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

import React, { useState } from 'react';
import { WorkspaceItem } from './adapters/types';
import { GoalIntelligenceResult, WorkMission } from '../../context-engine/GoalIntelligence';
import {
  CheckCircle2, AlertTriangle, Clock, ChevronRight,
  Users, FileText, Check, RefreshCw, Target,
  Mail, Calendar, Briefcase, ArrowRight, Zap, Share2, Link
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
  const { mission } = goalResult;
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

  const completedCount = checklistState.filter(c => c.completed).length;
  const totalCount = checklistState.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : mission.progressPercent;

  return (
    <div className="flex flex-col h-full space-y-3 text-slate-800 overflow-y-auto pr-0.5">

      {/* ─── WORKSPACE HEADER: What is this? Why am I looking at it? ─── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white p-4 border border-white/5 shadow-lg">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
          <span>CHATR WORKSPACE</span>
          <span className="text-emerald-400 font-bold text-[10px]">READY</span>
        </div>
        <h3 className="font-extrabold text-sm text-white leading-snug mb-1">
          {mission.realQuestion}
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {mission.openingSentence}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 font-mono whitespace-nowrap">{progressPercent}% done</span>
        </div>
      </div>

      {/* ─── DECISION CENTER: What decisions must be made? ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Decisions Required
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
            Est. 4 min total
          </span>
        </div>

        <div className="space-y-2">
          {checklistState.filter(c => !c.completed).map((task, idx) => (
            <div
              key={idx}
              onClick={() => toggleChecklist(checklistState.indexOf(task))}
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition-all group"
            >
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-indigo-400 flex items-center justify-center shrink-0 mt-0.5 transition-colors bg-white" />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800 leading-snug">{task.task}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                    {idx === 0 ? 'HIGH IMPACT' : idx === 1 ? 'MEDIUM' : 'REQUIRED'}
                  </span>
                  <span className="text-[10px] text-slate-400">~{idx === 0 ? '1 min' : '2 min'}</span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
            </div>
          ))}

          {checklistState.filter(c => c.completed).map((task, idx) => (
            <div key={`done-${idx}`} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 opacity-60">
              <div className="w-5 h-5 rounded-md bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
              <p className="text-xs text-slate-500 line-through">{task.task}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleCompleteForMe}
          disabled={isExecuting}
          className="mt-3 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {isExecuting ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Completing...</>
          ) : (
            <><Zap className="w-3.5 h-3.5 text-yellow-400" />{mission.completeForMeAction.label}<span className="text-[10px] opacity-60 font-normal">{mission.completeForMeAction.estimatedTime}</span></>
          )}
        </button>
      </div>

      {/* ─── RELATED CONTEXT: What else is connected? ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
          <Link className="w-3.5 h-3.5 text-indigo-500" />
          Related Context
        </div>
        <div className="space-y-1.5">
          {getRelatedContext(mission).map((rel, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${rel.bg}`}>
                {rel.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 truncate">{rel.title}</p>
                <p className="text-[10px] text-slate-400">{rel.meta}</p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── PEOPLE INVOLVED: Who needs to act? ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          People Involved
        </div>
        <div className="space-y-2">
          {getPeople(mission).map((person, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0 ${person.color}`}>
                {person.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800">{person.name}</p>
                <p className="text-[10px] text-slate-400">{person.role}</p>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${person.statusClass}`}>
                {person.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── DOCUMENT TIMELINE ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Document Timeline
        </div>
        <div className="space-y-2 relative pl-4">
          <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-100" />
          {getTimeline(mission).map((event, i) => (
            <div key={i} className="relative flex items-start gap-2.5">
              <div className={`absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${event.dotColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800">{event.event}</p>
                <p className="text-[10px] text-slate-400">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── QUICK COLLABORATE ─── */}
      <div className="grid grid-cols-2 gap-2 pb-4">
        <button
          onClick={() => onExecuteAction('share-legal', 'Share with Legal')}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-500" />
          Share with Legal
        </button>
        <button
          onClick={() => onExecuteAction('approve', 'Approve & Sign')}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Approve & Sign
        </button>
      </div>
    </div>
  );
};

// ─── Context helpers — derive related items from mission ────────────────────

function getRelatedContext(mission: WorkMission) {
  const found = mission.whatChatrFound;
  const title = mission.goalTitle.toLowerCase();

  if (title.includes('agreement') || title.includes('contract') || title.includes('amend')) {
    return [
      { title: 'Original MSA signed Nov 2024', meta: 'Previous contract · Legal', bg: 'bg-indigo-50', icon: <FileText className="w-3.5 h-3.5 text-indigo-500" /> },
      { title: 'Email thread: Pricing discussion', meta: '3 emails · 2 days ago', bg: 'bg-blue-50', icon: <Mail className="w-3.5 h-3.5 text-blue-500" /> },
      { title: 'Invoice #2024-0847 · Pending', meta: 'Finance · Unpaid', bg: 'bg-amber-50', icon: <Briefcase className="w-3.5 h-3.5 text-amber-500" /> },
      { title: 'Signing meeting · Tomorrow 3PM', meta: 'Calendar · Zoom', bg: 'bg-emerald-50', icon: <Calendar className="w-3.5 h-3.5 text-emerald-500" /> },
    ];
  }
  if (title.includes('profile') || title.includes('linkedin') || title.includes('resume') || title.includes('optimize')) {
    return [
      { title: 'Job description: Data Center Lead', meta: 'Active · UK market', bg: 'bg-blue-50', icon: <Briefcase className="w-3.5 h-3.5 text-blue-500" /> },
      { title: 'Previous profile version · Oct 2024', meta: 'Your profile history', bg: 'bg-slate-50', icon: <FileText className="w-3.5 h-3.5 text-slate-400" /> },
      { title: '14 keyword gaps identified', meta: 'vs target job description', bg: 'bg-amber-50', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> },
    ];
  }
  if (title.includes('pathology') || title.includes('medical') || title.includes('health') || title.includes('clinical')) {
    return [
      { title: 'Previous report · Jan 2026', meta: 'Hospital · 6 months ago', bg: 'bg-blue-50', icon: <FileText className="w-3.5 h-3.5 text-blue-500" /> },
      { title: 'Physician appointment scheduled', meta: 'Calendar · Next week', bg: 'bg-emerald-50', icon: <Calendar className="w-3.5 h-3.5 text-emerald-500" /> },
      { title: 'Key parameter trend: Stable (6mo)', meta: 'Health history', bg: 'bg-indigo-50', icon: <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> },
    ];
  }
  if (title.includes('tax') || title.includes('nps') || title.includes('investment') || title.includes('pension')) {
    return [
      { title: 'Previous year investment receipt', meta: 'Finance · FY 2023-24', bg: 'bg-blue-50', icon: <FileText className="w-3.5 h-3.5 text-blue-500" /> },
      { title: 'Tax filing deadline reminder', meta: 'Calendar · July 31', bg: 'bg-amber-50', icon: <Calendar className="w-3.5 h-3.5 text-amber-500" /> },
    ];
  }
  if (title.includes('school') || title.includes('grade') || title.includes('summer') || title.includes('parent')) {
    return [
      { title: 'School calendar · Academic year', meta: 'Education · Events', bg: 'bg-blue-50', icon: <Calendar className="w-3.5 h-3.5 text-blue-500" /> },
      { title: 'Previous term circular', meta: 'School · Last term', bg: 'bg-slate-50', icon: <FileText className="w-3.5 h-3.5 text-slate-400" /> },
    ];
  }
  return [
    { title: `Related document · ${found[0] ? found[0].slice(0, 40) : 'Previous version'}`, meta: 'Files · Recent', bg: 'bg-slate-50', icon: <FileText className="w-3.5 h-3.5 text-slate-400" /> },
    { title: 'Related email thread', meta: '5 messages', bg: 'bg-blue-50', icon: <Mail className="w-3.5 h-3.5 text-blue-500" /> },
  ];
}

function getPeople(mission: WorkMission) {
  const title = mission.goalTitle.toLowerCase();

  if (title.includes('agreement') || title.includes('contract') || title.includes('amend')) {
    return [
      { initials: 'YO', name: 'You (Reviewing Party)', role: 'Owner · Decision maker', color: 'bg-indigo-600', status: 'Reviewing', statusClass: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
      { initials: 'SP', name: 'Service Provider', role: 'Signatory · Waiting', color: 'bg-emerald-600', status: 'Waiting', statusClass: 'bg-amber-50 text-amber-700 border-amber-100' },
      { initials: 'LC', name: 'Legal Counsel', role: 'Review required', color: 'bg-slate-500', status: 'Not notified', statusClass: 'bg-slate-50 text-slate-500 border-slate-200' },
    ];
  }
  if (title.includes('clinical') || title.includes('health') || title.includes('medical')) {
    return [
      { initials: 'PA', name: 'Patient', role: 'Report subject', color: 'bg-blue-600', status: 'Active', statusClass: 'bg-blue-50 text-blue-700 border-blue-100' },
      { initials: 'DR', name: 'Treating Physician', role: 'Requires report copy', color: 'bg-emerald-600', status: 'Pending', statusClass: 'bg-amber-50 text-amber-700 border-amber-100' },
    ];
  }
  return [
    { initials: 'YO', name: 'You (Owner)', role: 'Primary stakeholder', color: 'bg-indigo-600', status: 'Active', statusClass: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { initials: 'TM', name: 'Team Member', role: 'Stakeholder', color: 'bg-slate-500', status: 'Pending', statusClass: 'bg-amber-50 text-amber-700 border-amber-100' },
  ];
}

function getTimeline(mission: WorkMission) {
  return [
    { event: 'Document opened in CHATR', time: 'Just now', dotColor: 'bg-indigo-500' },
    { event: 'CHATR analysed & built workspace', time: '2 seconds ago', dotColor: 'bg-indigo-400' },
    { event: 'Document created', time: 'Yesterday', dotColor: 'bg-slate-300' },
    { event: 'Last modified', time: '3 days ago', dotColor: 'bg-slate-200' },
  ];
}

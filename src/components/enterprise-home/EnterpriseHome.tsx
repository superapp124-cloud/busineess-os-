import React, { useState } from 'react';
import {
  ShieldAlert, Bot, Clock, Play, CheckCircle2, ArrowRight,
  Calendar, MessageSquare, FileText, Plus, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import { MissionExecutionContext } from '../../core/types';
import { identityRuntime } from '../../core/identity/IdentityRuntime';
import { intentStore } from '../../core/intent/IntentStore';
import { customerEvidenceFramework } from '../../core/evaluation/CustomerEvidenceFramework';
import { UniversalInspectorModal, InspectorPayload } from '../enterprise-shell/UniversalInspectorModal';

interface Props {
  missionContext: MissionExecutionContext | null;
  onNavigate?: (domain: string) => void;
}

export const EnterpriseHome: React.FC<Props> = ({ missionContext, onNavigate }) => {
  const [inspectorPayload, setInspectorPayload] = useState<InspectorPayload | null>(null);

  // Live Subsystem Singletons
  const digitalWorkers = identityRuntime.getIdentitiesByType('DIGITAL_WORKER');
  const installedPacks = intentStore.listInstalledPacks();

  return (
    <>
      <div className="flex-1 bg-slate-50 overflow-y-auto p-8 space-y-8 select-none font-sans">
        
        {/* 1. HERO AREA: Simple Human Welcome */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center relative overflow-hidden">
          <div className="space-y-3 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Everything is running normally.
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Good Morning, Arshid.</h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              You have <span className="text-amber-300 font-bold">2 approvals</span>, <span className="text-indigo-300 font-bold">3 meetings</span>, and <span className="text-emerald-300 font-bold">14 AI tasks completed overnight</span>. Nothing critical requires immediate attention.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <button
              onClick={() => onNavigate?.('ws_recruitment')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
              <span>Continue Today's Work</span>
            </button>
          </div>
        </div>

        {/* 2. 🔴 NEEDS YOUR ATTENTION (2) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h2 className="text-base font-bold text-slate-900">Needs Your Attention (2)</h2>
            </div>
            <button onClick={() => onNavigate?.('inbox')} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
              See All →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Approval 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Recruitment
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">Approve Candidate Offer — Senior L5 Platform Engineer</h3>
                  <p className="text-xs text-slate-500">Candidate: Deepu Kumar · Offer Compensation: $220,000 USD</p>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => onNavigate?.('ws_recruitment')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Review Offer
                </button>
              </div>
            </div>

            {/* Approval 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    Finance
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">Review Supplier Invoice — INV-28491 Disbursal</h3>
                  <p className="text-xs text-slate-500">Vendor: HDFC Ergo Motor Policy · Amount: $48,500 USD</p>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => onNavigate?.('ws_finance')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Review Invoice
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CONTINUE WHERE YOU LEFT OFF */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-4.5 h-4.5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Continue Where You Left Off</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-300 transition-all flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-900">Resume Screening</div>
                <div className="text-[11px] text-slate-500 mt-0.5">L5 Platform Candidate Matching · 72% evaluated</div>
              </div>
              <button onClick={() => onNavigate?.('ws_recruitment')} className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                Continue
              </button>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-300 transition-all flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-900">Invoice Approval</div>
                <div className="text-[11px] text-slate-500 mt-0.5">SAP PO 3-Way Match Verification · Pending</div>
              </div>
              <button onClick={() => onNavigate?.('ws_finance')} className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                Continue
              </button>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-300 transition-all flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-900">Clinical Care Plan</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Metformin + Contrast Dye Review · Waiting</div>
              </div>
              <button onClick={() => onNavigate?.('ws_hospital')} className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* 4. TODAY'S SCHEDULE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Today's Schedule</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
              <div className="font-bold text-indigo-900">10:00 AM — Executive Meeting</div>
              <div className="text-[11px] text-indigo-700">Q3 Roadmap & Strategy Align</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="font-bold text-slate-800">02:00 PM — Candidate Interview</div>
              <div className="text-[11px] text-slate-500">Deepu Kumar (L5 Engineer)</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="font-bold text-slate-800">04:30 PM — Finance Review</div>
              <div className="text-[11px] text-slate-500">SAP S/4HANA Vendor Audit</div>
            </div>
          </div>
        </div>

        {/* 5. AI FINISHED OVERNIGHT & YOUR AI TEAM */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* AI Finished Overnight */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">AI Finished Overnight</h2>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>✓ Reviewed 14 resumes for Senior L5 Engineer</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>✓ Processed 18 supplier invoices against SAP ERP</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>✓ Flagged 2 prescription drug interaction risks</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>✓ Updated 5 employment contract liability clauses</span>
              </div>
            </div>
          </div>

          {/* Your AI Team */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-4.5 h-4.5 text-violet-600" />
                <h2 className="text-base font-bold text-slate-900">Your AI Team</h2>
              </div>
              <button onClick={() => onNavigate?.('agents')} className="text-xs font-bold text-violet-600 hover:underline cursor-pointer">
                View All →
              </button>
            </div>
            <div className="space-y-2.5">
              {digitalWorkers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center">
                      {worker.name.substring(0, 1)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{worker.name}</div>
                      <div className="text-[10px] text-slate-500">{worker.department} · Updated 10s ago</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 6. RECENT CONVERSATIONS & RECENT DOCUMENTS */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Recent Conversations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Conversations</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => onNavigate?.('chat')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-bold text-slate-800 transition-colors cursor-pointer">
                # finance-approvals
              </button>
              <button onClick={() => onNavigate?.('chat')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-bold text-slate-800 transition-colors cursor-pointer">
                # hr-recruitment
              </button>
              <button onClick={() => onNavigate?.('chat')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-bold text-slate-800 transition-colors cursor-pointer">
                # legal-review
              </button>
              <button onClick={() => onNavigate?.('chat')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-bold text-slate-800 transition-colors cursor-pointer">
                # sales-pipeline
              </button>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Documents</h2>
            </div>
            <div className="space-y-2 text-xs">
              <button onClick={() => onNavigate?.('docs')} className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex justify-between items-center cursor-pointer">
                <span>Supplier Invoice INV-28491.pdf</span>
                <span className="text-[10px] text-slate-400 font-mono">Today</span>
              </button>
              <button onClick={() => onNavigate?.('docs')} className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex justify-between items-center cursor-pointer">
                <span>Candidate Resume - Deepu Kumar.pdf</span>
                <span className="text-[10px] text-slate-400 font-mono">Today</span>
              </button>
              <button onClick={() => onNavigate?.('docs')} className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex justify-between items-center cursor-pointer">
                <span>Medical Report - Patient #9912.pdf</span>
                <span className="text-[10px] text-slate-400 font-mono">Yesterday</span>
              </button>
            </div>
          </div>

        </div>

        {/* 7. QUICK ACTIONS & BUSINESS HEALTH */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Quick Actions */}
          <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => onNavigate?.('docs')} className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4 text-indigo-600" /> Upload Document
              </button>
              <button onClick={() => onNavigate?.('chat')} className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4 text-indigo-600" /> Ask AI
              </button>
              <button onClick={() => onNavigate?.('tasks')} className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4 text-indigo-600" /> Create Task
              </button>
              <button onClick={() => onNavigate?.('calendar')} className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4 text-indigo-600" /> Schedule Meeting
              </button>
            </div>
          </div>

          {/* Business Health */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Business Health</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Everything running normally
              </div>
            </div>
            <button onClick={() => onNavigate?.('health')} className="mt-4 w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-center">
              View Details
            </button>
          </div>

        </div>

      </div>

      <UniversalInspectorModal
        isOpen={Boolean(inspectorPayload)}
        onClose={() => setInspectorPayload(null)}
        payload={inspectorPayload}
      />
    </>
  );
};

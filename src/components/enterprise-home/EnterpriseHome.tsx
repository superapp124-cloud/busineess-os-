import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Bot, Clock, Play, CheckCircle2, ArrowRight,
  Calendar, MessageSquare, FileText, Plus, Sparkles, AlertCircle, RefreshCw,
  UploadCloud, CheckSquare, Zap
} from 'lucide-react';
import { MissionExecutionContext } from '../../core/types';
import { identityRuntime } from '../../core/identity/IdentityRuntime';
import { intentStore } from '../../core/intent/IntentStore';
import { UniversalInspectorModal, InspectorPayload } from '../enterprise-shell/UniversalInspectorModal';
import { supabase } from '@/integrations/supabase/client';

import { DocumentStore } from '../workspace/services/documentStore';
import { WorkspaceItem } from '../workspace/adapters/types';

interface Props {
  missionContext: MissionExecutionContext | null;
  onNavigate?: (domain: string) => void;
  onUploadClick?: () => void;
}

export const EnterpriseHome: React.FC<Props> = ({ missionContext, onNavigate, onUploadClick }) => {
  const [inspectorPayload, setInspectorPayload] = useState<InspectorPayload | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [recentDocs, setRecentDocs] = useState<WorkspaceItem[]>([]);

  useEffect(() => {
    DocumentStore.getAllDocuments()
      .then(items => setRecentDocs(items || []))
      .catch(err => console.warn('[EnterpriseHome] Failed to load recent docs:', err));
  }, []);

  // Calculate dynamic greeting based on local time
  const hour = new Date().getHours();
  const timeGreeting = hour >= 5 && hour < 12 ? 'Good Morning' : hour >= 12 && hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Fetch real logged-in user name or profile name
  useEffect(() => {
    async function fetchUser() {
      const cleanName = (val: string | undefined | null) => {
        if (!val) return null;
        const s = val.trim();
        if (/^\d+$/.test(s)) return null;
        const first = s.split(/[._\s-]/)[0];
        if (!first) return null;
        return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
      };

      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (user) {
          const meta = user.user_metadata;
          const metaName = cleanName(meta?.full_name || meta?.name || meta?.company_name || meta?.business_name || meta?.display_name);
          if (metaName && metaName.toLowerCase() !== 'talentxcel' && metaName.toLowerCase() !== 'user') {
            setUserName(metaName);
            return;
          }

          if (user.email) {
            const emailName = cleanName(user.email.split('@')[0]);
            if (emailName && emailName.toLowerCase() !== 'user') {
              setUserName(emailName);
              return;
            }
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('username, primary_handle, business_name, company_name')
            .eq('id', user.id)
            .maybeSingle();

          const profileName = cleanName(profile?.username || profile?.business_name || profile?.company_name || profile?.primary_handle);
          if (profileName && profileName.toLowerCase() !== 'talentxcel' && profileName.toLowerCase() !== 'user') {
            setUserName(profileName);
            return;
          }
        }
      } catch (e) {
        // Fallback below
      }

      const stored = localStorage.getItem('chatr_user_name') || localStorage.getItem('user_name') || localStorage.getItem('chatr_user_handle');
      const storedName = cleanName(stored);
      if (storedName && storedName.toLowerCase() !== 'talentxcel' && storedName.toLowerCase() !== 'user' && storedName.toLowerCase() !== 'arshid') {
        setUserName(storedName);
      } else {
        setUserName('');
      }
    }
    fetchUser();
  }, []);

  const greetingHeading = userName ? `${timeGreeting}, ${userName}.` : `${timeGreeting}!`;

  return (
    <>
      <div className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-6 select-none font-sans max-w-7xl mx-auto">
        
        {/* 1. HERO AREA: Welcome & Simple Purpose */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">{greetingHeading}</h1>
              <p className="text-slate-300 text-xs mt-0.5">
                Upload any document to instantly get summaries, key insights, and AI answers, or start a new task.
              </p>
            </div>
          </div>

          <button
            onClick={() => { onNavigate?.('docs'); onUploadClick?.(); }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* 2. ⚡ QUICK ACTIONS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => { onNavigate?.('docs'); onUploadClick?.(); }}
              className="p-4 rounded-2xl bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-md transition-all text-left space-y-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Upload Document</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Analyze PDFs, Word docs, contracts, or invoices</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('chat')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left space-y-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Ask AI Anything</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Chat with AI, draft emails, or ask questions</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('tasks')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left space-y-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Create Task</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Organize your to-do items and follow-ups</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('calendar')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left space-y-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Schedule Meeting</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Set up calendar events and appointments</div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. 🎯 WHAT YOU CAN ACHIEVE (SIMPLE 3-STEP GUIDE) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              How CHATR Works for You
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs pt-1">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Upload Any File</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Drag & drop PDFs, Word documents, invoices, or resumes. CHATR reads them instantly.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Instant AI Summary</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Get clear bullet-point summaries, key highlights, and risk alerts without reading long pages.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Ask Questions & Act</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Ask AI anything about the document, generate automated replies, or export key insights.
              </p>
            </div>
          </div>
        </div>

        {/* 4. 🔴 NEEDS YOUR ATTENTION */}
        {missionContext && (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <h2 className="text-sm font-bold text-slate-900">Needs Your Attention (1)</h2>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-indigo-300 transition-all flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    Document Review
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Ready for Review</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{missionContext.mission.replace(/^Analyze and Structure\s*/i, '')}</h3>
              </div>
              <button
                onClick={() => onNavigate?.('docs')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                Review Document
              </button>
            </div>
          </div>
        )}

        {/* 5. RECENT DOCUMENTS & RECENT CONVERSATIONS */}
        <div className="grid grid-cols-2 gap-5">
          
          {/* Recent Documents */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Recent Documents</h2>
              </div>
              <button onClick={() => onNavigate?.('docs')} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                View All →
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {recentDocs.length > 0 ? (
                recentDocs.slice(0, 4).map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => onNavigate?.('docs', doc.sourceUri)}
                    className="w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex justify-between items-center cursor-pointer"
                  >
                    <span className="truncate max-w-[220px] font-medium">{doc.sourceUri}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Uploaded</span>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs space-y-2">
                  <p>No documents uploaded yet.</p>
                  <button
                    onClick={() => { onNavigate?.('docs'); onUploadClick?.(); }}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    + Upload First Document
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Recent Conversations</h2>
              </div>
              <button onClick={() => onNavigate?.('chat')} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                Open Chat →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => onNavigate?.('chat')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-bold text-slate-800 transition-colors cursor-pointer">
                # General Discussion
              </button>
              <button onClick={() => onNavigate?.('chat')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-bold text-slate-800 transition-colors cursor-pointer">
                # Document Reviews
              </button>
              <button onClick={() => onNavigate?.('chat')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-bold text-slate-800 transition-colors cursor-pointer">
                # Team Tasks
              </button>
              <button onClick={() => onNavigate?.('chat')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-left font-bold text-slate-800 transition-colors cursor-pointer">
                # AI Assistant
              </button>
            </div>
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

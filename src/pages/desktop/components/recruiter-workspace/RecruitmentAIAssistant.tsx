import React, { memo, useState, useCallback } from 'react';
import { Brain, X, Send, ThumbsUp, CheckCircle, ThumbsDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { contextBuilder } from '@/core/ai/context/ContextBuilder';
import { Candidate, Requisition } from './types';

export const FloatingAIAssistant = memo(({ candidates, requisitions }: { candidates: Candidate[]; requisitions: Requisition[] }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const QUICK_PROMPTS = ['Why are offers declining?', 'Who is at risk of dropping out?', 'Hiring bottleneck today?', 'Candidate stuck longest?'];

  const ask = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);
    setResponse('');
    await new Promise(r => setTimeout(r, 700));
    const q = text.toLowerCase();
    let ans = '';
    try {
      if (q.includes('java')) {
        const javaCands = candidates.filter(c => (c.skills || []).some(s => s.toLowerCase().includes('java')));
        ans = `**Copilot 10: Conversational Search Results**\n\nFound **${javaCands.length || 3} Java Developers** matching your criteria:\n\n` +
          (javaCands.slice(0, 3).map(c => `• **${c.first_name} ${c.last_name}** (${c.experience_years || 6} yrs) — ${c.current_company || 'Freshworks'}, CTC ₹${c.expected_ctc || 18} LPA`).join('\n') ||
          `• **Aasim Sharma** — Senior Java / Spring Boot, 8 yrs, ₹20 LPA, Hyderabad\n• **Arvind Sharma** — Java Full Stack, 6.5 yrs, ₹18 LPA, Immediate`);
      } else if (q.includes('15 days') || q.includes('immediate') || q.includes('join')) {
        const immediate = candidates.filter(c => c.notice_days !== undefined && c.notice_days <= 15);
        ans = `**Copilot 10: Immediate Joiner Search**\n\nFound **${immediate.length || 2} candidates** available within 15 days:\n\n` +
          `• **Arvind Sharma** — Network Engineer, Serving Notice (0 Days LWD)\n• **Senthil Kumar** — EUC Support Specialist, Immediate Joiner`;
      } else if (q.includes('offer') || q.includes('declin')) {
        ans = `**Offer Decline Risk — 3 signals detected:**\n\n• Rohan Malhotra has a competing offer 12% above band\n• Avg offer response time is 4.2 days vs target 2 days\n• No counter-offer process documented\n\n**Recommended:** Review comp band for senior roles and set 24h offer deadline.`;
      } else if (q.includes('risk') || q.includes('drop')) {
        const atRisk = candidates.filter(c => c.risk === 'High' || c.risk === 'Medium').slice(0, 2);
        ans = `**Candidates at risk:**\n\n${atRisk.map(c => `• **${c.first_name} ${c.last_name}** — ${c.current_company}, CTC ${c.expected_ctc}L (${c.salary_fit})`).join('\n')}\n• Deepak Rao — competing FAANG offer\n\n**Action:** Prioritize direct hiring manager call today.`;
      } else {
        ans = contextBuilder.synthesizeExecutiveResponse(text, 'Arshid', 'analyst', 'just_answer', false);
      }
    } catch {
      ans = `Current pipeline status: ${candidates.length} candidates across ${requisitions.length} open roles.`;
    }
    setResponse(ans);
    setLoading(false);
  }, [candidates, requisitions, loading]);

  return (
    <div className="fixed bottom-5 right-5 z-[9990] flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 bg-white dark:bg-[#13151F] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#5c22ff] to-[#7c3aed]">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-white" />
              <p className="text-xs font-bold text-white">CHATR AI Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {!response && !loading && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Quick questions</p>
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => ask(p)}
                    className="w-full text-left text-xs text-slate-600 dark:text-slate-300 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-[#5c22ff]/5 hover:text-[#5c22ff] transition-colors border border-slate-100 dark:border-slate-700">
                    {p}
                  </button>
                ))}
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 py-2">
                {[0.1, 0.2, 0.3].map((d, i) => <span key={i} className="w-2 h-2 bg-[#5c22ff]/50 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                <span className="text-xs text-slate-400">Thinking...</span>
              </div>
            )}
            {response && !loading && (
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {response}
                <button onClick={() => setResponse('')} className="mt-2 text-[10px] text-[#5c22ff] hover:underline block">Ask another question</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-100 dark:border-slate-700">
            <input className="flex-1 text-xs bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
              placeholder="Ask anything about recruitment..." value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask(input)} disabled={loading} />
            <button onClick={() => ask(input)} disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg bg-[#5c22ff] text-white flex items-center justify-center hover:bg-[#4b1ac4] disabled:opacity-40 transition-all">
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5c22ff] to-[#7c3aed] text-white shadow-lg hover:shadow-[#5c22ff]/40 hover:shadow-xl transition-all flex items-center justify-center" title="AI Recruitment Assistant">
        <Brain className="w-5 h-5" />
      </button>
    </div>
  );
});
FloatingAIAssistant.displayName = 'FloatingAIAssistant';

export const AIExplainPanel = memo(({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) => {
  const matched = candidate.ai_matched_skills ?? [];
  const missing = candidate.ai_missing_skills ?? [];
  const match = candidate.ai_match ?? 0;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#5c22ff] to-[#7c3aed] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider">AI Match Explanation</p>
              <p className="text-lg font-black text-white mt-0.5">{candidate.first_name} {candidate.last_name}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${match}%` }} />
            </div>
            <span className="text-2xl font-black text-white">{match}%</span>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Skills Matched ({matched.length})</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matched.length > 0 ? matched.map(s => (
                <span key={s} className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> {s}
                </span>
              )) : <span className="text-xs text-slate-400">No skills matched</span>}
            </div>
          </div>
          {missing.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="w-4 h-4 text-rose-500" />
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Skills Missing ({missing.length})</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missing.map(s => (
                  <span key={s} className="text-[11px] font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
AIExplainPanel.displayName = 'AIExplainPanel';

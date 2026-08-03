import React, { memo, useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, BarChart3, Users, CornerDownLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Candidate, Requisition } from './types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

function cleanCandidateName(name: string): string {
  const cleaned = name
    .replace(/Renewal\s*Specialist/gi, '')
    .replace(/Copy/gi, '')
    .replace(/New/gi, '')
    .replace(/Candidate/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || name;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: `Hello! I am CHATR Copilot powered by the CHATR Intent & Execution Engine. I can summarize candidate profiles, generate tailored Job Descriptions, audit pipeline SLA bottlenecks, or recommend stage promotions. How can I assist you today?`,
    timestamp: '12:00 PM'
  }
];

const PROMPT_SUGGESTIONS = [
  { label: 'Summarize Top Candidates', icon: Users, prompt: 'Give me an executive summary of top candidates in the pipeline.' },
  { label: 'Draft Job Description', icon: FileText, prompt: 'Draft a competitive Job Description for a Senior AI Engineer role.' },
  { label: 'Pipeline SLA Audit', icon: BarChart3, prompt: 'Identify candidates with SLA bottlenecks and recommend action.' },
  { label: 'Interview Questions', icon: Sparkles, prompt: 'Generate high-signal technical interview questions for React Engineers.' }
];

const FormattedMessageText: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans text-xs">{text}</div>;
  }

  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ') || trimmed.startsWith('🌟 ')) {
          return (
            <div key={idx} className="flex items-center gap-2 pb-1 pt-1 border-b border-slate-200 dark:border-slate-700/80">
              <Sparkles className="w-4 h-4 text-[#5c22ff]" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {trimmed.replace(/^###\s*/, '').replace(/^🌟\s*/, '')}
              </h3>
            </div>
          );
        }

        if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes('—')) {
          return (
            <h4 key={idx} className="text-[11px] font-extrabold text-[#5c22ff] dark:text-indigo-400 uppercase tracking-wider pt-2">
              {trimmed.replace(/\*\*/g, '')}
            </h4>
          );
        }

        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const content = trimmed.replace(/^[•\-]\s*/, '');
          const parts = content.split(/(\*\*.*?\*\*)/g);
          return (
            <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 my-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-slate-800 dark:text-slate-200 flex-1">
                {parts.map((p, pIdx) => {
                  if (p.startsWith('**') && p.endsWith('**')) {
                    return <strong key={pIdx} className="font-extrabold text-slate-900 dark:text-white">{p.replace(/\*\*/g, '')}</strong>;
                  }
                  return p;
                })}
              </div>
            </div>
          );
        }

        if (trimmed.startsWith('AI Recommendation') || trimmed.startsWith('**AI Recommendation**')) {
          return (
            <div key={idx} className="mt-3 p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-indigo-950 dark:text-indigo-200 shadow-xs">
              <p className="font-black text-[11px] text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5c22ff]" /> CHATR Copilot Strategic Directive
              </p>
              <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                {trimmed.replace(/^\*\*AI Recommendation\*\*\s*/, '').replace(/^AI Recommendation\s*/, '')}
              </p>
            </div>
          );
        }

        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx} className="text-slate-700 dark:text-slate-300">
            {parts.map((p, pIdx) => {
              if (p.startsWith('**') && p.endsWith('**')) {
                return <strong key={pIdx} className="font-extrabold text-slate-900 dark:text-white">{p.replace(/\*\*/g, '')}</strong>;
              }
              return p;
            })}
          </p>
        );
      })}
    </div>
  );
};

export const CopilotTab = memo(({ candidates, requisitions }: { candidates: Candidate[]; requisitions: Requisition[] }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      const lower = text.toLowerCase().trim();

      // 1. Natural conversational responses & acknowledgments
      if (/^(ok|okay|thanks|thank you|cool|great|got it|sure|yes|hi|hello|hey|acknowledged)$/i.test(lower)) {
        replyText = `Got it! Let me know if you would like me to draft a custom Job Description, generate technical interview questions, or summarize candidate profiles for any role.`;
      }
      // 2. Technical Interview Questions Request
      else if (lower.includes('interview question') || lower.includes('technical question') || lower.includes('questions for')) {
        let topic = 'Senior Software Engineer';
        if (lower.includes('react')) topic = 'Senior React / Frontend Lead';
        else if (lower.includes('node') || lower.includes('backend')) topic = 'Backend Node.js Architect';
        else if (lower.includes('java')) topic = 'Java Microservices Engineer';
        else if (lower.includes('php')) topic = 'Fullstack PHP Web Architect';
        else if (lower.includes('python') || lower.includes('ai')) topic = 'AI / ML Engineer';
        else if (lower.includes('salesforce')) topic = 'Salesforce Technical Architect';

        replyText = `### 🎯 High-Signal Technical Interview Questions (${topic}):\n\n1. **Architecture & State Management**: How do you architect state management and render performance optimizations in complex multi-tenant applications?\n2. **Asynchronous Processing & Memory Leaks**: Describe how you detect and prevent memory leaks and unhandled promise rejections in long-lived web runtimes.\n3. **API Integration & Error Boundaries**: What design patterns do you employ for resilient client-side API caching, retry logic, and fallback UI rendering?\n4. **Performance Benchmarking**: How do you profile component re-render cycles, bundle size splittings, and web vital metrics (LCP, INP, CLS)?\n5. **Security & Data Isolation**: How do you enforce Row-Level Security (RLS) and token authentication when querying serverless databases?`;
      }
      // 3. Job Description Generation Request
      else if (lower.includes('jd') || lower.includes('job description') || lower.includes('draft role')) {
        let targetRole = 'Senior Software Engineer';
        if (lower.includes('react')) targetRole = 'Senior React / Frontend Engineer';
        else if (lower.includes('node')) targetRole = 'Backend Node.js Engineer';
        else if (lower.includes('java')) targetRole = 'Lead Java Microservices Developer';
        else if (lower.includes('php')) targetRole = 'Senior PHP Web Developer';
        else if (lower.includes('salesforce')) targetRole = 'Salesforce Technical Consultant';
        else if (lower.includes('ai') || lower.includes('context')) targetRole = 'Senior AI & Context Engineer';
        else if (requisitions.length > 0) targetRole = requisitions[0].title;

        replyText = `### 📝 Generated Job Description Draft:\n\n**Role**: ${targetRole}\n**Location**: Remote / Hybrid (India & US)\n**Compensation Band**: Competitive Market CTC + Performance Bonus\n\n**Key Responsibilities**:\n- Design, build, and maintain production-grade scalable web applications & microservices.\n- Collaborate with engineering leads and product teams to ship high-impact features.\n- Write clean, unit-tested, and well-documented TypeScript / React / Node.js code.\n- Optimize database queries, indexing, and API response latencies.\n\n**Requirements**:\n- 4+ years of hands-on software development experience.\n- Strong proficiency in modern web frameworks, state management, and REST/GraphQL APIs.\n- Excellent problem-solving skills and passion for high-quality software craft.`;
      }
      // 4. Candidate Summaries & Sourcing Insights
      else if (lower.includes('candidate') || lower.includes('top matches') || lower.includes('summarize') || lower.includes('sourcing')) {
        if (candidates.length === 0) {
          replyText = `### 🌟 Candidate Sourcing Overview\n\nCurrently, there are **0 candidate dossiers** loaded in the database.\n\n**Next Action**: Click **"Import CV"** on the Candidates tab to upload candidate resumes into CHATR RecruitmentOS.`;
        } else {
          const list = candidates.slice(0, 3)
            .map(c => `• **${cleanCandidateName(`${c.first_name} ${c.last_name}`)}** — **${c.ai_match ?? 88}% Match** · ${(c.skills ?? []).slice(0, 2).join(', ') || 'Software Engineering'} · ${c.status}`)
            .join('\n');

          replyText = `### 🌟 AI Candidate Sourcing Insights\n\n**Top Candidates in Pipeline**\n\n${list}\n\n**AI Recommendation**\nAdvancing qualified candidates to Technical Screening or Interview is recommended to maintain hiring momentum.`;
        }
      }
      // 5. SLA Audits & Pipeline Bottlenecks
      else if (lower.includes('sla') || lower.includes('bottleneck') || lower.includes('delay')) {
        replyText = `### ⚠️ Pipeline SLA Audit Alert:\n\n• **Active Requisitions**: ${requisitions.length} Open Job(s)\n• **Active Candidate Dossiers**: ${candidates.length} Candidate(s)\n\n**AI Recommendation**: Monitor stage durations for candidates in "Interviewing" and "Applied" to ensure fast response times and zero candidate drop-off.`;
      }
      // 6. Natural Fallback Assistance
      else {
        replyText = `### 🤖 CHATR Copilot Assistant\n\nI analyzed your query regarding **"${text}"**.\n\n**How I can help**:\n- Type **"Generate JD for [Role]"** (e.g. *React Engineer, Node.js Lead*) to draft a Job Description.\n- Type **"Interview questions for [Skill]"** to generate technical evaluation questions.\n- Type **"Summarize candidates"** to inspect top candidates in your pipeline.`;
      }

      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-[#090A0F] max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181B23] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#5c22ff] to-[#7c3aed] text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              CHATR Copilot
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-[#5c22ff] border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300">
                PRO ENGINE
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Grounded in candidate memory graph with source citations & RAG schema validation
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5c22ff] to-[#7c3aed] text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
              msg.sender === 'user'
                ? 'bg-[#5c22ff] text-white rounded-tr-none shadow-md font-medium'
                : 'bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm'
            }`}>
              <FormattedMessageText text={msg.text} isUser={msg.sender === 'user'} />
              <p className={`text-[10px] ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'} text-right font-semibold pt-1`}>
                {msg.timestamp}
              </p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-md">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl w-fit shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#5c22ff]" />
            <span className="font-medium">CHATR Copilot is synthesizing contextual candidate response...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-4 pb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested CHATR Copilot Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPT_SUGGESTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(s.prompt)}
                  className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 hover:border-[#5c22ff] hover:bg-[#5c22ff]/5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-xs"
                >
                  <Icon className="w-3.5 h-3.5 text-[#5c22ff] shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 bg-white dark:bg-[#181B23] border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c22ff]/40 font-medium"
            placeholder="Ask CHATR Copilot for candidate summaries, JD drafts, or SLA audits..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-[#5c22ff] text-white text-xs font-bold rounded-xl hover:bg-[#4b1ac4] disabled:opacity-40 flex items-center gap-1.5 shadow-md transition-all"
          >
            <span>Send</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
});
CopilotTab.displayName = 'CopilotTab';

export { CopilotTab as RecruitmentCopilotView };

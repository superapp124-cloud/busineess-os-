import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Send, Sparkles, PenLine, Phone, MessageSquare, Calendar, Mail,
  FileText, Globe, BookOpen, Users, CheckSquare, Camera, Brain,
  Clock, ChevronRight, X, Loader2, ArrowLeft, Settings, Bell,
  Zap, Shield, RefreshCw, Bot, Search, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/native/useSpeechRecognition';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import chatAiRobot from '@/assets/chat-ai-robot.png';
import { AIMarkdownRenderer } from '@/components/ai/AIMarkdownRenderer';
import { useInstantCache } from '@/hooks/useInstantCache';
import { healthQueryEngine } from '@/services/health/HealthQueryEngine';
import { localAIEngine } from '@/services/ai/LocalAIEngine';
import { LocalAIDiagnosticModal } from '@/components/ai/LocalAIDiagnosticModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  source?: 'ollama' | 'cloud' | 'local';
}

function generateSmartChatSIReply(query: string, name?: string): string {
  const q = query.toLowerCase().trim();
  const greetingName = name ? ` ${name}` : '';

  if (healthQueryEngine.canHandle(query)) {
    return healthQueryEngine.query(query, name).answer;
  }

  if (/^(hi|hello|hey|greetings|hola|namaste|yo|good morning|good afternoon|good evening)\b/i.test(q)) {
    return `Hello${greetingName}! I'm **chatSI** — your personal SI.\n\nI understand context, remember what matters, and take action on your behalf. Just tell me what's on your mind:`;
  }
  if (/who are you|what are you|your name|introduce yourself/i.test(q)) {
    return `I'm **chatSI** — not an app, not a chatbot. I'm the SI operating layer for your phone.\n\nI can understand a conversation, draft a reply, book an appointment, research a topic, and verify it was done. All without you opening another app.`;
  }
  if (/what can you do|help|capabilities|features/i.test(q)) {
    return `I work across your entire phone:\n\n**Communicate** — Calls, Messages, WhatsApp, Email\n**Organize** — Calendar, Reminders, Tasks\n**Understand** — Documents, Images, your Screen\n**Research** — Web, Knowledge, Compare options\n**Act** — Book, Send, Schedule, Execute\n**Remember** — People, Conversations, Commitments\n\nJust tell me what you need.`;
  }
  if (/call|screening|ahmed|who called|dialer/i.test(q)) {
    return `**Recent call — Ahmed Khan** (12 min, 2:15 PM)\n\nKey points discussed:\n• Q3 project timeline review\n• Sprint deliverables due next Tuesday\n• **Your commitment**: Send updated sprint sheet before 5 PM today\n\nI've drafted the follow-up message. Want me to send it?`;
  }
  if (/draft|write|compose|text|send message|email/i.test(q)) {
    return `Here's a draft:\n\n> *"Hi team, following up on today's progress. All milestones are on track. Deliverables ready for review — let me know if adjustments are needed."*\n\nShall I send this, or adjust the tone?`;
  }
  if (/health|doctor|medicine|care|fever|headache|pain|hospital|prescription/i.test(q)) {
    return `I can connect you to Health Hub right now:\n\n• **500+ verified doctors** across 47 specialties\n• **Teleconsultation in 60 seconds**\n• **Medicine delivery** — 15 min, prescription included\n\nTap the Health Hub tab to book instantly.`;
  }
  if (/schedule|calendar|meeting|appointment|remind|task/i.test(q)) {
    return `**Today's schedule:**\n• 3:00 PM — Strategy Sync with Core Team\n• 4:30 PM — Follow-up: Ahmed (sprint sheet)\n• 6:00 PM — Evening wellness reminder\n\nOne commitment is overdue — want me to handle it now?`;
  }
  return `I've processed: **"${query}"**\n\nHere's what I can do next:\n1. Draft and send related communications\n2. Schedule a reminder or calendar event\n3. Research and give you a summary\n\nWhat would you like?`;
}

const capabilities = [
  {
    label: 'Communicate',
    icon: MessageSquare,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    iconBg: 'bg-blue-100',
    items: ['Calls', 'Messages', 'WhatsApp', 'Email'],
    query: 'Show my recent messages and calls'
  },
  {
    label: 'Organize',
    icon: Calendar,
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    iconBg: 'bg-violet-100',
    items: ['Calendar', 'Reminders', 'Tasks'],
    query: "What's on my schedule today?"
  },
  {
    label: 'Understand',
    icon: Brain,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    iconBg: 'bg-amber-100',
    items: ['Documents', 'Images', 'Screen'],
    query: 'Help me understand this document'
  },
  {
    label: 'Research',
    icon: Globe,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    iconBg: 'bg-emerald-100',
    items: ['Web', 'Knowledge', 'Compare'],
    query: 'Research this topic for me'
  },
  {
    label: 'Act',
    icon: Zap,
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    iconBg: 'bg-rose-100',
    items: ['Book', 'Send', 'Schedule', 'Execute'],
    query: 'Execute an action for me'
  },
  {
    label: 'Remember',
    icon: BookOpen,
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    iconBg: 'bg-sky-100',
    items: ['People', 'Conversations', 'Commitments'],
    query: 'What have I committed to recently?'
  }
];

const proactiveItems = [
  {
    id: '1',
    urgency: 'high',
    icon: CheckSquare,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    title: 'Follow up with Ahmed',
    subtitle: 'You promised to send the proposal today',
    action: 'Ready to send',
    actionColor: 'text-rose-600',
    query: 'Send the follow-up proposal to Ahmed'
  },
  {
    id: '2',
    urgency: 'medium',
    icon: Calendar,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50',
    title: "Tomorrow's schedule",
    subtitle: '3 meetings · 1 pending commitment',
    action: 'Review',
    actionColor: 'text-violet-600',
    query: "Show me tomorrow's schedule"
  },
  {
    id: '3',
    urgency: 'medium',
    icon: MessageSquare,
    iconColor: 'text-sky-500',
    iconBg: 'bg-sky-50',
    title: '2 messages need attention',
    subtitle: 'Vandana · Team Channel',
    action: 'Reply',
    actionColor: 'text-sky-600',
    query: 'Show the 2 messages that need my attention'
  },
  {
    id: '4',
    urgency: 'low',
    icon: Clock,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    title: 'Package delivery',
    subtitle: 'Pickup reminder tomorrow 9:00 AM',
    action: 'Got it',
    actionColor: 'text-amber-600',
    query: 'Remind me about the package pickup tomorrow'
  }
];

const recentIntelligence = [
  {
    id: '1',
    icon: Phone,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'Understood a call from Ahmed Khan',
    steps: ['Extracted 3 action items', 'Created pickup commitment', 'Draft ready to send'],
    time: '2:15 PM'
  },
  {
    id: '2',
    icon: Bell,
    iconColor: 'text-sky-500',
    iconBg: 'bg-sky-50',
    title: 'Summarized 7 notifications',
    steps: ['2 require your attention', 'Rest archived'],
    time: '9:20 AM'
  },
  {
    id: '3',
    icon: FileText,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50',
    title: 'Prepared reply to Vandana',
    steps: ['Draft written', 'Waiting for your approval'],
    time: '8:45 AM'
  }
];

export const AIAssistant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'cloud_bridge'>('checking');
  const [ollamaModel, setOllamaModel] = useState('llama3:latest');
  const [isDiagOpen, setIsDiagOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I'm chatSI — already here, already working. What do you need?",
      source: 'local'
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening, isAvailable: isSpeechAvailable } = useSpeechRecognition();

  const { data: profile } = useInstantCache('ai-user-profile', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('full_name, avatar_url, username').eq('id', user.id).maybeSingle();
    return data;
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();
  const firstName = profile?.full_name?.split(' ')[0] || profile?.username || 'there';

  useEffect(() => {
    let isMounted = true;
    const checkAI = async () => {
      try {
        const isAvail = await localAIEngine.isModelAvailable();
        if (isAvail && isMounted) {
          const runtime = localAIEngine.getRuntimeInfo();
          setOllamaStatus('connected');
          setOllamaModel(runtime.provider === 'NATIVE_LLAMA_CPP' ? 'Qwen2.5-0.5B (On-Device)' : 'Ollama (Local)');
          return;
        }
      } catch {
        // Fall back
      }

      const endpoints = ['http://localhost:11434', 'http://127.0.0.1:11434'];
      for (const ep of endpoints) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(`${ep}/api/tags`, { signal: controller.signal });
          clearTimeout(timeout);
          if (res.ok) {
            const data = await res.json();
            if (isMounted) {
              setOllamaStatus('connected');
              if (data.models && data.models.length > 0) {
                const modelNames = data.models.map((m: any) => m.name);
                const best = modelNames.find((n: string) =>
                  n.includes('llama3.2') || n.includes('phi3') || n.includes('qwen2.5') ||
                  n.includes('chatr:general') || n.includes('chatr:business')
                ) || modelNames[0];
                setOllamaModel(best);
              }
            }
            return;
          }
        } catch (e) { /* try next */ }
      }
      if (isMounted) setOllamaStatus('cloud_bridge');
    };
    checkAI();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  const handleVoiceToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeechAvailable) {
        await startListening();
      } else {
        toast({ title: 'Microphone not available', description: 'Voice input is not supported on this browser.' });
      }
    }
  };

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    const userQuery = queryText.trim();
    setInput('');
    setIsChatOpen(true);
    setMessages(prev => [...prev, {
      role: 'user',
      content: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setIsLoading(true);

    // 0. Intercept local Health OS queries immediately for instant offline response
    if (healthQueryEngine.canHandle(userQuery)) {
      const healthRes = healthQueryEngine.query(userQuery, profile?.name);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: healthRes.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local'
      }]);
      setIsLoading(false);
      return;
    }

    try {
      let assistantReply = '';
      let replySource: 'ollama' | 'cloud' | 'local' = 'cloud';

      // 1. Try On-Device / Local SI Engine (llama.cpp on Android, Ollama on desktop)
      try {
        if (await localAIEngine.isModelAvailable()) {
          const aiResult = await localAIEngine.generate(userQuery, {
            systemPrompt: 'You are chatSI, a personal on-device SI operating layer. Respond conversationally, concisely, and helpfully in the user language.',
            maxTokens: 512,
          });
          if (aiResult?.text && aiResult.provider !== 'HEURISTIC_FALLBACK') {
            assistantReply = aiResult.text;
            replySource = aiResult.provider === 'NATIVE_LLAMA_CPP' ? 'local' : 'ollama';
          }
        }
      } catch (e) {
        console.debug('[chatSI] LocalAIEngine fallback:', e);
      }

      // 2. Fallback Supabase edge
      if (!assistantReply) {
        try {
          const { data, error } = await supabase.functions.invoke('ai-chat-assistant', {
            body: {
              prompt: userQuery,
              messageText: userQuery,
              system_prompt: 'You are chatSI, the personal SI operating layer. Respond concisely and helpfully.',
              messages: [...messages.slice(-4).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userQuery }]
            }
          });
          if (!error && (data?.response || data?.summary || data?.data?.response)) {
            assistantReply = data?.response || data?.summary || data?.data?.response;
            replySource = 'cloud';
          }
        } catch (e) { /* fallback */ }
      }

      // 3. Local smart engine
      if (!assistantReply) {
        const userName = profile?.username || profile?.full_name?.split(' ')[0];
        assistantReply = generateSmartChatSIReply(userQuery, userName);
        replySource = 'local';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantReply,
        source: replySource,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error('[chatAI] handleQuery error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Something went wrong. Please try again.",
        source: 'local'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(input);
  };

  if (isChatOpen) {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-slate-100">
          <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00A884] via-[#00C29F] to-[#06D6A0] flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white fill-white/20" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900">SI Assistant</p>
              <button
                type="button"
                onClick={() => setIsDiagOpen(true)}
                className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition text-left"
                title="Open Local SI Developer Diagnostic HUD"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ollamaStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {ollamaStatus === 'connected' ? `${ollamaModel}` : 'Cloud mode'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsDiagOpen(true)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              title="Local SI Diagnostic"
            >
              <Cpu size={16} />
            </button>
            <button onClick={() => { setMessages([{ role: 'assistant', content: "Fresh start. What do you need?", source: 'local' }]); }} className="p-2 rounded-full hover:bg-slate-100">
              <RefreshCw size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-4 pb-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Sparkles size={12} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[82%] ${msg.role === 'user'
                  ? 'bg-[#0B3E36] text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
                  : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3'
                }`}>
                  {msg.role === 'assistant'
                    ? <AIMarkdownRenderer content={msg.content} />
                    : <p className="text-[14px]">{msg.content}</p>
                  }
                  {msg.timestamp && (
                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.timestamp}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 mr-2">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="px-3 pb-24 pt-2 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 bg-transparent text-[14px] text-slate-900 placeholder-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-1.5 rounded-full ${isListening ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
            >
              <Mic size={16} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-1.5 rounded-full bg-[#0B3E36] text-white disabled:opacity-40"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
        <LocalAIDiagnosticModal isOpen={isDiagOpen} onClose={() => setIsDiagOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Official Top Bar matching brand mockup */}
      <div className="px-4 pt-12 pb-2 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00A884] to-[#00C29F] flex items-center justify-center shadow-sm">
              <Sparkles size={14} className="text-white fill-white/20" />
            </div>
            <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">SI Assistant</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsDiagOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition text-slate-500 hover:text-slate-800"
              title="Local SI Diagnostic"
            >
              <Cpu size={16} />
            </button>
            <button
              onClick={() => setIsDiagOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Filter Pills matching brand mockup */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          {['Chat', 'Summarise', 'Translate', 'Compose'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'Chat') setIsChatOpen(true);
                else {
                  setInput(`${tab} for me`);
                  setIsChatOpen(true);
                  handleQuery(`${tab} for me`);
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                idx === 0
                  ? 'bg-[#0B3E36] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 pb-28">
        <div className="px-4 space-y-4 pt-4">

          {/* Glowing Aura Hero matching brand mockup */}
          <div className="relative flex flex-col items-center justify-center py-4 text-center">
            <div className="relative mb-2 flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-[#00C29F]/20 blur-xl pointer-events-none" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-cyan-50 to-blue-50 border border-cyan-100 flex items-center justify-center shadow-inner">
                <Sparkles className="w-8 h-8 text-[#00A884] fill-[#00C29F]/30" />
              </div>
            </div>
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">
              Hi! <span className="text-[#00A884]">I'm your SI.</span>
            </h2>
            <p className="text-[13px] text-slate-500 max-w-[280px] mt-1 leading-snug">
              I can help you with your conversations, calls, translations and more.
            </p>
          </div>

          {/* 5 Official Feature Cards from Brand Mockup */}
          <div className="space-y-2.5">
            {[
              {
                title: 'Summarise this chat',
                desc: 'Get key points from long conversations',
                icon: FileText,
                iconBg: 'bg-blue-100 text-blue-600',
                query: 'Summarise my latest conversation'
              },
              {
                title: 'Draft a reply',
                desc: 'Write a response in your tone',
                icon: PenLine,
                iconBg: 'bg-indigo-100 text-indigo-600',
                query: 'Draft a reply in my tone'
              },
              {
                title: 'Translate messages',
                desc: 'Translate between languages',
                icon: Bot,
                iconBg: 'bg-purple-100 text-purple-600',
                query: 'Translate a message for me'
              },
              {
                title: 'Find information',
                desc: 'Get helpful information',
                icon: Search,
                iconBg: 'bg-sky-100 text-sky-600',
                query: 'Find helpful information from my notes'
              },
              {
                title: 'Answer routine messages',
                desc: 'Let me handle simple replies for you',
                icon: MessageSquare,
                iconBg: 'bg-fuchsia-100 text-fuchsia-600',
                query: 'Handle routine replies for me'
              }
            ].map(feat => (
              <button
                key={feat.title}
                onClick={() => {
                  setInput(feat.query);
                  setIsChatOpen(true);
                  handleQuery(feat.query);
                }}
                className="w-full bg-white border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all hover:border-slate-200"
              >
                <div className={`w-10 h-10 rounded-xl ${feat.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-900 truncate">{feat.title}</p>
                  <p className="text-[12px] text-slate-500 truncate">{feat.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom input row matching brand mockup */}
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-10 h-10 rounded-full bg-[#0B3E36] text-white flex items-center justify-center shadow-md active:scale-95 transition-all flex-shrink-0"
                aria-label="SI Chat"
              >
                <Sparkles className="w-5 h-5 fill-white/20" />
              </button>
              <form onSubmit={handleSubmit} className="flex-1">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2.5 shadow-sm">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent text-[14px] text-slate-900 placeholder-slate-400 outline-none"
                  />
                  {input && (
                    <button type="submit" className="p-1 rounded-full bg-[#0B3E36] text-white">
                      <Send size={14} />
                    </button>
                  )}
                </div>
              </form>
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`w-10 h-10 rounded-full ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#0B3E36] text-white'} flex items-center justify-center shadow-md active:scale-95 transition-all flex-shrink-0`}
                aria-label="Voice"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </ScrollArea>
      <LocalAIDiagnosticModal isOpen={isDiagOpen} onClose={() => setIsDiagOpen(false)} />
    </div>
  );
};

export default AIAssistant;

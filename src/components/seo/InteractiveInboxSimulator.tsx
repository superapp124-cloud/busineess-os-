import React, { useState } from 'react';
import { Send, CheckCircle2, User, Bot, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface SimulatedMessage {
  id: string;
  sender: 'customer' | 'chatr_si' | 'agent';
  senderName: string;
  text: string;
  timestamp: string;
  intentTag?: string;
  routedTo?: string;
}

const PRESET_SCENARIOS = [
  {
    id: 'lead',
    label: 'Sales & Pricing Inquiry',
    customerPrompt: 'Hi, I need pricing for 15 team members on WhatsApp API. Can we get a demo today?',
    detectedIntent: 'Commercial / High-Intent Pricing',
    assignedAgent: 'Rahul (Enterprise Sales)',
    autoResponse: 'Hello! Thanks for reaching out to CHATR. Our SME Team plan is ₹999/mo with zero per-user charges. I have routed your request to Rahul from our enterprise team who will share the demo invite right away.',
    slaTime: '< 15 seconds'
  },
  {
    id: 'support',
    label: 'Urgent Order Support',
    customerPrompt: 'Where is my order #CH-8821? Delivery was promised by 2 PM.',
    detectedIntent: 'Post-Purchase / High Urgency',
    assignedAgent: 'Priya (Priority Support)',
    autoResponse: 'Checking order #CH-8821... Your shipment is out for delivery with courier tracking active. I have assigned Priya to share your live delivery tracking link immediately.',
    slaTime: '< 8 seconds'
  },
  {
    id: 'recruitment',
    label: 'Candidate Job Application',
    customerPrompt: 'Hello, I saw your posting for Senior Frontend Engineer in Bangalore. Here is my resume.',
    detectedIntent: 'Recruitment / Bengaluru Engineering',
    assignedAgent: 'Talent Acquisition Team',
    autoResponse: 'Welcome! Your resume has been parsed for Senior Frontend Engineer. Please confirm your preferred notice period and salary expectations to proceed to the technical screening round.',
    slaTime: '< 12 seconds'
  }
];

export const InteractiveInboxSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState(PRESET_SCENARIOS[0]);
  const [customInput, setCustomInput] = useState('');
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    {
      id: '1',
      sender: 'customer',
      senderName: 'Customer (+91 98765 XXXXX)',
      text: PRESET_SCENARIOS[0].customerPrompt,
      timestamp: 'Just now'
    },
    {
      id: '2',
      sender: 'chatr_si',
      senderName: 'CHATR SI Triage Engine',
      text: PRESET_SCENARIOS[0].autoResponse,
      timestamp: 'Just now',
      intentTag: PRESET_SCENARIOS[0].detectedIntent,
      routedTo: PRESET_SCENARIOS[0].assignedAgent
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectScenario = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    setIsProcessing(true);
    setMessages([
      {
        id: '1',
        sender: 'customer',
        senderName: 'Customer (+91 98765 XXXXX)',
        text: scenario.customerPrompt,
        timestamp: 'Just now'
      }
    ]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: '2',
          sender: 'chatr_si',
          senderName: 'CHATR SI Triage Engine',
          text: scenario.autoResponse,
          timestamp: 'Just now',
          intentTag: scenario.detectedIntent,
          routedTo: scenario.assignedAgent
        }
      ]);
      setIsProcessing(false);
    }, 600);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const userText = customInput;
    setCustomInput('');
    setIsProcessing(true);

    const newCustMsg: SimulatedMessage = {
      id: Date.now().toString(),
      sender: 'customer',
      senderName: 'You (Visitor Test)',
      text: userText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, newCustMsg]);

    setTimeout(() => {
      const autoReply: SimulatedMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'chatr_si',
        senderName: 'CHATR SI Triage Engine',
        text: `Thanks for testing CHATR! We analyzed your message: "${userText}". In production, CHATR instantly categorizes this request, routes it round-robin to the best team member, and triggers auto-acknowledgment in < 15 seconds.`,
        timestamp: 'Just now',
        intentTag: 'Live Custom Simulation',
        routedTo: 'Your Available Team Agent'
      };
      setMessages(prev => [...prev, autoReply]);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur">
      {/* Simulator Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-white text-sm">Interactive Shared Team Inbox Simulator</span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Live Demo • No Sign-up Required
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Simulated SLA: <strong className="text-white">{selectedScenario.slaTime}</strong></span>
        </div>
      </div>

      {/* Scenario Presets Selector */}
      <div className="bg-slate-900/60 p-4 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium shrink-0">Try Scenario:</span>
        {PRESET_SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => handleSelectScenario(s)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              selectedScenario.id === s.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat Thread Workspace */}
      <div className="p-6 space-y-4 min-h-[280px] max-h-[360px] overflow-y-auto bg-slate-950/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'customer' ? 'items-start' : 'items-end'}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              {msg.sender === 'customer' ? (
                <>
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{msg.senderName}</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300 font-semibold">{msg.senderName}</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                msg.sender === 'customer'
                  ? 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700'
                  : 'bg-indigo-600/20 text-indigo-100 rounded-tr-sm border border-indigo-500/30'
              }`}
            >
              <p>{msg.text}</p>

              {msg.intentTag && (
                <div className="mt-3 pt-3 border-t border-indigo-500/20 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    <Sparkles className="w-3 h-3" /> Intent: {msg.intentTag}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <ArrowRight className="w-3 h-3 text-indigo-400" /> Routed to: <strong className="text-white">{msg.routedTo}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 py-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>CHATR SI triaging message intent and assigning team owner...</span>
          </div>
        )}
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={handleSendCustom} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="Type your own customer test message (e.g. 'Can I book a consultation for Monday?')..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!customInput.trim() || isProcessing}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Simulator Footer Note */}
      <div className="px-6 py-3 bg-slate-900/40 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Official Meta WhatsApp Business API Cloud Architecture
        </span>
        <a href="/auth" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
          Deploy this workflow for your team <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

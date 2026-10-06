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
    <div className="bg-white border border-[#DDE3DF] rounded-2xl overflow-hidden shadow-sm">
      {/* Simulator Header */}
      <div className="bg-[#FAFBF9] px-6 py-4 border-b border-[#DDE3DF] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#164E3F] animate-pulse" />
          <span className="font-bold text-[#111817] text-sm">Interactive Shared Team Inbox Simulator</span>
          <span className="text-[11px] font-mono text-[#164E3F] bg-[#EAEFEA] px-2.5 py-0.5 rounded border border-[#D5E0D5]">
            Live Interactive Demo
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#53605C]">
          <Clock className="w-3.5 h-3.5 text-[#164E3F]" />
          <span>Simulated SLA: <strong className="text-[#111817]">{selectedScenario.slaTime}</strong></span>
        </div>
      </div>

      {/* Scenario Presets Selector */}
      <div className="bg-[#F8F8F5] p-3.5 border-b border-[#DDE3DF] flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[#53605C] font-medium shrink-0">Try Scenario:</span>
        {PRESET_SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => handleSelectScenario(s)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              selectedScenario.id === s.id
                ? 'bg-[#164E3F] text-white shadow-sm'
                : 'bg-white text-[#53605C] border border-[#DDE3DF] hover:bg-[#FAFBF9]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat Thread Workspace */}
      <div className="p-6 space-y-4 min-h-[280px] max-h-[360px] overflow-y-auto bg-[#FAFBF9]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'customer' ? 'items-start' : 'items-end'}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-[#53605C] mb-1">
              {msg.sender === 'customer' ? (
                <>
                  <User className="w-3 h-3 text-[#53605C]" />
                  <span>{msg.senderName}</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-[#164E3F]" />
                  <span className="text-[#164E3F] font-semibold">{msg.senderName}</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-sm ${
                msg.sender === 'customer'
                  ? 'bg-white text-[#111817] rounded-tl-sm border border-[#DDE3DF]'
                  : 'bg-[#EAEFEA] text-[#111817] rounded-tr-sm border border-[#D5E0D5]'
              }`}
            >
              <p>{msg.text}</p>

              {msg.intentTag && (
                <div className="mt-3 pt-3 border-t border-[#D5E0D5] flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-[#164E3F] font-mono font-semibold">
                    <Sparkles className="w-3 h-3" /> Intent: {msg.intentTag}
                  </span>
                  <span className="flex items-center gap-1 text-[#53605C]">
                    <ArrowRight className="w-3 h-3 text-[#164E3F]" /> Routed to: <strong className="text-[#111817]">{msg.routedTo}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-[#164E3F] py-2">
            <div className="w-2 h-2 rounded-full bg-[#164E3F] animate-ping" />
            <span>CHATR SI triaging message intent and assigning team owner...</span>
          </div>
        )}
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={handleSendCustom} className="p-4 bg-white border-t border-[#DDE3DF] flex items-center gap-3">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="Type your own test message (e.g. 'Can I book a consultation for Monday?')..."
          className="flex-1 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-4 py-2.5 text-xs md:text-sm text-[#111817] placeholder-[#83918C] focus:outline-none focus:border-[#164E3F] transition-colors"
        />
        <button
          type="submit"
          disabled={!customInput.trim() || isProcessing}
          className="px-4 py-2.5 bg-[#164E3F] hover:bg-[#123F33] disabled:opacity-40 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Simulator Footer Note */}
      <div className="px-6 py-3 bg-[#FAFBF9] border-t border-[#DDE3DF] flex items-center justify-between text-[11px] text-[#53605C] flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#164E3F]" />
          Official Meta WhatsApp Business API Cloud Architecture
        </span>
        <span className="text-[#164E3F] font-semibold flex items-center gap-1">
          Automated Round-Robin Lead Routing Active
        </span>
      </div>
    </div>
  );
};

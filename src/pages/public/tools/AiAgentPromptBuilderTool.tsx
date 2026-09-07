import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Copy, Check, ShieldCheck, Cpu, Code2, 
  Settings, Layers, Terminal 
} from 'lucide-react';
import { SEOHead } from '../../../components/SEOHead';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

interface AgentRoleConfig {
  id: string;
  name: string;
  defaultObjective: string;
  defaultGuardrails: string[];
  sampleTools: string[];
}

const ROLES: AgentRoleConfig[] = [
  {
    id: 'sdr',
    name: 'Sales Qualifier (SDR)',
    defaultObjective: 'Engage inbound website prospects via WhatsApp and chat, qualify budget and timeline (BANT), and book sales demos.',
    defaultGuardrails: [
      'Never offer discounts greater than 10% without managerial escalation.',
      'Always verify company email domain before sharing enterprise pricing.',
      'Refuse to answer questions regarding unreleased roadmap features.'
    ],
    sampleTools: ['check_availability', 'book_demo_calendar', 'enrich_company_domain']
  },
  {
    id: 'support',
    name: 'Tier-1 Customer Support',
    defaultObjective: 'Triage customer inquiries, retrieve shipping or order status, and resolve common troubleshooting steps.',
    defaultGuardrails: [
      'Do not reveal user passwords, secret keys, or PII.',
      'Escalate immediately to a human supervisor if sentiment turns hostile.',
      'Strictly refer to official CHATR documentation.'
    ],
    sampleTools: ['get_order_status', 'search_knowledge_base', 'escalate_ticket']
  },
  {
    id: 'recruiter',
    name: 'Talent & Interview Screener',
    defaultObjective: 'Screen applicant resumes, verify core technical proficiencies, and coordinate initial HR screening calls.',
    defaultGuardrails: [
      'Never discriminate based on age, gender, race, or non-technical traits.',
      'Follow strictly calibrated rubric scoring 1 through 5.',
      'Maintain an encouraging, professional tone.'
    ],
    sampleTools: ['parse_candidate_resume', 'verify_github_profile', 'schedule_interview']
  },
  {
    id: 'robotics',
    name: 'Autonomous Robotics Dispatcher',
    defaultObjective: 'Translate human operator voice intents into MuJoCo simulation waypoints and robot fleet task queues.',
    defaultGuardrails: [
      'Disallow movement commands if spatial obstacle distance is < 0.5m.',
      'Require supervisor confirmation for heavy payload liftoff.',
      'Enforce zero-torque safety stop on any anomalous feedback.'
    ],
    sampleTools: ['dispatch_waypoint', 'query_joint_temperatures', 'trigger_emergency_stop']
  }
];

export const AiAgentPromptBuilderTool: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<AgentRoleConfig>(ROLES[0]);
  const [agentName, setAgentName] = useState('CHATR Inbound Agent');
  const [tone, setTone] = useState<'Professional' | 'Casual' | 'Concise' | 'Technical'>('Professional');
  const [objective, setObjective] = useState(ROLES[0].defaultObjective);
  const [guardrails, setGuardrails] = useState<string[]>(ROLES[0].defaultGuardrails);
  const [newGuardrail, setNewGuardrail] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'ai-agent-prompt-builder' });
  }, []);

  const handleRoleChange = (role: AgentRoleConfig) => {
    setSelectedRole(role);
    setObjective(role.defaultObjective);
    setGuardrails(role.defaultGuardrails);
    trackAcquisitionEvent({
      event: 'tool_started',
      tool: 'ai-agent-prompt-builder',
      metadata: { roleId: role.id }
    });
  };

  const addGuardrail = () => {
    if (newGuardrail.trim()) {
      setGuardrails([...guardrails, newGuardrail.trim()]);
      setNewGuardrail('');
    }
  };

  const removeGuardrail = (index: number) => {
    setGuardrails(guardrails.filter((_, i) => i !== index));
  };

  const compiledPrompt = [
    'You are ' + agentName + ', an autonomous AI business agent running on the CHATR Intent Operating System.',
    'ROLE & OBJECTIVE:',
    objective,
    '',
    'COMMUNICATION STYLE & TONE:',
    '- Tone: ' + tone,
    '- Be direct, authoritative, and concise. Never produce verbose disclaimers.',
    '',
    'OPERATIONAL GUARDRAILS & BOUNDARIES:',
    ...guardrails.map((g, i) => (i + 1) + '. ' + g),
    '',
    'AVAILABLE TOOL INTEGRATIONS:',
    ...selectedRole.sampleTools.map(t => '- ' + t + '()'),
    '',
    'ERROR HANDLING PROTOCOL:',
    'If user intent is ambiguous, ask ONE targeted clarifying question before executing tools.'
  ].join('\n');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    trackAcquisitionEvent({
      event: 'tool_completed',
      tool: 'ai-agent-prompt-builder',
      metadata: { roleId: selectedRole.id, tone }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Agent Prompt & System Instructions Builder",
    "url": "https://www.chatrchat.in/tools/ai-agent-prompt-builder",
    "description": "Design production-ready system instructions, role constraints, tool-calling schemas, and safety boundaries for autonomous business agents.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All modern browsers"
  };

  return (
    <>
      <SEOHead
        title="AI Agent Prompt & System Instructions Builder | CHATR AI"
        description="Free interactive AI prompt builder. Create production-ready system instructions, role constraints, tool-calling schemas, and safety boundaries for sales and support agents."
        keywords="ai agent prompt builder, system instructions generator, llm guardrails builder, ai intent schema generator, chatr ai tool"
        schemaData={schemaData}
      />
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500 selection:text-white">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-base">
              <span className="bg-purple-600 text-white px-2 py-0.5 rounded-md text-xs font-black tracking-wider">CHATR</span>
              <span className="text-slate-400 font-medium text-xs">/ AI Agent Prompt Builder</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/chatr-ai"
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors"
              >
                CHATR AI Canvas
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
          {/* Hero */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AGENTIC SYSTEM INSTRUCTIONS STUDIO</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              AI Agent Prompt & System Schema Builder
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Generate enterprise-grade system prompts with strict safety boundaries, tool-calling definitions, and role calibrations for autonomous agents.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleChange(role)}
                        className={"p-3 rounded-xl border text-left text-xs font-semibold transition-all " + (
                          selectedRole.id === role.id
                            ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        )}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Agent Name</label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={e => setAgentName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tone</label>
                    <select
                      value={tone}
                      onChange={e => setTone(e.target.value as unknown as typeof tone)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Professional">Professional & Courteous</option>
                      <option value="Concise">Concise & Direct</option>
                      <option value="Casual">Warm & Conversational</option>
                      <option value="Technical">Technical & Precise</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Objective</label>
                  <textarea
                    rows={3}
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Safety Guardrails ({guardrails.length})</label>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    {guardrails.map((g, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-xs">
                        <span className="text-slate-300 truncate">{g}</span>
                        <button
                          type="button"
                          onClick={() => removeGuardrail(idx)}
                          className="text-slate-500 hover:text-rose-400 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom boundary or rule..."
                      value={newGuardrail}
                      onChange={e => setNewGuardrail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addGuardrail()}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={addGuardrail}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Code & Prompt Output */}
            <div className="lg:col-span-6 space-y-4 flex flex-col">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase">Compiled System Prompt</span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
                <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {compiledPrompt}
                </div>
              </div>
            </div>
          </div>

          {/* Educational GEO Content */}
          <section id="direct-answer" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white">Why are structured system prompts essential for AI Agents?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Autonomous AI agents require explicit operational boundaries, deterministic tool schemas, and strict error handling protocols to prevent unauthorized financial commitments, hallucinated promises, and prompt injection attacks. CHATR AI Canvas compiles human intent into guarded execution graphs backed by strict verification contracts.
            </p>
          </section>
        </main>
      </div>
    </>
  );
};

export default AiAgentPromptBuilderTool;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Copy, Check, ShieldCheck, Cpu, Code2, 
  Settings, Layers, Terminal, ArrowRight 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '../../../components/SEOHead';
import { LandingHeader } from '../../../components/landing/LandingHeader';
import { AuthModal } from '../../../components/landing/AuthModal';
import { Footer } from '../../../components/Footer';
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
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [selectedRole, setSelectedRole] = useState<AgentRoleConfig>(ROLES[0]);
  const [agentName, setAgentName] = useState('CHATR Inbound Agent');
  const [tone, setTone] = useState<'Professional' | 'Casual' | 'Concise' | 'Technical'>('Professional');
  const [objective, setObjective] = useState(ROLES[0].defaultObjective);
  const [guardrails, setGuardrails] = useState<string[]>(ROLES[0].defaultGuardrails);
  const [newGuardrail, setNewGuardrail] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'ai-agent-prompt-builder' });

    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) setIsAuthenticated(true);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
        setAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

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
    'You are ' + agentName + ', an autonomous SI business agent running on the CHATR Intent Operating System.',
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

  const handleLaunchAgent = () => {
    trackAcquisitionEvent({
      event: 'cta_clicked',
      tool: 'ai-agent-prompt-builder',
      metadata: { cta: 'launch_agent_workspace', roleId: selectedRole.id }
    });
    if (isAuthenticated) {
      navigate('/desktop/home');
    } else {
      setAuthModalOpen(true);
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SI Agent Prompt & System Instructions Builder",
    "url": "https://www.chatrchat.in/tools/ai-agent-prompt-builder",
    "description": "Design production-ready system instructions, role constraints, tool-calling schemas, and safety boundaries for autonomous business agents.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All modern browsers"
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="SI Agent Prompt & System Instructions Builder | CHATR SI"
        description="Free interactive SI prompt builder. Create production-ready system instructions, role constraints, tool-calling schemas, and safety boundaries for sales and support agents."
        canonicalUrl="https://www.chatrchat.in/tools/ai-agent-prompt-builder"
        keywords="si agent prompt builder, system instructions generator, llm guardrails builder, ai intent schema generator, chatr ai tool"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 flex-1">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>AGENTIC SYSTEM INSTRUCTIONS STUDIO • 100% FREE TOOL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#111817] tracking-tight leading-tight">
            SI Agent Prompt &amp; <span className="text-[#164E3F]">System Schema Builder</span>
          </h1>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Generate enterprise-grade system prompts with strict safety boundaries, tool-calling definitions, and role calibrations for autonomous agents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#53605C]">Target Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROLES.map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={"p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer " + (
                        selectedRole.id === role.id
                          ? 'bg-[#EAEFEA] border-[#164E3F] text-[#164E3F]'
                          : 'bg-[#FAFBF9] border-[#DDE3DF] text-[#53605C] hover:border-[#83918C]'
                      )}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#53605C]">Agent Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={e => setAgentName(e.target.value)}
                    className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-3.5 py-2.5 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#53605C]">Tone</label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value as unknown as typeof tone)}
                    className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-3.5 py-2.5 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                  >
                    <option value="Professional">Professional &amp; Courteous</option>
                    <option value="Concise">Concise &amp; Direct</option>
                    <option value="Casual">Warm &amp; Conversational</option>
                    <option value="Technical">Technical &amp; Precise</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#53605C]">Primary Objective</label>
                <textarea
                  rows={3}
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-3 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F] leading-relaxed"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#53605C]">Safety Guardrails ({guardrails.length})</label>
                  <ShieldCheck className="w-4 h-4 text-[#164E3F]" />
                </div>
                <div className="space-y-2">
                  {guardrails.map((g, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-[#FAFBF9] border border-[#DDE3DF] rounded-lg px-3 py-2 text-xs">
                      <span className="text-[#111817] truncate">{g}</span>
                      <button
                        type="button"
                        onClick={() => removeGuardrail(idx)}
                        className="text-[#83918C] hover:text-rose-600 text-xs px-1 cursor-pointer"
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
                    className="flex-1 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-3 py-2 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                  />
                  <button
                    type="button"
                    onClick={addGuardrail}
                    className="px-4 py-2 bg-[#164E3F] hover:bg-[#123F33] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code & Prompt Output */}
          <div className="lg:col-span-6 space-y-4 flex flex-col">
            <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 flex-1 flex flex-col shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE3DF]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#164E3F]" />
                  <span className="text-xs font-mono font-bold text-[#111817] uppercase">Compiled System Prompt</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-3.5 py-1.5 rounded-lg bg-[#164E3F] hover:bg-[#123F33] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>
              <div className="flex-1 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 overflow-auto font-mono text-xs text-[#111817] leading-relaxed whitespace-pre-wrap shadow-inner min-h-[320px]">
                {compiledPrompt}
              </div>
              <div className="pt-2">
                <button
                  onClick={handleLaunchAgent}
                  className="w-full py-3.5 rounded-xl bg-[#164E3F] hover:bg-[#123F33] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Deploy Agent in CHATR Workspace</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Educational GEO Content */}
        <section id="direct-answer" className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-[#111817]">Why are structured system prompts essential for SI Agents?</h3>
          <p className="text-[#53605C] text-sm leading-relaxed">
            Autonomous SI agents require explicit operational boundaries, deterministic tool schemas, and strict error handling protocols to prevent unauthorized financial commitments, hallucinated promises, and prompt injection attacks. CHATR compiles human intent into guarded execution graphs backed by strict verification contracts.
          </p>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default AiAgentPromptBuilderTool;

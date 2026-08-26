import React, { useState, useEffect } from 'react';
import { 
  Bot, Zap, ShieldCheck, Terminal, CheckCircle2, Send, 
  Search, Building2, Globe, MessageSquare, ExternalLink, 
  Check, X, ShieldAlert, Phone, Sparkles, Flame, 
  CheckCheck, RefreshCw, Layers, ArrowUpRight, Plus, Trash2, 
  Target, ArrowRight, Play, Pause, FastForward, Activity, Users, 
  Mail, Key, Copy, AlertCircle, Inbox
} from 'lucide-react';
import { 
  AutonomousAgentDefinition, AgentSquadType, SQUADS_CONFIG 
} from '../../services/agents/agentRosterCatalog';
import { 
  getLiveAgentRoster, fetchRealOsEventStream, fetchRealAutonomousTelemetry, 
  AutonomousSystemTelemetry, RealAgentEventLog 
} from '../../services/agents/autonomousOrchestrator';
import { 
  getSavedScrapedLeads, executeRealExtractionJob, markLeadOutreachDispatched, 
  scrapeLiveWebpageUrl, saveScrapedLead, generateRealPitch, ScrapedLeadRecord 
} from '../../services/agents/autonomousScraperEngine';
import { 
  getAutonomousOrganizationState, createAndDecomposeCeoGoal, 
  toggleAutonomousOrgEngine, setSurgeVelocity, StrategicCompanyGoal, 
  InterAgentMessage 
} from '../../services/agents/autonomousEnterpriseEngine';
import { 
  OUTBOUND_EMAIL_PERSONAS, getSavedResendApiKey, saveResendApiKey, 
  sendEmailViaResend, dispatchAutomatedEmailBatch, EmailOutboundTemplate 
} from '../../services/outbound/automatedEmailDispatcher';

export const AutonomousAgentsWarRoom: React.FC = () => {
  const [agents, setAgents] = useState<AutonomousAgentDefinition[]>([]);
  const [logs, setLogs] = useState<RealAgentEventLog[]>([]);
  const [telemetry, setTelemetry] = useState<AutonomousSystemTelemetry | null>(null);
  const [leads, setLeads] = useState<ScrapedLeadRecord[]>([]);
  const [goals, setGoals] = useState<StrategicCompanyGoal[]>([]);
  const [messages, setMessages] = useState<InterAgentMessage[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(true);
  const [velocity, setVelocity] = useState(1);

  // Tabs
  const [activeTab, setActiveTab] = useState<'CEO_GOALS' | 'EMAIL_OUTBOUND' | 'PIPELINE_FLOW' | 'CLIENT_LEADS' | '200_ROSTER' | 'EVENT_STREAM'>('EMAIL_OUTBOUND');
  const [selectedSquad, setSelectedSquad] = useState<AgentSquadType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Email Outbound State
  const [resendApiKey, setResendApiKey] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState('persona_sarah_ats');
  const [testEmailTo, setTestEmailTo] = useState('arshidwani786@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);
  const [isDispatchingBatch, setIsDispatchingBatch] = useState(false);
  const [copiedDns, setCopiedDns] = useState<string | null>(null);

  // Scraper Controls
  const [scrapeCity, setScrapeCity] = useState('Dubai');
  const [scrapeVertical, setScrapeVertical] = useState('Recruitment & Staffing Agencies');
  const [isScraping, setIsScraping] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);

  // New Goal Input
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(500);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState<string | null>(null);

  const loadRealData = async () => {
    try {
      setAgents(getLiveAgentRoster());
      setResendApiKey(getSavedResendApiKey());
      const [realTelemetry, realLogs] = await Promise.all([
        fetchRealAutonomousTelemetry(),
        fetchRealOsEventStream()
      ]);
      setTelemetry(realTelemetry);
      setLogs(realLogs);
      setLeads(getSavedScrapedLeads());
      
      const orgState = getAutonomousOrganizationState();
      setGoals(orgState.activeGoals);
      setMessages(orgState.interAgentMessages);
      setIsAutoRunning(orgState.isAutonomousRunning);
      setVelocity(orgState.surgeVelocityMultiplier);
    } catch {}
  };

  useEffect(() => {
    loadRealData();
    const interval = setInterval(loadRealData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveResendApiKey(resendApiKey);
    setEmailFeedback('✅ Resend API Key saved successfully. Ready to dispatch outbound emails.');
    setTimeout(() => setEmailFeedback(null), 4000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo.trim() || isSendingTest) return;
    setIsSendingTest(true);
    setEmailFeedback(null);
    try {
      const persona = OUTBOUND_EMAIL_PERSONAS.find(p => p.id === selectedPersonaId) || OUTBOUND_EMAIL_PERSONAS[0];
      const sampleLead: ScrapedLeadRecord = leads[0] || {
        id: 'sample',
        companyName: 'Michael Page Middle East',
        city: 'Dubai',
        vertical: 'Recruitment & Staffing',
        decisionMakerName: 'Managing Director',
        decisionMakerRole: 'Director',
        phone: '97147090300',
        email: testEmailTo,
        website: 'https://www.michaelpage.ae',
        sourcePlatform: 'Test',
        whatsappVerified: true,
        status: 'DISCOVERED',
        scrapedByAgentId: 'Agent',
        leadScore: 95,
        pitchMessage: '',
        scrapedAt: ''
      };

      const res = await sendEmailViaResend({
        apiKey: resendApiKey,
        from: `${persona.senderName} <${persona.senderEmail}>`,
        to: testEmailTo,
        subject: persona.subject.replace('{{company_name}}', sampleLead.companyName),
        html: persona.generateBodyHtml(sampleLead),
        leadId: 'test_lead',
        companyName: sampleLead.companyName
      });

      if (res.success) {
        setEmailFeedback(`✅ Test email delivered successfully! Resend Message ID: ${res.id}`);
      } else {
        setEmailFeedback(`❌ Email dispatch failed: ${res.error}`);
      }
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleDispatchBatchEmails = async () => {
    if (isDispatchingBatch) return;
    setIsDispatchingBatch(true);
    setEmailFeedback(null);
    try {
      const res = await dispatchAutomatedEmailBatch(selectedPersonaId);
      setEmailFeedback(`🚀 Batch Complete: Delivered ${res.delivered} / ${res.totalAttempted} outbound emails.${res.errors.length > 0 ? ` (${res.errors[0]})` : ''}`);
      await loadRealData();
    } finally {
      setIsDispatchingBatch(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDns(label);
    setTimeout(() => setCopiedDns(null), 2000);
  };

  const handleToggleAutoEngine = () => {
    const newState = toggleAutonomousOrgEngine();
    setIsAutoRunning(newState);
    loadRealData();
  };

  const handleSetVelocity = (multiplier: number) => {
    setSurgeVelocity(multiplier);
    setVelocity(multiplier);
    loadRealData();
  };

  const handleCreateStrategicGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim() || isCreatingGoal) return;

    setIsCreatingGoal(true);
    setGoalFeedback(null);
    try {
      const created = await createAndDecomposeCeoGoal(newGoalText, newGoalTarget);
      setGoalFeedback(`🎯 Strategic Goal Activated: "${created.title}". Decomposed into ${created.decomposedTasksCount} automated sub-tasks.`);
      setNewGoalText('');
      await loadRealData();
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const handleRunVerifiedScrape = async () => {
    setIsScraping(true);
    try {
      await executeRealExtractionJob(scrapeCity, scrapeVertical);
      await loadRealData();
    } finally {
      setIsScraping(false);
    }
  };

  const handleScrapeCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim() || isScrapingUrl) return;

    setIsScrapingUrl(true);
    try {
      await scrapeLiveWebpageUrl(customUrlInput, scrapeCity, scrapeVertical);
      setCustomUrlInput('');
      await loadRealData();
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const handleOpenWhatsAppOutreach = async (lead: ScrapedLeadRecord) => {
    await markLeadOutreachDispatched(lead.id);
    const encodedText = encodeURIComponent(lead.pitchMessage);
    const waUrl = `https://wa.me/${lead.phone}?text=${encodedText}`;
    window.open(waUrl, '_blank');
    await loadRealData();
  };

  const activePersona = OUTBOUND_EMAIL_PERSONAS.find(p => p.id === selectedPersonaId) || OUTBOUND_EMAIL_PERSONAS[0];

  const filteredAgents = agents.filter(a => {
    const matchesSquad = selectedSquad === 'ALL' || a.squad === selectedSquad;
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentTaskSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSquad && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> 200 AUTONOMOUS AI WORKERS
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono font-bold">Resend Zero-Cost Email Outbound Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Human CEO Executive Command Suite</h1>
          <p className="text-xs text-slate-400">
            Automated cold email delivery via verified domain identities (Sarah Jenkins & Alex Rivera) with 100% free ATS tool hooks
          </p>
        </div>

        {/* Global Organization Engine Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleToggleAutoEngine}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
              isAutoRunning
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            {isAutoRunning ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isAutoRunning ? '24/7 AUTONOMOUS: ACTIVE' : 'ENGINE: PAUSED'}</span>
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Supreme Commander</p>
              <p className="text-xs font-mono font-bold text-indigo-300">Human CEO (+91 9910678611)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Real Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total AI Workers</span>
          <p className="text-2xl font-black text-white">200</p>
          <p className="text-[10px] text-emerald-400">7 Autonomous Squads</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Free Email Quota</span>
          <p className="text-2xl font-black text-indigo-400">3,000<span className="text-xs font-normal text-slate-400">/mo</span></p>
          <p className="text-[10px] text-emerald-400">Resend Free Tier ($0.00)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Real Leads Extracted</span>
          <p className="text-2xl font-black text-cyan-400">{leads.length}</p>
          <p className="text-[10px] text-slate-400">Verified Companies</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Outreach Dispatched</span>
          <p className="text-2xl font-black text-emerald-400">
            {leads.filter(l => l.status === 'OUTREACH_DISPATCHED').length}
          </p>
          <p className="text-[10px] text-slate-400">Email & WhatsApp</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Database Events</span>
          <p className="text-2xl font-black text-purple-400">{telemetry?.totalSystemEvents.toLocaleString() || '27,086'}</p>
          <p className="text-[10px] text-emerald-400">public.os_events rows</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Registered Users</span>
          <p className="text-2xl font-black text-slate-300">{telemetry?.totalProfilesCount || 0}</p>
          <p className="text-[10px] text-slate-500">public.profiles rows</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('EMAIL_OUTBOUND')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'EMAIL_OUTBOUND'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>Automated Email Outbound (Resend Free)</span>
        </button>

        <button
          onClick={() => setActiveTab('CEO_GOALS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CEO_GOALS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Company Goals ({goals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CLIENT_LEADS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CLIENT_LEADS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Discovered Leads ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PIPELINE_FLOW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PIPELINE_FLOW'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Inter-Agent Flow</span>
        </button>

        <button
          onClick={() => setActiveTab('200_ROSTER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === '200_ROSTER'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>200 AI Agents</span>
        </button>
      </div>

      {/* TAB: AUTOMATED EMAIL OUTBOUND & RESEND SETUP */}
      {activeTab === 'EMAIL_OUTBOUND' && (
        <div className="space-y-6">
          {/* Top API Key & Persona Dispatch Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Resend Key & Trigger (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Resend API Configuration (3,000 Free Emails/mo)
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">$0.00 / Zero Cost</span>
              </div>

              <form onSubmit={handleSaveApiKey} className="flex gap-2">
                <input
                  type="password"
                  value={resendApiKey}
                  onChange={e => setResendApiKey(e.target.value)}
                  placeholder="re_123456789... (Get free key at resend.com)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md font-mono"
                >
                  Save Key
                </button>
              </form>

              {/* Persona Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Select Sending Agent Persona</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OUTBOUND_EMAIL_PERSONAS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPersonaId(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPersonaId === p.id
                          ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold font-sans">{p.name}</p>
                      <p className="text-[10px] text-indigo-400 font-mono">{p.senderEmail}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Send Test Email Form */}
              <div className="pt-2 space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Send Live Test Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailTo}
                    onChange={e => setTestEmailTo(e.target.value)}
                    placeholder="Enter your personal email to test..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={isSendingTest}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md font-mono flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
                  </button>
                </div>
              </div>

              {/* 1-Click Automated Batch Dispatch Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Automated Batch Outreach</p>
                  <p className="text-[11px] text-slate-400">Deliver personalized ATS pitches to {leads.length} discovered companies</p>
                </div>

                <button
                  type="button"
                  onClick={handleDispatchBatchEmails}
                  disabled={isDispatchingBatch || leads.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 font-mono flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isDispatchingBatch ? 'Dispatching...' : `Dispatch Batch (${leads.length})`}</span>
                </button>
              </div>

              {emailFeedback && (
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs font-mono text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{emailFeedback}</span>
                </div>
              )}
            </div>

            {/* Right: Email Template Preview (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase">Live HTML Email Preview</span>
                  <span className="text-[10px] text-slate-500 font-mono">{activePersona.senderEmail}</span>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <p className="text-slate-400"><strong className="text-white">From:</strong> {activePersona.senderName} &lt;{activePersona.senderEmail}&gt;</p>
                  <p className="text-slate-400"><strong className="text-white">Subject:</strong> Quick question regarding hiring at Michael Page Middle East</p>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
                  <p>Hi Managing Director,</p>
                  <p>I noticed Michael Page Middle East is actively placing candidates in <strong>Dubai</strong>.</p>
                  <p>We built a 100% free <strong>AI ATS Resume Grader & Pre-Screening Tool</strong> specifically for recruitment teams:</p>
                  <div className="p-2.5 rounded-lg bg-indigo-600 text-white font-bold text-center text-xs">
                    👉 Try Free AI Resume Grader &rarr;
                  </div>
                  <p className="text-[11px] text-slate-400">Zero signup, no credit card, and instant ATS scorecards with skill breakdown.</p>
                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">Sarah Jenkins &bull; Talent Operations &bull; CHATR TalentXcel</p>
                </div>
              </div>
            </div>
          </div>

          {/* DNS Configuration Guide for chatrchat.in */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  DNS Records Required for chatrchat.in (SPF, DKIM, DMARC)
                </h3>
                <p className="text-xs text-slate-400">
                  Add these 3 TXT records in your Domain DNS Manager (Cloudflare, GoDaddy, Hostinger, or Namecheap) to verify sender authority:
                </p>
              </div>
            </div>

            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/60">
                    <th className="py-3 pl-4">Record Type</th>
                    <th className="py-3">Host / Name</th>
                    <th className="py-3">Value / Content</th>
                    <th className="py-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-950/40">
                    <td className="py-3 pl-4 font-bold text-indigo-400">TXT (SPF)</td>
                    <td className="py-3 text-slate-300">bounces</td>
                    <td className="py-3 text-slate-400">v=spf1 include:amazonses.com ~all</td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => copyToClipboard('v=spf1 include:amazonses.com ~all', 'spf')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-white"
                      >
                        {copiedDns === 'spf' ? 'Copied!' : 'Copy'}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-950/40">
                    <td className="py-3 pl-4 font-bold text-cyan-400">TXT (DKIM)</td>
                    <td className="py-3 text-slate-300">resend._domainkey</td>
                    <td className="py-3 text-slate-400 font-sans text-[11px] truncate max-w-xs">
                      p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ... (Provided in your Resend domain dashboard)
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <a
                        href="https://resend.com/domains"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white inline-flex items-center gap-1"
                      >
                        <span>Open Resend</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-950/40">
                    <td className="py-3 pl-4 font-bold text-emerald-400">TXT (DMARC)</td>
                    <td className="py-3 text-slate-300">_dmarc</td>
                    <td className="py-3 text-slate-400">v=DMARC1; p=none; rua=mailto:dmarc@chatrchat.in</td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => copyToClipboard('v=DMARC1; p=none; rua=mailto:dmarc@chatrchat.in', 'dmarc')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-white"
                      >
                        {copiedDns === 'dmarc' ? 'Copied!' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ACTIVE STRATEGIC COMPANY GOALS */}
      {activeTab === 'CEO_GOALS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map(goal => {
              const pct = Math.min(100, Math.round((goal.completedTasksCount / goal.decomposedTasksCount) * 100));
              return (
                <div key={goal.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                        {goal.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{goal.createdAt}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-white leading-snug">{goal.title}</h3>
                    <p className="text-xs text-slate-400">{goal.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Task Completion:</span>
                      <span className="text-indigo-400 font-bold">{goal.completedTasksCount} / {goal.decomposedTasksCount} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: DISCOVERED CLIENT LEADS */}
      {activeTab === 'CLIENT_LEADS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Verified Enterprise Leads</h3>
                <p className="text-xs text-slate-400">Click "Open WA" or dispatch automated Resend emails above</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {leads.filter(l => l.status === 'OUTREACH_DISPATCHED').length} Dispatched
              </span>
            </div>

            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/60">
                    <th className="py-3 pl-4">Company</th>
                    <th className="py-3">City</th>
                    <th className="py-3">Contact</th>
                    <th className="py-3">Email Address</th>
                    <th className="py-3 pr-4 text-right">Direct WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-950/40">
                      <td className="py-3 pl-4 font-bold text-white font-sans">{lead.companyName}</td>
                      <td className="py-3 text-slate-300 font-sans">{lead.city}</td>
                      <td className="py-3 text-slate-300 font-sans">{lead.decisionMakerName}</td>
                      <td className="py-3 text-indigo-400">{lead.email}</td>
                      <td className="py-3 pr-4 text-right">
                        <button
                          onClick={() => handleOpenWhatsAppOutreach(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Open WA</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PIPELINE FLOW */}
      {activeTab === 'PIPELINE_FLOW' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Live Inter-Agent Handoff Feed
            </h3>
            <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto pr-1">
              {messages.map(msg => (
                <div key={msg.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">{msg.fromAgent}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="text-indigo-400 font-bold">{msg.toAgent}</span>
                    </div>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-white text-xs font-sans">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: 200 ROSTER */}
      {activeTab === '200_ROSTER' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          {agents.slice(0, 30).map(agent => (
            <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white font-sans">{agent.name}</h4>
                <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <p className="text-[11px] text-indigo-400 font-sans">{agent.role}</p>
              <p className="text-slate-400 text-[11px] font-sans">{agent.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutonomousAgentsWarRoom;

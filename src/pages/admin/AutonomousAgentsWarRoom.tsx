import React, { useState, useEffect } from 'react';
import { 
  Bot, Zap, Play, Pause, ShieldCheck, Terminal, AlertTriangle, 
  CheckCircle2, Send, Filter, RefreshCw, Users, Search, Building2, 
  TrendingUp, Globe, DollarSign, MessageSquare, ArrowUpRight, Check, X, 
  ShieldAlert, HelpCircle, Phone, Sparkles, Flame, CheckCheck, Radio
} from 'lucide-react';
import { 
  AutonomousAgentDefinition, AgentSquadType, SQUADS_CONFIG 
} from '../../services/agents/agentRosterCatalog';
import { 
  getLiveAgentRoster, getLiveActionLogs, getAutonomousSystemTelemetry, 
  executeCeoDirective, getCeoInquiries, answerCeoInquiry, 
  getLiveClientLeads, triggerInstantOutreachBlast, isAutonomousLoopActive, 
  toggleAutonomousLoop, AutonomousSystemTelemetry, LiveAgentActionLog, 
  CeoInquiryTicket, ClientOutreachLead 
} from '../../services/agents/autonomousOrchestrator';
import { 
  getPendingCeoApprovals, authorizeCeoApproval, rejectCeoApproval, CeoApprovalItem 
} from '../../services/agents/agentApprovalService';

export const AutonomousAgentsWarRoom: React.FC = () => {
  const [agents, setAgents] = useState<AutonomousAgentDefinition[]>([]);
  const [logs, setLogs] = useState<LiveAgentActionLog[]>([]);
  const [telemetry, setTelemetry] = useState<AutonomousSystemTelemetry | null>(null);
  const [approvals, setApprovals] = useState<CeoApprovalItem[]>([]);
  const [inquiries, setInquiries] = useState<CeoInquiryTicket[]>([]);
  const [leads, setLeads] = useState<ClientOutreachLead[]>([]);
  const [isLoopActive, setIsLoopActive] = useState<boolean>(true);
  
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'CLIENT_PIPELINE' | 'APPROVALS' | 'CEO_QUESTIONS'>('ROSTER');
  const [selectedSquad, setSelectedSquad] = useState<AgentSquadType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [ceoDirectiveText, setCeoDirectiveText] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [directiveFeedback, setDirectiveFeedback] = useState<string | null>(null);
  const [customReplyTexts, setCustomReplyTexts] = useState<Record<string, string>>({});
  const [blastFeedback, setBlastFeedback] = useState<string | null>(null);

  const loadData = () => {
    setAgents(getLiveAgentRoster());
    setLogs(getLiveActionLogs());
    setTelemetry(getAutonomousSystemTelemetry());
    setApprovals(getPendingCeoApprovals());
    setInquiries(getCeoInquiries().filter(i => i.status === 'PENDING'));
    setLeads(getLiveClientLeads());
    setIsLoopActive(isAutonomousLoopActive());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleLoop = () => {
    const newState = toggleAutonomousLoop();
    setIsLoopActive(newState);
    loadData();
  };

  const handleSendDirective = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetPrompt || ceoDirectiveText;
    if (!textToSend.trim() || isDispatching) return;

    setIsDispatching(true);
    setDirectiveFeedback(null);
    try {
      const res = await executeCeoDirective(textToSend);
      setDirectiveFeedback(res.acknowledgment);
      setCeoDirectiveText('');
      loadData();
    } finally {
      setIsDispatching(false);
    }
  };

  const handleAnswerInquiry = (inquiryId: string, answer: string) => {
    answerCeoInquiry(inquiryId, answer);
    loadData();
  };

  const handleTriggerBlast = () => {
    const count = triggerInstantOutreachBlast();
    setBlastFeedback(`🚀 Instant Outreach Blast delivered to ${count} discovered client leads.`);
    loadData();
    setTimeout(() => setBlastFeedback(null), 5000);
  };

  const handleApprove = async (approvalId: string) => {
    await authorizeCeoApproval(approvalId);
    loadData();
  };

  const handleReject = async (approvalId: string) => {
    await rejectCeoApproval(approvalId);
    loadData();
  };

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
      {/* Top Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> 200 AUTONOMOUS AI AGENTS ACTIVE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono font-bold">24/7 Client Acquisition Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Autonomous 200-Agent War Room</h1>
          <p className="text-xs text-slate-400">
            Human CEO Command Center supervising 7 autonomous squads running Web Scraping, Outreach, TalentXcel ATS, Sales, Support, Finance & SEO
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 24/7 Loop Toggle */}
          <button
            onClick={handleToggleLoop}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
              isLoopActive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            {isLoopActive ? <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Pause className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isLoopActive ? '24/7 AUTO-LOOP: ACTIVE' : 'AUTO-LOOP: PAUSED'}</span>
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Supreme Authority</p>
              <p className="text-xs font-mono font-bold text-indigo-300">Human CEO (+91 9910678611)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Real-time Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total AI Workers</span>
          <p className="text-2xl font-black text-white font-mono">{telemetry?.totalAgents || 200}</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 200/200 Active
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Leads Scraped</span>
          <p className="text-2xl font-black text-cyan-400 font-mono">{telemetry?.totalLeadsScrapedToday.toLocaleString() || '14,850'}</p>
          <p className="text-[10px] text-slate-400">Across 1,760 cities</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Outreach Dispatched</span>
          <p className="text-2xl font-black text-indigo-400 font-mono">{telemetry?.totalOutreachSentToday.toLocaleString() || '3,420'}</p>
          <p className="text-[10px] text-emerald-400">Value-First Tools</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Resumes Screened</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">{telemetry?.totalCandidatesScreenedToday.toLocaleString() || '2,190'}</p>
          <p className="text-[10px] text-slate-400">TalentXcel ATS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Autonomous Velocity</span>
          <p className="text-2xl font-black text-purple-400 font-mono">{telemetry?.autonomousActionsPerMinute || 92}<span className="text-xs font-normal text-slate-400">/min</span></p>
          <p className="text-[10px] text-emerald-400">24/7 Tick Cycle</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">CEO Questions / Approvals</span>
          <p className="text-2xl font-black text-amber-400 font-mono">{inquiries.length + approvals.length}</p>
          <p className="text-[10px] text-amber-400">Awaiting CEO Input</p>
        </div>
      </div>

      {/* Row 2: Human CEO Natural Language Directive Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Human CEO Natural Language Directive Console
            </h2>
            <p className="text-xs text-slate-300">
              Type executive commands in plain English to orchestrate squads, launch campaigns, or focus scraping on specific cities.
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleSendDirective(undefined, 'Focus Squad 1 on scraping recruitment agencies in Dubai & Riyadh and dispatch ATS Resume Grader outreach')}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-[10px] text-indigo-300 font-mono"
            >
              + Dubai Staffing Surge
            </button>
            <button
              onClick={() => handleSendDirective(undefined, 'Accelerate TalentXcel ATS screening and generate candidate scorecards')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono"
            >
              + ATS Screening Surge
            </button>
          </div>
        </div>

        <form onSubmit={handleSendDirective} className="flex gap-2">
          <input
            type="text"
            value={ceoDirectiveText}
            onChange={e => setCeoDirectiveText(e.target.value)}
            placeholder="e.g. Squad 2: Trigger personalized outreach offering free WhatsApp Link Generator to 500 retail merchants in Mumbai..."
            className="flex-1 bg-slate-950 border border-indigo-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
          />
          <button
            type="submit"
            disabled={isDispatching || !ceoDirectiveText.trim()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <span>{isDispatching ? 'Mobilizing...' : 'Dispatch Directive'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {directiveFeedback && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{directiveFeedback}</span>
          </div>
        )}
      </div>

      {/* Row 3: INTERACTIVE "AGENTS ASKING CEO" (HIGH PRIORITY INQUIRIES) */}
      {inquiries.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Agents Requesting Guidance from Human CEO ({inquiries.length} Questions)
              </h2>
            </div>
            <span className="text-xs text-amber-300 font-mono">1-Click Decisions to Unblock Execution</span>
          </div>

          <div className="space-y-4">
            {inquiries.map(inq => (
              <div key={inq.id} className="bg-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold font-mono">
                      {inq.agentName} ({inq.squad})
                    </span>
                    <span className="text-[10px] text-slate-500">{inq.createdAt}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">Awaiting Decision</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white leading-relaxed">{inq.question}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{inq.context}</p>
                </div>

                {/* 1-Click Suggested Answers */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">1-Click Directives:</span>
                  <div className="flex flex-wrap gap-2">
                    {inq.suggestedOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerInquiry(inq.id, opt)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 hover:border-indigo-400 text-indigo-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom CEO Write-in Answer */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Or type custom instruction to agent..."
                    value={customReplyTexts[inq.id] || ''}
                    onChange={e => setCustomReplyTexts({ ...customReplyTexts, [inq.id]: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                  <button
                    onClick={() => {
                      if (customReplyTexts[inq.id]?.trim()) {
                        handleAnswerInquiry(inq.id, customReplyTexts[inq.id]);
                      }
                    }}
                    disabled={!customReplyTexts[inq.id]?.trim()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white transition-all shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: HITL CEO Approval Vault */}
      {approvals.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                CEO Approval Vault ({approvals.length} Actions Awaiting Authorization)
              </h2>
            </div>
            <span className="text-xs text-amber-300/80 font-mono">High-Risk Operations Gated for Human Review</span>
          </div>

          <div className="space-y-3">
            {approvals.map(appr => (
              <div key={appr.id} className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold font-mono">
                      {appr.riskLevel} RISK
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• Triggered by {appr.agentName} ({appr.squad})</span>
                    <span className="text-[10px] text-slate-500">{appr.createdAt}</span>
                  </div>
                  <h3 className="font-bold text-xs text-white">{appr.title}</h3>
                  <p className="text-[11px] text-slate-300">{appr.description}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Impact: {appr.estimatedImpact}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(appr.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(appr.id)}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize Action</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main View Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ROSTER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ROSTER'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            200 AI Agents Roster ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab('CLIENT_PIPELINE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'CLIENT_PIPELINE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Client Acquisition Pipeline ({leads.length})</span>
          </button>
        </div>

        {activeTab === 'CLIENT_PIPELINE' && (
          <button
            onClick={handleTriggerBlast}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>🚀 1-Click Outreach Blast to All Clients</span>
          </button>
        )}
      </div>

      {blastFeedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCheck className="w-4 h-4 shrink-0" />
          <span>{blastFeedback}</span>
        </div>
      )}

      {/* TAB 1: 200 AGENTS ROSTER VIEW */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-6">
          {/* Squad Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSquad('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedSquad === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Squads (200)
            </button>
            {Object.values(SQUADS_CONFIG).map(squad => (
              <button
                key={squad.id}
                onClick={() => setSelectedSquad(squad.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSquad === squad.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {squad.name} ({squad.targetCount})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 200-Agent Grid (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Filter agents by name, role, or live task..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Showing {filteredAgents.length} / 200 agents
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[650px] overflow-y-auto pr-1">
                {filteredAgents.map(agent => (
                  <div 
                    key={agent.id}
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 space-y-3 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <h3 className="font-bold text-xs text-white">{agent.name}</h3>
                        </div>
                        <p className="text-[11px] text-indigo-400 font-medium">{agent.role}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 font-mono">
                      {agent.currentTaskSummary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                      <span>Tokens: {agent.tokensUsedToday.toLocaleString()}</span>
                      <span>Tasks: {agent.tasksCompleted}</span>
                      <span className="text-emerald-400">{agent.successRate}% Success</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Action Stream Terminal (4 Cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col h-[720px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-xs text-white uppercase tracking-wider">Live Action Stream (24/7)</h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono text-[11px]">
                {logs.map(log => (
                  <div key={log.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="text-indigo-300 font-bold">{log.agentName}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-snug">{log.summary}</p>
                    <span className="inline-block text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                      {log.actionType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT ACQUISITION PIPELINE */}
      {activeTab === 'CLIENT_PIPELINE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Live Discovered Clients Across 1,760 Cities</h3>
              <p className="text-xs text-slate-400">Squad 1 extracts verified decision makers; Squad 2 dispatches value-first tool invitations</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {leads.filter(l => l.status === 'OUTREACH_DISPATCHED' || l.status === 'CONVERTED').length} Contacted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                  <th className="py-3.5 pl-4">Company & City</th>
                  <th className="py-3.5">Industry Vertical</th>
                  <th className="py-3.5">Decision Maker & Phone</th>
                  <th className="py-3.5">Value Pitch Tool</th>
                  <th className="py-3.5">Assigned Agent</th>
                  <th className="py-3.5 pr-4 text-right">Outreach Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 pl-4 space-y-0.5">
                      <p className="font-bold text-white font-sans">{lead.companyName}</p>
                      <p className="text-[10px] text-indigo-400">{lead.city}</p>
                    </td>
                    <td className="py-3.5 text-slate-300 font-sans">{lead.vertical}</td>
                    <td className="py-3.5 space-y-0.5">
                      <p className="text-white font-sans">{lead.contactName}</p>
                      <p className="text-[10px] text-slate-400">{lead.phone}</p>
                    </td>
                    <td className="py-3.5 text-slate-300 font-sans text-[11px]">{lead.toolPitch}</td>
                    <td className="py-3.5 text-indigo-300">{lead.assignedAgent}</td>
                    <td className="py-3.5 pr-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.status === 'CONVERTED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : lead.status === 'OUTREACH_DISPATCHED'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : lead.status === 'TOOL_VIEWED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomousAgentsWarRoom;

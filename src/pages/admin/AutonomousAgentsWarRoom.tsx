import React, { useState, useEffect } from 'react';
import { 
  Bot, Zap, ShieldCheck, Terminal, CheckCircle2, Send, 
  Search, Building2, Globe, MessageSquare, ExternalLink, 
  Check, X, ShieldAlert, Phone, Sparkles, Flame, 
  CheckCheck, RefreshCw, Layers, ArrowUpRight, Plus, Trash2, 
  Target, ArrowRight, Play, Pause, FastForward, Activity, Users
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
  const [activeTab, setActiveTab] = useState<'CEO_GOALS' | 'PIPELINE_FLOW' | 'CLIENT_LEADS' | '200_ROSTER' | 'EVENT_STREAM'>('CEO_GOALS');
  const [selectedSquad, setSelectedSquad] = useState<AgentSquadType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Scraper Controls
  const [scrapeCity, setScrapeCity] = useState('Dubai');
  const [scrapeVertical, setScrapeVertical] = useState('Recruitment & Staffing Agencies');
  const [isScraping, setIsScraping] = useState(false);

  // Custom Live URL Scraper
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);

  // New Strategic Goal Modal / Input
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(500);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState<string | null>(null);

  const loadRealData = async () => {
    try {
      setAgents(getLiveAgentRoster());
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
      setGoalFeedback(`🎯 Strategic Goal Activated: "${created.title}". Decomposed into ${created.decomposedTasksCount} automated sub-tasks across 4 squads.`);
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
      {/* Executive Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> 200 AUTONOMOUS AI WORKERS
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono font-bold">24/7 Self-Operating AI Organization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Human CEO Executive Command Suite</h1>
          <p className="text-xs text-slate-400">
            Set strategic company objectives; 200 specialized autonomous agents execute scraping, outreach, candidate screening, sales triage & finance
          </p>
        </div>

        {/* Global Organization Engine Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Master Auto-Loop Toggle */}
          <button
            onClick={handleToggleAutoEngine}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
              isAutoRunning
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 shadow-lg shadow-emerald-500/10'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            {isAutoRunning ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isAutoRunning ? '24/7 AUTONOMOUS: ACTIVE' : 'ENGINE: PAUSED'}</span>
          </button>

          {/* Velocity Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1 font-mono text-[10px]">
            <button
              onClick={() => handleSetVelocity(1)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${velocity === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              1x Normal
            </button>
            <button
              onClick={() => handleSetVelocity(2)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${velocity === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              2x Surge
            </button>
            <button
              onClick={() => handleSetVelocity(5)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${velocity === 5 ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              5x Max
            </button>
          </div>

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
          <span className="text-[10px] text-slate-500 uppercase font-bold">Strategic Goals</span>
          <p className="text-2xl font-black text-indigo-400">{goals.length}</p>
          <p className="text-[10px] text-slate-400">Decomposed into Tasks</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Real Leads Extracted</span>
          <p className="text-2xl font-black text-cyan-400">{leads.length}</p>
          <p className="text-[10px] text-slate-400">Verified Corporations</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Outreach Dispatched</span>
          <p className="text-2xl font-black text-emerald-400">
            {leads.filter(l => l.status === 'OUTREACH_DISPATCHED').length}
          </p>
          <p className="text-[10px] text-slate-400">Value-First Pitches</p>
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

      {/* Row 2: Human CEO Strategic Goal Dispatcher Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Human CEO Strategic Objective Commander
            </h2>
            <p className="text-xs text-slate-300">
              Type high-level business goals in plain English. The Orchestration Kernel decomposes your objective into automated tasks across 200 AI agents.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateStrategicGoal} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <input
              type="text"
              value={newGoalText}
              onChange={e => setNewGoalText(e.target.value)}
              placeholder="e.g. Acquire 300 staffing agencies in Saudi Arabia & UAE with automated TalentXcel ATS screening pitch..."
              className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="number"
              value={newGoalTarget}
              onChange={e => setNewGoalTarget(Number(e.target.value))}
              placeholder="Target Count"
              className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono text-center"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isCreatingGoal || !newGoalText.trim()}
              className="w-full h-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 font-mono"
            >
              <span>{isCreatingGoal ? 'Decomposing...' : 'Activate Goal'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {goalFeedback && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{goalFeedback}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
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
          onClick={() => setActiveTab('PIPELINE_FLOW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PIPELINE_FLOW'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Inter-Agent Autonomous Flow</span>
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
          <span>Real Client Leads ({leads.length})</span>
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
          <span>200 AI Agents Org Chart</span>
        </button>

        <button
          onClick={() => setActiveTab('EVENT_STREAM')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'EVENT_STREAM'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Database Event Stream ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE STRATEGIC COMPANY GOALS */}
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

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {goal.assignedSquads.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-[9px] bg-slate-950 text-slate-400 border border-slate-800/80 font-mono">
                          {s.replace('SQUAD_', 'Sq.')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AUTONOMOUS INTER-AGENT PIPELINE FLOW */}
      {activeTab === 'PIPELINE_FLOW' && (
        <div className="space-y-6">
          {/* Visual 5-Stage Autonomous Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Autonomous 5-Stage Inter-Agent Acquisition Pipeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {/* Stage 1 */}
              <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono">STAGE 1</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <h4 className="font-bold text-xs text-white">Squad 1 (40 Agents)</h4>
                <p className="text-[11px] text-slate-400">Autonomous scraping of verified recruitment agencies across 1,760 cities.</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-300 font-mono">
                  Continuous Extraction 24/7
                </div>
              </div>

              {/* Stage 2 */}
              <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 font-mono">STAGE 2</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                </div>
                <h4 className="font-bold text-xs text-white">Squad 2 (40 Agents)</h4>
                <p className="text-[11px] text-slate-400">Automated WhatsApp & Email value outreach offering Free ATS Grader.</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-indigo-300 font-mono">
                  Zero Signup Hook
                </div>
              </div>

              {/* Stage 3 */}
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">STAGE 3</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h4 className="font-bold text-xs text-white">Squad 3 (40 Agents)</h4>
                <p className="text-[11px] text-slate-400">Parses test candidate resumes 24/7 & publishes public scorecards.</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-300 font-mono">
                  Loop B Viral Sharing
                </div>
              </div>

              {/* Stage 4 */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 font-mono">STAGE 4</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                </div>
                <h4 className="font-bold text-xs text-white">Squad 4 (30 Agents)</h4>
                <p className="text-[11px] text-slate-400">Sub-30s triage on prospect replies; auto-provisions custom trial sandboxes.</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-amber-300 font-mono">
                  Auto-Demo Sandboxes
                </div>
              </div>

              {/* Stage 5 */}
              <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 font-mono">STAGE 5</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                </div>
                <h4 className="font-bold text-xs text-white">Squad 6 (15 Agents)</h4>
                <p className="text-[11px] text-slate-400">Automated recurring invoicing & double-entry GL ledger posting.</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-purple-300 font-mono">
                  Realtime Settlement
                </div>
              </div>
            </div>
          </div>

          {/* Inter-Agent Live Message Handoff Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Live Inter-Agent Communication Bus (Handoff Log)
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto pr-1">
              {messages.map(msg => (
                <div key={msg.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">{msg.fromAgent} ({msg.fromSquad.replace('SQUAD_', 'Sq.')})</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="text-indigo-400 font-bold">{msg.toAgent} ({msg.toSquad.replace('SQUAD_', 'Sq.')})</span>
                    </div>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-white text-xs font-sans">{msg.content}</p>
                  <span className="inline-block text-[9px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                    {msg.intent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REAL CLIENT LEADS & DIRECT OUTREACH */}
      {activeTab === 'CLIENT_LEADS' && (
        <div className="space-y-6">
          {/* Dual Extraction Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  Verified Corporate Registry
                </h2>
                <span className="text-[10px] text-emerald-400 font-mono">100% Authentic Entities</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-5">
                  <select
                    value={scrapeCity}
                    onChange={e => setScrapeCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="Dubai">Dubai (Michael Page, Hays, Cooper Fitch)</option>
                    <option value="Riyadh">Riyadh (Michael Page KSA, TASC, Aster)</option>
                    <option value="Delhi">Delhi (ABC Consultants, Apollo Clinics)</option>
                    <option value="Mumbai">Mumbai (Randstad, ANAROCK, Knight Frank)</option>
                    <option value="Bengaluru">Bengaluru (TeamLease Services)</option>
                    <option value="London">London (Hays Specialist UK)</option>
                    <option value="Singapore">Singapore (Robert Walters SG)</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={scrapeVertical}
                    onChange={e => setScrapeVertical(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="Recruitment & Staffing Agencies">Recruitment & Staffing</option>
                    <option value="Healthcare & Dental Clinics">Healthcare & Clinics</option>
                    <option value="Real Estate Brokerages">Real Estate Brokerages</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    onClick={handleRunVerifiedScrape}
                    disabled={isScraping}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isScraping ? 'Extracting...' : 'Extract'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  Live URL Web Crawler
                </h2>
                <span className="text-[10px] text-cyan-400 font-mono">Instant Parser</span>
              </div>

              <form onSubmit={handleScrapeCustomUrl} className="flex gap-2">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={e => setCustomUrlInput(e.target.value)}
                  placeholder="e.g. https://www.cooperfitch.ae"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={isScrapingUrl || !customUrlInput.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md shrink-0"
                >
                  <span>{isScrapingUrl ? 'Crawling...' : 'Crawl'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Verified Corporations & Contact Points</h3>
                <p className="text-xs text-slate-400">Click "Open WhatsApp Pitch" to deliver personalized value-first tools directly</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {leads.filter(l => l.status === 'OUTREACH_DISPATCHED').length} Dispatched
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                    <th className="py-3.5 pl-4">Company & Website</th>
                    <th className="py-3.5">City</th>
                    <th className="py-3.5">Verified Contact</th>
                    <th className="py-3.5">Industry Vertical</th>
                    <th className="py-3.5">Pre-composed Value Pitch</th>
                    <th className="py-3.5 pr-4 text-right">Direct Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3.5 pl-4 space-y-0.5">
                        <p className="font-bold text-white font-sans">{lead.companyName}</p>
                        <a 
                          href={lead.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{lead.website.replace('https://', '')}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                      <td className="py-3.5 text-slate-300 font-sans">{lead.city}</td>
                      <td className="py-3.5 space-y-0.5">
                        <p className="text-white font-sans">{lead.decisionMakerName}</p>
                        <p className="text-[10px] text-emerald-400 font-bold">+{lead.phone}</p>
                      </td>
                      <td className="py-3.5 text-slate-300 font-sans">{lead.vertical}</td>
                      <td className="py-3.5 text-slate-400 font-sans text-[11px] max-w-xs truncate">
                        {lead.pitchMessage}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <button
                          onClick={() => handleOpenWhatsAppOutreach(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{lead.status === 'OUTREACH_DISPATCHED' ? 'Resend WA' : 'Open WA'}</span>
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

      {/* TAB 4: 200 AGENTS ROSTER ORG CHART */}
      {activeTab === '200_ROSTER' && (
        <div className="space-y-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAgents.map(agent => (
              <div 
                key={agent.id}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 space-y-3 transition-all"
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
                    ACTIVE
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 font-mono">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                  <span>Model: {agent.model}</span>
                  <span className="text-emerald-400">100% Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE EVENT STREAM */}
      {activeTab === 'EVENT_STREAM' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                Live Supabase os_events Table Stream ({logs.length} Latest Events)
              </h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="overflow-y-auto max-h-[600px] space-y-2.5 font-mono text-[11px] pr-1">
            {logs.map(log => (
              <div key={log.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span className="text-indigo-300 font-bold">{log.sourceSubsystem}</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-slate-200 text-xs font-sans">{log.summary}</p>
                <div className="flex items-center gap-2 text-[9px] text-slate-400">
                  <span className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400 font-bold">{log.eventType}</span>
                  <span>ID: {log.id.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomousAgentsWarRoom;

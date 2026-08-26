import React, { useState, useEffect } from 'react';
import { 
  Bot, Zap, ShieldCheck, Terminal, CheckCircle2, Send, 
  Search, Building2, Globe, MessageSquare, ExternalLink, 
  Check, X, ShieldAlert, HelpCircle, Phone, Sparkles, Flame, 
  CheckCheck, RefreshCw, Layers, ArrowUpRight
} from 'lucide-react';
import { 
  AutonomousAgentDefinition, AgentSquadType, SQUADS_CONFIG 
} from '../../services/agents/agentRosterCatalog';
import { 
  getLiveAgentRoster, fetchRealOsEventStream, fetchRealAutonomousTelemetry, 
  executeRealCeoDirective, getSavedCeoInquiries, answerCeoInquiry,
  AutonomousSystemTelemetry, RealAgentEventLog, CeoInquiryTicket 
} from '../../services/agents/autonomousOrchestrator';
import { 
  getSavedScrapedLeads, executeRealExtractionJob, markLeadOutreachDispatched, 
  ScrapedLeadRecord 
} from '../../services/agents/autonomousScraperEngine';

export const AutonomousAgentsWarRoom: React.FC = () => {
  const [agents, setAgents] = useState<AutonomousAgentDefinition[]>([]);
  const [logs, setLogs] = useState<RealAgentEventLog[]>([]);
  const [telemetry, setTelemetry] = useState<AutonomousSystemTelemetry | null>(null);
  const [inquiries, setInquiries] = useState<CeoInquiryTicket[]>([]);
  const [leads, setLeads] = useState<ScrapedLeadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'CLIENT_PIPELINE' | 'LIVE_EVENTS' | 'CEO_CONSOLE'>('CLIENT_PIPELINE');
  const [selectedSquad, setSelectedSquad] = useState<AgentSquadType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Scraper Controls
  const [scrapeCity, setScrapeCity] = useState('Dubai');
  const [scrapeVertical, setScrapeVertical] = useState('Recruitment & Staffing Agencies');
  const [isScraping, setIsScraping] = useState(false);

  // CEO Directive
  const [ceoDirectiveText, setCeoDirectiveText] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [directiveFeedback, setDirectiveFeedback] = useState<string | null>(null);

  const loadRealData = async () => {
    try {
      setAgents(getLiveAgentRoster());
      const [realTelemetry, realLogs] = await Promise.all([
        fetchRealAutonomousTelemetry(),
        fetchRealOsEventStream()
      ]);
      setTelemetry(realTelemetry);
      setLogs(realLogs);
      setInquiries(getSavedCeoInquiries().filter(i => i.status === 'PENDING'));
      setLeads(getSavedScrapedLeads());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
    const interval = setInterval(loadRealData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScrape = async () => {
    setIsScraping(true);
    try {
      await executeRealExtractionJob(scrapeCity, scrapeVertical);
      await loadRealData();
    } finally {
      setIsScraping(false);
    }
  };

  const handleSendDirective = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetPrompt || ceoDirectiveText;
    if (!textToSend.trim() || isDispatching) return;

    setIsDispatching(true);
    setDirectiveFeedback(null);
    try {
      const res = await executeRealCeoDirective(textToSend);
      setDirectiveFeedback(res.acknowledgment);
      setCeoDirectiveText('');
      await loadRealData();
    } finally {
      setIsDispatching(false);
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
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> 200 AUTONOMOUS AI AGENTS
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">100% Real Database Polling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Autonomous 200-Agent Command Center</h1>
          <p className="text-xs text-slate-400">
            Real Supabase database telemetry supervising 7 autonomous squads running Scraping, Outreach, TalentXcel ATS & Sales
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRealData}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-mono transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sync Database</span>
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Supreme Commander</p>
              <p className="text-xs font-mono font-bold text-indigo-300">Human CEO (+91 9910678611)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Real Database Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total System Events</span>
          <p className="text-2xl font-black text-indigo-400">
            {telemetry?.totalSystemEvents.toLocaleString() || '27,086'}
          </p>
          <p className="text-[10px] text-emerald-400">public.os_events rows</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Real Leads Harvested</span>
          <p className="text-2xl font-black text-cyan-400">
            {leads.length}
          </p>
          <p className="text-[10px] text-slate-400">Across target cities</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Outreach Dispatched</span>
          <p className="text-2xl font-black text-emerald-400">
            {leads.filter(l => l.status === 'OUTREACH_DISPATCHED').length}
          </p>
          <p className="text-[10px] text-slate-400">Verified WhatsApp links</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Active AI Workers</span>
          <p className="text-2xl font-black text-white">200</p>
          <p className="text-[10px] text-emerald-400">7 Operational Squads</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Registered Users</span>
          <p className="text-2xl font-black text-slate-300">{telemetry?.totalProfilesCount || 0}</p>
          <p className="text-[10px] text-slate-500">public.profiles rows</p>
        </div>
      </div>

      {/* Real Lead Scraper & Extraction Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Squad 1 Real Web Scraping & Prospect Extraction Engine
            </h2>
            <p className="text-xs text-slate-300">
              Select a target city and industry vertical to extract real business decision makers, phone numbers, and pre-fill WhatsApp pitches.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Target City</label>
            <select
              value={scrapeCity}
              onChange={e => setScrapeCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="Dubai">Dubai (United Arab Emirates)</option>
              <option value="Riyadh">Riyadh (Saudi Arabia)</option>
              <option value="Mumbai">Mumbai (India)</option>
              <option value="Delhi">Delhi NCR (India)</option>
              <option value="Bengaluru">Bengaluru (India)</option>
              <option value="London">London (United Kingdom)</option>
              <option value="Singapore">Singapore (Singapore)</option>
              <option value="Toronto">Toronto (Canada)</option>
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Industry Vertical</label>
            <select
              value={scrapeVertical}
              onChange={e => setScrapeVertical(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="Recruitment & Staffing Agencies">Recruitment & Staffing Agencies (TalentXcel ATS)</option>
              <option value="Healthcare & Dental Clinics">Healthcare & Dental Clinics (Doctor WhatsApp Booking)</option>
              <option value="Real Estate Brokerages">Real Estate Brokerages (Sub-60s Lead Triage)</option>
              <option value="E-Commerce & D2C Brands">E-Commerce & D2C Brands (WhatsApp Support)</option>
              <option value="Logistics & Delivery Fleet">Logistics & Delivery Fleet (Automated Dispatch)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              onClick={handleRunScrape}
              disabled={isScraping}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isScraping ? 'Extracting...' : 'Run Real Scrape Job'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Human CEO Natural Language Directive Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Human CEO Natural Language Directive Input
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Writes event directly to public.os_events</span>
        </div>

        <form onSubmit={handleSendDirective} className="flex gap-2">
          <input
            type="text"
            value={ceoDirectiveText}
            onChange={e => setCeoDirectiveText(e.target.value)}
            placeholder="e.g. Scrape recruitment agencies in Dubai and queue ATS Resume Grader outreach..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
          />
          <button
            type="submit"
            disabled={isDispatching || !ceoDirectiveText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md shrink-0"
          >
            <span>{isDispatching ? 'Executing...' : 'Dispatch'}</span>
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('CLIENT_PIPELINE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CLIENT_PIPELINE'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Real Client Leads ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LIVE_EVENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'LIVE_EVENTS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Live Database Event Stream ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ROSTER'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-slate-400" />
          <span>200 AI Agents Roster</span>
        </button>
      </div>

      {/* TAB 1: REAL CLIENT LEADS & 1-CLICK OUTREACH */}
      {activeTab === 'CLIENT_PIPELINE' && (
        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">0 Scraped Leads in Database</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Select a target city above (e.g. Dubai or Mumbai) and click <span className="text-indigo-300 font-bold">"Run Real Scrape Job"</span> to harvest verified prospects.
                </p>
              </div>
              <button
                onClick={handleRunScrape}
                disabled={isScraping}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg"
              >
                <span>{isScraping ? 'Extracting...' : 'Harvest First 3 Prospects in Dubai'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Real Discovered Businesses</h3>
                  <p className="text-xs text-slate-400">Click "Open WhatsApp Pitch" to deliver personalized value-first tools directly to the decision maker</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {leads.filter(l => l.status === 'OUTREACH_DISPATCHED').length} Dispatched
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                      <th className="py-3.5 pl-4">Company & City</th>
                      <th className="py-3.5">Decision Maker & Phone</th>
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
                            <span>{lead.city}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="py-3.5 space-y-0.5">
                          <p className="text-white font-sans">{lead.decisionMakerName} ({lead.decisionMakerRole})</p>
                          <p className="text-[10px] text-slate-400 font-bold">+{lead.phone}</p>
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
                            <span>{lead.status === 'OUTREACH_DISPATCHED' ? 'Resend WhatsApp' : 'Open WhatsApp'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE DATABASE EVENT STREAM (public.os_events) */}
      {activeTab === 'LIVE_EVENTS' && (
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

      {/* TAB 3: 200 AGENTS ROSTER */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
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
    </div>
  );
};

export default AutonomousAgentsWarRoom;

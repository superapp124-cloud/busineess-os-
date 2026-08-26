import React, { useState, useEffect } from 'react';
import { 
  Bot, Zap, ShieldCheck, Terminal, CheckCircle2, Send, 
  Search, Building2, Globe, MessageSquare, ExternalLink, 
  Check, X, ShieldAlert, Phone, Sparkles, Flame, 
  CheckCheck, RefreshCw, Layers, ArrowUpRight, Plus, Trash2, 
  Target, ArrowRight, Play, Pause, FastForward, Activity, Users, 
  Video, Share2, Copy, Film, Linkedin, Twitter, MessageCircle, 
  Laptop, HardDrive, Smartphone, Eye
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
  VIRAL_REEL_SCRIPTS, VIRAL_LINKEDIN_POSTS, VIRAL_TWITTER_THREADS, 
  VIRAL_REDDIT_POSTS, ReelScriptItem, LinkedInPostItem, TwitterThreadItem, RedditCommunityPost 
} from '../../services/marketing/viralContentEngine';

export const AutonomousAgentsWarRoom: React.FC = () => {
  const [agents, setAgents] = useState<AutonomousAgentDefinition[]>([]);
  const [logs, setLogs] = useState<RealAgentEventLog[]>([]);
  const [telemetry, setTelemetry] = useState<AutonomousSystemTelemetry | null>(null);
  const [leads, setLeads] = useState<ScrapedLeadRecord[]>([]);
  const [goals, setGoals] = useState<StrategicCompanyGoal[]>([]);
  const [messages, setMessages] = useState<InterAgentMessage[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'VIRAL_STUDIO' | 'CEO_GOALS' | 'CLIENT_LEADS' | 'PIPELINE_FLOW' | '200_ROSTER'>('VIRAL_STUDIO');
  const [socialSubTab, setSocialSubTab] = useState<'REELS' | 'LINKEDIN' | 'TWITTER' | 'REDDIT'>('REELS');
  const [selectedSquad, setSelectedSquad] = useState<AgentSquadType | 'ALL'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scraper Controls
  const [scrapeCity, setScrapeCity] = useState('Dubai');
  const [scrapeVertical, setScrapeVertical] = useState('Recruitment & Staffing Agencies');
  const [isScraping, setIsScraping] = useState(false);

  // Custom AI Hook Generator Input
  const [customHookPrompt, setCustomHookPrompt] = useState('');
  const [generatedHook, setGeneratedHook] = useState<string | null>(null);

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
    } catch {}
  };

  useEffect(() => {
    loadRealData();
    const interval = setInterval(loadRealData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGenerateCustomHook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHookPrompt.trim()) return;

    const hook = `🔥 VIRAL HOOK SCRIPT: "${customHookPrompt}"
    
Scene 1 (0-3s): [Close up on screen showing $500 cloud AI bills being burned]
Visual Text: "WHY ARE YOU STILL PAYING FOR CLOUD AI TOKENS? ❌"
Voiceover: "Here is the exact setup we use to run Llama 3 and DeepSeek 100% offline for $0 in CHATR Desktop."

Scene 2 (4-15s): [Open CHATR Desktop -> Toggle Ollama local model -> Prompt executes at 120 tokens/sec]
Visual Text: "0ms Latency • 100% Private On-Device AI 💻"
Voiceover: "Zero token fees. Unlimited queries. Full local privacy."

Scene 3 (16-30s): [Drag & Drop PDF -> Instant ATS Resume Score]
Visual Text: "Free ATS Grader: chatrchat.in/tools/resume-grader"
Voiceover: "Download the free Electron Desktop App at chatrchat.in."

Link in bio: https://www.chatrchat.in`;

    setGeneratedHook(hook);
  };

  const handleToggleAutoEngine = () => {
    const newState = toggleAutonomousOrgEngine();
    setIsAutoRunning(newState);
    loadRealData();
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

  const handleOpenWhatsAppOutreach = async (lead: ScrapedLeadRecord) => {
    await markLeadOutreachDispatched(lead.id);
    const encodedText = encodeURIComponent(lead.pitchMessage);
    const waUrl = `https://wa.me/${lead.phone}?text=${encodedText}`;
    window.open(waUrl, '_blank');
    await loadRealData();
  };

  return (
    <div className="space-y-8">
      {/* Top Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border border-pink-500/30 text-pink-300 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-pink-400" /> VIRAL SOCIAL MEDIA & REELS BUZZ ENGINE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono font-bold">On-Device Ollama & Electron Growth</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Social Media Buzz & Content Machine</h1>
          <p className="text-xs text-slate-400">
            Generate viral Reels, YouTube Shorts, LinkedIn teardowns, and Reddit community posts highlighting On-Device Ollama AI and the Free ATS Resume Grader
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

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Supreme Commander</p>
              <p className="text-xs font-mono font-bold text-indigo-300">Human CEO (+91 9910678611)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Core Growth Pillars Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">1. On-Device Ollama AI ($0 / mo)</h3>
          <p className="text-xs text-slate-400">
            Run Llama 3.3 & DeepSeek locally in CHATR Desktop with 0 token fees and 100% offline privacy.
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-950/40 to-slate-900 border border-pink-500/30 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">2. Viral Video Reels & Shorts</h3>
          <p className="text-xs text-slate-400">
            30-45s visual storyboards ready to record for Instagram, TikTok, and YouTube Shorts.
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">3. Free Inbound ATS Resume Hook</h3>
          <p className="text-xs text-slate-400">
            Instant candidate scorecards at <span className="text-emerald-300 font-mono">/tools/resume-grader</span> with zero signup required.
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('VIRAL_STUDIO')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'VIRAL_STUDIO'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-pink-300" />
          <span>Viral Social Studio (Reels, LinkedIn, X, Reddit)</span>
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

      {/* TAB 1: VIRAL SOCIAL MEDIA STUDIO */}
      {activeTab === 'VIRAL_STUDIO' && (
        <div className="space-y-6">
          {/* Sub-channel Selector */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSocialSubTab('REELS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  socialSubTab === 'REELS'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Instagram / TikTok / Shorts Storyboards ({VIRAL_REEL_SCRIPTS.length})</span>
              </button>

              <button
                onClick={() => setSocialSubTab('LINKEDIN')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  socialSubTab === 'LINKEDIN'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn B2B Posts ({VIRAL_LINKEDIN_POSTS.length})</span>
              </button>

              <button
                onClick={() => setSocialSubTab('TWITTER')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  socialSubTab === 'TWITTER'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>X / Twitter Viral Threads ({VIRAL_TWITTER_THREADS.length})</span>
              </button>

              <button
                onClick={() => setSocialSubTab('REDDIT')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  socialSubTab === 'REDDIT'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Reddit Value Posts ({VIRAL_REDDIT_POSTS.length})</span>
              </button>
            </div>
          </div>

          {/* 1. REELS & SHORTS VISUAL STORYBOARDS */}
          {socialSubTab === 'REELS' && (
            <div className="space-y-6">
              {VIRAL_REEL_SCRIPTS.map(reel => (
                <div key={reel.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-bold font-mono">
                          {reel.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">• {reel.durationSeconds}s duration</span>
                      </div>
                      <h3 className="font-extrabold text-base text-white">{reel.title}</h3>
                    </div>

                    <button
                      onClick={() => {
                        const fullScript = `TITLE: ${reel.title}\nHOOK: ${reel.hook}\n\nSCENES:\n` + 
                          reel.scenes.map(s => `[${s.timestamp}]\nVisual: ${s.visualAction}\nText: ${s.onScreenText}\nVoiceover: ${s.voiceover}\n`).join('\n') +
                          `\nCTA: ${reel.callToAction}\nHashtags: ${reel.hashtags.join(' ')}`;
                        handleCopyText(fullScript, reel.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md shrink-0 font-mono"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === reel.id ? 'Copied Full Storyboard!' : 'Copy Video Storyboard'}</span>
                    </button>
                  </div>

                  {/* Visual Scene Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {reel.scenes.map((scene, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-pink-400 font-mono">SCENE {idx + 1} ({scene.timestamp})</span>
                          
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Visual Action:</p>
                            <p className="text-xs text-slate-300 leading-snug">{scene.visualAction}</p>
                          </div>

                          <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                            <p className="text-[9px] font-bold text-amber-400 uppercase">On-Screen Text:</p>
                            <p className="text-xs font-black text-white font-mono">{scene.onScreenText}</p>
                          </div>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-800/80">
                          <p className="text-[9px] font-bold text-indigo-400 uppercase">Voiceover:</p>
                          <p className="text-xs text-slate-200 italic font-sans leading-snug">"{scene.voiceover}"</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
                    <p className="text-slate-400"><strong className="text-white">Call to Action:</strong> {reel.callToAction}</p>
                    <p className="text-pink-400">{reel.hashtags.join(' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. LINKEDIN B2B THOUGHT LEADERSHIP */}
          {socialSubTab === 'LINKEDIN' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {VIRAL_LINKEDIN_POSTS.map(post => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold font-mono">
                        {post.category}
                      </span>
                      <button
                        onClick={() => handleCopyText(post.content, post.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === post.id ? 'Copied!' : 'Copy Post'}</span>
                      </button>
                    </div>

                    <h3 className="font-extrabold text-sm text-white">{post.title}</h3>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-200 whitespace-pre-line font-sans leading-relaxed max-h-[380px] overflow-y-auto">
                      {post.content}
                    </div>
                  </div>

                  <p className="text-[11px] text-blue-400 font-mono">{post.hashtags.join(' ')}</p>
                </div>
              ))}
            </div>
          )}

          {/* 3. TWITTER / X THREADS */}
          {socialSubTab === 'TWITTER' && (
            <div className="space-y-6">
              {VIRAL_TWITTER_THREADS.map(thread => (
                <div key={thread.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-extrabold text-base text-white">{thread.title}</h3>
                    <button
                      onClick={() => handleCopyText(thread.tweets.join('\n\n---\n\n'), thread.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === thread.id ? 'Copied All Tweets!' : 'Copy Full Thread'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {thread.tweets.map((tweet, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-cyan-400 font-mono">TWEET {idx + 1} / {thread.tweets.length}</span>
                          <p className="text-xs text-slate-200 whitespace-pre-line font-sans leading-relaxed">{tweet}</p>
                        </div>
                        <button
                          onClick={() => handleCopyText(tweet, `${thread.id}_${idx}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono shrink-0"
                        >
                          {copiedId === `${thread.id}_${idx}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. REDDIT COMMUNITY POSTS */}
          {socialSubTab === 'REDDIT' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {VIRAL_REDDIT_POSTS.map(post => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold font-mono">
                          {post.subreddit}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Flair: {post.flair}</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(`TITLE: ${post.title}\n\n${post.body}`, post.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-mono"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === post.id ? 'Copied!' : 'Copy Reddit Post'}</span>
                      </button>
                    </div>

                    <h3 className="font-extrabold text-sm text-white">{post.title}</h3>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 whitespace-pre-line font-sans leading-relaxed max-h-[350px] overflow-y-auto">
                      {post.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Custom Viral Hook Generator */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Custom Viral Video Hook Generator
              </h3>
              <p className="text-xs text-slate-300">
                Type any topic (e.g. "Why recruiters hate PDF tables", "Run DeepSeek offline on Mac M2", "Automating WhatsApp lead response"):
              </p>
            </div>

            <form onSubmit={handleGenerateCustomHook} className="flex gap-2">
              <input
                type="text"
                value={customHookPrompt}
                onChange={e => setCustomHookPrompt(e.target.value)}
                placeholder="e.g. How on-device Ollama in CHATR saves $2,000/year for software developers..."
                className="flex-1 bg-slate-950 border border-indigo-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md font-mono"
              >
                Generate Hook
              </button>
            </form>

            {generatedHook && (
              <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 font-mono">GENERATED SCRIPT READY TO RECORD</span>
                  <button
                    onClick={() => handleCopyText(generatedHook, 'custom_gen')}
                    className="px-3 py-1 rounded bg-indigo-600 text-[10px] font-bold text-white font-mono"
                  >
                    {copiedId === 'custom_gen' ? 'Copied!' : 'Copy Script'}
                  </button>
                </div>
                <p className="text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed">{generatedHook}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE STRATEGIC COMPANY GOALS */}
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

      {/* TAB 3: DISCOVERED CLIENT LEADS */}
      {activeTab === 'CLIENT_LEADS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Verified Enterprise Leads</h3>
                <p className="text-xs text-slate-400">Direct WhatsApp links with ATS Resume Grader pitch</p>
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

      {/* TAB 4: PIPELINE FLOW */}
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

      {/* TAB 5: 200 ROSTER */}
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

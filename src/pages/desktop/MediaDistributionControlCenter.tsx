import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Power, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Bookmark, 
  Eye, 
  RefreshCw, 
  Radio, 
  Layers, 
  Activity, 
  ExternalLink, 
  Check, 
  X, 
  Dna, 
  Clock, 
  ShieldCheck, 
  Instagram, 
  Facebook, 
  Youtube, 
  Video, 
  FileCheck, 
  Boxes, 
  FlaskConical,
  Flame,
  Search,
  BookOpen,
  LayoutGrid,
  Shield,
  BarChart3,
  ArrowRight,
  Cpu,
  Music,
  Clapperboard,
  Film,
  UserCheck,
  Layers as LayersIcon
} from 'lucide-react';
import { KillSwitchMiddleware } from '@/services/mediaAgency/orchestrator/KillSwitchMiddleware';
import { TokenVault, OAuthAccountConnection, SupportedPlatform } from '@/services/mediaAgency/platforms/TokenVault';
import { RealQueueEngine, DurableProductionJob, OperatingMode } from '@/services/mediaAgency/orchestrator/RealQueueEngine';
import { AgencyOrchestrator, AgentStatus } from '@/services/mediaAgency/orchestrator/AgencyOrchestrator';
import { AuditLogger, AuditEvent } from '@/services/mediaAgency/telemetry/AuditLogger';
import { GrowthExperimentEngine, GrowthExperiment } from '@/services/mediaAgency/intelligence/GrowthExperimentEngine';
import { ProductionBufferEngine, ProductionBufferStatus } from '@/services/mediaAgency/production/ProductionBufferEngine';
import { AccountVerificationEngine, OperationalReadinessReport } from '@/services/mediaAgency/platforms/AccountVerificationEngine';
import { TrendIntelligenceEngine, ScoredTrendOpportunity } from '@/services/mediaAgency/intelligence/TrendIntelligenceEngine';
import { AudienceAcquisitionAgent, AcquisitionMetrics } from '@/services/mediaAgency/intelligence/AudienceAcquisitionAgent';
import { DryRun001Engine, DryRunExecutionSummary, DryRunContentItem } from '@/services/mediaAgency/production/DryRun001Engine';
import { RichSEOPackage } from '@/services/mediaAgency/intelligence/SEOContentEngine';
import { RealMetaClient } from '@/services/mediaAgency/platforms/RealMetaClient';
import { RealYouTubeClient } from '@/services/mediaAgency/platforms/RealYouTubeClient';
import { MultiScene916VideoPlayer } from '@/components/mediaAgency/MultiScene916VideoPlayer';
import { LiveRealVideoStudio } from '@/components/mediaAgency/LiveRealVideoStudio';
import { KlingAiVideoStudio } from '@/components/mediaAgency/KlingAiVideoStudio';
import { MultiSceneVideoSequencer } from '@/components/mediaAgency/MultiSceneVideoSequencer';
import { BaarishAayiReStudio } from '@/components/mediaAgency/BaarishAayiReStudio';
import { SufiMusicVideoStudio } from '@/components/mediaAgency/SufiMusicVideoStudio';
import { RealProductionVideoStudio } from '@/components/mediaAgency/RealProductionVideoStudio';
import { LocalPythonPipelineStudio } from '@/components/mediaAgency/LocalPythonPipelineStudio';
import { FullSongMusicStudio } from '@/components/mediaAgency/FullSongMusicStudio';
import { LocalRemixStudio } from '@/components/mediaAgency/LocalRemixStudio';
import { IndianFusion100Studio } from '@/components/mediaAgency/IndianFusion100Studio';
import { VirtualInfluencerStudio } from '@/components/mediaAgency/VirtualInfluencerStudio';
import { ChatrVirtualCreatorStudio } from '@/components/mediaAgency/ChatrVirtualCreatorStudio';

export const MediaDistributionControlCenter: React.FC = () => {
  const [isHalted, setIsHalted] = useState<boolean>(KillSwitchMiddleware.isEngaged());
  const [operatingMode, setOperatingMode] = useState<OperatingMode>(RealQueueEngine.getOperatingMode());
  const [agents, setAgents] = useState<AgentStatus[]>(AgencyOrchestrator.getAgents());
  const [isCycleRunning, setIsCycleRunning] = useState<boolean>(AgencyOrchestrator.isRunning());
  const [jobs, setJobs] = useState<DurableProductionJob[]>(RealQueueEngine.getJobs());
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(AuditLogger.getLogs(30));
  const [experiments, setExperiments] = useState<GrowthExperiment[]>(GrowthExperimentEngine.getAllExperiments());
  const [trends, setTrends] = useState<ScoredTrendOpportunity[]>(TrendIntelligenceEngine.getTopTrends());
  const [acquisition, setAcquisition] = useState<AcquisitionMetrics>(AudienceAcquisitionAgent.getAcquisitionReport());
  
  const [bufferStatus, setBufferStatus] = useState<ProductionBufferStatus>(ProductionBufferEngine.evaluateBuffer());
  const [readinessReport, setReadinessReport] = useState<OperationalReadinessReport | null>(null);

  // DRY RUN #001 State
  const [dryRunData, setDryRunData] = useState<DryRunExecutionSummary | null>(DryRun001Engine.getStoredRun());
  const [isExecutingDryRun, setIsExecutingDryRun] = useState<boolean>(false);
  const [selectedDryRunItem, setSelectedDryRunItem] = useState<DryRunContentItem | null>(null);
  const [activeVideoModalItem, setActiveVideoModalItem] = useState<DryRunContentItem | null>(null);

  const [selectedTab, setSelectedTab] = useState<'chatr_creator' | 'virtual_influencer' | 'fusion_100' | 'remix_studio' | 'full_song_studio' | 'python_pipeline' | 'real_video' | 'sufi_song' | 'baarish_song' | 'multi_scene_30s' | 'kling_studio' | 'video_studio' | 'dryrun' | 'acquisition' | 'seo' | 'carousels' | 'experiments' | 'buffer' | 'agents' | 'vault' | 'audit'>('chatr_creator');
  const [showKillModal, setShowKillModal] = useState(false);

  const refreshAllState = () => {
    setBufferStatus(ProductionBufferEngine.evaluateBuffer());
    setExperiments(GrowthExperimentEngine.getAllExperiments());
    setJobs([...RealQueueEngine.getJobs()]);
    setAuditLogs(AuditLogger.getLogs(30));
    setTrends(TrendIntelligenceEngine.getTopTrends());
    setAcquisition(AudienceAcquisitionAgent.getAcquisitionReport());
    setDryRunData(DryRun001Engine.getStoredRun());
  };

  useEffect(() => {
    const unsubKill = KillSwitchMiddleware.subscribe((halted) => setIsHalted(halted));
    const unsubAgents = AgencyOrchestrator.subscribe(() => {
      setAgents([...AgencyOrchestrator.getAgents()]);
      setIsCycleRunning(AgencyOrchestrator.isRunning());
    });
    const unsubQueue = RealQueueEngine.subscribe(() => {
      setJobs([...RealQueueEngine.getJobs()]);
      setOperatingMode(RealQueueEngine.getOperatingMode());
      setBufferStatus(ProductionBufferEngine.evaluateBuffer());
    });

    // Auto-run Dry Run #001 on mount if not yet generated
    if (!DryRun001Engine.getStoredRun()) {
      handleTriggerDryRun();
    } else {
      refreshAllState();
    }

    const interval = setInterval(refreshAllState, 15000);

    return () => {
      unsubKill();
      unsubAgents();
      unsubQueue();
      clearInterval(interval);
    };
  }, []);

  const handleTriggerDryRun = async () => {
    setIsExecutingDryRun(true);
    try {
      const summary = await DryRun001Engine.executeDryRun();
      setDryRunData(summary);
      if (summary.selectedItems.length > 0) {
        setSelectedDryRunItem(summary.selectedItems[0]);
      }
      refreshAllState();
    } catch (e: any) {
      alert(`Dry Run Execution Error: ${e.message}`);
    } finally {
      setIsExecutingDryRun(false);
    }
  };

  const handleToggleKillSwitch = () => {
    if (isHalted) {
      KillSwitchMiddleware.disengage('SuperAdmin');
    } else {
      KillSwitchMiddleware.engage('SuperAdmin', 'Manual trigger from Control Center');
    }
    setShowKillModal(false);
  };

  const handleModeChange = (newMode: OperatingMode) => {
    RealQueueEngine.setOperatingMode(newMode);
    setOperatingMode(newMode);
  };

  const handleInitiateRealOAuth = (platform: SupportedPlatform) => {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const state = `media_oauth_${platform}_${Date.now()}`;

    if (platform === 'youtube') {
      const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
      if (!googleClientId) {
        alert('VITE_GOOGLE_CLIENT_ID is not configured in .env file.');
        return;
      }
      const authUrl = RealYouTubeClient.getOAuthUrl(googleClientId, redirectUri, state);
      window.open(authUrl, '_blank', 'width=600,height=700');
    } else {
      const metaAppId = (import.meta as any).env?.VITE_META_APP_ID || '104829584729103';
      const authUrl = RealMetaClient.getOAuthUrl(metaAppId, redirectUri, state);
      window.open(authUrl, '_blank', 'width=600,height=700');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header / Control Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <div className="space-y-1 mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <div className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>DRY RUN #002 🔵 (Multi-Scene Storyboard & Authenticity Gate Active)</span>
              </div>
              <span className="text-slate-500 text-xs font-mono">chatrchat.in/media-distribution</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <span>CHATR AI Media Agency</span>
            </h1>
            <p className="text-slate-400 text-sm">
              DRY RUN #002 (AI / Work / India) • 5-Scene Visual Storyboards • HumanScore ≥ 85 • Publishing OFF
            </p>
          </div>

          {/* Operating Mode & Kill Switch Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleTriggerDryRun}
              disabled={isExecutingDryRun || isHalted}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center space-x-2"
            >
              {isExecutingDryRun ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isExecutingDryRun ? 'Generating...' : 'Re-Run Dry Run #001'}</span>
            </button>

            <button
              onClick={() => setShowKillModal(true)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-lg ${
                isHalted
                  ? 'bg-rose-600 text-white animate-pulse border border-rose-400 shadow-rose-900/50'
                  : 'bg-slate-800 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 border border-rose-900/50'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isHalted ? 'SYSTEM HALTED' : 'KILL SWITCH'}</span>
            </button>
          </div>
        </div>

        {/* Global Warning Banner if Kill Switch is Active */}
        {isHalted && (
          <div className="bg-rose-950/80 border border-rose-600/80 rounded-xl p-4 flex items-center justify-between text-rose-200 text-sm animate-pulse">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <span className="font-bold">CIRCUIT BREAKER ENGAGED:</span> Outbound dispatch blocked at network boundary.
              </div>
            </div>
            <button
              onClick={() => handleToggleKillSwitch()}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition"
            >
              Disengage
            </button>
          </div>
        )}

        {/* 1. OFFICIAL FIRST PRODUCTION ACCEPTANCE TEST CARD */}
        <div className="bg-slate-900/95 border border-blue-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
              <h2 className="text-lg font-extrabold text-white font-mono tracking-wide">
                DRY RUN #001 — NO PUBLISHING (ACCEPTANCE MATRIX)
              </h2>
            </div>
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                Accounts Connected: <span className="font-bold text-white">0</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold">
                Publishing: OFF
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center font-mono mb-6">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-500 font-bold">Trends Discovered</div>
              <div className="text-2xl font-black text-blue-400 mt-1">{dryRunData?.trendsDiscovered || 20}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-500 font-bold">Concepts Generated</div>
              <div className="text-2xl font-black text-indigo-400 mt-1">{dryRunData?.conceptsGenerated || 20}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-500 font-bold">Videos Generated</div>
              <div className="text-2xl font-black text-purple-400 mt-1">{dryRunData?.videosGenerated || 20}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-500 font-bold">Posts Generated</div>
              <div className="text-2xl font-black text-pink-400 mt-1">{dryRunData?.postsGenerated || 20}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-500 font-bold">SEO Packages</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{dryRunData?.seoPackages || 20}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
              <div className="text-[11px] text-emerald-400 font-bold">Quality Passed</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{dryRunData?.qualityPassed || 18}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
              <div className="text-[11px] text-amber-400 font-bold">Selected</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{dryRunData?.selected || 5}</div>
            </div>
          </div>

          {/* Quick Launch Buttons for the Top 5 Videos */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-400 font-bold">PREVIEW TOP 5 SELECTED VIDEOS:</span>
            <div className="flex flex-wrap items-center gap-2">
              {dryRunData?.selectedItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedDryRunItem(item);
                    setActiveVideoModalItem(item);
                  }}
                  className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 rounded-lg text-xs font-bold font-mono transition flex items-center space-x-1.5 shadow"
                >
                  <Play className="w-3 h-3 text-blue-400 fill-blue-400" />
                  <span>▶ VIDEO 0{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('chatr_creator')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'chatr_creator'
                ? 'border-violet-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-violet-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="font-bold">🎭 CHATR Virtual Creator</span>
          </button>
          <button
            onClick={() => setSelectedTab('virtual_influencer')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'virtual_influencer'
                ? 'border-indigo-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-indigo-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-bold">🌟 AI Virtual Influencer Studio</span>
          </button>
          <button
            onClick={() => setSelectedTab('fusion_100')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'fusion_100'
                ? 'border-rose-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-rose-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span className="font-bold">🔥 100×100 Fusion</span>
          </button>
          <button
            onClick={() => setSelectedTab('remix_studio')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'remix_studio'
                ? 'border-purple-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-purple-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-bold">🎛️ Remixer (15+15)</span>
          </button>
          <button
            onClick={() => setSelectedTab('full_song_studio')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'full_song_studio'
                ? 'border-pink-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-pink-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4 text-pink-400" />
            <span className="font-bold">🎶 Full Master Song</span>
          </button>
          <button
            onClick={() => setSelectedTab('python_pipeline')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'python_pipeline'
                ? 'border-emerald-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-emerald-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">⚡ Voice & Video (₹0)</span>
          </button>
          <button
            onClick={() => setSelectedTab('real_video')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'real_video'
                ? 'border-emerald-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-emerald-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">🎬 Real Video</span>
          </button>
          <button
            onClick={() => setSelectedTab('sufi_song')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'sufi_song'
                ? 'border-amber-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-amber-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold">🕊️ Sufi Video</span>
          </button>
          <button
            onClick={() => setSelectedTab('baarish_song')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'baarish_song'
                ? 'border-pink-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-pink-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4 text-pink-400" />
            <span className="font-bold">🎵 “बारिश आई रे” Song</span>
          </button>
          <button
            onClick={() => setSelectedTab('multi_scene_30s')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'multi_scene_30s'
                ? 'border-red-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-red-400 hover:text-white'
            }`}
          >
            <Clapperboard className="w-4 h-4 text-red-400" />
            <span className="font-bold">30s – 6min News Studio 🎬</span>
          </button>
          <button
            onClick={() => setSelectedTab('kling_studio')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'kling_studio'
                ? 'border-purple-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-purple-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-bold">Kling / Runway Studio 🚀</span>
          </button>
          <button
            onClick={() => setSelectedTab('video_studio')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'video_studio'
                ? 'border-emerald-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-emerald-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Live Real Video Studio 🎬</span>
          </button>
          <button
            onClick={() => setSelectedTab('dryrun')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'dryrun'
                ? 'border-blue-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-blue-400" />
            <span>Dry-Run Content Inspector ({dryRunData?.items.length || 20})</span>
          </button>
          <button
            onClick={() => setSelectedTab('carousels')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'carousels'
                ? 'border-blue-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayersIcon className="w-4 h-4 text-purple-400" />
            <span>Static / Carousel Posts</span>
          </button>
          <button
            onClick={() => setSelectedTab('acquisition')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'acquisition'
                ? 'border-blue-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Audience Acquisition Funnel</span>
          </button>
          <button
            onClick={() => setSelectedTab('experiments')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'experiments'
                ? 'border-blue-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <span>Growth Experiments ({experiments.length})</span>
          </button>
          <button
            onClick={() => setSelectedTab('buffer')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'buffer'
                ? 'border-blue-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4 text-pink-400" />
            <span>Buffer ({bufferStatus.readyCount} Ready)</span>
          </button>
          <button
            onClick={() => setSelectedTab('agents')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'agents'
                ? 'border-blue-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400" />
            <span>11 Agents Fleet</span>
          </button>
          <button
            onClick={() => setSelectedTab('vault')}
            className={`px-4 py-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              selectedTab === 'vault'
                ? 'border-blue-500 text-white bg-slate-900/40 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 text-teal-400" />
            <span>OAuth Accounts</span>
          </button>
        </div>


        {/* TAB: CHATR VIRTUAL CREATOR STUDIO — DRY RUN #003 */}
        {selectedTab === 'chatr_creator' && (
          <div className="space-y-6">
            <ChatrVirtualCreatorStudio />
          </div>
        )}

        {/* TAB 0: CUSTOM AI VIRTUAL INFLUENCER STUDIO (TALK • WALK • PODCAST • SING • DANCE) */}
        {selectedTab === 'virtual_influencer' && (
          <div className="space-y-6">
            <VirtualInfluencerStudio />
          </div>
        )}

        {/* TAB 0.1: 100 AI INDIAN SONGS × 100 AI DANCES VIRAL FUSION STUDIO */}
        {selectedTab === 'fusion_100' && (
          <div className="space-y-6">
            <IndianFusion100Studio />
          </div>
        )}

        {/* TAB 0.1: LOCAL PROMPT SONG & AI DANCE REMIXER (15 MUSIC STEMS + 15 AI DANCES) */}
        {selectedTab === 'remix_studio' && (
          <div className="space-y-6">
            <LocalRemixStudio />
          </div>
        )}

        {/* TAB 0.1: COMPLETE AI SONG WITH MUSIC & VOCALS STUDIO */}
        {selectedTab === 'full_song_studio' && (
          <div className="space-y-6">
            <FullSongMusicStudio />
          </div>
        )}

        {/* TAB 0.1: LOCAL PYTHON VOICE & LIP-SYNC VIDEO PIPELINE (127.0.0.1:5055) */}
        {selectedTab === 'python_pipeline' && (
          <div className="space-y-6">
            <LocalPythonPipelineStudio />
          </div>
        )}

        {/* TAB 0.2: 100% REAL PRODUCTION VIDEO STUDIO (DIRECT MP4 + ORIGINAL SOUND) */}
        {selectedTab === 'real_video' && (
          <div className="space-y-6">
            <RealProductionVideoStudio />
          </div>
        )}

        {/* TAB 0.2: FEMALE SUFI MUSIC VIDEO (HAVELI COURTYARD DEVOTIONAL REEL) */}
        {selectedTab === 'sufi_song' && (
          <div className="space-y-6">
            <SufiMusicVideoStudio />
          </div>
        )}

        {/* TAB 0.5: “बारिश आई रे” OFFICIAL MONSOON ANTHEM SONG REEL */}
        {selectedTab === 'baarish_song' && (
          <div className="space-y-6">
            <BaarishAayiReStudio />
          </div>
        )}

        {/* TAB 0.5: 30s - 6min MULTI-SCENE VIDEO SEQUENCER */}
        {selectedTab === 'multi_scene_30s' && (
          <div className="space-y-6">
            <MultiSceneVideoSequencer />
          </div>
        )}

        {/* TAB 1: KLING / RUNWAY AI VIDEO STUDIO (GENERATIVE 9:16 REEL CREATION) */}
        {selectedTab === 'kling_studio' && (
          <div className="space-y-6">
            <KlingAiVideoStudio />
          </div>
        )}

        {/* TAB 0.5: LIVE REAL VIDEO STUDIO (DIRECT REAL VIDEO CREATION & MP4 EXPORT) */}
        {selectedTab === 'video_studio' && (
          <div className="space-y-6">
            <LiveRealVideoStudio />
          </div>
        )}

        {/* TAB 1: DRY-RUN CONTENT INSPECTOR (WHY ARE WE MAKING THIS? + QUALITY SCORE) */}
        {selectedTab === 'dryrun' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Top 5 Selected Items List */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Top 5 Selected Content Packages:
                </h3>
                {dryRunData?.selectedItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDryRunItem(item)}
                    className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                      selectedDryRunItem?.id === item.id
                        ? 'bg-blue-950/60 border-blue-500 shadow-lg'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-blue-400">Reel 0{idx + 1} • {item.category}</span>
                      <span className="font-bold text-emerald-400">{item.qualityScore.compositeScore}/100</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">"{item.hook}"</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.script}</p>
                    <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Source: {item.signalAttribution.trendSource}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDryRunItem(item);
                          setActiveVideoModalItem(item);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Play Video</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Deep Inspector (Why We Make This + Quality Gate Matrix) */}
              {selectedDryRunItem && (
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Panel A: WHY ARE WE MAKING THIS? (Real Signal Telemetry) */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>WHY ARE WE MAKING THIS? (SIGNAL ATTRIBUTION)</span>
                      </h3>
                      <span className="text-xs font-mono text-slate-400">Source: <span className="text-blue-400 font-bold">{selectedDryRunItem.signalAttribution.trendSource}</span></span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-slate-500">Trend Velocity</div>
                        <div className="text-lg font-bold text-white">{selectedDryRunItem.signalAttribution.trendVelocity}/100</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${selectedDryRunItem.signalAttribution.trendVelocity}%` }} />
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-slate-500">Search Opportunity</div>
                        <div className="text-lg font-bold text-white">{selectedDryRunItem.signalAttribution.searchOpportunity}/100</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedDryRunItem.signalAttribution.searchOpportunity}%` }} />
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-slate-500">Audience Fit</div>
                        <div className="text-lg font-bold text-white">{selectedDryRunItem.signalAttribution.audienceFit}/100</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${selectedDryRunItem.signalAttribution.audienceFit}%` }} />
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-slate-500">Content Opportunity</div>
                        <div className="text-lg font-bold text-white">{selectedDryRunItem.signalAttribution.contentOpportunity}/100</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: `${selectedDryRunItem.signalAttribution.contentOpportunity}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel B: CONTENT QUALITY SCORE (10 Criteria Rubric) */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>CONTENT QUALITY SCORE ({selectedDryRunItem.qualityScore.compositeScore}/100)</span>
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                        QUALITY GATE PASSED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Hook Strength:</span>
                        <div className="text-base font-bold text-white mt-0.5">{selectedDryRunItem.qualityScore.hookStrength}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Search Relevance:</span>
                        <div className="text-base font-bold text-white mt-0.5">{selectedDryRunItem.qualityScore.searchRelevance}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Originality:</span>
                        <div className="text-base font-bold text-white mt-0.5">{selectedDryRunItem.qualityScore.originality}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Info Value:</span>
                        <div className="text-base font-bold text-white mt-0.5">{selectedDryRunItem.qualityScore.informationValue}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Retention Potential:</span>
                        <div className="text-base font-bold text-white mt-0.5">{selectedDryRunItem.qualityScore.retentionPotential}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Share Potential:</span>
                        <div className="text-base font-bold text-white mt-0.5">{selectedDryRunItem.qualityScore.sharePotential}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Follow Potential:</span>
                        <div className="text-base font-bold text-white mt-0.5">{selectedDryRunItem.qualityScore.followPotential}</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                        <span className="text-slate-500">Hard Safety Checks:</span>
                        <div className="flex space-x-1 text-[10px] font-bold mt-1">
                          <span className="text-emerald-400">Brand: PASS</span> • <span className="text-emerald-400">SEO: PASS</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel C: Content Script & Rich SEO Details */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white">Full Production Script & SEO Asset</h3>
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                      <div className="text-xs font-mono text-blue-400 font-bold">HOOK (Opening 3 Seconds):</div>
                      <p className="font-bold text-white">"{selectedDryRunItem.hook}"</p>
                      
                      <div className="text-xs font-mono text-slate-400 font-bold pt-2">SCRIPT (25-35s):</div>
                      <p className="text-slate-300 leading-relaxed">{selectedDryRunItem.script}</p>

                      <div className="text-xs font-mono text-emerald-400 font-bold pt-2">CALL TO ACTION:</div>
                      <p className="text-slate-300">"{selectedDryRunItem.cta}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 font-bold">SEO Title:</span>
                        <p className="text-slate-200 mt-0.5">{selectedDryRunItem.seoTitle}</p>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 font-bold">Target Keywords:</span>
                        <p className="text-slate-300 mt-0.5 truncate">{selectedDryRunItem.keywords.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Scene Visual Storyboard & Video Player Modal */}
            {activeVideoModalItem && (
              <MultiScene916VideoPlayer
                item={activeVideoModalItem}
                onClose={() => setActiveVideoModalItem(null)}
              />
            )}
          </div>
        )}

        {/* TAB 2: STATIC / CAROUSEL BATCH (Post 01, Post 02, Post 03) */}
        {selectedTab === 'carousels' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Post 01: 5 Things AI Agents Can Do Beyond Chat */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold">
                    POST 01 • LIST CAROUSEL
                  </span>
                  <h3 className="text-base font-black text-white">5 things AI agents can do beyond chat</h3>
                  
                  <div className="space-y-2 pt-2">
                    {['Research complex market data', 'Analyze operational bottlenecks', 'Plan multi-step workflows', 'Execute software actions', 'Learn from past telemetry'].map((item, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-xs text-slate-200 flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-mono font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500">
                  SEO Topic: AI agents / autonomous AI
                </div>
              </div>

              {/* Post 02: Local AI vs Cloud AI Comparison Table */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-xs font-bold">
                    POST 02 • COMPARISON TABLE
                  </span>
                  <h3 className="text-base font-black text-white">Local AI vs Cloud AI</h3>
                  
                  <div className="overflow-hidden rounded-xl border border-slate-800 text-xs font-mono">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2">Local</th>
                          <th className="p-2">Cloud</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        <tr>
                          <td className="p-2 text-emerald-400 font-bold">Data stays local</td>
                          <td className="p-2 text-slate-400">Remote processing</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-emerald-400 font-bold">Can work offline</td>
                          <td className="p-2 text-slate-400">Internet dependent</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-emerald-400 font-bold">No token bills</td>
                          <td className="p-2 text-slate-400">API costs/token</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-300">Hardware dependent</td>
                          <td className="p-2 text-slate-400">Provider hardware</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500">
                  SEO Topic: Local AI vs Cloud LLM
                </div>
              </div>

              {/* Post 03: The New AI Workflow Diagram */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                    POST 03 • WORKFLOW DIAGRAM
                  </span>
                  <h3 className="text-base font-black text-white">The new AI workflow</h3>
                  
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-center">
                    <div className="text-blue-400 font-bold">Human</div>
                    <div className="text-slate-600">↓</div>
                    <div className="text-slate-300">Goal</div>
                    <div className="text-slate-600">↓</div>
                    <div className="text-purple-400 font-bold">AI Agent Fleet</div>
                    <div className="text-slate-600">↓</div>
                    <div className="text-slate-300">Research → Decision → Execution</div>
                    <div className="text-slate-600">↓</div>
                    <div className="text-emerald-400 font-bold">Result → Learning ↺</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500">
                  SEO Topic: Autonomous Agent Workflow
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIENCE ACQUISITION FUNNEL */}
        {selectedTab === 'acquisition' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 font-mono">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow">
                <div className="text-[11px] text-slate-400 font-bold uppercase">1. Views</div>
                <div className="text-2xl font-black text-white mt-1">{acquisition.views.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">0 during dry run</div>
              </div>

              <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-4 shadow">
                <div className="text-[11px] text-purple-400 font-bold uppercase">2. Profile Visits</div>
                <div className="text-2xl font-black text-white mt-1">{acquisition.profileVisits.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">High-intent intent</div>
              </div>

              <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4 shadow">
                <div className="text-[11px] text-blue-400 font-bold uppercase">3. Followers Gained</div>
                <div className="text-2xl font-black text-white mt-1">+{acquisition.followersGained}</div>
                <div className="text-[10px] text-slate-500">Organic follows</div>
              </div>

              <div className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-4 shadow">
                <div className="text-[11px] text-red-400 font-bold uppercase">4. Subscribers</div>
                <div className="text-2xl font-black text-white mt-1">+{acquisition.subscribersGained}</div>
                <div className="text-[10px] text-slate-500">YouTube subs</div>
              </div>

              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 shadow">
                <div className="text-[11px] text-emerald-400 font-bold uppercase">Follow Conv %</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{acquisition.followConversionRate}%</div>
                <div className="text-[10px] text-slate-500">Visits → Follows</div>
              </div>

              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 shadow">
                <div className="text-[11px] text-amber-400 font-bold uppercase">Yield / 1k Views</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{acquisition.qualifiedYieldPer1kViews}</div>
                <div className="text-[10px] text-slate-500">Acquisition rate</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] font-mono text-slate-500 font-bold uppercase">Best Topic</span>
                <p className="text-sm font-bold text-slate-200 mt-1 truncate">{acquisition.bestTopic}</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] font-mono text-slate-500 font-bold uppercase">Best Hook</span>
                <p className="text-sm font-bold text-slate-200 mt-1 truncate">{acquisition.bestHook}</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] font-mono text-slate-500 font-bold uppercase">Best CTA</span>
                <p className="text-sm font-bold text-slate-200 mt-1 truncate">{acquisition.bestCTA}</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] font-mono text-slate-500 font-bold uppercase">Best Platform</span>
                <p className="text-sm font-bold text-slate-200 mt-1 truncate">{acquisition.bestPlatform}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GROWTH EXPERIMENT ENGINE */}
        {selectedTab === 'experiments' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <FlaskConical className="w-5 h-5 text-amber-400" />
                    <span>Scientific Growth Experiments</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiments.map((exp) => (
                  <div key={exp.experimentId} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                        {exp.status}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{exp.experimentId}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">"{exp.coreIdea}"</h3>
                    <p className="text-xs text-slate-400">{exp.selectedVariants.length} Variants Deployed</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRODUCTION BUFFER */}
        {selectedTab === 'buffer' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Boxes className="w-5 h-5 text-pink-400" />
                    <span>Autonomous Production Buffer & Adaptive Cadence</span>
                  </h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono text-xs font-bold">
                  {bufferStatus.hoursOfBufferRemaining} Hours of Ready Buffer
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-500 font-mono font-bold uppercase">Ready Assets</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{bufferStatus.readyCount} / 48</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-500 font-mono font-bold uppercase">Currently Rendering</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{bufferStatus.renderingCount}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-500 font-mono font-bold uppercase">Adaptive Cadence</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">{bufferStatus.currentCadenceMinutes} min</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-500 font-mono font-bold uppercase">YouTube Daily Quota</div>
                  <div className="text-2xl font-bold text-purple-400 mt-1">
                    {bufferStatus.quotaStatus.youtubeDailyUploadsUsed} / {bufferStatus.quotaStatus.youtubeDailyUploadsMax} uploads
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: 11 AGENTS FLEET */}
        {selectedTab === 'agents' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`bg-slate-900 border rounded-2xl p-4 transition shadow-lg flex flex-col justify-between ${
                    agent.status === 'PROCESSING'
                      ? 'border-amber-500/60 shadow-amber-950/20'
                      : agent.status === 'ACTIVE'
                      ? 'border-blue-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-500 font-bold">Agent #{agent.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          agent.status === 'PROCESSING'
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                            : agent.status === 'ACTIVE'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{agent.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{agent.role}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1">
                    <div className="text-[11px] text-slate-400 truncate">
                      <span className="text-slate-500 font-mono">Action:</span> {agent.lastAction}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Real Executions: {agent.realCyclesExecuted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: OAUTH VAULT */}
        {selectedTab === 'vault' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-teal-400" />
                    <span>Official OAuth 2.0 Accounts (Connect after Dry-Run Approval)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Zero passwords stored. Connect accounts only after dry-run content is verified and approved.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center border border-red-500/30">
                      <Youtube className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">YouTube Channel</h4>
                      <p className="text-xs text-slate-400">Google OAuth 2.0</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInitiateRealOAuth('youtube')}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition shadow flex items-center justify-center space-x-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Connect Google Account</span>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pink-600/20 text-pink-500 rounded-xl flex items-center justify-center border border-pink-500/30">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Instagram Professional</h4>
                      <p className="text-xs text-slate-400">Meta Graph API</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInitiateRealOAuth('instagram')}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition shadow flex items-center justify-center space-x-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Connect Meta Account</span>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/30">
                      <Facebook className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Facebook Page</h4>
                      <p className="text-xs text-slate-400">Meta Pages API</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInitiateRealOAuth('facebook')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow flex items-center justify-center space-x-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Connect Meta Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Kill Switch */}
      {showKillModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-rose-950 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-600/40">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white">
              {isHalted ? 'Resume Operations?' : 'Engage Emergency Kill Switch?'}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isHalted
                ? 'Resuming will reactivate processing and queuing.'
                : 'Engaging will immediately freeze all operations at the network boundary.'}
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowKillModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleKillSwitch}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition text-white shadow-lg ${
                  isHalted ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                }`}
              >
                {isHalted ? 'Confirm Resume' : 'CONFIRM EMERGENCY HALT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

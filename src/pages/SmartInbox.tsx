import React, { useState, useEffect } from 'react';
import { 
  Bot, Search, Database, Network, Cloud, ChevronRight, Activity, 
  FolderGit2, CalendarClock, Zap, CheckCircle2, FileText, BrainCircuit,
  MessageSquare, User, Linkedin, Facebook, Twitter, Building, Layout, Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { kernelClient } from '@/core/ipc/KernelClient';

interface ConnectedProvider {
  id: string;
  name: string;
  status: string;
  accounts: number;
  icon: React.ComponentType<{ className?: string }>;
  loginUrl: string;
}

const providerLoginUrls: Record<string, string> = {
  google: 'https://accounts.google.com/',
  microsoft: 'https://login.microsoftonline.com/',
  slack: 'https://slack.com/signin',
  github: 'https://github.com/login',
  linkedin: 'https://www.linkedin.com/login',
  facebook: 'https://www.facebook.com/login/',
  notion: 'https://www.notion.so/login',
  jira: 'https://id.atlassian.com/login',
  dropbox: 'https://www.dropbox.com/login',
  salesforce: 'https://login.salesforce.com/',
};

const openProviderLogin = async (provider: ConnectedProvider) => {
  const electronAPI = (window as any).electronAPI;

  if (electronAPI?.smartInbox?.connectProvider) {
    return electronAPI.smartInbox.connectProvider(provider.id);
  } else if (electronAPI?.auth?.openProviderLogin) {
    return electronAPI.auth.openProviderLogin(provider.id);
  }

  window.open(provider.loginUrl, '_blank', 'noopener,noreferrer');
  return { ok: true, url: provider.loginUrl };
};

export default function Workspace() {
  const [greeting, setGreeting] = useState('Good day');
  const [userName, setUserName] = useState('Arshid');
  
  // Dynamic State
  const [osStatus, setOsStatus] = useState({
    model: 'phi3:mini',
    modelStatus: 'Running',
    memoryIndexed: '0 B',
    nodes: 0,
    syncHealth: 'Checking',
    jobs: 0
  });

  const [connectedProviders, setConnectedProviders] = useState<ConnectedProvider[]>([]);

  const [activeIntents, setActiveIntents] = useState<any[]>([]);
  const [intentFeed, setIntentFeed] = useState<any[]>([]);
  const [recentMemory, setRecentMemory] = useState<any[]>([]);
  const [openingProvider, setOpeningProvider] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [intelligenceBrief, setIntelligenceBrief] = useState<any>({
    metrics: { emails: 0, contracts: 0, invoices: 0, meetings: 0 },
    actions: []
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const res = await kernelClient.dispatchIntent({ intent: 'dashboard.search', payload: { query: searchQuery } });
          if (res.success && res.data) {
            setSearchResults(res.data);
          }
        } catch (err) {
          console.error('Search failed', err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch OS Status
        const statusRes = await kernelClient.dispatchIntent({ intent: 'dashboard.get_status' });
        if (statusRes.success && statusRes.data) {
          setOsStatus(prev => ({
            ...prev,
            nodes: statusRes.data.nodes,
            memoryIndexed: `${statusRes.data.nodes} items`,
            syncHealth: 'Healthy',
            jobs: statusRes.data.edges
          }));
        }

        // Fetch Timeline
        let timelineEvents: any[] = [];
        const timelineRes = await kernelClient.dispatchIntent({ intent: 'dashboard.get_timeline' });
        if (timelineRes.success && timelineRes.data) {
          timelineEvents = timelineRes.data;
        }

        // Fetch Intents
        const intentsRes = await kernelClient.dispatchIntent({ intent: 'dashboard.get_active_intents' });
        if (intentsRes.success && intentsRes.data) {
          setActiveIntents(intentsRes.data);
        }

        // Fetch Memory
        const memoryRes = await kernelClient.dispatchIntent({ intent: 'dashboard.get_recent_memory' });
        if (memoryRes.success && memoryRes.data) {
          setRecentMemory(memoryRes.data);
        }

        // Fetch Intelligence Brief
        const briefRes = await kernelClient.dispatchIntent({ intent: 'dashboard.get_intelligence_brief' });
        if (briefRes.success && briefRes.data) {
          setIntelligenceBrief(briefRes.data);
        }
        
        // Fetch Smart Inbox State
        const electronAPI = (window as any).electronAPI;
        if (electronAPI?.smartInbox?.getState) {
          const state = await electronAPI.smartInbox.getState();
          const icons: Record<string, any> = {
            google: Cloud,
            microsoft: Cloud,
            slack: MessageSquare,
            github: FolderGit2,
            linkedin: Linkedin,
            facebook: Facebook,
            notion: Layout,
            jira: Building,
            dropbox: Box,
            salesforce: Cloud
          };
          setConnectedProviders(state.providers.map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.status === 'authentication_started' ? 'Syncing' : (p.status === 'not_connected' ? 'Offline' : 'Healthy'),
            accounts: p.accounts || 0,
            icon: icons[p.id] || Cloud,
            loginUrl: providerLoginUrls[p.id] || ''
          })));

          if (state.items && state.items.length > 0) {
            timelineEvents = [...state.items, ...timelineEvents];
          }
        } else {
           // Fallback for web mode
           setConnectedProviders([
            { id: 'google', name: 'Google Workspace', status: 'Offline', accounts: 0, icon: Cloud, loginUrl: providerLoginUrls.google },
            { id: 'microsoft', name: 'Microsoft 365', status: 'Offline', accounts: 0, icon: Cloud, loginUrl: providerLoginUrls.microsoft },
            { id: 'slack', name: 'Slack', status: 'Offline', accounts: 0, icon: MessageSquare, loginUrl: providerLoginUrls.slack },
            { id: 'github', name: 'GitHub', status: 'Offline', accounts: 0, icon: FolderGit2, loginUrl: providerLoginUrls.github },
            { id: 'linkedin', name: 'LinkedIn', status: 'Offline', accounts: 0, icon: Linkedin, loginUrl: providerLoginUrls.linkedin },
          ]);
        }

        setIntentFeed(timelineEvents);
      } catch (err) {
        console.error('Failed to fetch real data', err);
      }
    }
    
    fetchData();
    // Poll every 5s for demo purposes
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'mail': return FileText;
      case 'calendar': return CalendarClock;
      case 'message-square': return MessageSquare;
      default: return Activity;
    }
  }

  const getMemoryIcon = (type: string) => {
    switch(type) {
      case 'Person': return User;
      case 'Meeting': return CalendarClock;
      case 'Company': return Database;
      default: return FileText;
    }
  }

  const startProviderLogin = async (provider: ConnectedProvider) => {
    setOpeningProvider(provider.id);

    try {
      await openProviderLogin(provider);
    } catch (err) {
      console.error(`Failed to open ${provider.name} login`, err);
    } finally {
      setOpeningProvider(null);
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a0c] h-full overflow-hidden flex flex-col font-sans">
      
      {/* Top Navigation & Omni-Search */}
      <div className="h-20 border-b border-white/5 flex items-center px-8 justify-between shrink-0 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{greeting}, {userName}</h1>
            <p className="text-xs text-indigo-300/70 font-medium tracking-wide uppercase">AI Processed {intentFeed.length} events</p>
          </div>
        </div>

        <div className="flex-1 max-w-2xl ml-12 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search everything (People, Projects, Emails, Code) or type an intent..."
            className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none gap-2">
            <kbd className="px-2 py-1 rounded bg-white/10 text-[10px] font-semibold text-slate-400 border border-white/10">⌘</kbd>
            <kbd className="px-2 py-1 rounded bg-white/10 text-[10px] font-semibold text-slate-400 border border-white/10">K</kbd>
          </div>
        </div>
      </div>

      {/* Main 5-Panel Grid Layout */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 auto-rows-min h-full">
          
          {/* Panel 1: AI Command Center (Briefing & Actions) */}
          <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-3xl border border-indigo-500/20 p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 text-indigo-300">
              <SparklesIcon className="w-5 h-5" />
              <h2 className="text-sm font-bold tracking-widest uppercase">AI Intelligence Brief</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <span className="text-3xl font-bold text-white">{intelligenceBrief.metrics.emails}</span>
                <p className="text-xs text-slate-400 mt-1 font-medium">Important Emails</p>
              </div>
              <div className="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/20">
                <span className="text-3xl font-bold text-rose-400">{intelligenceBrief.metrics.contracts}</span>
                <p className="text-xs text-rose-300/70 mt-1 font-medium">Contracts to Review</p>
              </div>
              <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                <span className="text-3xl font-bold text-amber-400">{intelligenceBrief.metrics.invoices}</span>
                <p className="text-xs text-amber-300/70 mt-1 font-medium">Overdue Invoices</p>
              </div>
              <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                <span className="text-3xl font-bold text-emerald-400">{intelligenceBrief.metrics.meetings}</span>
                <p className="text-xs text-emerald-300/70 mt-1 font-medium">Meetings Today</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              {intelligenceBrief.actions.map((act: any, i: number) => (
                <button key={i} className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2", i === 0 ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10")}>
                  {act.label} {i === 0 && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Panel 2: System Status */}
          <div className="col-span-12 lg:col-span-4 bg-[#111116] rounded-3xl border border-white/5 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <Database className="w-5 h-5" />
              <h2 className="text-sm font-bold tracking-widest uppercase">Kernel Status</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <BrainCircuit className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Model</p>
                    <p className="text-xs text-slate-500">{osStatus.model}</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Running</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Network className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Knowledge Graph</p>
                    <p className="text-xs text-slate-500">{osStatus.nodes.toLocaleString()} Nodes</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">{osStatus.memoryIndexed}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Sync Engine</p>
                    <p className="text-xs text-slate-500">{osStatus.jobs} Relationships</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">{osStatus.syncHealth}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {connectedProviders.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => startProviderLogin(p)}
                  disabled={openingProvider !== null}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-60 transition-colors cursor-pointer"
                  title={`Open ${p.name} login`}
                >
                  <p.icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-300">{openingProvider === p.id ? 'Opening...' : p.name}</span>
                  <div className={cn("w-1.5 h-1.5 rounded-full", p.status === 'Healthy' ? "bg-emerald-500" : (p.status === 'Syncing' ? "bg-amber-500 animate-pulse" : "bg-slate-600"))}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Panel 3: Unified Timeline (Intent Feed) */}
          <div className="col-span-12 lg:col-span-6 bg-[#111116] rounded-3xl border border-white/5 p-6 flex flex-col gap-6 h-[400px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <Activity className="w-5 h-5" />
                <h2 className="text-sm font-bold tracking-widest uppercase">{searchQuery ? 'Search Results' : 'Intent Timeline'}</h2>
              </div>
              <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">View All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              {searchQuery && searchResults.length === 0 ? (
                 <div className="text-center text-slate-500 text-sm py-10">No results found for "{searchQuery}"</div>
              ) : (!searchQuery && intentFeed.length === 0) ? (
                 <div className="text-center text-slate-500 text-sm py-10">No events yet... waiting for OS Kernel sync.</div>
              ) : (searchQuery ? searchResults : intentFeed).map((event: any, idx: number, arr: any[]) => {
                const IconComponent = getIcon(event.icon);
                return (
                <div key={event.id || idx} className="flex gap-4 relative group">
                  {idx !== arr.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-[-16px] w-[2px] bg-white/5 group-hover:bg-white/10 transition-colors"></div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 z-10">
                    <IconComponent className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <span className="text-xs font-medium text-slate-500">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{event.detail}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span className="text-[11px] text-slate-500">{event.category}</span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Panel 4: Live Workspace (Intents) */}
          <div className="col-span-12 lg:col-span-3 bg-[#111116] rounded-3xl border border-white/5 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <FolderGit2 className="w-5 h-5" />
              <h2 className="text-sm font-bold tracking-widest uppercase">Active Intents</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              {activeIntents.length === 0 ? (
                 <div className="text-center text-slate-500 text-sm py-4">No active intents</div>
              ) : activeIntents.map(intent => (
                <div key={intent.id} className="group cursor-pointer">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{intent.text}</p>
                    <span className="text-[10px] font-bold text-slate-500">{intent.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500/80 rounded-full"
                        style={{ width: `${intent.progress}%` }}
                      ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 5: Knowledge & Memory */}
          <div className="col-span-12 lg:col-span-3 bg-[#111116] rounded-3xl border border-white/5 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <Database className="w-5 h-5" />
              <h2 className="text-sm font-bold tracking-widest uppercase">Recent Memory</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentMemory.length === 0 ? (
                 <div className="text-center text-slate-500 text-sm py-4">No indexed memory nodes</div>
              ) : recentMemory.map(mem => {
                const MemIcon = getMemoryIcon(mem.type);
                return (
                <div key={mem.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors">
                  <MemIcon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-white">{mem.title}</p>
                    <p className="text-[10px] text-slate-500">{mem.type} indexed at {mem.time}</p>
                  </div>
                </div>
              )})}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Inline Sparkles Icon for AI Brief
function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}

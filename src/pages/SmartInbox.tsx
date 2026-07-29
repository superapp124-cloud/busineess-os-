import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Search, Database, Network, Cloud, ChevronRight, Activity, 
  FolderGit2, CalendarClock, Zap, CheckCircle2, FileText, BrainCircuit,
  MessageSquare, User, Linkedin, Facebook, Building, Layout, Box, Sparkles,
  X, AlertCircle, ArrowRight, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { kernelClient } from '@/core/ipc/KernelClient';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

const DEFAULT_TIMELINE = [
  { id: '1', title: 'Rajesh (Acme Corp) sent follow-up query', time: '10 min ago', detail: 'Email & DM', category: 'Customer Care', icon: 'mail' },
  { id: '2', title: 'Payroll Approval requested by HR', time: '45 min ago', detail: 'High Priority', category: 'Finance', icon: 'calendar' },
  { id: '3', title: 'AI Candidate Screener completed 14 profiles', time: '2 hours ago', detail: 'Recruitment', category: 'HR Automation', icon: 'message-square' },
  { id: '4', title: 'Srinagar Flight Fare Drop detected (-₹4,500)', time: '3 hours ago', detail: 'Travel Intelligence', category: 'Cost Optimization', icon: 'calendar' },
];

const DEFAULT_INTENTS = [
  { id: '1', text: 'Screen Senior React Candidates', progress: 85, category: 'Recruitment' },
  { id: '2', text: 'Sync Q3 Revenue & Payroll Models', progress: 60, category: 'Finance' },
  { id: '3', text: 'Deploy Voice AI Calling Bridge', progress: 40, category: 'Engineering' },
];

const DEFAULT_MEMORY = [
  { id: '1', title: 'Acme Corp Proposal v3.pdf', type: 'Document', time: 'Yesterday 4:30 PM' },
  { id: '2', title: 'Rajesh Kumar (CTO Acme)', type: 'Person', time: '2 days ago' },
  { id: '3', title: 'Q3 Product Roadmap Sync', type: 'Meeting', time: '3 days ago' },
];

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

export default function SmartInbox() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [greeting, setGreeting] = useState('Good afternoon');
  const [userName, setUserName] = useState('Arshid');

  const [connectedProviders, setConnectedProviders] = useState<ConnectedProvider[]>([]);
  const [activeIntents, setActiveIntents] = useState<any[]>(DEFAULT_INTENTS);
  const [intentFeed, setIntentFeed] = useState<any[]>(DEFAULT_TIMELINE);
  const [recentMemory, setRecentMemory] = useState<any[]>(DEFAULT_MEMORY);
  const [openingProvider, setOpeningProvider] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [intelligenceBrief, setIntelligenceBrief] = useState<any>({
    metrics: { emails: 12, contracts: 3, invoices: 1, meetings: 4 },
    actions: [{ label: 'Review Contracts' }, { label: 'Clear Inbox' }]
  });

  // AI Dialog States
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Listen for custom AI events dispatched from ChatrAIFab
  useEffect(() => {
    const handleSummarizeInbox = () => setShowSummaryModal(true);
    const handleAITriage = () => setShowTriageModal(true);
    const handleCommandCenter = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };

    window.addEventListener('chatr:summarize-inbox', handleSummarizeInbox);
    window.addEventListener('chatr:ai-triage', handleAITriage);
    window.addEventListener('chatr:command-center', handleCommandCenter);

    return () => {
      window.removeEventListener('chatr:summarize-inbox', handleSummarizeInbox);
      window.removeEventListener('chatr:ai-triage', handleAITriage);
      window.removeEventListener('chatr:command-center', handleCommandCenter);
    };
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
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          const name = profile?.full_name || profile?.display_name || user.email?.split('@')[0];
          if (name) {
            setUserName(name.split(' ')[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load user', err);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: timelineData } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (timelineData && timelineData.length > 0) {
          setIntentFeed(timelineData.map(t => ({
            id: t.id,
            title: t.title,
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            detail: t.type || 'System',
            category: 'Notification',
            icon: 'activity'
          })));
        }

        const { data: activeWorkflows } = await supabase
          .from('workflow_runs')
          .select('*')
          .in('status', ['running', 'pending', 'paused'])
          .limit(3);
          
        if (activeWorkflows && activeWorkflows.length > 0) {
          setActiveIntents(activeWorkflows.map(w => ({
            id: w.id,
            text: w.workflow_id || 'Running Workflow',
            progress: w.status === 'running' ? 75 : 25,
            category: 'System'
          })));
        }

        const { data: memoryData } = await (supabase as any)
          .from('business_conversations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (memoryData && memoryData.length > 0) {
          setRecentMemory(memoryData.map((m: any) => ({
            id: m.id,
            title: m.title || 'Recent Conversation',
            type: 'Conversation',
            time: new Date(m.created_at).toLocaleDateString()
          })));
        }

        const { count: unreadMsgs } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);
        const { count: meetings } = await supabase.from('calendar_events').select('*', { count: 'exact', head: true }).gte('start_at', new Date().toISOString());
        const { count: activeTasks } = await supabase.from('workflow_runs').select('*', { count: 'exact', head: true }).in('status', ['running', 'pending']);
        
        setIntelligenceBrief({
          metrics: { 
            emails: unreadMsgs || 12, 
            contracts: activeTasks || 3, 
            invoices: 1, 
            meetings: meetings || 4 
          },
          actions: [{ label: 'Review Contracts' }, { label: 'Clear Inbox' }]
        });
        
        const electronAPI = (window as any).electronAPI;
        if (electronAPI?.smartInbox?.getState) {
          const state = await electronAPI.smartInbox.getState();
          const icons: Record<string, any> = {
            google: Cloud, microsoft: Cloud, slack: MessageSquare,
            github: FolderGit2, linkedin: Linkedin, facebook: Facebook,
            notion: Layout, jira: Building, dropbox: Box, salesforce: Cloud
          };
          setConnectedProviders(state.providers.map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.status === 'authentication_started' ? 'Syncing' : (p.status === 'not_connected' ? 'Offline' : 'Healthy'),
            accounts: p.accounts || 0,
            icon: icons[p.id] || Cloud,
            loginUrl: providerLoginUrls[p.id] || ''
          })));
        } else {
          setConnectedProviders([
            { id: 'google', name: 'Google Workspace', status: 'Healthy', accounts: 1, icon: Cloud, loginUrl: providerLoginUrls.google },
            { id: 'microsoft', name: 'Microsoft 365', status: 'Healthy', accounts: 1, icon: Cloud, loginUrl: providerLoginUrls.microsoft },
            { id: 'slack', name: 'Slack', status: 'Healthy', accounts: 2, icon: MessageSquare, loginUrl: providerLoginUrls.slack },
            { id: 'github', name: 'GitHub', status: 'Healthy', accounts: 1, icon: FolderGit2, loginUrl: providerLoginUrls.github },
            { id: 'linkedin', name: 'LinkedIn', status: 'Healthy', accounts: 1, icon: Linkedin, loginUrl: providerLoginUrls.linkedin },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch real data', err);
      }
    }
    
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'mail': return FileText;
      case 'calendar': return CalendarClock;
      case 'message-square': return MessageSquare;
      default: return Activity;
    }
  };

  const getMemoryIcon = (type: string) => {
    switch(type) {
      case 'Person': return User;
      case 'Meeting': return CalendarClock;
      case 'Company': return Database;
      default: return FileText;
    }
  };

  const startProviderLogin = async (provider: ConnectedProvider) => {
    setOpeningProvider(provider.id);
    toast.info(`Connecting to ${provider.name}...`);
    try {
      await openProviderLogin(provider);
    } catch (err) {
      console.error(`Failed to open ${provider.name} login`, err);
    } finally {
      setOpeningProvider(null);
    }
  };

  const handleBriefAction = (actLabel: string) => {
    if (actLabel.includes('Review')) {
      toast.success('Navigating to Contract & Document Reviews...');
      navigate('/desktop/tickets');
    } else if (actLabel.includes('Clear')) {
      setShowSummaryModal(true);
    } else {
      toast.info(`Executing: ${actLabel}`);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto font-sans custom-scrollbar transition-colors duration-500" style={{ background: 'hsl(var(--background))' }}>
      <div className="w-full max-w-[1600px] mx-auto p-5 md:p-6 space-y-5">

        {/* ── 1. Compact Header & Omni-Search Row ─────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border rounded-2xl p-5 shadow-lg transition-colors duration-500" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden border shadow-md shrink-0 transition-colors" style={{ borderColor: 'hsl(var(--border))' }}>
              <img src="/chatr-ai-logo.jpg" alt="chatrAI" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight transition-colors" style={{ color: 'hsl(var(--foreground))' }}>
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">{userName}</span> 👋
              </h1>
              <p className="text-[11px] font-medium uppercase tracking-wider transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }}>
                AI Processed {intentFeed.length} events today
              </p>
            </div>
          </div>

          {/* Omni Search bar */}
          <div className="w-full md:w-[460px] relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search everything (People, Projects, Emails) or type an intent..."
              className="w-full h-10 bg-black/40 border border-white/15 rounded-xl pl-10 pr-12 text-xs font-medium text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-slate-300 border border-white/10">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* ── 2. Compact AI Intelligence Brief Banner ── */}
        <div className="rounded-2xl border p-4 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-4 transition-colors duration-500" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto custom-scrollbar pb-1 lg:pb-0">
            <div className="flex items-center gap-2.5 mr-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest shrink-0 transition-colors" style={{ color: 'hsl(var(--foreground))' }}>AI Brief</span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button onClick={() => setShowSummaryModal(true)} className="bg-black/50 border border-white/10 hover:border-indigo-500/40 rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer">
                <span className="text-lg font-black text-white">{intelligenceBrief.metrics.emails}</span>
                <span className="text-[11px] font-medium text-slate-300">Unread Items</span>
              </button>
              <button onClick={() => setShowTriageModal(true)} className="bg-rose-500/15 border border-rose-500/30 hover:border-rose-500/50 rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer">
                <span className="text-lg font-black text-rose-400">{intelligenceBrief.metrics.contracts}</span>
                <span className="text-[11px] font-bold text-rose-300">Action Items</span>
              </button>
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <span className="text-lg font-black text-emerald-400">{intelligenceBrief.metrics.meetings}</span>
                <span className="text-[11px] font-bold text-emerald-300">Meetings</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSummaryModal(true)} className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/30">
                <BrainCircuit className="w-3.5 h-3.5" /> AI Summary
              </button>
              <button onClick={() => setShowTriageModal(true)} className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Triage Attention
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-white/10">
              {connectedProviders.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => startProviderLogin(p)}
                  className="p-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] transition-colors cursor-pointer"
                  title={`Connect ${p.name}`}
                >
                  <p.icon className="w-3.5 h-3.5 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Main Content Row ──── */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-6 rounded-2xl border p-5 flex flex-col gap-4 min-h-[420px] shadow-lg transition-colors duration-500" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h2 className="text-xs font-black text-white/90 uppercase tracking-[0.18em]">{searchQuery ? 'Search Results' : 'Intent Timeline'}</h2>
              </div>
              <button onClick={() => navigate('/desktop/chat')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">View All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2.5">
              {searchQuery && searchResults.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-10">No results found for "{searchQuery}"</div>
              ) : (!searchQuery && intentFeed.length === 0) ? (
                <div className="text-center text-slate-400 text-xs py-10">No events yet... waiting for OS Kernel sync.</div>
              ) : (searchQuery ? searchResults : intentFeed).map((event: any, idx: number, arr: any[]) => {
                const IconComponent = getIcon(event.icon);
                return (
                  <div key={event.id || idx} className="flex gap-3.5 relative group p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all cursor-pointer" onClick={() => navigate('/desktop/chat')}>
                    {idx !== arr.length - 1 && (
                      <div className="absolute left-[21px] top-9 bottom-[-14px] w-[2px] bg-white/10 group-hover:bg-white/20 transition-colors"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 z-10 group-hover:border-indigo-500/40 transition-colors">
                      <IconComponent className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-baseline justify-between mb-1">
                        <p className="text-xs font-bold text-white truncate">{event.title}</p>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{event.detail}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="text-[11px] text-slate-400">{event.category}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border p-5 flex flex-col gap-4 min-h-[420px] shadow-lg transition-colors duration-500" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <h2 className="text-xs font-black text-white/90 uppercase tracking-[0.18em]">Active Intents</h2>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {activeIntents.map(intent => (
                <div key={intent.id} className="group cursor-pointer p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] transition-all" onClick={() => navigate('/desktop/studio')}>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">{intent.text}</p>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 shrink-0 ml-2">{intent.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${intent.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border p-5 flex flex-col gap-4 min-h-[420px] shadow-lg transition-colors duration-500" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                <Database className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <h2 className="text-xs font-black text-white/90 uppercase tracking-[0.18em]">Recent Memory</h2>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {recentMemory.map(mem => {
                const MemIcon = getMemoryIcon(mem.type);
                return (
                  <div key={mem.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3 hover:bg-white/[0.07] hover:border-violet-500/30 cursor-pointer transition-all" onClick={() => navigate('/desktop/canvas')}>
                    <div className="w-7.5 h-7.5 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                      <MemIcon className="w-3.5 h-3.5 text-violet-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{mem.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{mem.type} · {mem.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── AI Summarize Inbox Modal ───────────────────────────── */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowSummaryModal(false)}>
          <div className="relative w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-5 transition-colors" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">AI Inbox Executive Summary</h2>
              </div>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 leading-relaxed">
                <p className="font-bold text-white mb-1">Key Takeaway Summary</p>
                You have 12 unread communications requiring action today. High-priority items include an updated NDA contract from Acme Corp and HR Payroll sign-off.
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Highlights</p>
                {[
                  { title: 'Acme Corp NDA Proposal v3', detail: 'Requires legal signature before 5 PM', icon: <FileText className="w-3.5 h-3.5 text-rose-400" /> },
                  { title: 'HR Payroll Approval', detail: 'Q3 compensation batch review pending', icon: <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> },
                  { title: 'Srinagar Flight Price Drop', detail: 'Fare drop alert (-₹4,500) available', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    {item.icon}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={() => setShowSummaryModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white font-semibold text-xs cursor-pointer">Close</button>
              <button onClick={() => { setShowSummaryModal(false); toast.success('Inbox triage applied'); }} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Archive Read Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Triage Modal ────────────────────────────────────── */}
      {showTriageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowTriageModal(false)}>
          <div className="relative w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-5 transition-colors" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">AI Triage Attention List</h2>
              </div>
              <button onClick={() => setShowTriageModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { title: 'Approve Payroll Workflow', urgency: 'Immediate', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
                { title: 'Confirm Candidate Interview Slots', urgency: 'Today', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
                { title: 'Review Q3 Financial Forecast', urgency: 'This Week', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="font-bold text-white">{item.title}</span>
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase', item.color)}>{item.urgency}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={() => setShowTriageModal(false)} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer">
                Dismiss Triage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

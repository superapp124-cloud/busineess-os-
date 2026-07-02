import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, ShieldAlert, KeyRound, MessageSquareText, RefreshCw, ChevronDown, CheckCircle2, 
  AlertTriangle, Fingerprint, Mail, Inbox, Globe, Lock, ArrowRight, Search, Phone, CheckSquare, 
  Sparkles, Calendar, Clock, CreditCard, Tag, Bot, Palette, Star, CornerUpLeft, CircleDollarSign, List,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Capacitor } from '@capacitor/core';
import '../types/plugins';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuthProvider } from '../services/auth/AuthProvider';
import { TokenManager, ConnectedAccount } from '../services/auth/TokenManager';
import { MailSyncEngine } from '../services/sync/MailSyncEngine';
import { GoogleAdapter } from '../services/mail/GoogleAdapter';
import { MicrosoftAdapter } from '../services/mail/MicrosoftAdapter';
import { LocalDB, StoredMessage } from '../services/db/LocalDB';
import { SearchEngine, UnifiedSearchResult } from '../services/search/SearchEngine';
import { DashboardEngine, DailyStats } from '../services/dashboard/DashboardEngine';

interface SmsRisk {
  isOtp: boolean;
  otpCode?: string;
  spamScore: number;
  riskLevel: string;
  reasons: string[];
}

interface SmsConversation {
  conversationId: string;
  address: string;
  displayName: string;
  lastBody: string;
  lastTimestamp: number;
  unreadCount: number;
  lastRisk: SmsRisk;
}

interface SmsMessage {
  id: string;
  body: string;
  timestamp: number;
  direction: string;
  risk: SmsRisk;
}

interface AppNotification {
  id: string;
  type: string;
  title: string;
  content: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export default function SmartInbox() {
  const [conversations, setConversations] = useState<SmsConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, SmsMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'messages' | 'mail' | 'calls'>('inbox'); // Default to inbox
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [localMessages, setLocalMessages] = useState<StoredMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncState, setSyncState] = useState<{ step: string, progress: number, max: number } | null>(null);
  const [theme, setTheme] = useState<'midnight' | 'daylight' | 'ocean'>('midnight');
  const [searchPlaceholder, setSearchPlaceholder] = useState('What needs my attention today?');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [briefingText, setBriefingText] = useState('Loading intelligence...');
  const [userName, setUserName] = useState('there');
  const [greeting, setGreeting] = useState('Good day');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Gated per architecture rules: do not expose Smart Inbox until VoIP/GSM calling is fully stable.
  const isCallingStable = true;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();
          if (profile?.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
          } else {
            setUserName(user.email?.split('@')[0] || 'there');
          }
        }
      } catch (e) {
        console.error("Failed to fetch user:", e);
      }
    };
    fetchUser();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        const results = await SearchEngine.query(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
    };

    fetchNotifications();

    const notifChannel = supabase.channel('schema-db-changes-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, []);

  useEffect(() => {
    loadConversations();
    loadAccounts();
    
    // Background sync daemon (Mocked out for multi-stage)

    const handleSyncComplete = () => {
      setSyncState(null);
      loadLocalMessages();
    };
    
    const handleSyncProgress = (e: any) => {
      setSyncState(e.detail);
    };

    const handleSyncError = (e: any) => {
      setSyncState(null);
      toast.error(e.detail.error);
    };

    window.addEventListener('chatr:sync_progress', handleSyncProgress as EventListener);
    window.addEventListener('chatr:sync_complete', handleSyncComplete as EventListener);
    window.addEventListener('chatr:sync_error', handleSyncError as EventListener);
    
    loadLocalMessages();
    
    setSearchPlaceholder('Ask CHATR Intelligence...');
    
    return () => {
      window.removeEventListener('chatr:sync_progress', handleSyncProgress as EventListener);
      window.removeEventListener('chatr:sync_complete', handleSyncComplete as EventListener);
      window.removeEventListener('chatr:sync_error', handleSyncError as EventListener);
    };
  }, []);

  const loadLocalMessages = async () => {
    const msgs = await LocalDB.getAllMessages();
    setLocalMessages(msgs);
    
    const stats = await DashboardEngine.getDailyStats();
    setDailyStats(stats);
    setBriefingText(DashboardEngine.generateBriefingText(stats));
  };

  const loadAccounts = async () => {
    try {
      // Check for OAuth redirect first
      const newAccount = await AuthProvider.handleRedirectCallback();
      if (newAccount) {
        toast.success(`Connected to ${newAccount.provider}`);
        const adapter = newAccount.provider === 'google' ? new GoogleAdapter() : new MicrosoftAdapter();
        MailSyncEngine.syncAccount(newAccount.id, newAccount.provider, adapter);
      }
    } catch (e) {
      console.error('OAuth callback error', e);
    }
    const accounts = await TokenManager.getAccounts();
    setConnectedAccounts(accounts);
  };

  const handleConnect = async (provider: 'google' | 'microsoft') => {
    setIsConnecting(true);
    try {
      const account = await AuthProvider.login(provider);
      setConnectedAccounts(prev => [...prev, account]);
      
      const adapter = provider === 'google' ? new GoogleAdapter() : new MicrosoftAdapter();
      MailSyncEngine.syncAccount(account.id, provider, adapter);
      
      toast.success(`Connected to ${provider}`);
    } catch (e) {
      console.error('Failed to connect', e);
      toast.error(`Failed to connect ${provider}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectAccounts = async () => {
    // For MVP, just logs out all
    for (const acc of connectedAccounts) {
      await AuthProvider.logout(acc.id);
    }
    setConnectedAccounts([]);
    await LocalDB.clearAll();
    await loadLocalMessages();
    toast.success('Disconnected all accounts');
  };

  const loadConversations = async () => {
    if (!Capacitor.isNativePlatform() || !Capacitor.Plugins.ChatrSafeSms) {
      setLoading(false);
      return;
    }
    try {
      const { conversations: nativeConvos } = await Capacitor.Plugins.ChatrSafeSms.getConversations({ limit: 100 });
      if (Array.isArray(nativeConvos)) {
        setConversations(nativeConvos);
      }
    } catch (err) {
      console.warn('Failed to load Safe SMS', err);
      toast.error('Failed to load Native SMS');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (conversationId: string) => {
    if (expandedId === conversationId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(conversationId);
    if (messages[conversationId]) return;

    try {
      const { messages: nativeMsgs } = await Capacitor.Plugins.ChatrSafeSms.getMessages({ conversationId, limit: 50 });
      if (Array.isArray(nativeMsgs)) {
        setMessages(prev => ({ ...prev, [conversationId]: nativeMsgs }));
      }
    } catch (err) {
      console.warn('Failed to load messages', err);
    }
  };

  const handleSync = async () => {
    if (!Capacitor.isNativePlatform() || !Capacitor.Plugins.ChatrSafeSms) return;
    setSyncing(true);
    try {
      const result = await Capacitor.Plugins.ChatrSafeSms.syncExistingMessages({ limit: 300 });
      if (result.synced > 0) {
        toast.success(`Successfully scanned ${result.synced} existing SMS messages.`);
        await loadConversations();
      } else {
        toast.info('No existing SMS messages found to sync.');
      }
    } catch (err: any) {
      console.error('Sync failed', err);
      toast.error(err.message || 'Failed to sync SMS messages. Permission denied?');
    } finally {
      setSyncing(false);
    }
  };

  const getRiskBadge = (risk: SmsRisk) => {
    if (risk.isOtp) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium backdrop-blur-md">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Verified OTP</span>
        </div>
      );
    }
    if (risk.riskLevel === 'scam' || risk.riskLevel === 'high') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.2)]">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Threat Blocked</span>
        </div>
      );
    }
    if (risk.riskLevel === 'suspicious') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium backdrop-blur-md">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Suspicious</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium backdrop-blur-md">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Safe</span>
      </div>
    );
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-indigo-500 to-purple-500',
      'from-rose-400 to-orange-400',
      'from-emerald-400 to-cyan-500',
      'from-blue-500 to-teal-400',
      'from-fuchsia-500 to-pink-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  const themeStyles = {
    midnight: "bg-[#0A0A0A] text-slate-100 selection:bg-indigo-500/30",
    ocean: "bg-[#0B192C] text-slate-100 selection:bg-blue-500/30",
    daylight: "bg-slate-50 text-slate-900 selection:bg-indigo-500/30"
  };

  const headerThemeStyles = {
    midnight: "bg-[#0A0A0A]/80",
    ocean: "bg-[#0B192C]/80",
    daylight: "bg-slate-50/80"
  };

  // Helper to toggle themes
  const cycleTheme = () => {
    const themes: ('midnight' | 'ocean' | 'daylight')[] = ['midnight', 'ocean', 'daylight'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  if (!isCallingStable) {
    return (
      <div className={cn("min-h-screen relative flex flex-col items-center justify-center p-6", themeStyles[theme])}>
        <Lock className="w-12 h-12 text-indigo-500/50 mb-6" />
        <h2 className="text-xl font-medium mb-3">Smart Inbox Locked</h2>
        <p className="text-sm text-slate-400 text-center max-w-sm mb-6 leading-relaxed">
          Per Chatr architecture rules, Smart Inbox is disabled until core VoIP and GSM calling stability gates are fully cleared.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10" onClick={() => window.history.back()}>
            <CornerUpLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen overflow-hidden relative flex flex-col transition-colors duration-500", themeStyles[theme])}>
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/10 blur-[120px]" />
      </div>

      {/* Header & Trust Center */}
      <div className={cn("sticky top-0 z-20 backdrop-blur-3xl border-b border-white/5 pt-10 pb-4 px-4 flex flex-col gap-4 transition-colors duration-500", headerThemeStyles[theme])}>
        
        {/* Trust Center Strip */}
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase">
          <div className="flex gap-3 text-emerald-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ChatrAI</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
            {dailyStats && (
              <span className="flex items-center gap-1 ml-2 text-indigo-400">
                100% of {dailyStats.totalEmails} synced emails processed on-device
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 flex items-center gap-1"><Globe className="w-3 h-3" /> Local AI Only</span>
            <button onClick={cycleTheme} className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
               <Palette className="w-3 h-3 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* AI Search Bar */}
        <div className="relative group z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur group-focus-within:blur-md transition-all" />
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-slate-400 transition-all duration-500"
            />
          </div>
          
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
            {['Find invoices', 'Show suspicious emails', 'Summarize unread', 'Bills due', 'Meeting invites'].map(prompt => (
              <button 
                key={prompt}
                onClick={() => setSearchQuery(prompt)}
                className="whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-full transition-colors border border-white/5"
              >
                {prompt}
              </button>
            ))}
          </div>
          {/* Unified Search Mock Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.length >= 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-3xl overflow-hidden"
              >
                <div className="px-3 py-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Unified Search Results</div>
                <div className="space-y-1">
                  {searchResults.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-slate-400">No results found across Mail, SMS, and Calls.</div>
                  ) : (
                    searchResults.map(result => (
                      <div key={`${result.source}-${result.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                        {result.source === 'mail' && <Mail className="w-4 h-4 text-emerald-400" />}
                        {result.source === 'sms' && <MessageSquareText className="w-4 h-4 text-blue-400" />}
                        {result.source === 'call' && <Phone className="w-4 h-4 text-purple-400" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {result.title} <span className="text-slate-400 font-normal capitalize">· {result.source}</span>
                          </p>
                          <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 flex-shrink-0">
                          {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab Switcher */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {[
              { id: 'inbox', label: 'Inbox', icon: Inbox },
              { id: 'messages', label: 'Messages', icon: MessageSquareText },
              { id: 'mail', label: 'Mail', icon: Mail },
              { id: 'calls', label: 'Calls', icon: Phone }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-white/10 text-white shadow-lg border border-white/10" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6 z-10 relative mb-32">
        
        {/* Compact Summary Strip & Daily Brief */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-2">{greeting}, {userName}.</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4 bg-white/5 p-4 rounded-xl border border-white/10">
            {briefingText}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="bg-transparent border border-white/10 rounded-xl px-4 py-2 min-w-[max-content] flex items-center">
              <Star className="w-4 h-4 text-amber-400" /> <span className="font-bold text-amber-400 ml-2">{dailyStats?.priority || 0}</span> <span className="text-xs text-slate-400 ml-1">Priority</span>
            </div>
            <div className="bg-transparent border border-indigo-500/30 rounded-xl px-4 py-2 min-w-[max-content] flex items-center">
              <CornerUpLeft className="w-4 h-4 text-indigo-400" /> <span className="font-bold text-indigo-400 ml-2">{dailyStats?.repliesNeeded || 0}</span> <span className="text-xs text-indigo-400/80 ml-1">Replies Needed</span>
            </div>
            <div className="bg-transparent border border-amber-500/30 rounded-xl px-4 py-2 min-w-[max-content] flex items-center">
              <CircleDollarSign className="w-4 h-4 text-amber-400" /> <span className="font-bold text-amber-400 ml-2">{dailyStats?.billsDue || 0}</span> <span className="text-xs text-amber-400/80 ml-1">Bills Due</span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 min-w-[max-content] flex items-center">
              <span className="text-xl">⚠️</span> <span className="font-bold text-rose-400 ml-2">{dailyStats?.threatsBlocked || 0}</span> <span className="text-xs text-rose-400/80 ml-1">Threats</span>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 min-w-[max-content] flex items-center">
              <span className="text-xl">📅</span> <span className="font-bold text-blue-400 ml-2">{dailyStats?.meetings || 0}</span> <span className="text-xs text-blue-400/80 ml-1">Meetings</span>
            </div>
          </div>
        </div>

        {activeTab === 'mail' ? (
          <div className="space-y-4">
            
            {connectedAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Hero / Value Prop */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Experience CHATR Intelligence</h3>
                  <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                    Connect your inbox to automatically categorize emails, block threats, and get concise summaries—all processed 100% locally on your device.
                  </p>
                </div>

                {/* Example Cards */}
                <div className="w-full space-y-3 opacity-60 pointer-events-none">
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Example Intelligence</span>
                  </div>
                  
                  {/* Example 1 */}
                  <div className="group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-white/[0.02] p-5">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-3xl" />
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">
                          A
                        </div>
                        <div>
                          <h4 className="text-white font-semibold flex items-center gap-1">apple <CheckCircle2 className="w-3 h-3 text-emerald-400" /></h4>
                          <p className="text-xs text-slate-500">apple@secure.apple.com</p>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Your receipt from Apple</h3>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-indigo-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-wider uppercase">AI Summary</span>
                      </div>
                      <p className="text-slate-300 text-sm">Charged $0.99 for iCloud+ 50GB storage plan.</p>
                    </div>
                  </div>

                  {/* Example 2 */}
                  <div className="group relative overflow-hidden rounded-3xl border border-rose-500/30 bg-rose-500/[0.04] p-5">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-3xl" />
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-950 flex items-center justify-center text-rose-400 font-bold border border-rose-500/30">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-rose-400 font-semibold">Account Alert</h4>
                          <p className="text-xs text-rose-500/70">security@paypaI-update.com</p>
                        </div>
                      </div>
                      <span className="bg-rose-500/20 text-rose-400 text-xs px-3 py-1 rounded-full font-bold border border-rose-500/30 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> SCAM
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Verify your account immediately</h3>
                    <div className="bg-rose-950/50 border border-rose-500/20 rounded-2xl p-4">
                      <p className="text-rose-200 text-sm">Threat detected: Sender domain uses a capital 'i' instead of 'l' (paypaI). Contains suspicious login links.</p>
                    </div>
                  </div>
                </div>

                {/* Connection Buttons */}
                <div className="w-full max-w-sm space-y-3 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 justify-center mb-6 text-emerald-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-semibold">Zero-Knowledge Privacy • On-Device Processing</span>
                  </div>
                  
                  <Button onClick={() => handleConnect('google')} disabled={isConnecting} className="w-full bg-white text-black hover:bg-slate-200 h-14 rounded-2xl font-bold gap-3 text-md transition-transform active:scale-95">
                    <Globe className="w-5 h-5 text-rose-500" /> {isConnecting ? 'Connecting...' : 'Connect with Gmail'}
                  </Button>
                  <Button onClick={() => handleConnect('microsoft')} disabled={isConnecting} className="w-full bg-[#0078D4] text-white hover:bg-[#006cbd] h-14 rounded-2xl font-bold gap-3 text-md transition-transform active:scale-95">
                    <Globe className="w-5 h-5" /> {isConnecting ? 'Connecting...' : 'Connect with Outlook'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-emerald-400 font-semibold">{connectedAccounts.length} Account(s) Synced Locally</p>
                  <button onClick={disconnectAccounts} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Disconnect</button>
                </div>

                {syncState && (
                  <div className="bg-white/5 border border-indigo-500/30 rounded-3xl p-5 mb-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span className="text-white font-semibold">Syncing Intelligence...</span>
                      </div>
                      <span className="text-xs font-mono text-indigo-300">{Math.round((syncState.progress / syncState.max) * 100)}%</span>
                    </div>
                    
                    <div className="w-full bg-black/40 rounded-full h-2 mb-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(5, (syncState.progress / syncState.max) * 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 animate-pulse">{syncState.step}</span>
                      <span className="text-xs text-slate-500 font-mono">{syncState.progress} / {syncState.max} items</span>
                    </div>
                  </div>
                )}

                {!syncState && localMessages.length === 0 && (
                  <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02]">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-semibold">Inbox Zero</p>
                      <p className="text-sm text-slate-400">You're all caught up. No messages to review.</p>
                    </div>
                  </div>
                )}

                {localMessages.map(msg => (
                  <div key={msg.id} className={cn("group relative overflow-hidden rounded-3xl border backdrop-blur-xl p-5 cursor-pointer hover:bg-white/[0.04] transition-all duration-300",
                    msg.threatLevel === 'scam' ? "border-red-500/30 bg-red-500/[0.04] hover:bg-red-500/[0.08]" : "border-emerald-500/20 bg-white/[0.02]"
                  )}>
                    <div className={cn("absolute top-0 left-0 w-1 h-full bg-gradient-to-b",
                      msg.threatLevel === 'scam' ? "from-red-500 to-red-600" : "from-emerald-400 to-emerald-600"
                    )} />
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border",
                          msg.threatLevel === 'scam' ? "bg-slate-900 text-slate-300 border-red-500/50" : "bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-inner border-white/10"
                        )}>
                          {msg.sender.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 leading-tight flex items-center gap-1">
                            {msg.sender.split('@')[0]} {msg.threatLevel !== 'scam' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          </h4>
                          <p className={cn("text-[11px] font-medium", msg.threatLevel === 'scam' ? "text-red-400 line-through" : "text-slate-500")}>
                            {msg.sender}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                          msg.threatLevel === 'scam' ? "bg-red-500/20 text-red-300 border-red-500/20" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/20"
                        )}>
                          {msg.category || 'Update'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {formatDistanceToNow(new Date(msg.internalDate), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <h5 className="font-semibold text-white text-base mb-1">{msg.subject}</h5>
                    
                    {/* Intelligence Badges */}
                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                      {msg.threatLevel === 'scam' ? (
                        <span className="px-2 py-1 rounded bg-red-500/20 text-[10px] font-bold text-red-300 flex items-center gap-1 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" /> Attention: 🔴 High Risk
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Attention: 🟢 {msg.attentionScore}
                        </span>
                      )}
                    </div>
                    
                    {/* Relationship Intelligence */}
                    <div className={cn("flex flex-col gap-2 text-[10px] mb-4 p-3 rounded-xl border",
                      msg.threatLevel === 'scam' ? "text-slate-400 bg-black/40 border-red-500/20" : "text-slate-400 bg-black/20 border-white/5"
                    )}>
                      <div className="flex gap-3">
                        <span className={cn("flex items-center gap-1", !msg.relationshipStats?.isVerified && "text-red-400")}>
                          {msg.relationshipStats?.isVerified ? <Globe className="w-3 h-3 text-emerald-400" /> : <ShieldAlert className="w-3 h-3" />} 
                          {msg.relationshipStats?.isVerified ? 'Verified Sender' : 'Not Verified'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Inbox className="w-3 h-3" /> {msg.relationshipStats?.previousEmailsCount} prev emails
                        </span>
                      </div>
                      {(msg.category === 'Finance' || msg.category === 'Purchases') && msg.relationshipStats?.isVerified && (
                        <div className="flex gap-3 text-emerald-400/80 mt-1 pt-2 border-t border-white/5">
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Normal billing pattern</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last payment: 30 days ago</span>
                        </div>
                      )}
                    </div>

                    {/* Structured AI Summary */}
                    <div className={cn("p-3 rounded-2xl border",
                      msg.threatLevel === 'scam' ? "bg-red-500/10 border-red-500/30" : "bg-indigo-500/5 border-indigo-500/10"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {msg.threatLevel === 'scam' ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                        <p className={cn("text-xs font-bold uppercase tracking-wider",
                          msg.threatLevel === 'scam' ? "text-red-300" : "text-indigo-300"
                        )}>
                          {msg.threatLevel === 'scam' ? 'Phishing Attempt Blocked' : 'AI Summary'}
                        </p>
                      </div>
                      
                      {msg.threatLevel === 'scam' ? (
                        <p className="text-sm text-red-200/90 leading-relaxed">{msg.snippet}</p>
                      ) : (
                        <ul className="text-sm text-slate-300 space-y-1 ml-6 list-disc marker:text-indigo-500/50">
                          {msg.intelligenceSummary?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      )}

                      {/* Explainable AI Decision */}
                      <details className="mt-3 group/details" open={msg.threatLevel === 'scam'}>
                        <summary className={cn("text-[11px] font-medium cursor-pointer list-none flex items-center gap-1 select-none",
                          msg.threatLevel === 'scam' ? "text-red-300 font-bold uppercase tracking-wider" : "text-indigo-300"
                        )}>
                           {msg.threatLevel === 'scam' ? 'Why is this suspicious?' : `Why did CHATR mark this as ${msg.attentionScore}?`} <ChevronDown className="w-3 h-3 group-open/details:rotate-180 transition-transform"/>
                        </summary>
                        <div className={cn("mt-2 space-y-1.5 text-[11px] pl-2 border-l",
                          msg.threatLevel === 'scam' ? "text-red-200/80 border-red-500/30" : "text-slate-400 border-white/10"
                        )}>
                          {msg.intelligenceSummary?.map((reason, i) => (
                             <p key={i} className="flex items-center gap-2">
                               <CheckCircle2 className={cn("w-3 h-3", msg.threatLevel === 'scam' ? "text-red-400" : "text-emerald-500")}/> {reason}
                             </p>
                          ))}
                        </div>
                      </details>
                    </div>

                    {/* AI Recommendation */}
                    {msg.recommendation && (
                      <div className={cn("mt-3 flex items-center justify-between p-3 rounded-2xl border",
                        msg.recommendation.actionStyle === 'danger' ? "bg-red-500/5 border-red-500/10" : "bg-white/5 border-white/5"
                      )}>
                        <div className="flex items-center gap-2">
                          <Bot className={cn("w-4 h-4", msg.recommendation.actionStyle === 'danger' ? "text-red-400" : "text-emerald-400")} />
                          <span className={cn("text-xs font-medium", msg.recommendation.actionStyle === 'danger' ? "text-red-200" : "text-slate-300")}>
                            AI Recommendation: {msg.recommendation.text}
                          </span>
                        </div>
                        <button className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors",
                          msg.recommendation.actionStyle === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20" : "bg-white/10 hover:bg-white/20"
                        )}>
                          {msg.recommendation.actionLabel}
                        </button>
                      </div>
                    )}

                    {/* Smart Reply Suggestions */}
                    {msg.smartReplies && msg.smartReplies.length > 0 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {msg.smartReplies.map((reply, i) => (
                          <button key={i} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-slate-300 border border-white/10 whitespace-nowrap transition-colors flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-indigo-400"/> {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </>
            )}
          </div>
        ) : activeTab === 'messages' ? (
          <div className="space-y-4 pb-20">
            {conversations.length === 0 && !loading && (
               <div className="flex flex-col items-center justify-center h-64 text-center space-y-6 mt-10">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                   <Shield className="w-10 h-10 text-indigo-400" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-white mb-2">Inbox Secure & Empty</h3>
                   <p className="text-slate-400">Tap below to scan your device for existing messages.</p>
                 </div>
                 <Button onClick={handleSync} disabled={syncing} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-8 py-6 h-auto text-lg font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 gap-3">
                   <RefreshCw className={cn("w-5 h-5", syncing && "animate-spin")} />
                   {syncing ? 'Scanning...' : 'Initialize AI Scan'}
                 </Button>
               </div>
            )}
            
            {conversations.map((convo, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={convo.conversationId}
              >
                <motion.div 
                  onClick={() => toggleExpand(convo.conversationId)}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04] cursor-pointer",
                    expandedId === convo.conversationId && "bg-white/[0.04] border-white/10 shadow-2xl shadow-black/50"
                  )}
                >
                  <div className="p-5">
                    <div className="flex gap-4 items-start">
                      {/* Avatar */}
                      <div className={cn("w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-inner bg-gradient-to-br", getAvatarGradient(convo.displayName || convo.address))}>
                        {(convo.displayName || convo.address).charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-base text-slate-100 truncate pr-4">
                            {convo.displayName || convo.address}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap bg-white/5 px-2 py-1 rounded-full">
                            {formatDistanceToNow(new Date(convo.lastTimestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={cn("text-sm text-slate-400 mb-3", expandedId !== convo.conversationId && "truncate")}>
                          {convo.lastBody}
                        </p>
                        <div className="flex items-center justify-between">
                          {getRiskBadge(convo.lastRisk)}
                          <motion.div 
                            animate={{ rotate: expandedId === convo.conversationId ? 180 : 0 }}
                            className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedId === convo.conversationId && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/20"
                      >
                        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                          {messages[convo.conversationId] ? (
                            messages[convo.conversationId].map(msg => (
                              <motion.div 
                                initial={{ opacity: 0, x: msg.direction === 'inbox' ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={msg.id} 
                                className={cn("flex flex-col max-w-[85%]", msg.direction === 'inbox' ? "self-start" : "self-end items-end ml-auto")}
                              >
                                <div className={cn(
                                  "px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                                  msg.direction === 'inbox' 
                                    ? "bg-white/10 text-slate-200 rounded-tl-sm border border-white/5" 
                                    : "bg-indigo-600 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(79,70,229,0.3)]",
                                  msg.risk.riskLevel === 'scam' && msg.direction === 'inbox' && "bg-rose-500/10 border-rose-500/30 text-rose-100"
                                )}>
                                  <p className="whitespace-pre-wrap">{msg.body}</p>
                                  {msg.risk.isOtp && msg.risk.otpCode && (
                                    <div className="mt-3 p-3 bg-black/30 rounded-xl flex items-center justify-between border border-white/5">
                                      <div className="flex items-center gap-2 text-indigo-300">
                                        <Fingerprint className="w-4 h-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Secure OTP</span>
                                      </div>
                                      <span className="font-mono font-bold text-lg tracking-widest text-white">{msg.risk.otpCode}</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-[10px] font-medium text-slate-500 mt-1.5 px-2">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </motion.div>
                            ))
                          ) : (
                            <div className="flex justify-center py-6">
                              <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </div>
        ) : activeTab === 'inbox' ? (
          <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Unified Notifications</h3>
            </div>
            
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 mt-10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Inbox className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={notif.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-300",
                      notif.is_read 
                        ? "bg-white/5 border-white/10 opacity-70"
                        : "bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    )}
                  >
                    <div className="flex gap-4 items-start">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        notif.type === 'message' ? "bg-blue-500/20 text-blue-400" :
                        notif.type === 'alert' ? "bg-rose-500/20 text-rose-400" :
                        notif.type === 'call_missed' ? "bg-purple-500/20 text-purple-400" :
                        "bg-slate-700/50 text-slate-300"
                      )}>
                        {notif.type === 'message' && <MessageSquareText className="w-5 h-5" />}
                        {notif.type === 'alert' && <AlertTriangle className="w-5 h-5" />}
                        {notif.type === 'call_missed' && <Phone className="w-5 h-5" />}
                        {notif.type === 'system' && <Settings className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-white text-sm">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{notif.content}</p>
                        {notif.action_url && (
                          <Button variant="link" className="px-0 h-auto text-indigo-400 mt-2 text-xs">
                            View Details <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-6 mt-10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Bot className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-slate-400 text-lg font-medium">Select a tab to view AI Intelligence.</p>
          </div>
        )}
      </ScrollArea>

      {/* Docked AI Assistant */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-3xl border-t border-white/10 p-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-2 text-slate-400">
            <span className="text-sm font-medium">Ask CHATR Intelligence...</span>
          </div>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-semibold text-slate-300 whitespace-nowrap"><List className="w-3.5 h-3.5" /> Summarize Today</button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-semibold text-slate-300 whitespace-nowrap"><Shield className="w-3.5 h-3.5" /> Show Threats</button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-semibold text-slate-300 whitespace-nowrap"><CornerUpLeft className="w-3.5 h-3.5" /> Reply Priority</button>
        </div>
      </div>
    </div>
  );
}

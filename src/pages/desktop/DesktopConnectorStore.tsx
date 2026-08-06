import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Zap, RefreshCw, Unplug, CheckCircle, 
  Sparkles, Lock, ShieldCheck, Mail, Calendar, FileText, Code, 
  Users, Check, ExternalLink, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { startConnectorOAuth } from '@/core/connector/SupabaseConnectorHub';
import { storeGoogleToken, isGoogleAuthenticated, launchGoogleOAuthFlow } from '@/core/connector/providers/GmailService';

export interface IntegrationConnector {
  id: string;
  name: string;
  badge: 'Production' | 'Preview' | 'Beta';
  certified: boolean;
  category: 'Messaging & Email' | 'Calendar & Meetings' | 'Files & Storage' | 'Work & Code' | 'Customers & Sales' | 'Notes & Tasks' | 'Payments & Business';
  iconBg: string;
  iconCode: string;
  description: string;
  capabilities: string[];
  statusText: string;
  capabilityCount: number;
  loginUrl?: string;
  status: 'connected' | 'setup_required' | 'connecting';
}

const INITIAL_CONNECTORS: IntegrationConnector[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    badge: 'Production',
    certified: true,
    category: 'Messaging & Email',
    iconBg: '#EA4335',
    iconCode: 'G',
    description: 'Read, search and send email from your Google account.',
    capabilities: ['Read your email', 'Send email on your behalf'],
    statusText: 'Connect to enable email, calendar and AI capabilities.',
    capabilityCount: 2,
    loginUrl: 'https://mail.google.com/',
    status: 'setup_required'
  },
  {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    badge: 'Production',
    certified: true,
    category: 'Messaging & Email',
    iconBg: '#0078D4',
    iconCode: 'O',
    description: 'Work mail and contacts from Microsoft 365.',
    capabilities: ['Read your email', 'Send email on your behalf', 'Read your contacts'],
    statusText: 'Connect to enable email, calendar and AI capabilities.',
    capabilityCount: 3,
    loginUrl: 'https://outlook.live.com/',
    status: 'setup_required'
  },
  {
    id: 'imap',
    name: 'IMAP / SMTP',
    badge: 'Preview',
    certified: true,
    category: 'Messaging & Email',
    iconBg: '#475569',
    iconCode: 'I',
    description: 'Connect any mailbox that speaks IMAP and SMTP.',
    capabilities: ['Read your email', 'Send email on your behalf'],
    statusText: 'Finishing authorisation with the provider.',
    capabilityCount: 2,
    status: 'connecting'
  },
  {
    id: 'slack',
    name: 'Slack',
    badge: 'Production',
    certified: true,
    category: 'Messaging & Email',
    iconBg: '#4A154B',
    iconCode: 'S',
    description: 'Read channels and post messages to your workspace.',
    capabilities: ['Read channels', 'Post messages', 'User mentions'],
    statusText: 'Connect to enable chat & message index.',
    capabilityCount: 3,
    loginUrl: 'https://app.slack.com/',
    status: 'setup_required'
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    badge: 'Production',
    certified: true,
    category: 'Files & Storage',
    iconBg: '#34A853',
    iconCode: 'GD',
    description: 'Search, read, and upload files from your Google Drive.',
    capabilities: ['Search files', 'Read documents', 'Upload files'],
    statusText: 'Connect to enable document intelligence.',
    capabilityCount: 3,
    loginUrl: 'https://drive.google.com/',
    status: 'setup_required'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    badge: 'Production',
    certified: true,
    category: 'Work & Code',
    iconBg: '#0A66C2',
    iconCode: 'Li',
    description: 'Work profile and network connections from LinkedIn.',
    capabilities: ['Read profile', 'Read connections', 'Direct messages'],
    statusText: 'Connect to enable candidate sourcing.',
    capabilityCount: 3,
    loginUrl: 'https://www.linkedin.com/feed/',
    status: 'setup_required'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    badge: 'Production',
    certified: true,
    category: 'Messaging & Email',
    iconBg: '#25D366',
    iconCode: 'WA',
    description: 'Connect WhatsApp Web or Meta Business API to sync chat conversations.',
    capabilities: ['Read chats', 'Send messages', 'Media attachments'],
    statusText: 'Connect to enable messaging graph.',
    capabilityCount: 3,
    loginUrl: 'https://web.whatsapp.com/',
    status: 'setup_required'
  }
];

export default function DesktopConnectorStore() {
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState<IntegrationConnector[]>(INITIAL_CONNECTORS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Update status from localStorage or token presence
  useEffect(() => {
    if (isGoogleAuthenticated()) {
      setConnectors(prev => prev.map(c => c.id === 'gmail' ? { ...c, status: 'connected' } : c));
    }
  }, []);

  const handleConnect = async (conn: IntegrationConnector) => {
    try {
      await startConnectorOAuth(conn.id);
      setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'connected' } : c));
    } catch (e: any) {
      if (conn.loginUrl) window.open(conn.loginUrl, '_blank');
    }
  };

  const handleSyncNow = (conn: IntegrationConnector) => {
    toast.success(`Syncing ${conn.name} streams in real-time...`);
  };

  const handleDisconnect = (conn: IntegrationConnector) => {
    setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'setup_required' } : c));
    toast.info(`Disconnected ${conn.name}`);
  };

  const categories = [
    'All', 
    'Messaging & Email', 
    'Calendar & Meetings', 
    'Files & Storage', 
    'Work & Code', 
    'Customers & Sales', 
    'Notes & Tasks', 
    'Payments & Business'
  ];

  const filteredConnectors = connectors.filter(c => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const connectedCount = connectors.filter(c => c.status === 'connected').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans p-6 md:p-10">
      
      {/* Top Header & Back Button */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Integrations</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-zinc-200">{connectedCount} connected</span> • {connectors.length} available • 0 coming soon
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/desktop/inbox')}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            <Mail size={16} />
            <span>📥 Open Universal Inbox</span>
          </button>
        </div>

        {/* Action Prompt Search Input */}
        <div className="relative">
          <input 
            type="text"
            placeholder="What do you want to do? e.g. read email, see files"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer",
                activeCategory === cat 
                  ? "bg-violet-600 text-white shadow-sm" 
                  : "bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Integrations Cards List */}
        <div className="space-y-4 pt-2">
          {filteredConnectors.map(conn => (
            <div key={conn.id} className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              
              {/* Card Top: Icon, Title, Badges */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0" style={{ backgroundColor: conn.iconBg }}>
                    {conn.iconCode}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{conn.name}</h3>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono",
                        conn.badge === 'Production' ? "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      )}>
                        {conn.badge}
                      </span>
                      {conn.certified && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-500" /> Certified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{conn.description}</p>

                    {/* Capability Pills */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {conn.capabilities.map((cap, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-white/5 font-medium">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 bg-slate-50 dark:bg-black/40 border border-slate-200/60 dark:border-white/5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    conn.status === 'connected' ? "bg-emerald-500" : conn.status === 'connecting' ? "bg-amber-400 animate-pulse" : "bg-amber-500"
                  )} />
                  <span className="text-slate-600 dark:text-zinc-300 font-medium">
                    {conn.status === 'connected' ? '✓ Connected & Active' : conn.statusText}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  {conn.capabilityCount} capabilities
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                {conn.status !== 'connected' ? (
                  <button 
                    onClick={() => handleConnect(conn)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Zap size={14} />
                    <span>Connect</span>
                  </button>
                ) : null}

                <button 
                  onClick={() => handleSyncNow(conn)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-200 font-semibold rounded-xl text-xs transition-all cursor-pointer border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span>Sync now</span>
                </button>

                <button 
                  onClick={() => handleDisconnect(conn)}
                  className="px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                >
                  <Unplug size={14} />
                  <span>Disconnect</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Search, Zap, RefreshCw, Unplug, CheckCircle, 
  Sparkles, Mail, Check, AlertTriangle, Loader2, ExternalLink,
  Webhook, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { startConnectorOAuth, invokeConnectorHub, syncConnection } from '@/core/connector/SupabaseConnectorHub';
import { isGoogleAuthenticated } from '@/core/connector/providers/GmailService';
import { CONNECTOR_CATALOG, GROUP_TO_CATEGORY } from '@/core/connector/catalog';
import type { ConnectorDefinition, Capability } from '@/core/connector/types';
import { maturityOf, MATURITY_LABEL, MATURITY_STYLE } from '@/core/connector/maturity';
import { PermissionManager } from '@/core/connector/permissions';

type ConnectorStatus = 'connected' | 'setup_required' | 'connecting' | 'error';

interface ConnectorWithStatus extends ConnectorDefinition {
  status: ConnectorStatus;
  connectionId?: string;
  lastSyncedAt?: string;
  health?: string;
  displayName?: string;
}

// Map catalog groups → display category labels
const CATEGORIES = [
  'All',
  'Messaging & Email',
  'Calendar & Meetings',
  'Files & Storage',
  'Work & Code',
  'Customers & Sales',
  'Notes & Tasks',
  'Payments & Business',
];

function getCategory(connector: ConnectorDefinition): string {
  const primaryGroup = connector.groups[0];
  return GROUP_TO_CATEGORY[primaryGroup] ?? 'Other';
}

function BadgePill({ connector }: { connector: ConnectorDefinition }) {
  const maturity = maturityOf(connector);
  const mStyle = MATURITY_STYLE[maturity];
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border",
        mStyle.bg, mStyle.text, mStyle.border
      )}>
        {MATURITY_LABEL[maturity]}
      </span>
      <span className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border",
        connector.auth === 'oauth2'
          ? "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800"
          : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      )}>
        {connector.auth === 'oauth2' ? 'OAuth 2.0' : connector.auth === 'api_key' ? 'API Key' : connector.auth.toUpperCase()}
      </span>
      {connector.webhooks && (
        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
          <Webhook size={10} className="text-teal-500" /> Webhooks
        </span>
      )}
    </div>
  );
}

export default function DesktopConnectorStore() {
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState<ConnectorWithStatus[]>(() =>
    CONNECTOR_CATALOG.map(c => ({ ...c, status: 'setup_required' as ConnectorStatus }))
  );
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Load real connection statuses from Supabase
  const loadConnectionStatuses = useCallback(async () => {
    try {
      setLoadingStatus(true);
      const { data: connections } = await supabase
        .from('connector_connections' as any)
        .select('connector_id, id, status, health, last_synced_at, display_name')
        .order('created_at', { ascending: false });

      setConnectors(prev => prev.map(c => {
        // Gmail can also be authenticated via direct token
        if (c.id === 'gmail' && isGoogleAuthenticated()) {
          return { ...c, status: 'connected' };
        }
        const match = (connections as any[])?.find((conn: any) => conn.connector_id === c.id);
        if (!match) return c;
        return {
          ...c,
          status: match.status === 'connected' ? 'connected'
            : match.status === 'connecting' ? 'connecting'
            : match.status === 'error' ? 'error'
            : 'setup_required',
          connectionId: match.id,
          lastSyncedAt: match.last_synced_at,
          health: match.health,
          displayName: match.display_name,
        };
      }));
    } catch (e) {
      // Not authenticated or table not found — show defaults
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => { loadConnectionStatuses(); }, [loadConnectionStatuses]);

  const handleConnect = async (conn: ConnectorWithStatus) => {
    setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'connecting' } : c));
    try {
      await startConnectorOAuth(conn.id);
      // Status will be updated via the OAuth callback redirect
    } catch (e: any) {
      setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'setup_required' } : c));
    }
  };

  const handleSyncNow = async (conn: ConnectorWithStatus) => {
    if (!conn.connectionId) {
      toast.warning('Connect the account first before syncing.');
      return;
    }
    setSyncing(conn.id);
    try {
      const results = await syncConnection(conn.connectionId);
      const total = (results ?? []).reduce((sum: number, r: any) => sum + (r.upserted ?? 0), 0);
      toast.success(`Synced ${conn.name}: ${total} records updated`);
      await loadConnectionStatuses();
    } catch (e: any) {
      toast.error(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (conn: ConnectorWithStatus) => {
    if (!conn.connectionId) {
      setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'setup_required' } : c));
      return;
    }
    try {
      await invokeConnectorHub('disconnect', { connection_id: conn.connectionId });
      setConnectors(prev => prev.map(c => c.id === conn.id
        ? { ...c, status: 'setup_required', connectionId: undefined, lastSyncedAt: undefined }
        : c
      ));
      toast.info(`Disconnected ${conn.name}`);
    } catch (e: any) {
      toast.error(`Disconnect failed: ${e.message}`);
    }
  };

  const filteredConnectors = connectors.filter(c => {
    const cat = getCategory(c);
    const matchesCategory = activeCategory === 'All' || cat === activeCategory;
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const connectedCount = connectors.filter(c => c.status === 'connected').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Integrations
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{connectedCount} connected</span>
                {' '}• {connectors.length} available
                {loadingStatus && <span className="ml-2 text-zinc-500 animate-pulse">Checking status…</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadConnectionStatuses}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              title="Refresh statuses"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => navigate('/desktop/inbox')}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <Mail size={16} />
              <span>📥 Open Universal Inbox</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search connectors or capabilities…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-10 pr-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer",
                activeCategory === cat
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Connector Cards */}
        <div className="space-y-3 pt-1">
          {filteredConnectors.map(conn => (
            <div
              key={conn.id}
              className={cn(
                "bg-white dark:bg-zinc-900/90 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3.5",
                conn.status === 'connected'
                  ? "border-emerald-200 dark:border-emerald-800/40"
                  : conn.status === 'error'
                  ? "border-red-200 dark:border-red-800/40"
                  : "border-slate-200/80 dark:border-white/10"
              )}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  {/* Brand Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm shrink-0"
                    style={{ backgroundColor: conn.brandColor }}
                  >
                    {conn.iconCode || conn.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{conn.name}</h3>
                      <BadgePill connector={conn} />
                      {conn.status === 'connected' && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle size={11} /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{conn.summary}</p>
                    {/* Capability chips */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {conn.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          title={PermissionManager.describe(cap as Capability)}
                          className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-white/5 font-mono cursor-help"
                        >
                          {PermissionManager.describe(cap as Capability)}
                        </span>
                      ))}
                      {conn.roadmap?.v2?.map((cap, i) => (
                        <span
                          key={`v2-${i}`}
                          className="text-[10px] bg-violet-50 dark:bg-violet-950/30 text-violet-500 dark:text-violet-400 px-2 py-0.5 rounded-md border border-violet-200/50 dark:border-violet-800/30 font-mono"
                        >
                          {cap} <span className="opacity-60">v2</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rate limit badge */}
                {conn.rateLimitPerMinute && (
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0 mt-1">
                    <Activity size={10} className="inline mr-0.5" />{conn.rateLimitPerMinute}/min
                  </span>
                )}
              </div>

              {/* Status Bar */}
              <div className={cn(
                "p-3 rounded-xl flex items-center justify-between text-xs border",
                conn.status === 'connected'
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/30"
                  : conn.status === 'error'
                  ? "bg-red-50 dark:bg-red-950/20 border-red-200/60 dark:border-red-800/30"
                  : conn.status === 'connecting'
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/30"
                  : "bg-slate-50 dark:bg-black/40 border-slate-200/60 dark:border-white/5"
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    conn.status === 'connected' ? "bg-emerald-500"
                      : conn.status === 'connecting' ? "bg-amber-400 animate-pulse"
                      : conn.status === 'error' ? "bg-red-500"
                      : "bg-slate-300 dark:bg-zinc-600"
                  )} />
                  <span className="text-slate-600 dark:text-zinc-300 font-medium">
                    {conn.status === 'connected'
                      ? conn.displayName ? `✓ ${conn.displayName}` : '✓ Connected & Active'
                      : conn.status === 'connecting' ? 'Connecting…'
                      : conn.status === 'error' ? 'Connection error — reconnect'
                      : `Connect to enable ${conn.capabilities[0] ?? 'sync'}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {conn.lastSyncedAt && (
                    <span className="text-[10px] font-mono text-zinc-400">
                      Synced {new Date(conn.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                    {conn.capabilities.length} capabilities
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-0.5">
                {conn.status !== 'connected' ? (
                  <button
                    onClick={() => handleConnect(conn)}
                    disabled={conn.status === 'connecting'}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {conn.status === 'connecting'
                      ? <><Loader2 size={13} className="animate-spin" /> Connecting…</>
                      : <><Zap size={13} /> Connect</>
                    }
                  </button>
                ) : null}

                {conn.status === 'connected' && (
                  <button
                    onClick={() => handleSyncNow(conn)}
                    disabled={syncing === conn.id}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-200 font-semibold rounded-xl text-xs transition-all cursor-pointer border border-slate-200 dark:border-white/10 flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {syncing === conn.id
                      ? <><Loader2 size={12} className="animate-spin" /> Syncing…</>
                      : <><RefreshCw size={12} /> Sync now</>
                    }
                  </button>
                )}

                <button
                  onClick={() => handleDisconnect(conn)}
                  className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                >
                  <Unplug size={13} />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ))}

          {filteredConnectors.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              <Sparkles size={32} className="mx-auto mb-3 text-violet-400" />
              <p className="font-semibold">No connectors match "{searchQuery}"</p>
              <p className="text-xs mt-1">Try searching by capability, e.g. "email" or "files"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

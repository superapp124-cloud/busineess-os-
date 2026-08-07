import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Search, Zap, RefreshCw, Unplug, CheckCircle, 
  Sparkles, Mail, Check, AlertTriangle, Loader2, ExternalLink,
  Webhook, Activity, ShieldCheck, Database, Layers, Radio, Globe,
  Cpu, Sliders, CheckCircle2
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
        "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border backdrop-blur-sm shadow-sm",
        mStyle.bg, mStyle.text, mStyle.border
      )}>
        {MATURITY_LABEL[maturity]}
      </span>
      <span className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border backdrop-blur-sm",
        connector.auth === 'oauth2'
          ? "bg-violet-950/60 text-violet-300 border-violet-800/60"
          : "bg-amber-950/60 text-amber-300 border-amber-800/60"
      )}>
        {connector.auth === 'oauth2' ? 'OAuth 2.0' : connector.auth === 'api_key' ? 'API Key' : connector.auth.toUpperCase()}
      </span>
      {connector.webhooks && (
        <span className="text-[10px] font-semibold text-teal-400 bg-teal-950/40 border border-teal-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Webhook size={10} className="text-teal-400" /> Webhooks
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
      // Defaults retained if table or auth uninitialized
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => { loadConnectionStatuses(); }, [loadConnectionStatuses]);

  const handleConnect = async (conn: ConnectorWithStatus) => {
    setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, status: 'connecting' } : c));
    try {
      await startConnectorOAuth(conn.id);
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
      toast.success(`Synced ${conn.name}: ${total} live records updated`);
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
  const totalCapabilitiesCount = connectors.reduce((acc, c) => acc + c.capabilities.length, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500 selection:text-white relative overflow-x-hidden p-4 md:p-6 space-y-4">
      
      {/* Ambient Radial Background Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Top Navigation & Title Bar (Compact) ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                CHATR Connector Hub
              </h1>
              <span className="text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                v2.4 Universal Runtime
              </span>
              {loadingStatus && (
                <span className="text-violet-400 animate-pulse text-xs font-mono flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> Syncing…
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Enterprise API Connectors & Real-Time Data Streams</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadConnectionStatuses}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Refresh statuses"
          >
            <RefreshCw size={14} className={cn(loadingStatus && "animate-spin text-violet-400")} />
          </button>
          <button
            onClick={() => navigate('/desktop/inbox')}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-violet-950/40 flex items-center gap-2 border border-white/10"
          >
            <Mail size={14} />
            <span>📥 Universal Inbox</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats Dashboard Bar (Compact Row) ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
        <div className="bg-gradient-to-b from-zinc-900/90 to-black/80 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-0.5">
            <span className="font-semibold">Connected Streams</span>
            <Radio size={13} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="text-lg font-extrabold text-white font-mono flex items-baseline gap-1">
            <span>{connectedCount}</span>
            <span className="text-xs text-zinc-500 font-sans font-normal">/ {connectors.length} active</span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-zinc-900/90 to-black/80 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-0.5">
            <span className="font-semibold">Platform Capabilities</span>
            <Cpu size={13} className="text-violet-400" />
          </div>
          <div className="text-lg font-extrabold text-white font-mono">
            {totalCapabilitiesCount}
          </div>
        </div>

        <div className="bg-gradient-to-b from-zinc-900/90 to-black/80 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-0.5">
            <span className="font-semibold">Token Security</span>
            <ShieldCheck size={13} className="text-teal-400" />
          </div>
          <div className="text-xs font-bold text-teal-300 mt-1 font-mono">
            Encrypted Vault
          </div>
        </div>

        <div className="bg-gradient-to-b from-zinc-900/90 to-black/80 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-0.5">
            <span className="font-semibold">Sync Engine</span>
            <Activity size={13} className="text-amber-400" />
          </div>
          <div className="text-xs font-bold text-amber-300 mt-1 font-mono">
            Webhooks & REST
          </div>
        </div>
      </div>

      {/* ── Search Input & Category Control Bar ────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/70 p-2.5 rounded-2xl border border-white/10 backdrop-blur-xl relative z-10">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by provider, capability, or protocol (e.g. Gmail, OAuth, email.read)…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 hover:text-white bg-white/10 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 max-w-full text-xs scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer text-xs border backdrop-blur-md shadow-sm",
                activeCategory === cat
                  ? "bg-violet-600 text-white border-violet-400/50 shadow-violet-900/40"
                  : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── High-Density 3-Column Luxury Cards Grid ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 relative z-10">
        {filteredConnectors.map(conn => (
          <div
            key={conn.id}
            className={cn(
              "group relative bg-gradient-to-b from-zinc-900/90 via-zinc-900/70 to-black/80 backdrop-blur-2xl border rounded-2xl p-4 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-violet-950/40 hover:-translate-y-1 flex flex-col justify-between overflow-hidden",
              conn.status === 'connected'
                ? "border-emerald-500/40 bg-emerald-950/10"
                : conn.status === 'error'
                ? "border-red-500/40 bg-red-950/10"
                : "border-white/10 hover:border-violet-500/50"
            )}
          >
            {/* Top brand color accent line */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ background: `linear-gradient(to right, ${conn.brandColor}, transparent)` }}
            />

            <div className="space-y-3">
              {/* Card Header: Icon, Name, Badges, Rate Limit */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shrink-0 border border-white/20 relative overflow-hidden group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: conn.brandColor }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-white/20" />
                    <span className="relative z-10">{conn.iconCode || conn.name.substring(0, 2).toUpperCase()}</span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base text-white group-hover:text-violet-300 transition-colors truncate">
                      {conn.name}
                    </h3>
                    {conn.rateLimitPerMinute && (
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Activity size={10} className="text-violet-400" />
                        <span>{conn.rateLimitPerMinute} req/min</span>
                      </span>
                    )}
                  </div>
                </div>

                {conn.status === 'connected' ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-inner">
                    <CheckCircle size={11} /> Connected
                  </span>
                ) : (
                  <BadgePill connector={conn} />
                )}
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{conn.summary}</p>

              {/* Capability Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Capabilities</span>
                <div className="flex items-center gap-1.5 flex-wrap max-h-20 overflow-hidden">
                  {conn.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      title={PermissionManager.describe(cap as Capability)}
                      className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 px-2 py-0.5 rounded-lg border border-white/10 font-mono transition-colors cursor-help flex items-center gap-1"
                    >
                      <Check size={9} className="text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{PermissionManager.describe(cap as Capability)}</span>
                    </span>
                  ))}

                  {conn.roadmap?.v2?.map((cap, i) => (
                    <span
                      key={`v2-${i}`}
                      className="text-[10px] bg-violet-950/40 text-violet-400 px-2 py-0.5 rounded-lg border border-violet-800/40 font-mono flex items-center gap-1 opacity-70"
                    >
                      <span className="truncate max-w-[100px]">{cap}</span>
                      <span className="text-[8px] font-bold bg-violet-500/30 text-violet-200 px-1 rounded">v2</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer: Status Bar & Actions */}
            <div className="pt-3 mt-3 border-t border-white/10 space-y-2.5">
              <div className={cn(
                "p-2.5 rounded-xl flex items-center justify-between text-[11px] border font-mono backdrop-blur-md",
                conn.status === 'connected'
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : conn.status === 'error'
                  ? "bg-red-950/40 border-red-500/30 text-red-300"
                  : conn.status === 'connecting'
                  ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
                  : "bg-black/50 border-white/5 text-zinc-500"
              )}>
                <div className="flex items-center gap-2 truncate">
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0 shadow-sm",
                    conn.status === 'connected' ? "bg-emerald-400 shadow-emerald-500/50 animate-pulse"
                      : conn.status === 'connecting' ? "bg-amber-400 animate-ping"
                      : conn.status === 'error' ? "bg-red-400"
                      : "bg-zinc-600"
                  )} />
                  <span className="truncate font-sans font-semibold">
                    {conn.status === 'connected'
                      ? conn.displayName ? conn.displayName : 'Active Stream'
                      : conn.status === 'connecting' ? 'Authorizing…'
                      : conn.status === 'error' ? 'Connection Error'
                      : 'Setup Required'}
                  </span>
                </div>

                {conn.lastSyncedAt && (
                  <span className="shrink-0 text-[10px] text-zinc-400">
                    {new Date(conn.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {conn.status !== 'connected' ? (
                  <button
                    onClick={() => handleConnect(conn)}
                    disabled={conn.status === 'connecting'}
                    className="w-full py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 disabled:opacity-60 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-violet-950/50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 border border-white/10"
                  >
                    {conn.status === 'connecting'
                      ? <><Loader2 size={13} className="animate-spin" /> Authorizing…</>
                      : <><Zap size={13} /> Connect Account</>
                    }
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSyncNow(conn)}
                      disabled={syncing === conn.id}
                      className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border border-white/15 flex items-center justify-center gap-1.5 disabled:opacity-60 hover:scale-[1.01] active:scale-98 shadow-sm"
                    >
                      {syncing === conn.id
                        ? <><Loader2 size={12} className="animate-spin text-teal-400" /> Syncing…</>
                        : <><RefreshCw size={12} className="text-teal-400" /> Sync Now</>
                      }
                    </button>
                    <button
                      onClick={() => handleDisconnect(conn)}
                      className="px-3 py-2 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 border border-transparent hover:border-red-500/30"
                      title="Disconnect connector"
                    >
                      <Unplug size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredConnectors.length === 0 && (
        <div className="text-center py-16 text-zinc-500 space-y-2 bg-zinc-900/40 border border-white/10 rounded-2xl relative z-10">
          <Sparkles size={32} className="mx-auto text-violet-400 opacity-60" />
          <p className="font-bold text-white text-sm">No connectors match "{searchQuery}"</p>
          <p className="text-xs text-zinc-400">Try searching by capability, e.g. "email" or "files"</p>
        </div>
      )}
    </div>
  );
}

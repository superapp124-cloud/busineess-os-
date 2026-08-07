import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Search, Zap, RefreshCw, Unplug, CheckCircle, 
  Sparkles, Mail, Check, AlertTriangle, Loader2, ExternalLink,
  Webhook, Activity, ShieldCheck, Database, Layers, Radio, Globe,
  Cpu, Sliders, ArrowUpRight
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
        "text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono border backdrop-blur-sm shadow-sm",
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500 selection:text-white relative overflow-x-hidden">
      
      {/* Ambient Radial Background Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-[450px] h-[450px] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* ── Main Container ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 relative z-10">

        {/* ── Top Header Navigation Bar ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                  CHATR Connector Hub
                </h1>
                <span className="text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-0.5 rounded-full shadow-inner">
                  v2.4 Universal Runtime
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                <span>Enterprise API Connectors & Real-Time Data Streams</span>
                {loadingStatus && (
                  <span className="text-violet-400 animate-pulse flex items-center gap-1 font-mono text-[11px]">
                    <Loader2 size={12} className="animate-spin" /> Verifying connections…
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadConnectionStatuses}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
              title="Refresh all statuses"
            >
              <RefreshCw size={16} className={cn(loadingStatus && "animate-spin text-violet-400")} />
            </button>
            <button
              onClick={() => navigate('/desktop/inbox')}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-extrabold rounded-2xl text-xs transition-all cursor-pointer shadow-xl shadow-violet-950/50 flex items-center gap-2 hover:scale-[1.02] active:scale-98 border border-white/10"
            >
              <Mail size={16} />
              <span>📥 Universal Inbox</span>
            </button>
          </div>
        </div>

        {/* ── KPI Stats Dashboard Bar ────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-b from-zinc-900/90 to-black/80 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span className="font-semibold">Connected Streams</span>
              <Radio size={14} className="text-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
              <span>{connectedCount}</span>
              <span className="text-xs text-zinc-500 font-sans font-normal">/ {connectors.length} active</span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-zinc-900/90 to-black/80 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span className="font-semibold">Platform Capabilities</span>
              <Cpu size={14} className="text-violet-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {totalCapabilitiesCount}
            </div>
          </div>

          <div className="bg-gradient-to-b from-zinc-900/90 to-black/80 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span className="font-semibold">Vault Token Security</span>
              <ShieldCheck size={14} className="text-teal-400" />
            </div>
            <div className="text-sm font-bold text-teal-300 mt-1 font-mono flex items-center gap-1">
              <span>Encrypted Vault</span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-zinc-900/90 to-black/80 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span className="font-semibold">Sync Architecture</span>
              <Activity size={14} className="text-amber-400" />
            </div>
            <div className="text-sm font-bold text-amber-300 mt-1 font-mono flex items-center gap-1">
              <span>Webhooks & REST</span>
            </div>
          </div>
        </div>

        {/* ── Search Input & Filter Bar ─────────────────────────────────── */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by provider name, capability, or protocol (e.g. Gmail, OAuth, email.read, REST)…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/15 focus:border-violet-500/80 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-2xl backdrop-blur-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-2xl font-bold shrink-0 transition-all cursor-pointer border backdrop-blur-md shadow-sm",
                  activeCategory === cat
                    ? "bg-violet-600 text-white border-violet-400/50 shadow-violet-900/40 shadow-lg"
                    : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Connector Cards Grid ───────────────────────────────────────── */}
        <div className="space-y-4 pt-2">
          {filteredConnectors.map(conn => (
            <div
              key={conn.id}
              className={cn(
                "group relative bg-zinc-900/70 backdrop-blur-xl border rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-violet-500/40 space-y-4 overflow-hidden",
                conn.status === 'connected'
                  ? "border-emerald-500/30 bg-emerald-950/10"
                  : conn.status === 'error'
                  ? "border-red-500/30 bg-red-950/10"
                  : "border-white/10"
              )}
            >
              {/* Card Header: Icon, Name, Badges, Rate Limit */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Brand Avatar Icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-lg shrink-0 border border-white/15 relative overflow-hidden group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: conn.brandColor }}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {conn.iconCode || conn.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-lg text-white group-hover:text-violet-300 transition-colors">
                        {conn.name}
                      </h3>
                      <BadgePill connector={conn} />
                      {conn.status === 'connected' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner">
                          <CheckCircle size={12} /> Connected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{conn.summary}</p>

                    {/* Capability Chips */}
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {conn.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          title={PermissionManager.describe(cap as Capability)}
                          className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 px-2.5 py-1 rounded-xl border border-white/10 font-mono transition-colors cursor-help flex items-center gap-1"
                        >
                          <Check size={10} className="text-emerald-400" />
                          <span>{PermissionManager.describe(cap as Capability)}</span>
                        </span>
                      ))}

                      {conn.roadmap?.v2?.map((cap, i) => (
                        <span
                          key={`v2-${i}`}
                          className="text-[10px] bg-violet-950/40 text-violet-400 px-2.5 py-1 rounded-xl border border-violet-800/40 font-mono flex items-center gap-1 opacity-80"
                        >
                          <span>{cap}</span>
                          <span className="text-[9px] font-bold bg-violet-500/20 text-violet-300 px-1 rounded">v2</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rate Limit Tag */}
                {conn.rateLimitPerMinute && (
                  <div className="text-[11px] font-mono text-zinc-500 shrink-0 bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Activity size={11} className="text-violet-400" />
                    <span>{conn.rateLimitPerMinute}/min</span>
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className={cn(
                "p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-xs border gap-2 backdrop-blur-md",
                conn.status === 'connected'
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                  : conn.status === 'error'
                  ? "bg-red-950/30 border-red-500/30 text-red-300"
                  : conn.status === 'connecting'
                  ? "bg-amber-950/30 border-amber-500/30 text-amber-300"
                  : "bg-black/40 border-white/5 text-zinc-400"
              )}>
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0 shadow-sm",
                    conn.status === 'connected' ? "bg-emerald-400 shadow-emerald-500/50 animate-pulse"
                      : conn.status === 'connecting' ? "bg-amber-400 animate-ping"
                      : conn.status === 'error' ? "bg-red-400"
                      : "bg-zinc-600"
                  )} />
                  <span className="font-semibold text-white">
                    {conn.status === 'connected'
                      ? conn.displayName ? `Connected: ${conn.displayName}` : '✓ Authorized & Active'
                      : conn.status === 'connecting' ? 'Initiating OAuth Authorization…'
                      : conn.status === 'error' ? 'Authentication error — reconnect account'
                      : `Connect account to enable ${PermissionManager.describe(conn.capabilities[0])}`}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                  {conn.lastSyncedAt && (
                    <span>
                      Synced {new Date(conn.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <span>{conn.capabilities.length} capabilities</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                {conn.status !== 'connected' ? (
                  <button
                    onClick={() => handleConnect(conn)}
                    disabled={conn.status === 'connecting'}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-extrabold rounded-2xl text-xs transition-all cursor-pointer shadow-lg shadow-violet-950/50 flex items-center gap-2 hover:scale-[1.02] active:scale-98 border border-white/10"
                  >
                    {conn.status === 'connecting'
                      ? <><Loader2 size={14} className="animate-spin" /> Authorizing…</>
                      : <><Zap size={14} /> Connect Account</>
                    }
                  </button>
                ) : null}

                {conn.status === 'connected' && (
                  <button
                    onClick={() => handleSyncNow(conn)}
                    disabled={syncing === conn.id}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl text-xs transition-all cursor-pointer border border-white/15 flex items-center gap-2 disabled:opacity-60 hover:scale-[1.02] active:scale-98 shadow-sm"
                  >
                    {syncing === conn.id
                      ? <><Loader2 size={13} className="animate-spin text-teal-400" /> Syncing Live Data…</>
                      : <><RefreshCw size={13} className="text-teal-400" /> Sync Now</>
                    }
                  </button>
                )}

                <button
                  onClick={() => handleDisconnect(conn)}
                  className="px-4 py-2.5 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 font-bold rounded-2xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ml-auto border border-transparent hover:border-red-500/30"
                >
                  <Unplug size={14} />
                  <span>Disconnect</span>
                </button>
              </div>

            </div>
          ))}

          {filteredConnectors.length === 0 && (
            <div className="text-center py-20 text-zinc-500 bg-zinc-900/40 border border-white/10 rounded-3xl space-y-3">
              <Sparkles size={36} className="mx-auto text-violet-400 opacity-60" />
              <p className="text-base font-bold text-white">No connectors match "{searchQuery}"</p>
              <p className="text-xs text-zinc-400">Try searching by provider name or capability (e.g., "Gmail", "email.read", "OAuth")</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

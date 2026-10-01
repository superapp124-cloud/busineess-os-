import React, { useState, useEffect } from 'react';
import {
  FileCode, ExternalLink, CheckCircle2, Globe, RefreshCw,
  ArrowUpRight, BarChart3, Zap, AlertCircle, TrendingUp, Search
} from 'lucide-react';
import { AcquisitionEngineService, GSCPropertyMetrics } from '@/services/acquisitionEngineService';

const DOMAIN = 'https://www.chatrchat.in';
const GSC_CONSOLE_URL = 'https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F';
const GSC_PERFORMANCE_URL = 'https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F';
const GSC_INDEX_URL = 'https://search.google.com/search-console/index?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F';

// Canonical sitemap assets (post-SEO-rebuild: ~250 priority commercial URLs)
const SITEMAP_ASSETS = [
  {
    name: 'sitemap_index.xml — Master Index',
    path: '/sitemap_index.xml',
    type: 'Sitemap Index',
    urlCount: 19,
    status: 'ACTIVE',
    description: 'Master index referencing 19 segmented sub-sitemaps. ~250 priority commercial URLs after SEO rebuild.',
  },
  {
    name: 'sitemap-core.xml — Authority Pages',
    path: '/sitemaps/sitemap-core.xml',
    type: 'XML Sitemap',
    urlCount: null,
    status: 'ACTIVE',
    description: 'Homepage, product pages, /whatsapp-team-inbox, /wati-alternative, /pricing, /about — highest-priority commercial URLs.',
  },
  {
    name: 'sitemap-india-metros.xml — Tier-1 Cities',
    path: '/sitemaps/sitemap-india-metros.xml',
    type: 'XML Sitemap',
    urlCount: null,
    status: 'ACTIVE',
    description: 'Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad. Pruned to commercial-intent metro pages only.',
  },
  {
    name: 'sitemap-global-hubs.xml — Global Hubs',
    path: '/sitemaps/sitemap-global-hubs.xml',
    type: 'XML Sitemap',
    urlCount: null,
    status: 'ACTIVE',
    description: 'Dubai, London, Riyadh, Singapore. High-intent international markets only.',
  },
  {
    name: 'sitemap-comparisons.xml — Competitor Pages',
    path: '/sitemaps/sitemap-comparisons.xml',
    type: 'XML Sitemap',
    urlCount: null,
    status: 'ACTIVE',
    description: '/wati-alternative and comparison pages. High commercial intent — direct conversion traffic.',
  },
  {
    name: 'robots.txt — Crawler Directives',
    path: '/robots.txt',
    type: 'Text File',
    urlCount: null,
    status: 'ACTIVE',
    description: 'Allows all major search & AI crawlers. Blocks /auth, /chat/, /settings, /admin. Points to sitemap_index.xml.',
  },
  {
    name: 'llms.txt — SI Discovery Index',
    path: '/llms.txt',
    type: 'LLM Index',
    urlCount: null,
    status: 'ACTIVE',
    description: 'Standardized LLM context file for Perplexity, ChatGPT, Gemini, Claude search agents.',
  },
];

function MetricCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-extrabold text-white mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export const SitemapsView: React.FC = () => {
  const [metrics, setMetrics] = useState<GSCPropertyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const svc = AcquisitionEngineService.getInstance();

  useEffect(() => {
    let mounted = true;
    svc.fetchLiveGSCProperties().then((m) => {
      if (mounted) {
        setMetrics(m);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const result = await svc.triggerGSCSync();
    setSyncing(false);
    if (result.success) {
      setSyncResult(`✅ Sync complete — ${result.rowsUpserted ?? 0} rows updated`);
      const refreshed = await svc.fetchLiveGSCProperties();
      setMetrics(refreshed);
    } else {
      setSyncResult(`❌ Sync failed: ${result.error ?? 'unknown error'}`);
    }
  };

  // Aggregate totals across all properties
  const totalClicks = metrics.reduce((s, m) => s + m.totalClicks, 0);
  const totalImpressions = metrics.reduce((s, m) => s + m.totalImpressions, 0);
  const totalOpportunities = metrics.reduce((s, m) => s + m.totalOpportunities, 0);
  const chatrMetrics = metrics.find((m) => m.domain === 'chatrchat.in');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Sitemaps & GSC Live Dashboard</h1>
          <p className="text-xs text-slate-400">
            Google Search Console integration for{' '}
            <span className="font-mono text-indigo-400">chatrchat.in</span>
            {' — '}~250 priority commercial URLs · {totalOpportunities} opportunities detected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync GSC Now'}
          </button>
          <a
            href={GSC_PERFORMANCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            GSC Performance
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={GSC_INDEX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            Index Status
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Sync result banner */}
      {syncResult && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
          syncResult.startsWith('✅')
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {syncResult}
        </div>
      )}

      {/* Live GSC Metrics — chatrchat.in */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live GSC — chatrchat.in (28-day window, 3-day stabilisation)
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Total Clicks"
              value={totalClicks.toLocaleString()}
              sub="across all properties"
              icon={TrendingUp}
              color="bg-indigo-500/15 text-indigo-400"
            />
            <MetricCard
              label="Impressions"
              value={totalImpressions.toLocaleString()}
              sub="28-day window"
              icon={BarChart3}
              color="bg-blue-500/15 text-blue-400"
            />
            <MetricCard
              label="Avg Position"
              value={chatrMetrics?.avgPosition ?? '—'}
              sub="chatrchat.in"
              icon={Search}
              color="bg-purple-500/15 text-purple-400"
            />
            <MetricCard
              label="Opportunities"
              value={totalOpportunities}
              sub="pages with rank potential"
              icon={Zap}
              color="bg-amber-500/15 text-amber-400"
            />
          </div>
        )}
      </div>

      {/* Per-Property GSC Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">GSC Property Status</h2>
          <a
            href={GSC_CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
          >
            Manage in Search Console <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3 pl-5">Domain</th>
                <th className="py-3">Role</th>
                <th className="py-3 text-right">Clicks</th>
                <th className="py-3 text-right">Impressions</th>
                <th className="py-3 text-right">Avg Pos</th>
                <th className="py-3 text-right">CTR%</th>
                <th className="py-3 text-right pr-5">Opportunities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading
                ? [0, 1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 pl-5"><div className="h-3 bg-slate-800 rounded w-32" /></td>
                      <td className="py-3"><div className="h-3 bg-slate-800 rounded w-48" /></td>
                      <td className="py-3 text-right"><div className="h-3 bg-slate-800 rounded w-10 ml-auto" /></td>
                      <td className="py-3 text-right"><div className="h-3 bg-slate-800 rounded w-14 ml-auto" /></td>
                      <td className="py-3 text-right"><div className="h-3 bg-slate-800 rounded w-8 ml-auto" /></td>
                      <td className="py-3 text-right"><div className="h-3 bg-slate-800 rounded w-10 ml-auto" /></td>
                      <td className="py-3 text-right pr-5"><div className="h-3 bg-slate-800 rounded w-8 ml-auto" /></td>
                    </tr>
                  ))
                : metrics.map((m) => (
                    <tr key={m.domain} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 pl-5 font-mono text-indigo-300 font-bold text-[11px]">{m.domain}</td>
                      <td className="py-3 text-slate-400 text-[11px]">{m.role}</td>
                      <td className="py-3 text-right font-bold text-white">{m.totalClicks.toLocaleString()}</td>
                      <td className="py-3 text-right text-slate-300">{m.totalImpressions.toLocaleString()}</td>
                      <td className="py-3 text-right text-slate-300">{m.avgPosition || '—'}</td>
                      <td className="py-3 text-right text-slate-300">{m.avgCTR ? `${m.avgCTR}%` : '—'}</td>
                      <td className="py-3 text-right pr-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.totalOpportunities > 0
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {m.totalOpportunities}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sitemap Assets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white">Sitemap & Crawler Discovery Assets</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Post SEO rebuild — programmatic city permutations removed, crawl budget concentrated on commercial pillars
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3 pl-5">Asset</th>
                <th className="py-3">Type</th>
                <th className="py-3 text-center">Status</th>
                <th className="py-3 text-right pr-5">Live Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SITEMAP_ASSETS.map((asset) => (
                <tr key={asset.path} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3 pl-5 space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      {asset.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{asset.description}</p>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">{asset.type}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3 pr-5 text-right">
                    <a
                      href={`${DOMAIN}${asset.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold transition-colors"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GSC Quick Action Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: 'Submit Sitemaps',
            desc: 'Add/re-submit sitemap_index.xml to Google Search Console',
            href: GSC_CONSOLE_URL,
            icon: Globe,
            color: 'border-indigo-500/30 hover:border-indigo-500/60',
          },
          {
            label: 'URL Inspection',
            desc: 'Inspect individual URLs for indexing status and issues',
            href: 'https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F',
            icon: Search,
            color: 'border-blue-500/30 hover:border-blue-500/60',
          },
          {
            label: 'Core Web Vitals',
            desc: 'Monitor LCP, FID, CLS scores across all pages',
            href: 'https://search.google.com/search-console/core-web-vitals?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F',
            icon: Zap,
            color: 'border-amber-500/30 hover:border-amber-500/60',
          },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-start gap-3 p-4 rounded-xl bg-slate-900 border transition-colors ${action.color}`}
          >
            <action.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                {action.label} <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{action.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SitemapsView;

import React from 'react';
import { 
  FileCode, ExternalLink, CheckCircle2, Globe, ShieldCheck, 
  Layers, ArrowUpRight, Clock, RefreshCw, Bot, FileText 
} from 'lucide-react';

const DOMAIN = 'https://www.chatrchat.in';
const GSC_SITEMAPS_URL = 'https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F';

export const SitemapsView: React.FC = () => {
  const crawlerAssets = [
    {
      name: 'sitemap.xml (Unified Production Sitemap)',
      path: '/sitemap.xml',
      url: `${DOMAIN}/sitemap.xml`,
      type: 'XML Sitemap',
      size: '3.38 MB',
      urlCount: 19341,
      status: 'VERIFIED SUCCESS',
      gscStatus: 'Read Aug 26, 2026',
      description: 'Single unified sitemap containing all 19,341 pre-rendered static canonical URLs.'
    },
    {
      name: 'robots.txt (Crawler Directive Engine)',
      path: '/robots.txt',
      url: `${DOMAIN}/robots.txt`,
      type: 'Text File',
      size: '4.95 KB',
      urlCount: null,
      status: 'ACTIVE',
      gscStatus: 'Valid',
      description: 'Defines Googlebot / Bingbot / AI crawler access rules and points directly to sitemap.xml.'
    },
    {
      name: 'llms.txt (AI Search & LLM Discovery Index)',
      path: '/llms.txt',
      url: `${DOMAIN}/llms.txt`,
      type: 'LLM Index',
      size: '7.23 KB',
      urlCount: null,
      status: 'ACTIVE',
      gscStatus: 'Indexed',
      description: 'Standardized LLM context file for Perplexity, ChatGPT, Gemini, and Claude search agents.'
    },
    {
      name: 'llms-full.txt (Full AI Knowledge Graph)',
      path: '/llms-full.txt',
      url: `${DOMAIN}/llms-full.txt`,
      type: 'LLM Full Graph',
      size: '6.18 KB',
      urlCount: null,
      status: 'ACTIVE',
      gscStatus: 'Indexed',
      description: 'Deep knowledge graph summary of CHATR capabilities, features, and enterprise architecture.'
    },
    {
      name: 'seo-cohort-manifest.json (SSG Invariant Manifest)',
      path: '/seo-cohort-manifest.json',
      url: `${DOMAIN}/seo-cohort-manifest.json`,
      type: 'JSON Manifest',
      size: '14.24 MB',
      urlCount: 19444,
      status: 'GENERATED',
      gscStatus: 'Build Asset',
      description: 'Complete build-time taxonomy mapping of all 11 cohorts and 1,760 cities.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Sitemaps & Discovery Assets</h1>
          <p className="text-xs text-slate-400">
            Authoritative search engine and AI crawler discovery endpoints on <span className="font-mono text-indigo-400">{DOMAIN}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={GSC_SITEMAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>Manage in Search Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sitemaps & Crawler Files Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3.5 pl-4">Asset Name & Endpoint</th>
                <th className="py-3.5">Asset Type</th>
                <th className="py-3.5 text-right">File Size</th>
                <th className="py-3.5 text-right">Discovered URLs</th>
                <th className="py-3.5 text-center">GSC Status</th>
                <th className="py-3.5 pr-4 text-right">Live Direct Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {crawlerAssets.map((asset, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 pl-4 space-y-0.5">
                    <p className="font-bold text-white font-sans flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{asset.name}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-sans">{asset.description}</p>
                  </td>
                  <td className="py-3.5 text-slate-300 font-sans">{asset.type}</td>
                  <td className="py-3.5 text-right text-slate-400">{asset.size}</td>
                  <td className="py-3.5 text-right font-bold text-indigo-300">
                    {asset.urlCount ? asset.urlCount.toLocaleString() : '—'}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold transition-colors"
                    >
                      <span>Open File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SitemapsView;

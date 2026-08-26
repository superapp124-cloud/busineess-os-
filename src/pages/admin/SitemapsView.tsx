import React from 'react';
import { 
  FileCode, ExternalLink, CheckCircle2, Globe, ShieldCheck, 
  Layers, ArrowUpRight, Clock, RefreshCw 
} from 'lucide-react';

const DOMAIN = 'https://www.chatrchat.in';
const GSC_SITEMAPS_URL = 'https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F';

export const SitemapsView: React.FC = () => {
  const sitemaps = [
    {
      name: 'sitemap.xml (Root Sitemap Index)',
      path: '/sitemap.xml',
      url: `${DOMAIN}/sitemap.xml`,
      type: 'Index File',
      urlCount: 19444,
      status: 'SUCCESS',
      lastSubmitted: 'Auto-Discovered',
      lastRead: 'Recent'
    },
    {
      name: 'sitemap-core.xml (Authority Core Pages)',
      path: '/sitemap-core.xml',
      url: `${DOMAIN}/sitemap-core.xml`,
      type: 'Core Shard',
      urlCount: 84,
      status: 'SUCCESS',
      lastSubmitted: 'Auto-Discovered',
      lastRead: 'Recent'
    },
    {
      name: 'sitemap-locations-1.xml (Global City Hubs)',
      path: '/sitemap-locations-1.xml',
      url: `${DOMAIN}/sitemap-locations-1.xml`,
      type: 'City Hub Shard',
      urlCount: 1760,
      status: 'SUCCESS',
      lastSubmitted: 'Auto-Discovered',
      lastRead: 'Recent'
    },
    {
      name: 'sitemap-locations-2.xml (Recruitment & Staffing)',
      path: '/sitemap-locations-2.xml',
      url: `${DOMAIN}/sitemap-locations-2.xml`,
      type: 'Pillar Shard',
      urlCount: 1760,
      status: 'SUCCESS',
      lastSubmitted: 'Auto-Discovered',
      lastRead: 'Recent'
    },
    {
      name: 'sitemap-locations-3.xml (WhatsApp Business API)',
      path: '/sitemap-locations-3.xml',
      url: `${DOMAIN}/sitemap-locations-3.xml`,
      type: 'Pillar Shard',
      urlCount: 1760,
      status: 'SUCCESS',
      lastSubmitted: 'Auto-Discovered',
      lastRead: 'Recent'
    },
    {
      name: 'sitemap-locations-4.xml (Hiring Automation)',
      path: '/sitemap-locations-4.xml',
      url: `${DOMAIN}/sitemap-locations-4.xml`,
      type: 'Pillar Shard',
      urlCount: 1760,
      status: 'SUCCESS',
      lastSubmitted: 'Auto-Discovered',
      lastRead: 'Recent'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">XML Sitemaps & Shard Status</h1>
          <p className="text-xs text-slate-400">
            Monitor sitemap shard distribution and Google Search Console submission status
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

      {/* Sitemaps List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3.5 pl-4">Sitemap File</th>
                <th className="py-3.5">Type</th>
                <th className="py-3.5 text-right">Indexed URLs</th>
                <th className="py-3.5 text-center">GSC Status</th>
                <th className="py-3.5 pr-4 text-right">Live Shard Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sitemaps.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 pl-4 space-y-0.5">
                    <p className="font-bold text-white font-sans flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{s.name}</span>
                    </p>
                    <span className="text-[11px] text-slate-400">{s.path}</span>
                  </td>
                  <td className="py-3.5 text-slate-300 font-sans">{s.type}</td>
                  <td className="py-3.5 text-right font-bold text-indigo-300">
                    {s.urlCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold transition-colors"
                    >
                      <span>View XML</span>
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

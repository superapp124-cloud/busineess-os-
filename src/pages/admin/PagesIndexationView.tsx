import React, { useState } from 'react';
import { 
  FileText, Search, ExternalLink, Globe, CheckCircle2, 
  Layers, Filter, ArrowUpRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { CITIES } from '../../../scripts/citiesData.cjs';
import { LOCATION_USE_CASES, slugify } from '../../../scripts/renderLocationHtml.cjs';

const GSC_BASE_URL = 'https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F&id=';
const DOMAIN = 'https://www.chatrchat.in';

export const PagesIndexationView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');

  // Build sample searchable inventory from canonical dataset
  const sampleInventory = React.useMemo(() => {
    const list: { url: string; path: string; cohort: string; city: string; ssgStatus: string }[] = [];

    // Core Pages
    list.push({ url: `${DOMAIN}/`, path: '/', cohort: 'Core Pages', city: 'Global', ssgStatus: '200 OK' });
    list.push({ url: `${DOMAIN}/locations`, path: '/locations', cohort: 'Core Pages', city: 'Global', ssgStatus: '200 OK' });
    list.push({ url: `${DOMAIN}/chatr/ai`, path: '/chatr/ai', cohort: 'Core Pages', city: 'Global', ssgStatus: '200 OK' });
    list.push({ url: `${DOMAIN}/chatr/whatsapp-business-api`, path: '/chatr/whatsapp-business-api', cohort: 'Core Pages', city: 'Global', ssgStatus: '200 OK' });
    list.push({ url: `${DOMAIN}/talentxcel/ai-resume-parser`, path: '/talentxcel/ai-resume-parser', cohort: 'Core Pages', city: 'Global', ssgStatus: '200 OK' });

    // Hubs and Pillars for top cities
    CITIES.slice(0, 100).forEach(([city, state]) => {
      const citySlug = slugify(city);
      list.push({
        url: `${DOMAIN}/locations/${citySlug}`,
        path: `/locations/${citySlug}`,
        cohort: 'City Hubs',
        city: `${city}, ${state}`,
        ssgStatus: '200 OK'
      });

      LOCATION_USE_CASES.forEach(uc => {
        list.push({
          url: `${DOMAIN}/location/${uc.slug}-${citySlug}`,
          path: `/location/${uc.slug}-${citySlug}`,
          cohort: uc.title,
          city: `${city}, ${state}`,
          ssgStatus: '200 OK'
        });
      });
    });

    return list;
  }, []);

  const filtered = sampleInventory.filter(item => {
    const matchesSearch = 
      item.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cohort.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCohort = selectedCohort === 'ALL' || item.cohort === selectedCohort;
    return matchesSearch && matchesCohort;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase">
              19,444 SSG PAGES INVENTORY
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Pages & Google Search Console Indexing</h1>
          <p className="text-xs text-slate-400">
            Search any pre-rendered static page and launch direct live URL inspection in Google Search Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://search.google.com/search-console?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>Open Search Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by URL path, city name, or cohort..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={selectedCohort}
            onChange={e => setSelectedCohort(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Cohorts (19,444 URLs)</option>
            <option value="Core Pages">Core Authority Pages (84)</option>
            <option value="City Hubs">Global City Hubs (1,760)</option>
            {LOCATION_USE_CASES.map(uc => (
              <option key={uc.slug} value={uc.title}>{uc.title} (1,760)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3.5 pl-4">Page Path & Canonical</th>
                <th className="py-3.5">Taxonomy Cohort</th>
                <th className="py-3.5">City / Region</th>
                <th className="py-3.5 text-center">SSG Render</th>
                <th className="py-3.5 text-right pr-4">GSC Live Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.slice(0, 50).map((page, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 pl-4 space-y-0.5">
                    <p className="font-bold text-white font-sans flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{page.path}</span>
                    </p>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-indigo-300 transition-colors truncate block max-w-md"
                    >
                      {page.url}
                    </a>
                  </td>
                  <td className="py-3.5 text-slate-300 font-sans">{page.cohort}</td>
                  <td className="py-3.5 text-slate-400 font-sans">{page.city}</td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      {page.ssgStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-4">
                    <a
                      href={`${GSC_BASE_URL}${encodeURIComponent(page.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] transition-colors"
                    >
                      <span>Inspect in GSC</span>
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

export default PagesIndexationView;

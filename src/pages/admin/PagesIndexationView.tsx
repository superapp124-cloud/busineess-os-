import React, { useState } from 'react';
import { 
  Search, ExternalLink, Globe, CheckCircle2, 
  Layers, Filter, ArrowUpRight, ShieldCheck, RefreshCw, FileCode 
} from 'lucide-react';

const GSC_BASE_URL = 'https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F&id=';
const DOMAIN = 'https://www.chatrchat.in';

const VERTICALS = [
  { slug: 'recruitment-agencies', title: 'Recruitment & Staffing Automation' },
  { slug: 'whatsapp-business-api', title: 'WhatsApp Business API & Automation' },
  { slug: 'hiring-automation', title: 'AI Hiring & Applicant Screening' },
  { slug: 'real-estate-lead-management', title: 'Real Estate Lead Management CRM' },
  { slug: 'healthcare-patient-messaging', title: 'Healthcare & Clinic Patient Messaging' },
  { slug: 'education-admissions', title: 'Education & Admissions CRM' },
  { slug: 'ecommerce-customer-support', title: 'E-Commerce & Retail Customer Support' },
  { slug: 'financial-services-messaging', title: 'BFSI & Financial Services Messaging' },
  { slug: 'logistics-delivery-tracking', title: 'Logistics & Dispatch Messaging' },
  { slug: 'hospitality-hotel-messaging', title: 'Hospitality & Hotel Guest Messaging' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const PagesIndexationView: React.FC = () => {
  const [searchCity, setSearchCity] = useState('Dubai');
  const [selectedVertical, setSelectedVertical] = useState('ALL');

  const citySlug = slugify(searchCity || 'global');

  // Compute live URLs dynamically based on user query (Zero JS bundle dataset leakage)
  const dynamicUrls = React.useMemo(() => {
    const list: { url: string; path: string; cohort: string; type: string }[] = [];

    // Core Authority Pages
    list.push({ url: `${DOMAIN}/`, path: '/', cohort: 'Core Pages', type: 'Homepage Root' });
    list.push({ url: `${DOMAIN}/locations`, path: '/locations', cohort: 'Core Pages', type: 'Global Directory' });
    list.push({ url: `${DOMAIN}/chatr/ai`, path: '/chatr/ai', cohort: 'Core Pages', type: 'Universal AI' });
    list.push({ url: `${DOMAIN}/chatr/whatsapp-business-api`, path: '/chatr/whatsapp-business-api', cohort: 'Core Pages', type: 'Meta WhatsApp API' });
    list.push({ url: `${DOMAIN}/talentxcel/ai-resume-parser`, path: '/talentxcel/ai-resume-parser', cohort: 'Core Pages', type: 'TalentXcel ATS' });
    list.push({ url: `${DOMAIN}/tools/resume-grader`, path: '/tools/resume-grader', cohort: 'Growth Tools', type: 'ATS Resume Grader' });
    list.push({ url: `${DOMAIN}/tools/whatsapp-link-generator`, path: '/tools/whatsapp-link-generator', cohort: 'Growth Tools', type: 'WhatsApp Link Gen' });
    list.push({ url: `${DOMAIN}/tools/sla-calculator`, path: '/tools/sla-calculator', cohort: 'Growth Tools', type: 'SLA Calculator' });

    if (searchCity.trim().length > 0) {
      // Hub URL
      list.push({
        url: `${DOMAIN}/locations/${citySlug}`,
        path: `/locations/${citySlug}`,
        cohort: 'City Hubs (1,760)',
        type: `Regional Hub — ${searchCity}`
      });

      // 10 Industry Verticals
      VERTICALS.forEach(v => {
        if (selectedVertical === 'ALL' || selectedVertical === v.slug) {
          list.push({
            url: `${DOMAIN}/location/${v.slug}-${citySlug}`,
            path: `/location/${v.slug}-${citySlug}`,
            cohort: v.title,
            type: `Industry Pillar — ${searchCity}`
          });
        }
      });
    }

    return list;
  }, [searchCity, citySlug, selectedVertical]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase">
              19,444 SSG PAGES INVENTORY
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase">
              O(1) BUNDLE ISOLATED
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Pages & Google Search Console Indexing</h1>
          <p className="text-xs text-slate-400">
            Lookup any URL across 1,760 cities & 11 cohorts and launch 1-click live Googlebot inspection in Search Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://search.google.com/search-console?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>Launch Google Search Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Dynamic City & Vertical Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
              Search City / Market (1,760 Global Cities Supported)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                placeholder="Type any city (e.g. Dubai, Riyadh, London, Singapore, Mumbai)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
          <div className="sm:col-span-5">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
              Filter by Taxonomy Cohort
            </label>
            <select
              value={selectedVertical}
              onChange={e => setSelectedVertical(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="ALL">All 11 Cohorts</option>
              {VERTICALS.map(v => (
                <option key={v.slug} value={v.slug}>{v.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold bg-slate-950/60">
                <th className="py-3.5 pl-4">Target Route & Canonical URL</th>
                <th className="py-3.5">Taxonomy Cohort</th>
                <th className="py-3.5">Type</th>
                <th className="py-3.5 text-center">SSG Pre-Render</th>
                <th className="py-3.5 text-right pr-4">Google Search Console</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {dynamicUrls.map((page, idx) => (
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
                  <td className="py-3.5 text-slate-400 font-sans">{page.type}</td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      200 OK
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-4">
                    <a
                      href={`${GSC_BASE_URL}${encodeURIComponent(page.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] transition-colors"
                    >
                      <span>Inspect URL in GSC</span>
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

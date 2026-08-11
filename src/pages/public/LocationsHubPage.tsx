import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, ArrowRight, Globe2, ShieldCheck, ChevronRight } from 'lucide-react';
import { TOP_CITIES, LOCATION_USE_CASES } from '../../data/locationExpansionData';

export const LocationsHubPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Global Locations Directory — CHATR Communication OS & TalentXcel';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Explore CHATR OS and TalentXcel availability across 1,750+ cities globally. WhatsApp Business API multi-agent team inboxes, automated recruitment screening, and response SLA tracking.'
    );

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://www.chatrchat.in/locations');

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chatrchat.in' },
        { '@type': 'ListItem', position: 2, name: 'Global Locations Directory', item: 'https://www.chatrchat.in/locations' },
      ],
    };

    const scriptBc = document.createElement('script');
    scriptBc.id = 'locations-hub-breadcrumb-schema';
    scriptBc.type = 'application/ld+json';
    scriptBc.textContent = JSON.stringify(breadcrumbSchema);
    if (!document.getElementById('locations-hub-breadcrumb-schema')) {
      document.head.appendChild(scriptBc);
    }

    return () => {
      const el = document.getElementById('locations-hub-breadcrumb-schema');
      if (el) el.remove();
    };
  }, []);

  // Group top 120 key cities by region for internal link graph discovery
  const regions: { name: string; cities: { city: string; state: string; region: string }[] }[] = [
    {
      name: 'India & South Asia',
      cities: TOP_CITIES.filter((c) =>
        ['Maharashtra', 'Karnataka', 'Delhi', 'Uttar Pradesh', 'Tamil Nadu', 'Telangana', 'Gujarat', 'West Bengal', 'Rajasthan', 'Kerala', 'Madhya Pradesh', 'Punjab', 'Bihar', 'Assam'].some((st) => c.state.includes(st))
      ).slice(0, 36),
    },
    {
      name: 'Middle East & GCC',
      cities: TOP_CITIES.filter((c) => ['UAE', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'Jordan', 'Egypt', 'Turkey', 'Iraq'].some((st) => c.state.includes(st))).slice(0, 24),
    },
    {
      name: 'Southeast & East Asia',
      cities: TOP_CITIES.filter((c) => ['Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Philippines', 'Vietnam', 'Japan', 'South Korea', 'China', 'Taiwan'].some((st) => c.state.includes(st))).slice(0, 24),
    },
    {
      name: 'Europe & UK',
      cities: TOP_CITIES.filter((c) => ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Poland'].some((st) => c.state.includes(st))).slice(0, 24),
    },
    {
      name: 'North America & ANZ',
      cities: TOP_CITIES.filter((c) => ['USA', 'Canada', 'Australia', 'New Zealand'].some((st) => c.state.includes(st))).slice(0, 20),
    },
    {
      name: 'Africa & Latin America',
      cities: TOP_CITIES.filter((c) => ['Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Brazil', 'Mexico', 'Colombia', 'Argentina', 'Chile'].some((st) => c.state.includes(st))).slice(0, 20),
    },
  ];

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ Global Locations</span>
          </Link>
          <Link to="/auth" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/60 text-indigo-400">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>1,758 Global Cities • 10 Industry Verticals</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Global Locations & Regional Solution Directory
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Deploy CHATR Business OS and TalentXcel across 1,758 cities worldwide. Access local WhatsApp Business API inboxes, candidate screening workflows, and real-time response SLA tracking.
          </p>
        </div>

        {/* 10 Industry Verticals Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Available Industry Solutions Per City</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LOCATION_USE_CASES.map((uc) => (
              <div key={uc.slug} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{uc.title}</span>
                <span className="text-indigo-400 font-mono text-[11px] shrink-0 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                  {uc.slug}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional City Links Grid — Primary Internal Discovery Graph for Googlebot */}
        <div className="space-y-10">
          {regions.map((reg) => (
            <section key={reg.name} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{reg.name} Hubs</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">{reg.cities.length} Regional Hubs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {reg.cities.map((c) => {
                  const citySlug = slugify(c.city);
                  return (
                    <Link
                      key={c.city}
                      to={`/locations/${citySlug}`}
                      className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 text-left transition-all group"
                    >
                      <div className="font-bold text-xs text-slate-200 group-hover:text-indigo-300 truncate">
                        {c.city}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{c.state}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold pt-1 flex items-center gap-0.5">
                        <span>View City Hub</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Direct Link Sample Pillar Matrix */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Direct Link Discovery Paths (Sample Pillar Pages)</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">100% Pre-rendered HTML</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              ['/location/whatsapp-business-api-mumbai', 'WhatsApp API in Mumbai'],
              ['/location/recruitment-agencies-mumbai', 'Recruitment in Mumbai'],
              ['/location/whatsapp-business-api-dubai', 'WhatsApp API in Dubai'],
              ['/location/recruitment-agencies-dubai', 'Recruitment in Dubai'],
              ['/location/hiring-automation-delhi-ncr', 'Hiring Automation in Delhi NCR'],
              ['/location/real-estate-lead-management-bangalore', 'Real Estate in Bangalore'],
              ['/location/whatsapp-business-api-london', 'WhatsApp API in London'],
              ['/location/whatsapp-business-api-new-york', 'WhatsApp API in New York'],
              ['/location/whatsapp-business-api-singapore', 'WhatsApp API in Singapore'],
              ['/location/whatsapp-business-api-riyadh', 'WhatsApp API in Riyadh'],
              ['/location/whatsapp-business-api-lagos', 'WhatsApp API in Lagos'],
              ['/location/whatsapp-business-api-s-o-paulo', 'WhatsApp API in São Paulo'],
            ].map(([linkPath, label]) => (
              <Link
                key={linkPath}
                to={linkPath}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-indigo-300 hover:text-indigo-200 transition-colors flex items-center justify-between font-medium"
              >
                <span>{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LocationsHubPage;

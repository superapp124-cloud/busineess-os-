import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Building2, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Tag } from 'lucide-react';
import { TOP_CITIES, LOCATION_USE_CASES } from '../../data/locationExpansionData';

export const CityHubPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const cityEntry = TOP_CITIES.find((c) => slugify(c.city) === citySlug) || {
    city: citySlug ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1).replace(/-/g, ' ') : 'City',
    state: 'Global Commerce Region',
    region: 'Enterprise Business Hub',
  };

  const cityName = cityEntry.city;
  const currentSlug = citySlug || slugify(cityName);

  useEffect(() => {
    document.title = `${cityName} Solutions Hub — WhatsApp API & Recruitment | CHATR & TalentXcel`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      `Deploy CHATR OS and TalentXcel in ${cityName}, ${cityEntry.state}. Access 10 specialized industry solutions including WhatsApp Business API, candidate screening, real estate lead management, and healthcare patient messaging.`
    );

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://www.chatrchat.in/locations/${currentSlug}`);

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chatrchat.in' },
        { '@type': 'ListItem', position: 2, name: 'Global Locations Directory', item: 'https://www.chatrchat.in/locations' },
        { '@type': 'ListItem', position: 3, name: `${cityName} Hub`, item: `https://www.chatrchat.in/locations/${currentSlug}` },
      ],
    };

    const scriptBc = document.createElement('script');
    scriptBc.id = 'city-hub-breadcrumb-schema';
    scriptBc.type = 'application/ld+json';
    scriptBc.textContent = JSON.stringify(breadcrumbSchema);
    if (!document.getElementById('city-hub-breadcrumb-schema')) {
      document.head.appendChild(scriptBc);
    }

    return () => {
      const el = document.getElementById('city-hub-breadcrumb-schema');
      if (el) el.remove();
    };
  }, [cityName, cityEntry, currentSlug]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/locations" className="flex items-center gap-2 font-bold text-sm text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Locations Directory</span>
            <span className="text-slate-500 font-normal">/ {cityName} Hub</span>
          </Link>
          <Link to="/auth" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* City Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{cityName} City Hub • {cityEntry.state}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            CHATR Business OS & TalentXcel Solutions in {cityName}
          </h1>

          {/* City Executive Summary */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>{cityName} Regional Overview</span>
            </div>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Businesses and recruitment agencies in {cityName} ({cityEntry.region}) leverage CHATR Communication OS to unify WhatsApp Business API channels, automate candidate screening, and eliminate lead drop-off across 10 specialized industry verticals.
            </p>
          </div>
        </div>

        {/* 10 Industry Pillar Links for this Specific City — The Core Links for Googlebot Crawling */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-400" />
              <span>Available Industry Pillar Pages for {cityName}</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              10 Verticals Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOCATION_USE_CASES.map((uc) => {
              const pillarPath = `/location/${uc.slug}-${currentSlug}`;
              return (
                <Link
                  key={uc.slug}
                  to={pillarPath}
                  className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 space-y-2 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {uc.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automate {uc.focus} in {cityName} with CHATR Communication OS.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>View {cityName} Pillar Page →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Grounded Regional Advantages */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Why Companies in {cityName} Deploy CHATR OS</span>
          </h2>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Shared WhatsApp API Inbox:</strong> Multiple team members in {cityName} respond to customers simultaneously from one official number.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>TalentXcel Resume Parsing:</strong> Extract skills and experience from Indian candidate CVs in 1.2 seconds.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Sub-60 Second Response SLA:</strong> Automated round-robin routing ensures zero unassigned messages in {cityName}.</span>
            </li>
          </ul>
        </section>

        {/* Back Link to Global Locations Hub */}
        <div className="pt-4 text-center">
          <Link to="/locations" className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:underline font-semibold">
            ← Explore All 1,758 Cities in Global Directory
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CityHubPage;

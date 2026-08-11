import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Tag, FileText, ArrowRight, Database, ShieldCheck, ExternalLink, HelpCircle, ChevronDown, Building2 } from 'lucide-react';
import { LOCATION_EXPANSION_PAGES } from '../../data/locationExpansionData';
import { AUTHORS } from '../../data/authorsData';
import { getEvidenceNodesForRoute } from '../../services/evidenceGraphEngine';

export const LocationPillarPage: React.FC = () => {
  const location = useLocation();
  const pageConfig = LOCATION_EXPANSION_PAGES.find(p => p.path === location.pathname);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const evidenceNodes = pageConfig ? getEvidenceNodesForRoute(pageConfig.path, 'location') : [];

  useEffect(() => {
    if (!pageConfig) return;
    document.title = pageConfig.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', pageConfig.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', `https://chatrchat.in${pageConfig.path}`);

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: pageConfig.h1,
      description: pageConfig.description,
      author: {
        '@type': 'Person',
        name: 'Sanobar Jahan',
        jobTitle: 'Founder, TalentXcel & CHATR',
        url: 'https://chatrchat.in/authors/sanobar-jahan'
      },
      publisher: {
        '@type': 'Organization',
        name: 'CHATR Communication OS',
        url: 'https://chatrchat.in'
      },
      datePublished: '2026-08-11',
      dateModified: '2026-08-11'
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pageConfig.faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chatrchat.in' },
        { '@type': 'ListItem', position: 2, name: 'Location Directory', item: 'https://chatrchat.in#locations' },
        { '@type': 'ListItem', position: 3, name: pageConfig.h1, item: `https://chatrchat.in${pageConfig.path}` }
      ]
    };

    const scriptArt = document.createElement('script');
    scriptArt.id = 'location-article-schema';
    scriptArt.type = 'application/ld+json';
    scriptArt.textContent = JSON.stringify(articleSchema);
    if (!document.getElementById('location-article-schema')) document.head.appendChild(scriptArt);

    const scriptFaq = document.createElement('script');
    scriptFaq.id = 'location-faq-schema';
    scriptFaq.type = 'application/ld+json';
    scriptFaq.textContent = JSON.stringify(faqSchema);
    if (!document.getElementById('location-faq-schema')) document.head.appendChild(scriptFaq);

    const scriptBc = document.createElement('script');
    scriptBc.id = 'location-breadcrumb-schema';
    scriptBc.type = 'application/ld+json';
    scriptBc.textContent = JSON.stringify(breadcrumbSchema);
    if (!document.getElementById('location-breadcrumb-schema')) document.head.appendChild(scriptBc);

    return () => {
      ['location-article-schema', 'location-faq-schema', 'location-breadcrumb-schema'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [pageConfig]);

  if (!pageConfig) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Location landing page not found.</p>
          <Link to="/" className="text-indigo-400 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ Location Solutions</span>
          </Link>
          <Link to="/auth" id="location-header-cta" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-12">
        {/* Header & Meta */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{pageConfig.city} Regional Hub • {pageConfig.stateRegion}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{pageConfig.h1}</h1>

          {/* Direct Answer Executive Summary Block */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Regional Business Summary</span>
            </div>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              {pageConfig.executiveSummary}
            </p>
          </div>
        </div>

        {/* Local Enterprise Features Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Why {pageConfig.city} Businesses Choose CHATR OS</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Fast-growing organizations in {pageConfig.city} rely on CHATR Communication OS and TalentXcel to centralize inbound customer WhatsApp messages, screen job applicants automatically, and enforce strict SLA response times.
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-white text-base">Key Regional Advantages for {pageConfig.city}</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Multi-Agent Team Inbox:</strong> Single official WhatsApp Business API number shared across all team members in {pageConfig.city}.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Automated Resume Parsing:</strong> Parse Indian candidate CV formats in English and regional layouts in 1.2 seconds.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>5-Minute Response SLA:</strong> Automated auto-escalation timers notify managers if a lead stays unassigned.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Grounded Evidence Graph Trail */}
        {evidenceNodes.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Database className="w-4 h-4 text-indigo-400" /> Grounded Telemetry Benchmark
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Verified Regional Observation
              </span>
            </div>

            <div className="space-y-3">
              {evidenceNodes.slice(0, 2).map((ev, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-400 font-bold">Finding ID: {ev.findingId}</span>
                    <span>{ev.sampleSize}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">"{ev.claimText}"</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Type: <strong className="text-white">{ev.claimType}</strong>
                    </span>
                    <Link to={ev.reportPath} className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                      View Report Methodology <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Methodology & Data Evidence Trail Box */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Data Evidence & Verification Trail</span>
          </div>
          <p><strong className="text-slate-300">Telemetry Basis:</strong> {pageConfig.evidenceText}</p>
          <p>
            <strong className="text-slate-300">Editorial Oversight:</strong> Edited by <Link to="/authors/sanobar-jahan" className="text-indigo-400 underline font-semibold">Sanobar Jahan</Link> under our <Link to="/editorial-policy" className="text-indigo-400 underline">Editorial Policy</Link>.
          </p>
        </section>

        {/* Author Attribution Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg shrink-0">
            S
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">{AUTHORS['sanobar-jahan'].name}</h3>
              <Link to="/authors/sanobar-jahan" className="text-xs text-indigo-400 hover:underline font-semibold">View Profile →</Link>
            </div>
            <p className="text-xs text-indigo-400 font-semibold">{AUTHORS['sanobar-jahan'].role}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{AUTHORS['sanobar-jahan'].bio}</p>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2>Frequently Asked Questions in {pageConfig.city}</h2>
          </div>
          <div className="space-y-3">
            {pageConfig.faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                >
                  <span className="font-semibold text-sm text-slate-200">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-900/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Deploy CHATR OS in {pageConfig.city} Today</h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Join enterprise leaders and recruitment agencies across {pageConfig.city} streamlining WhatsApp messaging, candidate screening, and team SLA tracking.
          </p>
          <div className="pt-2">
            <Link to="/auth" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20">
              Start Your Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LocationPillarPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, MapPin, Tag, FileText, ArrowRight, 
  Database, ShieldCheck, ExternalLink, HelpCircle, ChevronDown, Building2 
} from 'lucide-react';
import { resolveLocationFromPath, LOCATION_USE_CASES, TOP_CITIES } from '../../data/locationExpansionData';
import { AUTHORS } from '../../data/authorsData';
import { getEvidenceNodesForRoute } from '../../services/evidenceGraphEngine';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const LocationPillarPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageConfig = resolveLocationFromPath(location.pathname);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const evidenceNodes = pageConfig ? getEvidenceNodesForRoute(pageConfig.path, 'location') : [];

  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) setIsAuthenticated(true);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
        setAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    if (pageConfig) {
      document.title = pageConfig.title;

      const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: pageConfig.useCase,
        description: pageConfig.executiveSummary,
        serviceType: pageConfig.useCase,
        areaServed: { '@type': 'Place', name: pageConfig.city },
        provider: {
          '@type': 'Organization',
          name: 'CHATR Communication OS',
          url: 'https://www.chatrchat.in',
          logo: 'https://www.chatrchat.in/favicon.png'
        },
        url: `https://www.chatrchat.in${pageConfig.path}`,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: 'https://www.chatrchat.in/auth'
        }
      };

      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: pageConfig.h1,
        description: pageConfig.description,
        author: {
          '@type': 'Person',
          name: 'Sanobar Jahan',
          jobTitle: 'Founder, TalentXcel & CHATR',
          url: 'https://www.chatrchat.in/authors/sanobar-jahan'
        },
        publisher: {
          '@type': 'Organization',
          name: 'CHATR Communication OS',
          url: 'https://www.chatrchat.in'
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
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chatrchat.in' },
          { '@type': 'ListItem', position: 2, name: 'Location Directory', item: 'https://www.chatrchat.in/locations' },
          { '@type': 'ListItem', position: 3, name: pageConfig.h1, item: `https://www.chatrchat.in${pageConfig.path}` }
        ]
      };

      const scriptSvc = document.createElement('script');
      scriptSvc.id = 'location-service-schema';
      scriptSvc.type = 'application/ld+json';
      scriptSvc.textContent = JSON.stringify(serviceSchema);
      if (!document.getElementById('location-service-schema')) document.head.appendChild(scriptSvc);

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
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      ['location-service-schema', 'location-article-schema', 'location-faq-schema', 'location-breadcrumb-schema'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [pageConfig]);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  if (!pageConfig) {
    return (
      <div className="min-h-screen bg-[#F8F8F5] text-[#111817] flex flex-col justify-between">
        <LandingHeader
          onOpenAuth={() => setAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
          onNavigateWorkspace={handleNavigateWorkspace}
        />
        <div className="text-center space-y-4 max-w-md mx-auto p-12">
          <h1 className="text-2xl font-bold text-[#111817]">Location Solution Not Found</h1>
          <p className="text-sm text-[#53605C]">The requested location service page could not be located in our directory.</p>
          <div className="pt-2">
            <Link to="/locations" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#164E3F] rounded-full text-xs font-semibold text-white shadow-sm">
              <ArrowLeft className="w-4 h-4" /> Browse All Locations
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title={pageConfig.title}
        description={pageConfig.description}
        canonicalUrl={`https://www.chatrchat.in${pageConfig.path}`}
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#53605C] flex-wrap">
            <Link to="/locations" className="hover:underline flex items-center gap-1 text-[#53605C] hover:text-[#164E3F]">
              <MapPin className="w-3.5 h-3.5 text-[#164E3F]" />
              <span>Locations Directory</span>
            </Link>
            <span className="text-[#83918C]">/</span>
            <Link to={`/locations/${pageConfig.city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`} className="hover:underline text-[#164E3F] font-bold">
              {pageConfig.city} City Hub
            </Link>
            <span className="text-[#83918C]">•</span>
            <span className="text-[#83918C]">{pageConfig.stateRegion}</span>
          </div>

          {/* Contextual Intent Bridges */}
          {pageConfig.useCaseSlug.includes('ecommerce') && (
            <div className="bg-white border border-[#DDE3DF] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm">
              <div>
                <span className="font-bold text-[#111817]">Looking for automated WhatsApp Order Tracking & Delivery Alerts?</span>
                <p className="text-[#53605C] text-xs mt-0.5">Explore our dedicated e-commerce shipping workflow, Shopify & WooCommerce integrations.</p>
              </div>
              <Link to="/solutions/ecommerce-order-tracking" className="shrink-0 px-4 py-2 bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <span>Order Tracking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {pageConfig.useCaseSlug.includes('hospitality') && (
            <div className="bg-white border border-[#DDE3DF] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm">
              <div>
                <span className="font-bold text-[#111817]">Looking for Hotel Guest Messaging & Front Desk Chat on WhatsApp?</span>
                <p className="text-[#53605C] text-xs mt-0.5">Discover our shared front-desk inbox, room service automation, and review reminders.</p>
              </div>
              <Link to="/solutions/hotel-guest-messaging" className="shrink-0 px-4 py-2 bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <span>Hotel Solution Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {pageConfig.useCaseSlug.includes('recruitment') && (
            <div className="bg-white border border-[#DDE3DF] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm">
              <div>
                <span className="font-bold text-[#111817]">Automate Candidate Screening & Test Resumes Free</span>
                <p className="text-[#53605C] text-xs mt-0.5">Grade resumes instantly or connect WhatsApp candidate screening workflows.</p>
              </div>
              <Link to="/tools/resume-grader" className="shrink-0 px-4 py-2 bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <span>Free Resume Grader</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] leading-tight tracking-tight">
            {pageConfig.h1}
          </h1>

          {/* Executive Summary Card */}
          <div
            id="tldr-executive-summary"
            className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm"
            aria-label="TL;DR Executive Summary"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#164E3F]">
                <Building2 className="w-4 h-4" />
                <span>TL;DR — Quick Summary</span>
              </div>
              <span className="text-xs font-mono text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/20 px-2.5 py-0.5 rounded-full font-semibold">
                {pageConfig.city} • {pageConfig.useCase}
              </span>
            </div>
            <p className="text-[#111817] text-sm sm:text-base leading-relaxed font-medium">
              {pageConfig.executiveSummary} CHATR Communication OS provides an official WhatsApp Business API
              multi-agent team inbox that allows all agents in {pageConfig.city} to share one number,
              respond under 60-second SLA, and route leads automatically.
            </p>
            <div className="pt-2 border-t border-[#DDE3DF] flex flex-wrap gap-2">
              {['WhatsApp Business API', pageConfig.city, pageConfig.useCase, 'TalentXcel', 'CHATR OS'].map(tag => (
                <span key={tag} className="text-xs bg-[#FAFBF9] text-[#53605C] border border-[#DDE3DF] px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Key Facts Table */}
          <div className="bg-white border border-[#DDE3DF] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#DDE3DF] flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#164E3F]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#111817]">Key Facts for {pageConfig.city}</span>
            </div>
            <div className="divide-y divide-[#DDE3DF]">
              {[
                ['Service Area', `${pageConfig.city}, ${pageConfig.stateRegion}`],
                ['Use Case', pageConfig.useCase],
                ['WhatsApp API', 'Official Meta WhatsApp Business API (Tier-1 BSP)'],
                ['First Response SLA', 'Under 60 seconds with CHATR automated routing'],
                ['Resume Parse Speed', '1.2 seconds per candidate (TalentXcel SI Parser)'],
                ['Deployment', 'Cloud SaaS — available immediately in ' + pageConfig.city],
                ['Pricing', 'Free trial → Paid plans from ₹999/month'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start px-6 py-3 gap-4 text-xs">
                  <span className="text-[#83918C] font-semibold w-36 shrink-0">{label}</span>
                  <span className="text-[#111817] font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Local Features Section */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-[#111817]">Why {pageConfig.city} Businesses Choose CHATR OS</h2>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed">
            Fast-growing organizations in {pageConfig.city} rely on CHATR Communication OS and TalentXcel to centralize inbound customer WhatsApp messages, screen job applicants automatically, and enforce strict SLA response times.
          </p>

          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h3 className="font-bold text-[#111817] text-base">Key Regional Advantages for {pageConfig.city}</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-[#53605C]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
                <span><strong className="text-[#111817]">Multi-Agent Team Inbox:</strong> Single official WhatsApp Business API number shared across all team members in {pageConfig.city}.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
                <span><strong className="text-[#111817]">Automated Resume Parsing:</strong> Parse candidate CV formats in English and regional layouts in 1.2 seconds.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
                <span><strong className="text-[#111817]">5-Minute Response SLA:</strong> Automated auto-escalation timers notify managers if a lead stays unassigned.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Grounded Evidence Graph Trail */}
        {evidenceNodes.length > 0 && (
          <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DDE3DF] pb-3">
              <div className="flex items-center gap-2 font-bold text-[#111817] text-base">
                <Database className="w-4 h-4 text-[#164E3F]" />
                <span>Grounded Telemetry Benchmark</span>
              </div>
              <span className="text-xs font-mono text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/20 px-2.5 py-0.5 rounded-full font-semibold">
                Verified Regional Observation
              </span>
            </div>

            <div className="space-y-3">
              {evidenceNodes.slice(0, 2).map((ev, idx) => (
                <div key={idx} className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#164E3F] font-bold">Finding ID: {ev.findingId}</span>
                    <span className="text-[#83918C]">{ev.sampleSize}</span>
                  </div>
                  <p className="text-xs text-[#111817] leading-relaxed font-medium">"{ev.claimText}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#DDE3DF] text-xs">
                    <span className="text-[#53605C] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#164E3F]" /> Type: <strong className="text-[#111817]">{ev.claimType}</strong>
                    </span>
                    <Link to={ev.reportPath} className="text-[#164E3F] hover:underline flex items-center gap-1 font-semibold">
                      View Report Methodology <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Methodology & Data Evidence Trail Box */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-2 text-xs text-[#53605C] shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#111817] text-sm">
            <FileText className="w-4 h-4 text-[#164E3F]" />
            <span>Data Evidence & Verification Trail</span>
          </div>
          <p><strong className="text-[#111817]">Telemetry Basis:</strong> {pageConfig.evidenceText}</p>
          <p>
            <strong className="text-[#111817]">Editorial Oversight:</strong> Edited by <Link to="/authors/sanobar-jahan" className="text-[#164E3F] underline font-semibold">Sanobar Jahan</Link> under our <Link to="/editorial-policy" className="text-[#164E3F] underline">Editorial Policy</Link>.
          </p>
        </section>

        {/* Author Attribution Card */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center text-[#164E3F] font-bold text-lg shrink-0">
            S
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#111817] text-base">{AUTHORS['sanobar-jahan'].name}</h3>
              <Link to="/authors/sanobar-jahan" className="text-xs text-[#164E3F] hover:underline font-semibold">View Profile →</Link>
            </div>
            <p className="text-xs text-[#164E3F] font-semibold">{AUTHORS['sanobar-jahan'].role}</p>
            <p className="text-xs text-[#53605C] leading-relaxed">{AUTHORS['sanobar-jahan'].bio}</p>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-lg text-[#111817]">
            <HelpCircle className="w-5 h-5 text-[#164E3F]" />
            <h2>Frequently Asked Questions in {pageConfig.city}</h2>
          </div>
          <div className="space-y-3">
            {pageConfig.faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#DDE3DF] rounded-xl overflow-hidden bg-[#FAFBF9]">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm text-[#111817]">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#83918C] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-[#53605C] leading-relaxed border-t border-[#DDE3DF] bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Internal Cross-Linking Graph */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Topical Cross-Links */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#111817] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#164E3F]" />
              <span>Other Business Solutions in {pageConfig.city}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {LOCATION_USE_CASES.filter((uc) => uc.slug !== pageConfig.useCaseSlug)
                .slice(0, 4)
                .map((uc) => {
                  const citySlug = pageConfig.city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                  const siblingPath = `/location/${uc.slug}-${citySlug}`;
                  return (
                    <Link
                      key={uc.slug}
                      to={siblingPath}
                      className="bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 p-3 rounded-xl text-[#111817] hover:text-[#164E3F] transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium truncate">{uc.title} ({pageConfig.city})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#83918C] shrink-0" />
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Regional Cross-Links */}
          <div className="space-y-3 pt-4 border-t border-[#DDE3DF]">
            <h3 className="text-base font-bold text-[#111817] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#164E3F]" />
              <span>{pageConfig.useCase} in Neighboring Hubs</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {TOP_CITIES.filter((c) => c.city !== pageConfig.city)
                .slice(0, 4)
                .map((c) => {
                  const neighborCitySlug = c.city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                  const neighborPath = `/location/${pageConfig.useCaseSlug}-${neighborCitySlug}`;
                  return (
                    <Link
                      key={c.city}
                      to={neighborPath}
                      className="bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 p-3 rounded-xl text-[#111817] hover:text-[#164E3F] transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium truncate">{pageConfig.useCase} ({c.city})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#83918C] shrink-0" />
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <div className="bg-white border border-[#DDE3DF] rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Deploy CHATR OS in {pageConfig.city} Today</h2>
          <p className="text-xs sm:text-sm text-[#53605C] max-w-xl mx-auto leading-relaxed">
            Join enterprise leaders and recruitment agencies across {pageConfig.city} streamlining WhatsApp messaging, candidate screening, and team SLA tracking.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#164E3F] hover:bg-[#123F33] text-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              <span>Start Your Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LocationPillarPage;

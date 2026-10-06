import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapPin, Building2, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Tag } from 'lucide-react';
import { TOP_CITIES, LOCATION_USE_CASES } from '../../data/locationExpansionData';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const CityHubPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const cityEntry = TOP_CITIES.find((c) => slugify(c.city) === citySlug) || {
    city: citySlug ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1).replace(/-/g, ' ') : 'City',
    state: 'Global Commerce Region',
    region: 'Enterprise Business Hub',
  };

  const cityName = cityEntry.city;
  const currentSlug = citySlug || slugify(cityName);

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
      isMounted = false;
      subscription.unsubscribe();
      const el = document.getElementById('city-hub-breadcrumb-schema');
      if (el) el.remove();
    };
  }, [cityName, currentSlug]);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title={`${cityName} Solutions Hub — WhatsApp API & Recruitment | CHATR & TalentXcel`}
        description={`Deploy CHATR OS and TalentXcel in ${cityName}, ${cityEntry.state}. Access 10 specialized industry solutions including WhatsApp Business API, candidate screening, real estate lead management, and healthcare patient messaging.`}
        canonicalUrl={`https://www.chatrchat.in/locations/${currentSlug}`}
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-10">
        {/* Breadcrumb / Back Link */}
        <div>
          <Link to="/locations" className="inline-flex items-center gap-1.5 text-xs text-[#53605C] hover:text-[#164E3F] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 text-[#164E3F]" />
            <span>Locations Directory</span>
            <span className="text-[#83918C]">/ {cityName} Hub</span>
          </Link>
        </div>

        {/* City Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{cityName} City Hub • {cityEntry.state}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] leading-tight tracking-tight">
            CHATR Business OS & TalentXcel Solutions in {cityName}
          </h1>

          {/* City Executive Summary */}
          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#164E3F]">
              <Building2 className="w-4 h-4" />
              <span>{cityName} Regional Overview</span>
            </div>
            <p className="text-[#53605C] text-sm sm:text-base leading-relaxed">
              Businesses and recruitment agencies in {cityName} ({cityEntry.region}) leverage CHATR Communication OS to unify WhatsApp Business API channels, automate candidate screening, and eliminate lead drop-off across 10 specialized industry verticals.
            </p>
          </div>
        </div>

        {/* 10 Industry Pillar Links for this City */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-[#DDE3DF] pb-3">
            <h2 className="text-xl font-bold text-[#111817] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#164E3F]" />
              <span>Available Industry Pillar Pages for {cityName}</span>
            </h2>
            <span className="text-xs font-mono text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/20 px-2.5 py-0.5 rounded-full font-semibold">
              10 Verticals Live
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {LOCATION_USE_CASES.map((uc) => {
              const pillarPath = `/location/${uc.slug}-${currentSlug}`;
              return (
                <Link
                  key={uc.slug}
                  to={pillarPath}
                  className="bg-white hover:bg-[#FAFBF9] border border-[#DDE3DF] hover:border-[#164E3F]/40 rounded-2xl p-6 space-y-2.5 transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#111817] group-hover:text-[#164E3F] transition-colors">
                      {uc.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-[#83918C] group-hover:text-[#164E3F] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                  <p className="text-xs text-[#53605C] leading-relaxed">
                    Automate {uc.focus} in {cityName} with CHATR Communication OS.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs text-[#164E3F] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>View {cityName} Pillar Page →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Grounded Regional Advantages */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-[#111817] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#164E3F]" />
            <span>Why Companies in {cityName} Deploy CHATR OS</span>
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-[#53605C]">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
              <span><strong className="text-[#111817]">Shared WhatsApp API Inbox:</strong> Multiple team members in {cityName} respond to customers simultaneously from one official number.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
              <span><strong className="text-[#111817]">TalentXcel Resume Parsing:</strong> Extract skills and experience from Indian candidate CVs in 1.2 seconds.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
              <span><strong className="text-[#111817]">Sub-60 Second Response SLA:</strong> Automated round-robin routing ensures zero unassigned messages in {cityName}.</span>
            </li>
          </ul>
        </section>

        {/* Back Link to Global Locations Hub */}
        <div className="pt-2 text-center">
          <Link to="/locations" className="inline-flex items-center gap-2 text-xs text-[#164E3F] hover:underline font-semibold">
            ← Explore All 1,758 Cities in Global Directory
          </Link>
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

export default CityHubPage;

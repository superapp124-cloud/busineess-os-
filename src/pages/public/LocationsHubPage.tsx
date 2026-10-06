import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Building2, ArrowRight, Globe2, ShieldCheck, ChevronRight } from 'lucide-react';
import { TOP_CITIES, LOCATION_USE_CASES } from '../../data/locationExpansionData';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const LocationsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      isMounted = false;
      subscription.unsubscribe();
      const el = document.getElementById('locations-hub-breadcrumb-schema');
      if (el) el.remove();
    };
  }, []);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

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
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Global Locations Directory — CHATR Communication OS & TalentXcel"
        description="Explore CHATR OS and TalentXcel availability across 1,750+ cities globally. WhatsApp Business API multi-agent team inboxes, automated recruitment screening, and response SLA tracking."
        canonicalUrl="https://www.chatrchat.in/locations"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-12">
        {/* Header Hero */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F]">
            <Globe2 className="w-3.5 h-3.5" />
            <span>1,758 Global Cities • 10 Industry Verticals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] tracking-tight leading-tight">
            Global Locations & Regional Solution Directory
          </h1>
          <p className="text-[#53605C] text-sm md:text-base leading-relaxed">
            Deploy CHATR Business OS and TalentXcel across 1,758 cities worldwide. Access local WhatsApp Business API inboxes, candidate screening workflows, and real-time response SLA tracking.
          </p>
        </div>

        {/* 10 Industry Verticals */}
        <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-[#111817] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#164E3F]" />
            <span>Available Industry Solutions Per City</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LOCATION_USE_CASES.map((uc) => (
              <div key={uc.slug} className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-3.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111817]">{uc.title}</span>
                <span className="text-[#164E3F] font-mono text-[11px] shrink-0 bg-[#E8F0EB] px-2 py-0.5 rounded border border-[#164E3F]/20">
                  {uc.slug}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional City Links Grid */}
        <div className="space-y-10">
          {regions.map((reg) => (
            <section key={reg.name} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DDE3DF] pb-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#111817] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#164E3F]" />
                  <span>{reg.name} Hubs</span>
                </h2>
                <span className="text-xs text-[#83918C] font-mono">{reg.cities.length} Regional Hubs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {reg.cities.map((c) => {
                  const citySlug = slugify(c.city);
                  return (
                    <Link
                      key={c.city}
                      to={`/locations/${citySlug}`}
                      className="bg-white hover:bg-[#FAFBF9] border border-[#DDE3DF] hover:border-[#164E3F]/40 rounded-xl p-3 text-left transition-all group shadow-sm"
                    >
                      <div className="font-bold text-xs text-[#111817] group-hover:text-[#164E3F] truncate">
                        {c.city}
                      </div>
                      <div className="text-[10px] text-[#83918C] truncate">{c.state}</div>
                      <div className="text-[10px] text-[#164E3F] font-semibold pt-1 flex items-center gap-0.5">
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
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111817] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#164E3F]" />
              <span>Direct Link Discovery Paths (Sample Pillar Pages)</span>
            </h2>
            <span className="text-xs text-[#83918C] font-mono hidden sm:inline">100% Pre-rendered HTML</span>
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
                className="bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] hover:border-[#164E3F]/40 p-2.5 rounded-lg text-[#111817] hover:text-[#164E3F] transition-colors flex items-center justify-between font-medium"
              >
                <span>{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#83918C]" />
              </Link>
            ))}
          </div>
        </section>
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

export default LocationsHubPage;

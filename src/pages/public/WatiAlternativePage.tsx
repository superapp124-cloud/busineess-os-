import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, HelpCircle, PhoneCall, 
  DollarSign, RefreshCw, Check, Sparkles 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { WatiComparisonMatrix } from '@/components/seo/WatiComparisonMatrix';
import { InteractiveInboxSimulator } from '@/components/seo/InteractiveInboxSimulator';
import { Footer } from '@/components/Footer';

export const WatiAlternativePage: React.FC = () => {
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

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'WATI Alternative: CHATR Communication OS',
    description: 'Factual capability and pricing comparison between WATI and CHATR for WhatsApp business communication.',
    url: 'https://www.chatrchat.in/wati-alternative',
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'CHATR Communication OS',
      applicationCategory: 'BusinessApplication',
      offers: {
        '@type': 'Offer',
        price: '999',
        priceCurrency: 'INR'
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="WATI Alternative — WhatsApp API, Shared Team Inbox & Calling | CHATR"
        description="Compare CHATR and WATI for business messaging. Discover transparent pricing starting at ₹999/mo, multi-agent shared team inboxes, and built-in browser HD voice calling."
        canonicalUrl="https://www.chatrchat.in/wati-alternative"
        keywords="wati alternative, wati pricing comparison, best wati alternatives, whatsapp business api alternatives, chatr vs wati"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 flex-1">
        {/* Hero Section */}
        <section className="text-center space-y-5 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>HONEST PLATFORM COMPARISON • UPDATED 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.1]">
            A WATI Alternative for Teams That Need More Than Just Messaging —{' '}
            <span className="text-[#164E3F]">and save 70%+.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed max-w-3xl mx-auto">
            Looking for a transparent alternative to WATI? Compare official Meta WhatsApp API plans starting at ₹999/month, multi-agent shared inboxes, built-in browser calling, and autonomous triage with zero per-user seat markups.
          </p>

          <div className="flex items-center justify-center gap-4 pt-3 flex-wrap">
            <a
              href="#comparison-matrix"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white text-sm sm:text-base font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>View Factual Comparison</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/desktop/home');
                else setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAFBF9] text-[#111817] border border-[#DDE3DF] text-sm sm:text-base font-medium shadow-sm transition-all cursor-pointer"
            >
              <span>Start Free 14-Day Trial</span>
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#53605C] flex-wrap font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Plans from ₹999/mo
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Zero Per-Seat User Markups
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> 1-Click WhatsApp Number Porting
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" /> Free Browser Calling Included
            </span>
          </div>
        </section>

        {/* Factual Comparison Matrix Section */}
        <section id="comparison-matrix" className="space-y-4">
          <WatiComparisonMatrix />
        </section>

        {/* Product Simulator Experience */}
        <section id="interactive-demo" className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xs uppercase font-bold tracking-wider text-[#164E3F] font-mono">
              Interactive Software Experience
            </h2>
            <p className="text-xl sm:text-2xl font-bold text-[#111817]">
              Experience the CHATR Team Inbox Workflow
            </p>
          </div>
          <InteractiveInboxSimulator />
        </section>

        {/* Honest Fit Analysis: When CHATR vs When WATI */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111817] text-center">Which Solution Fits Your Business?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 bg-white border border-[#DDE3DF] rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#164E3F] font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-[#164E3F]" />
                <h3 className="text-lg text-[#111817]">When CHATR May Be the Better Fit</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#53605C]">
                <li className="flex items-start gap-2">
                  <span className="text-[#164E3F] font-bold mt-0.5">•</span>
                  <span><strong className="text-[#111817]">Predictable Pricing:</strong> You want a straightforward monthly plan (starting at ₹999/mo) without escalating per-user charges as your team expands.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#164E3F] font-bold mt-0.5">•</span>
                  <span><strong className="text-[#111817]">Integrated Voice &amp; Video Calling:</strong> Your business needs to escalate WhatsApp chats into instant browser HD calls without forcing clients to install extra apps.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#164E3F] font-bold mt-0.5">•</span>
                  <span><strong className="text-[#111817]">On-Device Mobile Experience:</strong> You need full Android carrier-grade calling integration with native lock-screen caller identification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#164E3F] font-bold mt-0.5">•</span>
                  <span><strong className="text-[#111817]">Autonomous Workflow Triage:</strong> You want intelligence that parses complex inquiries and categorizes leads by intent rather than rigid keyword menus.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 sm:p-8 bg-white border border-[#DDE3DF] rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#53605C] font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-[#83918C]" />
                <h3 className="text-lg text-[#111817]">When WATI May Be the Better Fit</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#53605C]">
                <li className="flex items-start gap-2">
                  <span className="text-[#83918C] font-bold mt-0.5">•</span>
                  <span><strong className="text-[#111817]">Established Global Footprint:</strong> Your team is already comfortable with WATI's existing ecosystem and prefers an established legacy brand.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#83918C] font-bold mt-0.5">•</span>
                  <span><strong className="text-[#111817]">Text-Only Requirement:</strong> Your business operations have zero requirement for voice or WebRTC calling and focus exclusively on text broadcasts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#83918C] font-bold mt-0.5">•</span>
                  <span><strong className="text-[#111817]">Specific CRM Marketplace Integrations:</strong> You rely on niche third-party marketplace connectors specifically certified for WATI's webhook format.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Seamless Migration Guide */}
        <section className="p-6 sm:p-10 bg-white border border-[#DDE3DF] rounded-2xl space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[#111817]">
            <RefreshCw className="w-5 h-5 text-[#164E3F]" />
            <h2>Migrating from WATI to CHATR with Zero Downtime</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#53605C] leading-relaxed">
            Because both CHATR and WATI operate on the official Meta WhatsApp Business Cloud API architecture, switching requires no disruption to your verified phone number:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2">
              <span className="text-[#164E3F] font-bold font-mono">Step 1</span>
              <h3 className="font-semibold text-[#111817]">Keep Your Number</h3>
              <p className="text-[#53605C] leading-relaxed">
                Log into your Meta Business Manager. Your phone number, verification status, and green checkmark remain intact.
              </p>
            </div>
            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2">
              <span className="text-[#164E3F] font-bold font-mono">Step 2</span>
              <h3 className="font-semibold text-[#111817]">Connect CHATR Endpoint</h3>
              <p className="text-[#53605C] leading-relaxed">
                Connect your WABA ID to CHATR using our 1-click Meta OAuth onboarding flow in less than 5 minutes.
              </p>
            </div>
            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2">
              <span className="text-[#164E3F] font-bold font-mono">Step 3</span>
              <h3 className="font-semibold text-[#111817]">Invite Your Team</h3>
              <p className="text-[#53605C] leading-relaxed">
                Invite your support and sales team members to your shared dashboard and start handling conversations together.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6 bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[#111817]">
            <HelpCircle className="w-5 h-5 text-[#164E3F]" />
            <h2>Frequently Asked Questions About Switching from WATI</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2">
              <h3 className="font-semibold text-[#111817]">Will I lose my WhatsApp green tick verification if I switch?</h3>
              <p className="text-[#53605C] leading-relaxed">
                No. Official Meta Official Business Account (green tick) status is tied directly to your Facebook Business Manager and phone number, not to any third-party software vendor. Switching to CHATR preserves your verification status.
              </p>
            </div>

            <div className="p-5 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl space-y-2">
              <h3 className="font-semibold text-[#111817]">How does CHATR pricing compare to WATI?</h3>
              <p className="text-[#53605C] leading-relaxed">
                WATI plans start around ~$49–$59/month (approx ₹4,000–₹5,000/month) and charge extra for additional agent seats. CHATR's SME Starter plan starts at ₹999/month and includes multi-agent team access without steep per-seat fees.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Conversion Card */}
        <section className="p-8 sm:p-12 rounded-2xl bg-[#EAEFEA] border border-[#D5E0D5] text-center space-y-6 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">
            Evaluate CHATR for Your Team Today
          </h2>
          <p className="text-xs sm:text-sm text-[#53605C] max-w-xl mx-auto">
            Experience transparent pricing, shared team inboxes, and integrated browser calling. Try CHATR free for 14 days.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => {
                if (isAuthenticated) navigate('/desktop/home');
                else setAuthModalOpen(true);
              }}
              className="px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              Start 14-Day Free Trial
            </button>
            <Link
              to="/pricing"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-[#FAFBF9] text-[#111817] border border-[#DDE3DF] font-semibold text-sm shadow-sm transition-all"
            >
              View Full Pricing Details
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default WatiAlternativePage;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, ShieldCheck, Zap, Sparkles, 
  HelpCircle, ChevronDown, Layers, Check 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const businessOsPlans = [
    {
      name: 'Free Trial',
      price: '₹0',
      period: '14-day full access',
      description: 'Ideal for small teams evaluating CHATR Communication OS.',
      badge: 'Getting Started',
      features: [
        'Single WhatsApp Business API number',
        'Universal Team Inbox (WhatsApp + Web Calling)',
        'Basic Lead Routing & Instant Auto-Replies',
        'Up to 3 team seats included',
        'Standard email & community support'
      ],
      ctaText: 'Start 14-Day Free Trial',
      highlighted: false
    },
    {
      name: 'Starter SME OS',
      price: '₹999',
      period: 'per month',
      description: 'Essential multi-channel messaging & calling for growing businesses.',
      badge: 'Most Popular',
      features: [
        'Everything in Free Trial',
        'Official Meta Cloud API shared inbox',
        'Sub-minute speed to lead response triage',
        'Interactive candidate & lead qualification flows',
        'Up to 5 team seats included (no seat penalties)',
        'Priority chat and email support'
      ],
      ctaText: 'Get Started Free',
      highlighted: true
    },
    {
      name: 'Growth & Team OS',
      price: '₹2,999',
      period: 'per month',
      description: 'Advanced team collaboration, auto-assignment, and multi-location management.',
      badge: 'High Concurrency',
      features: [
        'Everything in Starter SME OS',
        'Multi-account & multi-branch WhatsApp management',
        'Automated conversation summaries & intent tagging',
        'Multi-agent collision lock & real-time typing indicators',
        'Manager SLA response performance analytics',
        'Dedicated account manager & 24/7 priority support'
      ],
      ctaText: 'Upgrade to Growth OS',
      highlighted: false
    }
  ];

  const desktopProPlan = {
    name: 'CHATR Executive Desktop (Pro App)',
    monthlyPrice: '$19',
    annualPrice: '$15',
    description: 'Personal executive assistant application for desktop & power users.',
    features: [
      'Unlimited local private model (Ollama) execution',
      'Voice Clone setup & HD audio synthesis',
      '5 Burner calling numbers per month',
      'Cross-platform desktop sync (Windows, macOS, Mobile)',
      'Priority execution queue & encrypted security vault'
    ]
  };

  const faqs = [
    {
      q: 'Does CHATR offer a free trial?',
      a: 'Yes. All CHATR Business OS plans include a 14-day free trial with no upfront credit card required. You can set up your team workspace, connect your WhatsApp number, and evaluate features immediately.'
    },
    {
      q: 'What is the difference between Business OS plans (in INR) and Desktop Pro (in USD)?',
      a: 'Business OS plans (₹999/mo - ₹2,999/mo) are designed for business teams managing shared WhatsApp Business numbers, customer support, and lead pipelines. The Desktop Pro plan ($15/mo - $19/mo) is a personal executive assistant subscription for individual power users.'
    },
    {
      q: 'Can I add extra team members to my workspace?',
      a: 'Yes. Additional seat licenses can be added to your Business OS workspace at any time directly inside Team Settings with transparent pricing.'
    },
    {
      q: 'Are there any hidden API fees for WhatsApp Business?',
      a: 'No. CHATR provides transparent WhatsApp Business API connection with zero conversation markups. Meta conversation charges are billed directly at official Meta tariffs with zero hidden surcharge.'
    }
  ];

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/desktop/home');
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="CHATR Pricing — Commercial Plans & Free Trial"
        description="Simple, transparent pricing for CHATR Business OS. Explore 14-day free trial, SME Starter plans from ₹999/mo, and Growth OS with zero per-user seat markups."
        canonicalUrl="https://www.chatrchat.in/pricing"
        keywords="chatr pricing, whatsapp api pricing, shared team inbox cost, business messaging plans india"
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 flex-1">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>TRANSPARENT BUSINESS PRICING • 0% HIDDEN FEES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.1]">
            Simple Plans for Teams —{' '}
            <span className="text-[#164E3F]">zero per-seat penalties.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed max-w-2xl mx-auto">
            Start with a 14-day free trial. Scale seamlessly as your customer message volume and team operations grow.
          </p>
        </section>

        {/* Section 1: Business OS Plans */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111817]">CHATR Business OS Plans</h2>
            <p className="text-xs sm:text-sm text-[#53605C] max-w-xl mx-auto">
              Shared WhatsApp Business inbox, browser HD calling, and automated lead routing for teams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {businessOsPlans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between transition-all bg-white ${
                  plan.highlighted
                    ? 'border-2 border-[#164E3F] shadow-md relative'
                    : 'border border-[#DDE3DF] shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#164E3F] bg-[#EAEFEA] border border-[#D5E0D5] px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111817]">{plan.name}</h3>
                    <p className="text-[#53605C] text-xs mt-1">{plan.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[#DDE3DF] flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#111817]">{plan.price}</span>
                    <span className="text-[#53605C] text-xs font-medium">{plan.period}</span>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[#53605C]">
                        <Check className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DDE3DF]">
                  <button
                    onClick={handleCtaClick}
                    className={`w-full py-3.5 rounded-full font-semibold text-xs sm:text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      plan.highlighted
                        ? 'bg-[#164E3F] hover:bg-[#123F33] text-white shadow-md'
                        : 'bg-[#FAFBF9] hover:bg-[#F0F3F1] border border-[#DDE3DF] text-[#111817]'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Personal Executive Desktop Edition */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#DDE3DF]">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#164E3F] bg-[#EAEFEA] border border-[#D5E0D5] px-3 py-1 rounded-full">
                Personal Power User Edition
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111817]">{desktopProPlan.name}</h3>
              <p className="text-[#53605C] text-xs sm:text-sm leading-relaxed">{desktopProPlan.description}</p>
            </div>

            <div className="text-left md:text-right shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#111817]">{desktopProPlan.annualPrice}</span>
                <span className="text-[#53605C] text-xs font-medium">/mo (Billed $180/yr)</span>
              </div>
              <p className="text-[#83918C] text-[11px] mt-0.5">Or {desktopProPlan.monthlyPrice}/mo billed monthly</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-[#53605C]">
            {desktopProPlan.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 bg-[#FAFBF9] p-3 rounded-xl border border-[#DDE3DF]">
                <Check className="w-4 h-4 text-[#164E3F] shrink-0 stroke-[2.5]" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              onClick={handleCtaClick} 
              className="bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold px-7 py-3 rounded-full text-xs sm:text-sm inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              Get Desktop Pro <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-[#53605C]">
              <ShieldCheck className="w-4 h-4 text-[#164E3F]" />
              <span>256-Bit Encrypted Subscription</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111817]">Frequently Asked Pricing Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#DDE3DF] rounded-xl overflow-hidden bg-[#FAFBF9]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[#F0F3F1] transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-xs sm:text-sm text-[#111817]">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#53605C] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="p-4 pt-0 text-xs text-[#53605C] leading-relaxed border-t border-[#DDE3DF] bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section className="bg-[#EAEFEA] border border-[#D5E0D5] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Ready to Transform Your Business Messaging?</h2>
          <p className="text-[#53605C] text-sm max-w-md mx-auto">
            Experience transparent pricing with multi-agent team access out of the box.
          </p>
          <div className="pt-2">
            <button
              onClick={handleCtaClick}
              className="inline-flex items-center gap-2 bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold px-8 py-3.5 rounded-full transition-all text-sm shadow-md cursor-pointer"
            >
              Start 14-Day Free Trial <ArrowRight className="w-4 h-4" />
            </button>
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

export default PricingPage;

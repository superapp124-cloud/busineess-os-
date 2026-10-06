import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MessageCircle, Heart, Users, Shield, Zap, ChevronDown, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { supabase } from '@/integrations/supabase/client';

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
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

  const categories = [
    { icon: MessageCircle, title: 'Chat & Messaging' },
    { icon: Users, title: 'Team Workspaces' },
    { icon: Shield, title: 'Privacy & Security' },
    { icon: Zap, title: 'Features & Tools' }
  ];

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create a workspace account?',
          a: 'Click on "Get Started", enter your mobile phone number, verify with OTP, and choose your team workspace name.'
        },
        {
          q: 'Is CHATR free to start?',
          a: 'Yes! CHATR offers a generous free tier for WebRTC browser calls, link sharing, and basic team messaging.'
        },
        {
          q: 'What platforms are supported?',
          a: 'CHATR works across modern browsers (Chrome, Edge, Safari, Firefox), Windows, macOS, and Android (via direct APK).'
        }
      ]
    },
    {
      category: 'Messaging & Calling',
      questions: [
        {
          q: 'How does free web browser calling work?',
          a: 'Visit chatrchat.in/call to start an instant private room, share the link with any participant, and talk directly via encrypted WebRTC with zero app installs required.'
        },
        {
          q: 'Can multiple agents respond from one WhatsApp number?',
          a: 'Yes. With the CHATR WhatsApp Team Inbox, your entire team shares a single official WhatsApp Business API number with auto-assignment and SLA tracking.'
        }
      ]
    },
    {
      category: 'Security & Privacy',
      questions: [
        {
          q: 'Is my team data secure?',
          a: 'Yes. All browser calls use encrypted WebRTC peer-to-peer protocols. Team data is stored on secure cloud architecture complying with the Information Technology Act.'
        },
        {
          q: 'Can I claim a permanent personalized calling link?',
          a: 'Yes! After your call or upon sign up, you can claim your personal handle like chatrchat.in/call/your-name.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(section => ({
    ...section,
    questions: section.questions.filter(q =>
      !searchQuery ||
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Help Center — CHATR Support & FAQs"
        description="Find answers to common questions about CHATR Communication OS, WhatsApp Team Inbox, browser calling, and team workspaces."
        canonicalUrl="https://www.chatrchat.in/help"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-10">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-[#DDE3DF] shadow-sm p-8 sm:p-12 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111817]">How can we help you?</h1>
          <p className="text-[#53605C] text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Search our knowledge base or explore common topics below.
          </p>

          <div className="max-w-md mx-auto relative pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#83918C]" />
            <input
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFBF9] border border-[#DDE3DF] focus:border-[#164E3F] focus:outline-none rounded-full pl-11 pr-4 py-3 text-sm text-[#111817]"
            />
          </div>
        </div>

        {/* Categories Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat, index) => (
            <div key={index} className="bg-white rounded-2xl border border-[#DDE3DF] p-5 text-center shadow-sm hover:border-[#164E3F]/40 transition-colors">
              <cat.icon className="h-6 w-6 mx-auto mb-2 text-[#164E3F]" />
              <p className="text-xs font-semibold text-[#111817]">{cat.title}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#111817]">Frequently Asked Questions</h2>
          {filteredFaqs.map((section, sIdx) => (
            <div key={sIdx} className="bg-white rounded-2xl border border-[#DDE3DF] p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#164E3F]">{section.category}</h3>
              <div className="space-y-3">
                {section.questions.map((faq, fIdx) => {
                  const key = `${sIdx}-${fIdx}`;
                  const isOpen = openFaq === key;
                  return (
                    <div key={fIdx} className="border border-[#DDE3DF] rounded-xl overflow-hidden bg-[#FAFBF9]">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-white transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-sm text-[#111817]">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-[#83918C] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs sm:text-sm text-[#53605C] leading-relaxed border-t border-[#DDE3DF] bg-white">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Contact CTA */}
        <div className="bg-white rounded-3xl border border-[#DDE3DF] p-8 text-center space-y-3 shadow-sm">
          <h3 className="text-xl font-bold text-[#111817]">Still have questions?</h3>
          <p className="text-sm text-[#53605C]">
            Our support desk is available to assist you with workspace setup or integrations.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>Contact Support Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
}

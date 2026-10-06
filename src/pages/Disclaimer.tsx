import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export default function Disclaimer() {
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

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Disclaimer — CHATR Communication OS"
        description="Legal disclaimer regarding the use of CHATR Communication OS, content verification, and third-party integrations."
        canonicalUrl="https://www.chatrchat.in/disclaimer"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <div className="bg-white rounded-3xl border border-[#DDE3DF] shadow-sm p-6 sm:p-10 space-y-6 text-sm text-[#53605C]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Disclaimer</h1>
            <p className="text-xs text-[#83918C] mt-1">Last Updated: January 2026</p>
          </div>

          <div className="space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">1. General Information</h2>
              <p className="leading-relaxed">
                The information provided by Chatr (operated by TalentXcel Services Pvt. Ltd.) is for general communication and workflow automation purposes. All features are provided "as is" without warranty of any kind.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">2. SI-Powered Capabilities</h2>
              <p className="leading-relaxed">
                Chatr utilizes SI for message triage, conversational summaries, and candidate pre-screening assistance. SI-generated outputs are meant to assist human decision-makers and should be reviewed by qualified team personnel before critical operational actions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">3. Third-Party Integrations & Links</h2>
              <p className="leading-relaxed">
                Chatr may interface with external APIs (including WhatsApp Business API / Meta Cloud API, CRM webhooks, and payment processors). We are not responsible for downtime, policy changes, or terms enforced by external third-party infrastructure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">4. User Responsibility</h2>
              <p className="leading-relaxed">
                Users are solely responsible for ensuring that their messaging broadcasts, customer communications, and candidate evaluations comply with local employment, telecommunication, and anti-spam legislation.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-[#DDE3DF]">
              <h2 className="text-base font-bold text-[#111817]">5. Contact Information</h2>
              <p className="leading-relaxed">
                For questions regarding this disclaimer, please contact:<br />
                <strong>TalentXcel Services Pvt. Ltd.</strong><br />
                Email: legal@chatr.chat<br />
                Address: Noida, Uttar Pradesh, India
              </p>
              <p className="text-xs text-[#83918C] pt-3">
                © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
              </p>
            </section>
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

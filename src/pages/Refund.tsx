import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export default function Refund() {
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
        title="Refund and Cancellation Policy — CHATR Communication OS"
        description="Learn about the refund and cancellation policies applicable to CHATR commercial plans and subscriptions."
        canonicalUrl="https://www.chatrchat.in/refund"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <div className="bg-white rounded-3xl border border-[#DDE3DF] shadow-sm p-6 sm:p-10 space-y-6 text-sm text-[#53605C]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Refund and Cancellation Policy</h1>
            <p className="text-xs text-[#83918C] mt-1">Last Updated: January 2026</p>
          </div>

          <div className="space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">1. Free Services & Trials</h2>
              <p className="leading-relaxed">
                Core browser calling and trial workspace tiers are completely free of charge. No payment or refund is applicable for free tiers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">2. Commercial Plans & Subscriptions</h2>
              <p className="leading-relaxed">
                Paid plans (such as WhatsApp Team Inbox, Dedicated Phone Lines, and Enterprise Workspaces) are billed on a recurring monthly or annual basis as specified during order checkout.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">3. Refund Eligibility</h2>
              <p className="leading-relaxed">
                Refunds may be considered under the following conditions:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-[#53605C]">
                <li>Duplicate or accidental billing transactions reported within 7 business days</li>
                <li>Inability to provision the promised service due to unresolvable technical fault on our platform</li>
                <li>Cancellations requested before the start of a new billing cycle</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">4. Cancellation Process</h2>
              <p className="leading-relaxed">
                You may cancel your recurring subscription at any time via your Workspace Settings or by emailing billing@chatr.chat. Once cancelled, your subscription will remain active until the end of the current paid billing period.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-[#DDE3DF]">
              <h2 className="text-base font-bold text-[#111817]">5. Contact Us</h2>
              <p className="leading-relaxed">
                For billing inquiries or refund requests, please contact:<br />
                <strong>TalentXcel Services Pvt Ltd</strong><br />
                Email: billing@chatr.chat<br />
                Website: chatrchat.in
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

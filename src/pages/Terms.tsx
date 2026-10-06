import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export default function Terms() {
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
        title="Terms and Conditions — CHATR Communication OS"
        description="Terms and conditions governing the use of CHATR Communication OS, a product of TalentXcel Services Pvt Ltd."
        canonicalUrl="https://www.chatrchat.in/terms"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <div className="bg-white rounded-3xl border border-[#DDE3DF] shadow-sm p-6 sm:p-10 space-y-6 text-sm text-[#53605C]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Terms and Conditions</h1>
            <p className="text-xs text-[#83918C] mt-1">Last Updated: January 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Chatr (a product of TalentXcel Services Pvt Ltd), you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">2. Services Provided</h2>
            <p className="leading-relaxed">
              Chatr provides instant messaging, voice and video calling, team inbox management, and business communication workflows. We reserve the right to modify, suspend, or discontinue any part of our services at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">3. User Eligibility</h2>
            <p className="leading-relaxed">
              You must be at least 13 years old to use Chatr. Users between 13-18 years must have parental consent. By using our services, you represent that you meet these age requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">4. User Conduct</h2>
            <p className="leading-relaxed">
              You agree not to use Chatr to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-[#53605C]">
              <li>Violate any laws or regulations of India or international jurisdictions</li>
              <li>Harass, threaten, or harm others</li>
              <li>Share false, misleading, or defamatory content</li>
              <li>Distribute spam, malware, or unauthorized advertising</li>
              <li>Infringe on intellectual property rights</li>
              <li>Impersonate others or misrepresent your identity</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">5. Content Ownership</h2>
            <p className="leading-relaxed">
              You retain ownership of content you share on Chatr. By posting content, you grant us a license to use, store, and display that content as necessary to provide our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">6. Privacy and Data Protection</h2>
            <p className="leading-relaxed">
              Your privacy is important to us. Our data practices comply with the Information Technology Act, 2000 and applicable Indian privacy laws. Please review our Privacy Policy for details on how we collect and use your information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">7. Intellectual Property</h2>
            <p className="leading-relaxed">
              All intellectual property rights in Chatr, including trademarks, logos, and software, belong to TalentXcel Services Pvt Ltd. You may not copy, modify, or distribute our intellectual property without permission.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Chatr is provided "as is" without warranties. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">9. Termination</h2>
            <p className="leading-relaxed">
              We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason deemed necessary.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#111817]">10. Governing Law</h2>
            <p className="leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Noida, Uttar Pradesh, India.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-[#DDE3DF]">
            <h2 className="text-base font-bold text-[#111817]">11. Contact Information</h2>
            <p className="leading-relaxed">
              For questions about these terms, please contact us at:<br />
              <strong>TalentXcel Services Pvt Ltd</strong><br />
              Email: legal@chatr.chat<br />
              Website: chatrchat.in
            </p>
            <p className="text-xs text-[#83918C] pt-3">
              © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
            </p>
          </section>
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

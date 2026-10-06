import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export default function PrivacyPolicy() {
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
        title="Privacy Policy — CHATR Communication OS"
        description="Learn how CHATR Communication OS and TalentXcel protect your personal information, messages, and communication data."
        canonicalUrl="https://www.chatrchat.in/privacy"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-8">
        <div className="bg-white rounded-3xl border border-[#DDE3DF] shadow-sm p-6 sm:p-10 space-y-6 text-sm text-[#53605C]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111817]">Privacy Policy</h1>
            <p className="text-xs text-[#83918C] mt-1">Last Updated: January 2026</p>
          </div>

          <div className="space-y-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">1. Information We Collect</h2>
              <p className="leading-relaxed">
                We collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-[#53605C]">
                <li>Account Information: Phone number, username, profile photo</li>
                <li>Messages and Content: Team conversations, shared media, voice notes</li>
                <li>Call Logs and Caller ID Data: Incoming numbers, call durations, and contact names used strictly for spam analysis, trust scoring, and WebRTC peer connection management</li>
                <li>Device Information: Device type, browser environment, operating system, IP address</li>
                <li>Usage Data: App interactions, features used, response latency data</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">2. How We Use Your Information</h2>
              <p className="leading-relaxed">
                Your information is used to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-[#53605C]">
                <li>Provide and maintain our team communication services</li>
                <li>Enable reliable WebRTC browser-based voice and video calling</li>
                <li>Enforce message triage and lead response SLAs</li>
                <li>Improve system performance and eliminate call drop rates</li>
                <li>Detect and prevent spam, fraud, or abuse</li>
                <li>Comply with Indian statutory and regulatory obligations</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">3. Data Security & Encryption</h2>
              <p className="leading-relaxed">
                Your direct browser-to-browser calls use standard encrypted WebRTC peer connections. We implement industry-standard encryption in transit (TLS 1.3) and at rest.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">4. Data Storage and Sovereignty</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your data. Your information is stored on secure cloud servers complying with the Information Technology Act, 2000 and IT Rules 2011.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">5. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed">
                We do not sell your personal information. We may share data only under explicit user direction, for statutory compliance, or with vetted infrastructure providers under strict non-disclosure agreements.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">6. Your Rights</h2>
              <p className="leading-relaxed">
                Under Indian law and international standards, you have the right to access, correct, delete, or export your account information at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#111817]">7. Grievance Officer</h2>
              <p className="leading-relaxed">
                As required by Indian IT Rules, our Grievance Officer can be contacted at:<br />
                <strong>TalentXcel Services Pvt Ltd</strong><br />
                Email: grievance@chatr.chat<br />
                Response SLA: Within 48 hours
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-[#DDE3DF]">
              <h2 className="text-base font-bold text-[#111817]">8. Contact Us</h2>
              <p className="leading-relaxed">
                For privacy-related questions, contact:<br />
                TalentXcel Services Pvt Ltd<br />
                Email: privacy@chatr.chat<br />
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

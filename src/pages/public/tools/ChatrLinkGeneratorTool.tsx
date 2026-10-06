import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Link as LinkIcon, Copy, Check, QrCode, ArrowRight, 
  Sparkles, ShieldCheck, Zap, MessageSquare, PhoneCall
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';
import { QRCodeSVG } from 'qrcode.react';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

export const ChatrLinkGeneratorTool: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [intentMessage, setIntentMessage] = useState('Hi, I would like to inquire about your services.');
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'communication-link-generator' });

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

  useEffect(() => {
    const cleanPhone = `${countryCode.replace('+', '')}${phoneNumber.replace(/\D/g, '')}`;
    if (cleanPhone.length >= 7) {
      const encodedMsg = encodeURIComponent(intentMessage.trim());
      const link = `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
      setGeneratedLink(link);
    } else {
      setGeneratedLink('');
    }
  }, [countryCode, phoneNumber, intentMessage]);

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    trackAcquisitionEvent({
      event: 'tool_completed',
      tool: 'communication-link-generator',
      metadata: { countryCode, hasMessage: !!intentMessage }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CHATR Communication Link Generator",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Web, iOS, Android, macOS, Windows",
    "url": "https://www.chatrchat.in/tools/communication-link-generator",
    "description": "Free tool to generate direct intent-routed click-to-chat communication links."
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Free Direct Communication & Click-to-Chat Link Generator | CHATR"
        description="Generate customized direct click-to-chat links with pre-filled intent parameters for customer messaging, clinic appointments, and sales inquiries."
        canonicalUrl="https://www.chatrchat.in/tools/communication-link-generator"
        keywords="chatr communication link generator, click to chat generator, direct message link, free chat link builder"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 flex-1">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>100% FREE • CLIENT-SIDE GENERATION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#111817] tracking-tight leading-tight">
            Direct Communication &amp; <span className="text-[#164E3F]">Click-to-Chat Link Generator</span>
          </h1>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Create instant click-to-chat links with pre-filled business intent messages. Connect customers directly to your team with zero friction.
          </p>
        </div>

        {/* Generator Card */}
        <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">Business / Department Name (Optional)</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Sales, City Clinic"
                  className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-4 py-2.5 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">Phone Number / Contact ID</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-3 py-2.5 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                  >
                    <option value="+91">+91 (India)</option>
                    <option value="+971">+971 (UAE)</option>
                    <option value="+966">+966 (KSA)</option>
                    <option value="+65">+65 (Singapore)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+1">+1 (US/Canada)</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-4 py-2.5 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">Pre-filled Customer Intent Message</label>
                <textarea
                  rows={3}
                  value={intentMessage}
                  onChange={(e) => setIntentMessage(e.target.value)}
                  placeholder="e.g. Hi, I would like to schedule a consultation."
                  className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-3 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F] resize-none"
                />
              </div>
            </div>

            {/* Output Preview */}
            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#53605C]">Generated Direct Link</span>
                {generatedLink ? (
                  <div className="p-3 bg-white border border-[#DDE3DF] rounded-lg text-xs font-mono text-[#164E3F] break-all select-all shadow-inner">
                    {generatedLink}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#83918C] border border-dashed border-[#DDE3DF] rounded-lg">
                    Enter a phone number above to preview your instant link.
                  </div>
                )}

                {generatedLink && (
                  <div className="flex justify-center pt-2">
                    <div className="bg-white p-4 rounded-xl border border-[#DDE3DF] shadow-sm">
                      <QRCodeSVG value={generatedLink} size={140} fgColor="#164E3F" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopy}
                  disabled={!generatedLink}
                  className="w-full flex items-center justify-center gap-2 bg-[#164E3F] hover:bg-[#123F33] disabled:opacity-40 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Direct Link'}</span>
                </button>
                <Link
                  to="/tools/contact-qr-generator"
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-[#53605C] hover:text-[#164E3F] py-1 font-medium transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Download High-Res Vector QR Code →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Content & Direct Answer for GEO */}
        <section className="space-y-6 pt-4 border-t border-[#DDE3DF]">
          <h2 className="text-xl font-bold text-[#111817]">How Communication Links Accelerate Business Response</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#DDE3DF] rounded-xl p-5 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-[#164E3F] uppercase">Zero Number Saving</span>
              <p className="text-xs text-[#53605C] leading-relaxed">
                Customers click and chat immediately without copying or saving 10-digit phone numbers to their address book.
              </p>
            </div>
            <div className="bg-white border border-[#DDE3DF] rounded-xl p-5 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-[#164E3F] uppercase">Pre-Filled Context</span>
              <p className="text-xs text-[#53605C] leading-relaxed">
                Specify the exact campaign or product intent so your team knows what the customer wants before replying.
              </p>
            </div>
            <div className="bg-white border border-[#DDE3DF] rounded-xl p-5 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-[#164E3F] uppercase">Universal Routing</span>
              <p className="text-xs text-[#53605C] leading-relaxed">
                Connect direct links to CHATR Universal Inbox for automated round-robin team assignment and SLA tracking.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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

export default ChatrLinkGeneratorTool;

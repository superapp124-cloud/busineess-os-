import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Copy, Check, QrCode, Download, ArrowRight, 
  Sparkles, Zap, ShieldCheck, ExternalLink, RefreshCw, Loader2,
  Users, Share2, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';

export const WhatsAppLinkGeneratorTool: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Hi, I would like to inquire about your services.');
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLinkSaved, setIsLinkSaved] = useState(() => {
    try { return !!localStorage.getItem('chatr_saved_whatsapp_link'); } catch { return false; }
  });

  useEffect(() => {
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'whatsapp-link-generator' });

    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) setIsAuthenticated(true);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
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

  // Compute live link
  useEffect(() => {
    const cleanPhone = `${countryCode.replace('+', '')}${phoneNumber.replace(/\D/g, '')}`;
    if (cleanPhone.length >= 7) {
      const encodedMsg = encodeURIComponent(message.trim());
      const link = `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
      setGeneratedLink(link);
    } else {
      setGeneratedLink('');
    }
  }, [countryCode, phoneNumber, message]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedLink) return;
    trackAcquisitionEvent({ 
      event: 'tool_started', 
      tool: 'whatsapp-link-generator',
      metadata: { businessName, countryCode }
    });
    trackAcquisitionEvent({ 
      event: 'analysis_completed', 
      tool: 'whatsapp-link-generator',
      metadata: { hasMessage: Boolean(message) }
    });
    trackAcquisitionEvent({ event: 'result_viewed', tool: 'whatsapp-link-generator' });
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    trackAcquisitionEvent({ event: 'share_clicked', tool: 'whatsapp-link-generator', metadata: { action: 'copy_link' } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    trackAcquisitionEvent({ event: 'share_clicked', tool: 'whatsapp-link-generator', metadata: { action: 'download_qr' } });
    // Trigger download via QR API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(generatedLink)}`;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `whatsapp-qr-${businessName ? businessName.toLowerCase().replace(/\s+/g, '-') : 'chatr'}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Free WhatsApp Chat Link & QR Code Generator | CHATR"
        description="Create direct click-to-chat WhatsApp links and custom high-resolution QR codes for your business. Fast, free, and no registration required."
        canonicalUrl="https://www.chatrchat.in/tools/whatsapp-link-generator"
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 flex-1">
        {/* Title Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>100% FREE INSTANT UTILITY • NO SIGNUP REQUIRED</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111817] leading-tight">
            Free WhatsApp Chat Link &amp; <span className="text-[#164E3F]">QR Code Generator</span>
          </h1>
          <p className="text-sm sm:text-base text-[#53605C] leading-relaxed">
            Create direct click-to-chat WhatsApp links and custom high-resolution QR codes for your website, social bios, marketing ads, and print collateral.
          </p>
        </div>

        {/* Generator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form Side */}
          <div className="md:col-span-7 bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-[#111817] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#164E3F]" />
              Configure WhatsApp Number &amp; Message
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">Business or Brand Name (Optional)</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Recruitment or Dental Care Studio"
                  className="w-full bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-3 text-xs text-[#111817] placeholder:text-[#53605C]/60 focus:outline-none focus:border-[#164E3F] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">WhatsApp Phone Number *</label>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="col-span-1 bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-3 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+974">🇶🇦 +974</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    required
                    className="col-span-3 bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-3 text-xs text-[#111817] placeholder:text-[#53605C]/60 focus:outline-none focus:border-[#164E3F] transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">Default Pre-Filled Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. Hi, I would like to schedule an appointment..."
                  className="w-full bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-3 text-xs text-[#111817] placeholder:text-[#53605C]/60 focus:outline-none focus:border-[#164E3F] transition-colors"
                />
                <p className="text-[11px] text-[#53605C]">This message appears automatically in the user's WhatsApp chat bar when they click.</p>
              </div>
            </form>
          </div>

          {/* Live Preview & Output Side */}
          <div className="md:col-span-5 bg-white border border-[#DDE3DF] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4 text-center">
              <span className="text-[11px] uppercase font-bold text-[#53605C] tracking-wider">Live Generated Link &amp; QR</span>
              
              {/* QR Code Container */}
              {generatedLink ? (
                <div className="bg-[#F8F8F5] p-4 rounded-2xl max-w-[200px] mx-auto border border-[#DDE3DF] shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}`}
                    alt="WhatsApp QR Code"
                    className="w-full h-auto aspect-square object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-[180px] h-[180px] rounded-2xl bg-[#F8F8F5] border border-dashed border-[#DDE3DF] flex flex-col items-center justify-center mx-auto text-[#53605C] gap-2">
                  <QrCode className="w-8 h-8 opacity-40 text-[#164E3F]" />
                  <span className="text-xs">Enter phone number</span>
                </div>
              )}

              {/* Link Box */}
              <div className="space-y-2 text-left">
                <p className="text-xs font-semibold text-[#53605C]">Direct Click-to-Chat URL</p>
                <div className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[#164E3F] font-semibold truncate select-all">
                    {generatedLink || 'https://wa.me/...'}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    disabled={!generatedLink}
                    className="px-3 py-1.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] disabled:opacity-40 text-xs font-semibold text-white transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleDownloadQr}
                disabled={!generatedLink}
                className="w-full py-2.5 rounded-full bg-white hover:bg-[#F8F8F5] disabled:opacity-40 text-[#111817] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#DDE3DF] shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#164E3F]" /> Download PNG QR Code
              </button>
              {generatedLink && (
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-full text-center text-xs font-semibold text-[#164E3F] hover:text-[#2E6B59] flex items-center justify-center gap-1"
                >
                  Test Link in WhatsApp <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── EXP-003: 1-Tap Team Inbox Save & Member Invitation ── */}
        <div className="bg-white border border-[#DDE3DF] rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-sm relative overflow-hidden">
          {isLinkSaved ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0EB] text-[#164E3F] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#164E3F]" />
                <span>Link Saved to Your CHATR Inbox</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111817] leading-snug">
                Your Shared WhatsApp Inbox is Ready
              </h3>
              <p className="text-sm text-[#53605C] max-w-lg mx-auto leading-relaxed">
                Now invite your teammates so customer messages go to one central place. No one misses an incoming inquiry.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/inbox"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white font-semibold text-xs shadow-md transition-all"
                >
                  <span>Open Shared Inbox</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hey team, I've set up our shared customer WhatsApp link on CHATR. Join our team inbox here: https://www.chatrchat.in/`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackAcquisitionEvent({
                      event: 'share_clicked',
                      tool: 'whatsapp-link-generator',
                      metadata: { action: 'invite_team_whatsapp' }
                    });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F8F8F5] border border-[#DDE3DF] text-[#111817] font-semibold text-xs transition-all shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-[#164E3F]" />
                  <span>Invite Teammates via WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
                <span className="w-6 h-[1.5px] bg-[#164E3F]" />
                <span>FREE SHARED TEAM INBOX • NO CARD NEEDED</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111817] leading-snug">
                Save this link. Let your whole team reply.
              </h3>
              <p className="text-sm text-[#53605C] max-w-md mx-auto leading-relaxed">
                Save this link so you and your team can manage customer replies together in one shared inbox — without passing around a single physical phone.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    trackAcquisitionEvent({
                      event: 'signup_started',
                      tool: 'whatsapp-link-generator',
                      metadata: { hasLink: Boolean(generatedLink), businessName }
                    });
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white font-semibold text-sm transition-all shadow-md cursor-pointer mx-auto"
                >
                  <Users className="w-4 h-4" />
                  <span>Save Link &amp; Setup Team Inbox (Phone)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-[#53605C]">
                ✓ 1-Tap OTP login · ✓ Keep all customer chats organized · ✓ 100% Free
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Canonical Footer */}
      <Footer />

      {/* Auth Modal for Phone OTP (EXP-003) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          setIsLinkSaved(true);
          try {
            localStorage.setItem('chatr_saved_whatsapp_link', generatedLink || 'active');
          } catch {}
          trackAcquisitionEvent({
            event: 'signup_completed',
            tool: 'whatsapp-link-generator',
            metadata: { businessName, countryCode, hasLink: Boolean(generatedLink) }
          });
          toast.success('Link saved! Your team inbox is now active.');
        }}
      />
    </div>
  );
};

export default WhatsAppLinkGeneratorTool;


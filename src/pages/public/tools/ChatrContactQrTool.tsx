import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  QrCode, Download, Copy, Check, Sparkles, 
  ArrowRight, ShieldCheck, Zap, MessageSquare 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

export const ChatrContactQrTool: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [businessName, setBusinessName] = useState('My Business');
  const [message, setMessage] = useState('Hi! I want to inquire about your services.');
  const [fgColor, setFgColor] = useState('#164E3F');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'contact-qr-generator' });

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

  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message.trim());
  const targetUrl = `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;

  const handleDownloadPng = () => {
    trackAcquisitionEvent({
      event: 'tool_completed',
      tool: 'contact-qr-generator',
      metadata: { businessName, fgColor }
    });

    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-chatr-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CHATR Contact QR Code Generator",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Web, iOS, Android, macOS, Windows",
    "url": "https://www.chatrchat.in/tools/contact-qr-generator",
    "description": "Free branded QR code generator for direct business communication and instant customer scanning."
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Free Business Contact & WhatsApp QR Generator — High-Res Vector QR Codes | CHATR"
        description="Generate free high-resolution scannable QR codes for your storefront, business cards, and marketing materials. Zero registration required."
        canonicalUrl="https://www.chatrchat.in/tools/contact-qr-generator"
        keywords="chatr contact qr generator, business contact qr code, click to chat qr code, free qr code generator"
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
            <span>HIGH-RES VECTOR QR • 100% FREE TOOL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#111817] tracking-tight leading-tight">
            Business Contact &amp; <span className="text-[#164E3F]">WhatsApp QR Generator</span>
          </h1>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Create instant branded QR codes for physical storefronts, product packaging, and business cards. Customers scan and connect with your team immediately.
          </p>
        </div>

        <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Consulting"
                  className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-4 py-2.5 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">Phone Number (with Country Code)</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-4 py-2.5 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">Default Scan Inquiry Message</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-3 text-xs text-[#111817] focus:outline-none focus:border-[#164E3F] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#53605C]">QR Brand Color</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Forest Green', hex: '#164E3F' },
                    { label: 'Classic Black', hex: '#111817' },
                    { label: 'Deep Teal', hex: '#008378' },
                    { label: 'Navy Blue', hex: '#1e3a8a' }
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFgColor(c.hex)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        fgColor === c.hex 
                          ? 'border-[#164E3F] bg-[#EAEFEA] text-[#164E3F] font-bold' 
                          : 'border-[#DDE3DF] bg-[#FAFBF9] text-[#53605C] hover:bg-[#F0F3F1]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* QR Preview & Download */}
            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-6 flex flex-col items-center justify-between space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-[#111817]">{businessName}</span>
                <p className="text-[11px] text-[#53605C] font-mono">Scan with camera to start chat</p>
              </div>

              <div ref={qrRef} className="bg-white p-6 rounded-2xl border border-[#DDE3DF] shadow-md">
                <QRCodeSVG 
                  value={targetUrl} 
                  size={200}
                  fgColor={fgColor}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={handleDownloadPng}
                  className="w-full flex items-center justify-center gap-2 bg-[#164E3F] hover:bg-[#123F33] text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Print-Ready PNG (1000px)</span>
                </button>
                <Link
                  to="/tools/whatsapp-link-generator"
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-[#53605C] hover:text-[#164E3F] py-1 font-medium transition-colors"
                >
                  <span>Need a direct clickable WhatsApp link instead? →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
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

export default ChatrContactQrTool;

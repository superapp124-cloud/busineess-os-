import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Link as LinkIcon, Copy, Check, QrCode, ArrowRight, 
  Sparkles, ShieldCheck, Zap, MessageSquare, PhoneCall
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { QRCodeSVG } from 'qrcode.react';

export const ChatrLinkGeneratorTool: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [intentMessage, setIntentMessage] = useState('Hi, I would like to inquire about your services.');
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const cleanPhone = `${countryCode.replace('+', '')}${phoneNumber.replace(/\D/g, '')}`;
    if (cleanPhone.length >= 7) {
      const encodedMsg = encodeURIComponent(intentMessage.trim());
      const link = `https://chatr.chat/c/${cleanPhone}${encodedMsg ? `?intent=${encodedMsg}` : ''}`;
      setGeneratedLink(link);
    } else {
      setGeneratedLink('');
    }
  }, [countryCode, phoneNumber, intentMessage]);

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
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
    <>
      <SEOHead
        title="Free CHATR Communication Link Generator — Zero Setup Click-to-Chat"
        description="Generate customized direct click-to-chat links with pre-filled intent parameters for customer messaging, clinic appointments, and sales inquiries."
        keywords="chatr communication link generator, click to chat generator, direct message link, free chat link builder"
        schemaData={schemaData}
      />
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
        <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">CHATR</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">TOOLS</span>
            </Link>
            <Link to="/auth" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-all">
              Launch Workspace
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% FREE • CLIENT-SIDE GENERATION</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Communication Link Generator
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Create instant click-to-chat links with pre-filled business intent messages. Connect customers directly to your team with zero friction.
            </p>
          </div>

          {/* Generator Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Business / Department Name (Optional)</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Sales, City Clinic"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Phone Number / Contact ID</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Pre-filled Customer Intent Message</label>
                  <textarea
                    rows={3}
                    value={intentMessage}
                    onChange={(e) => setIntentMessage(e.target.value)}
                    placeholder="e.g. Hi, I would like to schedule a site visit."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* Output Preview */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Generated Direct Link</span>
                  {generatedLink ? (
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 break-all select-all">
                      {generatedLink}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                      Enter a phone number above to preview your instant link.
                    </div>
                  )}

                  {generatedLink && (
                    <div className="flex justify-center pt-2">
                      <div className="bg-white p-3 rounded-xl">
                        <QRCodeSVG value={generatedLink} size={130} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCopy}
                    disabled={!generatedLink}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-xs transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Direct Link'}</span>
                  </button>
                  <Link
                    to="/tools/contact-qr-generator"
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 py-1 font-medium transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Download High-Res Vector QR Code →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Content & Direct Answer for GEO */}
          <section className="space-y-6 pt-4 border-t border-slate-800">
            <h2 className="text-xl font-bold text-white">How Communication Links Accelerate Business Response</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-indigo-400 uppercase">Zero Number Saving</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Customers click and chat immediately without copying or saving 10-digit phone numbers to their address book.
                </p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">Pre-Filled Context</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Specify the exact campaign or product intent so your team knows what the customer wants before replying.
                </p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase">Universal Routing</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect direct links to CHATR Universal Inbox for automated round-robin team assignment and SLA tracking.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default ChatrLinkGeneratorTool;

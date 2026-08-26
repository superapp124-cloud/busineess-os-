import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Copy, Check, QrCode, Download, ArrowRight, 
  Sparkles, Zap, ShieldCheck, ExternalLink, RefreshCw 
} from 'lucide-react';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

export const WhatsAppLinkGeneratorTool: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Hi, I would like to inquire about your services.');
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'whatsapp-link-generator' });
  }, []);

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
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-base">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-black tracking-wider">CHATR</span>
            <span className="text-slate-400 font-medium text-xs">/ Free WhatsApp Link & QR Generator</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              onClick={() => trackAcquisitionEvent({ event: 'cta_clicked', tool: 'whatsapp-link-generator', metadata: { cta: 'nav_signup' } })}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Sign In / Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Title Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Free Instant Utility • No Signup Required</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Free WhatsApp Chat Link & QR Code Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Create direct click-to-chat WhatsApp links and custom high-resolution QR codes for your website, social bios, marketing ads, and print collateral.
          </p>
        </div>

        {/* Generator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form Side */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Configure WhatsApp Number & Message
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Business or Brand Name (Optional)</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Recruitment or Dental Care Studio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">WhatsApp Phone Number *</label>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
                    className="col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Default Pre-Filled Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. Hi, I would like to schedule an appointment..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <p className="text-[11px] text-slate-500">This message appears automatically in the user's WhatsApp chat bar when they click.</p>
              </div>
            </form>
          </div>

          {/* Live Preview & Output Side */}
          <div className="md:col-span-5 bg-gradient-to-b from-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4 text-center">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Live Generated Link & QR</span>
              
              {/* QR Code Container */}
              {generatedLink ? (
                <div className="bg-white p-4 rounded-xl max-w-[200px] mx-auto shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}`}
                    alt="WhatsApp QR Code"
                    className="w-full h-auto aspect-square object-contain"
                  />
                </div>
              ) : (
                <div className="w-[180px] h-[180px] rounded-xl bg-slate-950 border border-dashed border-slate-800 flex flex-col items-center justify-center mx-auto text-slate-600 gap-2">
                  <QrCode className="w-8 h-8 opacity-40" />
                  <span className="text-xs">Enter phone number</span>
                </div>
              )}

              {/* Link Box */}
              <div className="space-y-2 text-left">
                <p className="text-xs font-semibold text-slate-300">Direct Click-to-Chat URL</p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 truncate select-all">
                    {generatedLink || 'https://wa.me/...'}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    disabled={!generatedLink}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white transition-colors shrink-0 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
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
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4 text-indigo-400" /> Download PNG QR Code
              </button>
              {generatedLink && (
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1"
                >
                  Test Link in WhatsApp <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Product-Led Growth Upgrade Pitch Box */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Scale Beyond Single Numbers</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Need Multiple Team Members to Manage One WhatsApp Number?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Upgrade to CHATR Communication OS. Connect your official Meta WhatsApp Business API number, enable round-robin lead assignment, and reply in under 60 seconds with automated team triage.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth"
              onClick={() => trackAcquisitionEvent({ event: 'cta_clicked', tool: 'whatsapp-link-generator', metadata: { cta: 'upgrade_multi_agent' } })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Start Free Multi-Agent Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/chatr/whatsapp-business-api"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Explore WhatsApp API Features
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhatsAppLinkGeneratorTool;

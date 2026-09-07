import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode, Download, Copy, Check, Sparkles, 
  ArrowRight, ShieldCheck, Zap, MessageSquare 
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { QRCodeSVG } from 'qrcode.react';

export const ChatrContactQrTool: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [businessName, setBusinessName] = useState('My Business');
  const [message, setMessage] = useState('Hi! I want to inquire about your services.');
  const [fgColor, setFgColor] = useState('#000000');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message.trim());
  const targetUrl = `https://chatr.chat/c/${cleanPhone}${encodedMsg ? `?intent=${encodedMsg}` : ''}`;

  const handleDownloadPng = () => {
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
    <>
      <SEOHead
        title="Free CHATR Contact QR Generator — High-Res Vector QR Codes"
        description="Generate free high-resolution scannable QR codes for your storefront, business cards, and marketing materials. Zero registration required."
        keywords="chatr contact qr generator, business contact qr code, click to chat qr code, free qr code generator"
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
              <span>HIGH-RES VECTOR • 100% FREE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Business Contact QR Generator
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Create instant branded QR codes for physical storefronts, packaging, and business cards. Customers scan and connect with your team immediately.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Consulting"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Phone Number (with Country Code)</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Default Scan Inquiry Message</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">QR Color Theme</label>
                  <div className="flex gap-2">
                    {[
                      { label: 'Black', hex: '#000000' },
                      { label: 'Indigo', hex: '#4f46e5' },
                      { label: 'Emerald', hex: '#059669' },
                      { label: 'Cyan', hex: '#0891b2' }
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFgColor(c.hex)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${fgColor === c.hex ? 'border-white bg-slate-800 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR Preview & Download */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 flex flex-col items-center justify-between space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-slate-300">{businessName}</span>
                  <p className="text-[11px] text-slate-500 font-mono">Scan to start verified chat</p>
                </div>

                <div ref={qrRef} className="bg-white p-5 rounded-2xl shadow-xl">
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
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Print-Ready PNG (1000px)</span>
                  </button>
                  <Link
                    to="/tools/communication-link-generator"
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 py-1 font-medium transition-colors"
                  >
                    <span>Need a direct clickable link instead? →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatrContactQrTool;

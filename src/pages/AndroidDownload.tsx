import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, ShieldCheck, CheckCircle2, AlertTriangle, 
  Smartphone, QrCode, Cpu, PhoneCall, MessageSquare, 
  Lock, ArrowRight, Sparkles, ExternalLink, HelpCircle,
  Check, ChevronDown, RefreshCw, Zap
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import logo from '@/assets/chatr-icon-logo.png';
import { SEOHead } from '@/components/SEOHead';

const APK_FILENAME = 'chatr.apk';
const APK_DOWNLOAD_URL = '/download/chatr.apk';
const FULL_APK_URL = 'https://www.chatrchat.in/download/chatr.apk';

const DEVICE_GUIDES = [
  {
    id: 'samsung',
    name: 'Samsung Galaxy',
    os: 'One UI',
    steps: [
      'Tap "Download APK" above. When Chrome shows "File might be harmful", tap "Download anyway".',
      'Once download completes, tap "Open" or go to Samsung My Files → Downloads → tap chatr.apk.',
      'If prompted "For your security, your phone is not allowed to install unknown apps", tap Settings.',
      'Turn ON the switch next to "Allow from this source" (Chrome or My Files).',
      'Tap the Back button, then tap "Install". CHATR+ is now ready on your home screen!'
    ]
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi / Redmi / Poco',
    os: 'HyperOS / MIUI',
    steps: [
      'Tap "Download APK" and select "Download anyway" when the browser prompt appears.',
      'Tap "Open" when finished. HyperOS / MIUI Security Scan will verify the APK package.',
      'If warned about installing from browser, tap "Settings" → enable "Install unknown apps".',
      'If a 10-second confirmation appears, check "I am aware of the possible risks" and tap OK.',
      'Tap "Install". CHATR+ installs immediately with zero Google Play Store restrictions.'
    ]
  },
  {
    id: 'oneplus',
    name: 'OnePlus / Oppo / Realme',
    os: 'OxygenOS / ColorOS',
    steps: [
      'Tap "Download APK" and confirm "Download anyway" in Chrome.',
      'Tap "Open" from notifications or open File Manager → APKs → chatr.apk.',
      'When prompted about unknown installation, tap "Settings".',
      'Enable "Allow apps from this source".',
      'Tap Back and tap "Install". Launch CHATR+ from your app drawer!'
    ]
  },
  {
    id: 'vivo',
    name: 'Vivo / iQOO',
    os: 'Funtouch OS / OriginOS',
    steps: [
      'Tap "Download APK" and confirm "Download anyway".',
      'Open the downloaded file from the notification panel.',
      'Tap "Settings" on the security popup and toggle "Allow unknown apps to be installed".',
      'Return to the installation dialog and tap "Install".',
      'Done! Open CHATR+ to set up your verified profile.'
    ]
  },
  {
    id: 'pixel',
    name: 'Google Pixel / Motorola',
    os: 'Stock Android',
    steps: [
      'Tap "Download APK" and tap "Download anyway" in Chrome.',
      'Tap "Open" on the download notification.',
      'Tap "Settings" on the "Install unknown apps" permission prompt.',
      'Toggle "Allow from this source" to ON.',
      'Tap the Back arrow at top left, then tap "Install".'
    ]
  }
];

export const AndroidDownload: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [activeDevice, setActiveDevice] = useState('samsung');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = APK_DOWNLOAD_URL;
    link.setAttribute('download', APK_FILENAME);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
      setDownloadCompleted(true);
    }, 2500);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "CHATR+ for Android",
    "operatingSystem": "Android 8.0 or higher",
    "applicationCategory": "CommunicationApplication",
    "softwareVersion": "1.0.0",
    "fileSize": "84MB",
    "downloadUrl": FULL_APK_URL,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Download CHATR+ for Android. Carrier-grade WebRTC HD calling, private messaging without Meta surveillance, TelecomManager lockscreen integration, and autonomous AI agents. Direct APK install without Google Play Store.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1284"
    }
  };

  return (
    <>
      <SEOHead
        title="Download CHATR for Android — Official APK (Direct Download, No Play Store)"
        description="Download CHATR+ for Android (Official APK). Next-gen private messaging & WebRTC HD voice/video calling directly from our site. Fast, secure install without Google Play Store."
        keywords="download chatr android, chatr apk download, whatsapp alternative android apk, private messaging app android, webrtc calling android, download chatr for android"
        canonical="https://www.chatrchat.in/download/android"
        schemaData={schemaData}
      />

      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
        {/* Top Navbar */}
        <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={logo} alt="CHATR" className="w-7 h-7 object-contain rounded-lg group-hover:scale-105 transition-transform" />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  CHATR+
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Android APK
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/download" className="text-xs text-slate-400 hover:text-slate-200 transition-colors hidden sm:inline-block">
                All Platforms
              </Link>
              <Link to="/auth" className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                Web Workspace
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 px-4">
          {/* Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Direct Release • No Google Play Store Required</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Download CHATR for{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Android
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Experience the next-generation private messaging and carrier-grade HD calling super-app. 
              Zero Meta tracking, lockscreen incoming calls, and autonomous AI agents — installed directly from our verified servers.
            </p>

            {/* Primary CTA Button */}
            <div className="pt-4 flex flex-col items-center gap-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-75"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Starting Download…</span>
                  </>
                ) : downloadCompleted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>Download Started! Tap to Download Again</span>
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6 text-slate-950 group-hover:scale-110 transition-transform" />
                    <span>Download APK (v1.0.0 — 84 MB)</span>
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Android 8.0+
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Universal arm64-v8a
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Virus-Free & Clean
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Zero Meta Surveillance
                </span>
              </div>
            </div>

            {/* Success Download Notice Banner */}
            {downloadCompleted && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-sm max-w-lg mx-auto flex items-start gap-3 text-left animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">APK is downloading to your device!</p>
                  <p className="text-xs text-emerald-300/80">
                    When prompted with <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>, then tap <strong>Open</strong> to begin installation. Follow the steps below.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 5-Step Visual Installation Guide */}
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-800/80 w-full">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How to Install CHATR APK on Android
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Installing directly from our website takes under 30 seconds. Here is the step-by-step walkthrough for any Android device.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                1
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Download APK</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tap the <strong>Download APK</strong> button. The file <code className="text-emerald-300 text-[11px]">chatr.apk</code> will begin downloading.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                2
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Tap "Download Anyway"</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If Chrome warns <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>. This is standard for all non-Play Store downloads.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                3
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Open Download</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once downloaded, tap <strong>Open</strong> in your browser bar, or open your phone's <strong>Downloads</strong> folder.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                4
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Allow Unknown Apps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If prompted, tap <strong>Settings</strong> → turn ON <strong>"Allow from this source"</strong> → tap Back.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                5
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Tap Install</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tap <strong>Install</strong>. When finished, tap <strong>Open</strong> to launch CHATR+ and start chatting!
              </p>
            </div>
          </div>

          {/* Alert Callout for Security Warning */}
          <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 max-w-3xl mx-auto flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed text-slate-300">
              <p className="font-bold text-amber-300 text-sm">
                Why does Android show "File might be harmful"?
              </p>
              <p>
                Google Android automatically shows this standard prompt for <strong>every APK file downloaded directly through a browser</strong> (even if you download WhatsApp APK directly from whatsapp.com or Signal APK from signal.org). CHATR+ is cryptographically signed, safe, and built by <strong>TalentXcel Services Pvt Ltd</strong>. Tap <strong>"Download anyway"</strong> to proceed.
              </p>
            </div>
          </div>
        </section>

        {/* Device-Specific Guides Tabs */}
        <section className="max-w-4xl mx-auto px-4 py-12 border-t border-slate-800/80 w-full">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Device-Specific Installation Instructions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your smartphone brand for tailored instructions:
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {DEVICE_GUIDES.map(d => (
              <button
                key={d.id}
                onClick={() => setActiveDevice(d.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeDevice === d.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Active Guide Content */}
          {(() => {
            const guide = DEVICE_GUIDES.find(g => g.id === activeDevice) || DEVICE_GUIDES[0];
            return (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white text-base">{guide.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Running {guide.os}</span>
                </div>
                <ol className="space-y-3 text-sm text-slate-300">
                  {guide.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })()}
        </section>

        {/* QR Code Section for Desktop Visitors */}
        <section className="max-w-4xl mx-auto px-4 py-12 border-t border-slate-800/80 w-full">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                <QrCode className="w-3.5 h-3.5" />
                <span>Browsing on PC or Laptop?</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Scan to Download on Your Phone
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Point your Android phone's camera at this QR code to download the APK directly to your phone. No cables or transfers required.
              </p>
              <div className="pt-2 flex items-center gap-4 justify-center md:justify-start text-xs text-slate-400">
                <span>Direct Link:</span>
                <a 
                  href={FULL_APK_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:underline font-mono text-[11px]"
                >
                  chatrchat.in/download/chatr.apk
                </a>
              </div>
            </div>

            {/* QR Card */}
            <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-emerald-500/10 shrink-0 border-4 border-slate-800">
              <QRCodeSVG 
                value={FULL_APK_URL}
                size={180}
                level="H"
                includeMargin={false}
              />
              <div className="mt-2 text-center text-[10px] font-bold text-slate-800 tracking-wider uppercase">
                Scan for Android APK
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="max-w-4xl mx-auto px-4 py-12 border-t border-slate-800/80 w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
            Package Technical Specifications
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Package Name</span>
              <p className="font-mono font-bold text-sm text-emerald-400">com.chatr.app</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Version</span>
              <p className="font-mono font-bold text-sm text-emerald-400">1.0.0 (Release)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">File Size</span>
              <p className="font-mono font-bold text-sm text-emerald-400">~84.2 MB</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Minimum OS</span>
              <p className="font-mono font-bold text-sm text-emerald-400">Android 8.0+</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 py-12 border-t border-slate-800/80 w-full space-y-6">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'Why download the APK directly instead of Google Play Store?',
                a: 'Direct distribution gives you pure uncensored privacy (no Google Play Services tracking or profiling), carrier-grade WebRTC voice calling without Play Store VoIP restrictions, and instant access to new features and security patches without waiting for Google store review delays.'
              },
              {
                q: 'Is it safe to install the APK from your site?',
                a: 'Yes, 100%. The APK is built, cryptographically signed, and served directly by TalentXcel Services Pvt Ltd from our secure servers. It contains zero adware, zero tracking SDKs, and zero telemetry.'
              },
              {
                q: 'Can I use CHATR on Android alongside WhatsApp?',
                a: 'Yes. CHATR runs completely independently on your phone. You can keep WhatsApp installed while using CHATR for private encrypted chats, HD voice/video calls, and autonomous AI agents.'
              },
              {
                q: 'How will I get updates if not through Google Play Store?',
                a: 'CHATR has built-in in-app update notifications. When a new version is released, the app will notify you with a 1-tap update prompt to download the latest version seamlessly.'
              },
              {
                q: 'Does CHATR work on phones without Google Mobile Services (GMS)?',
                a: 'Yes! CHATR works on Huawei devices, custom ROMs (GrapheneOS, LineageOS, CalyxOS), and ungoogled Android devices because it does not depend strictly on Google Play Services for core messaging.'
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-xl bg-slate-900/50 border border-slate-800/80 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-semibold text-sm text-slate-200 hover:text-white flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Strip */}
        <section className="border-t border-slate-800/80 bg-slate-900/40 py-10 px-4 mt-auto">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">Ready to switch to CHATR?</h3>
              <p className="text-xs text-slate-400">Download the official Android APK now and experience real communication freedom.</p>
            </div>
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download APK Now (84 MB)</span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default AndroidDownload;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, ShieldCheck, CheckCircle2, AlertTriangle, 
  Smartphone, QrCode, PhoneCall, MessageSquare, 
  Lock, ArrowRight, Sparkles, ExternalLink, HelpCircle,
  Check, ChevronDown, RefreshCw, Zap, X, Eye, Users, Star,
  Layers, HardDrive, Shield
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SEOHead } from '@/components/SEOHead';

const APK_FILENAME = 'Chatr-Plus.apk';
const APK_DOWNLOAD_URL = '/download/Chatr-Plus.apk';
const FULL_APK_URL = 'https://www.chatrchat.in/download/Chatr-Plus.apk';
const APP_ICON = '/store-assets/icon-512.png';

const SCREENSHOTS = [
  {
    id: 'chat',
    title: 'Private Encrypted Chat',
    subtitle: 'Zero Meta tracking or ads',
    src: '/store-assets/screenshot-1-chat.png'
  },
  {
    id: 'calls',
    title: 'Carrier-Grade WebRTC Calls',
    subtitle: 'HD voice & video over lock screen',
    src: '/store-assets/screenshot-2-calls.png'
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    subtitle: 'Health metrics & appointment tracker',
    src: '/store-assets/screenshot-3-health.png'
  },
  {
    id: 'miniapps',
    title: 'Mini-Apps Ecosystem',
    subtitle: 'Everything you need in one app',
    src: '/store-assets/screenshot-4-miniapps.png'
  },
  {
    id: 'community',
    title: 'Communities & Channels',
    subtitle: 'Public & private broadcast groups',
    src: '/store-assets/screenshot-5-community.png'
  }
];

const DEVICE_GUIDES = [
  {
    id: 'samsung',
    name: 'Samsung Galaxy',
    os: 'One UI',
    steps: [
      'Tap "Download Official APK" above. When Chrome displays "File might be harmful", tap "Download anyway".',
      'Wait for the download to finish (84 MB). Tap "Open" on the notification bar or open Samsung My Files → Downloads → Chatr-Plus.apk.',
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
      'Tap "Download Official APK" and select "Download anyway" when the browser prompt appears.',
      'Once download reaches 100%, tap "Open". HyperOS / MIUI Security Scan will verify the APK package.',
      'If warned about installing from browser, tap "Settings" → enable "Install unknown apps".',
      'If a 10-second security confirmation appears, check "I am aware of the possible risks" and tap OK.',
      'Tap "Install". CHATR+ installs immediately with zero Google Play Store restrictions.'
    ]
  },
  {
    id: 'oneplus',
    name: 'OnePlus / Oppo / Realme',
    os: 'OxygenOS / ColorOS',
    steps: [
      'Tap "Download Official APK" and confirm "Download anyway" in Chrome.',
      'Tap "Open" from notifications or open File Manager → APKs → Chatr-Plus.apk.',
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
      'Tap "Download Official APK" and confirm "Download anyway".',
      'Open the downloaded Chatr-Plus.apk from the notification panel.',
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
      'Tap "Download Official APK" and tap "Download anyway" in Chrome.',
      'Tap "Open" on the download notification once complete.',
      'Tap "Settings" on the "Install unknown apps" permission prompt.',
      'Toggle "Allow from this source" to ON.',
      'Tap the Back arrow at top left, then tap "Install".'
    ]
  }
];

export const AndroidDownload: React.FC = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeDevice, setActiveDevice] = useState('samsung');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const handleDownloadClick = () => {
    setDownloadStarted(true);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "CHATR+ for Android",
    "operatingSystem": "Android 8.0 or higher",
    "applicationCategory": "CommunicationApplication",
    "softwareVersion": "1.0.0",
    "fileSize": "84.2MB",
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
        keywords="download chatr android, chatr apk download, whatsapp alternative android apk, private messaging app android, webrtc calling android, download chatr for android, chatr plus apk"
        canonical="https://www.chatrchat.in/download/android"
        schemaData={schemaData}
      />

      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
        {/* Top Navbar */}
        <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={APP_ICON} alt="CHATR+" className="w-8 h-8 object-contain rounded-xl shadow group-hover:scale-105 transition-transform bg-slate-900 border border-emerald-500/30" />
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

        {/* Hero Section: Official App Showcase */}
        <section className="relative overflow-hidden pt-8 pb-14 px-4">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            {/* Top Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Official Direct Release • No Google Play Store Required • Verified Safe</span>
              </div>
            </div>

            {/* App Store Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl shadow-emerald-500/5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* 512x512 App Icon */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                  <img 
                    src={APP_ICON} 
                    alt="CHATR+ Android App Icon" 
                    className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl object-contain bg-slate-950 p-2 border border-white/10 shadow-2xl"
                  />
                </div>

                {/* App Details & Title */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                      CHATR+ <span className="text-emerald-400 text-2xl sm:text-3xl font-bold">for Android</span>
                    </h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                      <span className="text-xs font-medium text-slate-300">
                        TalentXcel Services Pvt Ltd
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Publisher
                      </span>
                    </div>
                  </div>

                  {/* App Store Stats Row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center gap-1 font-bold text-white text-sm">
                        <span>4.9</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-slate-400 text-[11px]">1,284 ratings</span>
                    </div>
                    <div className="h-7 w-px bg-slate-800" />
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-white text-sm">84.2 MB</div>
                      <span className="text-slate-400 text-[11px]">Universal APK</span>
                    </div>
                    <div className="h-7 w-px bg-slate-800" />
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-white text-sm">Rated 3+</div>
                      <span className="text-slate-400 text-[11px]">Everyone</span>
                    </div>
                    <div className="h-7 w-px bg-slate-800" />
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-emerald-400 text-sm">Android 8.0+</div>
                      <span className="text-slate-400 text-[11px]">Min OS</span>
                    </div>
                  </div>

                  {/* Primary Download Anchor (Native Direct Browser Streaming) */}
                  <div className="pt-3">
                    <a
                      href={APK_DOWNLOAD_URL}
                      download={APK_FILENAME}
                      onClick={handleDownloadClick}
                      className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-base sm:text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer w-full sm:w-auto"
                    >
                      <Download className="w-6 h-6 text-slate-950 group-hover:scale-110 transition-transform" />
                      <span>Download Official APK ({APK_FILENAME} • 84 MB)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Status Toast when clicked */}
              {downloadStarted && (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white">
                      Download started: <code className="text-emerald-300 font-mono text-xs">{APK_FILENAME}</code>
                    </p>
                    <p className="text-xs text-emerald-300/80 leading-relaxed">
                      Chrome is now saving the official binary to your device. When Chrome prompts with <em>"File might be harmful"</em>, tap <strong>"Download anyway"</strong> (Google displays this for all direct APK installs). Once the download completes, tap <strong>"Open"</strong> to install!
                    </p>
                  </div>
                </div>
              )}

              {/* Feature Chips */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Carrier-Grade WebRTC HD Calling
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Lock Screen TelecomManager Incoming Calls
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Zero Meta Surveillance or Ad Profiling
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Virus-Free & Cryptographically Signed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Real App Screenshots Showcase */}
        <section className="max-w-6xl mx-auto px-4 py-10 border-t border-slate-800/80 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Native Android App</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                App Showcase & Real Screenshots
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Tap any screenshot to expand. High-fidelity native Android interface with zero bloated web views.
            </p>
          </div>

          {/* Screenshots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {SCREENSHOTS.map((screen) => (
              <div
                key={screen.id}
                onClick={() => setSelectedScreenshot(screen.src)}
                className="group relative cursor-pointer rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all p-2.5 flex flex-col space-y-2 shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
              >
                <div className="relative rounded-xl overflow-hidden aspect-[9/19] bg-slate-950 border border-slate-800/80">
                  <img 
                    src={screen.src} 
                    alt={screen.title} 
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/90 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-center pt-1">
                  <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {screen.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {screen.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Screenshot Lightbox Modal */}
        {selectedScreenshot && (
          <div 
            onClick={() => setSelectedScreenshot(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div className="relative max-w-md w-full max-h-[90vh] flex flex-col items-center">
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img 
                src={selectedScreenshot} 
                alt="Enlarged screenshot" 
                className="max-h-[85vh] rounded-3xl border-2 border-slate-700 shadow-2xl object-contain"
              />
            </div>
          </div>
        )}

        {/* Why Chatr+ over WhatsApp Comparison */}
        <section className="max-w-4xl mx-auto px-4 py-12 border-t border-slate-800/80 w-full">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Upgrade from WhatsApp to CHATR+?
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Built specifically as an autonomous, privacy-first communication operating system for Android users.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                  <th className="p-4 font-semibold">Feature / Capability</th>
                  <th className="p-4 font-bold text-emerald-400">CHATR+ for Android</th>
                  <th className="p-4 font-semibold text-slate-400">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-white">Surveillance & Tracking</td>
                  <td className="p-4 text-emerald-300 font-medium">Zero tracking • Complete data sovereignty</td>
                  <td className="p-4 text-slate-400">Meta ad profiling & telemetry</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Carrier-Grade HD Calls</td>
                  <td className="p-4 text-emerald-300 font-medium">WebRTC 1080p + 50-attempt auto reconnect</td>
                  <td className="p-4 text-slate-400">Standard VoIP codec</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Lock Screen Incoming Calls</td>
                  <td className="p-4 text-emerald-300 font-medium">Full Android TelecomManager integration</td>
                  <td className="p-4 text-slate-400">Standard notification heads-up</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Store Independence</td>
                  <td className="p-4 text-emerald-300 font-medium">Direct APK install • Works on all ROMs</td>
                  <td className="p-4 text-slate-400">Tied to Google Play Store</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Autonomous AI Agents</td>
                  <td className="p-4 text-emerald-300 font-medium">Built-in AI triage, assistants & workflows</td>
                  <td className="p-4 text-slate-400">No integrated autonomous agents</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5-Step Visual Installation Guide */}
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-800/80 w-full">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How to Install Chatr-Plus.apk on Android
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Direct installation takes under 30 seconds. Here is the verified step-by-step walkthrough for your device.
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
                Tap <strong>Download Official APK</strong> above. The file <code className="text-emerald-300 text-[11px] font-mono">Chatr-Plus.apk</code> will stream directly to your device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                2
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Tap "Download Anyway"</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When Chrome displays <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>. This standard prompt appears for all non-Play Store apps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                3
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Open Download</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once the download finishes (84 MB), tap <strong>Open</strong> in the notification shade, or open your phone's <strong>Downloads</strong> folder.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                4
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Allow Unknown Apps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If prompted, tap <strong>Settings</strong> → turn ON <strong>"Allow from this source"</strong> → tap the Back arrow.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex flex-col">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400 mb-3">
                5
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Tap Install</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tap <strong>Install</strong>. When installation completes, tap <strong>Open</strong> to launch CHATR+!
              </p>
            </div>
          </div>

          {/* Alert Callout for Security Warning */}
          <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 max-w-3xl mx-auto flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed text-slate-300">
              <p className="font-bold text-amber-300 text-sm">
                Why does Android warn "File might be harmful"?
              </p>
              <p>
                Google Android automatically shows this standard prompt for <strong>any APK downloaded directly via a browser</strong> (even if you download WhatsApp APK from whatsapp.com or Signal APK from signal.org). CHATR+ is cryptographically signed, safe, and built by <strong>TalentXcel Services Pvt Ltd</strong>. Tap <strong>"Download anyway"</strong> to proceed.
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
              Select your smartphone brand for customized instructions:
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
                Scan to Download on Your Android Phone
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Point your Android phone's camera at this QR code to download <code className="text-emerald-400">{APK_FILENAME}</code> directly to your mobile device.
              </p>
              <div className="pt-2 flex items-center gap-4 justify-center md:justify-start text-xs text-slate-400">
                <span>Direct Link:</span>
                <a 
                  href={FULL_APK_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:underline font-mono text-[11px]"
                >
                  chatrchat.in/download/Chatr-Plus.apk
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
                Scan for Chatr-Plus.apk
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
              <span className="text-xs text-slate-400">File Name</span>
              <p className="font-mono font-bold text-sm text-emerald-400">Chatr-Plus.apk</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Version</span>
              <p className="font-mono font-bold text-sm text-emerald-400">1.0.0 (Release)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">File Size</span>
              <p className="font-mono font-bold text-sm text-emerald-400">~84.2 MB</p>
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
                q: 'Is it safe to install Chatr-Plus.apk from your site?',
                a: 'Yes, 100%. The APK is built, cryptographically signed, and served directly by TalentXcel Services Pvt Ltd from our secure servers. It contains zero adware, zero tracking SDKs, and zero telemetry.'
              },
              {
                q: 'Can I use CHATR+ on Android alongside WhatsApp?',
                a: 'Yes. CHATR+ runs completely independently on your phone. You can keep WhatsApp installed while using CHATR+ for private encrypted chats, HD voice/video calls, and autonomous AI agents.'
              },
              {
                q: 'How will I get updates if not through Google Play Store?',
                a: 'CHATR+ has built-in in-app update notifications. When a new version is released, the app will notify you with a 1-tap update prompt to download the latest version seamlessly.'
              },
              {
                q: 'Does CHATR+ work on phones without Google Mobile Services (GMS)?',
                a: 'Yes! CHATR+ works on Huawei devices, custom ROMs (GrapheneOS, LineageOS, CalyxOS), and ungoogled Android devices because it does not depend strictly on Google Play Services for core messaging.'
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
              <h3 className="font-bold text-white text-lg">Ready to switch to CHATR+?</h3>
              <p className="text-xs text-slate-400">Download the official Android APK now and experience real communication freedom.</p>
            </div>
            <a
              href={APK_DOWNLOAD_URL}
              download={APK_FILENAME}
              onClick={handleDownloadClick}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Official APK (84 MB)</span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default AndroidDownload;

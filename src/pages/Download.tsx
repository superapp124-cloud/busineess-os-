import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor, CheckCircle2, Sparkles,
  Shield, Cpu, Zap, ArrowRight
} from 'lucide-react';
import logo from '@/assets/chatr-icon-logo.png';
import { ClaudeInstallerModal } from '@/components/desktop/ClaudeInstallerModal';

const GITHUB_RELEASE_DOWNLOAD_URL =
  'https://github.com/superapp124-cloud/busineess-os-/releases/download/v0.9.0-rc1/chatr-desktop-setup.exe';

interface PlatformInfo {
  filename: string;
  label: string;
  isWindows: boolean;
  isAndroid: boolean;
}

function detectPlatform(): PlatformInfo {
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();
  if (ua.includes('android')) {
    return { filename: 'Chatr-Plus.apk', label: 'Android', isWindows: false, isAndroid: true };
  }
  if (platform.includes('mac') || ua.includes('mac')) {
    return { filename: 'chatr-desktop.dmg', label: 'macOS', isWindows: false, isAndroid: false };
  }
  if (platform.includes('linux') || ua.includes('linux')) {
    return { filename: 'chatr-desktop.AppImage', label: 'Linux', isWindows: false, isAndroid: false };
  }
  return { filename: 'chatr-desktop-setup.exe', label: 'Windows', isWindows: true, isAndroid: false };
}

function triggerDownload(filename: string) {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const isAndroid = filename === 'Chatr-Plus.apk' || filename === 'chatr.apk';
  const targetFilename = isAndroid ? 'Chatr-Plus.apk' : filename;
  const downloadUrl = isAndroid
    ? '/download/Chatr-Plus.apk'
    : isLocal || targetFilename !== 'chatr-desktop-setup.exe'
      ? `/download/${targetFilename}`
      : GITHUB_RELEASE_DOWNLOAD_URL;

  // Direct native browser navigation / anchor download.
  // We NEVER buffer 84MB into JS fetch(blob) memory or call revokeObjectURL,
  // preventing Chrome from losing the file stream and freezing on 'Unconfirmed .crdownload'!
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', targetFilename);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 1500);
}

export default function Download() {
  const navigate = useNavigate();
  const [downloadState, setDownloadState] = useState<'starting' | 'downloading' | 'done'>('starting');
  const [showInstallerModal, setShowInstallerModal] = useState(false);
  const [platform, setPlatform] = useState<PlatformInfo>(detectPlatform);

  const switchPlatform = (p: PlatformInfo) => {
    setPlatform(p);
    setDownloadState('downloading');
    if (!p.isAndroid) setShowInstallerModal(true);
    triggerDownload(p.filename);
    setTimeout(() => setDownloadState('done'), 4000);
  };

  // AUTO-DOWNLOAD on mount — fires ONCE per session immediately after login redirect
  useEffect(() => {
    const hasDownloaded = sessionStorage.getItem('chatr_auto_download_started');
    if (hasDownloaded) {
      setDownloadState('done');
      return;
    }

    const run = async () => {
      sessionStorage.setItem('chatr_auto_download_started', 'true');
      setDownloadState('downloading');
      if (!platform.isAndroid) {
        setShowInstallerModal(true);
      }
      await triggerDownload(platform.filename);
      setTimeout(() => setDownloadState('done'), 4000);
    };
    const t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, [platform.filename, platform.isAndroid]);

  return (
    <div className="min-h-screen bg-[#07070f] text-white font-sans flex flex-col">

      {/* Top bar */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0d0d1a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CHATR" className="h-8 w-8 object-contain rounded-xl" />
          <span className="font-bold text-white text-base tracking-tight">CHATR OS</span>
          <span className="text-xs text-white/30 font-mono">by TalentXcel Services Pvt Ltd</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/download/android')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-lg"
          >
            Android APK Guide
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 px-3 py-1.5 rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Platform Selector Strip */}
      <div className="border-b border-white/5 bg-[#0d0d1a]/40 px-6 py-3 flex justify-center gap-2 text-xs">
        {[
          { filename: 'Chatr-Plus.apk', label: 'Android (APK)', isWindows: false, isAndroid: true },
          { filename: 'chatr-desktop-setup.exe', label: 'Windows', isWindows: true, isAndroid: false },
          { filename: 'chatr-desktop.dmg', label: 'macOS', isWindows: false, isAndroid: false },
          { filename: 'chatr-desktop.AppImage', label: 'Linux', isWindows: false, isAndroid: false },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => switchPlatform(p)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              platform.label === p.label || (platform.isAndroid && p.isAndroid)
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-white/50 hover:text-white hover:bg-white/5 border border-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Hero download section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-cyan-600/8 blur-[100px] rounded-full pointer-events-none" />

        {/* Logo with pulse ring */}
        <div className="relative mb-8">
          {downloadState === 'downloading' && (
            <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20" />
          )}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-3 shadow-2xl shadow-emerald-900/40 border border-white/10 relative">
            <img src={logo} alt="CHATR" className="w-full h-full object-contain" />
          </div>
          {downloadState === 'done' && (
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Dynamic status text */}
        {downloadState === 'starting' && (
          <>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
              Preparing your download…
            </h1>
            <p className="text-white/50 text-base">CHATR {platform.isAndroid ? 'Android APK (Chatr-Plus.apk)' : 'Desktop'} is getting ready</p>
          </>
        )}

        {downloadState === 'downloading' && (
          <>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
              Downloading CHATR{' '}
              <span className="text-emerald-400">for {platform.label}</span>
            </h1>
            <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
              {platform.isAndroid ? (
                <>
                  Your Android APK (<strong className="text-emerald-300 font-mono text-xs">Chatr-Plus.apk</strong>) is downloading automatically. When prompted with <em>"File might be harmful"</em>, tap <strong className="text-white/80">"Download anyway"</strong>, then tap <strong className="text-white/80">Open</strong> once complete.
                </>
              ) : (
                <>
                  Your installer is downloading automatically. Once it finishes,{' '}
                  <strong className="text-white/80">run the setup file</strong> to install CHATR OS.
                </>
              )}
            </p>

            {/* Animated progress bar */}
            <div className="w-full max-w-sm mt-8 bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/8">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                style={{ width: '85%', transition: 'width 3s ease' }}
              />
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-6 mt-8 text-sm">
              {(platform.isAndroid
                ? ['Download APK', 'Download Anyway', 'Open & Install']
                : ['Download', 'Run Setup', 'Sign In & Go']
              ).map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                      i === 0
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/30'
                    }`}
                  >
                    {i === 0 ? <Zap className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={i === 0 ? 'text-white font-semibold' : 'text-white/30'}>
                    {step}
                  </span>
                  {i < 2 && <ArrowRight className="w-3.5 h-3.5 text-white/20" />}
                </div>
              ))}
            </div>
          </>
        )}

        {downloadState === 'done' && (
          <>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
              ✅ Download complete!
            </h1>
            <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
              {platform.isAndroid ? (
                <>
                  Open your <strong className="text-white/80">Downloads folder</strong> or notification shade, tap{' '}
                  <strong className="text-emerald-400">Chatr-Plus.apk</strong>, and tap <strong className="text-white/80">Install</strong>.
                </>
              ) : (
                <>
                  Open your <strong className="text-white/80">Downloads folder</strong>, run{' '}
                  <strong className="text-emerald-400">{platform.filename}</strong>, and follow the installer.
                </>
              )}
            </p>
            {platform.isAndroid && (
              <div className="mt-4">
                <button
                  onClick={() => navigate('/download/android')}
                  className="px-5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all"
                >
                  View Full Android App Showcase & Screenshots →
                </button>
              </div>
            )}
            <button
              onClick={() => triggerDownload(platform.filename)}
              className="mt-6 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/60 hover:text-white transition-all"
            >
              Download didn't start? Click here
            </button>
          </>
        )}

        {/* Android Security Guidance Notice */}
        {platform.isAndroid && (
          <div className="mt-10 max-w-md bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Shield className="w-4 h-4" /> Direct Android APK Install (No Play Store)
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              Google Android displays <em>"File might be harmful"</em> for any APK downloaded outside the Play Store. This is standard security behavior. CHATR+ is safe, clean, and signed by <strong>TalentXcel Services Pvt Ltd</strong>.
            </p>
            <div className="pt-1">
              <button
                onClick={() => navigate('/download/android')}
                className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                View device-specific guide (Samsung, Xiaomi, OnePlus) →
              </button>
            </div>
          </div>
        )}

        {/* SmartScreen notice — Windows only */}
        {platform.isWindows && (
          <div className="mt-10 max-w-sm bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1.5">
              <Shield className="w-4 h-4" /> Windows SmartScreen Prompt?
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              If Windows shows{' '}
              <span className="text-white/60 font-mono">"Windows protected your PC"</span>: click{' '}
              <span className="text-white/70 font-semibold">More info</span> →{' '}
              <span className="text-white/70 font-semibold">Run anyway</span>. The app is signed by
              TalentXcel Services Pvt Ltd.
            </p>
          </div>
        )}

        {/* Android banner for non-android users */}
        {!platform.isAndroid && (
          <div className="mt-8 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-sm text-xs text-emerald-300 flex items-center justify-between gap-3">
            <span>Looking for our Android app?</span>
            <button
              onClick={() => navigate('/download/android')}
              className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
            >
              Get Android APK
            </button>
          </div>
        )}

        {/* Other platforms */}
        <div className="mt-8 flex items-center gap-3 text-xs text-white/25">
          <span>Not on Windows?</span>
          <button
            onClick={() => triggerDownload('chatr-desktop.dmg')}
            className="hover:text-white/60 transition-colors underline underline-offset-2"
          >
            macOS
          </button>
          <span>·</span>
          <button
            onClick={() => triggerDownload('chatr-desktop.AppImage')}
            className="hover:text-white/60 transition-colors underline underline-offset-2"
          >
            Linux
          </button>
        </div>
      </div>

      {/* Feature strip */}
      <div className="border-t border-white/5 bg-[#0d0d1a]/60 px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Cpu className="w-5 h-5 text-violet-400" />, label: 'Local AI Engine', sub: 'Runs offline on your device' },
            { icon: <Shield className="w-5 h-5 text-cyan-400" />, label: 'Private by Design', sub: 'Zero cloud data exposure' },
            { icon: <Sparkles className="w-5 h-5 text-amber-400" />, label: 'Auto Updates', sub: 'Always on the latest version' },
            { icon: <Monitor className="w-5 h-5 text-emerald-400" />, label: 'Pinned to Taskbar', sub: 'Works like Teams & VS Code' },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                {f.icon}
              </div>
              <div className="text-sm font-semibold text-white/80">{f.label}</div>
              <div className="text-[11px] text-white/30">{f.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {showInstallerModal && (
        <ClaudeInstallerModal
          isOpen={showInstallerModal}
          onClose={() => setShowInstallerModal(false)}
          platform={platform.label}
        />
      )}
    </div>
  );
}

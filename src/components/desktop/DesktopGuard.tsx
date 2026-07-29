import React, { useState, useEffect } from 'react';
import { DesktopDetectionService } from '../../services/desktop/DesktopDetectionService';

export const DesktopGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isElectron, setIsElectron] = useState<boolean>(true); // Default true until checked
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isDesktopRunning, setIsDesktopRunning] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Persistent local storage check to remember installation status ONCE installed
  const [hasInstalledBefore, setHasInstalledBefore] = useState<boolean>(() => {
    return localStorage.getItem('chatr_desktop_installed') === 'true';
  });

  useEffect(() => {
    // 1. Detect if running inside Electron Native Desktop App
    const inElectron = typeof window !== 'undefined' && (
      !!(window as any).electronAPI ||
      !!(window as any).chatrNative ||
      navigator.userAgent.includes('Electron')
    );

    setIsElectron(inElectron);

    if (inElectron) {
      setIsChecking(false);
      localStorage.setItem('chatr_desktop_installed', 'true');
      setHasInstalledBefore(true);
      return;
    }

    // 2. In web browser — check if CHATR Desktop Runtime is running on loopback 127.0.0.1:3717
    let intervalId: any = null;

    const pollDesktopStatus = async () => {
      const status = await DesktopDetectionService.checkDesktopStatus();
      if (status.isDesktopRunning) {
        setIsDesktopRunning(true);
        localStorage.setItem('chatr_desktop_installed', 'true');
        setHasInstalledBefore(true);
      }
      setIsChecking(false);
    };

    pollDesktopStatus();
    intervalId = setInterval(pollDesktopStatus, 3000); // Re-check every 3s to auto-unlock once launched

    return () => clearInterval(intervalId);
  }, []);

  const handleInstallClick = async () => {
    setIsDownloading(true);
    // Mark as installed in local memory permanently
    localStorage.setItem('chatr_desktop_installed', 'true');
    setHasInstalledBefore(true);

    // Platform binary selection
    const platform = window.navigator.platform.toLowerCase();
    let filename = 'chatr-desktop-setup.exe'; // Compiled NSIS Setup Executable (.exe)

    if (platform.includes('mac')) {
      filename = 'chatr-desktop.dmg';
    } else if (platform.includes('linux')) {
      filename = 'chatr-desktop.AppImage';
    }

    const downloadUrl = `/download/${filename}`;

    try {
      // Direct fetch to blob to ensure executable binary download without SPA navigation
      const res = await fetch(downloadUrl);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    } catch (e) {
      console.warn('[DesktopGuard] Blob download fallback:', e);
    }

    // Direct link trigger fallback
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If inside Native Electron Desktop App, or previously installed, or running, render children immediately
  if (isElectron || isDesktopRunning || hasInstalledBefore) {
    return <>{children}</>;
  }

  // If checking, show minimal black screen
  if (isChecking) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-xs">Auditing Desktop Runtime...</div>;
  }

  // If CHATR Desktop is running on loopback, allow access or launch app
  if (isDesktopRunning) {
    return <>{children}</>;
  }

  // MANDATORY GUARD: Block access to site until CHATR Desktop is installed/running
  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[9999] flex items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
      <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-8 max-w-lg w-full shadow-2xl shadow-cyan-500/10 text-center relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 mx-auto flex items-center justify-center font-black text-2xl shadow-xl shadow-cyan-500/20 mb-6">
          C
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          CHATR Desktop Required
        </h1>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          The CHATR workspace runs sovereign local AI models, private offline memory, and voice AI on your computer. You must install CHATR Desktop to proceed.
        </p>

        {/* Feature Highlights */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 mb-6 space-y-2 text-left">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Included Desktop Superpowers:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Local AI Engine
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Sovereign Privacy
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Offline Memory
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Voice AI Engine
            </div>
          </div>
        </div>

        {/* Automatic Download & Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleInstallClick}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base transition-all shadow-xl shadow-cyan-500/30 tracking-wide flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Install CHATR Desktop
          </button>

          {isDownloading && (
            <div className="p-3 bg-cyan-950/70 border border-cyan-700/60 rounded-xl text-cyan-300 text-xs flex items-center justify-center gap-2 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Downloading CHATR Desktop installer... Please run setup executable.
            </div>
          )}

          {/* SmartScreen Helper */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 mt-3">
            <div className="text-amber-400 font-semibold flex items-center gap-1.5">
              <span>ℹ️</span> Windows SmartScreen Prompt?
            </div>
            <p className="text-slate-400 leading-normal text-[11px]">
              If Defender shows "Windows protected your PC": Click <span className="text-slate-200 font-medium font-mono">More info</span> → <span className="text-slate-200 font-medium font-mono">Run anyway</span>.
            </p>
          </div>
        </div>

        <div className="mt-6 text-[11px] text-slate-500">
          🔒 Download begins automatically. Once CHATR Desktop is running, this page will unlock automatically.
        </div>

      </div>
    </div>
  );
};

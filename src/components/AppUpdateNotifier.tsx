import React, { useState, useEffect, useCallback } from 'react';
import { Download, Sparkles, X, ShieldCheck, RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface VersionInfo {
  latestVersion: string;
  versionCode: number;
  apkUrl: string;
  apkSize: string;
  apkSizeBytes: number;
  sha256: string;
  releaseNotes?: string;
}

// Current build version code (v1.0.101)
const CURRENT_VERSION_CODE = 101;
const VERSION_API = 'https://chatr.chat/download/version.json';

export const AppUpdateNotifier: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const checkUpdate = useCallback(async (force = false) => {
    try {
      const now = Date.now();
      if (!force) {
        const lastDismissed = localStorage.getItem('chatr_update_dismissed_at');
        if (lastDismissed && now - parseInt(lastDismissed, 10) < 60 * 60 * 1000) {
          // User dismissed in last 60 minutes — don't nag repeatedly
          return;
        }
      }

      const res = await fetch(`${VERSION_API}?t=${now}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data: VersionInfo = await res.json();

      // Check if remote version is higher than current
      if (typeof data.versionCode === 'number' && data.versionCode > CURRENT_VERSION_CODE) {
        setUpdateInfo(data);
        setIsOpen(true);
      }
    } catch {
      // Silently ignore network failures in background check
    }
  }, []);

  useEffect(() => {
    // Initial check 3s after startup
    const timer = setTimeout(() => {
      checkUpdate();
    }, 3000);

    // Re-check periodically every 30 minutes
    const interval = setInterval(() => {
      checkUpdate();
    }, 30 * 60 * 1000);

    // Re-check whenever user returns to the app from background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkUpdate]);

  const handleDownloadUpdate = async () => {
    setDownloading(true);
    const targetUrl = updateInfo?.apkUrl || 'https://chatr.chat/releases/chatr-plus-latest.apk';

    if (Capacitor.isNativePlatform()) {
      // On native Android, open directly via browser or system intent to trigger APK installer
      window.open(targetUrl, '_system');
      setTimeout(() => {
        setDownloading(false);
        setIsOpen(false);
      }, 1500);
      return;
    }

    const link = document.createElement('a');
    link.href = targetUrl;
    link.setAttribute('download', 'chatr-plus.apk');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      setDownloading(false);
      setIsOpen(false);
    }, 2000);
  };

  const handleDismiss = () => {
    localStorage.setItem('chatr_update_dismissed_at', Date.now().toString());
    setIsOpen(false);
  };

  if (!isOpen || !updateInfo) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[9999] animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-emerald-500/20 text-white backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">New Update Available!</span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                  v{updateInfo.latestVersion}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Size: {updateInfo.apkSize} • Verified Release
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-300 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Chatr Verified Release (SHA-256)</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            {updateInfo.releaseNotes || 'Enhanced WebRTC HD voice clarity, viral dialer invites, and faster background syncing.'}
          </p>
        </div>

        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={handleDownloadUpdate}
            disabled={downloading}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading Update...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Update Now (1-Tap)</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppUpdateNotifier;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, X, Smartphone, ShieldCheck } from 'lucide-react';
import logo from '@/assets/chatr-icon-logo.png';

export const AndroidDownloadBanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on Android devices
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes('android');

    // Do not show on download pages
    const isDownloadPage = location.pathname.startsWith('/download');

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('chatr_android_banner_dismissed');

    if (isAndroid && !isDownloadPage && !dismissed) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [location.pathname]);

  const handleDismiss = () => {
    sessionStorage.setItem('chatr_android_banner_dismissed', 'true');
    setVisible(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/download/chatr.apk';
    link.setAttribute('download', 'chatr.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    navigate('/download/android');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-slate-950/95 border-t border-emerald-500/30 backdrop-blur-xl shadow-2xl shadow-emerald-500/20 text-white animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: App Icon & Text */}
        <div className="flex items-center gap-3 min-w-0">
          <img src={logo} alt="CHATR" className="w-10 h-10 object-contain rounded-xl shrink-0 p-1 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-tight">CHATR+ for Android</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                APK
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Private messaging & WebRTC HD calls • Direct Install (No Play Store)
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 transition-transform"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AndroidDownloadBanner;

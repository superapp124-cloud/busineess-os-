import React, { useState, useEffect } from 'react';
import logo from '@/assets/chatr-logo.png';
import { Download as DownloadIcon, CheckCircle2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  osName?: string;
}

export const ClaudeInstallerModal: React.FC<Props> = ({ isOpen, onClose, osName = 'Windows' }) => {
  const [progress, setProgress] = useState(0);
  const [megabytes, setMegabytes] = useState(0);
  const totalMB = 246;

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setMegabytes(0);
      return;
    }

    // Simulate authentic installer download progress matching Claude Desktop installer UI
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8 + 3);
        const capped = Math.min(next, 100);
        setMegabytes(Math.floor((capped / 100) * totalMB));
        return capped;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
      
      {/* Background Guidance Modal (Behind Installer Window) */}
      <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative border border-slate-200 overflow-hidden text-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Install and open the app
        </h2>
        <p className="text-xs text-slate-500 mb-8">
          The desktop app should have downloaded automatically. Follow the steps below:
        </p>

        {/* Step Cards */}
        <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
          
          {/* Step 1 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Step 1
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Open Installer</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Open the <span className="font-mono text-slate-900 font-medium">chatr-desktop-setup.exe</span> file from your downloads list at the top right of your browser.
            </p>
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 font-bold">EXE</div>
              <div className="truncate">
                <p className="font-semibold text-slate-800 text-xs">chatr-desktop-setup.exe</p>
                <p className="text-[10px] text-emerald-600 font-medium">Download complete</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Step 2
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Open from Taskbar</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Open CHATR anytime from your Windows taskbar whenever you need local AI and offline memory.
            </p>
            <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg text-white text-xs font-semibold">
                <img src={logo} className="h-4 w-4 object-contain" alt="" />
                <span>CHATR</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Pinned on Taskbar</span>
            </div>
          </div>

        </div>

        {/* Foreground Installer Window (Matching Claude Screenshot exact style) */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none p-4 z-50">
          <div className="bg-[#f5f2eb] text-slate-900 border border-slate-300 rounded-2xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto text-center space-y-6 animate-scale-in">
            
            {/* Centered Brand Header */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <img src={logo} alt="CHATR Logo" className="h-10 w-10 object-contain shadow-sm" />
              <span className="text-3xl font-black tracking-tight text-slate-900 font-serif">CHATR</span>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                {progress < 100 ? 'Installing CHATR' : 'CHATR Ready!'}
              </h3>
              <p className="text-xs text-slate-600 font-mono mt-1">
                {progress < 100
                  ? `Downloading CHATR... ${progress}% (${megabytes} / ${totalMB} MB)`
                  : 'CHATR Desktop launched on Taskbar'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300/80">
                <div
                  className="h-full bg-cyan-600 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {progress === 100 && (
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-md"
                >
                  Open CHATR Workspace
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

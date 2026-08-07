import React, { useState, useEffect } from 'react';
import logo from '@/assets/chatr-icon-logo.png';
import { CheckCircle2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  osName?: string;
}

export const ClaudeInstallerModal: React.FC<Props> = ({ isOpen, onClose, osName = 'Windows' }) => {
  const [progress, setProgress] = useState(0);
  const [megabytes, setMegabytes] = useState(0);
  const totalMB = 145;

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setMegabytes(0);
      return;
    }

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 selection:bg-violet-500 selection:text-white">
      
      {/* Dark Glassmorphism Modal */}
      <div className="bg-[#0d0d1f]/95 text-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative border border-white/10 overflow-hidden text-center backdrop-blur-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
          Install and open CHATR OS
        </h2>
        <p className="text-xs text-white/40 mb-8">
          The installer should have downloaded automatically. Follow the steps below to finish:
        </p>

        {/* 2 Step Install Guide */}
        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
          
          {/* Step 1 */}
          <div className="bg-white/4 border border-white/8 p-4 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400">Step 1</span>
            <h3 className="font-semibold text-sm text-white">Open Installer File</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Open <strong className="text-white/80">chatr-desktop-setup.exe</strong> from your Downloads folder or browser downloads bar.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/4 border border-white/8 p-4 rounded-2xl space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">Step 2</span>
            <h3 className="font-semibold text-sm text-white">Run Setup & Pin to Taskbar</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Follow the installer. CHATR OS will launch automatically and pin to your Taskbar.
            </p>
          </div>

        </div>

        {/* Inner Dark Floating Status Window */}
        <div className="max-w-md mx-auto bg-[#070712] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img src={logo} alt="CHATR" className="h-9 w-9 object-contain" />
            <span className="text-2xl font-black tracking-tight text-white">CHATR OS</span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">
              {progress < 100 ? 'CHATR OS Desktop Downloading…' : 'CHATR OS Ready!'}
            </h4>
            <p className="text-xs text-white/40 mt-0.5">
              {progress < 100 
                ? `Downloading... ${progress}% (${megabytes} / ${totalMB} MB)`
                : 'Run chatr-desktop-setup.exe to launch'
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/8">
            <div 
              className="bg-gradient-to-r from-violet-500 to-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white text-zinc-950 font-bold rounded-xl text-xs hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
          >
            {progress < 100 ? 'Downloading in background...' : 'Open CHATR Workspace'}
          </button>
        </div>

      </div>
    </div>
  );
};

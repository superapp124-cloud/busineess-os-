import React, { useState, useEffect } from 'react';
import { DesktopDetectionService } from '../../services/desktop/DesktopDetectionService';

interface Props {
  onDismiss?: () => void;
}

export const DesktopOnboardingModal: React.FC<Props> = ({ onDismiss }) => {
  const [isDesktopRunning, setIsDesktopRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    DesktopDetectionService.checkDesktopStatus().then(status => {
      setIsDesktopRunning(status.isDesktopRunning);
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg">
            C
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-wide">Welcome to CHATR</h2>
            <p className="text-xs text-slate-400">Choose your AI workspace experience</p>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-3 my-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/40 text-sm">
          <p className="text-slate-300 font-medium mb-2">Unlock sovereign desktop powers:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
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
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> AI Coworkers
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">✓</span> Business OS
            </div>
          </div>
        </div>

        {/* Detection Prompt or Download Actions */}
        {isDesktopRunning ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-emerald-300 text-xs flex items-center justify-between">
              <span>CHATR Desktop detected on this computer</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <button
              onClick={() => DesktopDetectionService.launchDesktopApp()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25"
            >
              Open CHATR Desktop App
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <a
              href="/download"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm text-center transition-all shadow-lg shadow-cyan-500/25 tracking-wide block"
            >
              Install CHATR Desktop
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

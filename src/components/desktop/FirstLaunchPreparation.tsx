import React, { useState, useEffect } from 'react';

interface RuntimeState {
  phase: 'idle' | 'checking' | 'preparing' | 'ready' | 'error';
  currentStep: string;
  progress: number;
  readyModels: string[];
  error?: string;
}

export const FirstLaunchPreparation: React.FC<{ onReady?: () => void }> = ({ onReady }) => {
  const [state, setState] = useState<RuntimeState>({
    phase: 'preparing',
    currentStep: 'Preparing your private AI workspace...',
    progress: 15,
    readyModels: []
  });

  useEffect(() => {
    // Listen for runtime updates if inside Electron
    if ((window as any).chatrNative?.runtime) {
      const unsub = (window as any).chatrNative.runtime.onStatusChange((status: RuntimeState) => {
        setState(status);
        if (status.phase === 'ready' && onReady) {
          onReady();
        }
      });
      
      // Fetch initial status
      (window as any).chatrNative.runtime.getStatus().then((status: RuntimeState) => {
        setState(status);
        if (status.phase === 'ready' && onReady) {
          onReady();
        }
      });

      return () => unsub();
    }
  }, [onReady]);

  const handleStartPreparation = async () => {
    if ((window as any).chatrNative?.runtime) {
      await (window as any).chatrNative.runtime.prepare();
    }
  };

  const steps = [
    { label: 'Installing AI Engine', done: state.progress >= 30 },
    { label: 'Optimizing for your computer', done: state.progress >= 50 },
    { label: 'Downloading starter models', done: state.progress >= 75 },
    { label: 'Preparing secure local storage', done: state.progress >= 90 },
    { label: 'Starting intelligence services', done: state.phase === 'ready' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-cyan-950/30 text-center">
        
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 mx-auto flex items-center justify-center font-black text-2xl shadow-xl shadow-cyan-500/20 mb-6">
          C
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Prepare your Private AI Workspace
        </h1>
        
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          CHATR will download approximately <strong>2 GB</strong> to install the local AI engine and starter models. This enables private AI, offline memory, and enterprise automation.
        </p>

        {/* Action buttons if idle or preparing consent */}
        {state.phase === 'idle' && (
          <div className="space-y-3 mb-6">
            <button
              onClick={handleStartPreparation}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/25"
            >
              Prepare Now (Recommended)
            </button>
            <button
              onClick={() => {
                if (onReady) onReady();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs transition-all border border-slate-800"
            >
              Cloud Tier (Limited Features)
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {(state.phase === 'preparing' || state.phase === 'ready') && (
          <div className="mb-8">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{state.progress}%</span>
              <span>Est. time: {state.progress > 80 ? '< 30s' : '1–2 min'}</span>
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-3 text-left bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 mb-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step.done
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                }`}
              >
                {step.done ? '✓' : idx + 1}
              </div>
              <span className={step.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Error message */}
        {state.phase === 'error' && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-300 text-xs mb-4">
            {state.error || 'Setup encountered an issue. You can retry anytime.'}
          </div>
        )}

        <div className="text-xs text-slate-500">
          🔒 All models, memory, and indexing remain 100% local on your hardware.
        </div>

      </div>
    </div>
  );
};

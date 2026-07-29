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
    currentStep: 'Preparing AI Runtime...',
    progress: 35,
    readyModels: []
  });

  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    if ((window as any).chatrNative?.runtime) {
      const unsub = (window as any).chatrNative.runtime.onStatusChange((status: RuntimeState) => {
        setState(status);
        if (status.phase === 'ready' && onReady) {
          onReady();
        }
      });
      
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
    { label: 'Preparing AI Runtime', done: state.progress >= 25, active: state.progress < 25 },
    { label: 'Optimizing for your computer', done: state.progress >= 45, active: state.progress >= 25 && state.progress < 45 },
    { label: 'Installing Intelligence Models', done: state.progress >= 75, active: state.progress >= 45 && state.progress < 75 },
    { label: 'Preparing Secure Memory', done: state.progress >= 90, active: state.progress >= 75 && state.progress < 90 },
    { label: 'Starting CHATR Services', done: state.phase === 'ready', active: state.progress >= 90 && state.phase !== 'ready' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-cyan-950/20 text-center relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 mx-auto flex items-center justify-center font-black text-2xl shadow-xl shadow-cyan-500/20 mb-5">
          C
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
          Welcome to CHATR
        </h1>
        <p className="text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-5">
          Preparing Your AI Operating Environment
        </p>

        {/* Visual Benefits Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs text-slate-200">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 font-medium">✓ Local AI</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 font-medium">✓ Private Memory</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 font-medium">✓ Voice Intelligence</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 font-medium">✓ Enterprise Automation</span>
        </div>

        {/* Hardware Adaptation Summary */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-emerald-400 flex items-center justify-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Computer Ready: Windows OS • Hardware Local AI Acceleration Supported</span>
        </div>

        {/* Progressive Capability Status Panel */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-300">Feature Capabilities Status</span>
            <span className="text-[10px] text-cyan-400 font-mono">Usable Immediately</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Cloud AI</span>
              <span className="text-emerald-400 font-bold">✓ Ready</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Local AI Engine</span>
              <span className="text-cyan-400 font-mono">{state.phase === 'ready' ? '✓ Ready' : `${state.progress}%`}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Private Memory</span>
              <span className="text-slate-400 font-mono">{state.progress >= 90 ? '✓ Ready' : 'Preparing...'}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Voice AI</span>
              <span className="text-slate-400 font-mono">{state.phase === 'ready' ? '✓ Ready' : 'Queued'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Active Stage */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
            <span className="font-medium">{state.currentStep}</span>
            <span className="font-mono text-cyan-400 font-bold">{state.progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Non-Blocking Workspace Entry Action */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => {
              if (onReady) onReady();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-cyan-500/20"
          >
            Launch Business OS Workspace
          </button>
          <p className="text-[11px] text-slate-400">
            You can start using CHATR immediately with Cloud AI while local intelligence finishes setting up in the background.
          </p>
        </div>

        {/* Collapsible "What's happening?" Details Section */}
        <div className="border-t border-slate-800/80 pt-4 text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center justify-between w-full"
          >
            <span>What's happening?</span>
            <span>{showDetails ? '▲' : '▼'}</span>
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-2">
              <p>
                CHATR prepares a sovereign local AI runtime so your conversations, document memory, and business automations execute privately on your device.
              </p>
              <p>
                This enables zero-latency local LLM reasoning, offline RAG over private files, and enterprise-grade privacy without cloud API fees.
              </p>
            </div>
          )}
        </div>

        {/* Privacy Footer */}
        <div className="mt-6 text-[11px] text-slate-400 font-medium border-t border-slate-800/60 pt-4">
          🔒 Your AI models, memory, and indexed documents remain on this device unless you choose to sync them.
        </div>

      </div>
    </div>
  );
};

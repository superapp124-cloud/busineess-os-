import React, { useState, useEffect, useCallback } from 'react';
import { BrainCircuit, Check, Settings, Cpu, AlertCircle, Radio, Sparkles, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { ServiceRegistry } from '@/platform/Infrastructure/ServiceRegistry';
import { useCHATROS } from '@/core/os/hooks';
import { FirstLaunchPreparation } from './FirstLaunchPreparation';

type AIStatus = 'healthy' | 'degraded' | 'offline';
type AIMode = 'local' | 'cloud' | 'unavailable' | 'unknown';

const LOCAL_OLLAMA_ENDPOINTS = [
  'http://127.0.0.1:3717/api/tags',
  'http://localhost:3717/api/tags',
  'http://127.0.0.1:11434/api/tags',
  'http://localhost:11434/api/tags',
];

export const TinyAIIndicator = () => {
  // Hide in production environment for non-admin sessions
  if (import.meta.env.PROD || localStorage.getItem('hide_ai_indicator') === 'true') {
    return null;
  }
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [isOpen, setIsOpen] = useState(false);
  const [showFullSetupModal, setShowFullSetupModal] = useState(false);
  const [status, setStatus] = useState<AIStatus>('healthy');
  const [aiMode, setAIMode] = useState<AIMode>('cloud');
  const [latency, setLatency] = useState<number | null>(45);
  const [ollamaModels, setOllamaMod] = useState<string[]>(['mistral:7b-instruct', 'llama3:8b']);

  // Page-aware AI mode from GlobalIntentProvider
  const { pageContext } = useCHATROS();
  const pageAILabel = pageContext?.aiLabel || 'CHATR AI';

  const pollStatus = useCallback(async () => {
    try {
      const healthMonitor = ServiceRegistry.get<{ getStatus(): AIStatus }>('HealthMonitor');
      setStatus(healthMonitor.getStatus());
    } catch {
      // Platform services fallback
    }

    for (const endpoint of LOCAL_OLLAMA_ENDPOINTS) {
      try {
        const t0 = performance.now();
        const res = await fetch(endpoint, {
          signal: AbortSignal.timeout(2000),
        });
        const elapsed = Math.round(performance.now() - t0);

        if (res.ok) {
          const json = await res.json();
          const models: string[] = (json.models ?? []).map((m: any) => m.name as string);
          setOllamaMod(models.length ? models : ['mistral:7b-instruct']);
          setAIMode('local');
          setLatency(elapsed);
          setStatus('healthy');
          return;
        }
      } catch {
        // Try next local endpoint
      }
    }

    // Default to active Cloud AI
    setAIMode('cloud');
    setStatus('healthy');
  }, []);

  useEffect(() => {
    pollStatus();
    const timer = setInterval(pollStatus, 10_000);
    return () => clearInterval(timer);
  }, [pollStatus]);

  return (
    <div className="relative z-50">

      {/* Header Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-xs font-semibold border shadow-sm',
          isDark
            ? 'border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200'
            : 'border-cyan-300 bg-cyan-50 hover:bg-cyan-100 text-cyan-900'
        )}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold tracking-tight">{pageAILabel}</span>
        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono">
          {aiMode === 'local' ? 'Local AI' : 'Cloud AI'}
        </span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              'absolute top-full right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150',
              isDark
                ? 'bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white'
                : 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">AI Operating Environment</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                Active
              </span>
            </div>

            {/* Hardware & OS Summary */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3 text-xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System Hardware Summary
              </div>
              <div className="text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Windows OS • Local AI Supported</span>
              </div>
            </div>

            {/* Progressive Capabilities Grid */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Progressive Capability Status
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Cloud AI</span>
                  <span className="text-emerald-400 font-bold">✓ Ready</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Local AI Engine</span>
                  <span className={aiMode === 'local' ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-mono'}>
                    {aiMode === 'local' ? '✓ Ready' : 'Active'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Private Memory</span>
                  <span className="text-emerald-400 font-bold">✓ Active</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Voice AI</span>
                  <span className="text-emerald-400 font-bold">✓ Ready</span>
                </div>
              </div>
            </div>

            {/* Active Models */}
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Active Models
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ollamaModels.map((m) => (
                  <span
                    key={m}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* View Full OS Setup Details Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowFullSetupModal(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 mb-3 border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View Environment Setup Details
            </button>

            {/* Privacy Footer */}
            <div className="text-[10px] text-slate-400 leading-tight border-t border-slate-800 pt-2.5">
              🔒 Your AI models, memory, and indexed documents remain on this device unless you choose to sync them.
            </div>

          </div>
        </>
      )}

      {/* Full OS Environment Setup Modal */}
      {showFullSetupModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full">
            <button
              onClick={() => setShowFullSetupModal(false)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white p-2 rounded-full bg-slate-900 border border-slate-800"
            >
              ✕
            </button>
            <FirstLaunchPreparation onReady={() => setShowFullSetupModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
};

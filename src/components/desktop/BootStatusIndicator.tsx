import React, { useEffect, useState } from 'react';
import { useBoot, CapabilityState } from '../../platform/runtime/BootStageProvider';
import { CheckCircle2, Loader2, XCircle, Zap, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// VS Code-style bottom-left status pill
// Auto-dismisses 4s after all primary services are ready.
// Never blocks the UI.
// ─────────────────────────────────────────────────────────────────────────────

const DISPLAY_SERVICES: { key: string; label: string }[] = [
  { key: 'chatr-kernel', label: 'Kernel' },
  { key: 'worker-ai', label: 'AI' },
  { key: 'worker-search', label: 'Search' },
  { key: 'identity-context', label: 'Context' },
  { key: 'worker-automation', label: 'Automation' },
];

function StateIcon({ state }: { state: CapabilityState }) {
  if (state === 'ready') return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
  if (state === 'failed') return <XCircle className="w-3 h-3 text-red-400" />;
  if (state === 'initializing' || state === 'retrying') return <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />;
  if (state === 'offline') return <AlertCircle className="w-3 h-3 text-zinc-500" />;
  return <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />;
}

export const BootStatusIndicator: React.FC = () => {
  const { services, isElectron, isBooted } = useBoot();
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Auto-dismiss 4s after fully booted
  useEffect(() => {
    if (isBooted) {
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isBooted]);

  if (!isElectron || !visible) return null;

  // Determine summary label for the collapsed pill
  const initializingService = DISPLAY_SERVICES.find(
    s => services[s.key] === 'initializing' || services[s.key] === 'retrying'
  );
  const failedCount = DISPLAY_SERVICES.filter(s => services[s.key] === 'failed').length;

  const summaryText = isBooted
    ? 'All Systems Online'
    : initializingService
      ? `Starting ${initializingService.label}...`
      : 'Initializing...';

  const summaryColor = isBooted
    ? 'text-emerald-400'
    : failedCount > 0
      ? 'text-red-400'
      : 'text-amber-400';

  return (
    <div className="fixed bottom-4 left-4 z-[9998] select-none">
      {/* Expanded service list */}
      {expanded && (
        <div className="mb-2 w-52 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="px-3 pt-2.5 pb-1 border-b border-zinc-800/50">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-3 h-3 text-violet-400" /> Platform Status
            </span>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            {DISPLAY_SERVICES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-300">{label}</span>
                <div className="flex items-center gap-1.5">
                  <StateIcon state={services[key]} />
                  <span className={`text-[10px] font-medium ${
                    services[key] === 'ready' ? 'text-emerald-400' :
                    services[key] === 'failed' ? 'text-red-400' :
                    services[key] === 'initializing' || services[key] === 'retrying' ? 'text-amber-400' :
                    'text-zinc-600'
                  }`}>
                    {services[key]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsed pill */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium
          bg-zinc-950/90 border border-zinc-800 shadow-lg backdrop-blur-xl
          hover:border-zinc-700 transition-all duration-300
          ${isBooted ? 'opacity-60 hover:opacity-100' : 'opacity-100'}
        `}
      >
        {isBooted
          ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          : <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
        }
        <span className={summaryColor}>{summaryText}</span>
      </button>
    </div>
  );
};

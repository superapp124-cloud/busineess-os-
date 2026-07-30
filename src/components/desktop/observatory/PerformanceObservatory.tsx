import React, { useState, useEffect } from 'react';
import { Activity, Zap, Server, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PerfMark { label: string; ms: number; ts: number; }
interface ServiceEntry { status: 'initializing' | 'ready' | 'failed' | 'idle' | 'retrying'; detail?: string; ts: number; }

const STATUS_ICON = {
  ready: <CheckCircle className="w-3 h-3 text-emerald-400" />,
  failed: <XCircle className="w-3 h-3 text-red-400" />,
  initializing: <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />,
  retrying: <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />,
  idle: <AlertCircle className="w-3 h-3 text-slate-500" />,
};

const STATUS_COLOR = {
  ready: 'text-emerald-400',
  failed: 'text-red-400',
  initializing: 'text-amber-400',
  retrying: 'text-amber-400',
  idle: 'text-slate-500',
};

export const PerformanceObservatory: React.FC<{ visible?: boolean }> = ({ visible = false }) => {
  const [perfMarks, setPerfMarks] = useState<PerfMark[]>([]);
  const [services, setServices] = useState<Record<string, ServiceEntry>>({});
  const [isExpanded, setIsExpanded] = useState(visible);

  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

  useEffect(() => {
    if (!isElectron) return;
    const api = (window as any).electronAPI;

    // Load initial timeline
    api.invoke('perf:timeline').then((marks: PerfMark[]) => {
      if (marks) setPerfMarks(marks);
    }).catch(() => {});

    // Load initial service registry
    api.invoke('service:registry').then((registry: Record<string, ServiceEntry>) => {
      if (registry) setServices(registry);
    }).catch(() => {});

    // Listen for live service status updates
    const unsub = api.on('service:status', (update: { name: string; status: string; detail: string }) => {
      setServices(prev => ({ ...prev, [update.name]: { status: update.status as any, detail: update.detail, ts: Date.now() } }));
    });

    return () => { try { unsub?.(); } catch {} };
  }, [isElectron]);

  if (!isElectron || !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 z-[9999] w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-colors"
        title="Performance Observatory"
      >
        <Activity className="w-4 h-4 text-violet-400" />
      </button>
    );
  }

  const totalTime = perfMarks.length > 0 ? perfMarks[perfMarks.length - 1].ms : 0;
  const readyCount = Object.values(services).filter(s => s.status === 'ready').length;
  const failedCount = Object.values(services).filter(s => s.status === 'failed').length;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white">Performance Observatory</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">+{totalTime}ms total</span>
          <button onClick={() => setIsExpanded(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
        </div>
      </div>

      {/* Startup Timeline */}
      <div className="px-3 py-2 border-b border-zinc-800/50">
        <div className="flex items-center gap-1 mb-2">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Startup Timeline</span>
        </div>
        <div className="space-y-1">
          {perfMarks.length === 0 ? (
            <div className="text-[10px] text-zinc-600 italic">No marks yet — open in production build</div>
          ) : (
            perfMarks.map((mark, i) => {
              const prev = i > 0 ? perfMarks[i - 1].ms : 0;
              const delta = mark.ms - prev;
              const isHot = delta > 500;
              return (
                <div key={mark.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 truncate">{mark.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-mono ${isHot ? 'text-amber-400' : 'text-emerald-400'}`}>+{mark.ms}ms</span>
                    {i > 0 && <span className="text-[9px] text-zinc-600">(Δ{delta})</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Service Health */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Server className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Services</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400">{readyCount} ready</span>
            {failedCount > 0 && <span className="text-[10px] text-red-400">{failedCount} failed</span>}
          </div>
        </div>
        <div className="space-y-1">
          {Object.entries(services).length === 0 ? (
            <div className="text-[10px] text-zinc-600 italic">No services registered</div>
          ) : (
            Object.entries(services).map(([name, info]) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {STATUS_ICON[info.status] ?? STATUS_ICON.idle}
                  <span className="text-[10px] text-zinc-300">{name}</span>
                </div>
                <span className={`text-[10px] font-medium ${STATUS_COLOR[info.status] ?? 'text-zinc-500'}`}>
                  {info.detail || info.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-zinc-800/50">
        <div className="flex gap-2">
          <button
            onClick={() => (window as any).electronAPI?.invoke('python:ensure').then(() => alert('Python backend started'))}
            className="flex-1 text-[10px] py-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 justify-center"
          >
            <Zap className="w-3 h-3" /> Start Python
          </button>
          <button
            onClick={() => (window as any).electronAPI?.invoke('perf:timeline').then((marks: PerfMark[]) => setPerfMarks(marks || []))}
            className="flex-1 text-[10px] py-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 justify-center"
          >
            <Activity className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

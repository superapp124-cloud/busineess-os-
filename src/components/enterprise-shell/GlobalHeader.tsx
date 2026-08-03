import React from 'react';
import { Search, Bell, User, Activity, Code2, GitBranch, Layers, Package, Map } from 'lucide-react';
import logo from '@/assets/chatr-icon-logo.png';

interface Props {
  status?: 'Operational' | 'Degraded' | 'Offline';
  onCommandPaletteOpen?: () => void;
  onRuntimeInspectorOpen?: () => void;
  onDigitalTwinOpen?: () => void;
  onProcessStudioOpen?: () => void;
  onMarketplaceOpen?: () => void;
  onLiveExecutionMapOpen?: () => void;
}

export const GlobalHeader: React.FC<Props> = ({
  status = 'Operational',
  onCommandPaletteOpen,
  onRuntimeInspectorOpen,
  onDigitalTwinOpen,
  onProcessStudioOpen,
  onMarketplaceOpen,
  onLiveExecutionMapOpen,
}) => {
  return (
    <header className="h-12 shrink-0 border-b border-slate-200 bg-white px-4 flex items-center justify-between z-20">

      {/* Left: Branding & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="CHATR" className="w-5 h-5 object-contain rounded" />
          <span className="font-bold text-xs tracking-tight text-slate-800">CHATR Enterprise</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{status}</span>
        </div>
      </div>

      {/* Center: Command Bar */}
      <div className="flex-1 max-w-lg mx-4">
        <button
          onClick={onCommandPaletteOpen}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
            <span className="text-xs group-hover:text-indigo-600 transition-colors">Search documents, graph, missions, commands…</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-sm">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-sm">K</kbd>
          </div>
        </button>
      </div>

      {/* Right: Studio Launchers & Inspector */}
      <div className="flex items-center gap-2">

        {/* Developer Mode Inspector */}
        <button
          onClick={onRuntimeInspectorOpen}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
          title="Open Developer Mode & System Inspector (Ctrl+Shift+I)"
        >
          <Code2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Dev Mode</span>
          <kbd className="bg-slate-200 text-slate-600 px-1 py-0.2 rounded text-[9px]">Ctrl+⇧+I</kbd>
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <button className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-700 hover:bg-indigo-200 transition-colors">
          <User className="w-3.5 h-3.5" />
        </button>
      </div>

    </header>
  );
};

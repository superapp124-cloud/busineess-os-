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
    <header className="h-12 shrink-0 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 flex items-center justify-between z-20 text-zinc-100">

      {/* Left: Branding & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="CHATR" className="w-5 h-5 object-contain rounded" />
          <span className="font-bold text-xs tracking-tight text-zinc-200">CHATR Workspace</span>
        </div>
      </div>

      {/* Center: Command Bar */}
      <div className="flex-1 max-w-lg mx-4">
        <button
          onClick={onCommandPaletteOpen}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-indigo-500/50 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs group-hover:text-zinc-200 transition-colors">Search documents, chats, files...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 shadow-sm">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 shadow-sm">K</kbd>
          </div>
        </button>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2">
        <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 relative transition-colors" title="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-zinc-950" />
        </button>

        <div className="h-4 w-px bg-zinc-800" />

        <button className="w-7 h-7 rounded-full bg-indigo-950/50 flex items-center justify-center border border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/50 transition-colors" title="User Profile">
          <User className="w-3.5 h-3.5" />
        </button>
      </div>

    </header>
  );
};

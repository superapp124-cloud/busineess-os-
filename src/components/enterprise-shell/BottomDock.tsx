import React from 'react';
import { Sparkles, Mic, BellRing, Terminal } from 'lucide-react';

export const BottomDock: React.FC = () => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      
      <button className="p-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition-colors group relative">
        <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-sm">Assistant</span>
      </button>

      <button className="p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors group relative">
        <Mic className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-sm">Voice Command</span>
      </button>

      <button className="p-2 rounded-xl hover:bg-amber-50 hover:text-amber-600 text-slate-500 transition-colors group relative">
        <BellRing className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-sm">Notifications</span>
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1"></div>

      <button className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-800 text-slate-400 transition-colors group relative">
        <Terminal className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-sm">Developer Tools</span>
      </button>

    </div>
  );
};

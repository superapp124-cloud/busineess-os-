import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { identityRuntime } from '../../core/identity/IdentityRuntime';

export const LiveActivityTicker: React.FC = () => {
  const workers = identityRuntime.getIdentitiesByType('DIGITAL_WORKER');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (workers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % workers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [workers.length]);

  if (workers.length === 0) return null;

  const currentWorker = workers[currentIndex];

  return (
    <div className="fixed bottom-14 right-6 z-40 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-xl flex items-center gap-2.5 max-w-md animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <Bot className="w-3.5 h-3.5 text-indigo-400" />
      </div>
      <div className="text-[11px] truncate flex-1">
        <span className="font-bold text-indigo-300">{currentWorker.name}</span>{' '}
        <span className="text-slate-300">({currentWorker.department}) · Clearance: {currentWorker.clearanceLevel}</span>
      </div>
      <span className="text-[9px] text-emerald-400 font-mono font-bold shrink-0">{currentWorker.status}</span>
    </div>
  );
};

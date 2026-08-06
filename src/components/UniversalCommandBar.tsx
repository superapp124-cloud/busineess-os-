import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Star, Clock, Command, ArrowRight } from 'lucide-react';
import { SystemServices } from '../packages/kernel/src/services/SystemServices';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Recruitment' | 'CRM' | 'Finance' | 'Executive' | 'Knowledge';
  url: string;
  icon?: string;
}

export const UniversalCommandBar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recentItems, setRecentItems] = useState<CommandItem[]>([
    { id: '1', title: 'Aarav Sharma (Java Developer)', category: 'Recruitment', url: '/candidates/cand_101' },
    { id: '2', title: 'Senior Backend Engineer Role', category: 'Recruitment', url: '/jobs/job_202' },
    { id: '3', title: 'TechCorp India Pvt Ltd', category: 'CRM', url: '/companies/comp_303' },
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search candidates, jobs, companies... (Ctrl+K)"
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command / Recent List */}
        <div className="max-h-96 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Recent Items
          </div>
          {recentItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500">{item.category}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>CHATR OS Universal Navigation</span>
          <span className="flex items-center">
            <Command className="w-3 h-3 mr-1" /> Powered by @intent/kernel
          </span>
        </div>
      </div>
    </div>
  );
};

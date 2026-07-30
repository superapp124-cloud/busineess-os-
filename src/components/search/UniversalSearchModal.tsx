import React, { useState, useEffect } from 'react';
import { UniversalSearchService, UniversalSearchResult, SearchDomain } from '../../search/UniversalSearchService';
import { Search, FileText, Mail, Calendar, User, CheckSquare, MessageSquare, Globe, Command, X } from 'lucide-react';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: UniversalSearchResult) => void;
}

const DOMAIN_ICONS: Record<SearchDomain, React.ElementType> = {
  Document: FileText,
  Email: Mail,
  Calendar: Calendar,
  Contact: User,
  Task: CheckSquare,
  Message: MessageSquare,
  WebClip: Globe,
};

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [queryText, setQueryText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<SearchDomain | 'All'>('All');
  const [results, setResults] = useState<UniversalSearchResult[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!queryText.trim()) {
      setResults(UniversalSearchService.search({ text: '', limit: 10 }));
      return;
    }

    const domainsFilter = selectedDomain === 'All' ? undefined : [selectedDomain];
    const searchResults = UniversalSearchService.search({
      text: queryText,
      domains: domainsFilter,
      limit: 15,
    });
    setResults(searchResults);
  }, [queryText, selectedDomain]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={queryText}
            onChange={e => setQueryText(e.target.value)}
            placeholder="Universal Search across Documents, Email, Calendar, Tasks, Contacts... (Ctrl + K)"
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Domain Filters */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {(['All', 'Document', 'Email', 'Calendar', 'Contact', 'Task', 'Message'] as const).map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedDomain === domain
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No matching items found across workspace memory.
            </div>
          ) : (
            results.map(item => {
              const Icon = DOMAIN_ICONS[item.domain] || FileText;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectResult) onSelectResult(item);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 cursor-pointer flex items-start gap-3 transition-all"
                >
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{item.domain}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.snippet}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Command className="w-3 h-3 text-cyan-400" />
            <span>CHATR Universal Search Engine</span>
          </div>
          <span>Press ESC or Ctrl+K to close</span>
        </div>
      </div>
    </div>
  );
};

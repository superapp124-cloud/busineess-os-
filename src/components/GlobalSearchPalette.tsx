/**
 * GlobalSearchPalette
 *
 * CHATR Product Unification Contract — Gate 2: Global Search (Ctrl/Cmd + K)
 *
 * Architecture:
 *   Ctrl/Cmd + K
 *         ↓
 *   GlobalSearchPalette (modal overlay)
 *         ↓
 *   GlobalSearchService.search(query, tenantId, userId)
 *         ↓
 *   Tenant Context + PermissionEngine (via Supabase RLS + auth session)
 *         ↓
 *   crm_leads · business_conversations · sys_execution_records
 *         ↓
 *   SearchResult[] grouped by type
 *         ↓
 *   Click → navigate to canonical URL (useNavigate)
 *         ↓
 *   /desktop/hiring/candidate/:id
 *   /desktop/crm/contact/:id
 *   /desktop/inbox/thread/:id
 *   /desktop/execution/:id
 *   /desktop/business-os/:view
 *
 * KERNEL CONTRACT: Read-only UI component. Zero kernel modifications.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ChevronRight, Users, MessageSquare, Zap, LayoutGrid, Command } from 'lucide-react';
import { GlobalSearchService, GlobalSearchResult, SearchResultType } from '../../search/GlobalSearchService';
import { useTenant } from '../../core/tenant/TenantContext';
import { supabase } from '../../integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GlobalSearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Icon per result type ─────────────────────────────────────────────────────

function ResultIcon({ type }: { type: SearchResultType }) {
  const cls = 'shrink-0';
  switch (type) {
    case 'lead':         return <Users size={14} className={`${cls} text-indigo-400`} />;
    case 'conversation': return <MessageSquare size={14} className={`${cls} text-blue-400`} />;
    case 'execution':    return <Zap size={14} className={`${cls} text-amber-400`} />;
    case 'candidate':    return <Users size={14} className={`${cls} text-emerald-400`} />;
    case 'navigation':   return <LayoutGrid size={14} className={`${cls} text-zinc-500`} />;
    default:             return <Search size={14} className={`${cls} text-zinc-500`} />;
  }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const color = status === 'CONFIRMED' || status === 'EXECUTED'
    ? 'text-emerald-400 bg-emerald-500/10'
    : status === 'FAILED'
    ? 'text-red-400 bg-red-500/10'
    : status === 'EXECUTING' || status === 'AWAITING_CONFIRMATION'
    ? 'text-amber-400 bg-amber-500/10'
    : 'text-zinc-400 bg-zinc-800';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color} shrink-0`}>
      {status.replace('_', ' ')}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalSearchPalette({ isOpen, onClose }: GlobalSearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const { activeOrganization } = useTenant();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load auth user ID on mount ────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  // ─── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // ─── Debounced real search ──────────────────────────────────────────────────
  const runSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const tenantId = activeOrganization?.id;
    const uid = userId;

    // Auth gate: no tenant or user → no search
    if (!tenantId || !uid) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await GlobalSearchService.search({
        text,
        tenantId,
        userId: uid,
        limit: 10,
      });
      setResults(res);
      setSelectedIndex(0);
    } catch (err) {
      console.error('[GlobalSearchPalette] Search failed', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, userId]);

  // Debounce input → search
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 220);
  }, [runSearch]);

  // ─── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, onClose]);

  // ─── Navigate to canonical URL ──────────────────────────────────────────────
  const handleSelect = useCallback((result: GlobalSearchResult) => {
    onClose();
    setQuery('');
    navigate(result.canonicalUrl);
  }, [navigate, onClose]);

  // ─── Group results by type ─────────────────────────────────────────────────
  const grouped = results.reduce<Record<string, GlobalSearchResult[]>>((acc, r) => {
    const g = r.group;
    if (!acc[g]) acc[g] = [];
    acc[g].push(r);
    return acc;
  }, {});

  const groupOrder = ['People', 'Conversations', 'Executions', 'Navigation'];
  const orderedGroups = [
    ...groupOrder.filter(g => grouped[g]),
    ...Object.keys(grouped).filter(g => !groupOrder.includes(g)),
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="fixed top-[18%] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.15), 0 25px 50px rgba(0,0,0,0.7)' }}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/60">
          {isLoading
            ? <Loader2 size={18} className="text-indigo-400 animate-spin shrink-0" />
            : <Search size={18} className="text-zinc-400 shrink-0" />
          }
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Search people, conversations, executions, modules…"
            className="flex-1 bg-transparent text-white text-[15px] placeholder:text-zinc-500 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-600 font-mono bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>

          {/* Auth/tenant warning */}
          {query && !activeOrganization && (
            <div className="px-5 py-3 text-sm text-amber-400 flex items-center gap-2">
              <Zap size={14} />
              No active organization selected — search is scoped to your tenant.
            </div>
          )}

          {/* Empty state */}
          {query && !isLoading && results.length === 0 && activeOrganization && (
            <div className="px-5 py-8 text-center">
              <div className="text-zinc-500 text-sm">No results for <span className="text-zinc-300 font-medium">"{query}"</span></div>
              <div className="text-zinc-600 text-xs mt-1">Try searching by name, phone, or capability</div>
            </div>
          )}

          {/* No query — show hint */}
          {!query && (
            <div className="px-5 py-6 text-center text-zinc-600 text-sm space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-zinc-500 mb-3">
                <Command size={14} />
                <span className="font-medium">CHATR Global Search</span>
              </div>
              <div>Search across candidates, conversations, executions, and modules.</div>
              <div className="text-zinc-700 text-xs mt-2">
                Scoped to <span className="text-zinc-500">{activeOrganization?.name || 'your workspace'}</span>
              </div>
            </div>
          )}

          {/* Grouped results */}
          {orderedGroups.map(group => (
            <div key={group}>
              <div className="px-5 pt-3 pb-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {group}
              </div>
              {grouped[group].map(result => {
                const globalIdx = results.indexOf(result);
                const isSelected = globalIdx === selectedIndex;
                return (
                  <button
                    key={result.id}
                    id={`search-result-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors group ${
                      isSelected ? 'bg-indigo-600/10' : 'hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-500/15' : 'bg-zinc-800'
                    }`}>
                      <ResultIcon type={result.type} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {result.title}
                        </span>
                        {result.meta?.status && (
                          <StatusBadge status={result.meta.status as string} />
                        )}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-zinc-500 truncate mt-0.5">{result.subtitle}</div>
                      )}
                    </div>

                    {/* Chevron */}
                    <ChevronRight size={14} className={`shrink-0 transition-colors ${
                      isSelected ? 'text-indigo-400' : 'text-zinc-700 group-hover:text-zinc-500'
                    }`} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-zinc-800/60 bg-zinc-950/40">
          <div className="flex items-center gap-3 text-[11px] text-zinc-600">
            <span><kbd className="font-mono bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-[10px]">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-[10px]">↵</kbd> open</span>
            <span><kbd className="font-mono bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-[10px]">esc</kbd> close</span>
          </div>
          <div className="text-[10px] text-zinc-700 font-mono">
            {activeOrganization ? `tenant: ${activeOrganization.name}` : 'no tenant'}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContextEngine — the global React provider.
// Wrap the entire app with <ContextEngineProvider>. Consume via useContextEngine().
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ContextState, ContextSource, Signal, EMPTY_CONTEXT } from './types';
import { ContextFusion } from './ContextFusion';
import { SignalBus } from './SignalBus';

// Domain Intelligence plugins
import { TalentIntelligence } from './domains/TalentIntelligence';
import { LegalIntelligence } from './domains/LegalIntelligence';
import { SalesIntelligence } from './domains/SalesIntelligence';
import { FinanceIntelligence } from './domains/FinanceIntelligence';
import { CommunicationIntelligence } from './domains/CommunicationIntelligence';

// ─────────────────────────────────────────────────────────────────────────────
// Build the Context Fusion engine and register all domain plugins
// ─────────────────────────────────────────────────────────────────────────────
const fusion = new ContextFusion();
fusion.registerPlugin(TalentIntelligence);
fusion.registerPlugin(LegalIntelligence);
fusion.registerPlugin(SalesIntelligence);
fusion.registerPlugin(FinanceIntelligence);
fusion.registerPlugin(CommunicationIntelligence);

// ─────────────────────────────────────────────────────────────────────────────
// React Context
// ─────────────────────────────────────────────────────────────────────────────
interface ContextEngineAPI {
  /** The current fused context state */
  context: ContextState;
  /** Register a new context source (e.g. an open document or a chat conversation) */
  addSource(source: ContextSource): void;
  /** Remove a context source (e.g. when a module unmounts) */
  removeSource(moduleId: string): void;
  /** Manually trigger re-fusion (normally automatic via SignalBus) */
  refresh(): void;
}

const ContextEngineContext = createContext<ContextEngineAPI | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const ContextEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [context, setContext] = useState<ContextState>({ ...EMPTY_CONTEXT });
  const sourcesRef = useRef<Map<string, ContextSource>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runFusion = useCallback(() => {
    const sources = Array.from(sourcesRef.current.values());
    // Show processing immediately
    setContext(prev => ({ ...prev, isProcessing: true }));
    // Fuse asynchronously to avoid blocking the UI thread
    queueMicrotask(() => {
      const newState = fusion.fuse(sources);
      setContext(newState);
    });
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runFusion, 80); // <100 ms target
  }, [runFusion]);

  // Subscribe to all signals globally
  useEffect(() => {
    const unsubscribe = SignalBus.on('*', (signal: Signal) => {
      // Update the source that emitted the signal
      const existing = sourcesRef.current.get(signal.sourceModule);
      if (existing) {
        sourcesRef.current.set(signal.sourceModule, {
          ...existing,
          signals: [...existing.signals, signal],
        });
      } else {
        sourcesRef.current.set(signal.sourceModule, {
          module: signal.sourceModule,
          signals: [signal],
        });
      }
      scheduleRefresh();
    });
    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [scheduleRefresh]);

  const addSource = useCallback((source: ContextSource) => {
    sourcesRef.current.set(source.module, source);
    scheduleRefresh();
  }, [scheduleRefresh]);

  const removeSource = useCallback((moduleId: string) => {
    sourcesRef.current.delete(moduleId);
    scheduleRefresh();
  }, [scheduleRefresh]);

  const refresh = useCallback(() => {
    runFusion();
  }, [runFusion]);

  return (
    <ContextEngineContext.Provider value={{ context, addSource, removeSource, refresh }}>
      {children}
    </ContextEngineContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook — the only thing UI components should import
// ─────────────────────────────────────────────────────────────────────────────
export const useContextEngine = (): ContextEngineAPI => {
  const ctx = useContext(ContextEngineContext);
  if (!ctx) throw new Error('useContextEngine must be used inside <ContextEngineProvider>');
  return ctx;
};

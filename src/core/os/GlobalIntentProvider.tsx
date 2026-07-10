/**
 * CHATR Intent OS — Global Intent Context (React)
 *
 * Single React Context that wraps the entire DesktopLayout.
 * Any component on any page calls useCHATROS() to get:
 * - Current page context (AI mode, label, suggestions)
 * - Extracted knowledge (people, dates, intents from conversation)
 * - Active commitments
 * - OSScheduler entries for timeline
 *
 * This is the "one shared runtime" the architecture demands.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { pageContextEngine, PageContext, PageAIMode } from './PageContextEngine';
import { knowledgeEngine, ExtractedKnowledge, KnowledgeEngine } from './KnowledgeEngine';
import { osScheduler, ScheduleEntry } from '../services/OSSchedulerService';
import { Commitment } from '../capabilities/types';
import { eventBus } from '@/core/runtime/EventBus';
import { kernelAPI } from '@/core/runtime/KernelAPI';
import { kernel } from '../runtime/Kernel';
import { conversationStateEngine } from '../services/ConversationStateEngine';

const EMPTY_KNOWLEDGE: ExtractedKnowledge = {
  people: [], dates: [], dateLabels: [], topics: [],
  companies: [], intents: [], rawText: '',
  confidence: 0, extractedAt: new Date().toISOString(),
};

export interface CHATROSState {
  // Page context
  pageContext: PageContext;
  aiMode: PageAIMode;

  // Extracted knowledge from current conversation
  knowledge: ExtractedKnowledge;
  observeText: (text: string) => void;   // Call this on every message
  clearKnowledge: () => void;

  // Commitments (active in current session)
  commitments: Commitment[];

  // Timeline entries from OSScheduler
  scheduleEntries: ScheduleEntry[];
  scheduledToday: ScheduleEntry[];
  scheduledUpcoming: ScheduleEntry[];

  // Global intent submission (works from ANY page)
  submitIntent: (text: string) => void;
  lastIntent: string | null;
}

const CHATROSContext = createContext<CHATROSState | null>(null);

interface GlobalIntentProviderProps {
  children: React.ReactNode;
  commitments?: Commitment[];
  onIntentSubmit?: (text: string) => void;
}

export const GlobalIntentProvider: React.FC<GlobalIntentProviderProps> = ({
  children,
  commitments = [],
  onIntentSubmit,
}) => {
  const location = useLocation();
  const [knowledge, setKnowledge] = useState<ExtractedKnowledge>(EMPTY_KNOWLEDGE);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [lastIntent, setLastIntent] = useState<string | null>(null);
  const knowledgeRef = useRef<ExtractedKnowledge>(EMPTY_KNOWLEDGE);

  // Re-compute page context whenever route changes
  const pageContext = pageContextEngine.getContextForRoute(location.pathname);

  // Boot Kernel v2
  useEffect(() => {
    kernel.boot().catch(console.error);
  }, []);

  // Load schedule entries and subscribe to updates
  useEffect(() => {
    const load = () => setScheduleEntries(osScheduler.getAll());
    load();
    window.addEventListener('chatr:outcome-executed', load);
    window.addEventListener('chatr:notification-delivered', load);
    window.addEventListener('chatr:schedule-updated', load);
    return () => {
      window.removeEventListener('chatr:outcome-executed', load);
      window.removeEventListener('chatr:notification-delivered', load);
      window.removeEventListener('chatr:schedule-updated', load);
    };
  }, []);

  // Clear knowledge on route change (start fresh per conversation)
  useEffect(() => {
    knowledgeRef.current = EMPTY_KNOWLEDGE;
    setKnowledge(EMPTY_KNOWLEDGE);
  }, [location.pathname]);

  // Observe a message — extract knowledge and accumulate
  const observeText = useCallback((text: string) => {
    if (!text || text.trim().length < 3) return;
    const extracted = knowledgeEngine.extract(text);
    const merged = knowledgeEngine.merge(knowledgeRef.current, extracted);
    knowledgeRef.current = merged;
    setKnowledge({ ...merged });

    // Publish to event bus so any service can also react
    eventBus.publish('chatr:knowledge-extracted', { knowledge: extracted, route: location.pathname }, 'GlobalIntentProvider');
  }, [location.pathname]);

  const clearKnowledge = useCallback(() => {
    knowledgeRef.current = EMPTY_KNOWLEDGE;
    setKnowledge(EMPTY_KNOWLEDGE);
  }, []);

  const submitIntent = useCallback(async (text: string) => {
    setLastIntent(text);
    
    // SPRINT 1: Conversation State Engine
    // Intercept input if we have an active commitment waiting for missing fields
    const handledInline = await conversationStateEngine.processInput(text);
    if (handledInline) {
      console.log(`[CHATR OS] Input absorbed by ConversationStateEngine.`);
      return;
    }

    observeText(text);
    onIntentSubmit?.(text);
  }, [observeText, onIntentSubmit]);

  // Derived schedule views
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const scheduledToday = scheduleEntries.filter(e =>
    e.scheduledFor.startsWith(today) && e.status !== 'cancelled'
  );
  const scheduledUpcoming = scheduleEntries.filter(e =>
    !e.scheduledFor.startsWith(today) && e.status !== 'cancelled'
  );

  const value: CHATROSState = {
    pageContext,
    aiMode: pageContext.aiMode,
    knowledge,
    observeText,
    clearKnowledge,
    commitments,
    scheduleEntries,
    scheduledToday,
    scheduledUpcoming,
    submitIntent,
    lastIntent,
  };

  // ─── 5. Handle Kernel Boot Blocking ───────────────────────────────────────
  
  const [isKernelReady, setIsKernelReady] = useState(false);
  const [kernelFailed, setKernelFailed] = useState(false);

  useEffect(() => {
    setIsKernelReady(kernelAPI.state.get('runtime').kernelStatus === 'ready');
    setKernelFailed(kernelAPI.state.get('runtime').kernelStatus === 'crashed');
    return kernelAPI.state.subscribe('runtime', (state) => {
      setIsKernelReady(state.kernelStatus === 'ready');
      setKernelFailed(state.kernelStatus === 'crashed');
    });
  }, []);

  if (kernelFailed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-rose-500/20 mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-rose-400">Kernel Boot Failed</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md text-center">
          The CHATR Operating System encountered a critical error during boot. Please check the console logs for details.
        </p>
        <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md font-medium text-sm transition-colors border border-slate-700">
          Reboot System
        </button>
      </div>
    );
  }

  if (!isKernelReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h1 className="text-xl font-bold tracking-tight">Booting CHATR Kernel...</h1>
        <p className="text-slate-400 text-sm mt-2">Loading OS Runtime Modules</p>
      </div>
    );
  }

  return (
    <CHATROSContext.Provider value={value}>
      {children}
    </CHATROSContext.Provider>
  );
};

/** Use on any page or component to access the global CHATR OS state */
export function useCHATROS(): CHATROSState {
  const ctx = useContext(CHATROSContext);
  if (!ctx) {
    // Graceful fallback so pages don't crash if not inside provider
    const route = typeof window !== 'undefined' ? window.location.pathname : '/';
    const pageContext = pageContextEngine.getContextForRoute(route);
    return {
      pageContext,
      aiMode: pageContext.aiMode,
      knowledge: EMPTY_KNOWLEDGE,
      observeText: () => {},
      clearKnowledge: () => {},
      commitments: [],
      scheduleEntries: [],
      scheduledToday: [],
      scheduledUpcoming: [],
      submitIntent: () => {},
      lastIntent: null,
    };
  }
  return ctx;
}

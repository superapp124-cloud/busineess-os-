'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// ---------------------------------------------------------
// IPC Hardening: Strict whitelist prevents arbitrary calls
// ---------------------------------------------------------
const validSendChannels = [
  'process-transcript-chunk',
  'set-badge-count',
  'window:update-theme',
  'renderer:ready',  // signals Electron to close native splash
  'worker:send',     // route IPC requests to utility process workers
];

const validInvokeChannels = [
  'revoke-session',
  'get-desktop-metrics',
  'context:get-idle-time',
  'context:get-power-state',
  'context:get-clipboard-text',
  // Auto Updater
  'updater:check',
  'updater:install',
  // CHATR Runtime (Decoupled Background Service)
  'chatr:runtime-status',
  'chatr:runtime-prepare',
  'chatr:runtime-generate',
  'chatr:runtime-list-models',
  // AI Engine (ollama.cjs)
  'ai:status',
  'ai:ask',
  'ai:list-models',
  'ai:retry-setup',
  // Legacy compat
  'ai:check-status',
  'ai:pull-model',
  // Local privacy-first call records
  'privacy:ensure-local-folders',
  'calls:save-transcript',
  'calls:save-summary',
  'calls:save-recording',
  // Agent tasks
  'agent:execute-task',
  // Browser auth handoff
  'browser:open-auth',
  'browser:open-provider-login',
  // Smart Inbox
  'smart-inbox:get-state',
  'smart-inbox:connect-provider',
  // Kernel Intent Flow (P1.1)
  'kernel:intent:submit',
  'kernel:intent:subscribe',
  'kernel:intent:select',
  'kernel:intent:auth_complete',
  'kernel:intent:pay',
  'kernel:intent:unsubscribe',
  'kernel:intent',
  'kernel:intent:process',
  'kernel:intent:resume',
  'kernel:intent:hero',
  'kernel:location:provide',
  'kernel:execution:approve',
  'kernel:execution:reject',
  // Provider Session Platform (P1.3) — status only, never credentials
  'kernel:session:check',
  'kernel:session:check_all',
  'kernel:session:revoke',
  // Universal Transaction Platform (P1.4) — ABI objects only, no credentials
  'kernel:transaction:create',
  'kernel:transaction:pay',
  'kernel:transaction:get',
  'kernel:transaction:audit',
  // Document Intelligence
  'documents:search',
  'documents:read',
  'documents:open',
  // Execution Engine v2.0
  'execution:connect-service',
  'execution:get-connected-services',
  'execution:disconnect-service',
  'execution:get-background-jobs',
  'execution:cancel-background-job',
  // Connector Marketplace
  'marketplace:get-catalog',
  'marketplace:install',
  'marketplace:remove',
  // Layer 4: Intelligence
  'intelligence:getGoalGraph',
  'intelligence:createGoal',
  'intelligence:getDailyActionPlan',
  'intelligence:projectFuture',
  'intelligence:triggerDailyLoop',
  'intelligence:getExecutiveFeed',
  'intelligence:triggerScenario',
  'intelligence:syncContext',
  // Phase 0: Performance Observatory
  'perf:timeline',
  'service:registry',
  // Phase 4: Capability OS (Thin Kernel)
  'capability:install',
  'capability:check-updates',
  'capability:list',
  // Python backend on-demand
  'python:ensure',
];

const validListenChannels = [
  'updater:status',
  'updater:progress',
  'chatr:runtime-status-change',
  // AI Engine events (broadcast by ollama.cjs)
  'ai:status',
  // Legacy compat
  'ai:readiness-changed',
  'ai:pull-progress',
  'ai:pull-complete',
  // Meeting assistant
  'agenda-update',
  // System
  'global-shortcut',
  // Kernel Execution & Sessions
  'kernel:session:event',
  'execution:plan_started',
  'execution:node_started',
  'execution:node_awaiting_approval',
  'execution:node_completed',
  'execution:plan_completed',
  'execution:browser_step',
  'execution:capability_started',
  'execution:capability_completed',
  'background:job_completed',
  // Phase 0: Performance Observatory — service lifecycle events
  'service:status',
  // Worker responses — standardized IPC contract responses from UtilityProcess workers
  'worker:response',
  // Phase 4: Capability OS
  'capability:progress',
  // Hero Experience — Sprint 2 streaming events
  'hero:intent.understood',
  'hero:location.resolved',
  'hero:location.missing',
  'hero:context.resolving',
  'hero:context.resolved',
  'hero:provider.discovery.started',
  'hero:provider.discovery.completed',
  'hero:decision.completed',
  'hero:checkout.ready',
  'hero:error',
  // Intelligence events
  'INTELLIGENCE.DAILY_PLAN_READY',
  'INTELLIGENCE.EVENING_REVIEW_COMPLETED',
  'INTELLIGENCE.DAILY_LOOP_STARTED'
];

contextBridge.exposeInMainWorld('electronAPI', {
  /** One-shot send (fire and forget) */
  send: (channel, data) => {
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  /** Invoke — returns a Promise */
  invoke: (channel, data) => {
    if (validInvokeChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
  },

// Internal map to track wrapped listeners so off() can remove the correct reference.
// Without this, on() registers an anonymous wrapper but off() tries to remove the
// original function — different references — and removeListener silently does nothing.
const _listenerWrappers = new Map(); // key: `${channel}::${func}`, value: wrapper fn

  /** Subscribe to a renderer-side event */
  on: (channel, func) => {
    if (validListenChannels.includes(channel)) {
      // Strip event object to prevent prototype pollution
      const wrapper = (event, ...args) => func(...args);
      // Store wrapper keyed by channel + func identity so off() can retrieve it
      const key = `${channel}::${func.toString().slice(0, 80)}`;
      _listenerWrappers.set(key, { wrapper, func });
      ipcRenderer.on(channel, wrapper);
      // Return a cleanup function for use in useEffect hooks
      return () => {
        ipcRenderer.removeListener(channel, wrapper);
        _listenerWrappers.delete(key);
      };
    }
    return () => {}; // no-op cleanup if channel not valid
  },

  /** Remove a listener — must pass the same func reference used in on() */
  off: (channel, func) => {
    if (validListenChannels.includes(channel)) {
      const key = `${channel}::${func.toString().slice(0, 80)}`;
      const entry = _listenerWrappers.get(key);
      if (entry) {
        ipcRenderer.removeListener(channel, entry.wrapper);
        _listenerWrappers.delete(key);
      }
    }
  },

  // ── Convenience helpers ────────────────────────────────────────────────────

  /** Update taskbar / dock badge count */
  setBadgeCount: (count) => {
    ipcRenderer.send('set-badge-count', count);
  },

  /** Register global shortcut handler (Cmd+Space etc) */
  onGlobalShortcut: (callback) => {
    ipcRenderer.on('global-shortcut', () => callback());
  },

  runtime: {
    getStatus: () => ipcRenderer.invoke('chatr:runtime-status'),
    prepare: () => ipcRenderer.invoke('chatr:runtime-prepare'),
    generate: (req) => ipcRenderer.invoke('chatr:runtime-generate', req),
    listModels: () => ipcRenderer.invoke('chatr:runtime-list-models'),
    onStatusChange: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('chatr:runtime-status-change', listener);
      return () => ipcRenderer.removeListener('chatr:runtime-status-change', listener);
    }
  },

  /**
   * AI — Ask local Ollama model.
   * Returns { text } on success or { error, message } when unavailable.
   * Strict privacy mode: renderer must not fall back to cloud AI.
   */
  ai: {
    ask: (prompt, opts = {}) =>
      ipcRenderer.invoke('ai:ask', { prompt, ...opts }),

    status: () =>
      ipcRenderer.invoke('ai:status'),

    listModels: () =>
      ipcRenderer.invoke('ai:list-models'),

    retrySetup: () =>
      ipcRenderer.invoke('ai:retry-setup'),

    /** Listen for AI engine state changes (phase, progress, readyModels) */
    onStatusChange: (callback) => {
      ipcRenderer.on('ai:status', (event, data) => callback(data));
    },

    offStatusChange: (callback) => {
      ipcRenderer.removeListener('ai:status', callback);
    },
  },

  localFiles: {
    ensureFolders: () =>
      ipcRenderer.invoke('privacy:ensure-local-folders'),

    saveTranscript: (payload) =>
      ipcRenderer.invoke('calls:save-transcript', payload),

    saveSummary: (payload) =>
      ipcRenderer.invoke('calls:save-summary', payload),

    saveRecording: (payload) =>
      ipcRenderer.invoke('calls:save-recording', payload),
  },

  auth: {
    openLogin: () =>
      ipcRenderer.invoke('browser:open-auth', { mode: 'login' }),

    openSignup: () =>
      ipcRenderer.invoke('browser:open-auth', { mode: 'signup' }),

    openProviderLogin: (providerId) =>
      ipcRenderer.invoke('browser:open-provider-login', { providerId }),
  },

  smartInbox: {
    getState: () => ipcRenderer.invoke('smart-inbox:get-state'),
    connectProvider: (providerId) => ipcRenderer.invoke('smart-inbox:connect-provider', { providerId }),
  },

  documents: {
    search: (query, limit) => ipcRenderer.invoke('documents:search', { query, limit }),
    read: (filePath) => ipcRenderer.invoke('documents:read', { filePath }),
    open: (filePath) => ipcRenderer.invoke('documents:open', { filePath }),
  },

  kernel: {
    /**
     * Typed kernel invoke — validates the full composed channel name against
     * the explicit whitelist before forwarding to main process.
     * This prevents the previous bypass where any `action` string could reach
     * ipcMain handlers regardless of the validInvokeChannels list.
     */
    invoke: (action, request) => {
      const channel = `kernel:${action}`;
      if (!validInvokeChannels.includes(channel)) {
        return Promise.reject(new Error(`Unauthorized kernel action: ${action}`));
      }
      return ipcRenderer.invoke(channel, request);
    },
  },

  intelligence: {
    getGoalGraph: () => ipcRenderer.invoke('intelligence:getGoalGraph'),
    createGoal: (data) => ipcRenderer.invoke('intelligence:createGoal', data),
    getDailyActionPlan: () => ipcRenderer.invoke('intelligence:getDailyActionPlan'),
    projectFuture: (goalId) => ipcRenderer.invoke('intelligence:projectFuture', goalId),
    triggerDailyLoop: (type) => ipcRenderer.invoke('intelligence:triggerDailyLoop', type),
    getExecutiveFeed: () => ipcRenderer.invoke('intelligence:getExecutiveFeed'),
    triggerScenario: (scenario) => ipcRenderer.invoke('intelligence:triggerScenario', scenario),
    syncContext: () => ipcRenderer.invoke('intelligence:syncContext'),
  },
});

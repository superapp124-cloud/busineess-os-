'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// ---------------------------------------------------------
// IPC Hardening: Strict whitelist prevents arbitrary calls
// ---------------------------------------------------------
const validSendChannels = [
  'process-transcript-chunk',
  'set-badge-count',
  'window:update-theme',
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
  'calls:save-recording',
  // Agent tasks
  'agent:execute-task',
];

const validListenChannels = [
  'updater:status',
  'updater:progress',
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

  /** Subscribe to a renderer-side event */
  on: (channel, func) => {
    if (validListenChannels.includes(channel)) {
      // Strip event object to prevent prototype pollution
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  /** Remove a listener */
  off: (channel, func) => {
    if (validListenChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
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

    saveRecording: (payload) =>
      ipcRenderer.invoke('calls:save-recording', payload),
  },
});

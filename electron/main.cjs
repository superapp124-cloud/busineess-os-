const { app, BrowserWindow, ipcMain, crashReporter, session, powerMonitor, clipboard, Tray, Menu, globalShortcut, shell, screen, safeStorage, utilityProcess } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const net = require('net');
const log = require('electron-log');
const UpdateService = require('./services/UpdateService.cjs');
const { execFile } = require('child_process');
const ollamaEngine = require('./ollama.cjs');
const runtimeOrchestrator = require('./runtime/LocalRuntimeOrchestrator.cjs');
const chatrKernel  = require('./chatr-core/index.cjs');
const tokenVault = require('./token-vault.cjs');
const syncEngine = require('./sync-engine.cjs');
const { WorkerManager } = require('./workers/WorkerManager.cjs');
const CapabilityManager = require('./workers/CapabilityManager.cjs');

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 0: PERFORMANCE OBSERVATORY
// Measures every startup milestone. Exposes via IPC for developer dashboard.
// ─────────────────────────────────────────────────────────────────────────────
class PerformanceTimeline {
  constructor() {
    this.origin = Date.now();
    this.marks = [];
  }
  mark(label) {
    const ms = Date.now() - this.origin;
    this.marks.push({ label, ms, ts: Date.now() });
    log.info(`[Perf] ${label}: +${ms}ms`);
    return ms;
  }
  getAll() {
    return this.marks;
  }
  getSummary() {
    return this.marks.map(m => `${m.label}: +${m.ms}ms`).join(' | ');
  }
}
const perf = new PerformanceTimeline();
perf.mark('process-start');

// ─────────────────────────────────────────────────────────────────────────────
// SAFE GPU FLAGS — minimal, well-supported set only
// Aggressive flags like disable-frame-rate-limit skipped (GPU instability risk)
// ─────────────────────────────────────────────────────────────────────────────
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512');
// Smooth scrolling
app.commandLine.appendSwitch('enable-smooth-scrolling');

const isDev = process.env.NODE_ENV === 'development';
let localRecordsIpcRegistered = false;
let mainWindow = null;
let isQuitting = false;
let hasShownTrayNotification = false;
let tray = null;

// Enforce Windows AppUserModelID so Windows Taskbar uses CHATR icon
if (process.platform === 'win32') {
  app.setAppUserModelId('chat.chatr.desktop');
}

// Enforce Single Instance Lock so opening app NEVER creates duplicate window instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  log.info('[Main] Another instance of CHATR Desktop is already running. Focus existing window & exiting.');
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

const CHATR_BROWSER_AUTH_ORIGIN = 'https://chatr.chat';
const PROVIDER_BROWSER_LOGIN_URLS = {
  google: 'https://accounts.google.com/',
  microsoft: 'https://login.microsoftonline.com/',
  slack: 'https://slack.com/signin',
  github: 'https://github.com/login',
  linkedin: 'https://www.linkedin.com/login',
  facebook: 'https://www.facebook.com/login/',
  notion: 'https://www.notion.so/login',
  jira: 'https://id.atlassian.com/login',
  dropbox: 'https://www.dropbox.com/login',
  salesforce: 'https://login.salesforce.com/',
};

const SMART_INBOX_PROVIDER_META = {
  google: { name: 'Google Workspace', surfaces: ['mail', 'calendar', 'drive'] },
  microsoft: { name: 'Microsoft 365', surfaces: ['mail', 'calendar', 'teams', 'onedrive'] },
  slack: { name: 'Slack', surfaces: ['dm', 'channels'] },
  github: { name: 'GitHub', surfaces: ['issues', 'pull_requests'] },
  linkedin: { name: 'LinkedIn', surfaces: ['dm', 'posts'] },
  facebook: { name: 'Facebook', surfaces: ['dm', 'posts'] },
  notion: { name: 'Notion', surfaces: ['pages', 'tasks'] },
  jira: { name: 'Jira', surfaces: ['issues', 'projects'] },
  dropbox: { name: 'Dropbox', surfaces: ['files'] },
  salesforce: { name: 'Salesforce', surfaces: ['crm', 'tasks'] },
};

function getSmartInboxStorePath() {
  return path.join(app.getPath('userData'), 'smart-inbox-state.enc');
}

function defaultSmartInboxState() {
  return {
    version: 1,
    providers: Object.entries(SMART_INBOX_PROVIDER_META).map(([id, meta]) => ({
      id,
      name: meta.name,
      status: 'not_connected',
      accounts: 0,
      surfaces: meta.surfaces,
      lastOpenedAt: null,
      lastSyncAt: null,
      syncError: null,
    })),
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

function readSmartInboxState() {
  try {
    const filePath = getSmartInboxStorePath();
    if (!fs.existsSync(filePath)) return defaultSmartInboxState();

    const encrypted = fs.readFileSync(filePath);
    const raw = safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(encrypted)
      : encrypted.toString('utf8');
    const parsed = JSON.parse(raw);
    const defaults = defaultSmartInboxState();
    const providerById = new Map((parsed.providers || []).map((provider) => [provider.id, provider]));

    return {
      ...defaults,
      ...parsed,
      providers: defaults.providers.map((provider) => ({
        ...provider,
        ...(providerById.get(provider.id) || {}),
      })),
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch (err) {
    log.error('[SmartInbox] Failed to read state:', err.message);
    return defaultSmartInboxState();
  }
}

function writeSmartInboxState(state) {
  const nextState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(nextState, null, 2);
  const bytes = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(serialized)
    : Buffer.from(serialized, 'utf8');

  fs.writeFileSync(getSmartInboxStorePath(), bytes);
  return nextState;
}

function markSmartInboxProviderOpened(providerId) {
  const state = readSmartInboxState();
  const providers = state.providers.map((provider) => {
    if (provider.id !== providerId) return provider;

    return {
      ...provider,
      status: 'authentication_started',
      lastOpenedAt: new Date().toISOString(),
      syncError: 'Waiting for real OAuth callback and provider API sync.',
    };
  });

  return writeSmartInboxState({ ...state, providers });
}

ipcMain.handle('browser:open-auth', async (event, payload = {}) => {
  const mode = payload.mode === 'signup' ? 'signup' : 'login';
  const authUrl = new URL('/auth', CHATR_BROWSER_AUTH_ORIGIN);
  authUrl.searchParams.set('mode', mode);
  authUrl.searchParams.set('source', 'desktop');

  await shell.openExternal(authUrl.toString());
  return { ok: true, url: authUrl.toString() };
});

ipcMain.handle('browser:open-provider-login', async (event, payload = {}) => {
  const providerId = String(payload.providerId || '').toLowerCase();
  const loginUrl = PROVIDER_BROWSER_LOGIN_URLS[providerId];

  if (!loginUrl) {
    throw new Error(`Unsupported provider: ${providerId || 'unknown'}`);
  }

  await shell.openExternal(loginUrl);
  markSmartInboxProviderOpened(providerId);
  return { ok: true, url: loginUrl };
});

ipcMain.handle('smart-inbox:get-state', async () => {
  return readSmartInboxState();
});

ipcMain.handle('smart-inbox:connect-provider', async (event, payload = {}) => {
  const providerId = String(payload.providerId || '').toLowerCase();
  let authUrl = PROVIDER_BROWSER_LOGIN_URLS[providerId];

  if (!authUrl) {
    throw new Error(`Unsupported provider: ${providerId || 'unknown'}`);
  }

  if (providerId === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      const redirectUri = 'chatr://oauth2/callback';
      const scope = encodeURIComponent('email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly');
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    } else {
      log.warn('[Main] GOOGLE_CLIENT_ID missing, falling back to mock flow.');
      // Mock flow just redirects immediately to our app scheme to simulate success
      authUrl = 'chatr://oauth2/callback?code=mock_code';
    }
  }

  const state = markSmartInboxProviderOpened(providerId);
  await shell.openExternal(authUrl);
  return { ok: true, url: authUrl, state };
});

function sanitizeFileSegment(value, fallback = 'call') {
  const normalized = String(value || fallback)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return normalized || fallback;
}

function timestampForFile(value = new Date()) {
  return new Date(value).toISOString().replace(/[:.]/g, '-');
}

function ensureLocalRecordsDirs() {
  const root = path.join(app.getPath('documents'), 'CHATR Workspace');
  const transcripts = path.join(root, 'Transcripts');
  const recordings = path.join(root, 'Call Recordings');
  const summaries = path.join(root, 'AI Summaries');
  fs.mkdirSync(transcripts, { recursive: true });
  fs.mkdirSync(recordings, { recursive: true });
  fs.mkdirSync(summaries, { recursive: true });
  return { root, transcripts, recordings, summaries };
}


function recordingExtension(mimeType = '') {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
}

function registerLocalRecordsIpc() {
  if (localRecordsIpcRegistered) return;
  localRecordsIpcRegistered = true;

  ipcMain.handle('privacy:ensure-local-folders', async () => ensureLocalRecordsDirs());

  ipcMain.handle('calls:save-transcript', async (event, payload = {}) => {
    try {
      const { transcripts } = ensureLocalRecordsDirs();
      const transcript = typeof payload.transcript === 'string' ? payload.transcript.trim() : '';
      if (!transcript) return { ok: false, error: 'Transcript is empty.' };

      const createdAt = payload.createdAt || new Date().toISOString();
      const title = sanitizeFileSegment(payload.meetingTitle || payload.participantName || 'CHATR Call');
      const callId = sanitizeFileSegment(payload.callId || 'local-call');
      const filePath = path.join(transcripts, `${timestampForFile(createdAt)}-${title}-${callId}.txt`);
      const lines = [
        `CHATR Call Transcript`,
        `Title: ${payload.meetingTitle || 'CHATR Call'}`,
        `Participant: ${payload.participantName || 'Unknown'}`,
        `Call ID: ${payload.callId || 'local-call'}`,
        `Created: ${createdAt}`,
        `Duration seconds: ${Number.isFinite(payload.durationSeconds) ? payload.durationSeconds : 0}`,
        '',
        transcript,
        '',
      ];

      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      return { ok: true, path: filePath };
    } catch (err) {
      log.error('[LocalRecords] Failed to save transcript:', err.message);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('calls:save-summary', async (event, payload = {}) => {
    try {
      const { summaries } = ensureLocalRecordsDirs();
      const summary = typeof payload.summary === 'string' ? payload.summary.trim() : '';
      if (!summary) return { ok: false, error: 'Summary is empty.' };

      const createdAt = payload.createdAt || new Date().toISOString();
      const title = sanitizeFileSegment(payload.meetingTitle || payload.participantName || 'CHATR Call');
      const callId = sanitizeFileSegment(payload.callId || 'local-call');
      const filePath = path.join(summaries, `${timestampForFile(createdAt)}-${title}-${callId}.txt`);
      const lines = [
        `CHATR Call Summary`,
        `Title: ${payload.meetingTitle || 'CHATR Call'}`,
        `Participant: ${payload.participantName || 'Unknown'}`,
        `Call ID: ${payload.callId || 'local-call'}`,
        `Created: ${createdAt}`,
        `Duration seconds: ${Number.isFinite(payload.durationSeconds) ? payload.durationSeconds : 0}`,
        '',
        summary,
        '',
        payload.transcript ? 'Transcript excerpt:' : '',
        payload.transcript ? String(payload.transcript).trim().slice(0, 4000) : '',
        '',
      ].filter((line, index, all) => line || all[index - 1]);

      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      return { ok: true, path: filePath };
    } catch (err) {
      log.error('[LocalRecords] Failed to save summary:', err.message);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('calls:save-recording', async (event, payload = {}) => {
    try {
      const { recordings } = ensureLocalRecordsDirs();
      if (!payload.data) return { ok: false, error: 'Recording data is empty.' };

      const bytes = payload.data instanceof ArrayBuffer
        ? Buffer.from(new Uint8Array(payload.data))
        : Buffer.from(payload.data);
      if (bytes.length === 0) return { ok: false, error: 'Recording data is empty.' };

      const startedAt = payload.startedAt || new Date().toISOString();
      const participant = sanitizeFileSegment(payload.participantName || 'CHATR Call');
      const callId = sanitizeFileSegment(payload.callId || 'local-call');
      const ext = recordingExtension(payload.mimeType);
      const filePath = path.join(recordings, `${timestampForFile(startedAt)}-${participant}-${callId}.${ext}`);

      fs.writeFileSync(filePath, bytes);
      fs.writeFileSync(`${filePath}.json`, JSON.stringify({
        callId: payload.callId || null,
        participantName: payload.participantName || null,
        mimeType: payload.mimeType || null,
        startedAt,
        durationSeconds: Number.isFinite(payload.durationSeconds) ? payload.durationSeconds : null,
        savedAt: new Date().toISOString(),
      }, null, 2), 'utf8');

      return { ok: true, path: filePath };
    } catch (err) {
      log.error('[LocalRecords] Failed to save recording:', err.message);
      return { ok: false, error: err.message };
    }
  });
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('chatr', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('chatr');
}

async function handleOAuthCallback(urlStr) {
  try {
    const url = new URL(urlStr);
    if (url.protocol === 'chatr:' && url.pathname === '//oauth2/callback') {
      const code = url.searchParams.get('code');
      if (code) {
        log.info('[OAuth] Received authorization code');
        // Currently hardcoding google as the active flow for simplicity
        const providerId = 'google'; 
        
        let tokenData;
        if (code === 'mock_code') {
          tokenData = { access_token: 'mock_access', refresh_token: 'mock_refresh' };
        } else {
          // Exchange real code
          const clientId = process.env.GOOGLE_CLIENT_ID;
          const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
          const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              code,
              grant_type: 'authorization_code',
              redirect_uri: 'chatr://oauth2/callback'
            })
          });
          
          if (!res.ok) throw new Error(`Token exchange failed: ${res.statusText}`);
          tokenData = await res.json();
        }

        // Save token securely
        tokenVault.saveToken(providerId, tokenData);

        // Update provider status to healthy
        const state = readSmartInboxState();
        const providers = state.providers.map(p => 
          p.id === providerId ? { ...p, status: 'Healthy', accounts: p.accounts + 1, syncError: null } : p
        );
        writeSmartInboxState({ ...state, providers });

        // Kick off background sync
        const items = await syncEngine.runSync(providerId);
        if (items && items.length > 0) {
          const newState = readSmartInboxState();
          newState.items = [...items, ...(newState.items || [])];
          writeSmartInboxState(newState);
        }
      }
    }
  } catch (err) {
    log.error('[OAuth] Callback error:', err.message);
  }
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    const url = commandLine.find(arg => arg.startsWith('chatr://'));
    if (url) {
      if (url.includes('oauth2/callback')) handleOAuthCallback(url);
      else mainWindow.webContents.send('deep-link', url);
    }
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    if (url.includes('oauth2/callback')) handleOAuthCallback(url);
    else mainWindow.webContents.send('deep-link', url);
  } else if (url.includes('oauth2/callback')) {
    // If caught before window init, queue it or process it headless
    app.whenReady().then(() => handleOAuthCallback(url));
  }
});

// ---------------------------------------------------------
// PHASE 2: OBSERVABILITY (Logging & Crash Reporting)
// ---------------------------------------------------------

// Configure structured logging
log.transports.file.level = 'info';
log.transports.console.level = isDev ? 'debug' : 'error';

// Security: Filter sensitive data from logs before writing
log.hooks.push((message, transport) => {
  if (transport !== log.transports.file) return message;
  // Mask potential tokens, clipboards, or messages
  const maskedData = message.data.map(item => {
    if (typeof item === 'string') {
      return item.replace(/(ey[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/g, '[REDACTED_JWT]')
                 .replace(/(Bearer\s+)[^\s]+/g, '$1[REDACTED]');
    }
    return item;
  });
  message.data = maskedData;
  return message;
});

log.info('Starting CHATR Desktop App...');

// Enable Crashpad reporting
crashReporter.start({
  productName: 'CHATR Desktop',
  companyName: 'CHATR Workspace',
  submitURL: 'https://api.chatr.chat/telemetry/crash-reports', // Production endpoint
  uploadToServer: !isDev,
  compress: true,
  extra: {
    electronVersion: process.versions.electron,
    osVersion: process.getSystemVersion()
  }
});

// ---------------------------------------------------------
// CHATR Workspace: OS Context Engine Hooks
// ---------------------------------------------------------
function setupContextEngine(mainWindow) {
  ensureLocalRecordsDirs();
  registerLocalRecordsIpc();

  // Expose Idle Time
  ipcMain.handle('context:get-idle-time', () => {
    return powerMonitor.getSystemIdleTime();
  });

  // Expose Power State
  ipcMain.handle('context:get-power-state', () => {
    return {
      onBatteryPower: powerMonitor.isOnBatteryPower()
    };
  });

  // Expose Clipboard Content (Safe text only)
  ipcMain.handle('context:get-clipboard-text', () => {
    const text = clipboard.readText();
    // Return max 500 chars to avoid overwhelming context engine
    return text ? text.substring(0, 500) : null;
  });

  // -------------------------------------------------------------
  // PHASE 2: INTENT PIPELINE EXECUTION
  // -------------------------------------------------------------

  // P1.3 — Provider Session Platform
  // Lazily initialize vault and session service once on first use
  let _sessionVault = null;
  let _sessionService = null;

  function getKernelSessionService() {
    if (!_sessionService) {
      const { SessionVault } = require('./chatr-core/kernel/session-vault.cjs');
      const { ProviderSessionService } = require('./chatr-core/kernel/provider-session-service.cjs');
      const { bus } = require('./chatr-core/events/bus.cjs');

      _sessionVault = new SessionVault();
      _sessionVault.init(); // async init, fire-and-forget on first call
      _sessionService = new ProviderSessionService({ vault: _sessionVault, bus });
    }
    return _sessionService;
  }

  // Check session for a single provider — returns status only, NO credentials
  ipcMain.handle('kernel:session:check', async (event, { provider }) => {
    try {
      await getKernelSessionService()._vault.init();
      const session = await getKernelSessionService().checkSession(provider);
      // Strip any internal-only fields before sending to renderer
      return { provider: session.provider, status: session.status, expires_at: session.expires_at, confidence: session.confidence, latency_ms: session.latency_ms };
    } catch (err) {
      log.error('[P1.3] session:check failed:', err.message);
      return { provider, status: 'LOGIN_REQUIRED', error: 'Session check failed' };
    }
  });

  // Check all known providers concurrently — status only
  ipcMain.handle('kernel:session:check_all', async (event, { providers }) => {
    try {
      await getKernelSessionService()._vault.init();
      const sessions = await getKernelSessionService().validateAll(providers || ['zomato', 'swiggy', 'magicpin', 'makemytrip']);
      return sessions.map(s => ({ provider: s.provider, status: s.status, confidence: s.confidence, latency_ms: s.latency_ms }));
    } catch (err) {
      log.error('[P1.3] session:check_all failed:', err.message);
      return [];
    }
  });

  // Revoke session — wipes vault entry for provider
  ipcMain.handle('kernel:session:revoke', async (event, { provider }) => {
    try {
      getKernelSessionService().revoke(provider);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // P1.4 — Universal Transaction Platform
  let _transactionEngine = null;
  let _paymentEngine = null;
  let _txVerifier = null;
  let _txTracker = null;

  function getTxPlatform() {
    if (!_transactionEngine) {
      const { bus }                           = require('./chatr-core/events/bus.cjs');
      const { TransactionEngine }             = require('./chatr-core/kernel/transaction-engine.cjs');
      const { PaymentEngine }                 = require('./chatr-core/kernel/payment-engine.cjs');
      const { TransactionVerificationEngine } = require('./chatr-core/kernel/transaction-verification-engine.cjs');
      const { TransactionTracker }            = require('./chatr-core/kernel/transaction-tracker.cjs');

      _transactionEngine = new TransactionEngine({ bus });
      _paymentEngine     = new PaymentEngine({ bus });
      _txVerifier        = new TransactionVerificationEngine({ bus });
      _txTracker         = new TransactionTracker({ bus });
    }
    return { txEngine: _transactionEngine, payEngine: _paymentEngine, verifier: _txVerifier, tracker: _txTracker };
  }

  // Create a transaction — returns ABI (no credentials)
  ipcMain.handle('kernel:transaction:create', async (event, params) => {
    try {
      const { txEngine } = getTxPlatform();
      return txEngine.create(params);
    } catch (err) {
      log.error('[P1.4] transaction:create failed:', err.message);
      return { error: err.message };
    }
  });

  // Dispatch payment — UI provides method token only (not raw card data)
  ipcMain.handle('kernel:transaction:pay', async (event, { transactionId, method, paymentToken, amount, currency }) => {
    try {
      const { txEngine, payEngine, verifier, tracker } = getTxPlatform();
      const tx = txEngine.get(transactionId);
      if (!tx) throw new Error('Transaction not found');

      // 1. Move to PAYMENT_PENDING
      txEngine.transition(transactionId, 'PAYMENT_PENDING');

      // 2. Dispatch to Payment Engine
      const payResult = await payEngine.dispatch({ transactionId, amount, currency, method, paymentToken });

      if (payResult.outcome === 'CONFIRMED') {
        txEngine.transition(transactionId, 'PAYMENT_CONFIRMED', { reference: payResult.reference });

        // 3. Verify with provider
        const verification = await verifier.verify(txEngine.get(transactionId), payResult.reference);

        if (verification.verified) {
          txEngine.transition(transactionId, 'VERIFIED', { order_id: verification.order_id });
          txEngine.transition(transactionId, 'TRACKING');

          // 4. Start tracking (non-blocking)
          tracker.startTracking(transactionId, verification.order_id, tx.provider, tx.entity_type);
        }
      } else if (payResult.outcome === 'RETRYABLE') {
        txEngine.transition(transactionId, 'PAYMENT_RETRYABLE', { reason: payResult.reference });
      } else {
        txEngine.transition(transactionId, 'PAYMENT_FAILED', { reason: payResult.reference });
      }

      return txEngine.get(transactionId);
    } catch (err) {
      log.error('[P1.4] transaction:pay failed:', err.message);
      return { error: err.message };
    }
  });

  // Get transaction status — UI-safe ABI (no credentials)
  ipcMain.handle('kernel:transaction:get', async (event, { transactionId }) => {
    try {
      const { txEngine } = getTxPlatform();
      return txEngine.get(transactionId);
    } catch (err) {
      return { error: err.message };
    }
  });

  // Get full audit trail
  ipcMain.handle('kernel:transaction:audit', async (event, { transactionId }) => {
    try {
      const { txEngine } = getTxPlatform();
      return txEngine.auditTrail(transactionId);
    } catch (err) {
      return { error: err.message };
    }
  });

  // P1.1 Kernel Session Bridge
  const activeSessions = new Map();

  ipcMain.handle('kernel:intent:submit', async (event, request) => {
    const crypto = require('crypto');
    const goalId = crypto.randomUUID();
    return { goalId };
  });

  ipcMain.on('kernel:intent:subscribe', (event, { goalId }) => {
    // For P1.1, we simulate the DiscoveryEngine telemetry pushing down the pipe.
    // In P1.2, this will wire to the real DiscoveryEngine bus events.
    if (!event.sender) return;
    
    activeSessions.set(goalId, event.sender);

    const sendEvent = (stage, payload = {}, latency = 0) => {
      if (activeSessions.has(goalId)) {
        event.sender.send('kernel:session:event', {
          goalId,
          stage,
          latency,
          confidence: 0.98,
          timestamp: Date.now(),
          payload
        });
      }
    };

    // Simulate streaming execution telemetry
    setTimeout(() => {
      sendEvent('DISCOVERY_STARTED');
      
      setTimeout(() => {
        sendEvent('METRIC', { stageName: 'Understanding', slaMs: 50 }, 42);
      }, 50);

      setTimeout(() => {
        sendEvent('METRIC', { stageName: 'Location', slaMs: 100 }, 85);
      }, 100);

      setTimeout(() => {
        sendEvent('METRIC', { stageName: 'SessionCheck', slaMs: 100 }, 22);
      }, 120);

      setTimeout(() => {
        sendEvent('METRIC', { stageName: 'ProviderSearch', slaMs: 300 }, 240);
        
        // Push Results
        setTimeout(() => {
          sendEvent('METRIC', { stageName: 'Ranking', slaMs: 50 }, 35);
          sendEvent('RESULTS_READY', {
            results: [
              { id: 'res_behrouz', name: 'Behrouz', badge: 'Best Overall', price: '₹289', deliveryTime: '28 min', rating: '4.6★', tags: ['Free Delivery'], decisionReasons: ['Highest rating (Backend)'] },
              { id: 'res_blues', name: 'Biryani Blues', badge: 'Best Value', price: '₹249', deliveryTime: '31 min', rating: '4.5★', tags: [], decisionReasons: ['Lowest delivery fee (Backend)'] },
              { id: 'res_paradise', name: 'Paradise', badge: 'Fastest', price: '₹319', deliveryTime: '24 min', rating: '4.7★', tags: [], decisionReasons: ['Fastest arrival (Backend)'] }
            ]
          });
        }, 50);
      }, 300);
      
    }, 10);
  });

  ipcMain.on('kernel:intent:select', (event, { goalId, resultId }) => {
    // Acknowledge selection
    console.log(`[Kernel Session] Selected result ${resultId} for goal ${goalId}`);
  });

  ipcMain.on('kernel:intent:auth_complete', (event, { goalId }) => {
    console.log(`[Kernel Session] Auth complete for goal ${goalId}`);
  });

  ipcMain.on('kernel:intent:pay', (event, { goalId }) => {
    console.log(`[Kernel Session] Payment initiated for goal ${goalId}`);
  });

  ipcMain.on('kernel:intent:unsubscribe', (event, { goalId }) => {
    activeSessions.delete(goalId);
  });

  ipcMain.handle('kernel:intent', async (event, request) => {
    try {
      if (request.intent === 'memory.search') {
        const query = request.context?.query || '';
        const { app } = require('electron');
        const path = require('path');
        const { execFile } = require('child_process');
        const psScriptPath = path.join(app.getPath('userData'), 'agent-search.ps1');
        
        const files = await new Promise((resolve) => {
          execFile('powershell.exe', [
              '-NoProfile', 
              '-ExecutionPolicy', 'Bypass', 
              '-File', psScriptPath, 
              '-SearchTerm', query
          ], (error, stdout, stderr) => {
            if (error) { resolve([]); return; }
            try {
              const parsed = JSON.parse(stdout || "[]");
              const arrayResult = Array.isArray(parsed) ? parsed : [parsed];
              resolve(arrayResult.filter(i => i && i.FullName));
            } catch(e) { resolve([]); }
          });
        });

        return {
          success: true,
          data: {
            files: files.map(f => ({ path: f.FullName, name: f.Name, contentPreview: `Modified: ${f.LastWriteTime}` }))
          }
        };
      }
      
      return { success: false, error: 'Intent not implemented synchronously.' };
    } catch (err) {
      log.error('[Kernel] Intent synchronous execution failed:', err);
      return { success: false, error: err.message };
    }
  });

  // ── Hero Experience Location Provisioning (Sprint 2) ─────────────────────
  ipcMain.handle('kernel:location:provide', async (event, payload) => {
    try {
      const locationResolver = require('./chatr-core/kernel/location-resolver.cjs');
      if (typeof payload === 'string') {
        locationResolver.setCachedLocation(payload, null, null);
      } else {
        const { city, lat, lng } = payload;
        locationResolver.setCachedLocation(city || 'Unknown', lat || null, lng || null);
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // ── Hero Experience Streaming Endpoint (Sprint 2) ────────────────────────
  // Streams kernel events directly to the Hero UI via webContents.send.
  // The Hero UI subscribes via HeroProjection — it never polls.
  ipcMain.handle('kernel:intent:hero', async (event, intentText) => {
    const t0 = Date.now();
    const send = (topic, payload = {}) => {
      const ts = Date.now();
      const enriched = { ...payload, _ts: ts, _elapsed: ts - t0 };
      log.info(`[HeroKernel] ${topic} +${enriched._elapsed}ms`);
      if (mainWindow) mainWindow.webContents.send(topic, enriched);
    };

    try {
      const { planner }            = require('./chatr-core/kernel/planner.cjs');
      const { decisionEngine }     = require('./chatr-core/kernel/decision-engine.cjs');
      const locationResolver   = (() => {
        try { return require('./chatr-core/kernel/location-resolver.cjs'); }
        catch { return { resolveForHero: async () => ({ city: null, confidence: 0, source: 'unavailable', ageSeconds: null }) }; }
      })();
      const { userContextEngine }    = require('./chatr-core/context/user-context-engine.cjs');
      const { worldModel }           = require('./chatr-core/world-model/world-model.cjs');
      const { workflowEngine }       = require('./chatr-core/execution/workflow-engine.cjs');
      const { executionGraph }       = require('./chatr-core/kernel/execution-graph.cjs');
      const { bus }                  = require('./chatr-core/events/bus.cjs');
      const crypto                   = require('crypto');

      // ── Step 1: Parse intent ───────────────────────────────────────────────
      const { intent, constraints } = planner.plan(intentText);
      if (intent === 'unknown') {
        send('hero:error', { message: "I didn't understand that. Try: \"Order biryani\" or \"Book train to Mumbai\"" });
        return { ok: false };
      }

      send('hero:intent.understood', {
        intent,
        cuisine:  constraints.cuisine   || null,
        mode:     constraints.mode      || null,
        mealType: constraints.mealType  || null,
        raw:      intentText,
      });

      // ── Step 2: Location Resolution (kernel-first, never browser) ────────
      const location = await locationResolver.resolveForHero();

      if (location.source === 'unavailable' || !location.city) {
        // Merge with context-engine result as last attempt
        const ctx = await userContextEngine.buildContext(crypto.randomUUID());
        const ctxLoc = ctx.location?.current;
        if (ctxLoc && ctxLoc.city) {
          send('hero:location.resolved', {
            city:       ctxLoc.city,
            lat:        ctxLoc.latitude,
            lng:        ctxLoc.longitude,
            confidence: 0.85,
            source:     'context-engine',
            ageSeconds: 0,
          });
          constraints.location = ctxLoc.city;
        } else {
          send('hero:location.missing', { reason: 'GPS unavailable' });
          return { ok: false, status: 'needs_location' };
        }
      } else {
        send('hero:location.resolved', location);
        constraints.location = location.city;
      }

      // ── Step 3: Parallel context (sessions, payment, address) ────────────
      send('hero:context.resolving', { parallel: ['sessions', 'payment', 'address'] });
      await new Promise(r => setTimeout(r, 30)); // let events flush
      send('hero:context.resolved', {
        sessions: ['Zomato', 'Swiggy'],
        paymentMethod: 'UPI',
        deliveryAddress: constraints.location,
      });

      // ── Step 4: Provider Discovery ────────────────────────────────────────
      send('hero:provider.discovery.started', { intent });
      const intentId    = crypto.randomUUID();
      const liveContext = await userContextEngine.buildContext(intentId);
      const decision    = await decisionEngine.analyze(intentText, intent, constraints, liveContext, worldModel);

      // Merge resolved constraints
      const flatConstraints = { ...constraints };
      for (const [key, val] of Object.entries(decision.resolved || {})) {
        flatConstraints[key] = (val && typeof val === 'object' && val.value !== undefined) ? val.value : val;
      }

      // Build execution graph (real provider query)
      const plan = workflowEngine.buildGraph(intentId, intent, flatConstraints);

      // ── Step 5: Decision ─────────────────────────────────────────────────
      const providerName = intent.startsWith('food')      ? 'Swiggy'  :
                           intent.startsWith('transport') ? 'IRCTC'   : 'Provider';
      send('hero:decision.completed', {
        selectedProvider: providerName,
        alternatives:     12,
        confidence:       0.93,
        reasons: intent.startsWith('food') ? [
          'Lowest ETA in your area',
          'Best rating for your cuisine',
          'Coupon applied automatically',
        ] : [
          'Direct route available',
          'Best price class',
          'Preferred departure time',
        ],
        intent,
        durationMs: Date.now() - t0,
      });

      // ── Step 6: Subscribe and fire execution ─────────────────────────────
      send('hero:provider.discovery.completed', {
        count:    intent.startsWith('food') ? 24 : 8,
        provider: providerName,
        intent,
      });

      // Subscribe to bus for real execution events, forwarded with Hero prefix
      const heroBusSubs = [
        'execution:plan_completed',
        'execution:node_completed',
        'execution:capability_failed',
      ].map(topic => {
        const handler = (data) => send(topic, data);
        bus.subscribe(topic, handler);
        return { topic, handler };
      });

      // Fire execution async, respond immediately
      executionGraph.execute(plan).then((execResult) => {
        const mode = execResult?.metadata?.mode || 'Demonstration Mode';
        
        // Extract final results from the graph execution
        let finalOptions = [];
        if (execResult && execResult.results) {
           const nodes = Object.values(execResult.results);
           // Scan backwards to find the actual options (so 'step_transport_book' doesn't hide them)
           for (let i = nodes.length - 1; i >= 0; i--) {
              const output = nodes[i]?.output || {};
              const opts = output.options || output.restaurants || output.flights || output.trains || output.results || (Array.isArray(output) ? output : []);
              if (opts && opts.length > 0) {
                 finalOptions = opts;
                 log.info(`[HeroKernel] finalOptions extracted from node ${nodes[i].id}: length=${finalOptions.length}, options=${JSON.stringify(finalOptions)}`);
                 break;
              }
           }
        }

        log.info(`[HeroKernel] sending options to hero:checkout.ready with length=${finalOptions.length}`);

        send('hero:checkout.ready', {
          mode,
          provider:       providerName,
          checkoutUrl:    null,
          demoReason:     mode === 'Demonstration Mode' ? 'Provider restricts automated web checkout' : null,
          options:        finalOptions,
          durationMs:     Date.now() - t0,
        });
      }).catch((err) => {
        log.warn('[HeroKernel] Execution partial failure (expected for demo):', err.message);
        // Emit demo boundary rather than hiding the failure
        send('hero:checkout.ready', {
          mode:       'Demonstration Mode',
          provider:   providerName,
          checkoutUrl: null,
          demoReason: err.message,
          options:    [],
          durationMs: Date.now() - t0,
        });
      }).finally(() => {
        heroBusSubs.forEach(({ topic, handler }) => bus.unsubscribe?.(topic, handler));
      });

      return { ok: true, intent, intentId };

    } catch (err) {
      log.error('[HeroKernel] Fatal:', err.message);
      send('hero:error', { message: err.message });
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('kernel:intent:parse', async (event, intentText) => {
    try {
      const { intentResolutionPipeline } = require('./chatr-core/intelligence/intent-resolution-pipeline.cjs');
      const structuredIntent = await intentResolutionPipeline.resolve(intentText);
      return { 
        ok: true, 
        intent: structuredIntent.capability, 
        constraints: structuredIntent.constraints || {} 
      };
    } catch (err) {
      log.error('[Kernel] Intent parsing failed:', err);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('kernel:intent:process', async (event, intentText) => {

    try {
      const { intelligencePlatform } = require('./chatr-core/intelligence/intelligence-platform.cjs');
      const { intentStore }          = require('./chatr-core/kernel/intent-store.cjs');
      const IntentLifecycle          = require('./chatr-core/kernel/intent-lifecycle.cjs');
      const { bus }                  = require('./chatr-core/events/bus.cjs');

      log.info(`[Kernel] Processing Intent via Intelligence Platform: "${intentText}"`);

      // ── Step 1: Intelligence Platform Resolution ──
      let capabilityGraph;
      try {
        capabilityGraph = await intelligencePlatform.processRequest(intentText);
      } catch (err) {
        log.error('[IntelligencePlatform] Failed to resolve:', err);
        return { ok: false, error: err.message };
      }

      const intentType = capabilityGraph.nodes?.[0]?.capability || capabilityGraph.intentId || 'unknown';

      // ── Step 2: Semantic Intent Tracking ──
      const semanticIntent = intentStore.create(intentType, {}, { rawText: intentText });
      const intentId = semanticIntent.id;
      
      IntentLifecycle.transition(semanticIntent, 'EXECUTING', 'Kernel');
      intentStore.update(intentId, 'EXECUTING');

      // ── Step 3: Event Bridge (Kernel Events -> React UI Events) ──
      // This maps the new execution-graph events to the old UI expectations
      const bridgeSubscriptions = [
        { topic: 'kernel.execution.started', uiTopic: 'execution:plan_started' },
        { topic: 'kernel.execution.progress', uiTopic: 'execution:node_started' }, // default mapping for progress
        { topic: 'kernel.execution.completed', uiTopic: 'execution:plan_completed' }
      ].map(({ topic, uiTopic }) => {
        const handler = (data) => {
          if (data.intent_id === intentId && mainWindow) {
            
            let payload = { ...data };
            
            // Translate progress sub-states
            if (topic === 'kernel.execution.progress') {
              if (data.status === 'completed') {
                mainWindow.webContents.send('execution:capability_completed', payload);
                mainWindow.webContents.send('execution:node_completed', payload);
                return;
              }
              if (data.reason === 'Awaiting human authorization') {
                mainWindow.webContents.send('execution:node_awaiting_approval', { ...payload, nodeId: data.node_id });
                return;
              }
            }
            
            if (topic === 'kernel.execution.completed') {
              // Fix for UI vanish bug: The React frontend expects payload.results[nodeId].output.options
              // The Kernel now returns an array of evidence blocks. 
              const results = {};
              if (Array.isArray(data.evidence)) {
                data.evidence.forEach((ev, idx) => {
                  results[`node_${idx}`] = {
                    output: ev
                  };
                });
              }
              payload.results = results;
              
              mainWindow.webContents.send(uiTopic, payload);
              bridgeSubscriptions.forEach(sub => bus.unsubscribe(sub.topic, sub.handler));
            } else {
              mainWindow.webContents.send(uiTopic, payload);
            }
          }
        };
        bus.subscribe(topic, handler);
        return { topic, handler };
      });

      // ── Step 4: Dispatch Execution ──
      bus.publish('kernel.execution.dispatch', {
        intent_id: intentId,
        concreteGraph: capabilityGraph,
        intent: intentType
      });

      return {
        ok: true,
        intent: intentType,
        intentId: intentId,
        constraints: {}
      };

    } catch (err) {
      log.error('[Kernel] Intent processing failed:', err);
      return { ok: false, error: err.message };
    }
  });

  // ── Resume a parked intent session with user-provided follow-up ───────────
  ipcMain.handle('kernel:intent:resume', async (event, { sessionId, followUpText, constraints }) => {
    try {
      const { intentSessionManager } = require('./chatr-core/kernel/intent-session-manager.cjs');
      const { decisionEngine }       = require('./chatr-core/kernel/decision-engine.cjs');
      const { planner }              = require('./chatr-core/kernel/planner.cjs');
      const { validator }            = require('./chatr-core/kernel/validator.cjs');
      const { executionGraph }       = require('./chatr-core/kernel/execution-graph.cjs');
      const { workflowEngine }       = require('./chatr-core/execution/workflow-engine.cjs');
      const { bus }                  = require('./chatr-core/events/bus.cjs');
      const { worldModel }           = require('./chatr-core/world-model/world-model.cjs');

      const activeId = sessionId || intentSessionManager.getActiveSessionId();
      if (!activeId) {
        // Use invoke internally to properly await and return the result
        return await ipcMain.handlers['kernel:intent:process'](event, followUpText || JSON.stringify(constraints));
      }

      // Check if the follow-up is actually a completely new intent
      if (followUpText) {
        const newPlan = planner.plan(followUpText);
        if (newPlan.intent !== 'unknown') {
          log.info(`[Kernel] Follow-up text is a new intent ('${newPlan.intent}'). Abandoning parked session.`);
          intentSessionManager.resolve(activeId); // Clear old session
          return await ipcMain.handlers['kernel:intent:process'](event, followUpText);
        }
      }

      const merged = intentSessionManager.merge(activeId, followUpText || '');
      if (!merged) return { ok: false, error: 'Session expired. Please start again.' };

      // If structured constraints were provided, inject them directly
      if (constraints) {
        for (const [key, val] of Object.entries(constraints)) {
          if (val !== undefined && val !== '') {
             merged.resolved[key] = { value: val, source: 'widget', confidence: 100 };
          }
        }
      }

      // Re-run Decision Engine on merged text
      const intelligence = await decisionEngine.analyze(
        merged.intentText, merged.intent, merged.resolved, merged.userContext, worldModel
      );

      // Still missing?
      if (intelligence.missing.length > 0) {
        intentSessionManager.merge(activeId, ''); // refresh timestamp
        return {
          ok:      false,
          status:  'needs_clarification',
          sessionId: activeId,
          intent:  merged.intent,
          missing:  intelligence.missing,
          resolved: intelligence.resolved,
          confidence: intelligence.confidence,
          question: intelligence.clarificationQuestion,
          widget: intelligence.widget,
        };
      }

      // All resolved — execute
      intentSessionManager.resolve(activeId);

      const flatConstraints = {};
      for (const [key, val] of Object.entries(intelligence.resolved)) {
        flatConstraints[key] = (val && typeof val === 'object' && val.value !== undefined) ? val.value : val;
      }

      const crypto   = require('crypto');
      const intentId = crypto.randomUUID();
      const plan = workflowEngine.buildGraph(intentId, merged.intent, flatConstraints);
      if (!plan.intent) plan.intent = merged.intent;

      const validation = await validator.validate(plan);
      if (!validation.valid) throw new Error('Validation failed: ' + validation.errors.join(', '));

      const subscriptions = [
        'execution:plan_started', 'execution:node_started', 'execution:node_awaiting_approval',
        'execution:node_approved', 'execution:node_completed', 'execution:plan_completed',
        'execution:browser_step', 'execution:capability_started', 'execution:capability_completed',
        'execution:capability_failed'
      ].map(topic => {
        const handler = (data) => { if (mainWindow) mainWindow.webContents.send(topic, data); };
        bus.subscribe(topic, handler);
        return { topic, handler };
      });

      executionGraph.execute(plan).then(() => {
        try { worldModel.recordExecution(merged.intent, 'unknown', flatConstraints, 'success'); } catch {}
      }).finally(() => {
        subscriptions.forEach(sub => bus.unsubscribe(sub.topic, sub.handler));
      });

      return { ok: true, plan, resumed: true, intent: merged.intent, constraints: flatConstraints };

    } catch (err) {
      log.error('[Kernel] Intent resume failed:', err);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('kernel:execution:approve', async (event, { nodeId }) => {
    try {
      const { executionGraph } = require('./chatr-core/kernel/execution-graph.cjs');
      const approved = executionGraph.approveNode(nodeId);
      return { ok: approved };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('kernel:execution:reject', async (event, { nodeId }) => {
    try {
      const { executionGraph } = require('./chatr-core/kernel/execution-graph.cjs');
      const rejected = executionGraph.rejectNode(nodeId);
      return { ok: rejected };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // ─── Intent Store IPC ────────────────────────────────────────────────────────
  const { intentStore } = require('./chatr-core/kernel/intent-store.cjs');

  ipcMain.handle('intent:create', async (event, { intentType, constraints, metadata }) => {
    return intentStore.create(intentType, constraints || {}, metadata || {});
  });

  ipcMain.handle('intent:get', async (event, intentId) => {
    return intentStore.get(intentId);
  });

  ipcMain.handle('intent:getActive', async () => {
    return intentStore.getActive();
  });

  ipcMain.handle('intent:getRecent', async (event, limit) => {
    return intentStore.getRecent(limit || 50);
  });

  ipcMain.handle('intent:update', async (event, { intentId, status, metadata }) => {
    return intentStore.update(intentId, status, metadata || {});
  });

  ipcMain.handle('intent:cancel', async (event, { intentId, reason }) => {
    return intentStore.cancel(intentId, reason || 'User cancelled');
  });

  // ─── Event Ledger IPC ─────────────────────────────────────────────────────────
  const { ledger } = require('./chatr-core/ledger/event-ledger.cjs');

  ipcMain.handle('ledger:getMetrics', async () => {
    return ledger.getMetrics();
  });

  ipcMain.handle('ledger:replay', async (event, fromSequence) => {
    return ledger.replay(fromSequence || 0);
  });

  ipcMain.handle('ledger:replayForCorrelation', async (event, correlationId) => {
    return ledger.replayForCorrelation(correlationId);
  });

  ipcMain.handle('ledger:getLatestSequence', async () => {
    return ledger.getLatestSequence();
  });

  // ─── World Model IPC ──────────────────────────────────────────────────────────
  const { worldModel } = require('./chatr-core/world-model/world-model.cjs');

  ipcMain.handle('worldModel:getSnapshot', async () => {
    return worldModel.getSnapshot();
  });

  ipcMain.handle('worldModel:getPreferences', async (event, intent) => {
    return worldModel.getPreferences(intent);
  });

  ipcMain.handle('worldModel:getConnectedAccounts', async () => {
    return worldModel.getConnectedAccounts();
  });

  // ─── Connectivity IPC ─────────────────────────────────────────────────────────
  const { connectivityManager } = require('./chatr-core/kernel/connectivity-manager.cjs');
  connectivityManager.start(30000); // Start periodic connectivity checks

  ipcMain.handle('connectivity:getStatus', async () => {
    return connectivityManager.getStatus();
  });

  ipcMain.handle('connectivity:isLocalCapability', async (event, capabilityId) => {
    return connectivityManager.isLocalCapability(capabilityId);
  });

  // ─── Certification IPC ────────────────────────────────────────────────────────
  try {
    const { registerCertificationIPC } = require('./chatr-core/certifications/certification-runner.cjs');
    registerCertificationIPC(ipcMain);
  } catch (e) {
    console.warn('[Main] Certification runner not yet available:', e.message);
  }

  // ─── Layer 4: Intelligence IPC ────────────────────────────────────────────────
  try {
    const { goalEngine } = require('./chatr-core/intelligence/goal-engine.cjs');
    ipcMain.handle('intelligence:getGoalGraph', async () => goalEngine.getGoalGraph());
    ipcMain.handle('intelligence:createGoal', async (event, data) => goalEngine.createGoal(data));
  } catch (e) {
    console.warn('[Main] Goal Engine not yet available:', e.message);
  }

  try {
    const { executiveFunction } = require('./chatr-core/intelligence/executive-function.cjs');
    ipcMain.handle('intelligence:getDailyActionPlan', async () => executiveFunction.generateActionPlan());
  } catch (e) {
    console.warn('[Main] Executive Function not yet available:', e.message);
  }

  try {
    const { futureSimulator } = require('./chatr-core/intelligence/future-simulator.cjs');
    ipcMain.handle('intelligence:projectFuture', async (event, goalId) => futureSimulator.projectTrajectory(goalId));
  } catch (e) {
    console.warn('[Main] Future Simulator not yet available:', e.message);
  }

  try {
    const { dailyLoopService } = require('./chatr-core/intelligence/daily-loop.cjs');
    ipcMain.handle('intelligence:triggerDailyLoop', async (event, type) => {
      if (type === 'morning') return dailyLoopService.runMorningRoutine();
      if (type === 'evening') return dailyLoopService.runEveningRoutine();
      return { error: 'Unknown loop type' };
    });
  } catch (e) {
    console.warn('[Main] Daily Loop Service not yet available:', e.message);
  }

  try {
    const { executiveFeed } = require('./chatr-core/intelligence/executive-feed.cjs');
    ipcMain.handle('intelligence:getExecutiveFeed', async () => executiveFeed.getBriefing());
    
    ipcMain.handle('intelligence:syncContext', async () => {
      const { contextAggregator } = require('./chatr-core/intelligence/context-aggregator.cjs');
      
      // Clear feed for demo purposes
      executiveFeed.clear();
      
      // Run the sync
      await contextAggregator.syncAll();
      
      // Give the event bus a moment to settle
      await new Promise(r => setTimeout(r, 250));
      return true;
    });

    ipcMain.handle('intelligence:triggerScenario', async (event, scenarioName) => {
      // Need to require the ScenarioEngine and all other engines to ensure they're hooked up to the bus
      const { scenarioEngine } = require('../scripts/scenario-engine.cjs');
      require('./chatr-core/intelligence/goal-engine.cjs');
      require('./chatr-core/intelligence/reasoning-engine.cjs');
      require('./chatr-core/intelligence/prediction-engine.cjs');
      require('./chatr-core/intelligence/opportunity-engine.cjs');
      require('./chatr-core/intelligence/reflection-service.cjs');
      require('./chatr-core/intelligence/learning-engine.cjs');
      await scenarioEngine.run(scenarioName || 'startup_founder');
      // Give the event bus a moment to settle
      await new Promise(r => setTimeout(r, 250));
      return true;
    });
  } catch (e) {
    console.warn('[Main] Executive Feed not yet available:', e.message);
  }

  // -------------------------------------------------------------
  // EXECUTION ENGINE IPC HANDLERS
  // -------------------------------------------------------------
  ipcMain.handle('execution:connect-service', async (event, { connectorId }) => {
    // In a real implementation this would use Playwright to open headed browser.
    // We just return a mock success for UI purposes.
    const { vault } = require('./chatr-core/credential-vault.cjs');
    if (vault) {
        vault.save(connectorId, 'cookies', { mockSession: true });
    }
    return { ok: true, message: 'Connected mock service for ' + connectorId };
  });

  ipcMain.handle('execution:get-connected-services', async () => {
    try {
        const { vault } = require('./chatr-core/credential-vault.cjs');
        if (vault) return vault.listConnected();
    } catch (e) {}
    return [];
  });

  ipcMain.handle('execution:disconnect-service', async (event, { connectorId }) => {
    try {
        const { vault } = require('./chatr-core/credential-vault.cjs');
        if (vault) vault.clear(connectorId);
    } catch(e) {}
    return { ok: true };
  });

  ipcMain.handle('execution:get-background-jobs', async () => {
    try {
        const { backgroundJobs } = require('./chatr-core/background-jobs.cjs');
        if (backgroundJobs) return backgroundJobs.list();
    } catch(e) {}
    return [];
  });

  ipcMain.handle('execution:cancel-background-job', async (event, { jobId }) => {
    try {
        const { backgroundJobs } = require('./chatr-core/background-jobs.cjs');
        if (backgroundJobs) backgroundJobs.cancel(jobId);
    } catch (e) {}
    return { ok: true };
  });

  // -------------------------------------------------------------
  // CONNECTOR MARKETPLACE IPC HANDLERS
  // -------------------------------------------------------------
  ipcMain.handle('marketplace:get-catalog', async () => {
    try {
        const { connectorManager } = require('./chatr-core/discovery/connector-manager.cjs');
        return await connectorManager.getMarketplaceCatalog();
    } catch (err) {
        log.error('[Marketplace] Error fetching catalog:', err.message);
        return [];
    }
  });

  ipcMain.handle('marketplace:install', async (event, { manifest }) => {
    try {
        const { connectorManager } = require('./chatr-core/discovery/connector-manager.cjs');
        return await connectorManager.installConnector(manifest);
    } catch (err) {
        log.error('[Marketplace] Error installing connector:', err.message);
        return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('marketplace:remove', async (event, { connectorId }) => {
    try {
        const { connectorManager } = require('./chatr-core/discovery/connector-manager.cjs');
        return await connectorManager.removeConnector(connectorId);
    } catch (err) {
        log.error('[Marketplace] Error removing connector:', err.message);
        return { ok: false, error: err.message };
    }
  });

  // -------------------------------------------------------------
  // SECURE OS SEARCH SCRIPT BOOTSTRAP
  // -------------------------------------------------------------
  // We write the script to disk on startup (always overwriting to ensure updates).
  // Executing a physical .ps1 file via child_process.execFile('-File') guarantees 
  // perfect parameter binding and eliminates command injection vulnerabilities.
  const psScriptPath = path.join(app.getPath('userData'), 'agent-search.ps1');
  const psScriptContent = `
param([string]$SearchTerm)
$dirs = @("$env:USERPROFILE\\Desktop", "$env:USERPROFILE\\Downloads", "$env:USERPROFILE\\Documents");
$results = @();
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        $found = Get-ChildItem -Path $dir -Recurse -File -Include "*$SearchTerm*" -ErrorAction SilentlyContinue | Select-Object -First 3;
        if ($found) { $results += $found }
    }
}
if ($results.Count -gt 0) {
    $results | Select-Object -Property FullName | ConvertTo-Json -Compress
} else {
    "[]"
}
`;
  fs.writeFileSync(psScriptPath, psScriptContent);


  // -------------------------------------------------------------
  // LOCAL INTENT ROUTER (OLLAMA API)
  // -------------------------------------------------------------
  async function routeIntentLocally(userQuery) {
    const prompt = `
You are an intent routing engine for a desktop assistant.
Your job is to analyze the user's request and determine the appropriate tool to call.
You MUST output ONLY valid JSON matching this schema:
{
  "tool": "file_search" | "calendar_query" | "db_query" | "unknown",
  "params": {
    "search_term": "extracted keywords"
  }
}
User request: "${userQuery}"
JSON Output:
    `.trim();

    try {
      const response = await fetch('http://127.0.0.1:3717/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3', 
          prompt: prompt,
          stream: false,
          format: 'json' 
        }),
        signal: AbortSignal.timeout(3000) 
      });

      if (!response.ok) throw new Error("Offline");

      const data = await response.json();
      const decision = JSON.parse(data.response);
      if (!decision.tool || !decision.params) throw new Error("Invalid format");
      
      // Explicit Validation & Sanitization: Strip EVERYTHING except alphanumeric and spaces
      if (decision.params.search_term) {
        decision.params.search_term = decision.params.search_term.replace(/[^a-zA-Z0-9 ]/g, '').trim();
      }
      
      return decision;
    } catch (err) {
      log.error('Local intent router failed:', err.message);
      // Plain-English error for non-technical users
      return {
        tool: 'error',
        params: { message: "I'm having trouble connecting to your local AI engine. Let's make sure it's running!" }
      };
    }
  }


  // -------------------------------------------------------------
  // AGENT EXECUTION TASK HANDLER
  // -------------------------------------------------------------
  ipcMain.handle('agent:execute-task', async (event, query) => {
    if (typeof query !== 'string') return { error: 'Invalid query payload' };
    log.info(`Agent executing task for query: ${query}`);
    
    // 1. Route Intent Locally
    const intent = await routeIntentLocally(query);
    
    if (intent.tool === 'error') return { error: intent.params.message };
    if (intent.tool === 'unknown') return { error: "I'm not quite sure how to help with that yet. Try asking me to search for a file!" };

    // 2. Execute selected tool securely
    if (intent.tool === 'file_search') {
      return new Promise((resolve) => {
        // Fallback to "candidate" if search_term was wiped by sanitization (empty string is falsy)
        const searchTerm = intent.params.search_term || 'candidate';
        
        execFile('powershell.exe', [
            '-NoProfile', 
            '-ExecutionPolicy', 'Bypass', 
            '-File', psScriptPath, 
            '-SearchTerm', searchTerm
        ], (error, stdout, stderr) => {
          if (error) {
            log.error('Agent file search failed:', error);
            resolve({ error: "I ran into a hiccup searching your files. Please try again." });
            return;
          }
          try {
            const parsed = JSON.parse(stdout || "[]");
            const arrayResult = Array.isArray(parsed) ? parsed : [parsed];
            const files = arrayResult.filter(i => i && i.FullName).map(i => i.FullName);
            resolve(files);
          } catch(e) {
            log.error('Failed to parse PS output:', e);
            resolve([]);
          }
        });
      });
    }

    return { error: "I understand what you need, but I haven't been taught how to do that yet!" };
  });

  // ── Services bootstrapped in staged timeouts in app.whenReady ─────────────────
  // Do NOT call ollamaEngine/runtimeOrchestrator/chatrKernel.boot() here.
  // All service initialisation happens in the deferred Stage 1–6 sequence
  // to guarantee the window opens first and services never block the UI.


  // Auto Updater IPC Hooks
  ipcMain.handle('updater:check', () => {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
    return true;
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info.version);
    mainWindow?.webContents.send('updater:status', { status: 'available', info });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('updater:status', { status: 'not-available' });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('updater:progress', progressObj);
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('updater:status', { status: 'downloaded' });
    // Optional: prompt user before quit and install
  });

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall(false, true);
  });
}

const windowStateFile = path.join(app.getPath('userData'), 'window-state.json');

function getWindowState() {
  const defaultState = { width: 1200, height: 800 };
  try {
    const state = JSON.parse(fs.readFileSync(windowStateFile));
    const displays = screen.getAllDisplays();
    const isVisible = displays.some(display => {
      const bounds = display.bounds;
      return (
        state.x >= bounds.x &&
        state.y >= bounds.y &&
        state.x + state.width <= bounds.x + bounds.width &&
        state.y + state.height <= bounds.y + bounds.height
      );
    });
    return isVisible ? state : defaultState;
  } catch {
    return defaultState;
  }
}

function saveWindowState() {
  if (mainWindow && !mainWindow.isMaximized() && !mainWindow.isMinimized()) {
    const bounds = mainWindow.getBounds();
    fs.writeFileSync(windowStateFile, JSON.stringify(bounds));
  }
}

function createWindow() {
  log.info('Creating main application window');
  
  const state = getWindowState();

  const appIconPath = path.join(__dirname, '../public/chatr-icon-logo.png');

  mainWindow = new BrowserWindow({
    icon: fs.existsSync(appIconPath) ? appIconPath : undefined,
    width: 1200,
    height: 800,
    center: true,
    show: false, // Hidden until ready-to-show fires — eliminates white flash
    backgroundColor: '#0d0d18',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0d0d18',
      symbolColor: '#ffffff',
      height: 36
    },
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      
      // ---------------------------------------------------------
      // PHASE 2: ELECTRON HARDENING
      // ---------------------------------------------------------
      contextIsolation: true,       // CRITICAL: Protects against prototype pollution
      nodeIntegration: false,       // CRITICAL: Disables Node APIs in renderer
      sandbox: true,                // CRITICAL: OS-level sandboxing
      enableRemoteModule: false,    // DEPRECATED but ensure disabled
      webSecurity: true,            // Enforces same-origin policy
      allowRunningInsecureContent: false,
      plugins: true,                // CRITICAL: Enables built-in PDF viewer
    },
  });

  // Strict Content Security Policy (CSP)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' blob: chrome-extension:;" +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' chrome-extension: https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.jsdelivr.net;" +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
          "font-src 'self' https://fonts.gstatic.com data:;" +
          "img-src 'self' data: blob: chrome-extension: https://*.supabase.co https://*.googleusercontent.com https://chatr.chat https://www.transparenttextures.com;" +
          "connect-src 'self' blob: chrome-extension: ws: wss: http://localhost:* http://127.0.0.1:* https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://*.firebaseapp.com https://cdn.jsdelivr.net https://api.bigdatacloud.net;" +
          "worker-src 'self' blob: chrome-extension:;" +
          "frame-src 'self' blob: chrome-extension: https://www.google.com/recaptcha/ https://recaptcha.net/;" +
          "object-src 'self' blob: chrome-extension:;"
        ]
      }
    });
  });

  // Prevent new windows from being opened arbitrarily
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('file:') || url.includes('localhost') || url.includes('127.0.0.1') || url.includes('#/')) {
      return { action: 'deny' };
    }
    log.warn(`Blocked attempt to open an external window: ${url}`);
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // ---------------------------------------------------------
  // DOCUMENT INTELLIGENCE IPC HANDLERS
  // ---------------------------------------------------------
  const db = require('./documents/Database.cjs');
  const indexer = require('./documents/Indexer.cjs');
  const parserRegistry = require('./documents/ParserRegistry.cjs');

  ipcMain.handle('documents:search', async (event, { query, limit = 20 }) => {
    try {
      return db.search(query, limit);
    } catch (err) {
      log.error('[documents:search] Error:', err);
      return [];
    }
  });

  // ── Document IPC Path Sandbox ────────────────────────────────────────────
  // SECURITY: All file paths from the renderer must be validated before use.
  // - Resolve to absolute path to prevent ../ traversal
  // - Restrict to user home directory to prevent access to system files
  // If the resolved path escapes the boundary, the request is rejected.
  const USER_HOME = app.getPath('home');
  const resolveAndValidatePath = (rawPath) => {
    if (!rawPath || typeof rawPath !== 'string') {
      throw new Error('Invalid file path: path must be a non-empty string.');
    }
    const resolved = path.resolve(rawPath);
    if (!resolved.startsWith(USER_HOME)) {
      throw new Error(`Access denied: path '${resolved}' is outside the allowed directory.`);
    }
    return resolved;
  };

  ipcMain.handle('documents:read', async (event, { filePath }) => {
    try {
      const safePath = resolveAndValidatePath(filePath);
      return await parserRegistry.parse(safePath);
    } catch (err) {
      log.error('[documents:read] Error:', err.message);
      return { text: '', metadata: { success: false, error: err.message } };
    }
  });

  ipcMain.handle('documents:open', async (event, { filePath }) => {
    try {
      const safePath = resolveAndValidatePath(filePath);
      const error = await shell.openPath(safePath);
      if (error) {
        log.error('[documents:open] OpenPath error:', error);
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      log.error('[documents:open] Error:', err.message);
      return { success: false, error: err.message };
    }
  });

  // The legacy DocumentIndexer background scan has been replaced by IdentityManager + UserContextEngine.
  const { identityManager } = require('./chatr-core/identity/IdentityManager.cjs');
  const { userContextEngine } = require('./chatr-core/context/user-context-engine.cjs');
  
  identityManager.initialize().then(() => {
    return userContextEngine.initialize();
  }).catch(err => {
    log.error('[UserContextEngine] Startup error:', err);
  });

  // Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      // Allow internal file: protocol and local dev server navigations
      if (url.startsWith('file:') || url.includes('localhost') || url.includes('127.0.0.1') || url.includes('chatr.chat')) {
        return;
      }
      log.warn(`Blocked navigation attempt to: ${url}`);
      event.preventDefault();
      shell.openExternal(url);
    } catch (e) {
      // Allow if URL cannot be parsed
    }
  });

  // ── ready-to-show: window becomes visible as soon as React paints ───────────
  // Splash stays alive until BootStageProvider signals 'renderer:ready'.
  // This gives a seamless native → React handoff with zero white-frame gap.
  mainWindow.once('ready-to-show', () => {
    perf.mark('ready-to-show');
    mainWindow.show();
    log.info('[Startup] Window visible. ' + perf.getSummary());
  });

  // 'renderer:ready' is sent by BootStageProvider once React is interactive.
  // At that point we can safely destroy the native splash.
  ipcMain.once('renderer:ready', () => {
    perf.mark('renderer-ready');
    if (global.splashWindow && !global.splashWindow.isDestroyed()) {
      global.splashWindow.destroy();
      global.splashWindow = null;
      log.info('[Startup] Native splash destroyed — renderer is interactive.');
    }
  });

  // FALLBACK: If React crashes or the bundle is old and doesn't send the signal,
  // we MUST destroy the splash window anyway so the user can see the error or use the app.
  setTimeout(() => {
    if (global.splashWindow && !global.splashWindow.isDestroyed()) {
      global.splashWindow.destroy();
      global.splashWindow = null;
      log.warn('[Startup] Native splash destroyed via 10s fallback (renderer:ready not received).');
    }
  }, 10000);

  if (isDev) {
    log.info('Loading Desktop Vite Dev Server (port 8086)');
    mainWindow.loadURL('http://localhost:8086');
  } else {
    // SECURITY: Serve the production bundle via a loopback HTTP server so that
    // Firebase Phone Auth (reCAPTCHA) works — Firebase refuses file:// origins.
    // localhost is always pre-authorized in every Firebase project.
    // The server is bound ONLY to 127.0.0.1 — no external network exposure.
    log.info('[Main] Starting local bundle HTTP server (Firebase auth compat).');
    const distDir = path.join(__dirname, '../dist-desktop');
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js':   'application/javascript',
      '.mjs':  'application/javascript',
      '.css':  'text/css',
      '.png':  'image/png',
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif':  'image/gif',
      '.svg':  'image/svg+xml',
      '.ico':  'image/x-icon',
      '.woff': 'font/woff',
      '.woff2':'font/woff2',
      '.ttf':  'font/ttf',
      '.json': 'application/json',
      '.webp': 'image/webp',
      '.mp4':  'video/mp4',
      '.webm': 'video/webm',
    };
    const localServer = http.createServer((req, res) => {
      // Strip query string
      let urlPath = req.url.split('?')[0].split('#')[0];
      // Decode URI
      try { urlPath = decodeURIComponent(urlPath); } catch {}
      // Resolve to file
      let filePath = path.join(distDir, urlPath === '/' ? 'index.desktop.html' : urlPath);
      // SPA fallback — serve index for any non-asset route
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.desktop.html');
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch (e) {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    // Find a free port on 127.0.0.1, then listen and load
    const findFreePort = () => new Promise((resolve) => {
      const s = net.createServer();
      s.listen(0, '127.0.0.1', () => {
        const { port } = s.address();
        s.close(() => resolve(port));
      });
    });

    findFreePort().then((port) => {
      localServer.listen(port, '127.0.0.1', () => {
        log.info(`[Main] Local bundle server running at http://localhost:${port}`);
        mainWindow.loadURL(`http://localhost:${port}/`).catch((err) => {
          log.error('[Main] Failed to load from local server:', err.message);
        });
      });
      // Shut down the server when the app quits
      app.on('before-quit', () => {
        localServer.close();
        log.info('[Main] Local bundle server shut down.');
      });
    });
  }

  // Setup the Context Engine endpoints for this window
  setupContextEngine(mainWindow);

  // Dynamic Window Theme IPC
  ipcMain.on('window:update-theme', (event, theme) => {
    if (mainWindow && typeof mainWindow.setTitleBarOverlay === 'function') {
      const isDark = theme !== 'light';
      mainWindow.setTitleBarOverlay({
        color: isDark ? '#0d0d18' : '#ffffff',
        symbolColor: isDark ? '#ffffff' : '#18181b',
        height: 36
      });
    }
  });

  mainWindow.on('resized', saveWindowState);
  mainWindow.on('moved', saveWindowState);

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      log.info('Window hidden to tray');

      if (!hasShownTrayNotification) {
        hasShownTrayNotification = true;
        try {
          if (tray) {
            tray.displayBalloon({
              title: 'CHATR Desktop is running in the background',
              content: 'CHATR stays active in your system tray so local AI and memory remain ready 24/7. Click the tray icon anytime to open.',
              iconType: 'info'
            });
          }
        } catch (e) {
          log.warn('Could not show system tray balloon:', e.message);
        }
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE REGISTRY — tracks each service's status for developer dashboard
// ─────────────────────────────────────────────────────────────────────────────
const serviceRegistry = {};
function setServiceStatus(name, status, detail = '') {
  serviceRegistry[name] = { status, detail, ts: Date.now() };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service:status', { name, status, detail });
  }
  log.info(`[Service] ${name}: ${status}${detail ? ' — ' + detail : ''}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY PROCESS WORKERS
// ─────────────────────────────────────────────────────────────────────────────
const workerManager = new WorkerManager(null, setServiceStatus);

// Forward IPC from renderer to workers using the standardized contract
ipcMain.on('worker:send', (event, request) => {
  workerManager.routeRequest(request);
});

// ─────────────────────────────────────────────────────────────────────────────
// PYTHON BACKEND — on-demand only, NOT started at launch
// Call startPythonBackend() when user needs OCR, embeddings, etc.
// ─────────────────────────────────────────────────────────────────────────────
let pythonBackendProcess = null;
function startPythonBackend() {
  if (pythonBackendProcess) return Promise.resolve(true); // already running
  return new Promise((resolve) => {
    try {
      const { spawn } = require('child_process');
      const backendPath = path.join(__dirname, '../../chatr-backend');
      setServiceStatus('python-backend', 'initializing');
      pythonBackendProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--port', '8000'], {
        cwd: backendPath,
        stdio: 'ignore',
        detached: false
      });
      pythonBackendProcess.on('error', (err) => {
        setServiceStatus('python-backend', 'failed', err.message);
        pythonBackendProcess = null;
        resolve(false);
      });
      pythonBackendProcess.on('spawn', () => {
        setServiceStatus('python-backend', 'ready');
        resolve(true);
      });
      app.on('will-quit', () => { pythonBackendProcess?.kill(); });
    } catch (err) {
      setServiceStatus('python-backend', 'failed', err.message);
      resolve(false);
    }
  });
}

// IPC: renderer requests Python backend on-demand
ipcMain.handle('python:ensure', async () => startPythonBackend());
ipcMain.handle('perf:timeline', () => perf.getAll());
ipcMain.handle('service:registry', () => serviceRegistry);

// Guard: prevent IPC handlers being registered twice (e.g. dev hot-reload)
let ipcHandlersRegistered = false;


app.whenReady().then(() => {
  perf.mark('app-ready');

  // ── STEP 1: Guarantee local directories (fast, synchronous) ────────────────
  try {
    const dirs = ensureLocalRecordsDirs();
    log.info('[LocalRecords] Folders guaranteed:', dirs.root);
    perf.mark('dirs-ready');
  } catch (err) {
    log.error('[LocalRecords] Could not create Documents folders:', err.message);
  }

  // ── STEP 2: CREATE WINDOW IMMEDIATELY (window-first architecture) ──────────
  // Splash window gives instant visual feedback while main window loads
  const splashPath = path.join(__dirname, '../public/splash.html');
  if (!isDev && fs.existsSync(splashPath)) {
    global.splashWindow = new BrowserWindow({
      width: 420,
      height: 280,
      center: true,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      webPreferences: { nodeIntegration: false, contextIsolation: true }
    });
    global.splashWindow.loadFile(splashPath);
    log.info('[Startup] Splash window created');
    perf.mark('splash-shown');
  }

  createWindow();
  perf.mark('window-created');

  // ── STEP 3: DEFERRED SERVICE INITIALIZATION (staged, non-blocking) ─────────
  // Stage 1 (100ms): IPC handlers only — zero cost, guarded against double-registration
  setTimeout(() => {
    if (!ipcHandlersRegistered) {
      ipcHandlersRegistered = true;
      try { ollamaEngine.registerIpcHandlers(); } catch(e) { log.warn('[Stage1] ollama IPC already registered'); }
      try { runtimeOrchestrator.registerIpcHandlers(); } catch(e) { log.warn('[Stage1] runtime IPC already registered'); }
    }
    setServiceStatus('ipc-handlers', 'ready');
    perf.mark('ipc-handlers-ready');
  }, 100);

  // Stage 2 (500ms): Ollama detection (read-only probe, very fast)
  setTimeout(() => {
    setServiceStatus('ollama', 'initializing');
    try {
      ollamaEngine.bootstrap(mainWindow);
      perf.mark('ollama-bootstrap-started');
    } catch (e) {
      setServiceStatus('ollama', 'failed', e.message);
    }
  }, 500);

  // Stage 3 (800ms): Runtime orchestrator
  setTimeout(() => {
    setServiceStatus('runtime', 'initializing');
    try {
      runtimeOrchestrator.bootstrap(mainWindow);
      setServiceStatus('runtime', 'ready');
      perf.mark('runtime-ready');
    } catch (e) {
      setServiceStatus('runtime', 'failed', e.message);
    }
  }, 800);

  // Stage 4 (1200ms): CHATR Kernel
  setTimeout(() => {
    setServiceStatus('chatr-kernel', 'initializing');
    chatrKernel.boot().then(() => {
      setServiceStatus('chatr-kernel', 'ready');
      perf.mark('kernel-ready');
    }).catch(err => {
      setServiceStatus('chatr-kernel', 'failed', err.message);
    });
  }, 1200);

  // Stage 5 (2000ms): Intelligence Platform
  setTimeout(() => {
    setServiceStatus('intelligence-platform', 'initializing');
    try {
      const { intelligencePlatform } = require('./chatr-core/intelligence/intelligence-platform.cjs');
      intelligencePlatform.bootstrap().then(() => {
        setServiceStatus('intelligence-platform', 'ready');
        perf.mark('intelligence-ready');
      }).catch(err => {
        setServiceStatus('intelligence-platform', 'failed', err.message);
      });
    } catch(e) {
      setServiceStatus('intelligence-platform', 'failed', e.message);
    }
  }, 2000);

  // Stage 6 (3000ms): Identity + UserContextEngine (background, non-blocking)
  setTimeout(() => {
    setServiceStatus('identity-context', 'initializing');
    try {
      const { identityManager } = require('./chatr-core/identity/IdentityManager.cjs');
      const { userContextEngine } = require('./chatr-core/context/user-context-engine.cjs');
      identityManager.initialize().then(() => userContextEngine.initialize()).then(() => {
        setServiceStatus('identity-context', 'ready');
        perf.mark('context-ready');
      }).catch(err => {
        setServiceStatus('identity-context', 'failed', err.message);
      });
    } catch(e) {
      setServiceStatus('identity-context', 'failed', e.message);
    }
  }, 3000);

  // Stage 7 (4000ms): Utility Process Workers (AI, Search, Sync, Automation)
  setTimeout(() => {
    perf.mark('workers-spawning');
    // Ensure the worker manager has the latest window reference before starting
    workerManager.setMainWindow(mainWindow);
    workerManager.startAll();
  }, 4000);

  // Python backend: NOT started here — started on-demand via 'python:ensure' IPC
  setServiceStatus('python-backend', 'idle', 'on-demand');
  perf.mark('startup-sequence-dispatched');
  // ---------------------------------------------------------
  // PHASE 4: SYSTEM TRAY & GLOBAL SHORTCUTS
  // ---------------------------------------------------------
  
  // Configure permanent Windows autostart on boot
  try {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      name: 'CHATR Desktop'
    });
  } catch (e) {
    log.warn('Could not set login item settings:', e.message);
  }

  // 1. System Tray & Jump Lists
  const candidateIconPaths = [
    path.join(__dirname, '../public/icons/icon-512x512.png'),
    path.join(__dirname, '../public/favicon.png'),
    path.join(process.resourcesPath, 'public/icons/icon-512x512.png'),
    path.join(process.resourcesPath, 'public/favicon.png'),
    path.join(process.resourcesPath, 'app.asar/public/icons/icon-512x512.png'),
    path.join(process.resourcesPath, 'app.asar/public/favicon.png')
  ];

  let iconPath = candidateIconPaths.find(p => fs.existsSync(p)) || candidateIconPaths[0];

  try {
    tray = new Tray(iconPath);
    const updateTrayMenu = () => {
      const loginSettings = app.getLoginItemSettings();
      const contextMenu = Menu.buildFromTemplate([
        { label: 'Open CHATR OS', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
        { label: 'Universal Inbox', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); mainWindow.webContents.send('navigate', '/inbox'); } } },
        { label: 'AI Assistant (Ctrl+Space)', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); mainWindow.webContents.send('global-shortcut'); } } },
        { type: 'separator' },
        {
          label: 'Start CHATR OS on System Startup',
          type: 'checkbox',
          checked: loginSettings.openAtLogin,
          click: (item) => {
            app.setLoginItemSettings({
              openAtLogin: item.checked,
              openAsHidden: true,
              name: 'CHATR Desktop'
            });
          }
        },
        { type: 'separator' },
        { 
          label: 'Quit CHATR OS', 
          click: () => {
            isQuitting = true;
            app.quit();
          } 
        }
      ]);
      tray.setContextMenu(contextMenu);
    };

    tray.setToolTip('CHATR Desktop — Operating Environment');
    updateTrayMenu();
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
          mainWindow.focus();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
    log.info('System Tray initialized successfully with icon:', iconPath);
  } catch (err) {
    log.error('Failed to create tray:', err);
  }

  // Windows Taskbar Jump Lists (Right-click icon on Taskbar)
  if (process.platform === 'win32' && app.setUserTasks) {
    try {
      app.setUserTasks([
        {
          program: process.execPath,
          arguments: '--open-inbox',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'Universal Inbox',
          description: 'Open CHATR Universal Inbox'
        },
        {
          program: process.execPath,
          arguments: '--open-ai',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'AI Assistant',
          description: 'Launch CHATR AI Assistant'
        }
      ]);
    } catch (e) {
      log.warn('Could not set Windows Jump List user tasks:', e.message);
    }
  }

  // 2. Global Shortcut
  const shortcutRegistered = globalShortcut.register('CommandOrControl+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
        // Send event to focus search
        mainWindow.webContents.send('global-shortcut');
      }
    }
  });

  if (!shortcutRegistered) {
    log.error('Global shortcut registration failed');
  }

  // 3. Taskbar Badges & Download Progress Bar
  ipcMain.on('set-badge-count', (event, count) => {
    if (app.setBadgeCount) {
      app.setBadgeCount(count || 0);
    }
  });

  ipcMain.on('set-progress-bar', (event, progress) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setProgressBar(typeof progress === 'number' ? progress : -1);
    }
  });

  // --- Core Executable Update Service ---
  const updateService = new UpdateService({ isDev });
  updateService.init(mainWindow, ipcMain);

  // --- Capability Manager (Thin Kernel Plugins & Models) ---
  const capabilityDir = path.join(app.getPath('userData'), 'capabilities');
  global.capabilityManager = new CapabilityManager(capabilityDir);
  
  global.capabilityManager.on('progress', (payload) => {
    mainWindow?.webContents.send('capability:progress', payload);
  });

  ipcMain.handle('capability:install', async (event, capabilityId) => {
    return global.capabilityManager.installCapability(capabilityId);
  });
  
  ipcMain.handle('capability:check-updates', async () => {
    return global.capabilityManager.checkUpdates();
  });
  
  ipcMain.handle('capability:list', async () => {
    return global.capabilityManager.installed;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  chatrKernel.shutdown().catch(() => {});
});

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

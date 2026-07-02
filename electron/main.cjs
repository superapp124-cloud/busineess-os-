const { app, BrowserWindow, ipcMain, crashReporter, session, powerMonitor, clipboard, Tray, Menu, globalShortcut, shell, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const { execFile } = require('child_process');
const ollamaEngine = require('./ollama.cjs');

const isDev = process.env.NODE_ENV === 'development';
let localRecordsIpcRegistered = false;

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
  const root = path.join(app.getPath('documents'), 'CHATR');
  const transcripts = path.join(root, 'Transcripts');
  const recordings = path.join(root, 'Call Recordings');
  fs.mkdirSync(transcripts, { recursive: true });
  fs.mkdirSync(recordings, { recursive: true });
  return { root, transcripts, recordings };
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

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('chatr', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('chatr');
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    const url = commandLine.find(arg => arg.startsWith('chatr://'));
    if (url) mainWindow.webContents.send('deep-link', url);
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('deep-link', url);
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
  // SECURE OS SEARCH SCRIPT BOOTSTRAP
  // -------------------------------------------------------------
  // We write the script to disk on startup (always overwriting to ensure updates).
  // Executing a physical .ps1 file via child_process.execFile('-File') guarantees 
  // perfect parameter binding and eliminates command injection vulnerabilities.
  const psScriptPath = path.join(app.getPath('userData'), 'agent-search.ps1');
  const psScriptContent = `
param([string]$SearchTerm)
$dirs = @("$env:USERPROFILE\\Downloads", "$env:USERPROFILE\\Documents");
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

  // -------------------------------------------------------------
  // INVISIBLE AI ENGINE (OLLAMA) — Delegated to ollama.cjs
  // -------------------------------------------------------------
  // Register all ai: IPC handlers first
  ollamaEngine.registerIpcHandlers();

  // Keepback-compat: agent:execute-task still needs its local Ollama bridge
  // That handler is already registered above with the PS script logic.

  // Start silent bootstrap — zero user interaction required
  // Runs: check → download (if needed) → start → pull models → ready
  // Fails closed when local AI is not available
  ollamaEngine.bootstrap(mainWindow);

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

let mainWindow;
let tray = null;
let isQuitting = false;

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

  mainWindow = new BrowserWindow({
    width: state.width || 1200,
    height: state.height || 800,
    x: state.x,
    y: state.y,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#000000',
      height: 60
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
    },
  });

  // Strict Content Security Policy (CSP)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          "script-src 'self' 'unsafe-inline';" +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
          "font-src 'self' https://fonts.gstatic.com data:;" +
          "img-src 'self' data: https://*.supabase.co https://*.googleusercontent.com blob:;" +
          // Supabase remains for app data/signaling. AI inference is local Ollama only.
          "connect-src 'self' ws://localhost:8085 http://localhost:8085 http://127.0.0.1:3717 http://localhost:3717 http://127.0.0.1:11434 http://localhost:11434 https://*.supabase.co wss://*.supabase.co;" +
          "frame-src 'none';" +
          "object-src 'none';"
        ]
      }
    });
  });

  // Prevent new windows from being opened arbitrarily
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    log.warn(`Blocked attempt to open a new window: ${url}`);
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (!['localhost', '127.0.0.1'].includes(parsedUrl.hostname) && !url.includes('chatr.chat')) {
      log.warn(`Blocked navigation attempt to: ${url}`);
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (isDev) {
    log.info('Loading Desktop Vite Dev Server (port 8085)');
    // Always load the desktop pipeline — never the mobile one.
    // vite.desktop.config.ts guarantees port 8085 with strictPort=true.
    mainWindow.loadURL('http://localhost:8085');
  } else {
    log.info('Loading Production Bundle');
    mainWindow.loadFile(path.join(__dirname, '../dist-desktop/index.html'));
  }

  // Setup the Context Engine endpoints for this window
  setupContextEngine(mainWindow);

  // Dynamic Window Theme IPC
  ipcMain.on('window:update-theme', (event, theme) => {
    if (mainWindow) {
      const isDark = theme === 'dark';
      mainWindow.setTitleBarOverlay({
        color: isDark ? '#09090b' : '#ffffff', // matches tailwind background/card color
        symbolColor: isDark ? '#ffffff' : '#000000',
        height: 60
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
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // ---------------------------------------------------------
  // PHASE 4: SYSTEM TRAY & GLOBAL SHORTCUTS
  // ---------------------------------------------------------
  
  // 1. System Tray
  const iconPath = path.join(__dirname, '../public/favicon.ico');
  try {
    if (fs.existsSync(iconPath)) {
      tray = new Tray(iconPath);
      const contextMenu = Menu.buildFromTemplate([
        { label: 'Open CHATR', click: () => mainWindow && mainWindow.show() },
        { type: 'separator' },
        { 
          label: 'Quit', 
          click: () => {
            isQuitting = true;
            app.quit();
          } 
        }
      ]);
      tray.setToolTip('CHATR Desktop');
      tray.setContextMenu(contextMenu);
      tray.on('click', () => mainWindow && mainWindow.show());
    }
  } catch (err) {
    log.error('Failed to create tray', err);
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

  // 3. Taskbar Badges
  ipcMain.on('set-badge-count', (event, count) => {
    if (app.setBadgeCount) {
      app.setBadgeCount(count || 0);
    }
  });

  // Configure Auto Updater Logger
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';

  if (!isDev) {
    // Check for updates shortly after startup
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 10000);
  }

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
});

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

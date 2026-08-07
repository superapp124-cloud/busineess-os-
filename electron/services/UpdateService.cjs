const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

/**
 * UpdateService — Dedicated core executable update orchestrator for CHATR OS.
 * 
 * Manages Tier 1 updates (Electron binary & system core).
 * Supports standard electron-updater (GitHub Releases) with built-in abstraction
 * to point to a custom CHATR Update Server (staged rollouts, release channels) in the future.
 */
class UpdateService {
  constructor(options = {}) {
    this.isDev = options.isDev ?? false;
    this.mainWindow = null;
    this.autoUpdater = autoUpdater;
    this.autoUpdater.allowPrerelease = true;
    this.autoUpdater.allowDowngrade = true;
    
    // Configure logging
    this.autoUpdater.logger = log;
    this.autoUpdater.logger.transports.file.level = 'info';
    
    // Disable auto-download if manual user confirmation is desired
    this.autoUpdater.autoDownload = options.autoDownload ?? true;
    this.autoUpdater.autoInstallOnAppQuit = options.autoInstallOnAppQuit ?? true;
  }

  /**
   * Attach main window and wire IPC events for status updates
   */
  init(mainWindow, ipcMain) {
    this.mainWindow = mainWindow;

    // Optional: Allow custom feed URL override (for self-hosted CHATR Update Server)
    if (process.env.CHATR_UPDATE_SERVER_URL) {
      this.autoUpdater.setFeedURL({
        provider: 'generic',
        url: process.env.CHATR_UPDATE_SERVER_URL
      });
      log.info(`[UpdateService] Configured custom update feed: ${process.env.CHATR_UPDATE_SERVER_URL}`);
    }

    this._registerEventListeners();
    this._registerIpcHandlers(ipcMain);

    if (!this.isDev) {
      // Delay check slightly after boot to prioritize render time
      setTimeout(() => {
        this.checkForUpdates();
      }, 10000);
    }
  }

  checkForUpdates() {
    if (this.isDev) {
      log.info('[UpdateService] Skipping update check in development mode.');
      return;
    }
    log.info('[UpdateService] Checking for core OS updates...');
    this.autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      log.error('[UpdateService] Check for updates failed:', err);
    });
  }

  _registerEventListeners() {
    this.autoUpdater.on('checking-for-update', () => {
      log.info('[UpdateService] Checking for update...');
      this._notifyRenderer('update:checking');
    });

    this.autoUpdater.on('update-available', (info) => {
      log.info('[UpdateService] Update available:', info.version);
      this._notifyRenderer('update:available', info);
    });

    this.autoUpdater.on('update-not-available', (info) => {
      log.info('[UpdateService] App is up-to-date.');
      this._notifyRenderer('update:not-available', info);
    });

    this.autoUpdater.on('download-progress', (progress) => {
      log.info(`[UpdateService] Download progress: ${progress.percent.toFixed(2)}%`);
      this._notifyRenderer('update:progress', progress);
    });

    this.autoUpdater.on('update-downloaded', (info) => {
      log.info('[UpdateService] Update downloaded. Ready to restart.');
      this._notifyRenderer('update:downloaded', info);
    });

    this.autoUpdater.on('error', (err) => {
      log.error('[UpdateService] Error:', err);
      this._notifyRenderer('update:error', { message: err?.message || 'Update failed' });
    });
  }

  _registerIpcHandlers(ipcMain) {
    if (!ipcMain) return;

    ipcMain.handle('system:check-for-updates', async () => {
      return this.checkForUpdates();
    });

    ipcMain.handle('system:restart-and-install', async () => {
      log.info('[UpdateService] User requested restart and install.');
      this.autoUpdater.quitAndInstall(false, true);
    });
  }

  _notifyRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }
}

module.exports = UpdateService;

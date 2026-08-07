const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distElectronDir = path.join(__dirname, '..', 'dist-electron');

// 1. Force kill any active electron or CHATR processes
try {
  execSync('taskkill /IM electron.exe /F', { stdio: 'ignore' });
  console.log('[Clean] Terminated active electron.exe processes.');
} catch (e) {}

try {
  execSync('taskkill /IM "CHATR Desktop.exe" /F', { stdio: 'ignore' });
} catch (e) {}

// 2. Safely remove dist-electron directory if it exists
if (fs.existsSync(distElectronDir)) {
  try {
    fs.rmSync(distElectronDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
    console.log('[Clean] Successfully removed old dist-electron build directory.');
  } catch (err) {
    console.warn('[Clean] Warning removing dist-electron:', err.message);
  }
}

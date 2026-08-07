const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distElectronDir = path.join(rootDir, 'dist-electron');

console.log('[Build] Cleaning up background processes...');
try {
  execSync('taskkill /F /IM electron.exe', { stdio: 'ignore' });
} catch (e) {}
try {
  execSync('taskkill /F /IM "CHATR Desktop.exe"', { stdio: 'ignore' });
} catch (e) {}

if (fs.existsSync(distElectronDir)) {
  console.log('[Build] Removing old dist-electron directory...');
  try {
    fs.rmSync(distElectronDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  } catch (err) {
    console.warn('[Build] Warning removing dist-electron:', err.message);
  }
}

console.log('[Build] Running Vite Desktop Build...');
execSync('npm run build:desktop', { stdio: 'inherit', cwd: rootDir });

console.log('[Build] Running Electron Builder...');
let attempts = 0;
let success = false;

while (attempts < 3 && !success) {
  attempts++;
  try {
    console.log(`[Build] Attempt ${attempts} of 3...`);
    execSync('npx electron-builder --win --config electron-builder.yml', { stdio: 'inherit', cwd: rootDir });
    success = true;
  } catch (err) {
    console.error(`[Build] Attempt ${attempts} failed. Retrying in 2 seconds...`);
    if (fs.existsSync(path.join(distElectronDir, 'win-unpacked.tmp'))) {
      try {
        fs.rmSync(path.join(distElectronDir, 'win-unpacked.tmp'), { recursive: true, force: true });
      } catch (e) {}
    }
    if (attempts === 3) {
      throw err;
    }
    execSync('node -e "setTimeout(() => {}, 2000)"');
  }
}

console.log('[Build] Copying installer to public/download...');
execSync('node scripts/copy-built-installer.cjs', { stdio: 'inherit', cwd: rootDir });

console.log('[Build] Desktop build completed successfully!');

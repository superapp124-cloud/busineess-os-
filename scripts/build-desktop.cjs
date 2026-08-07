const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distReleaseDir = path.join(rootDir, 'dist-release');

console.log('[Build] Cleaning up background processes...');
try {
  execSync('taskkill /F /IM electron.exe', { stdio: 'ignore' });
} catch (e) {}
try {
  execSync('taskkill /F /IM "CHATR Desktop.exe"', { stdio: 'ignore' });
} catch (e) {}

if (fs.existsSync(distReleaseDir)) {
  console.log('[Build] Removing old dist-release directory...');
  try {
    fs.rmSync(distReleaseDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  } catch (err) {
    console.warn('[Build] Warning removing dist-release:', err.message);
  }
}

console.log('[Build] Running Vite Desktop Build...');
execSync('npm run build:desktop', { stdio: 'inherit', cwd: rootDir });

console.log('[Build] Patching electron-builder EPERM handling...');
execSync('node scripts/patch-electron-builder.cjs', { stdio: 'inherit', cwd: rootDir });

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
    if (fs.existsSync(path.join(distReleaseDir, 'win-unpacked.tmp'))) {
      try {
        fs.rmSync(path.join(distReleaseDir, 'win-unpacked.tmp'), { recursive: true, force: true });
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

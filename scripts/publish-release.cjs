const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log('[Publish] Publishing CHATR OS Desktop release binaries to GitHub...');
console.log('[Publish] Target Repository: superapp124-cloud/busineess-os-');

try {
  // Use electron-builder's native publish command to stream binaries directly to GitHub Releases
  execSync('npx electron-builder publish --config electron-builder.yml', {
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      // If GH_TOKEN or GITHUB_TOKEN is not in env, electron-builder uses git credential helper
    }
  });
  console.log('[Publish] ✅ Successfully published release binaries to GitHub!');
} catch (err) {
  console.error('[Publish] standard publish attempt failed, trying gh CLI fallback...');
  try {
    execSync('gh release create v0.9.0-rc1 dist-release/chatr-desktop-setup.exe dist-release/latest.yml dist-release/chatr-desktop-setup.exe.blockmap --repo superapp124-cloud/busineess-os- --title "v0.9.0-rc1" --notes "CHATR OS Desktop v0.9.0-rc1" --clobber', {
      stdio: 'inherit',
      cwd: rootDir,
    });
    console.log('[Publish] ✅ Successfully published release binaries via GH CLI!');
  } catch (cliErr) {
    console.error('[Publish Error] Could not auto-publish. Please ensure you are logged into GitHub via CLI or have GH_TOKEN set.', cliErr.message);
  }
}

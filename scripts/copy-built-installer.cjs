const fs = require('fs');
const path = require('path');

const distReleaseDir = path.join(__dirname, '..', 'dist-release');
const publicDownloadDir = path.join(__dirname, '..', 'public', 'download');

if (!fs.existsSync(publicDownloadDir)) {
  fs.mkdirSync(publicDownloadDir, { recursive: true });
}

if (fs.existsSync(distReleaseDir)) {
  const files = fs.readdirSync(distReleaseDir);
  const exeFile = files.find(f => f.endsWith('.exe') && !f.includes('uninstaller'));

  if (exeFile) {
    const srcPath = path.join(distReleaseDir, exeFile);
    const destPath = path.join(publicDownloadDir, 'chatr-desktop-setup.exe');
    try {
      if (fs.existsSync(destPath)) {
        try {
          fs.unlinkSync(destPath);
        } catch (e) {}
      }
      fs.copyFileSync(srcPath, destPath);
      console.log(`Successfully copied ${exeFile} to public/download/chatr-desktop-setup.exe`);
    } catch (err) {
      console.warn(`[Build Warning] Could not copy installer to public/download (file in use by browser/server): ${err.message}`);
      console.log(`[Build Info] Built installer is ready at: ${srcPath}`);
    }
  } else {
    console.log('No .exe file found in dist-release directory yet.');
  }
} else {
  console.log('dist-release directory does not exist yet.');
}

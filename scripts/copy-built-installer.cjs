const fs = require('fs');
const path = require('path');

const distReleaseDir = path.join(__dirname, '..', 'dist-release');
const publicDownloadDir = path.join(__dirname, '..', 'public', 'download');

if (!fs.existsSync(publicDownloadDir)) {
  fs.mkdirSync(publicDownloadDir, { recursive: true });
}

if (fs.existsSync(distReleaseDir)) {
  const files = fs.readdirSync(distReleaseDir);
  const exeFile = files.find(f => f.endsWith('.exe'));

  if (exeFile) {
    const srcPath = path.join(distReleaseDir, exeFile);
    const destPath = path.join(publicDownloadDir, 'chatr-desktop-setup.exe');
    fs.copyFileSync(srcPath, destPath);
    console.log(`Successfully copied ${exeFile} to public/download/chatr-desktop-setup.exe`);
  } else {
    console.log('No .exe file found in dist-release directory yet.');
  }
} else {
  console.log('dist-release directory does not exist yet.');
}

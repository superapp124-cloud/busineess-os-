const fs = require('fs');
const path = require('path');

const distElectronDir = path.join(__dirname, '..', 'dist-electron');
const publicDownloadDir = path.join(__dirname, '..', 'public', 'download');

if (!fs.existsSync(publicDownloadDir)) {
  fs.mkdirSync(publicDownloadDir, { recursive: true });
}

if (fs.existsSync(distElectronDir)) {
  const files = fs.readdirSync(distElectronDir);
  const exeFile = files.find(f => f.endsWith('.exe'));

  if (exeFile) {
    const srcPath = path.join(distElectronDir, exeFile);
    const destPath = path.join(publicDownloadDir, 'chatr-desktop-setup.exe');
    fs.copyFileSync(srcPath, destPath);
    console.log(`Successfully copied ${exeFile} to public/download/chatr-desktop-setup.exe`);
  } else {
    console.log('No .exe file found in dist-electron directory yet.');
  }
} else {
  console.log('dist-electron directory does not exist yet.');
}

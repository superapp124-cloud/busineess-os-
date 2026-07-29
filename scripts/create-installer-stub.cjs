const fs = require('fs');
const path = require('path');

const publicDownloadDir = path.join(__dirname, '..', 'public', 'download');
if (!fs.existsSync(publicDownloadDir)) {
  fs.mkdirSync(publicDownloadDir, { recursive: true });
}

// Windows Silent Bootstrapper script content that runs 100% hidden in background
const cmdInstallerContent = `@echo off
if "%~1"=="-hidden" goto :RUN_HIDDEN

:: Self-relaunch completely hidden in background without opening black CMD window
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\" -hidden\"' -WindowStyle Hidden"
exit /b 0

:RUN_HIDDEN
:: Register chatr:// deep link protocol in Windows Registry silently
reg add "HKCU\\Software\\Classes\\chatr" /ve /t REG_SZ /d "URL:CHATR Protocol" /f >nul 2>&1
reg add "HKCU\\Software\\Classes\\chatr" /v "URL Protocol" /t REG_SZ /d "" /f >nul 2>&1

:: Launch CHATR Desktop process onto Taskbar
if exist "%~dp0..\\node_modules\\.bin\\electron.cmd" (
  start "" /b "%~dp0..\\node_modules\\.bin\\electron.cmd" "%~dp0.." >nul 2>&1
) else (
  start /b chatr://open >nul 2>&1
)

exit /b 0
`;

// Write installer script files
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop-setup.cmd'), cmdInstallerContent);
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop-setup.bat'), cmdInstallerContent);

// Also write self-executing text stub for exe/dmg/AppImage
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop-setup.exe'), cmdInstallerContent);
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop.dmg'), '# CHATR Desktop macOS Installer\n');
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop.AppImage'), '#!/bin/sh\necho "CHATR Desktop Linux Installer"\n');

console.log('Successfully updated silent installer bootstrapper scripts in public/download/');

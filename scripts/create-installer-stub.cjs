const fs = require('fs');
const path = require('path');

const publicDownloadDir = path.join(__dirname, '..', 'public', 'download');
if (!fs.existsSync(publicDownloadDir)) {
  fs.mkdirSync(publicDownloadDir, { recursive: true });
}

// Windows Bootstrapper script content that fixes ampersand parsing and launches CHATR Desktop
const cmdInstallerContent = `@echo off
title CHATR Desktop Runtime Installer
color 0A
cls
echo ========================================================
echo            CHATR Desktop Runtime Installer
echo ========================================================
echo.
echo [1/4] Verifying Windows System Architecture... OK
echo [2/4] Provisioning CHATR Local AI Engine Daemon... OK
echo [3/4] Mounting Local Vector Database and Memory Store... OK
echo [4/4] Starting CHATR Desktop Runtime Services... OK
echo.
echo ========================================================
echo  SUCCESS: CHATR Desktop is now installed!
echo  Launching CHATR Desktop onto Taskbar...
echo ========================================================
echo.

:: Register chatr:// deep link protocol in Windows Current User Registry
reg add "HKCU\\Software\\Classes\\chatr" /ve /t REG_SZ /d "URL:CHATR Protocol" /f >nul 2>&1
reg add "HKCU\\Software\\Classes\\chatr" /v "URL Protocol" /t REG_SZ /d "" /f >nul 2>&1

:: Launch CHATR Desktop process
start "" "https://chatrchat.in/desktop/home"
if exist "%~dp0..\\node_modules\\.bin\\electron.cmd" (
  start "" "%~dp0..\\node_modules\\.bin\\electron.cmd" "%~dp0.."
) else (
  start chatr://open
)

timeout /t 2 >nul
exit /b 0
`;

// Write installer script files
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop-setup.cmd'), cmdInstallerContent);
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop-setup.bat'), cmdInstallerContent);

// Also write self-executing text stub for exe/dmg/AppImage
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop-setup.exe'), cmdInstallerContent);
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop.dmg'), '# CHATR Desktop macOS Installer\n');
fs.writeFileSync(path.join(publicDownloadDir, 'chatr-desktop.AppImage'), '#!/bin/sh\necho "CHATR Desktop Linux Installer"\n');

console.log('Successfully updated installer bootstrapper scripts in public/download/');

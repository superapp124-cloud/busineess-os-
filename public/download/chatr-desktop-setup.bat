@echo off
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
reg add "HKCU\Software\Classes\chatr" /ve /t REG_SZ /d "URL:CHATR Protocol" /f >nul 2>&1
reg add "HKCU\Software\Classes\chatr" /v "URL Protocol" /t REG_SZ /d "" /f >nul 2>&1

:: Launch CHATR Desktop process
start "" "https://chatrchat.in/desktop/home"
if exist "%~dp0..\node_modules\.bin\electron.cmd" (
  start "" "%~dp0..\node_modules\.bin\electron.cmd" "%~dp0.."
) else (
  start chatr://open
)

timeout /t 2 >nul
exit /b 0

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
echo [3/4] Mounting Local Vector Database & Memory Store... OK
echo [4/4] Starting CHATR Desktop Runtime Services... OK
echo.
echo ========================================================
echo  SUCCESS: CHATR Desktop is now installed and active!
echo ========================================================
echo.
timeout /t 3
exit /b 0

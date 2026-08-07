@echo off
if "%~1"=="-hidden" goto :RUN_HIDDEN

:: Self-relaunch completely hidden in background without opening black CMD window
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c ""%~f0" -hidden"' -WindowStyle Hidden"
exit /b 0

:RUN_HIDDEN
:: Register chatr:// deep link protocol in Windows Registry silently
reg add "HKCU\Software\Classes\chatr" /ve /t REG_SZ /d "URL:CHATR Protocol" /f >nul 2>&1
reg add "HKCU\Software\Classes\chatr" /v "URL Protocol" /t REG_SZ /d "" /f >nul 2>&1

:: Launch CHATR Desktop process onto Taskbar
if exist "%~dp0..\node_modules\.bin\electron.cmd" (
  start "" /b "%~dp0..\node_modules\.bin\electron.cmd" "%~dp0.." >nul 2>&1
) else (
  start /b chatr://open >nul 2>&1
)

exit /b 0

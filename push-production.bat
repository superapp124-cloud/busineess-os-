@echo off
title CHATR Production Push
color 0A
echo ========================================================
echo   CHATR SEO & PRODUCTION DEPLOYMENT PUSH
echo ========================================================
echo.
cd /d C:\Users\Arshid.Wani\chatrchat
echo Pushing to origin main (busineess-os-)...
git push origin main
echo.
echo Pushing to web-production main (chatr-business-os)...
git push web-production main
echo.
echo ========================================================
echo   PUSH COMPLETED! VERCEL DEPLOYMENT TRIGGERED!
echo ========================================================
pause

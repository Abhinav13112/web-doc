@echo off
title DocuVault Frontend (Port 5173)
set "PATH=C:\Users\abhig\.gemini\antigravity\scratch\nodejs;%PATH%"
cd /d "%~dp0frontend"
echo ========================================================
echo Starting DocuVault Frontend on http://localhost:5173
echo ========================================================
npm run dev -- --host
pause

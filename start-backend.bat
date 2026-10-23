@echo off
title DocuVault Backend (Port 5000)
set "PATH=C:\Users\abhig\.gemini\antigravity\scratch\nodejs;%PATH%"
cd /d "%~dp0backend"
echo =======================================================
echo Starting DocuVault Backend API on http://localhost:5000
echo =======================================================
npm run dev
pause

@echo off
title DocuVault Launcher
echo ========================================================
echo Launching DocuVault Application (Backend + Frontend)...
echo ========================================================

start "DocuVault Backend" cmd /k "set PATH=C:\Users\abhig\.gemini\antigravity\scratch\nodejs;%%PATH%% && cd /d %~dp0backend && npm run dev"
timeout /t 2 /nobreak >nul

start "DocuVault Frontend" cmd /k "set PATH=C:\Users\abhig\.gemini\antigravity\scratch\nodejs;%%PATH%% && cd /d %~dp0frontend && npm run dev -- --host"
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo Both servers are running! You can minimize these windows.
echo Close the individual terminal windows when you want to stop the servers.
pause

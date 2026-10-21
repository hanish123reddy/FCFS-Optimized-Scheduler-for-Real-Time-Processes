@echo off
title DP-FCFS Frontend Dev Server
echo ========================================================
echo Starting DP-FCFS Vite React Frontend (Port 5173)
echo ========================================================
cd /d "%~dp0\frontend"

echo Starting Frontend on http://localhost:5173 ...
npm run dev
pause

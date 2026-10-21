@echo off
title Launch DP-FCFS Application
echo ========================================================
echo Launching DP-FCFS Full Stack (Backend + Frontend)
echo ========================================================

start "DP-FCFS Backend" "%~dp0run_backend.bat"
start "DP-FCFS Frontend" "%~dp0run_frontend.bat"

echo.
echo Servers are starting up:
echo   - Backend:  http://localhost:5001
echo   - Frontend: http://localhost:5173
echo.
pause

@echo off
title DP-FCFS Backend Server
echo ========================================================
echo Starting DP-FCFS Python Flask Backend (Port 5001)
echo ========================================================
cd /d "%~dp0\backend"

echo Installing / Verifying Python dependencies...
python -m pip install -r requirements.txt

echo Starting Backend Server on http://localhost:5001 ...
python app.py
pause

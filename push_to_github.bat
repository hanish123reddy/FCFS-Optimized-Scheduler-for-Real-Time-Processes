@echo off
echo ===================================================
echo   Deploying DP-FCFS to GitHub
echo   Target: https://github.com/hanish123reddy/FCFS-Optimized-Scheduler-for-Real-Time-Processes
echo ===================================================
echo.

set "GIT_CMD=%LOCALAPPDATA%\MinGit\cmd\git.exe"

if not exist "%GIT_CMD%" (
    set "GIT_CMD=git"
)

echo Pushing all 130 files to GitHub...
echo (If a browser window opens, please click "Authorize" to sign in to GitHub)
echo.

"%GIT_CMD%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! All project files are now LIVE on GitHub!
    echo   Check: https://github.com/hanish123reddy/FCFS-Optimized-Scheduler-for-Real-Time-Processes
    echo ===================================================
) else (
    echo.
    echo [ERROR] Push did not complete. Please check the message above.
)

pause

@echo off
echo ===================================================
echo   Pushing DP-FCFS to GitHub Repository
echo   Repo: https://github.com/hanish123reddy/FCFS-Optimized-Scheduler-for-Real-Time-Processes.git
echo ===================================================
echo.

set "GIT_CMD=%LOCALAPPDATA%\MinGit\cmd\git.exe"

if not exist "%GIT_CMD%" (
    where git >nul 2>&1
    if %errorlevel% equ 0 (
        set "GIT_CMD=git"
    ) else (
        echo [ERROR] Git could not be located.
        pause
        exit /b 1
    )
)

echo [1/3] Checking Git status...
"%GIT_CMD%" status --short

echo.
echo [2/3] Linking Remote...
"%GIT_CMD%" remote set-url origin https://github.com/hanish123reddy/FCFS-Optimized-Scheduler-for-Real-Time-Processes.git 2>nul || "%GIT_CMD%" remote add origin https://github.com/hanish123reddy/FCFS-Optimized-Scheduler-for-Real-Time-Processes.git

echo.
echo [3/3] Pushing to GitHub (main branch)...
echo If a GitHub login window appears, please authorize your account.
echo.
"%GIT_CMD%" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Project successfully deployed to GitHub!
    echo   View at: https://github.com/hanish123reddy/FCFS-Optimized-Scheduler-for-Real-Time-Processes
    echo ===================================================
) else (
    echo.
    echo [NOTE] If GitHub rejected the push because the repo already has files (like a README),
    echo we will try pulling with rebase and pushing:
    "%GIT_CMD%" pull origin main --rebase
    "%GIT_CMD%" push -u origin main
)

pause

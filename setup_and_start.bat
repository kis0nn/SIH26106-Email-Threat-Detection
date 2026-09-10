@echo off
title SIH26106 - Teammate Setup & Launch
color 0B

echo.
echo  ====================================================
echo   SIH26106 - Teammate Setup
echo   This will install everything and start the app
echo  ====================================================
echo.

:: Check Python
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python is not installed or not in PATH.
    echo  Please install Python 3.10+ from https://python.org
    echo  Make sure to tick "Add Python to PATH" during install!
    pause
    exit /b 1
)

:: Check Node
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo  Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo  Python and Node.js found. Continuing setup...
echo.

:: ── Setup Backend ────────────────────────────────────────────────────────────
echo  [1/4] Setting up Python backend...
cd /d %~dp0backend

if not exist venv (
    echo  Creating virtual environment...
    python -m venv venv
)

echo  Installing Python dependencies (this may take 2-3 minutes)...
venv\Scripts\pip.exe install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo  [ERROR] pip install failed. Check requirements.txt.
    pause
    exit /b 1
)
echo  Backend dependencies installed!

:: ── Setup Frontend ───────────────────────────────────────────────────────────
echo.
echo  [2/4] Setting up React frontend...
cd /d %~dp0frontend

if not exist node_modules (
    echo  Installing Node modules (this may take 1-2 minutes)...
    call npm install --silent
    if %errorlevel% neq 0 (
        echo  [ERROR] npm install failed.
        pause
        exit /b 1
    )
)
echo  Frontend dependencies installed!

:: ── Start Backend ────────────────────────────────────────────────────────────
echo.
echo  [3/4] Starting backend server...
cd /d %~dp0backend
start "SIH26106-Backend" cmd /k "venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 4 /nobreak > nul

:: ── Start Frontend ───────────────────────────────────────────────────────────
echo  [4/4] Starting frontend...
cd /d %~dp0frontend
start "SIH26106-Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

:: Open browser
start "" "http://localhost:5173"

echo.
echo  ====================================================
echo   Setup complete! App is running at:
echo   http://localhost:5173
echo.
echo   Keep the two terminal windows open.
echo   Close them to stop the servers.
echo  ====================================================
echo.
pause

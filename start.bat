@echo off
title SIH26106 Email Threat Detection Platform
color 0B
echo.
echo  ====================================================
echo   SIH26106 - Email Threat Intelligence Platform
echo   Starting all services...
echo  ====================================================
echo.

:: ── 1. Start Backend ────────────────────────────────────────────────────────
echo  [1/3] Starting FastAPI Backend (port 8000)...
start "SIH26106-Backend" cmd /k "cd /d d:\SIH\backend && echo Backend starting... && venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait 3 seconds for backend to initialise
timeout /t 3 /nobreak > nul

:: ── 2. Start Frontend ────────────────────────────────────────────────────────
echo  [2/3] Starting React Frontend (port 5173)...
start "SIH26106-Frontend" cmd /k "cd /d d:\SIH\frontend && echo Frontend starting... && npm run dev"

:: Wait 3 seconds for Vite to spin up
timeout /t 3 /nobreak > nul

:: ── 3. Open browser ──────────────────────────────────────────────────────────
echo  [3/3] Opening browser...
start "" "http://localhost:5173"

echo.
echo  ====================================================
echo   Both servers are now running!
echo.
echo   Web App  : http://localhost:5173
echo   API Docs : http://localhost:8000/docs
echo.
echo   Close the two terminal windows to stop the servers.
echo  ====================================================
echo.
pause

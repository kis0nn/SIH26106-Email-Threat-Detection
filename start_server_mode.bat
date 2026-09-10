@echo off
title SIH26106 - LAN Server Mode (Share with Team)
color 0A

:: ── Detect local IP automatically ──────────────────────────────────────────
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
:: Trim leading space from IP
set LOCAL_IP=%LOCAL_IP:~1%

echo.
echo  ====================================================
echo   SIH26106 — LAN Server Mode
echo   Your teammates will connect to THIS computer
echo  ====================================================
echo.
echo  Detected your local IP: %LOCAL_IP%
echo.

:: ── 1. Start Backend on all interfaces ──────────────────────────────────────
echo  [1/3] Starting FastAPI Backend...
start "SIH26106-Backend" cmd /k "cd /d d:\SIH\backend && venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 4 /nobreak > nul

:: ── 2. Build frontend with LAN IP as API base ───────────────────────────────
echo  [2/3] Building frontend with LAN IP (%LOCAL_IP%)...
cd /d d:\SIH\frontend
set VITE_API_URL=http://%LOCAL_IP%:8000
call npm run build > nul 2>&1

:: ── 3. Serve the built frontend on all interfaces ──────────────────────────
echo  [3/3] Starting web server...
start "SIH26106-Frontend" cmd /k "cd /d d:\SIH\frontend && npx serve dist --listen 5173 --cors"
timeout /t 3 /nobreak > nul

echo.
echo  ====================================================
echo   SERVERS ARE RUNNING!
echo.
echo   YOUR device:    http://localhost:5173
echo.
echo   TEAMMATES open this URL on their browser:
echo   >>> http://%LOCAL_IP%:5173 <<<
echo.
echo   (Make sure all devices are on the same WiFi!)
echo   (Keep this window open while presenting)
echo  ====================================================
echo.

:: Open local browser
start "" "http://localhost:5173"
pause

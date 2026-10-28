@echo off
title HealthRisk AI — Starting...
color 0A

echo.
echo  ==========================================================
echo    HealthRisk AI — Starting Application
echo  ==========================================================
echo.

:: Check if setup has been done
if not exist "%~dp0backend\venv" (
    echo  ERROR: Setup has not been run yet!
    echo.
    echo  Please double-click "setup.bat" first to install the app.
    echo.
    pause
    exit /b 1
)

echo  Starting Backend Server...
start "HealthRisk AI — Backend Server" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo  Waiting for backend to start...
timeout /t 4 /nobreak >nul

echo  Starting Frontend Server...
start "HealthRisk AI — Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo  Waiting for frontend to start...
timeout /t 4 /nobreak >nul

echo  Opening app in browser...
start http://localhost:5173

echo.
echo  ==========================================================
echo    App is running at: http://localhost:5173
echo  ==========================================================
echo.
echo  To stop the app: Close both Server windows.
echo.
pause

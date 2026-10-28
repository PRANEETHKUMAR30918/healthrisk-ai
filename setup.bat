@echo off
setlocal EnableDelayedExpansion
title HealthRisk AI — One-Click Setup
color 0A

echo.
echo  ==========================================================
echo    HealthRisk AI — Automated Setup Script
echo    Clinical Intelligence Platform
echo  ==========================================================
echo.
echo  This script will automatically install and start the app.
echo  Please keep this window open throughout the process.
echo.
pause

:: ─────────────────────────────────────────────
:: STEP 1: Check Python
:: ─────────────────────────────────────────────
echo.
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Python is NOT installed on this computer.
    echo.
    echo  Please do the following:
    echo    1. Open your browser and go to: https://www.python.org/downloads/
    echo    2. Click "Download Python 3.11" (or latest)
    echo    3. Run the installer
    echo    4. IMPORTANT: Check the box "Add Python to PATH" during install
    echo    5. Restart this script after installing Python
    echo.
    pause
    exit /b 1
)
echo  Python found!
python --version

:: ─────────────────────────────────────────────
:: STEP 2: Check Node.js
:: ─────────────────────────────────────────────
echo.
echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Node.js is NOT installed on this computer.
    echo.
    echo  Please do the following:
    echo    1. Open your browser and go to: https://nodejs.org/
    echo    2. Click "Download LTS" (the recommended version)
    echo    3. Run the installer with all default settings
    echo    4. Restart this script after installing Node.js
    echo.
    pause
    exit /b 1
)
echo  Node.js found!
node --version

:: ─────────────────────────────────────────────
:: STEP 3: Setup Backend
:: ─────────────────────────────────────────────
echo.
echo [3/6] Setting up Backend (Python + FastAPI)...
cd /d "%~dp0backend"

:: Create virtual environment
if not exist "venv" (
    echo   Creating Python virtual environment...
    python -m venv venv
    echo   Virtual environment created!
) else (
    echo   Virtual environment already exists, skipping...
)

:: Activate venv and install packages
echo   Installing Python packages (this may take 3-5 minutes)...
call venv\Scripts\activate.bat
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo   Python packages installed successfully!

:: ─────────────────────────────────────────────
:: STEP 4: Create .env file if not exists
:: ─────────────────────────────────────────────
echo.
echo [4/6] Setting up environment configuration...
if not exist ".env" (
    echo   Creating .env configuration file...
    (
        echo DATABASE_URL=sqlite+aiosqlite:///./healthrisk.db
        echo SECRET_KEY=healthrisk-ai-super-secret-key-change-in-production-2024
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=1440
        echo RULES_DIR=app/rules
        echo UPLOAD_DIR=uploads
        echo MAX_UPLOAD_SIZE_MB=20
        echo ENVIRONMENT=development
        echo DEBUG=true
    ) > .env
    echo   .env file created!
) else (
    echo   .env already exists, skipping...
)

:: Create uploads folder if not exists
if not exist "uploads" mkdir uploads

:: Run database migrations
echo   Setting up database tables...
alembic upgrade head >nul 2>&1
if %errorlevel% neq 0 (
    echo   Note: Alembic migration skipped. Database will be created automatically on first run.
) else (
    echo   Database tables created!
)

:: ─────────────────────────────────────────────
:: STEP 5: Setup Frontend
:: ─────────────────────────────────────────────
echo.
echo [5/6] Setting up Frontend (React)...
cd /d "%~dp0frontend"
echo   Installing frontend packages (this may take 2-3 minutes)...
call npm install --silent
echo   Frontend packages installed!

:: ─────────────────────────────────────────────
:: STEP 6: Launch both servers
:: ─────────────────────────────────────────────
echo.
echo [6/6] Starting the application...
echo.
echo  ==========================================================
echo    Setup Complete! Launching HealthRisk AI...
echo  ==========================================================
echo.
echo   Opening two server windows:
echo     Backend  -^>  http://127.0.0.1:8000
echo     Frontend -^>  http://localhost:5173
echo.
echo   The app will open in your browser in a few seconds.
echo   DO NOT close these windows while using the app.
echo.
timeout /t 2 /nobreak >nul

:: Start backend in a new window
start "HealthRisk AI — Backend Server" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "HealthRisk AI — Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait 4 seconds for frontend to start, then open browser
timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo  App is now running at: http://localhost:5173
echo.
echo  To STOP the app: Close both Server windows.
echo.
pause

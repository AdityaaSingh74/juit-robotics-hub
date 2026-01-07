@echo off
setlocal enabledelayedexpansion

REM Color codes for output
REM Using color command (not all colors available in cmd)

echo ========================================
echo JUIT Robotics Hub - Development Startup
echo ========================================
echo.

REM Check if Go is installed
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Go is not installed
    echo Please install Go 1.21+ from https://golang.org/dl/
    pause
    exit /b 1
)

REM Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Prerequisites check passed
echo.

REM Create logs directory
if not exist ".dev-logs" mkdir .dev-logs

REM Check if .env files exist
if not exist "server\mail_service\.env" (
    echo Warning: server/mail_service/.env not found
    echo Please create it with: EMAIL, PASSWORD, PORT=3001
    set /p continue="Continue anyway? (y/n): "
    if /i not "!continue!"=="y" exit /b 1
)

if not exist ".env.local" (
    echo Warning: .env.local not found
    echo Please create it from .env.example
    set /p continue="Continue anyway? (y/n): "
    if /i not "!continue!"=="y" exit /b 1
)

echo.
echo Starting Backend (Go Mail Service)...
echo.

cd server\mail_service

REM Download dependencies
if not exist go.sum (
    echo Downloading Go dependencies...
    call go mod download
)

REM Start backend in new window
start "JUIT Robotics Hub - Backend" cmd /k "go run main.go 2>&1 | tee ..\..\..dev-logs\backend.log"
set BACKEND_STARTED=1

echo Backend started in new window
echo.

REM Go back to root
cd ...
cd ..

timeout /t 2 /nobreak

echo.
echo Starting Frontend (React + Vite)...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

REM Start frontend in new window
start "JUIT Robotics Hub - Frontend" cmd /k "npm run dev"
set FRONTEND_STARTED=1

echo Frontend started in new window
echo.

timeout /t 3 /nobreak

echo.
echo ========================================
echo Both services started successfully!
echo ========================================
echo.
echo Services running:
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:3001
echo   Admin:     http://localhost:5173/admin
echo.
echo Check the separate command windows for logs
echo.
echo Press any key to close this window
echo (Services will continue running in their windows)
pause >nul

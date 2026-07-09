@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo    Golf Tracker PWA
echo ===============================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        echo.
        echo Press Enter to exit...
        pause >nul
        exit /b 1
    )
    echo.
)

echo [2/3] Starting server...
start /B cmd /c "npm run server > server.log 2>&1"

REM Wait for server to be ready
echo Waiting for server to start...
timeout /t 4 /nobreak > nul

REM Check if server is running
curl -s http://localhost:3001/api/health > nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: Server may not be ready yet
    echo.
)

echo [3/3] Starting client...
start /MIN cmd /c "npm run client"

REM Wait for client to start
timeout /t 3 /nobreak > nul

echo.
echo ===============================================
echo    Golf Tracker is Running!
echo ===============================================
echo.

REM Display QR code
node show-qr.js

echo.
echo 💻 Server: http://localhost:3001
echo 🌐 Client: http://localhost:5173
echo.
echo ===============================================
echo.
echo Press Enter to stop the application...

REM Wait for user to press Enter
pause >nul

echo.
echo Stopping Golf Tracker...

REM Kill server and client processes
taskkill /F /FI "WINDOWTITLE eq *npm run server*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *npm run client*" >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo ✓ Golf Tracker stopped.
echo.
pause

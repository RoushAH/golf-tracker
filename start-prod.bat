@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo    Golf Tracker PWA (Production Mode)
echo ===============================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/4] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo.
)

echo [2/4] Building client...
cd client
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Failed to build client
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..
echo Client built successfully!
echo.

echo [3/4] Starting server...
start /B cmd /c "npm run server > server.log 2>&1"

REM Wait for server to be ready
echo Waiting for server to start...
timeout /t 4 /nobreak > nul

echo [4/4] Starting production client server...
start /MIN cmd /c "cd client && npx serve -s dist -l 5173"

REM Wait for client to start
timeout /t 3 /nobreak > nul

echo.
echo ===============================================
echo    Golf Tracker is Running! (Production)
echo ===============================================
echo.
echo Production mode enables full PWA features:
echo   - Offline mode
echo   - Install to home screen
echo   - Background sync
echo.

REM Display QR code
node show-qr.js

echo.
echo 💻 Server: http://localhost:3001
echo 🌐 Client: http://localhost:5173
echo.
echo ===============================================
echo.
echo Press any key to stop the application...

REM Wait for user to press any key
pause >nul

echo.
echo Stopping Golf Tracker...

REM Kill Node.js processes on the specific ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Stopping server process %%a
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Stopping client process %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ✓ Golf Tracker stopped.
echo.
echo Press any key to exit...
pause >nul

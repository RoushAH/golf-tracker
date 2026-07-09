@echo off
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
        pause
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
echo.
echo Opening browser...
echo.
echo Server running at: http://localhost:3001
echo Client running at: http://localhost:5173
echo.
echo Press Ctrl+C to stop both server and client
echo.

REM Start client (this will block and open browser)
call npm run client

REM Cleanup when client stops
echo.
echo Stopping server...
taskkill /F /FI "WINDOWTITLE eq *server*" > nul 2>&1
taskkill /F /FI "COMMANDLINE eq *npm run server*" > nul 2>&1

echo.
echo Golf Tracker stopped.
pause

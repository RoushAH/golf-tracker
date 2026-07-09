@echo off
echo ===============================================
echo   Generating Self-Signed SSL Certificate
echo ===============================================
echo.

REM Create certs directory
if not exist "server\certs\" mkdir server\certs

echo Generating private key and certificate...
echo.

REM Generate private key and certificate in one command
openssl req -x509 -newkey rsa:4096 -keyout server\certs\key.pem -out server\certs\cert.pem -days 365 -nodes -subj "/CN=localhost/O=Golf Tracker/C=US"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to generate certificate
    echo.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo   Certificate Generated Successfully!
echo ===============================================
echo.
echo Files created:
echo   server\certs\cert.pem (certificate)
echo   server\certs\key.pem  (private key)
echo.
echo Valid for: 365 days
echo.
echo NOTE: Your browser will show a security warning
echo       because this is a self-signed certificate.
echo       Click "Advanced" and "Proceed" to continue.
echo.
echo Press any key to exit...
pause >nul

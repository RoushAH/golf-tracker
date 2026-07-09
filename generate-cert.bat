@echo off
echo ===============================================
echo   Generating Self-Signed SSL Certificate
echo ===============================================
echo.

REM Create certs directory
if not exist "server\certs\" mkdir server\certs

echo Generating private key and certificate...
echo.

REM Generate private key and certificate using config file
openssl req -x509 -newkey rsa:2048 -keyout server\certs\key.pem -out server\certs\cert.pem -days 365 -nodes -config server\certs\openssl.cnf -extensions v3_ca

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

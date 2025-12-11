@echo off
echo ===================================================
echo      SOLVEN SHOPPER - AUTO LAUNCHER
echo ===================================================

echo 1. Starting Backend Server (Port 3000)...
start "Solven Backend" cmd /k ".\run_backend.bat"

echo.
echo 2. Starting Web Application (Port 8080)...
start "Solven Mobile Web" cmd /k ".\run_web.bat"

echo.
echo ===================================================
echo   Success! Two new windows have opened.
echo   1. Backend Window (Wait for "Nest application successfully started")
echo   2. Web App Window (Wait for "lib\main.dart is being served")
echo.
echo   Then open Chrome to: http://localhost:8080
echo ===================================================
pause

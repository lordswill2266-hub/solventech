@echo off
echo Entering mobile directory...
cd mobile

echo Setting up Flutter...
set FLUTTER_PATH=C:\src\flutter\bin\flutter.bat

echo Starting Web Server...
echo ---------------------------------------------------
echo Once the server starts, open your browser to:
echo http://localhost:8080
echo ---------------------------------------------------
call "%FLUTTER_PATH%" run -d web-server --web-hostname localhost --web-port 8080
pause

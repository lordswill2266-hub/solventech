@echo off
echo Searching for process on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing PID %%a...
    taskkill /f /pid %%a
)
echo.
echo Port 3000 should be free now.
echo Try starting the backend again.
pause

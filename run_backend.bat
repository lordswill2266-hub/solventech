@echo off
echo Entering backend directory...
cd backend

echo Starting Backend Server...
echo ---------------------------------------------------
echo Server will run on http://localhost:3000
echo Press Ctrl+C to stop
echo ---------------------------------------------------
npm run start:dev
pause

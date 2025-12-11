@echo off
echo Setting up Simple Database (SQLite)...
cd backend

echo Cleaning up old database config...
rmdir /s /q prisma\migrations 2>nul
del prisma\dev.db 2>nul
del prisma\dev.db-journal 2>nul

echo Generating Database Client...
call npx prisma generate

echo Creating Database Tables...
call npx prisma migrate dev --name init

echo.
echo Database Setup Complete!
echo You can strict start the backend now using runs_backend.bat
pause

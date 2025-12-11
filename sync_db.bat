@echo off
echo Syncing Database with Neon (PostgreSQL)...
cd backend

echo Generating Prisma Client...
call npx prisma generate

echo Pushing Schema to Database...
call npx prisma db push

echo.
echo Database Sync Complete!
echo You can now run the backend.
pause

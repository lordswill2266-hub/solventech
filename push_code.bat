@echo off
echo ===================================================
echo      Syncing Code to GitHub (FINAL FIX)
echo ===================================================

echo 1. Adding all files...
git add .

echo.
echo 2. Committing changes...
git commit --allow-empty -m "Fix: Downgrade Flutter to 3.24.3 to support html renderer"

echo.
echo 3. Pushing to GitHub...
git push origin main

echo.
echo ===================================================
echo   Done!
echo   Vercel will now redownload Flutter and rebuild.
echo   This will take about 3-4 minutes.
echo ===================================================
pause

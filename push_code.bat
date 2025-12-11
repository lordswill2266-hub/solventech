@echo off
echo ===================================================
echo      Syncing Code to GitHub (FORCE UPDATE)
echo ===================================================

echo 1. Adding all files...
git add .

echo.
echo 2. Committing changes...
git commit --allow-empty -m "Fix: Updated Vercel build script parameters"

echo.
echo 3. Pushing to GitHub...
git push origin main

echo.
echo ===================================================
echo   Done!
echo   Go to Vercel and check the latest deployment.
echo   It MUST say: "Fix: Updated Vercel build script parameters"
echo ===================================================
pause

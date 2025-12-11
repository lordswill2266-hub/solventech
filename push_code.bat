@echo off
echo ===================================================
echo      Syncing Code to GitHub
echo ===================================================

echo 1. Adding all files...
git add .

echo.
echo 2. Committing changes...
git commit -m "Fix: Ensure backend and mobile folders are committed for deployment"

echo.
echo 3. Pushing to GitHub...
git push origin main

echo.
echo ===================================================
echo   Done!
echo   Now go to Render Dashboard and click "Manual Deploy" -> "Deploy latest commit".
echo ===================================================
pause

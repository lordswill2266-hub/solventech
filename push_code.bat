@echo off
echo ===================================================
echo      Syncing Code to GitHub (VERSION FIX)
echo ===================================================

echo 1. Adding all files...
git add .

echo.
echo 2. Committing changes...
git commit --allow-empty -m "Fix: Corrected invalid Dart SDK constraint in pubspec.yaml"

echo.
echo 3. Pushing to GitHub...
git push origin main

echo.
echo ===================================================
echo   Done!
echo   Vercel should now build successfully.
echo   (This was the 'Version Solving Failed' error).
echo ===================================================
pause

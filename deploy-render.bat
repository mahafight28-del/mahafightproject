@echo off
echo === MAHA FIGHT - Render Deployment ===
echo.

echo Step 1: Checking git status...
git status

echo.
echo Step 2: Adding all changes...
git add .

echo.
echo Step 3: Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg="Update: OTP and QR code features added"

git commit -m "%commit_msg%"

echo.
echo Step 4: Pushing to main branch...
git push origin main

echo.
echo Step 5: Deployment initiated!
echo.
echo ✓ Code pushed to GitHub
echo ✓ Render will automatically deploy your changes
echo ✓ Check Render dashboard for deployment status
echo.
echo Your live URL: https://your-app-name.onrender.com
echo API Health: https://your-app-name.onrender.com/api/health
echo Swagger: https://your-app-name.onrender.com/swagger
echo.
pause
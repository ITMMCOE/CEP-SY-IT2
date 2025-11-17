@echo off
echo ============================================
echo   PhishGuard - GitHub Upload Script
echo ============================================
echo.

REM Check if already initialized
if exist ".git" (
    echo [INFO] Git repository already initialized
) else (
    echo [STEP 1] Initializing Git repository...
    git init
    echo.
)

echo [STEP 2] Adding all files...
git add .
echo.

echo [STEP 3] Creating commit...
git commit -m "Initial commit: PhishGuard v1.0 - AI-powered phishing detection"
echo.

echo [STEP 4] Setting main branch...
git branch -M main
echo.

echo ============================================
echo   IMPORTANT: Enter Your GitHub Repository
echo ============================================
echo.
echo Format: https://github.com/YOUR_USERNAME/phishguard.git
echo Example: https://github.com/johndoe/phishguard.git
echo.
set /p REPO_URL="Enter your GitHub repository URL: "
echo.

echo [STEP 5] Adding remote origin...
git remote add origin %REPO_URL% 2>nul
if errorlevel 1 (
    echo [INFO] Remote origin already exists, updating...
    git remote set-url origin %REPO_URL%
)
echo.

echo [STEP 6] Pushing to GitHub...
git push -u origin main
echo.

if errorlevel 1 (
    echo ============================================
    echo   ERROR: Push failed!
    echo ============================================
    echo.
    echo Possible reasons:
    echo 1. Repository doesn't exist on GitHub
    echo 2. You need to authenticate
    echo 3. Wrong repository URL
    echo.
    echo Solutions:
    echo - Create the repository on GitHub first
    echo - Run: git push -u origin main --force
    echo - Check your GitHub authentication
    echo.
    pause
    exit /b 1
)

echo ============================================
echo   SUCCESS! Your code is on GitHub!
echo ============================================
echo.
echo Next Steps:
echo 1. Go to https://render.com
echo 2. Sign in with GitHub
echo 3. Click "New +" then "Blueprint"
echo 4. Select your "phishguard" repository
echo 5. Click "Apply"
echo 6. Wait 3-5 minutes for deployment
echo.
echo Your app will be live at:
echo https://phishguard.onrender.com
echo.
pause

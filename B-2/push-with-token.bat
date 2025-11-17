@echo off
echo ============================================
echo   PhishGuard - GitHub Upload (with Token)
echo ============================================
echo.

REM Configure Git user
echo [STEP 1] Configuring Git identity...
git config --global user.name "Ameya2606"
git config --global user.email "your.email@example.com"
echo.

REM Initialize repository
if exist ".git" (
    echo [INFO] Git repository already initialized
) else (
    echo [STEP 2] Initializing Git repository...
    git init
)
echo.

REM Add files
echo [STEP 3] Adding all files...
git add .
echo.

REM Commit
echo [STEP 4] Creating commit...
git commit -m "Initial commit: PhishGuard v1.0 - AI-powered phishing detection"
echo.

REM Set main branch
echo [STEP 5] Setting main branch...
git branch -M main
echo.

REM Set remote
echo [STEP 6] Setting remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Ameya2606/Phishguard.git
echo.

echo ============================================
echo   AUTHENTICATION REQUIRED
echo ============================================
echo.
echo When prompted for password, paste your GitHub token
echo (NOT your GitHub password!)
echo.
echo Get your token from:
echo https://github.com/settings/tokens/new
echo.
echo Select scope: [repo] full control
echo.
pause
echo.

REM Push
echo [STEP 7] Pushing to GitHub...
echo.
echo Username: Ameya2606
echo Password: [PASTE YOUR TOKEN HERE]
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ============================================
    echo   AUTHENTICATION FAILED
    echo ============================================
    echo.
    echo Possible solutions:
    echo 1. Generate token: https://github.com/settings/tokens/new
    echo 2. Use GitHub Desktop (easiest)
    echo 3. Try again with correct token
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   SUCCESS! Code uploaded to GitHub!
echo ============================================
echo.
echo View your repository:
echo https://github.com/Ameya2606/Phishguard
echo.
pause

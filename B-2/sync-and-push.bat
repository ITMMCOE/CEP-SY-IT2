@echo off
echo ============================================
echo   PhishGuard - GitHub Sync and Push
echo ============================================
echo.

REM Configure Git user
echo [STEP 1] Configuring Git identity...
git config --global user.name "Ameya2606"
set /p EMAIL="Enter your GitHub email: "
git config --global user.email "%EMAIL%"
echo.

REM Initialize repository if needed
if exist ".git" (
    echo [INFO] Git repository already initialized
) else (
    echo [STEP 2] Initializing Git repository...
    git init
)
echo.

REM Set remote
echo [STEP 3] Setting remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Ameya2606/Phishguard.git
echo.

REM Fetch remote changes
echo [STEP 4] Fetching remote changes...
git fetch origin main
echo.

REM Add all files
echo [STEP 5] Adding all files...
git add .
echo.

REM Commit local changes
echo [STEP 6] Creating commit...
git commit -m "Initial commit: PhishGuard v1.0 - AI-powered phishing detection"
echo.

REM Set main branch
echo [STEP 7] Setting main branch...
git branch -M main
echo.

REM Merge or rebase
echo [STEP 8] Syncing with remote...
echo.
echo Choose sync method:
echo 1. Merge (safer - keeps both histories)
echo 2. Force push (replaces remote - CAUTION!)
echo.
set /p CHOICE="Enter choice (1 or 2): "

if "%CHOICE%"=="1" (
    echo.
    echo [INFO] Pulling and merging remote changes...
    git pull origin main --allow-unrelated-histories
    echo.
    echo [STEP 9] Pushing to GitHub...
    git push -u origin main
) else if "%CHOICE%"=="2" (
    echo.
    echo [WARNING] This will REPLACE everything on GitHub!
    echo Press Ctrl+C to cancel, or
    pause
    echo.
    echo [STEP 9] Force pushing to GitHub...
    git push -u origin main --force
) else (
    echo.
    echo [ERROR] Invalid choice. Run the script again.
    pause
    exit /b 1
)

if errorlevel 1 (
    echo.
    echo ============================================
    echo   PUSH FAILED
    echo ============================================
    echo.
    echo Try GitHub Desktop instead:
    echo 1. Open GitHub Desktop
    echo 2. Repository → Pull (to get remote changes)
    echo 3. Push origin (to upload your changes)
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   SUCCESS! Code synced with GitHub!
echo ============================================
echo.
echo View your repository:
echo https://github.com/Ameya2606/Phishguard
echo.
echo Next: Deploy to Render
echo 1. Go to https://render.com
echo 2. Sign in with GitHub
echo 3. New + → Blueprint
echo 4. Select "Phishguard" repository
echo 5. Click "Apply"
echo.
pause

@echo off
echo ============================================
echo   Git Configuration Setup
echo ============================================
echo.
echo This will set up your Git identity for commits.
echo.

set /p USERNAME="Enter your GitHub username: "
set /p EMAIL="Enter your GitHub email: "

echo.
echo [INFO] Configuring Git...
git config --global user.name "%USERNAME%"
git config --global user.email "%EMAIL%"

echo.
echo ============================================
echo   Configuration Complete!
echo ============================================
echo.
echo Your Git identity:
git config --global user.name
git config --global user.email
echo.
echo [SUCCESS] You can now run push-to-github.bat
echo.
pause

@echo off
echo Starting PhishGuard App...
echo.
cd /d "%~dp0"
start http://localhost:3000
npm run dev

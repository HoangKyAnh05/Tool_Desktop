@echo off
title Launching Desktop Organizer & PC Optimizer Pro...
cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] node_modules not found. Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Make sure Node.js is installed!
        pause
        exit /b 1
    )
)

echo [INFO] Starting Electron Application...
npm start
if errorlevel 1 (
    echo [ERROR] Failed to start application.
    pause
)

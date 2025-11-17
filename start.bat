@echo off
echo ========================================
echo FluoroSegStat - Starting Application
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please run install.bat first.
    pause
    exit /b 1
)

REM Check if npm is accessible
npm.cmd --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: npm.cmd not accessible, trying alternative...
    call npm --version >nul 2>&1
    if errorlevel 1 (
        echo ERROR: npm is not accessible.
        echo This might be due to PowerShell execution policy.
        echo Please run from Command Prompt (cmd) or use install-advanced.bat
        pause
        exit /b 1
    )
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: Node modules not found.
    echo Please run install.bat first to install dependencies.
    pause
    exit /b 1
)

echo Starting FluoroSegStat application...
echo.
echo The application will be available at:
echo   http://localhost:9002
echo.
echo To access the application:
echo   1. Wait for "Ready" message below
echo   2. Open your web browser
echo   3. Navigate to http://localhost:9002
echo.
echo Press Ctrl+C to stop the application
echo.
echo ========================================

REM Set environment variables for local development
set NODE_ENV=development
set NODE_OPTIONS=--max-old-space-size=8192

REM Start the Next.js development server
npm.cmd run dev
@echo off
echo ========================================
echo FluoroSegStat - Local Installation
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo Minimum required version: 18.x
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if npm is installed (handle PowerShell execution policy issues)
echo Checking npm installation...
npm.cmd --version >nul 2>&1
if errorlevel 1 (
    echo Trying alternative npm command...
    call npm --version >nul 2>&1
    if errorlevel 1 (
        echo ERROR: npm is not accessible.
        echo This might be due to PowerShell execution policy restrictions.
        echo.
        echo Solutions:
        echo 1. Run this from Command Prompt (cmd) instead of PowerShell
        echo 2. Or run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
        echo 3. Or use install-advanced.bat which handles this automatically
        echo.
        pause
        exit /b 1
    )
)

echo npm version:
npm --version
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found.
    echo Please ensure you are running this from the project root directory.
    pause
    exit /b 1
)

REM Clean previous installations if they exist
if exist "node_modules" (
    echo Cleaning previous node_modules installation...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo Removing package-lock.json for fresh install...
    del package-lock.json
)

REM Create virtual environment directory for local data
if not exist "venv" (
    echo Creating virtual environment directory for local data...
    mkdir venv
    echo Virtual environment directory created.
) else (
    echo Virtual environment directory already exists.
)
echo.

REM Install Node.js dependencies
echo Installing Node.js dependencies...
echo This may take several minutes...
echo.

REM Set npm configuration for better performance and reliability
npm config set registry https://registry.npmjs.org/
npm config set audit-level high

echo Running npm install...
npm.cmd install --no-optional --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies.
    echo.
    echo Troubleshooting steps:
    echo 1. Check your internet connection
    echo 2. Clear npm cache: npm cache clean --force
    echo 3. Try running as Administrator
    echo 4. Check if PATH includes Node.js and npm
    echo.
    pause
    exit /b 1
)

echo.
echo Verifying installation...
if not exist "node_modules" (
    echo ERROR: node_modules directory was not created.
    echo Installation may have failed silently.
    pause
    exit /b 1
)

REM Check if key dependencies exist
if not exist "node_modules\next" (
    echo WARNING: Next.js was not installed correctly.
    echo The application may not work properly.
)

if not exist "node_modules\react" (
    echo WARNING: React was not installed correctly.
    echo The application may not work properly.
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo You can now run the application using start.bat
echo.
echo To manually start the application:
echo   npm run dev
echo.
echo The application will be available at:
echo   http://localhost:9002
echo.
pause
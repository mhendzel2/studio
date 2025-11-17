@echo off
setlocal enabledelayedexpansion

echo ========================================
echo FluoroSegStat - Advanced Installation
echo ========================================
echo.

REM Try to find Node.js in common locations if not in PATH
set "NODE_FOUND=0"
set "NPM_FOUND=0"

REM Check if Node.js is in PATH
node --version >nul 2>&1
if !errorlevel! == 0 (
    set "NODE_FOUND=1"
    echo Found Node.js in PATH:
    node --version
) else (
    echo Node.js not found in PATH, checking common locations...
    
    REM Check common Node.js installation paths
    for %%P in (
        "C:\Program Files\nodejs\node.exe"
        "C:\Program Files (x86)\nodejs\node.exe"
        "%USERPROFILE%\AppData\Roaming\nvm\node.exe"
        "%PROGRAMFILES%\nodejs\node.exe"
    ) do (
        if exist "%%~P" (
            echo Found Node.js at: %%~P
            set "NODE_PATH=%%~dpP"
            set "NODE_FOUND=1"
            goto :found_node
        )
    )
    
    :found_node
    if !NODE_FOUND! == 0 (
        echo ERROR: Node.js not found.
        echo.
        echo Please install Node.js from https://nodejs.org/
        echo After installation, either:
        echo 1. Restart this script, or
        echo 2. Add Node.js to your PATH environment variable
        echo.
        echo Required PATH entries:
        echo - C:\Program Files\nodejs\
        echo - %%APPDATA%%\npm
        echo.
        pause
        exit /b 1
    )
)

REM Check npm
npm --version >nul 2>&1
if !errorlevel! == 0 (
    set "NPM_FOUND=1"
    echo Found npm in PATH:
    npm --version
) else (
    echo npm not found in PATH.
    if !NODE_FOUND! == 1 (
        echo Trying to use npm from Node.js installation directory...
        if exist "!NODE_PATH!npm.cmd" (
            set "NPM_FOUND=1"
            echo Found npm at: !NODE_PATH!npm.cmd
        )
    )
    
    if !NPM_FOUND! == 0 (
        echo ERROR: npm not found.
        echo npm should be installed with Node.js.
        echo Please reinstall Node.js or check your PATH.
        pause
        exit /b 1
    )
)

echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found.
    echo Please ensure you are running this from the project root directory.
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Found package.json - proceeding with installation...
echo.

REM Clean previous installations
if exist "node_modules" (
    echo Cleaning previous node_modules installation...
    rmdir /s /q node_modules
    if exist "node_modules" (
        echo WARNING: Could not completely remove node_modules.
        echo You may need to close any applications using files in this directory.
    )
)

if exist "package-lock.json" (
    echo Removing package-lock.json for fresh install...
    del package-lock.json
)

REM Create local data directory
if not exist "venv" (
    echo Creating local data directory...
    mkdir venv
) else (
    echo Local data directory already exists.
)

echo.
echo Installing Node.js dependencies...
echo This may take 5-10 minutes depending on your internet connection...
echo.

REM Set npm configuration
npm config set audit-level high
npm config set fund false
npm config set update-notifier false

echo Starting npm install...
npm install --no-optional --legacy-peer-deps --verbose
set "INSTALL_RESULT=!errorlevel!"

if !INSTALL_RESULT! neq 0 (
    echo.
    echo ERROR: npm install failed with exit code !INSTALL_RESULT!
    echo.
    echo Troubleshooting steps:
    echo 1. Check your internet connection
    echo 2. Run as Administrator
    echo 3. Clear npm cache: npm cache clean --force
    echo 4. Check available disk space
    echo 5. Temporarily disable antivirus software
    echo.
    echo If the error persists, try:
    echo   npm install --force
    echo.
    pause
    exit /b !INSTALL_RESULT!
)

echo.
echo Verifying installation...

if not exist "node_modules" (
    echo ERROR: node_modules directory was not created.
    pause
    exit /b 1
)

REM Count installed packages
for /f %%i in ('dir /ad /b node_modules 2^>nul ^| find /c /v ""') do set "PKG_COUNT=%%i"
echo Found !PKG_COUNT! installed packages in node_modules

REM Check critical dependencies
set "MISSING_DEPS=0"

if not exist "node_modules\next" (
    echo ERROR: Next.js not installed correctly.
    set "MISSING_DEPS=1"
)

if not exist "node_modules\react" (
    echo ERROR: React not installed correctly.
    set "MISSING_DEPS=1"
)

if not exist "node_modules\typescript" (
    echo WARNING: TypeScript not found - may affect development.
)

if !MISSING_DEPS! == 1 (
    echo.
    echo CRITICAL: Required dependencies are missing.
    echo Please try running npm install again or contact support.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Installed !PKG_COUNT! packages
echo.
echo Next steps:
echo 1. Run start.bat to launch the application
echo 2. Open http://localhost:9002 in your browser
echo.
echo Manual commands:
echo   npm run dev     (start development server)
echo   npm run build   (build for production)
echo.
pause
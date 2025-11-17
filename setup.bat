@echo off
echo ========================================
echo FluoroSegStat - Complete Setup Guide
echo ========================================
echo.
echo This script will help you set up FluoroSegStat on your local machine.
echo.
echo Available setup options:
echo.
echo 1. install.bat              - Basic installation (works in cmd)
echo 2. install-advanced.bat     - Advanced installation with diagnostics  
echo 3. setup-powershell.ps1     - Fix PowerShell execution policy first
echo 4. start.bat                - Start the application after installation
echo.

:menu
echo Please choose an option:
echo.
echo [1] Run basic installation now
echo [2] Run advanced installation now  
echo [3] Fix PowerShell issues first (recommended for PowerShell users)
echo [4] Start application (only if already installed)
echo [5] Show system information
echo [Q] Quit
echo.

set /p choice="Enter your choice (1-5 or Q): "

if /i "%choice%"=="1" goto basic_install
if /i "%choice%"=="2" goto advanced_install
if /i "%choice%"=="3" goto powershell_setup
if /i "%choice%"=="4" goto start_app
if /i "%choice%"=="5" goto system_info
if /i "%choice%"=="q" goto quit
if /i "%choice%"=="quit" goto quit

echo Invalid choice. Please try again.
goto menu

:basic_install
echo.
echo Running basic installation...
call install.bat
goto end

:advanced_install
echo.
echo Running advanced installation...
call install-advanced.bat
goto end

:powershell_setup
echo.
echo Opening PowerShell to fix execution policy...
echo Please follow the prompts in the PowerShell window.
powershell -ExecutionPolicy Bypass -File setup-powershell.ps1
echo.
echo PowerShell setup completed. You can now run the installation.
pause
goto menu

:start_app
echo.
echo Starting application...
call start.bat
goto end

:system_info
echo.
echo ========================================
echo System Information
echo ========================================
echo.
echo Current directory: %CD%
echo.
echo Node.js check:
node --version 2>nul && echo Node.js: OK || echo Node.js: NOT FOUND
echo.
echo npm check:
npm.cmd --version 2>nul && echo npm: OK || echo npm: NOT ACCESSIBLE
echo.
echo Required files:
if exist "package.json" (echo package.json: OK) else (echo package.json: MISSING)
if exist "node_modules" (echo node_modules: EXISTS) else (echo node_modules: NOT INSTALLED)
echo.
echo PowerShell Execution Policy:
powershell -Command "Get-ExecutionPolicy" 2>nul
echo.
pause
goto menu

:quit
echo.
echo Setup cancelled by user.
goto end

:end
echo.
echo Setup script finished.
pause
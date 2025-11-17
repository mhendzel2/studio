# PowerShell Setup Script for FluoroSegStat
# This script configures PowerShell to work with npm and Node.js

Write-Host "========================================" -ForegroundColor Green
Write-Host "FluoroSegStat - PowerShell Setup" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host

# Check current execution policy
$currentPolicy = Get-ExecutionPolicy
Write-Host "Current PowerShell Execution Policy: $currentPolicy" -ForegroundColor Yellow

if ($currentPolicy -eq "Restricted") {
    Write-Host
    Write-Host "PowerShell execution policy is RESTRICTED." -ForegroundColor Red
    Write-Host "This prevents npm from running properly." -ForegroundColor Red
    Write-Host
    Write-Host "To fix this, we need to change the execution policy." -ForegroundColor Yellow
    Write-Host "This is safe and only affects your user account." -ForegroundColor Yellow
    Write-Host
    
    $response = Read-Host "Change execution policy to RemoteSigned for current user? (y/N)"
    
    if ($response -match '^[Yy]') {
        try {
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
            Write-Host
            Write-Host "SUCCESS: Execution policy updated!" -ForegroundColor Green
            Write-Host "New policy: $(Get-ExecutionPolicy)" -ForegroundColor Green
        }
        catch {
            Write-Host
            Write-Host "ERROR: Failed to change execution policy." -ForegroundColor Red
            Write-Host "You may need to run PowerShell as Administrator." -ForegroundColor Yellow
            Write-Host
            Write-Host "Alternative: Use install.bat from Command Prompt (cmd) instead." -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    else {
        Write-Host
        Write-Host "Execution policy not changed." -ForegroundColor Yellow
        Write-Host "Please use install.bat from Command Prompt (cmd) instead." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}
else {
    Write-Host "Execution policy is compatible with npm." -ForegroundColor Green
}

Write-Host
Write-Host "Checking Node.js and npm..." -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Node.js not found in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: npm not accessible." -ForegroundColor Red
    Write-Host "This is unusual - npm should come with Node.js." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host
Write-Host "========================================" -ForegroundColor Green
Write-Host "PowerShell setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host
Write-Host "You can now run:" -ForegroundColor Cyan
Write-Host "  install.bat     (to install dependencies)" -ForegroundColor White
Write-Host "  start.bat       (to start the application)" -ForegroundColor White
Write-Host "  npm run dev     (manual start command)" -ForegroundColor White
Write-Host

Read-Host "Press Enter to exit"
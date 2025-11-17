# FluoroSegStat - Local Installation Guide

## Quick Start

1. **PowerShell Users**: Run `setup-powershell.ps1` first (fixes execution policy)
2. **Install**: Double-click `install.bat` or run from Command Prompt
3. **Run**: Double-click `start.bat`
4. **Access**: Open browser to http://localhost:9002

## Important: PowerShell Execution Policy Issue

If you see errors like "running scripts is disabled on this system", this is due to Windows PowerShell execution policy restrictions. 

**Solutions** (choose one):
1. **Recommended**: Run `setup-powershell.ps1` to fix the policy automatically
2. **Manual**: Open PowerShell as Administrator and run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. **Alternative**: Use Command Prompt (cmd) instead of PowerShell:
   - Press Win+R, type `cmd`, press Enter
   - Navigate to project folder and run `install.bat`

## System Requirements

- **Node.js 18.x or higher** - Download from https://nodejs.org/
- **Windows 10/11** (for batch file compatibility)
- **Minimum 8GB RAM** recommended for image processing
- **Modern web browser** (Chrome, Firefox, Edge)

## Installation Instructions

### Method 1: Automatic Installation (Recommended)

1. Run `install.bat` as Administrator (right-click → "Run as administrator")
2. The script will:
   - Check Node.js installation
   - Create virtual environment structure
   - Install all dependencies
   - Configure the application for local use

### Method 2: Manual Installation

```bash
# Check Node.js version (should be 18.x or higher)
node --version

# Install dependencies
npm install

# Start development server
npm run dev
```

## Running the Application

### Method 1: Using Batch File (Recommended)

- Double-click `start.bat`
- The application will start automatically
- Open http://localhost:9002 in your browser

### Method 2: Manual Start

```bash
npm run dev
```

## Application Features

- **Cellpose 3.0 Integration**: Advanced cell segmentation
- **Morphometric Analysis**: Comprehensive feature extraction
- **Multi-channel Support**: DAPI, FITC, TRITC, and more
- **MetaMorph (.nd) File Support**: Direct import of microscopy datasets
- **Folder Loading**: Automatic detection of .nd files and associated images
- **Statistical Analysis**: Built-in statistical testing
- **Export Capabilities**: CSV export of results

## Usage Workflow

1. **Data Input**: Load folders containing .nd files and TIFF images
2. **Segmentation**: Use Cellpose 3.0 for cell segmentation
3. **Analysis**: Extract morphometric features
4. **Visualization**: View results and statistical analysis
5. **Export**: Download data as CSV files

## File Organization

Your microscopy data should be organized as:
```
data_folder/
├── experiment.nd
├── experiment_w1DAPI.tif
├── experiment_w2FITC.tif
├── experiment_w3TRITC.tif
└── ... (additional channels)
```

## Memory Configuration

The application is configured for local use without memory limits:
- Increased Node.js heap size (8GB)
- Large file upload support (100MB+)
- No artificial memory restrictions

## Troubleshooting

### Common Issues

### Common Issues

**"Node.js is not installed"**
- Download and install Node.js from https://nodejs.org/
- Restart command prompt/batch file

**"npm: running scripts is disabled on this system"**
- This is a PowerShell execution policy issue
- Run `setup-powershell.ps1` to fix automatically
- Or use Command Prompt (cmd) instead of PowerShell
- Or manually run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

**"Failed to install dependencies"**
- Check internet connection
- Run as Administrator
- Clear npm cache: `npm cache clean --force`
- Try using `install-advanced.bat` for better error handling

**"Port 9002 already in use"**
- Close other instances of the application
- Change port in package.json if needed

**Large file uploads fail**
- Ensure sufficient disk space
- Check file permissions
- Restart the application

### Getting Help

For technical support or bug reports, please check the project documentation or contact the development team.

## Development Notes

- The application runs on port 9002 by default
- Development mode includes hot reloading
- TypeScript compilation errors are ignored for flexibility
- ESLint is disabled during builds for rapid development
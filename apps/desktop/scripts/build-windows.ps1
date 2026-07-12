# OpenGPU Desktop - Windows Build Script
# Run from the desktop app directory: .\scripts\build-windows.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OpenGPU Desktop - Windows Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm is not installed" -ForegroundColor Red
    exit 1
}

# Check for nvidia-smi
$nvidiaSmiPath = "C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"
if (Test-Path $nvidiaSmiPath) {
    Write-Host "[OK] NVIDIA SMI detected" -ForegroundColor Green
} else {
    $nvidiaSmiPath2 = Get-Command nvidia-smi -ErrorAction SilentlyContinue
    if ($nvidiaSmiPath2) {
        Write-Host "[OK] NVIDIA SMI detected (in PATH)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] nvidia-smi not found - GPU detection will be limited" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Building renderer..." -ForegroundColor Yellow
npm run build:renderer
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build renderer" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Building main process..." -ForegroundColor Yellow
npm run build:main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build main process" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Packaging for Windows (NSIS + Portable)..." -ForegroundColor Yellow
npx electron-builder --win --config electron-builder.yml
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to package" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "  Output: .\release\" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Show output files
if (Test-Path ".\release") {
    Get-ChildItem ".\release\*.exe" | ForEach-Object {
        $sizeMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  $($_.Name) ($sizeMB MB)" -ForegroundColor White
    }
    Get-ChildItem ".\release\*.exe" | ForEach-Object {
        $sizeMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  $($_.Name) ($sizeMB MB)" -ForegroundColor White
    }
}

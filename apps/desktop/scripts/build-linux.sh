#!/bin/bash
# OpenGPU Desktop - Linux Build Script
# Run from the desktop app directory: ./scripts/build-linux.sh

set -e

echo "========================================"
echo "  OpenGPU Desktop - Linux Build"
echo "========================================"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "[OK] Node.js $(node --version)"
else
    echo "[ERROR] Node.js is not installed"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "[OK] npm $(npm --version)"
else
    echo "[ERROR] npm is not installed"
    exit 1
fi

# Check for nvidia-smi
if command -v nvidia-smi &> /dev/null; then
    echo "[OK] NVIDIA SMI detected"
else
    echo "[WARN] nvidia-smi not found - GPU detection will be limited"
fi

# Check for required build dependencies (Ubuntu/Debian)
if command -v dpkg &> /dev/null; then
    echo ""
    echo "Checking build dependencies..."

    REQUIRED_PKGS=("build-essential" "libgtk-3-dev" "libnotify-dev" "libnss3-dev" "libxss-dev" "libxtst-dev")
    MISSING_PKGS=()

    for pkg in "${REQUIRED_PKGS[@]}"; do
        if ! dpkg -s "$pkg" &> /dev/null; then
            MISSING_PKGS+=("$pkg")
        fi
    done

    if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
        echo "[WARN] Missing packages: ${MISSING_PKGS[*]}"
        echo "Install with: sudo apt-get install ${MISSING_PKGS[*]}"
        echo ""
    else
        echo "[OK] All build dependencies found"
    fi
fi

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Building renderer..."
npm run build:renderer

echo ""
echo "Building main process..."
npm run build:main

echo ""
echo "Packaging for Linux (AppImage + deb + rpm)..."
npx electron-builder --linux --config electron-builder.yml

echo ""
echo "========================================"
echo "  Build Complete!"
echo "  Output: ./release/"
echo "========================================"
echo ""

# Show output files
if [ -d "./release" ]; then
    ls -lh ./release/*.AppImage 2>/dev/null || true
    ls -lh ./release/*.deb 2>/dev/null || true
    ls -lh ./release/*.rpm 2>/dev/null || true
fi

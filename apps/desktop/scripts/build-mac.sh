#!/bin/bash
# OpenGPU Desktop - macOS Build Script
# Run from the desktop app directory: ./scripts/build-mac.sh

set -e

echo "========================================"
echo "  OpenGPU Desktop - macOS Build"
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

# Check for Xcode CLI tools
if command -v xcode-select &> /dev/null; then
    XCODE_PATH=$(xcode-select -p 2>/dev/null)
    if [ -n "$XCODE_PATH" ]; then
        echo "[OK] Xcode CLI tools found"
    else
        echo "[WARN] Xcode CLI tools may not be installed"
        echo "Install with: xcode-select --install"
    fi
else
    echo "[WARN] xcode-select not found"
fi

# Check architecture
ARCH=$(uname -m)
echo "[INFO] Architecture: $ARCH"

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
echo "Packaging for macOS (DMG)..."
npx electron-builder --mac --config electron-builder.yml

echo ""
echo "========================================"
echo "  Build Complete!"
echo "  Output: ./release/"
echo "========================================"
echo ""

# Show output files
if [ -d "./release" ]; then
    ls -lh ./release/*.dmg 2>/dev/null || true
fi

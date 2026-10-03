#!/bin/bash
# Variable Fonts Controller - Photoshop macOS Installer

echo "======================================================================"
echo "   Variable Fonts Controller for Adobe Photoshop - macOS Installer"
echo "======================================================================"
echo ""

for version in {7..16}; do
    defaults write com.adobe.CSXS.${version} PlayerDebugMode 1 2>/dev/null
done

CEP_BASE="$HOME/Library/Application Support/Adobe/CEP/extensions"
TARGET_DIR="$CEP_BASE/com.photoshop.variables.panel"

mkdir -p "$CEP_BASE"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

SCRIPT_DIR="$( cd "$( dirname "$" )" && cd .. && pwd )"
rsync -av --exclude='.git' --exclude='*.sh' --exclude='*.command' --exclude='*.bat' --exclude='*.ps1' --exclude='Windows' --exclude='macOS' "$SCRIPT_DIR/" "$TARGET_DIR/" > /dev/null 2>&1

echo "Successfully installed for Adobe Photoshop!"
echo "Launch in Photoshop: Window > Extensions > Variable Controller (Photoshop)"
echo ""

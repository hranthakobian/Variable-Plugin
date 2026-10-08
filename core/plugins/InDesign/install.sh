#!/bin/bash
# Variable Fonts Controller - macOS InDesign Installer

echo "Installing Variable Fonts Controller for Adobe InDesign on macOS..."
for version in {7..16}; do
    defaults write com.adobe.CSXS.${version} PlayerDebugMode 1 2>/dev/null
done

CEP_BASE="$HOME/Library/Application Support/Adobe/CEP/extensions"
TARGET_DIR="$CEP_BASE/com.indesign.variables.panel"

mkdir -p "$CEP_BASE"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if command -v rsync >/dev/null 2>&1; then
    rsync -av --exclude='*.sh' --exclude='*.bat' --exclude='*.ps1' "$SCRIPT_DIR/" "$TARGET_DIR/" > /dev/null 2>&1
else
    cp -R "$SCRIPT_DIR/"* "$TARGET_DIR/" 2>/dev/null
fi

echo "Successfully installed for Adobe InDesign!"
echo "Launch in InDesign: Window > Extensions > Variable Controller (InDesign)"

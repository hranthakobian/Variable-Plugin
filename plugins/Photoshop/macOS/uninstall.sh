#!/bin/bash
# Variable Fonts Controller - Photoshop macOS Uninstaller

echo "======================================================================"
echo "   Variable Fonts Controller for Adobe Photoshop - macOS Uninstaller"
echo "======================================================================"
echo ""

CEP_BASE="$HOME/Library/Application Support/Adobe/CEP/extensions"
TARGET_DIR="$CEP_BASE/com.photoshop.variables.panel"

if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
    echo "Successfully uninstalled Photoshop extension."
else
    echo "Extension folder not found: $TARGET_DIR"
fi
echo ""

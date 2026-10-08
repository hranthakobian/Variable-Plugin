#!/bin/bash
# Variable Fonts Controller - Illustrator macOS Uninstaller

echo "======================================================================"
echo "   Variable Fonts Controller for Adobe Illustrator - macOS Uninstaller"
echo "======================================================================"
echo ""

CEP_BASE="$HOME/Library/Application Support/Adobe/CEP/extensions"
TARGET_DIR="$CEP_BASE/com.illustrator.variables.panel"

if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
    echo "Successfully uninstalled Illustrator extension."
else
    echo "Extension folder not found: $TARGET_DIR"
fi
echo ""

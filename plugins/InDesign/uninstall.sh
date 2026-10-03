#!/bin/bash
# Variable Fonts Controller - macOS InDesign Uninstaller

echo "Uninstalling Variable Fonts Controller for Adobe InDesign..."
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.indesign.variables.panel"

if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
    echo "Successfully uninstalled InDesign extension."
else
    echo "Extension directory not found: $TARGET_DIR"
fi

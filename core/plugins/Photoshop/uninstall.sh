#!/bin/bash
# Variable Fonts Controller - macOS Photoshop Uninstaller

echo "Uninstalling Variable Fonts Controller for Adobe Photoshop..."
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.photoshop.variables.panel"

if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
    echo "Successfully uninstalled Photoshop extension."
else
    echo "Extension directory not found: $TARGET_DIR"
fi

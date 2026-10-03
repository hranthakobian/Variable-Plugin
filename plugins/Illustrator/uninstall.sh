#!/bin/bash
# Variable Fonts Controller - macOS Illustrator Uninstaller

echo "Uninstalling Variable Fonts Controller for Adobe Illustrator..."
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.illustrator.variables.panel"

if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
    echo "Successfully uninstalled Illustrator extension."
else
    echo "Extension directory not found: $TARGET_DIR"
fi

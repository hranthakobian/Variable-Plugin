#!/bin/bash
# Variable Fonts & Design Space Controller for Adobe Illustrator - macOS Uninstaller

echo "======================================================================"
echo "   Variable Fonts Controller for Adobe Illustrator - macOS Uninstaller"
echo "======================================================================"
echo ""

CEP_BASE="$HOME/Library/Application Support/Adobe/CEP/extensions"
PANELS=(
    "com.illustrator.variables.panel"
    "com.adobe.variables.panel"
)

for panel in "${PANELS[@]}"; do
    target="$CEP_BASE/$panel"
    if [ -d "$target" ]; then
        echo "Removing extension folder: $target"
        rm -rf "$target"
    fi
done

echo ""
echo "Successfully uninstalled Variable Fonts Controller extensions on macOS."
echo ""

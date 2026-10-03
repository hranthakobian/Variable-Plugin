#!/bin/bash
# Variable Fonts & Design Space Controller Suite for Adobe CC
# macOS Multi-App Installer (Illustrator, InDesign, Photoshop)

echo "======================================================================"
echo "    Variable Fonts & Design Space Controller Suite for Adobe CC"
echo "        (Adobe Illustrator, Adobe InDesign, Adobe Photoshop)"
echo "                    macOS Automatic Installer"
echo "======================================================================"
echo ""

# 1. Enable PlayerDebugMode for CSXS 7 through 16 across Adobe apps
echo "[1/3] Enabling Adobe CEP Debug Mode on macOS..."
for version in {7..16}; do
    defaults write com.adobe.CSXS.${version} PlayerDebugMode 1 2>/dev/null
done
echo "     - Successfully enabled PlayerDebugMode for CSXS 7..16."
echo ""

# 2. Prepare target directories
CEP_BASE="$HOME/Library/Application Support/Adobe/CEP/extensions"
mkdir -p "$CEP_BASE"

MULTI_TARGET="$CEP_BASE/com.adobe.variables.panel"
echo "[2/3] Preparing target directory: $MULTI_TARGET"
rm -rf "$MULTI_TARGET"
mkdir -p "$MULTI_TARGET"
echo ""

# 3. Copy extension files
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "[3/3] Deploying extension bundle..."

if command -v rsync >/dev/null 2>&1; then
    rsync -av --exclude='.git' --exclude='*.sh' --exclude='*.bat' --exclude='*.ps1' --exclude='plugins' "$SCRIPT_DIR/" "$MULTI_TARGET/" > /dev/null 2>&1
else
    cp -R "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/HELP.md" "$SCRIPT_DIR/css" "$SCRIPT_DIR/js" "$SCRIPT_DIR/CSXS" "$SCRIPT_DIR/host" "$MULTI_TARGET/" 2>/dev/null
fi

# Deploy standalone app plugins if available
PLUGINS_DIR="$SCRIPT_DIR/plugins"
if [ -d "$PLUGINS_DIR" ]; then
    APPS=("Illustrator" "InDesign" "Photoshop")
    for app in "${APPS[@]}"; do
        app_lc=$(echo "$app" | tr '[:upper:]' '[:lower:]')
        app_target="$CEP_BASE/com.${app_lc}.variables.panel"
        app_src="$PLUGINS_DIR/$app"
        if [ -d "$app_src" ]; then
            rm -rf "$app_target"
            mkdir -p "$app_target"
            cp -R "$app_src/" "$app_target/" 2>/dev/null
            echo "     - Deployed standalone $app plugin to: $app_target"
        fi
    done
fi

echo ""
echo "======================================================================"
echo "                       INSTALLATION COMPLETED!"
echo "======================================================================"
echo ""
echo "How to Launch in Adobe Applications:"
echo "  1. Adobe Illustrator: Window > Extensions > Variable Controller"
echo "  2. Adobe InDesign:    Window > Extensions > Variable Controller"
echo "  3. Adobe Photoshop:   Window > Extensions > Variable Controller"
echo ""

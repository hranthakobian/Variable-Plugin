#!/bin/bash
# Variable Fonts & Design Space Controller for Adobe Illustrator
# macOS Automatic Installer

echo "======================================================================"
echo "    Variable Fonts & Design Space Controller for Adobe Illustrator"
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

ILST_TARGET="$CEP_BASE/com.illustrator.variables.panel"
MULTI_TARGET="$CEP_BASE/com.adobe.variables.panel"
echo "[2/3] Preparing target directory: $ILST_TARGET"
rm -rf "$ILST_TARGET" "$MULTI_TARGET"
mkdir -p "$ILST_TARGET" "$MULTI_TARGET"
echo ""

# 3. Copy extension files
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "[3/3] Deploying extension bundle..."

if command -v rsync >/dev/null 2>&1; then
    rsync -av --exclude='.git' --exclude='*.sh' --exclude='*.bat' --exclude='*.ps1' --exclude='plugins' --exclude='figma' "$SCRIPT_DIR/" "$ILST_TARGET/" > /dev/null 2>&1
    rsync -av --exclude='.git' --exclude='*.sh' --exclude='*.bat' --exclude='*.ps1' --exclude='plugins' --exclude='figma' "$SCRIPT_DIR/" "$MULTI_TARGET/" > /dev/null 2>&1
else
    cp -R "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/HELP.md" "$SCRIPT_DIR/css" "$SCRIPT_DIR/js" "$SCRIPT_DIR/CSXS" "$SCRIPT_DIR/host" "$ILST_TARGET/" 2>/dev/null
    cp -R "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/HELP.md" "$SCRIPT_DIR/css" "$SCRIPT_DIR/js" "$SCRIPT_DIR/CSXS" "$SCRIPT_DIR/host" "$MULTI_TARGET/" 2>/dev/null
fi

echo ""
echo "======================================================================"
echo "                       INSTALLATION COMPLETED!"
echo "======================================================================"
echo ""
echo "How to Launch in Adobe Illustrator:"
echo "  Window > Extensions > Variable Controller"
echo ""

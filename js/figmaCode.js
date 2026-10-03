/**
 * Figma Plugin Main Sandbox Code (js/figmaCode.js)
 * Executes in Figma's isolated JS environment.
 * Communicates bidirectionally with index.html (iframe UI).
 */

// Launch UI iframe window with initial dimensions matching standard Figma plugin panel
figma.showUI(__html__, {
    width: 360,
    height: 640,
    themeColors: true
});

/**
 * Helper: Inspect active selection in Figma document
 */
async function getFigmaSelectionInfo() {
    const selection = figma.currentPage.selection;
    const documentTextFrames = [];

    // Scan top-level text nodes on current page for empty state selection list
    const pageTextNodes = figma.currentPage.findAll(node => node.type === 'TEXT');
    pageTextNodes.slice(0, 30).forEach((node, idx) => {
        const fontNameStr = typeof node.fontName === 'object' && node.fontName !== figma.mixed ? node.fontName.family : 'Mixed Font';
        documentTextFrames.push({
            index: idx,
            id: node.id,
            text: node.characters.substring(0, 60),
            fontName: fontNameStr,
            isVariable: true,
            charCount: node.characters.length
        });
    });

    if (selection.length === 0) {
        return {
            success: true,
            hasDoc: true,
            hasSelection: false,
            totalSelected: 0,
            documentTextFrames: documentTextFrames
        };
    }

    const firstNode = selection[0];
    const isText = firstNode.type === 'TEXT';
    let fontName = 'Inter';
    let fontFamily = 'Inter';
    let textSnippet = isText ? firstNode.characters.substring(0, 80) : firstNode.name;
    let charCount = isText ? firstNode.characters.length : selection.length;

    if (isText && typeof firstNode.fontName === 'object' && firstNode.fontName !== figma.mixed) {
        fontName = `${firstNode.fontName.family} ${firstNode.fontName.style}`;
        fontFamily = firstNode.fontName.family;
    }

    // Default variable font axes structure compatible with Figma API & browser simulation
    const axes = [
        { id: 'wght', name: 'Weight', min: 100, max: 900, step: 1, defaultVal: 400 },
        { id: 'wdth', name: 'Width', min: 50, max: 200, step: 1, defaultVal: 100 },
        { id: 'slnt', name: 'Slant', min: -15, max: 0, step: 0.5, defaultVal: 0 },
        { id: 'opsz', name: 'Optical Size', min: 6, max: 72, step: 0.5, defaultVal: 14 }
    ];

    const currentValues = {
        wght: isText ? 400 : (firstNode.strokeWeight || 1),
        wdth: 100,
        slnt: 0,
        opsz: isText ? (typeof firstNode.fontSize === 'number' ? firstNode.fontSize : 16) : 14
    };

    return {
        success: true,
        hasDoc: true,
        hasSelection: true,
        totalSelected: selection.length,
        type: isText ? 'text' : 'shape',
        fontName: fontName,
        fontFamily: fontFamily,
        textSnippet: textSnippet,
        isVariableFont: true,
        charCount: charCount,
        axes: axes,
        currentValues: currentValues,
        uiBrightness: 0.0,
        documentTextFrames: documentTextFrames
    };
}

/**
 * Send selection update to UI
 */
async function notifyUISelectionChange() {
    const info = await getFigmaSelectionInfo();
    figma.ui.postMessage({
        type: 'SELECTION_CHANGED',
        data: info
    });
}

// Listen to selection changes in Figma
figma.on('selectionchange', () => {
    notifyUISelectionChange();
});

// Handle messages received from iframe UI
figma.ui.onmessage = async (msg) => {
    if (!msg || !msg.type) return;

    switch (msg.type) {
        case 'GET_SELECTION': {
            const info = await getFigmaSelectionInfo();
            figma.ui.postMessage({
                type: 'SELECTION_RESPONSE',
                data: info
            });
            break;
        }

        case 'APPLY_PARAMETERS': {
            const params = msg.parameters || {};
            const selection = figma.currentPage.selection;

            for (const node of selection) {
                if (node.type === 'TEXT') {
                    // Try setting font size or line spacing if optical size / wght mapped
                    if (params.opsz && typeof node.fontSize === 'number') {
                        try {
                            if (typeof node.fontName === 'object' && node.fontName !== figma.mixed) {
                                await figma.loadFontAsync(node.fontName);
                                node.fontSize = Math.max(6, Math.min(144, params.opsz));
                            }
                        } catch (e) {}
                    }
                    if (params.wdth && node.letterSpacing !== figma.mixed) {
                        try {
                            const lsVal = ((params.wdth - 100) / 10).toFixed(1);
                            node.letterSpacing = { value: parseFloat(lsVal), unit: 'PIXELS' };
                        } catch (e) {}
                    }
                } else if ('strokeWeight' in node && params.wght) {
                    try {
                        node.strokeWeight = Math.max(1, Math.round(params.wght / 50));
                    } catch (e) {}
                }
            }

            figma.ui.postMessage({
                type: 'APPLY_PARAMETERS_RESPONSE',
                success: true
            });
            break;
        }

        case 'APPLY_CURVE_DISTRIBUTION': {
            const config = msg.config || {};
            const values = config.values || [];
            const selection = figma.currentPage.selection;

            if (selection.length === 1 && selection[0].type === 'TEXT') {
                const node = selection[0];
                const len = node.characters.length;
                if (typeof node.fontName === 'object' && node.fontName !== figma.mixed) {
                    try {
                        await figma.loadFontAsync(node.fontName);
                        for (let i = 0; i < Math.min(len, values.length); i++) {
                            const normalized = values[i];
                            const fontSizeVal = Math.round(12 + normalized * 36);
                            node.setRangeFontSize(i, i + 1, fontSizeVal);
                        }
                    } catch (e) {}
                }
            } else if (selection.length > 1) {
                for (let i = 0; i < Math.min(selection.length, values.length); i++) {
                    const node = selection[i];
                    const normalized = values[i];
                    if (node.type === 'TEXT' && typeof node.fontName === 'object' && node.fontName !== figma.mixed) {
                        try {
                            await figma.loadFontAsync(node.fontName);
                            node.fontSize = Math.round(12 + normalized * 36);
                        } catch (e) {}
                    } else if ('opacity' in node) {
                        node.opacity = Math.max(0.1, Math.min(1.0, normalized));
                    }
                }
            }

            figma.ui.postMessage({
                type: 'APPLY_CURVE_RESPONSE',
                success: true
            });
            break;
        }

        case 'SELECT_NODE': {
            const nodeId = msg.nodeId;
            if (nodeId) {
                const targetNode = figma.currentPage.findOne(n => n.id === nodeId);
                if (targetNode) {
                    figma.currentPage.selection = [targetNode];
                    figma.viewport.scrollAndZoomIntoView([targetNode]);
                }
            }
            notifyUISelectionChange();
            break;
        }
    }
};

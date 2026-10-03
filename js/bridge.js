/**
 * Dual Environment Bridge Layer (Illustrator CEP & Figma Plugin & Web Simulation)
 * Provides promisified API communication with Illustrator ExtendScript and Figma Plugin Sandbox.
 * Follows K&R / 1TBS brace formatting.
 */

class IllustratorBridge {
    constructor() {
        this.csInterface = new CSInterface();
        this.isCEP = typeof window.__adobe_cep__ !== 'undefined';
        this.isFigma = typeof window !== 'undefined' && window.parent && window.parent !== window && !this.isCEP;
        this.listeners = new Map();
        this.figmaPendingRequests = new Map();
        this.figmaReqIdCounter = 0;
        
        // Mock state for standalone browser mode
        this.mockDocumentTextFrames = [
            { index: 0, text: 'The quick brown fox jumps over the lazy dog', fontName: 'Acumin Variable Concept', isVariable: true, charCount: 43 },
            { index: 1, text: 'ARMENIAN VARIABLE TYPOGRAPHY 2026', fontName: 'ArTarumianAzdVar', isVariable: true, charCount: 32 },
            { index: 2, text: 'Futura Headline Display', fontName: 'Futura PT', isVariable: false, charCount: 23 },
            { index: 3, text: 'Interactive Spline Curves & Distribution', fontName: 'Bahnschrift', isVariable: true, charCount: 40 }
        ];

        this.mockSelection = {
            success: true,
            hasDoc: true,
            hasSelection: true,
            totalSelected: 1,
            type: 'text',
            fontName: 'Acumin Variable Concept',
            fontFamily: 'Acumin Pro',
            textSnippet: 'The quick brown fox jumps over the lazy dog',
            isVariableFont: true,
            charCount: 43,
            axes: [
                { id: 'wght', name: 'Weight', min: 100, max: 900, step: 1, defaultVal: 400 },
                { id: 'wdth', name: 'Width', min: 50, max: 200, step: 1, defaultVal: 100 },
                { id: 'slnt', name: 'Slant', min: -15, max: 0, step: 0.5, defaultVal: 0 },
                { id: 'opsz', name: 'Optical Size', min: 6, max: 72, step: 0.5, defaultVal: 14 }
            ],
            currentValues: {
                wght: 400,
                wdth: 100,
                slnt: 0,
                opsz: 14
            },
            uiBrightness: 0.0,
            documentTextFrames: this.mockDocumentTextFrames
        };

        this.hostApp = 'ILST';
        if (this.isCEP) {
            try {
                const env = this.csInterface.getHostEnvironment();
                if (env && env.appId) {
                    this.hostApp = env.appId;
                }
            } catch (e) {}
        } else if (this.isFigma) {
            this.hostApp = 'FIGMA';
        }

        this.init();
    }

    init() {
        if (this.isCEP) {
            // Register native Adobe host event hooks for real-time selection updates
            const events = [
                'documentAfterActivate',
                'documentAfterDeactivate',
                'afterSelectionChanged',
                'artboardChanged',
                'currentToolChanged',
                'documentSaved',
                'documentCreated'
            ];
            events.forEach((evt) => {
                try {
                    this.csInterface.addEventListener(evt, () => {
                        this.emit('selectionChanged');
                    });
                } catch (e) {}
            });
        } else if (this.isFigma) {
            // Register postMessage listener for Figma plugin UI iframe
            window.addEventListener('message', (event) => {
                const msg = event.data ? event.data.pluginMessage : null;
                if (!msg) return;

                if (msg.type === 'SELECTION_CHANGED') {
                    this.emit('selectionChanged', msg.data);
                } else if (msg.type === 'SELECTION_RESPONSE') {
                    this.emit('selectionResponse', msg.data);
                }
            });
        }
    }

    /**
     * Subscribe to bridge events
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
    }

    /**
     * Trigger bridge events
     */
    emit(eventName, data) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach((cb) => {
                cb(data);
            });
        }
    }

    /**
     * Send postMessage to Figma Sandbox
     */
    sendFigmaMessage(type, payload = {}) {
        return new Promise((resolve) => {
            if (this.isFigma) {
                window.parent.postMessage({ pluginMessage: { type, ...payload } }, '*');
            }
            resolve({ success: true, figma: true });
        });
    }

    /**
     * Execute script in CEP or route to Figma / Browser Simulation
     */
    evalScript(script) {
        return new Promise((resolve, reject) => {
            if (this.isFigma) {
                this.handleFigmaScript(script, resolve, reject);
                return;
            }

            if (!this.isCEP) {
                // Browser simulation handler
                this.handleBrowserSimulation(script, resolve, reject);
                return;
            }

            this.csInterface.evalScript(script, (result) => {
                if (result === 'EvalScript error.' || result === undefined) {
                    reject(new Error('ExtendScript evaluation failed: ' + script));
                    return;
                }
                try {
                    const parsed = JSON.parse(result);
                    resolve(parsed);
                } catch (e) {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Figma bridge router
     */
    handleFigmaScript(script, resolve, reject) {
        if (script.indexOf('VariableFontPlugin.getSelectionInfo()') !== -1) {
            const listener = (data) => {
                resolve(data);
            };
            const tempCb = (event) => {
                const msg = event.data ? event.data.pluginMessage : null;
                if (msg && msg.type === 'SELECTION_RESPONSE') {
                    window.removeEventListener('message', tempCb);
                    resolve(msg.data);
                }
            };
            window.addEventListener('message', tempCb);
            window.parent.postMessage({ pluginMessage: { type: 'GET_SELECTION' } }, '*');
        } else if (script.indexOf('VariableFontPlugin.applyParameters') !== -1) {
            try {
                const match = script.match(/applyParameters\('([^']+)'\)/);
                if (match && match[1]) {
                    const params = JSON.parse(match[1]);
                    window.parent.postMessage({ pluginMessage: { type: 'APPLY_PARAMETERS', parameters: params } }, '*');
                }
                resolve({ success: true, figma: true });
            } catch (err) {
                resolve({ success: true, figma: true });
            }
        } else if (script.indexOf('VariableFontPlugin.applyCurveDistribution') !== -1) {
            try {
                const match = script.match(/applyCurveDistribution\('([^']+)'\)/);
                if (match && match[1]) {
                    const config = JSON.parse(match[1]);
                    window.parent.postMessage({ pluginMessage: { type: 'APPLY_CURVE_DISTRIBUTION', config: config } }, '*');
                }
                resolve({ success: true, figma: true });
            } catch (err) {
                resolve({ success: true, figma: true });
            }
        } else if (script.indexOf('VariableFontPlugin.selectTextFrame') !== -1) {
            try {
                const match = script.match(/selectTextFrame\('(\d+)'\)/);
                if (match && match[1]) {
                    window.parent.postMessage({ pluginMessage: { type: 'SELECT_NODE', index: match[1] } }, '*');
                }
                resolve({ success: true, figma: true });
            } catch (err) {
                resolve({ success: true, figma: true });
            }
        } else if (script.indexOf('VariableFontPlugin.queryUIBrightness()') !== -1) {
            resolve({ success: true, uiBrightness: 0.0 });
        } else {
            resolve({ success: true, figma: true });
        }
    }

    /**
     * Browser mock execution handler
     */
    handleBrowserSimulation(script, resolve, reject) {
        if (script.indexOf('VariableFontPlugin.getSelectionInfo()') !== -1) {
            resolve(JSON.parse(JSON.stringify(this.mockSelection)));
        } else if (script.indexOf('VariableFontPlugin.applyParameters') !== -1) {
            try {
                const match = script.match(/applyParameters\('([^']+)'\)/);
                if (match && match[1]) {
                    const updated = JSON.parse(match[1]);
                    Object.assign(this.mockSelection.currentValues, updated);
                    this.emit('simulatedUpdate', { type: 'parameters', values: updated });
                }
                resolve({ success: true, simulated: true });
            } catch (err) {
                resolve({ success: true, simulated: true });
            }
        } else if (script.indexOf('VariableFontPlugin.applyCurveDistribution') !== -1) {
            try {
                const match = script.match(/applyCurveDistribution\('([^']+)'\)/);
                if (match && match[1]) {
                    const config = JSON.parse(match[1]);
                    this.emit('simulatedUpdate', { type: 'curve', config: config });
                }
                resolve({ success: true, count: this.mockSelection.charCount, simulated: true });
            } catch (err) {
                resolve({ success: true, simulated: true });
            }
        } else if (script.indexOf('VariableFontPlugin.selectTextFrame') !== -1) {
            try {
                const match = script.match(/selectTextFrame\('(\d+)'\)/);
                if (match && match[1]) {
                    const idx = parseInt(match[1], 10);
                    const chosen = this.mockDocumentTextFrames[idx] || this.mockDocumentTextFrames[0];
                    this.mockSelection.hasSelection = true;
                    this.mockSelection.fontName = chosen.fontName;
                    this.mockSelection.isVariableFont = chosen.isVariable;
                    this.mockSelection.charCount = chosen.charCount;
                    this.mockSelection.textSnippet = chosen.text;
                    this.emit('selectionChanged');
                }
                resolve(JSON.parse(JSON.stringify(this.mockSelection)));
            } catch (err) {
                resolve({ success: true, simulated: true });
            }
        } else if (script.indexOf('VariableFontPlugin.queryUIBrightness()') !== -1) {
            resolve({ success: true, uiBrightness: this.mockSelection.uiBrightness || 0.0 });
        } else {
            resolve({ success: true, simulated: true });
        }
    }

    /**
     * Inspect active selection
     */
    async getSelectionInfo() {
        return await this.evalScript('VariableFontPlugin.getSelectionInfo()');
    }

    /**
     * Query live UI brightness preference from host
     */
    async queryUIBrightness() {
        return await this.evalScript('VariableFontPlugin.queryUIBrightness()');
    }

    /**
     * Select a specific text frame in active document
     */
    async selectTextFrame(index) {
        return await this.evalScript(`VariableFontPlugin.selectTextFrame('${index}')`);
    }

    /**
     * Live update 1D / 2D parameters
     */
    async applyParameters(parameters) {
        const payload = JSON.stringify(parameters).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return await this.evalScript(`VariableFontPlugin.applyParameters('${payload}')`);
    }

    /**
     * Live update non-linear curve distribution
     */
    async applyCurveDistribution(distributionConfig) {
        const payload = JSON.stringify(distributionConfig).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return await this.evalScript(`VariableFontPlugin.applyCurveDistribution('${payload}')`);
    }
}

// Export singleton
window.illustratorBridge = new IllustratorBridge();

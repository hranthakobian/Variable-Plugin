/**
 * Theme Manager for Variable Font Controller
 * Automatically synchronizes with Adobe Illustrator's UI brightness theme (Preferences > User Interface)
 * and provides smooth switching between Dark (սև) and Light (սպիտակ) styles.
 * Follows K&R / 1TBS brace formatting.
 */

class ThemeManager {
    constructor() {
        this.csInterface = (typeof CSInterface !== 'undefined') ? new CSInterface() : null;
        this.isCEP = typeof window.__adobe_cep__ !== 'undefined';
        this.listeners = [];
        this.themeMode = 'auto'; // 'auto' | 'dark' | 'light'
        this.activeTheme = 'dark'; // 'dark' | 'light'
        this.activeTier = 'dark'; // 'dark' | 'medium-dark' | 'medium-light' | 'light'
        this.hostSkin = null;

        // Real-time tracking
        this.lastR = null;
        this.lastG = null;
        this.lastB = null;
        this.extendScriptBrightness = null;
        this.watchdogTimer = null;
        this.hasAppliedOnce = false;

        this.init();
    }

    init() {
        // Load stored preference if any (defaults to 'auto' for dynamic sync)
        try {
            const saved = localStorage.getItem('ai_plugin_theme_mode');
            if (saved === 'auto' || saved === 'dark' || saved === 'light') {
                this.themeMode = saved;
            } else {
                this.themeMode = 'auto';
            }
        } catch (e) {
            this.themeMode = 'auto';
        }

        // Detect initial host skin
        this.detectHostSkin();

        // 1. Listen for Adobe CEP host theme change event
        if (this.isCEP && this.csInterface) {
            const themeEvent = (typeof CSInterface !== 'undefined' && CSInterface.THEME_COLOR_CHANGED_EVENT)
                ? CSInterface.THEME_COLOR_CHANGED_EVENT
                : 'com.adobe.csxs.events.ThemeColorChanged';

            this.csInterface.addEventListener(themeEvent, () => {
                this.detectHostSkin();
                this.applyTheme();
            });
        }

        // 2. Window activity listeners (immediate check on focus, hover, visibility change)
        this.bindWindowEvents();

        // 3. Real-time background watchdog timer (polls CEP host skin every 250ms)
        this.startWatchdog();

        // 4. Browser prefers-color-scheme listener (fallback in standalone web preview)
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
                if (this.themeMode === 'auto') {
                    this.applyTheme();
                }
            });
        }

        // Apply immediately
        this.applyTheme(true);
    }

    bindWindowEvents() {
        const onActivity = () => {
            if (this.themeMode === 'auto') {
                this.poll();
            }
        };

        window.addEventListener('focus', onActivity);
        window.addEventListener('mouseenter', onActivity);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                onActivity();
            }
        });
    }

    startWatchdog() {
        if (this.watchdogTimer) {
            clearInterval(this.watchdogTimer);
        }
        this.watchdogTimer = setInterval(() => {
            this.poll();
        }, 250);
    }

    detectHostSkin() {
        if (this.isCEP && this.csInterface) {
            try {
                const hostEnv = this.csInterface.getHostEnvironment();
                if (hostEnv && hostEnv.appSkinInfo) {
                    this.hostSkin = hostEnv.appSkinInfo;
                }
            } catch (e) {
                console.warn('Could not read host skin info:', e);
            }
        }
    }

    /**
     * Bulletproof RGB color extractor supporting both 0-255 integers and 0.0-1.0 floats
     */
    extractRGB(skin) {
        if (!skin) {
            return null;
        }
        const bgObj = skin.panelBackgroundColorSRGB || skin.panelBackgroundColor;
        if (!bgObj) {
            return null;
        }

        const colorObj = (bgObj.color && typeof bgObj.color === 'object') ? bgObj.color : bgObj;
        if (!colorObj) {
            return null;
        }

        let r = (colorObj.red !== undefined) ? colorObj.red : colorObj.r;
        let g = (colorObj.green !== undefined) ? colorObj.green : colorObj.g;
        let b = (colorObj.blue !== undefined) ? colorObj.blue : colorObj.b;

        if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
            return null;
        }

        // Scale normalized 0.0 - 1.0 range to 0 - 255 if applicable
        if (r <= 1.0 && g <= 1.0 && b <= 1.0 && (r > 0 || g > 0 || b > 0)) {
            r = r * 255;
            g = g * 255;
            b = b * 255;
        }

        return {
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b)
        };
    }

    /**
     * Active real-time poll called by watchdog and window event listeners
     */
    poll() {
        if (this.themeMode !== 'auto') {
            return;
        }
        if (this.isCEP) {
            this.detectHostSkin();
            const rgb = this.extractRGB(this.hostSkin);
            if (rgb) {
                if (this.lastR === null || rgb.r !== this.lastR || rgb.g !== this.lastG || rgb.b !== this.lastB) {
                    this.lastR = rgb.r;
                    this.lastG = rgb.g;
                    this.lastB = rgb.b;
                    this.applyTheme();
                }
            }
        }
    }

    /**
     * Called by ExtendScript selection polling bridge with live uiBrightness (0.0 - 1.0)
     */
    checkExtendScriptBrightness(uiBrightness) {
        if (typeof uiBrightness !== 'number' || uiBrightness < 0) {
            return;
        }
        if (this.extendScriptBrightness !== uiBrightness) {
            this.extendScriptBrightness = uiBrightness;
            if (this.themeMode === 'auto') {
                this.applyTheme();
            }
        }
    }

    /**
     * Compute brightness and determine theme from Illustrator skin or ExtendScript preference
     */
    resolveTheme() {
        if (this.themeMode === 'figma-dark') {
            return { theme: 'figma-dark', tier: 'dark' };
        }
        if (this.themeMode === 'figma-light') {
            return { theme: 'figma-light', tier: 'light' };
        }
        if (this.themeMode === 'light') {
            return { theme: 'light', tier: 'light' };
        }
        if (this.themeMode === 'dark') {
            return { theme: 'dark', tier: 'dark' };
        }

        // In 'auto' mode: check CEP host skin first
        const rgb = this.extractRGB(this.hostSkin);
        let skinResolved = null;

        if (rgb) {
            // Standard ITU-R BT.601 relative luminance formula
            const brightness = Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);

            let tier = 'dark';
            if (brightness >= 210) {
                tier = 'light';
            } else if (brightness >= 140) {
                tier = 'medium-light';
            } else if (brightness >= 70) {
                tier = 'medium-dark';
            } else {
                tier = 'dark';
            }

            skinResolved = {
                theme: (brightness >= 140) ? 'light' : 'dark',
                tier: tier,
                r: rgb.r,
                g: rgb.g,
                b: rgb.b,
                brightness: brightness
            };
        }

        // Check ExtendScript live preference if available
        if (this.extendScriptBrightness !== null && this.extendScriptBrightness >= 0) {
            const esVal = this.extendScriptBrightness;
            let esTier = 'dark';
            let esR = 50, esG = 50, esB = 50;

            if (esVal >= 0.85) {
                esTier = 'light';
                esR = 240; esG = 240; esB = 240;
            } else if (esVal >= 0.51) {
                esTier = 'medium-light';
                esR = 184; esG = 184; esB = 184;
            } else if (esVal >= 0.25) {
                esTier = 'medium-dark';
                esR = 83; esG = 83; esB = 83;
            } else {
                esTier = 'dark';
                esR = 50; esG = 50; esB = 50;
            }

            const esTheme = (esVal > 0.5) ? 'light' : 'dark';

            // If skin was unavailable or differs from live ExtendScript preference, prioritize live preference
            if (!skinResolved || skinResolved.theme !== esTheme) {
                return {
                    theme: esTheme,
                    tier: esTier,
                    r: (skinResolved && skinResolved.theme === esTheme) ? skinResolved.r : esR,
                    g: (skinResolved && skinResolved.theme === esTheme) ? skinResolved.g : esG,
                    b: (skinResolved && skinResolved.theme === esTheme) ? skinResolved.b : esB,
                    brightness: Math.round((esR * 299 + esG * 587 + esB * 114) / 1000)
                };
            }
        }

        if (skinResolved) {
            return skinResolved;
        }

        // Standalone browser fallback
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return { theme: 'light', tier: 'light' };
        }

        return { theme: 'dark', tier: 'dark' };
    }

    applyTheme(force = false) {
        const resolved = this.resolveTheme();
        const prevTheme = this.activeTheme;
        const prevTier = this.activeTier;

        const hasThemeChanged = (prevTheme !== resolved.theme || prevTier !== resolved.tier);
        if (!hasThemeChanged && !force && this.hasAppliedOnce) {
            return;
        }
        this.hasAppliedOnce = true;
        this.activeTheme = resolved.theme;
        this.activeTier = resolved.tier;

        const doc = document.documentElement;
        doc.setAttribute('data-theme', this.activeTheme);
        doc.setAttribute('data-theme-tier', this.activeTier);

        // If host RGB values are available, dynamically inject exact panel background
        if (resolved.r !== undefined) {
            doc.style.setProperty('--ai-host-bg', `rgb(${resolved.r}, ${resolved.g}, ${resolved.b})`);
        } else {
            doc.style.removeProperty('--ai-host-bg');
        }

        // Update theme toggle button in UI if present
        this.updateThemeButtonUI();

        // Notify listeners if theme or tier changed
        this.notifyListeners({
            theme: this.activeTheme,
            tier: this.activeTier,
            isLight: this.isLight(),
            mode: this.themeMode,
            changed: prevTheme !== this.activeTheme || prevTier !== this.activeTier
        });
    }

    isLight() {
        return this.activeTheme === 'light';
    }

    getTheme() {
        return this.activeTheme;
    }

    getThemeMode() {
        return this.themeMode;
    }

    setThemeMode(mode) {
        if (mode !== 'auto' && mode !== 'light' && mode !== 'dark' && mode !== 'figma-dark' && mode !== 'figma-light') {
            return;
        }
        this.themeMode = mode;
        try {
            localStorage.setItem('ai_plugin_theme_mode', mode);
        } catch (e) {}
        this.applyTheme(true);
    }

    toggleTheme() {
        // Cycle: auto -> figma-dark -> figma-light -> light -> dark -> auto
        if (this.themeMode === 'auto') {
            this.setThemeMode('figma-dark');
        } else if (this.themeMode === 'figma-dark') {
            this.setThemeMode('figma-light');
        } else if (this.themeMode === 'figma-light') {
            this.setThemeMode('light');
        } else if (this.themeMode === 'light') {
            this.setThemeMode('dark');
        } else {
            this.setThemeMode('auto');
        }
    }

    onThemeChange(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    notifyListeners(payload) {
        this.listeners.forEach((cb) => {
            try {
                cb(payload);
            } catch (e) {
                console.error('Error in theme listener:', e);
            }
        });
    }

    /**
     * Get theme-aware canvas palette colors for 2D/curve renderers
     */
    getCanvasColors() {
        if (this.isLight()) {
            return {
                isLight: true,
                bg: '#f8fafc',
                grid: '#e2e8f0',
                border: '#cbd5e1',
                crosshair: '#94a3b8',
                stem: '#64748b',
                nodeInactive: '#64748b',
                text: '#475569',
                tick: '#64748b',
                dropline: 'rgba(15, 23, 42, 0.35)',
                glow: 'rgba(2, 132, 199, 0.18)',
                axisBase: '#334155'
            };
        }
        return {
            isLight: false,
            bg: '#161616',
            grid: '#222222',
            border: '#353535',
            crosshair: '#323232',
            stem: '#4b6584',
            nodeInactive: '#777777',
            text: '#999999',
            tick: '#777777',
            dropline: 'rgba(255, 255, 255, 0.35)',
            glow: 'rgba(13, 153, 255, 0.22)',
            axisBase: '#ffffff'
        };
    }

    updateThemeButtonUI() {
        const btn = document.getElementById('btn-theme-toggle');
        if (!btn) {
            return;
        }

        const iconEl = btn.querySelector('.theme-opt-icon');
        const textEl = btn.querySelector('.theme-opt-text');

        let icon = '🌓';
        let label = 'Auto';
        let title = 'Թեմա՝ Ինքնաշխատ (ըստ Illustrator-ի) / Theme: Auto';

        if (this.themeMode === 'auto') {
            icon = this.isLight() ? '🌓' : '🌘';
            label = 'Auto';
            title = 'Թեմա՝ Ինքնաշխատ ըստ Illustrator-ի (սեղմեք փոխելու համար)';
        } else if (this.themeMode === 'light') {
            icon = '☀️';
            label = 'Light';
            title = 'Թեմա՝ Սպիտակ (Light) (սեղմեք փոխելու համար)';
        } else if (this.themeMode === 'dark') {
            icon = '🌙';
            label = 'Dark';
            title = 'Թեմա՝ Սև (Dark) (սեղմեք փոխելու համար)';
        }

        if (iconEl) {
            iconEl.textContent = icon;
        }
        if (textEl) {
            textEl.textContent = label;
        }
        btn.setAttribute('title', title);
    }
}

// Attach globally
window.themeManager = new ThemeManager();

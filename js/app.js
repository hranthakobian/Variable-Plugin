/**
 * Main Application Coordinator
 * Handles tab navigation, automatic selection polling, mode synchronization,
 * and high-performance real-time trailing-throttled updates to Adobe Illustrator.
 * Follows K&R / 1TBS brace formatting.
 */

class AppController {
    constructor() {
        this.activeMode = 'slider';
        this.currentSelectionInfo = null;
        this.lastSelectionSignature = '';

        // Mode controllers
        this.sliderMode = null;
        this.graphMode = null;
        this.designSpaceMode = null;

        // Throttled real-time live preview state
        this.pendingParameterUpdate = null;
        this.pendingCurveUpdate = null;
        this.isExecutingScript = false;
        this.rafId = null;

        // User interaction flag (pauses polling during active drag operations)
        this.isUserInteracting = false;
        this.pollTimer = null;

        this.init();
    }

    async init() {
        this.bindDOM();
        this.initModes();
        this.bindBridgeEvents();
        this.bindInteractionGuards();

        // Initialize localization
        if (window.i18n) {
            await window.i18n.init();
            this.updateLanguageUI(window.i18n.currentLang);
            window.i18n.onLanguageChange((lang) => {
                this.updateLanguageUI(lang);
                this.reRenderCurrentMode();
            });
        }

        // Initialize Theme Synchronization with Illustrator
        if (window.themeManager) {
            window.themeManager.onThemeChange(() => {
                this.redrawCanvases();
                this.reRenderCurrentMode();
            });
        }

        // Default to closed tools until selection is verified from Illustrator
        this.updateNoSelectionView(true, []);

        // Initial selection load
        await this.refreshSelection(true);

        // Position animated sliding tab indicator and initialize active mode state
        this.switchMode(this.activeMode);
        window.addEventListener('resize', () => {
            this.updateTabIndicator(this.activeMode);
        });

        // Start polling for selection changes in Illustrator
        this.startSelectionPolling();
    }

    bindDOM() {
        // Mode Tabs Switcher
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetMode = btn.dataset.mode;
                this.switchMode(targetMode);
            });
        });

        // Language Toggle Button
        const btnLang = document.getElementById('btn-lang-toggle');
        if (btnLang && window.i18n) {
            btnLang.addEventListener('click', () => {
                window.i18n.toggleLanguage();
            });
        }

        // Theme Toggle Button (Dark / Light / Auto)
        const btnTheme = document.getElementById('btn-theme-toggle');
        if (btnTheme && window.themeManager) {
            btnTheme.addEventListener('click', () => {
                window.themeManager.toggleTheme();
            });
        }

        // Sync Selection Button
        const btnSync = document.getElementById('btn-sync-selection');
        if (btnSync) {
            btnSync.addEventListener('click', async () => {
                btnSync.style.transform = 'rotate(180deg)';
                await this.refreshSelection(true);
                setTimeout(() => {
                    btnSync.style.transform = '';
                }, 250);
            });
        }

        // Window / Panels Visibility Menu
        this.setupWindowMenu();
    }

    setupWindowMenu() {
        const btnWindow = document.getElementById('btn-window-menu');
        const dropdown = document.getElementById('window-menu-dropdown');
        const btnReset = document.getElementById('btn-reset-layout');

        if (btnWindow && dropdown) {
            btnWindow.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = (dropdown.style.display === 'none' || !dropdown.style.display);
                dropdown.style.display = isHidden ? 'block' : 'none';
                if (isHidden) {
                    this.updateWindowMenuItems();
                }
            });

            document.addEventListener('click', (e) => {
                if (!btnWindow.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
        }

        const btnRestartTour = document.getElementById('btn-restart-tour');
        if (btnRestartTour) {
            btnRestartTour.addEventListener('click', (e) => {
                e.stopPropagation();
                if (dropdown) {
                    dropdown.style.display = 'none';
                }
                if (this.tourGuide) {
                    this.tourGuide.restartTour();
                }
            });
        }

        if (btnReset) {
            btnReset.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.graphMode && typeof this.graphMode.resetSectionsLayout === 'function') {
                    this.graphMode.resetSectionsLayout();
                }
                this.updateWindowMenuItems();
            });
        }
    }

    updateWindowMenuItems() {
        const container = document.getElementById('window-menu-items');
        if (!container) {
            return;
        }

        const i18n = window.i18n;
        const panelDefs = [
            { id: 'curves', label: i18n ? i18n.t('panelCurves') : 'Curve Layers' },
            { id: 'toolbar', label: i18n ? i18n.t('panelToolbar') : 'Axis Settings' },
            { id: 'canvas', label: i18n ? i18n.t('panelCanvas') : 'Spline Canvas' },
            { id: 'points', label: i18n ? i18n.t('panelPoints') : 'Points Control' },
            { id: 'presets', label: i18n ? i18n.t('panelPresets') : 'Presets & Folders' }
        ];

        const layout = (this.graphMode && typeof this.graphMode.getSectionsLayout === 'function')
            ? this.graphMode.getSectionsLayout()
            : { visibility: { curves: true, toolbar: true, canvas: true, points: true, presets: true } };

        container.innerHTML = '';
        panelDefs.forEach((panel) => {
            const row = document.createElement('label');
            row.className = 'window-menu-item';

            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.className = 'window-menu-checkbox';
            chk.checked = layout.visibility[panel.id] !== false;
            chk.dataset.panelId = panel.id;

            chk.addEventListener('change', () => {
                if (this.graphMode && typeof this.graphMode.toggleSectionVisibility === 'function') {
                    this.graphMode.toggleSectionVisibility(panel.id, chk.checked, true);
                }
            });

            const text = document.createElement('span');
            text.className = 'window-menu-item-label';
            text.textContent = panel.label;

            row.appendChild(chk);
            row.appendChild(text);
            container.appendChild(row);
        });
    }

    bindInteractionGuards() {
        let guardTimer = null;
        const resetInteraction = () => {
            if (guardTimer) {
                clearTimeout(guardTimer);
                guardTimer = null;
            }
            guardTimer = setTimeout(() => {
                this.isUserInteracting = false;
                guardTimer = null;
            }, 300);
        };

        const triggerInteraction = (duration = 600) => {
            this.isUserInteracting = true;
            if (guardTimer) {
                clearTimeout(guardTimer);
            }
            guardTimer = setTimeout(() => {
                this.isUserInteracting = false;
                guardTimer = null;
            }, duration);
        };

        window.addEventListener('mouseup', resetInteraction);
        window.addEventListener('pointerup', resetInteraction);
        window.addEventListener('touchend', resetInteraction);
        window.addEventListener('mouseleave', resetInteraction);
        window.addEventListener('blur', resetInteraction);
        window.addEventListener('focus', resetInteraction);

        window.addEventListener('input', () => triggerInteraction(600), { passive: true });
        window.addEventListener('touchmove', () => triggerInteraction(600), { passive: true });
        window.addEventListener('pointerdown', () => triggerInteraction(600), { passive: true });
        window.addEventListener('pointermove', (e) => {
            if (e.buttons > 0) {
                triggerInteraction(600);
            }
        }, { passive: true });
        window.addEventListener('mousedown', () => triggerInteraction(600), { passive: true });
        window.addEventListener('mousemove', (e) => {
            if (e.buttons > 0) {
                triggerInteraction(600);
            }
        }, { passive: true });
    }

    initModes() {
        const sliderContainer = document.getElementById('slider-controls-container');
        const graphContainer = document.getElementById('graph-controls-container');
        const dsContainer = document.getElementById('design-space-container');

        // Mode 1: Sliders with individual Bézier curves
        this.sliderMode = new SliderMode(
            sliderContainer,
            (newValues) => {
                this.handleSliderChange(newValues);
            },
            (curvePayload) => {
                this.handleGraphChange(curvePayload);
            }
        );

        // Mode 2: Dedicated Graph Studio
        this.graphMode = new GraphMode(graphContainer, (distConfig) => {
            this.handleGraphChange(distConfig);
        });

        // Mode 3: 2D Design Space Field
        this.designSpaceMode = new DesignSpaceMode(dsContainer, (coords) => {
            this.handleDesignSpaceChange(coords);
        });

        // Studio Interactive Tour Guide & Onboarding
        if (typeof StudioTourGuide !== 'undefined') {
            this.tourGuide = new StudioTourGuide(this);
        }
    }

    bindBridgeEvents() {
        window.illustratorBridge.on('selectionChanged', () => {
            this.refreshSelection(true);
        });
    }

    startSelectionPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
        }
        this.pollTimer = setInterval(async () => {
            // Never poll during live drag/touch interaction to guarantee 100% bridge throughput
            if (this.isUserInteracting || this.isExecutingScript) {
                return;
            }
            await this.refreshSelection(false);
        }, 200);
    }

    updateTabIndicator(modeName = this.activeMode) {
        const nav = document.getElementById('mode-tabs');
        const pill = document.getElementById('tab-indicator-pill');
        const activeBtn = document.querySelector(`.tab-btn[data-mode="${modeName}"]`);
        if (!nav || !pill || !activeBtn) {
            return;
        }

        const navRect = nav.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();

        const left = btnRect.left - navRect.left;
        const top = btnRect.top - navRect.top;
        const width = btnRect.width;
        const height = btnRect.height;

        pill.style.left = `${left}px`;
        pill.style.top = `${top}px`;
        pill.style.width = `${width}px`;
        pill.style.height = `${height}px`;

        pill.className = `tab-indicator-pill mode-${modeName}`;
    }

    switchMode(modeName) {
        this.activeMode = modeName;

        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.mode === modeName);
        });

        this.updateTabIndicator(modeName);

        document.getElementById('pane-slider').classList.toggle('active', modeName === 'slider');
        document.getElementById('pane-graph').classList.toggle('active', modeName === 'graph');
        document.getElementById('pane-design-space').classList.toggle('active', modeName === 'designSpace');

        // Only show "Փեղկեր" button when in "Արվեստանոց" (graph) mode
        const winBtn = document.getElementById('btn-window-menu');
        const winDropdown = document.getElementById('window-menu-dropdown');
        if (winBtn) {
            if (modeName === 'graph') {
                winBtn.style.display = 'inline-flex';
            } else {
                winBtn.style.display = 'none';
                if (winDropdown) {
                    winDropdown.style.display = 'none';
                }
            }
        }

        const hasNoSel = !this.currentSelectionInfo || !this.currentSelectionInfo.hasSelection;
        if (hasNoSel) {
            this.updateNoSelectionView(true, this.currentSelectionInfo ? this.currentSelectionInfo.documentTextFrames : []);
            return;
        }

        if (modeName === 'graph') {
            if (this.tourGuide) {
                this.tourGuide.checkFirstTimeWelcome();
            }
            if (this.graphMode) {
                this.graphMode.syncSelection(this.currentSelectionInfo);
                requestAnimationFrame(() => {
                    this.graphMode.setupCanvas();
                    this.graphMode.redraw();
                });
            }
        } else if (modeName === 'designSpace' && this.designSpaceMode) {
            this.designSpaceMode.syncAxes(this.currentSelectionInfo.axes || []);
            this.designSpaceMode.syncValues(this.currentSelectionInfo.currentValues);
            requestAnimationFrame(() => {
                this.designSpaceMode.setupCanvas();
                this.designSpaceMode.redraw();
            });
        } else if (modeName === 'slider' && this.sliderMode) {
            this.sliderMode.syncValues(this.currentSelectionInfo.currentValues);
        }
    }

    async refreshSelection(forceRender = false) {
        try {
            const info = await window.illustratorBridge.getSelectionInfo();

            // Real-time UI brightness synchronization with Illustrator preferences
            if (info && typeof info.uiBrightness === 'number' && info.uiBrightness >= 0 && window.themeManager) {
                window.themeManager.checkExtendScriptBrightness(info.uiBrightness);
            }

            if (!info || !info.hasDoc) {
                this.currentSelectionInfo = info;
                this.updateHeaderUI(info, false);
                this.updateNoSelectionView(true, (info && info.documentTextFrames) ? info.documentTextFrames : []);
                this.updateNonVariableWarning(false);
                return;
            }

            // If user has no selection, display "Select text to edit" with document text frames and hide all tools
            if (!info.hasSelection) {
                this.currentSelectionInfo = info;
                this.lastSelectionSignature = 'no_selection';
                this.updateNoSelectionView(true, info.documentTextFrames || []);
                this.updateNonVariableWarning(false);
                this.updateHeaderUI(info, false);
                return;
            }

            // Dismiss no-selection empty state and show tools when valid selection exists
            this.updateNoSelectionView(false);

            const isNonVar = info.type === 'text' && (!info.axes || info.axes.length === 0);
            this.updateNonVariableWarning(isNonVar, info.fontName || info.fontFamily);

            if (isNonVar) {
                this.updateHeaderUI(info, true);
                return;
            }

            const axesIds = (info.axes || []).map((a) => a.id).join(',');
            const valsSig = Object.entries(info.currentValues || {}).map(([k, v]) => `${k}:${v}`).join(',');
            const curveSig = info.savedCurve ? JSON.stringify(info.savedCurve) : '';
            const signature = `${info.hasSelection}_${info.itemId || ''}_${info.type}_${info.fontFamily}_${info.fontName}_${info.charCount}_${info.totalSelected}_${axesIds}_${valsSig}_${curveSig}`;

            if (!forceRender && signature === this.lastSelectionSignature) {
                this.sliderMode.syncValues(info.currentValues);
                this.designSpaceMode.syncValues(info.currentValues);
                return;
            }

            this.lastSelectionSignature = signature;
            this.currentSelectionInfo = info;
            this.updateHeaderUI(info, false);

            const target = info.type === 'text' ? 'characters' : 'items';
            const count = info.type === 'text' ? (info.charCount || 16) : (info.totalSelected || 8);

            this.sliderMode.configure(info.axes, info.currentValues, count, target, info.savedCurve);
            this.sliderMode.syncValues(info.currentValues);
            this.graphMode.syncSelection(info);
            this.designSpaceMode.syncAxes(info.axes);
            this.designSpaceMode.syncValues(info.currentValues);
        } catch (err) {
            console.error('Failed to read selection info:', err);
        }
    }

    updateLanguageUI(lang) {
        const optHy = document.getElementById('lang-opt-hy');
        const optEn = document.getElementById('lang-opt-en');
        if (optHy) {
            optHy.classList.toggle('active', lang === 'hy');
        }
        if (optEn) {
            optEn.classList.toggle('active', lang === 'en');
        }

        const tabSlider = document.getElementById('tab-btn-slider');
        const tabGraph = document.getElementById('tab-btn-graph');
        const tabDs = document.getElementById('tab-btn-designSpace');

        if (tabSlider) {
            tabSlider.textContent = window.i18n.t('tabSliders');
        }
        if (tabGraph) {
            tabGraph.textContent = window.i18n.t('tabGraph');
        }
        if (tabDs) {
            tabDs.textContent = window.i18n.t('tabDesignSpace');
        }

        this.updateTabIndicator(this.activeMode);

        const btnSync = document.getElementById('btn-sync-selection');
        if (btnSync) {
            btnSync.title = window.i18n.t('syncTitle');
        }

        const btnLang = document.getElementById('btn-lang-toggle');
        if (btnLang) {
            btnLang.title = window.i18n.t('langToggleTitle');
        }

        const btnTheme = document.getElementById('btn-theme-toggle');
        if (btnTheme && window.themeManager) {
            btnTheme.title = window.i18n.t('themeToggleTitle');
        }

        const winBtn = document.getElementById('btn-window-menu');
        if (winBtn) {
            winBtn.title = window.i18n.t('windowMenuTitle');
        }

        const winText = document.getElementById('window-menu-text');
        if (winText) {
            winText.textContent = window.i18n.t('windowMenuBtn');
        }

        const winHeading = document.getElementById('window-menu-heading');
        if (winHeading) {
            winHeading.textContent = window.i18n.t('windowMenuBtn');
        }

        const btnReset = document.getElementById('btn-reset-layout');
        if (btnReset) {
            btnReset.innerHTML = `<i class="hd-icon hd-icon-undo-arrow"></i> ${window.i18n.t('resetLayoutBtn')}`;
        }

        const btnRestartTour = document.getElementById('btn-restart-tour');
        if (btnRestartTour) {
            btnRestartTour.innerHTML = `<i class="hd-icon hd-icon-info"></i> ${window.i18n.t('restartTourBtn')}`;
        }

        if (this.tourGuide && typeof this.tourGuide.updateWelcomeTexts === 'function') {
            this.tourGuide.updateWelcomeTexts();
        }

        this.updateWindowMenuItems();

        if (this.currentSelectionInfo) {
            if (!this.currentSelectionInfo.hasSelection) {
                this.updateNoSelectionView(true, this.currentSelectionInfo.documentTextFrames || []);
                this.updateHeaderUI(this.currentSelectionInfo, false);
            } else {
                const isNonVar = this.currentSelectionInfo.type === 'text' && (!this.currentSelectionInfo.axes || this.currentSelectionInfo.axes.length === 0);
                this.updateHeaderUI(this.currentSelectionInfo, isNonVar);
                if (isNonVar) {
                    this.updateNonVariableWarning(true, this.currentSelectionInfo.fontName || this.currentSelectionInfo.fontFamily);
                } else {
                    this.updateNonVariableWarning(false);
                }
            }
        }
    }

    redrawCanvases() {
        try {
            if (this.graphMode && typeof this.graphMode.redraw === 'function') {
                this.graphMode.redraw();
            }
            if (this.designSpaceMode && typeof this.designSpaceMode.redraw === 'function') {
                this.designSpaceMode.redraw();
            }
            if (this.sliderMode && typeof this.sliderMode.renderDynamicCurvePreview === 'function') {
                this.sliderMode.renderDynamicCurvePreview();
            }
        } catch (e) {
            console.warn('Canvas redraw on theme change error:', e);
        }
    }

    reRenderCurrentMode() {
        this.redrawCanvases();
        const info = this.currentSelectionInfo;
        if (!info || !info.hasSelection) {
            this.updateNoSelectionView(true, info ? info.documentTextFrames : []);
            return;
        }

        if (this.sliderMode) {
            this.sliderMode.render();
            this.sliderMode.syncValues(info.currentValues);
        }
        if (this.graphMode) {
            this.graphMode.renderUI();
            this.graphMode.setupCanvas();
            this.graphMode.bindEvents();
            this.graphMode.syncSelection(info);
        }
        if (this.designSpaceMode) {
            this.designSpaceMode.renderUI();
            this.designSpaceMode.setupCanvas();
            this.designSpaceMode.bindEvents();
            this.designSpaceMode.syncAxes(info.axes || []);
            this.designSpaceMode.syncValues(info.currentValues);
        }
    }

    updateNonVariableWarning(isNonVariable, fontName) {
        const panes = [
            { pane: document.getElementById('pane-slider'), container: document.getElementById('slider-controls-container') },
            { pane: document.getElementById('pane-graph'), container: document.getElementById('graph-controls-container') },
            { pane: document.getElementById('pane-design-space'), container: document.getElementById('design-space-container') }
        ];

        const headingText = window.i18n ? window.i18n.t('nonVarHeading') : 'Տառատեսակը փոփոխական (Variable Font) չէ';
        const bodyText = window.i18n ? window.i18n.t('nonVarBody') : 'Ընտրված տառատեսակը չունի OpenType Variable Font առանցքներ։';

        panes.forEach(({ pane, container }) => {
            if (!pane || !container) {
                return;
            }
            const existingWarn = pane.querySelector('.non-variable-warning-card');

            if (isNonVariable) {
                container.style.display = 'none';
                if (!existingWarn) {
                    const warn = document.createElement('div');
                    warn.className = 'non-variable-warning-card';
                    warn.innerHTML = `
                        <div class="warning-heading">${headingText}</div>
                        <div class="warning-font-badge">${fontName || 'Static Font'}</div>
                        <div class="warning-body-text">${bodyText}</div>
                    `;
                    pane.appendChild(warn);
                } else {
                    const headingEl = existingWarn.querySelector('.warning-heading');
                    if (headingEl) {
                        headingEl.textContent = headingText;
                    }
                    const badge = existingWarn.querySelector('.warning-font-badge');
                    if (badge) {
                        badge.textContent = fontName || 'Static Font';
                    }
                    const bodyEl = existingWarn.querySelector('.warning-body-text');
                    if (bodyEl) {
                        bodyEl.innerHTML = bodyText;
                    }
                }
            } else {
                container.style.display = '';
                if (existingWarn) {
                    existingWarn.remove();
                }
            }
        });
    }

    escapeHtml(str) {
        if (!str) {
            return '';
        }
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    updateNoSelectionView(showEmpty, textFrames = []) {
        document.body.classList.toggle('has-no-selection', Boolean(showEmpty));

        if (showEmpty) {
            if (this.tourGuide) {
                if (typeof this.tourGuide.cleanupTour === 'function') {
                    this.tourGuide.cleanupTour();
                }
                if (typeof this.tourGuide.hideWelcomeModal === 'function') {
                    this.tourGuide.hideWelcomeModal();
                }
            }
        }

        const panes = [
            { pane: document.getElementById('pane-slider'), container: document.getElementById('slider-controls-container') },
            { pane: document.getElementById('pane-graph'), container: document.getElementById('graph-controls-container') },
            { pane: document.getElementById('pane-design-space'), container: document.getElementById('design-space-container') }
        ];

        panes.forEach(({ pane, container }) => {
            if (!pane || !container) {
                return;
            }
            const existingCard = pane.querySelector('.no-selection-card');

            if (showEmpty) {
                container.style.display = 'none';
                if (!existingCard) {
                    const card = document.createElement('div');
                    card.className = 'no-selection-card';
                    card.innerHTML = this.buildNoSelectionHtml(textFrames);
                    pane.appendChild(card);
                    this.bindNoSelectionEvents(card);
                } else {
                    existingCard.innerHTML = this.buildNoSelectionHtml(textFrames);
                    this.bindNoSelectionEvents(existingCard);
                }
            } else {
                container.style.display = '';
                if (existingCard) {
                    existingCard.remove();
                }
            }
        });
    }

    buildNoSelectionHtml(textFrames) {
        const i18n = window.i18n;
        const heading = i18n ? i18n.t('selectTextToEdit') : 'Select text to edit';
        const subHeading = i18n ? i18n.t('docTextFramesTitle') : 'Document text frames:';
        const emptyMsg = i18n ? i18n.t('noTextFramesInDoc') : 'No text frames in document';
        const clickTip = i18n ? i18n.t('clickToSelectInDoc') : 'Click to select in document';
        const varBadge = i18n ? i18n.t('variableFontTag') : 'Variable';
        const staticBadge = i18n ? i18n.t('staticFontTag') : 'Static';

        let listHtml = '';
        if (!textFrames || textFrames.length === 0) {
            listHtml = `<div class="doc-tf-empty-notice">${emptyMsg}</div>`;
        } else {
            listHtml = '<div class="doc-text-frames-list">' +
                textFrames.map((tf) => {
                    const rawSnippet = tf.snippet || tf.text || '';
                    const snippet = rawSnippet ? this.escapeHtml(rawSnippet) : '...';
                    const font = tf.fontName ? this.escapeHtml(tf.fontName) : 'Unknown Font';
                    const isVar = Boolean(tf.isVariable);
                    const badgeClass = isVar ? 'var-badge' : 'static-badge';
                    const badgeText = isVar ? varBadge : staticBadge;
                    const chars = tf.charCount || 0;
                    return `
                        <div class="doc-text-frame-card" data-index="${tf.index}" title="${clickTip}">
                            <div class="doc-tf-top">
                                <span class="doc-tf-preview">“${snippet}”</span>
                                <span class="doc-tf-badge ${badgeClass}">${badgeText}</span>
                            </div>
                            <div class="doc-tf-bottom">
                                <span class="doc-tf-font">${font}</span>
                                <span class="doc-tf-chars">${chars} chars</span>
                            </div>
                        </div>
                    `;
                }).join('') +
                '</div>';
        }

        return `
            <div class="no-selection-content">
                <div class="no-selection-heading">${heading}</div>
                <div class="no-selection-sub">${subHeading} (${textFrames ? textFrames.length : 0})</div>
                ${listHtml}
            </div>
        `;
    }

    bindNoSelectionEvents(containerEl) {
        const cards = containerEl.querySelectorAll('.doc-text-frame-card');
        cards.forEach((card) => {
            card.addEventListener('click', async () => {
                const idx = parseInt(card.getAttribute('data-index'), 10);
                if (!isNaN(idx)) {
                    card.classList.add('loading');
                    try {
                        await window.illustratorBridge.selectTextFrame(idx);
                        await this.refreshSelection(true);
                    } catch (err) {
                        console.error('Failed to select text frame:', err);
                        card.classList.remove('loading');
                    }
                }
            });
        });
    }

    updateHeaderUI(info, isNonVariable = false) {
        const dot = document.getElementById('status-indicator');
        const nameLabel = document.getElementById('selection-name');
        const metaLabel = document.getElementById('selection-meta');
        const i18n = window.i18n;

        if (!info || !info.hasDoc) {
            dot.className = 'status-dot no-selection';
            nameLabel.textContent = i18n ? i18n.t('noDoc') : 'No Document Open';
            metaLabel.textContent = i18n ? i18n.t('idle') : 'Illustrator Idle';
            return;
        }

        if (!info.hasSelection) {
            dot.className = 'status-dot no-selection';
            nameLabel.textContent = i18n ? i18n.t('selectTextToEdit') : 'Select text to edit';
            const count = (info.documentTextFrames || []).length;
            metaLabel.textContent = i18n ? `${i18n.t('docTextFramesTitle')} (${count})` : `Document Text Frames (${count})`;
            return;
        }

        if (isNonVariable) {
            dot.className = 'status-dot warning';
            nameLabel.textContent = info.fontName || info.fontFamily || (i18n ? i18n.t('staticFont') : 'Static Font');
            metaLabel.textContent = i18n ? i18n.t('staticFontNotice') : 'Non-Variable Font (Static)';
            return;
        }

        if (info.type === 'text') {
            const isStatic = info.isVariableFont === false;
            if (isStatic) {
                dot.className = 'status-dot warning';
                const staticNotice = i18n ? i18n.t('staticFontTag') : 'Static';
                const fName = info.fontName || info.fontFamily || (i18n ? i18n.t('staticFont') : 'Static Font');
                nameLabel.textContent = `${fName} (${staticNotice})`;
            } else {
                dot.className = 'status-dot';
                nameLabel.textContent = info.fontName || info.fontFamily || (i18n ? i18n.t('varFont') : 'Variable Font');
            }
            const count = info.charCount || 1;
            metaLabel.textContent = i18n ? i18n.t('charsSelected', { count }) : `${count} Character(s) Selected`;
        } else {
            dot.className = 'status-dot';
            nameLabel.textContent = i18n ? i18n.t('vectorObjects') : 'Dynamic Vector Object(s)';
            const count = info.totalSelected || 1;
            metaLabel.textContent = i18n ? i18n.t('itemsSelected', { count }) : `${count} Item(s) Selected`;
        }
    }

    /**
     * Handlers for real-time live interactions
     */
    handleSliderChange(newValues) {
        this.designSpaceMode.syncValues(newValues);
        this.scheduleParameterUpdate(newValues);
    }

    handleDesignSpaceChange(newCoords) {
        this.sliderMode.syncValues(newCoords);
        this.scheduleParameterUpdate(newCoords);
    }

    handleGraphChange(distributionConfig) {
        this.scheduleCurveUpdate(distributionConfig);
    }

    /**
     * High-performance real-time update dispatcher with trailing throttle
     */
    scheduleParameterUpdate(params) {
        this.isUserInteracting = true;
        this.pendingParameterUpdate = Object.assign(this.pendingParameterUpdate || {}, params);
        this.requestFlush();
    }

    scheduleCurveUpdate(distConfig) {
        this.isUserInteracting = true;
        this.pendingCurveUpdate = distConfig;
        this.requestFlush();
    }

    requestFlush() {
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(() => {
                this.rafId = null;
                this.flushLiveUpdates();
            });
        }
    }

    async flushLiveUpdates() {
        // If an update is currently in flight in ExtendScript, let it complete;
        // it will immediately trigger the next frame with the newest accumulated values!
        if (this.isExecutingScript) {
            return;
        }

        if (!this.pendingParameterUpdate && !this.pendingCurveUpdate) {
            return;
        }

        const params = this.pendingParameterUpdate;
        const curve = this.pendingCurveUpdate;
        this.pendingParameterUpdate = null;
        this.pendingCurveUpdate = null;

        this.isExecutingScript = true;
        try {
            if (params) {
                await window.illustratorBridge.applyParameters(params);
            }
            if (curve) {
                await window.illustratorBridge.applyCurveDistribution(curve);
            }
        } catch (err) {
            console.error('Error applying live real-time update:', err);
        } finally {
            this.isExecutingScript = false;
            // If new mouse drag values arrived while the script was running, flush them immediately
            if (this.pendingParameterUpdate || this.pendingCurveUpdate) {
                this.requestFlush();
            }
        }
    }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();
    window.app = window.appController;
});

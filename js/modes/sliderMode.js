/**
 * Slider Mode (1D Control with Individual Expandable Bézier Curves)
 * Dynamically builds range sliders with bidirectional numerical inputs
 * and an individual interactive Bézier curve editor for each axis.
 * Follows K&R / 1TBS brace formatting.
 */

class SliderMode {
    constructor(containerElement, onChangeCallback, onCurveChangeCallback) {
        this.container = containerElement;
        this.onChange = onChangeCallback;
        this.onCurveChange = onCurveChangeCallback;
        this.axes = [];
        this.currentValues = {};
        this.curveEditors = new Map(); // axisId -> CurveEditorInstance
        this.itemCount = 16;
        this.distributionTarget = 'characters';
    }

    /**
     * Set available axes and current values from selection
     */
    configure(axes, currentValues = {}, itemCount = 16, target = 'characters', savedCurve = null) {
        this.itemCount = itemCount || 16;
        this.distributionTarget = target || 'characters';

        const newAxes = axes && axes.length > 0 ? axes : (axes || []);
        const oldAxesIds = this.axes.map((a) => a.id).join(',');
        const newAxesIds = newAxes.map((a) => a.id).join(',');

        this.axes = newAxes;
        
        // Filter values strictly to active axes to avoid leaking parameters
        const validValues = {};
        for (let i = 0; i < this.axes.length; i++) {
            const a = this.axes[i];
            validValues[a.id] = (currentValues[a.id] !== undefined) 
                ? currentValues[a.id] 
                : (this.currentValues[a.id] !== undefined ? this.currentValues[a.id] : a.defaultVal);
        }
        this.currentValues = validValues;

        // If the axes are the same, smoothly sync values without destroying DOM or open drawers
        if (oldAxesIds === newAxesIds && this.container.children.length > 0) {
            this.syncValues(this.currentValues);
            return;
        }

        this.render();
    }

    /**
     * Render the slider controls
     */
    render() {
        this.container.innerHTML = '';
        this.curveEditors.clear();

        if (this.axes.length === 0) {
            this.container.innerHTML = `
                <div class="empty-axes-notice">
                    <div class="notice-icon"><i class="hd-icon hd-icon-info"></i></div>
                    <div class="notice-title">${window.i18n ? window.i18n.t('staticFontNotice') : 'Static Font Selected'}</div>
                    <div class="notice-text">
                        ${window.i18n ? window.i18n.t('nonVarBody') : 'The selected font does not contain variable axes. Choose a Variable Font (such as <b>Bahnschrift</b>, <b>Acumin Variable Concept</b>, or <b>Minion Variable Concept</b>) to adjust dynamic axes.'}
                    </div>
                </div>
            `;
            return;
        }

        const listContainer = document.createElement('div');
        listContainer.className = 'sliders-list';

        this.axes.forEach((axis) => {
            const axisId = axis.id;
            const min = axis.min;
            const max = axis.max;
            const step = axis.step || 1;
            const val = this.currentValues[axisId] !== undefined ? this.currentValues[axisId] : axis.defaultVal;

            const row = document.createElement('div');
            row.className = 'slider-row';
            row.id = `row-${axisId}`;
            row.dataset.axis = axisId;

            const percent = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));

            const axisDisplayName = window.i18n ? window.i18n.getAxisName(axisId, axis.name) : axis.name;
            const resetTitle = window.i18n ? window.i18n.t('resetAxisDefault', { val: axis.defaultVal }) : `Reset to default (${axis.defaultVal})`;
            const curveToggleTitle = window.i18n ? window.i18n.t('toggleCurveDrawer', { name: axisDisplayName }) : `Toggle Bézier Easing Curve for ${axis.name}`;
            const curveBtnText = window.i18n ? window.i18n.t('curveBtn') : 'Curve';
            const distHeaderText = window.i18n ? window.i18n.t('easingDistFor', { name: axisDisplayName }) : `Bézier Easing Distribution for ${axis.name}`;
            const distTargetText = window.i18n ? (this.distributionTarget === 'characters' ? window.i18n.t('mapAcrossChars') : window.i18n.t('mapAcrossItems')) : `Map across ${this.distributionTarget}`;

            row.innerHTML = `
                <div class="slider-row-header">
                    <span class="axis-label">${axisDisplayName} <code class="axis-tag">${axisId}</code></span>
                    <div class="slider-actions">
                        <input type="number" class="axis-number-input" 
                               id="num-${axisId}" 
                               min="${min}" max="${max}" step="${step}" 
                               value="${val}">
                        <button type="button" class="btn-reset-axis" title="${resetTitle}" data-axis="${axisId}"><i class="hd-icon hd-icon-undo-arrow"></i></button>
                        <button type="button" class="btn-toggle-curve" id="btn-curve-${axisId}" data-axis="${axisId}" title="${curveToggleTitle}">
                            <span>${curveBtnText}</span>
                        </button>
                    </div>
                </div>
                <div class="slider-track-wrap">
                    <span class="range-bound min-bound">${min}</span>
                    <hd-slider class="custom-slider-wrapper" id="hd-${axisId}" style="--slider-percentage: ${percent}%;">
                        <input type="range" class="real-slider" 
                               id="range-${axisId}" 
                               min="${min}" max="${max}" step="${step}" 
                               value="${val}">
                        <div class="slider-track">
                            <div class="track-active"></div>
                            <div class="track-inactive"></div>
                        </div>
                        <div class="slider-handle">
                            <div class="handle-line handle-left"></div>
                            <div class="handle-line handle-right"></div>
                        </div>
                    </hd-slider>
                    <span class="range-bound max-bound">${max}</span>
                </div>
                
                <!-- Individual Expandable Bézier Curve Drawer -->
                <div class="slider-curve-drawer" id="drawer-${axisId}">
                    <div class="curve-drawer-header">
                        <span>${distHeaderText}</span>
                        <span class="distribution-target-label">${distTargetText}</span>
                    </div>
                    <div class="inline-curve-canvas-wrap">
                        <canvas class="inline-curve-canvas" id="canvas-${axisId}" width="280" height="130"></canvas>
                    </div>

                    <!-- Direct Point Coordinate Input Fields -->
                    <div class="curve-points-editor">
                        <div class="point-field">
                            <label>${window.i18n ? window.i18n.t('p0Start') : 'P0 (Start)'}</label>
                            <input type="number" class="point-input" id="pt0-${axisId}" min="0" max="1" step="0.05" value="0.0">
                        </div>
                        <div class="point-field">
                            <label>${window.i18n ? window.i18n.t('p1Coord') : 'P1 (X, Y)'}</label>
                            <input type="text" class="point-input" id="pt1-${axisId}" value="0.45, 0.05">
                        </div>
                        <div class="point-field">
                            <label>${window.i18n ? window.i18n.t('p2Coord') : 'P2 (X, Y)'}</label>
                            <input type="text" class="point-input" id="pt2-${axisId}" value="0.55, 0.95">
                        </div>
                        <div class="point-field">
                            <label>${window.i18n ? window.i18n.t('p3End') : 'P3 (End)'}</label>
                            <input type="number" class="point-input" id="pt3-${axisId}" min="0" max="1" step="0.05" value="1.0">
                        </div>
                    </div>

                    <div class="inline-presets-row">
                        <button type="button" class="btn-inline-preset" data-preset="linear" data-axis="${axisId}">${window.i18n ? window.i18n.t('presetLinear') : 'Linear'}</button>
                        <button type="button" class="btn-inline-preset" data-preset="ease-in" data-axis="${axisId}">${window.i18n ? window.i18n.t('presetEaseIn') : 'Ease-In'}</button>
                        <button type="button" class="btn-inline-preset" data-preset="ease-out" data-axis="${axisId}">${window.i18n ? window.i18n.t('presetEaseOut') : 'Ease-Out'}</button>
                        <button type="button" class="btn-inline-preset active" data-preset="s-curve" data-axis="${axisId}">${window.i18n ? window.i18n.t('presetSCurve') : 'S-Curve'}</button>
                        <button type="button" class="btn-inline-preset" data-preset="bell" data-axis="${axisId}">${window.i18n ? window.i18n.t('presetBell') : 'Bell'}</button>
                    </div>
                    ${this.axes.length > 1 ? `
                    <div class="inline-curve-transfer-row">
                        <span class="transfer-label">${window.i18n ? window.i18n.t('copyCurveTo') : 'Copy curve to:'}</span>
                        <select class="inline-copy-curve-select" data-source-axis="${axisId}">
                            <option value="">${window.i18n ? window.i18n.t('selectTargetAxis') : 'Select axis...'}</option>
                            ${this.axes.filter((a) => a.id !== axisId).map((a) => {
                                const targetName = window.i18n ? window.i18n.getAxisName(a.id, a.name) : a.name;
                                return `<option value="${a.id}">${targetName} (${a.id})</option>`;
                            }).join('')}
                        </select>
                    </div>
                    ` : ''}
                    <div class="inline-dist-preview" id="dist-${axisId}"></div>
                </div>
            `;

            const hdWrapper = row.querySelector(`#hd-${axisId}`);
            const rangeInput = row.querySelector(`#range-${axisId}`);
            const numInput = row.querySelector(`#num-${axisId}`);
            const resetBtn = row.querySelector('.btn-reset-axis');
            const curveToggleBtn = row.querySelector(`#btn-curve-${axisId}`);
            const curveDrawer = row.querySelector(`#drawer-${axisId}`);

            // Initialize hd-slider interaction and animation
            this.initHdSlider(hdWrapper, axis);

            // Range input event (continuous dragging)
            rangeInput.addEventListener('input', (e) => {
                const numericVal = parseFloat(e.target.value);
                numInput.value = numericVal;
                this.updateValue(axisId, numericVal);
            });

            // Numerical input event (allows typing arbitrary numbers like 854 without premature clamping)
            numInput.addEventListener('input', (e) => {
                const raw = e.target.value.trim();
                if (raw === '' || raw === '-') {
                    return;
                }
                let numericVal = parseFloat(raw);
                if (isNaN(numericVal)) {
                    return;
                }
                if (numericVal > max) {
                    numericVal = max;
                    numInput.value = max;
                }
                if (numericVal >= min && numericVal <= max) {
                    rangeInput.value = numericVal;
                    const newPercent = Math.max(0, Math.min(100, ((numericVal - min) / (max - min)) * 100));
                    hdWrapper.style.setProperty('--slider-percentage', newPercent + '%');
                    this.updateValue(axisId, numericVal);
                }
            });

            numInput.addEventListener('change', (e) => {
                let numericVal = parseFloat(e.target.value);
                if (isNaN(numericVal) || numericVal < min) {
                    numericVal = min;
                } else if (numericVal > max) {
                    numericVal = max;
                }
                numInput.value = numericVal;
                rangeInput.value = numericVal;
                const newPercent = Math.max(0, Math.min(100, ((numericVal - min) / (max - min)) * 100));
                hdWrapper.style.setProperty('--slider-percentage', newPercent + '%');
                this.updateValue(axisId, numericVal);
            });

            numInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    numInput.blur();
                }
            });

            // Reset button
            resetBtn.addEventListener('click', () => {
                const defaultVal = axis.defaultVal !== undefined ? axis.defaultVal : min;
                rangeInput.value = defaultVal;
                numInput.value = defaultVal;
                const newPercent = Math.max(0, Math.min(100, ((defaultVal - min) / (max - min)) * 100));
                hdWrapper.style.setProperty('--slider-percentage', newPercent + '%');
                this.updateValue(axisId, defaultVal);
            });

            // Toggle individual curve editor
            curveToggleBtn.addEventListener('click', () => {
                const isOpen = curveDrawer.classList.toggle('open');
                curveToggleBtn.classList.toggle('active', isOpen);
                row.classList.toggle('curve-open', isOpen);

                if (isOpen) {
                    let editor = this.curveEditors.get(axisId);
                    if (!editor) {
                        editor = this.initInlineCurveEditor(axis, row);
                        this.curveEditors.set(axisId, editor);
                    }
                    editor.redraw();
                }
            });

            // Copy/Transfer curve to another axis
            const copySelect = row.querySelector('.inline-copy-curve-select');
            if (copySelect) {
                copySelect.addEventListener('change', (e) => {
                    const targetAxisId = e.target.value;
                    if (targetAxisId) {
                        this.copyCurveToAxis(axisId, targetAxisId);
                        copySelect.value = '';
                    }
                });
            }

            listContainer.appendChild(row);
        });

        // Quick Presets bar if weight is available
        const hasWeight = this.axes.some((a) => a.id === 'wght');
        if (hasWeight) {
            const presetBar = document.createElement('div');
            presetBar.className = 'slider-presets-bar';
            const curWght = Number(this.currentValues.wght || 400);
            const presetsLabelText = window.i18n ? window.i18n.t('weightPresets') : 'Weight Presets:';
            const resetRegularAllText = window.i18n ? window.i18n.t('resetRegularAll') : 'Reset to Regular (400 / 100)';
            presetBar.innerHTML = `
                <div class="preset-label">${presetsLabelText}</div>
                <div class="preset-btn-group">
                    <button type="button" class="btn-preset ${curWght === 100 ? 'active' : ''}" data-wght="100">${window.i18n ? window.i18n.t('presetThin') : 'Thin (100)'}</button>
                    <button type="button" class="btn-preset ${curWght === 300 ? 'active' : ''}" data-wght="300">${window.i18n ? window.i18n.t('presetLight') : 'Light (300)'}</button>
                    <button type="button" class="btn-preset ${curWght === 400 ? 'active' : ''}" data-wght="400">${window.i18n ? window.i18n.t('presetRegular') : 'Regular (400)'}</button>
                    <button type="button" class="btn-preset ${curWght === 700 ? 'active' : ''}" data-wght="700">${window.i18n ? window.i18n.t('presetBold') : 'Bold (700)'}</button>
                    <button type="button" class="btn-preset ${curWght === 900 ? 'active' : ''}" data-wght="900">${window.i18n ? window.i18n.t('presetBlack') : 'Black (900)'}</button>
                </div>
                <button type="button" class="btn-reset-all-defaults" id="btn-reset-all-defaults" title="${resetRegularAllText}">
                    <i class="hd-icon hd-icon-undo-arrow"></i> ${resetRegularAllText}
                </button>
            `;

            presetBar.querySelectorAll('.btn-preset').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const wghtVal = parseFloat(btn.dataset.wght);
                    const wghtRange = this.container.querySelector('#range-wght');
                    const wghtNum = this.container.querySelector('#num-wght');
                    const hd = this.container.querySelector('#hd-wght');
                    if (wghtRange && wghtNum) {
                        wghtRange.value = wghtVal;
                        wghtNum.value = wghtVal;
                        if (hd) {
                            const min = parseFloat(wghtRange.min) || 100;
                            const max = parseFloat(wghtRange.max) || 900;
                            const percentage = Math.max(0, Math.min(100, ((wghtVal - min) / (max - min)) * 100));
                            hd.style.setProperty('--slider-percentage', percentage + '%');
                        }
                        presetBar.querySelectorAll('.btn-preset').forEach((b) => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.updateValue('wght', wghtVal);
                    }
                });
            });

            const btnResetAll = presetBar.querySelector('#btn-reset-all-defaults');
            if (btnResetAll) {
                btnResetAll.addEventListener('click', () => {
                    const defaultPayload = {};
                    this.axes.forEach((axis) => {
                        const def = axis.defaultVal !== undefined ? axis.defaultVal : (axis.id === 'wght' ? 400 : (axis.id === 'wdth' ? 100 : axis.min));
                        defaultPayload[axis.id] = def;
                        const range = this.container.querySelector(`#range-${axis.id}`);
                        const num = this.container.querySelector(`#num-${axis.id}`);
                        const hd = this.container.querySelector(`#hd-${axis.id}`);
                        if (range && num) {
                            range.value = def;
                            num.value = def;
                            if (hd) {
                                const min = parseFloat(range.min) || 0;
                                const max = parseFloat(range.max) || 100;
                                const percentage = Math.max(0, Math.min(100, ((def - min) / (max - min)) * 100));
                                hd.style.setProperty('--slider-percentage', percentage + '%');
                            }
                        }
                    });

                    presetBar.querySelectorAll('.btn-preset').forEach((b) => {
                        b.classList.toggle('active', parseFloat(b.dataset.wght) === 400);
                    });

                    Object.assign(this.currentValues, defaultPayload);
                    if (typeof this.onChange === 'function') {
                        this.onChange(defaultPayload);
                    }
                });
            }

            listContainer.appendChild(presetBar);
        }

        this.container.appendChild(listContainer);
    }

    /**
     * Copy Bézier curve shape from one slider to another without losing geometry
     */
    copyCurveToAxis(sourceAxisId, targetAxisId) {
        let sourceEditor = this.curveEditors.get(sourceAxisId);
        if (!sourceEditor) {
            const sourceAxis = this.axes.find((a) => a.id === sourceAxisId);
            const sourceRow = this.container.querySelector(`#row-${sourceAxisId}`);
            if (sourceAxis && sourceRow) {
                sourceEditor = this.initInlineCurveEditor(sourceAxis, sourceRow);
                this.curveEditors.set(sourceAxisId, sourceEditor);
            }
        }
        if (!sourceEditor) {
            return;
        }

        const targetAxis = this.axes.find((a) => a.id === targetAxisId);
        const targetRow = this.container.querySelector(`#row-${targetAxisId}`);
        if (!targetAxis || !targetRow) {
            return;
        }

        let targetEditor = this.curveEditors.get(targetAxisId);
        if (!targetEditor) {
            targetEditor = this.initInlineCurveEditor(targetAxis, targetRow);
            this.curveEditors.set(targetAxisId, targetEditor);
        }

        // Copy Bézier control parameters
        targetEditor.p0 = { y: sourceEditor.p0.y };
        targetEditor.p1 = { x: sourceEditor.p1.x, y: sourceEditor.p1.y };
        targetEditor.p2 = { x: sourceEditor.p2.x, y: sourceEditor.p2.y };
        targetEditor.p3 = { y: sourceEditor.p3.y };

        targetEditor.syncInputs();
        targetEditor.redraw();
        targetEditor.emitCurve();

        // Open target drawer so the user immediately sees the transferred curve
        const targetDrawer = targetRow.querySelector(`#drawer-${targetAxisId}`);
        const targetToggleBtn = targetRow.querySelector(`#btn-curve-${targetAxisId}`);
        if (targetDrawer && !targetDrawer.classList.contains('open')) {
            targetDrawer.classList.add('open');
            targetRow.classList.add('curve-open');
            if (targetToggleBtn) {
                targetToggleBtn.classList.add('active');
            }
            targetEditor.redraw();
        }
    }

    /**
     * Initialize individual inline Bézier curve editor for an axis
     */
    initInlineCurveEditor(axis, rowElement) {
        const axisId = axis.id;
        const canvas = rowElement.querySelector(`#canvas-${axisId}`);
        const ctx = canvas.getContext('2d');
        const distContainer = rowElement.querySelector(`#dist-${axisId}`);

        // Point coordinate input elements
        const inpP0 = rowElement.querySelector(`#pt0-${axisId}`);
        const inpP1 = rowElement.querySelector(`#pt1-${axisId}`);
        const inpP2 = rowElement.querySelector(`#pt2-${axisId}`);
        const inpP3 = rowElement.querySelector(`#pt3-${axisId}`);

        const editor = {
            axisId: axisId,
            axis: axis,
            canvas: canvas,
            ctx: ctx,
            pad: 20,
            p0: { y: 0.0 }, // Start point height [0..1]
            p1: { x: 0.45, y: 0.05 }, // Control 1
            p2: { x: 0.55, y: 0.95 }, // Control 2
            p3: { y: 1.0 }, // End point height [0..1]
            activeHandle: null, // 'p0', 'p1', 'p2', 'p3'
            hoverHandle: null,
            curveType: 'bezier',

            normToPix: function(pt) {
                const rect = canvas.getBoundingClientRect();
                const w = rect.width > 0 ? rect.width : 280;
                const h = 130;
                const plotW = w - this.pad * 2;
                const plotH = h - this.pad * 2;
                return {
                    x: this.pad + (pt.x !== undefined ? pt.x : 0) * plotW,
                    y: h - this.pad - pt.y * plotH
                };
            },

            pixToNorm: function(pt) {
                const rect = canvas.getBoundingClientRect();
                const w = rect.width > 0 ? rect.width : 280;
                const h = 130;
                const plotW = w - this.pad * 2;
                const plotH = h - this.pad * 2;
                return {
                    x: Math.max(0, Math.min(1, (pt.x - this.pad) / plotW)),
                    y: Math.max(0, Math.min(1, (h - this.pad - pt.y) / plotH))
                };
            },

            evaluateY: function(x) {
                // Cubic Bézier evaluation with variable P0 and P3
                const p0y = this.p0.y;
                const p1x = this.p1.x;
                const p1y = this.p1.y;
                const p2x = this.p2.x;
                const p2y = this.p2.y;
                const p3y = this.p3.y;

                function bx(t) {
                    return 3 * (1 - t) * (1 - t) * t * p1x + 3 * (1 - t) * t * t * p2x + t * t * t;
                }
                function dbx(t) {
                    return 3 * (1 - t) * (1 - t) * p1x + 6 * (1 - t) * t * (p2x - p1x) + 3 * t * t * (1 - p2x);
                }

                let t = x;
                for (let i = 0; i < 6; i++) {
                    const curX = bx(t) - x;
                    if (Math.abs(curX) < 1e-4) {
                        break;
                    }
                    const dX = dbx(t);
                    if (Math.abs(dX) < 1e-6) {
                        break;
                    }
                    t -= curX / dX;
                    t = Math.max(0, Math.min(1, t));
                }

                const u = 1 - t;
                const y = u * u * u * p0y + 3 * u * u * t * p1y + 3 * u * t * t * p2y + t * t * t * p3y;
                return Math.max(0, Math.min(1, y));
            },

            syncInputs: function() {
                inpP0.value = Math.round(this.p0.y * 100) / 100;
                inpP1.value = `${Math.round(this.p1.x * 100) / 100}, ${Math.round(this.p1.y * 100) / 100}`;
                inpP2.value = `${Math.round(this.p2.x * 100) / 100}, ${Math.round(this.p2.y * 100) / 100}`;
                inpP3.value = Math.round(this.p3.y * 100) / 100;
            },

            redraw: function() {
                const rect = canvas.getBoundingClientRect();
                const displayW = rect.width > 0 ? rect.width : 280;
                const displayH = 130;
                const dpr = window.devicePixelRatio || 1;

                canvas.width = displayW * dpr;
                canvas.height = displayH * dpr;
                ctx.resetTransform();
                ctx.scale(dpr, dpr);

                const w = displayW;
                const h = displayH;
                const pad = this.pad;
                const plotW = w - pad * 2;
                const plotH = h - pad * 2;

                const palette = (window.themeManager && typeof window.themeManager.getCanvasColors === 'function')
                    ? window.themeManager.getCanvasColors()
                    : { bg: '#141414', grid: '#222222', border: '#383838', stem: '#4b6584' };

                ctx.fillStyle = palette.bg;
                ctx.fillRect(0, 0, w, h);

                // Grid
                ctx.strokeStyle = palette.grid;
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i <= 4; i++) {
                    const gx = pad + (plotW / 4) * i;
                    const gy = pad + (plotH / 4) * i;
                    ctx.moveTo(gx, pad);
                    ctx.lineTo(gx, h - pad);
                    ctx.moveTo(pad, gy);
                    ctx.lineTo(w - pad, gy);
                }
                ctx.stroke();

                // Plot box
                ctx.strokeStyle = palette.border;
                ctx.strokeRect(pad, pad, plotW, plotH);

                const p0Pix = { x: pad, y: h - pad - this.p0.y * plotH };
                const p3Pix = { x: w - pad, y: h - pad - this.p3.y * plotH };
                const p1Pix = this.normToPix(this.p1);
                const p2Pix = this.normToPix(this.p2);

                // Handle stems (Bézier handles always visible)
                ctx.strokeStyle = palette.stem;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(p0Pix.x, p0Pix.y);
                ctx.lineTo(p1Pix.x, p1Pix.y);
                ctx.moveTo(p3Pix.x, p3Pix.y);
                ctx.lineTo(p2Pix.x, p2Pix.y);
                ctx.stroke();

                // Curve stroke (flat, crisp, no gradient)
                ctx.strokeStyle = '#0d99ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let s = 0; s <= steps; s++) {
                    const nx = s / steps;
                    const ny = this.evaluateY(nx);
                    const px = pad + nx * plotW;
                    const py = h - pad - ny * plotH;
                    if (s === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.stroke();

                // Draw handles
                const drawHandle = (pt, label, active, hover, color) => {
                    ctx.save();
                    ctx.fillStyle = active ? '#ffffff' : (hover ? '#38bdf8' : color);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, active ? 6 : 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                };

                // P0 and P3 anchors (Draggable start and end heights!)
                drawHandle(p0Pix, 'P0', this.activeHandle === 'p0', this.hoverHandle === 'p0', '#4ade80');
                drawHandle(p3Pix, 'P3', this.activeHandle === 'p3', this.hoverHandle === 'p3', '#4ade80');

                // P1 and P2 Bézier control handles (always visible)
                drawHandle(p1Pix, 'P1', this.activeHandle === 'p1', this.hoverHandle === 'p1', '#0ea5e9');
                drawHandle(p2Pix, 'P2', this.activeHandle === 'p2', this.hoverHandle === 'p2', '#0ea5e9');

                this.syncInputs();
                this.updateMiniBars();
            },

            updateMiniBars: () => {
                if (this.itemCount > 128) {
                    const notice = window.i18n ? window.i18n.t('maxLimitNotice', { max: 128 }) : 'Max 128';
                    const tip = window.i18n ? window.i18n.t('distLimitExceeded', { count: this.itemCount }) : 'Max 128 characters';
                    distContainer.innerHTML = `
                        <div class="inline-dist-limit-warning" title="${tip}">
                            <span>${notice}</span>
                        </div>
                    `;
                    return;
                }
                const count = Math.max(4, Math.min(128, this.itemCount));
                let html = '';
                for (let i = 0; i < count; i++) {
                    const xNorm = count > 1 ? i / (count - 1) : 0;
                    const yNorm = editor.evaluateY(xNorm);
                    const heightPercent = Math.max(6, Math.round(yNorm * 100));
                    html += `
                        <div class="inline-dist-bar" title="#${i + 1}: ${Math.round(yNorm * 100)}%">
                            <div class="inline-dist-fill" style="height: ${heightPercent}%"></div>
                        </div>
                    `;
                }
                distContainer.innerHTML = html;
            },

            emitCurve: () => {
                if (this.itemCount > 128) {
                    return;
                }
                const count = Math.max(2, Math.min(128, this.itemCount));
                const values = [];
                for (let i = 0; i < count; i++) {
                    const x = count > 1 ? i / (count - 1) : 0;
                    values.push(editor.evaluateY(x));
                }

                const payload = {
                    targetAxis: axis.id,
                    distributionTarget: this.distributionTarget,
                    minVal: axis.min,
                    maxVal: axis.max,
                    distributedValues: values
                };

                if (typeof this.onCurveChange === 'function') {
                    this.onCurveChange(payload);
                }
            }
        };

        // Manual Point Coordinate Input Handlers
        inpP0.addEventListener('change', (e) => {
            editor.p0.y = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
            editor.redraw();
            editor.emitCurve();
        });

        inpP3.addEventListener('change', (e) => {
            editor.p3.y = Math.max(0, Math.min(1, parseFloat(e.target.value) || 1));
            editor.redraw();
            editor.emitCurve();
        });

        inpP1.addEventListener('change', (e) => {
            const parts = e.target.value.split(',');
            if (parts.length === 2) {
                editor.p1.x = Math.max(0, Math.min(1, parseFloat(parts[0]) || 0));
                editor.p1.y = Math.max(0, Math.min(1, parseFloat(parts[1]) || 0));
                editor.redraw();
                editor.emitCurve();
            }
        });

        inpP2.addEventListener('change', (e) => {
            const parts = e.target.value.split(',');
            if (parts.length === 2) {
                editor.p2.x = Math.max(0, Math.min(1, parseFloat(parts[0]) || 0));
                editor.p2.y = Math.max(0, Math.min(1, parseFloat(parts[1]) || 0));
                editor.redraw();
                editor.emitCurve();
            }
        });

        // Preset button handlers
        rowElement.querySelectorAll('.btn-inline-preset').forEach((btn) => {
            btn.addEventListener('click', () => {
                rowElement.querySelectorAll('.btn-inline-preset').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                const preset = btn.dataset.preset;

                editor.curveType = 'bezier';
                if (preset === 'linear') {
                    editor.p0.y = 0.0;
                    editor.p1 = { x: 0.25, y: 0.25 };
                    editor.p2 = { x: 0.75, y: 0.75 };
                    editor.p3.y = 1.0;
                } else if (preset === 'ease-in') {
                    editor.p0.y = 0.0;
                    editor.p1 = { x: 0.42, y: 0.0 };
                    editor.p2 = { x: 1.0, y: 1.0 };
                    editor.p3.y = 1.0;
                } else if (preset === 'ease-out') {
                    editor.p0.y = 0.0;
                    editor.p1 = { x: 0.0, y: 0.0 };
                    editor.p2 = { x: 0.58, y: 1.0 };
                    editor.p3.y = 1.0;
                } else if (preset === 's-curve') {
                    editor.p0.y = 0.0;
                    editor.p1 = { x: 0.45, y: 0.05 };
                    editor.p2 = { x: 0.55, y: 0.95 };
                    editor.p3.y = 1.0;
                } else if (preset === 'bell') {
                    editor.p0.y = 0.0;
                    editor.p1 = { x: 0.3, y: 0.95 };
                    editor.p2 = { x: 0.7, y: 0.95 };
                    editor.p3.y = 0.0;
                }

                editor.redraw();
                editor.emitCurve();
            });
        });

        // Interactive mouse & touch dragging on canvas
        const getCoord = (e) => {
            const rect = canvas.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: cx - rect.left, y: cy - rect.top };
        };

        const onDown = (e) => {
            const pos = getCoord(e);
            const p0Pix = { x: editor.pad, y: 130 - editor.pad - editor.p0.y * (130 - editor.pad * 2) };
            const p3Pix = { x: canvas.clientWidth - editor.pad, y: 130 - editor.pad - editor.p3.y * (130 - editor.pad * 2) };
            const p1Pix = editor.normToPix(editor.p1);
            const p2Pix = editor.normToPix(editor.p2);

            const d0 = Math.hypot(pos.x - p0Pix.x, pos.y - p0Pix.y);
            const d3 = Math.hypot(pos.x - p3Pix.x, pos.y - p3Pix.y);
            const d1 = Math.hypot(pos.x - p1Pix.x, pos.y - p1Pix.y);
            const d2 = Math.hypot(pos.x - p2Pix.x, pos.y - p2Pix.y);

            if (d0 <= 12) {
                editor.activeHandle = 'p0';
            } else if (d3 <= 12) {
                editor.activeHandle = 'p3';
            } else if (d1 <= 12) {
                editor.activeHandle = 'p1';
            } else if (d2 <= 12) {
                editor.activeHandle = 'p2';
            }

            if (editor.activeHandle) {
                e.preventDefault();
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
                window.addEventListener('touchmove', onMove, { passive: false });
                window.addEventListener('touchend', onUp);
            }
        };

        const onMove = (e) => {
            if (!editor.activeHandle) {
                return;
            }
            e.preventDefault();
            const pos = getCoord(e);
            const norm = editor.pixToNorm(pos);

            if (editor.activeHandle === 'p0') {
                editor.p0.y = Math.round(norm.y * 100) / 100;
            } else if (editor.activeHandle === 'p3') {
                editor.p3.y = Math.round(norm.y * 100) / 100;
            } else if (editor.activeHandle === 'p1') {
                editor.p1.x = Math.round(norm.x * 100) / 100;
                editor.p1.y = Math.round(norm.y * 100) / 100;
            } else if (editor.activeHandle === 'p2') {
                editor.p2.x = Math.round(norm.x * 100) / 100;
                editor.p2.y = Math.round(norm.y * 100) / 100;
            }

            editor.redraw();
            editor.emitCurve();
        };

        const onUp = () => {
            if (editor.activeHandle) {
                editor.activeHandle = null;
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
                window.removeEventListener('touchmove', onMove);
                window.removeEventListener('touchend', onUp);
                editor.redraw();
            }
        };

        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('touchstart', onDown, { passive: false });

        return editor;
    }

    /**
     * Initializes visual tracking, smooth transitions, and percentage styles for hd-slider
     * Pattern from api.hakobian.am/libs/v1/components/script.js
     */
    initHdSlider(wrapper, axis) {
        if (!wrapper) {
            return;
        }

        const input = wrapper.querySelector('.real-slider');
        if (!input) {
            return;
        }

        let isDragging = false;
        let transitionTimeout = null;

        const updatePercentage = () => {
            const minVal = parseFloat(input.min) || 0;
            const maxVal = parseFloat(input.max) || 100;
            const current = parseFloat(input.value) || 0;
            const percentage = Math.max(0, Math.min(100, ((current - minVal) / (maxVal - minVal)) * 100));
            wrapper.style.setProperty('--slider-percentage', percentage + '%');
        };

        input.addEventListener('input', updatePercentage);
        input.addEventListener('change', updatePercentage);

        input.addEventListener('pointerdown', () => {
            clearTimeout(transitionTimeout);
            wrapper.classList.add('smooth-transition');
            isDragging = false;
        });

        input.addEventListener('pointermove', (e) => {
            if (e.buttons > 0) {
                isDragging = true;
                wrapper.classList.remove('smooth-transition');
            }
        });

        input.addEventListener('pointerup', () => {
            if (!isDragging) {
                transitionTimeout = setTimeout(() => {
                    wrapper.classList.remove('smooth-transition');
                }, 400);
            } else {
                wrapper.classList.remove('smooth-transition');
            }
            isDragging = false;
        });

        input.addEventListener('pointercancel', () => {
            wrapper.classList.remove('smooth-transition');
            isDragging = false;
        });

        updatePercentage();
    }

    /**
     * Handle single axis value update
     */
    updateValue(axisId, value) {
        this.currentValues[axisId] = value;
        if (typeof this.onChange === 'function') {
            this.onChange({ [axisId]: value });
        }
    }

    /**
     * External update of values (e.g. from 2D space or selection reload)
     */
    syncValues(newValues) {
        Object.assign(this.currentValues, newValues);
        for (const [axisId, val] of Object.entries(newValues)) {
            const range = this.container.querySelector(`#range-${axisId}`);
            const num = this.container.querySelector(`#num-${axisId}`);
            const hd = this.container.querySelector(`#hd-${axisId}`);
            if (range && num) {
                // Do not clobber number input if user is actively typing in it
                if (document.activeElement !== num) {
                    num.value = val;
                }
                range.value = val;
                if (hd) {
                    const min = parseFloat(range.min) || 0;
                    const max = parseFloat(range.max) || 100;
                    const percentage = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
                    hd.style.setProperty('--slider-percentage', percentage + '%');
                }
            }
            if (axisId === 'wght') {
                this.container.querySelectorAll('.btn-preset').forEach((btn) => {
                    btn.classList.toggle('active', parseFloat(btn.dataset.wght) === Number(val));
                });
            }
        }
    }
}

window.SliderMode = SliderMode;

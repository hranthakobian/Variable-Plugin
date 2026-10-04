/**
 * 2D Design Space Field Mode (2D Cartesian Grid)
 * Maps two primary variable axes simultaneously across an interactive 2D canvas,
 * featuring 4 corner master anchors, crosshair projections, and real-time parameter dispatch.
 * Follows K&R / 1TBS brace formatting.
 */

class DesignSpaceMode {
    constructor(containerElement, onCoordinatesChange) {
        this.container = containerElement;
        this.onChange = onCoordinatesChange;

        // Canvas & dimensions
        this.canvas = null;
        this.ctx = null;
        this.width = 300;
        this.height = 300;
        this.padding = 38;

        // Active axes configuration
        this.availableAxes = [];
        this.storedValues = {};

        this.xAxisId = 'wght';
        this.yAxisId = 'wdth';

        // Normalized position [0..1]
        this.nodePos = { x: 0.5, y: 0.5 };

        // Dragging & interaction state
        this.isDragging = false;
        this.isHovering = false;
        this.handleRadius = 10;

        this.init();
    }

    init() {
        this.renderUI();
        this.setupCanvas();
        this.bindEvents();
    }

    renderUI() {
        const t = (key, fallback) => (window.i18n ? window.i18n.t(key) : fallback);
        this.container.innerHTML = `
            <div class="design-space-panel">
                <div class="space-toolbar">
                    <div class="field-group">
                        <label for="ds-axis-x">${t('xAxisLabel', 'X-Axis:')}</label>
                        <select id="ds-axis-x" class="dropdown-select"></select>
                    </div>
                    <div class="field-group">
                        <label for="ds-axis-y">${t('yAxisLabel', 'Y-Axis:')}</label>
                        <select id="ds-axis-y" class="dropdown-select"></select>
                    </div>
                </div>

                <div class="canvas-wrapper design-space-canvas-wrap">
                    <canvas id="design-space-canvas"></canvas>
                    <div class="ds-corner-labels">
                        <span class="corner-label tl" title="Click to snap to Top-Left Master">TL</span>
                        <span class="corner-label tr" title="Click to snap to Top-Right Master">TR</span>
                        <span class="corner-label bl" title="Click to snap to Bottom-Left Master">BL</span>
                        <span class="corner-label br" title="Click to snap to Bottom-Right Master">BR</span>
                    </div>
                </div>

                <div class="ds-readout-bar">
                    <div class="ds-readout-item">
                        <span class="ds-readout-title" id="ds-x-title">X:</span>
                        <span class="ds-readout-val" id="ds-x-val">0</span>
                    </div>
                    <div class="ds-readout-item">
                        <span class="ds-readout-title" id="ds-y-title">Y:</span>
                        <span class="ds-readout-val" id="ds-y-val">0</span>
                    </div>
                    <div class="ds-readout-actions">
                        <button type="button" class="btn-reset-regular" id="btn-ds-regular" title="${t('snapRegularTitle', 'Snap to Regular Defaults (Weight 400, Width 100)')}"><i class="hd-icon hd-icon-undo-arrow"></i> ${t('snapRegular', 'Regular')}</button>
                        <button type="button" class="btn-reset-center" id="btn-ds-center" title="${t('snapCenterTitle', 'Snap to Center (0.5, 0.5)')}"><i class="hd-icon hd-icon-plus"></i> ${t('snapCenter', 'Center')}</button>
                    </div>
                </div>
            </div>
        `;

        this.canvas = this.container.querySelector('#design-space-canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    setupCanvas() {
        if (!this.canvas) {
            return;
        }
        const wrap = this.canvas.parentElement;
        const panel = this.container.querySelector('.design-space-panel') || this.container;
        const toolbar = this.container.querySelector('.space-toolbar');
        const readout = this.container.querySelector('.ds-readout-bar');

        const panelWidth = panel && panel.clientWidth > 0 ? panel.clientWidth : (this.width || 300);
        const panelHeight = panel && panel.clientHeight > 0 ? panel.clientHeight : (this.height || 300);

        const toolbarH = toolbar ? toolbar.offsetHeight : 45;
        const readoutH = readout ? readout.offsetHeight : 45;
        const gap = 16;

        const availW = Math.max(60, panelWidth - 4);
        const availH = Math.max(60, panelHeight - toolbarH - readoutH - gap);

        // 2D field MUST BE A SQUARE (քառակուսի): width === height
        const squareSize = Math.round(Math.min(availW, availH));

        if (squareSize <= 0) {
            return;
        }

        this.width = squareSize;
        this.height = squareSize;

        if (wrap) {
            wrap.style.width = `${squareSize}px`;
            wrap.style.height = `${squareSize}px`;
        }

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.round(squareSize * dpr);
        this.canvas.height = Math.round(squareSize * dpr);

        if (this.ctx.resetTransform) {
            this.ctx.resetTransform();
        } else {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.scale(dpr, dpr);
    }

    bindEvents() {
        const selectX = this.container.querySelector('#ds-axis-x');
        const selectY = this.container.querySelector('#ds-axis-y');
        const btnCenter = this.container.querySelector('.btn-reset-center');
        const btnRegular = this.container.querySelector('.btn-reset-regular');

        selectX.addEventListener('change', (e) => {
            const newX = e.target.value;
            if (newX === this.yAxisId && this.availableAxes.length > 1) {
                this.yAxisId = this.xAxisId;
                selectY.value = this.yAxisId;
            }
            this.xAxisId = newX;
            this.syncFromStoredValues();
            this.redraw();
            this.emitCoordinates();
        });

        selectY.addEventListener('change', (e) => {
            const newY = e.target.value;
            if (newY === this.xAxisId && this.availableAxes.length > 1) {
                this.xAxisId = this.yAxisId;
                selectX.value = this.xAxisId;
            }
            this.yAxisId = newY;
            this.syncFromStoredValues();
            this.redraw();
            this.emitCoordinates();
        });

        btnCenter.addEventListener('click', () => {
            this.nodePos = { x: 0.5, y: 0.5 };
            this.redraw();
            this.emitCoordinates();
        });

        if (btnRegular) {
            btnRegular.addEventListener('click', () => {
                const xAxis = this.getAxisConfig(this.xAxisId);
                const yAxis = this.getAxisConfig(this.yAxisId);
                const defX = xAxis.defaultVal !== undefined ? xAxis.defaultVal : 400;
                const defY = yAxis.defaultVal !== undefined ? yAxis.defaultVal : 100;
                const rangeX = xAxis.max - xAxis.min;
                const rangeY = yAxis.max - yAxis.min;
                this.nodePos = {
                    x: rangeX > 0 ? Math.max(0, Math.min(1, (defX - xAxis.min) / rangeX)) : 0.5,
                    y: rangeY > 0 ? Math.max(0, Math.min(1, (defY - yAxis.min) / rangeY)) : 0.5
                };
                this.redraw();
                this.emitCoordinates();
            });
        }

        // Corner master clicks
        const tl = this.container.querySelector('.corner-label.tl');
        const tr = this.container.querySelector('.corner-label.tr');
        const bl = this.container.querySelector('.corner-label.bl');
        const br = this.container.querySelector('.corner-label.br');

        tl.addEventListener('click', () => {
            this.nodePos = { x: 0.0, y: 1.0 };
            this.redraw();
            this.emitCoordinates();
        });
        tr.addEventListener('click', () => {
            this.nodePos = { x: 1.0, y: 1.0 };
            this.redraw();
            this.emitCoordinates();
        });
        bl.addEventListener('click', () => {
            this.nodePos = { x: 0.0, y: 0.0 };
            this.redraw();
            this.emitCoordinates();
        });
        br.addEventListener('click', () => {
            this.nodePos = { x: 1.0, y: 0.0 };
            this.redraw();
            this.emitCoordinates();
        });

        const getCanvasCoord = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = rect.width > 0 ? this.width / rect.width : 1;
            const scaleY = rect.height > 0 ? this.height / rect.height : 1;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        const onDown = (e) => {
            e.preventDefault();
            this.isDragging = true;
            if (this.canvas.setPointerCapture && e.pointerId !== undefined) {
                try {
                    this.canvas.setPointerCapture(e.pointerId);
                } catch (err) {}
            }

            const pos = getCanvasCoord(e);
            const norm = this.pixelToNorm(pos);
            this.nodePos.x = Math.max(0, Math.min(1, norm.x));
            this.nodePos.y = Math.max(0, Math.min(1, norm.y));
            this.redraw();
            this.emitCoordinates();
        };

        const onMove = (e) => {
            const pos = getCanvasCoord(e);
            if (!this.isDragging) {
                const nodePix = this.normToPixel(this.nodePos);
                const dist = Math.hypot(pos.x - nodePix.x, pos.y - nodePix.y);
                const prevHover = this.isHovering;
                this.isHovering = dist <= this.handleRadius + 8;
                this.canvas.style.cursor = this.isHovering ? 'grab' : 'crosshair';
                if (prevHover !== this.isHovering) {
                    this.redraw();
                }
                return;
            }

            e.preventDefault();
            this.canvas.style.cursor = 'grabbing';
            const norm = this.pixelToNorm(pos);
            this.nodePos.x = Math.max(0, Math.min(1, norm.x));
            this.nodePos.y = Math.max(0, Math.min(1, norm.y));
            this.redraw();
            this.emitCoordinates();
        };

        const onUp = (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.canvas.style.cursor = 'crosshair';
                if (this.canvas.releasePointerCapture && e.pointerId !== undefined) {
                    try {
                        this.canvas.releasePointerCapture(e.pointerId);
                    } catch (err) {}
                }
                this.redraw();
            }
        };

        this.canvas.addEventListener('pointerdown', onDown);
        this.canvas.addEventListener('pointermove', onMove);
        this.canvas.addEventListener('pointerup', onUp);
        this.canvas.addEventListener('pointercancel', onUp);

        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        this.resizeHandler = () => {
            this.setupCanvas();
            this.redraw();
        };
        window.addEventListener('resize', this.resizeHandler);

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (typeof ResizeObserver !== 'undefined') {
            const obsTarget = this.container.querySelector('.design-space-panel') || this.container;
            if (obsTarget) {
                this.resizeObserver = new ResizeObserver(() => {
                    this.setupCanvas();
                    this.redraw();
                });
                this.resizeObserver.observe(obsTarget);
            }
        }
    }

    getAxisConfig(axisId) {
        return this.availableAxes.find((a) => a.id === axisId) || {
            id: axisId,
            name: axisId,
            min: 0,
            max: 100,
            step: 1,
            defaultVal: 50
        };
    }

    syncFromStoredValues() {
        const xAxis = this.getAxisConfig(this.xAxisId);
        const yAxis = this.getAxisConfig(this.yAxisId);

        const valX = this.storedValues[this.xAxisId] !== undefined ? this.storedValues[this.xAxisId] : xAxis.defaultVal;
        const valY = this.storedValues[this.yAxisId] !== undefined ? this.storedValues[this.yAxisId] : yAxis.defaultVal;

        const rangeX = xAxis.max - xAxis.min;
        const rangeY = yAxis.max - yAxis.min;

        this.nodePos = {
            x: rangeX > 0 ? Math.max(0, Math.min(1, (valX - xAxis.min) / rangeX)) : 0.5,
            y: rangeY > 0 ? Math.max(0, Math.min(1, (valY - yAxis.min) / rangeY)) : 0.5
        };
    }

    normToPixel(pt) {
        const plotW = this.width - this.padding * 2;
        const plotH = this.height - this.padding * 2;
        return {
            x: this.padding + pt.x * plotW,
            y: this.height - this.padding - pt.y * plotH
        };
    }

    pixelToNorm(pt) {
        const plotW = this.width - this.padding * 2;
        const plotH = this.height - this.padding * 2;
        return {
            x: (pt.x - this.padding) / plotW,
            y: (this.height - this.padding - pt.y) / plotH
        };
    }

    calculateRealValues() {
        const xAxis = this.getAxisConfig(this.xAxisId);
        const yAxis = this.getAxisConfig(this.yAxisId);

        let realX = xAxis.min + this.nodePos.x * (xAxis.max - xAxis.min);
        let realY = yAxis.min + this.nodePos.y * (yAxis.max - yAxis.min);

        const stepX = Number(xAxis.step) || 1;
        const stepY = Number(yAxis.step) || 1;

        if (stepX >= 1) {
            realX = Math.round(realX / stepX) * stepX;
        } else {
            realX = Math.round(realX * 10) / 10;
        }

        if (stepY >= 1) {
            realY = Math.round(realY / stepY) * stepY;
        } else {
            realY = Math.round(realY * 10) / 10;
        }

        realX = Math.max(xAxis.min, Math.min(xAxis.max, realX));
        realY = Math.max(yAxis.min, Math.min(yAxis.max, realY));

        return {
            [this.xAxisId]: realX,
            [this.yAxisId]: realY
        };
    }

    redraw() {
        if (!this.ctx) {
            return;
        }
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const pad = this.padding;
        const plotW = w - pad * 2;
        const plotH = h - pad * 2;

        const xAxis = this.getAxisConfig(this.xAxisId);
        const yAxis = this.getAxisConfig(this.yAxisId);
        const values = this.calculateRealValues();

        const palette = (window.themeManager && typeof window.themeManager.getCanvasColors === 'function')
            ? window.themeManager.getCanvasColors()
            : { bg: '#161616', grid: '#222222', border: '#3e3e3e', crosshair: '#323232', text: '#999999', tick: '#777777', glow: 'rgba(13, 153, 255, 0.22)', isLight: false };

        ctx.clearRect(0, 0, w, h);

        // Background Field
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, w, h);

        // Active Gradient Glow under the Handle
        const nodePix = this.normToPixel(this.nodePos);
        const grad = ctx.createRadialGradient(
            nodePix.x, nodePix.y, 6,
            nodePix.x, nodePix.y, Math.max(plotW, plotH) * 0.5
        );
        grad.addColorStop(0, palette.glow);
        grad.addColorStop(0.6, palette.isLight ? 'rgba(2, 132, 199, 0.04)' : 'rgba(13, 153, 255, 0.05)');
        grad.addColorStop(1, 'rgba(13, 153, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(pad, pad, plotW, plotH);

        // Cartesian Grid Subdivisions (6x6)
        const divs = 6;
        ctx.strokeStyle = palette.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= divs; i++) {
            const gx = pad + (plotW / divs) * i;
            const gy = pad + (plotH / divs) * i;
            ctx.moveTo(gx, pad);
            ctx.lineTo(gx, h - pad);
            ctx.moveTo(pad, gy);
            ctx.lineTo(w - pad, gy);
        }
        ctx.stroke();

        // Center 50% Crosshair Guideline
        ctx.strokeStyle = palette.crosshair;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(pad + plotW * 0.5, pad);
        ctx.lineTo(pad + plotW * 0.5, h - pad);
        ctx.moveTo(pad, pad + plotH * 0.5);
        ctx.lineTo(w - pad, pad + plotH * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);

        // Plot Border
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pad, pad, plotW, plotH);

        // 4 Corner Master Anchor Nodes
        const corners = [
            { x: pad, y: pad },
            { x: w - pad, y: pad },
            { x: pad, y: h - pad },
            { x: w - pad, y: h - pad }
        ];

        corners.forEach((c) => {
            ctx.fillStyle = '#4ade80';
            ctx.strokeStyle = '#141e17';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // Current Node Position Projections
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(nodePix.x, pad);
        ctx.lineTo(nodePix.x, h - pad);
        ctx.moveTo(pad, nodePix.y);
        ctx.lineTo(w - pad, nodePix.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Axis Tick Annotations on Canvas
        ctx.font = '9px monospace';
        ctx.fillStyle = palette.tick;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(String(xAxis.min), pad, h - pad + 5);
        ctx.fillText(String(xAxis.max), w - pad, h - pad + 5);

        const xAxisName = window.i18n ? window.i18n.getAxisName(xAxis.id, xAxis.name) : xAxis.name;
        const yAxisName = window.i18n ? window.i18n.getAxisName(yAxis.id, yAxis.name) : yAxis.name;

        // X-Axis Title
        ctx.fillStyle = palette.text;
        ctx.font = '10px sans-serif';
        ctx.fillText(`${xAxisName} (${xAxis.id})`, pad + plotW * 0.5, h - pad + 18);

        // Y-Axis min, max
        ctx.font = '9px monospace';
        ctx.fillStyle = palette.tick;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(yAxis.min), pad - 5, h - pad);
        ctx.fillText(String(yAxis.max), pad - 5, pad);

        // Y-Axis Title (Rotated)
        ctx.save();
        ctx.translate(12, pad + plotH * 0.5);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = palette.text;
        ctx.font = '10px sans-serif';
        ctx.fillText(`${yAxisName} (${yAxis.id})`, 0, 0);
        ctx.restore();

        // Interactive Central Handle (+ node)
        ctx.save();
        ctx.shadowColor = this.isDragging ? 'rgba(13, 153, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = this.isDragging ? 14 : 6;

        // Outer ring
        ctx.fillStyle = this.isDragging ? '#38bdf8' : (this.isHovering ? '#60a5fa' : '#0d99ff');
        ctx.beginPath();
        ctx.arc(nodePix.x, nodePix.y, this.handleRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner white node
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(nodePix.x, nodePix.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Crosshair Icon inside handle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(nodePix.x - 6, nodePix.y);
        ctx.lineTo(nodePix.x + 6, nodePix.y);
        ctx.moveTo(nodePix.x, nodePix.y - 6);
        ctx.lineTo(nodePix.x, nodePix.y + 6);
        ctx.stroke();
        ctx.restore();

        // Floating Tooltip Badge when dragging or hovering
        if (this.isDragging || this.isHovering) {
            const pillText = `${xAxisName}: ${values[this.xAxisId]}  ${yAxisName}: ${values[this.yAxisId]}`;
            ctx.font = '10px monospace';
            const textWidth = ctx.measureText(pillText).width;
            const pillW = textWidth + 14;
            const pillH = 20;

            let pillX = nodePix.x - pillW / 2;
            let pillY = nodePix.y - 28;

            pillX = Math.max(pad, Math.min(w - pad - pillW, pillX));
            if (pillY < pad) {
                pillY = nodePix.y + 16;
            }

            ctx.fillStyle = palette.isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(20, 20, 20, 0.92)';
            ctx.strokeStyle = palette.isLight ? '#0284c7' : '#0d99ff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(pillX, pillY, pillW, pillH, 4) : ctx.rect(pillX, pillY, pillW, pillH);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = palette.isLight ? '#0f172a' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pillText, pillX + pillW / 2, pillY + pillH / 2);
        }

        this.updateReadout();
    }

    updateReadout() {
        const values = this.calculateRealValues();
        const xAxis = this.getAxisConfig(this.xAxisId);
        const yAxis = this.getAxisConfig(this.yAxisId);
        const xAxisName = window.i18n ? window.i18n.getAxisName(xAxis.id, xAxis.name) : xAxis.name;
        const yAxisName = window.i18n ? window.i18n.getAxisName(yAxis.id, yAxis.name) : yAxis.name;

        const xTitle = this.container.querySelector('#ds-x-title');
        const yTitle = this.container.querySelector('#ds-y-title');
        const xVal = this.container.querySelector('#ds-x-val');
        const yVal = this.container.querySelector('#ds-y-val');

        if (xTitle && yTitle && xVal && yVal) {
            xTitle.textContent = `X (${xAxis.id}):`;
            yTitle.textContent = `Y (${yAxis.id}):`;
            xVal.textContent = values[this.xAxisId];
            yVal.textContent = values[this.yAxisId];
        }
    }

    emitCoordinates() {
        const realValues = this.calculateRealValues();
        Object.assign(this.storedValues, realValues);
        if (typeof this.onChange === 'function') {
            this.onChange(realValues);
        }
    }

    /**
     * Dynamically populate available axes for the 2D Cartesian Space
     */
    syncAxes(axes) {
        if (!axes || axes.length === 0) {
            return;
        }

        const oldAxesIds = this.availableAxes.map((a) => a.id).join(',');
        const newAxesIds = axes.map((a) => a.id).join(',');

        this.availableAxes = axes;
        const selectX = this.container.querySelector('#ds-axis-x');
        const selectY = this.container.querySelector('#ds-axis-y');

        if (!selectX || !selectY) {
            return;
        }

        if (oldAxesIds !== newAxesIds || selectX.children.length === 0) {
            selectX.innerHTML = '';
            selectY.innerHTML = '';

            axes.forEach((a) => {
                const aName = window.i18n ? window.i18n.getAxisName(a.id, a.name) : a.name;
                const optX = document.createElement('option');
                optX.value = a.id;
                optX.textContent = `${aName} (${a.id})`;
                selectX.appendChild(optX);

                const optY = document.createElement('option');
                optY.value = a.id;
                optY.textContent = `${aName} (${a.id})`;
                selectY.appendChild(optY);
            });

            if (axes.some((a) => a.id === this.xAxisId)) {
                selectX.value = this.xAxisId;
            } else {
                this.xAxisId = axes[0].id;
                selectX.value = this.xAxisId;
            }

            if (axes.length > 1) {
                if (axes.some((a) => a.id === this.yAxisId && a.id !== this.xAxisId)) {
                    selectY.value = this.yAxisId;
                } else {
                    const otherAxis = axes.find((a) => a.id !== this.xAxisId) || axes[1];
                    this.yAxisId = otherAxis.id;
                    selectY.value = this.yAxisId;
                }
            } else {
                this.yAxisId = axes[0].id;
                selectY.value = this.yAxisId;
            }
        }

        this.syncFromStoredValues();
        this.redraw();
    }

    /**
     * External sync (e.g. from 1D slider changes or selection reading)
     */
    syncValues(currentValues) {
        if (!currentValues) {
            return;
        }

        Object.assign(this.storedValues, currentValues);

        const xAxis = this.getAxisConfig(this.xAxisId);
        const yAxis = this.getAxisConfig(this.yAxisId);

        let updated = false;

        if (currentValues[this.xAxisId] !== undefined) {
            const rangeX = xAxis.max - xAxis.min;
            if (rangeX > 0) {
                const normX = (Number(currentValues[this.xAxisId]) - xAxis.min) / rangeX;
                this.nodePos.x = Math.max(0, Math.min(1, normX));
                updated = true;
            }
        }

        if (currentValues[this.yAxisId] !== undefined) {
            const rangeY = yAxis.max - yAxis.min;
            if (rangeY > 0) {
                const normY = (Number(currentValues[this.yAxisId]) - yAxis.min) / rangeY;
                this.nodePos.y = Math.max(0, Math.min(1, normY));
                updated = true;
            }
        }

        if (updated) {
            this.redraw();
        }
    }
}

window.DesignSpaceMode = DesignSpaceMode;

// Folder icon
const FOLDER_ICON_SVG = '<svg width="22" height="18" viewBox="0 0 104 85" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; flex-shrink: 0;"><path d="M4 4L4 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path><path d="M28 4L28 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path><path d="M16 4L16 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path><path d="M40 11L40 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path><path d="M76 18L76 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path><path d="M64 18L64 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path><path d="M100 18L100 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path><path d="M52 18L52 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path><path d="M88 18L88 81" stroke="currentColor" stroke-width="8" stroke-linecap="round"></path></svg>';

/**
 * Graph Studio Mode (Dedicated Multi-Point Spline Studio)
 * Interactive HTML5 Canvas multi-curve spline editor that maps non-linear value
 * distributions across selected text characters or multiple artwork items.
 * Allows arbitrary intermediate points along curves to control specific intervals,
 * dragging points freely in 2D space, adding/deleting points, direct numerical inspection,
 * and distributing multiple font axes simultaneously.
 * Follows K&R / 1TBS brace formatting.
 */

const CURVE_PALETTE = [
    '#0d99ff', // Vibrant Blue
    '#06b6d4', // Cyan / Teal
    '#a855f7', // Vivid Purple
    '#f97316', // Orange
    '#ec4899', // Pink
    '#10b981'  // Emerald Green
];

const DEFAULT_PRESETS_DATA = [
    {
        id: 'linear',
        i18nKey: 'presetLinear',
        defaultName: 'Linear',
        folder: 'builtin',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.33, y: 0.33 } },
            { x: 1.0, y: 1.0, cpIn: { x: 0.67, y: 0.67 } }
        ]
    },
    {
        id: 'ease-in',
        i18nKey: 'presetEaseIn',
        defaultName: 'Ease-In',
        folder: 'builtin',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.42, y: 0.0 } },
            { x: 1.0, y: 1.0, cpIn: { x: 1.0, y: 1.0 } }
        ]
    },
    {
        id: 'ease-out',
        i18nKey: 'presetEaseOut',
        defaultName: 'Ease-Out',
        folder: 'builtin',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.0, y: 0.0 } },
            { x: 1.0, y: 1.0, cpIn: { x: 0.58, y: 1.0 } }
        ]
    },
    {
        id: 's-curve',
        i18nKey: 'presetSCurve',
        defaultName: 'S-Curve',
        folder: 'builtin',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.45, y: 0.05 } },
            { x: 1.0, y: 1.0, cpIn: { x: 0.55, y: 0.95 } }
        ]
    },
    {
        id: 'bell',
        i18nKey: 'presetBell',
        defaultName: 'Bell',
        folder: 'shapes',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.20, y: 0.65 } },
            { x: 0.5, y: 1.0, cpIn: { x: 0.35, y: 1.0 }, cpOut: { x: 0.65, y: 1.0 } },
            { x: 1.0, y: 0.0, cpIn: { x: 0.80, y: 0.65 } }
        ]
    },
    {
        id: 'valley',
        i18nKey: 'presetValley',
        defaultName: 'Valley',
        folder: 'shapes',
        points: [
            { x: 0.0, y: 1.0, cpOut: { x: 0.20, y: 0.35 } },
            { x: 0.5, y: 0.0, cpIn: { x: 0.35, y: 0.0 }, cpOut: { x: 0.65, y: 0.0 } },
            { x: 1.0, y: 1.0, cpIn: { x: 0.80, y: 0.35 } }
        ]
    },
    {
        id: 'wave',
        i18nKey: 'presetWave',
        defaultName: 'Wave',
        folder: 'dynamics',
        points: [
            { x: 0.0, y: 0.20, cpOut: { x: 0.12, y: 0.65 } },
            { x: 0.33, y: 0.85, cpIn: { x: 0.22, y: 0.85 }, cpOut: { x: 0.44, y: 0.85 } },
            { x: 0.66, y: 0.15, cpIn: { x: 0.55, y: 0.15 }, cpOut: { x: 0.77, y: 0.15 } },
            { x: 1.0, y: 0.80, cpIn: { x: 0.88, y: 0.35 } }
        ]
    },
    {
        id: 'multi-wave',
        i18nKey: 'presetMultiWave',
        defaultName: 'Ripple',
        folder: 'dynamics',
        points: [
            { x: 0.0, y: 0.50, cpOut: { x: 0.08, y: 0.95 } },
            { x: 0.25, y: 1.0, cpIn: { x: 0.17, y: 1.0 }, cpOut: { x: 0.33, y: 1.0 } },
            { x: 0.50, y: 0.0, cpIn: { x: 0.42, y: 0.0 }, cpOut: { x: 0.58, y: 0.0 } },
            { x: 0.75, y: 1.0, cpIn: { x: 0.67, y: 1.0 }, cpOut: { x: 0.83, y: 1.0 } },
            { x: 1.0, y: 0.50, cpIn: { x: 0.92, y: 0.05 } }
        ]
    },
    {
        id: 'steps',
        i18nKey: 'presetSteps',
        defaultName: 'Steps',
        folder: 'dynamics',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.20, y: 0.0 } },
            { x: 0.33, y: 0.33, cpIn: { x: 0.33, y: 0.05 }, cpOut: { x: 0.52, y: 0.33 }, brokenHandles: true },
            { x: 0.66, y: 0.66, cpIn: { x: 0.66, y: 0.38 }, cpOut: { x: 0.85, y: 0.66 }, brokenHandles: true },
            { x: 1.0, y: 1.0, cpIn: { x: 1.0, y: 0.71 } }
        ]
    },
    {
        id: 'bounce',
        i18nKey: 'presetBounce',
        defaultName: 'Bounce',
        folder: 'dynamics',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.20, y: 0.80 } },
            { x: 0.45, y: 1.0, cpIn: { x: 0.35, y: 1.0 }, cpOut: { x: 0.55, y: 1.0 } },
            { x: 0.70, y: 0.40, cpIn: { x: 0.65, y: 0.40 }, cpOut: { x: 0.75, y: 0.40 }, brokenHandles: true },
            { x: 0.85, y: 0.85, cpIn: { x: 0.80, y: 0.85 }, cpOut: { x: 0.90, y: 0.85 } },
            { x: 1.0, y: 1.0, cpIn: { x: 0.95, y: 0.95 } }
        ]
    },
    {
        id: 'elastic',
        i18nKey: 'presetElastic',
        defaultName: 'Elastic',
        folder: 'dynamics',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.25, y: 0.10 } },
            { x: 0.60, y: 1.0, cpIn: { x: 0.45, y: 1.0 }, cpOut: { x: 0.72, y: 1.0 } },
            { x: 0.82, y: 0.88, cpIn: { x: 0.78, y: 0.88 }, cpOut: { x: 0.88, y: 0.88 } },
            { x: 1.0, y: 1.0, cpIn: { x: 0.94, y: 1.0 } }
        ]
    },
    {
        id: 'peak',
        i18nKey: 'presetPeak',
        defaultName: 'Peak',
        folder: 'shapes',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.25, y: 0.50 } },
            { x: 0.50, y: 1.0, cpIn: { x: 0.48, y: 0.95 }, cpOut: { x: 0.52, y: 0.95 }, brokenHandles: true },
            { x: 1.0, y: 0.0, cpIn: { x: 0.75, y: 0.50 } }
        ]
    },
    {
        id: 'pulse',
        i18nKey: 'presetPulse',
        defaultName: 'Pulse',
        folder: 'dynamics',
        points: [
            { x: 0.0, y: 0.20, cpOut: { x: 0.25, y: 0.20 } },
            { x: 0.38, y: 0.20, cpIn: { x: 0.32, y: 0.20 }, cpOut: { x: 0.42, y: 0.95 }, brokenHandles: true },
            { x: 0.50, y: 1.0, cpIn: { x: 0.47, y: 1.0 }, cpOut: { x: 0.53, y: 1.0 } },
            { x: 0.62, y: 0.20, cpIn: { x: 0.58, y: 0.95 }, cpOut: { x: 0.68, y: 0.20 }, brokenHandles: true },
            { x: 1.0, y: 0.20, cpIn: { x: 0.75, y: 0.20 } }
        ]
    },
    {
        id: 'expo',
        i18nKey: 'presetExpo',
        defaultName: 'Expo',
        folder: 'shapes',
        points: [
            { x: 0.0, y: 0.0, cpOut: { x: 0.65, y: 0.05 } },
            { x: 1.0, y: 1.0, cpIn: { x: 0.95, y: 0.65 } }
        ]
    }
];

/**
 * Piecewise Cubic Bézier Spline Interpolator
 * Evaluates smooth non-linear value distributions across anchor points
 * using explicit outgoing (cpOut) and incoming (cpIn) Bézier control handles.
 */
class BezierSplineInterpolator {
    static evaluateSegment(p0, p1, p2, p3, x) {
        if (Math.abs(p3.x - p0.x) < 1e-6) {
            return p0.y;
        }
        const x0 = p0.x;
        const x1 = p1.x;
        const x2 = p2.x;
        const x3 = p3.x;
        const y0 = p0.y;
        const y1 = p1.y;
        const y2 = p2.y;
        const y3 = p3.y;

        function bx(t) {
            const u = 1 - t;
            return u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
        }
        function dbx(t) {
            const u = 1 - t;
            return 3 * u * u * (x1 - x0) + 6 * u * t * (x2 - x1) + 3 * t * t * (x3 - x2);
        }

        let t = (x - x0) / (x3 - x0);
        t = Math.max(0, Math.min(1, t));

        for (let iter = 0; iter < 8; iter++) {
            const curX = bx(t) - x;
            if (Math.abs(curX) < 1e-5) {
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
        const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
        return Math.max(0, Math.min(1, y));
    }

    static evaluate(points, x) {
        const n = points.length;
        if (n === 0) {
            return 0;
        }
        if (n === 1) {
            return points[0].y;
        }
        if (x <= points[0].x) {
            return points[0].y;
        }
        if (x >= points[n - 1].x) {
            return points[n - 1].y;
        }

        let i = 0;
        for (let k = 0; k < n - 1; k++) {
            if (x >= points[k].x && x <= points[k + 1].x) {
                i = k;
                break;
            }
        }

        const p0 = points[i];
        const p3 = points[i + 1];
        const spanX = p3.x - p0.x;
        if (spanX < 1e-6) {
            return p0.y;
        }

        const hasCp1 = Boolean(p0.cpOut && !p0.hasNoCpOut);
        const hasCp2 = Boolean(p3.cpIn && !p3.hasNoCpIn);

        // Pure straight line interpolation if both handles are removed
        if (!hasCp1 && !hasCp2) {
            const progress = (x - p0.x) / spanX;
            return Math.max(0, Math.min(1, p0.y + progress * (p3.y - p0.y)));
        }

        const dx = spanX / 3;
        const dy = (p3.y - p0.y) / 3;
        const p1 = (hasCp1 && p0.cpOut) ? p0.cpOut : { x: p0.x + dx, y: p0.y + dy };
        const p2 = (hasCp2 && p3.cpIn) ? p3.cpIn : { x: p3.x - dx, y: p3.y - dy };

        return this.evaluateSegment(p0, p1, p2, p3, x);
    }
}

class GraphMode {
    constructor(containerElement, onDistributionChange) {
        this.container = containerElement;
        this.onChange = onDistributionChange;

        // Canvas & layout state
        this.canvas = null;
        this.ctx = null;
        this.width = 280;
        this.height = 180;
        this.padding = 24;

        this.availableAxes = [];
        this.axes = this.availableAxes;
        this.distributionTarget = 'characters';
        this.itemCount = 16;
        this.hoveredDistIndex = null;

        // Multi-curve collection with multi-point splines
        this.curves = [
            {
                id: 'curve_1',
                axisId: 'wght',
                color: CURVE_PALETTE[0],
                enabled: true,
                points: [
                    { x: 0.0, y: 0.0, cpOut: { x: 0.45, y: 0.05 } },
                    { x: 1.0, y: 1.0, cpIn: { x: 0.55, y: 0.95 } }
                ],
                selectedPointIdx: 0,
                preset: 's-curve'
            }
        ];
        this.activeCurveId = 'curve_1';

        // Multi-point History Stack for Undo/Redo (Հետարկել / Վերարկել)
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 50;
        this.isHistoryAction = false;
        this.dragStartState = null; // Snapshot before drag begins

        // Multi-selection & Marquee state (Box marquee & Alt-held Lasso marquee)
        this.selectedItems = new Set(['anchor_0']);
        this.activeMarquee = null;
        this.shiftOrthoLock = null;
        this.dragStartNormPos = null;
        this.dragStartPoints = null;

        this.init();
    }

    getCurvePointsSnapshot(cur) {
        if (!cur) {
            return null;
        }
        return {
            curveId: cur.id,
            preset: cur.preset,
            selectedPointIdx: cur.selectedPointIdx,
            points: JSON.parse(JSON.stringify(cur.points))
        };
    }

    recordHistoryState(optSnapshot) {
        if (this.isHistoryAction) {
            return;
        }
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }
        const snapshot = optSnapshot || this.getCurvePointsSnapshot(cur);
        if (!snapshot) {
            return;
        }

        // Avoid pushing identical duplicate state
        if (this.undoStack.length > 0) {
            const last = this.undoStack[this.undoStack.length - 1];
            if (JSON.stringify(last.points) === JSON.stringify(snapshot.points)) {
                return;
            }
        }

        this.undoStack.push(snapshot);
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        // Clearing redo stack on new user operation
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    undo() {
        const cur = this.getActiveCurve();
        if (!cur || this.undoStack.length === 0) {
            return;
        }

        this.isHistoryAction = true;
        try {
            // Push current state to redo stack
            const currentState = this.getCurvePointsSnapshot(cur);
            this.redoStack.push(currentState);

            // Pop previous state from undo stack
            const prevState = this.undoStack.pop();
            cur.points = JSON.parse(JSON.stringify(prevState.points));
            cur.preset = prevState.preset || 'custom';
            cur.selectedPointIdx = Math.max(0, Math.min(cur.points.length - 1, prevState.selectedPointIdx || 0));

            this.ensurePointHandles(cur);
            this.markCurveDirty(cur);
            this.renderPointChips();
            this.syncPointInspector();
            this.redraw();
            this.emitDistribution();
        } finally {
            this.isHistoryAction = false;
            this.updateUndoRedoButtons();
        }
    }

    redo() {
        const cur = this.getActiveCurve();
        if (!cur || this.redoStack.length === 0) {
            return;
        }

        this.isHistoryAction = true;
        try {
            // Push current state to undo stack
            const currentState = this.getCurvePointsSnapshot(cur);
            this.undoStack.push(currentState);

            // Pop next state from redo stack
            const nextState = this.redoStack.pop();
            cur.points = JSON.parse(JSON.stringify(nextState.points));
            cur.preset = nextState.preset || 'custom';
            cur.selectedPointIdx = Math.max(0, Math.min(cur.points.length - 1, nextState.selectedPointIdx || 0));

            this.ensurePointHandles(cur);
            this.markCurveDirty(cur);
            this.renderPointChips();
            this.syncPointInspector();
            this.redraw();
            this.emitDistribution();
        } finally {
            this.isHistoryAction = false;
            this.updateUndoRedoButtons();
        }
    }

    updateUndoRedoButtons() {
        const btnUndo = this.container.querySelector('#btn-undo-point');
        const btnRedo = this.container.querySelector('#btn-redo-point');
        if (btnUndo) {
            btnUndo.disabled = (this.undoStack.length === 0);
        }
        if (btnRedo) {
            btnRedo.disabled = (this.redoStack.length === 0);
        }
    }

    init() {
        this.activeFolderFilter = 'all';
        this.renderUI();
        this.setupCanvas();
        this.bindEvents();
        this.renderCurvePills();
        this.renderPointChips();
        this.syncPointInspector();
        this.renderCustomPresets();
        this.applySectionsLayout();
        this.redraw();
        this.emitDistribution();
    }

    renderUI() {
        const i18n = window.i18n;
        const layout = this.getSectionsLayout();
        const isCollapsed = (id) => Boolean(layout.collapsed && layout.collapsed[id]);
        const isVisible = (id) => layout.visibility[id] !== false;

        this.container.innerHTML = `
            <div class="graph-mode-panel no-collapse-transition">
                <!-- 1. Curve Layers Card -->
                <div class="graph-modular-card ${isCollapsed('curves') ? 'is-collapsed' : ''}" data-card-id="curves" style="${isVisible('curves') ? '' : 'display:none;'}">
                    <div class="graph-modular-card-header">
                        <div class="card-header-left">
                            <div class="card-drag-handle" data-card="curves" draggable="true" title="${i18n ? i18n.t('dragToReorder') : 'Drag to reorder'}"><i class="hd-icon hd-icon-hamburger-menu"></i></div>
                            <button type="button" class="btn-card-ctrl btn-card-collapse" data-card="curves" data-action="collapse" title="${isCollapsed('curves') ? (i18n ? i18n.t('expandPanelTitle') : 'Expand panel') : (i18n ? i18n.t('collapsePanelTitle') : 'Collapse')}"><i class="hd-icon hd-icon-chevrolt-arrow-bottom"></i></button>
                            <span class="card-title">${i18n ? i18n.t('panelCurves') : 'Curve Layers'}</span>
                        </div>
                        <div class="card-header-right">
                            <button type="button" class="btn-card-ctrl btn-curves-help" id="btn-curves-help" title="${i18n && i18n.currentLang === 'en' ? 'Features & shortcuts' : 'Հնարավորություններ և ստեղներ'}">?</button>
                            <button type="button" class="btn-card-ctrl btn-card-up" data-card="curves" data-action="up" title="${i18n ? i18n.t('moveUpTitle') : 'Move up'}"><i class="hd-icon hd-icon-arrow-up"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-down" data-card="curves" data-action="down" title="${i18n ? i18n.t('moveDownTitle') : 'Move down'}"><i class="hd-icon hd-icon-arrow-bottom"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-close" data-card="curves" data-action="close" title="${i18n ? i18n.t('closePanelTitle') : 'Close panel'}"><i class="hd-icon hd-icon-close"></i></button>
                        </div>
                    </div>
                    <div class="graph-modular-card-body">
                        <div class="curve-layers-bar">
                            <div class="curve-layers-header">
                                <span class="layers-title">${i18n ? i18n.t('curvesTitle') : 'Curves:'}</span>
                                <div class="add-curve-control-group">
                                    <select id="add-curve-axis-select" class="add-curve-axis-select" title="${i18n ? i18n.t('selectAxisToAdd') : 'Select axis...'}"></select>
                                    <button type="button" class="btn-add-curve" id="btn-add-curve" title="${i18n ? i18n.t('addCurveTitle') : 'Add another curve to this canvas'}">
                                        <i class="hd-icon hd-icon-plus"></i> ${i18n ? i18n.t('addCurveBtn') : 'Add Curve'}
                                    </button>
                                </div>
                            </div>
                            <div class="curve-pills-list" id="curve-pills-list"></div>
                        </div>
                    </div>
                </div>

                <!-- 2. Active Curve Settings Toolbar Card -->
                <div class="graph-modular-card ${isCollapsed('toolbar') ? 'is-collapsed' : ''}" data-card-id="toolbar" style="${isVisible('toolbar') ? '' : 'display:none;'}">
                    <div class="graph-modular-card-header">
                        <div class="card-header-left">
                            <div class="card-drag-handle" data-card="toolbar" draggable="true" title="${i18n ? i18n.t('dragToReorder') : 'Drag to reorder'}"><i class="hd-icon hd-icon-hamburger-menu"></i></div>
                            <button type="button" class="btn-card-ctrl btn-card-collapse" data-card="toolbar" data-action="collapse" title="${isCollapsed('toolbar') ? (i18n ? i18n.t('expandPanelTitle') : 'Expand panel') : (i18n ? i18n.t('collapsePanelTitle') : 'Collapse')}"><i class="hd-icon hd-icon-chevrolt-arrow-bottom"></i></button>
                            <span class="card-title">${i18n ? i18n.t('panelToolbar') : 'Axis Settings'}</span>
                        </div>
                        <div class="card-header-right">
                            <button type="button" class="btn-card-ctrl btn-card-up" data-card="toolbar" data-action="up" title="${i18n ? i18n.t('moveUpTitle') : 'Move up'}"><i class="hd-icon hd-icon-arrow-up"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-down" data-card="toolbar" data-action="down" title="${i18n ? i18n.t('moveDownTitle') : 'Move down'}"><i class="hd-icon hd-icon-arrow-bottom"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-close" data-card="toolbar" data-action="close" title="${i18n ? i18n.t('closePanelTitle') : 'Close panel'}"><i class="hd-icon hd-icon-close"></i></button>
                        </div>
                    </div>
                    <div class="graph-modular-card-body">
                        <div class="graph-toolbar">
                            <div class="field-group">
                                <label for="graph-axis-select">${i18n ? i18n.t('activeCurveAxis') : 'Active Curve Axis:'}</label>
                                <select id="graph-axis-select" class="dropdown-select"></select>
                            </div>
                            <div class="field-group">
                                <label for="graph-target-select">${i18n ? i18n.t('mapAcross') : 'Map across:'}</label>
                                <select id="graph-target-select" class="dropdown-select">
                                    <option value="characters" selected>${i18n ? i18n.t('optCharacters') : 'Characters'}</option>
                                    <option value="items">${i18n ? i18n.t('optItems') : 'Selected Items'}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Spline Canvas Card -->
                <div class="graph-modular-card ${isCollapsed('canvas') ? 'is-collapsed' : ''}" data-card-id="canvas" style="${isVisible('canvas') ? '' : 'display:none;'}">
                    <div class="graph-modular-card-header">
                        <div class="card-header-left">
                            <div class="card-drag-handle" data-card="canvas" draggable="true" title="${i18n ? i18n.t('dragToReorder') : 'Drag to reorder'}"><i class="hd-icon hd-icon-hamburger-menu"></i></div>
                            <button type="button" class="btn-card-ctrl btn-card-collapse" data-card="canvas" data-action="collapse" title="${isCollapsed('canvas') ? (i18n ? i18n.t('expandPanelTitle') : 'Expand panel') : (i18n ? i18n.t('collapsePanelTitle') : 'Collapse')}"><i class="hd-icon hd-icon-chevrolt-arrow-bottom"></i></button>
                            <span class="card-title">${i18n ? i18n.t('panelCanvas') : 'Spline Canvas'}</span>
                        </div>
                        <div class="card-header-right">
                            <button type="button" class="btn-card-ctrl btn-card-up" data-card="canvas" data-action="up" title="${i18n ? i18n.t('moveUpTitle') : 'Move up'}"><i class="hd-icon hd-icon-arrow-up"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-down" data-card="canvas" data-action="down" title="${i18n ? i18n.t('moveDownTitle') : 'Move down'}"><i class="hd-icon hd-icon-arrow-bottom"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-close" data-card="canvas" data-action="close" title="${i18n ? i18n.t('closePanelTitle') : 'Close panel'}"><i class="hd-icon hd-icon-close"></i></button>
                        </div>
                    </div>
                    <div class="graph-modular-card-body">
                        <div class="canvas-wrapper">
                            <canvas id="bezier-canvas" width="280" height="180"></canvas>
                            <div class="graph-axis-annotations">
                                <span class="ann-y-max">${i18n ? i18n.t('annMax') : '1.0 (Max)'}</span>
                                <span class="ann-y-min">${i18n ? i18n.t('annMin') : '0.0 (Min)'}</span>
                                <span class="ann-x-start">${i18n ? i18n.t('annStart') : 'Start [0]'}</span>
                                <span class="ann-x-end">${i18n ? i18n.t('annEnd') : 'End [N]'}</span>
                            </div>
                        </div>
                        <label class="dist-points-toggle">
                            <input type="checkbox" id="chk-show-dist-points">
                            <span>${i18n && i18n.currentLang === 'en' ? 'Show distribution points on curve' : 'Ցուցադրել բաշխիչ կետերը կորի վրա'}</span>
                        </label>
                        <div class="distribution-preview-wrap">
                            <div class="preview-header">
                                <span id="preview-axis-label" class="preview-axis-label">${i18n ? i18n.t('charDistribution') : 'Տառերի բաշխում'}</span>
                                <span id="preview-hover-readout" class="preview-hover-readout"></span>
                                <button type="button" id="btn-reset-overrides" class="btn-reset-overrides" title="${i18n && i18n.currentLang === 'en' ? 'Reset all per-letter edits' : 'Վերականգնել տառերի բոլոր փոփոխությունները'}">&#8634;</button>
                                <span id="preview-sample-count">16</span>
                            </div>
                            <div id="distribution-bars" class="distribution-bars"></div>
                            <div id="distribution-axis-footer" class="distribution-axis-footer"></div>
                        </div>
                    </div>
                </div>

                <!-- 4. Points Control Toolbar Card -->
                <div class="graph-modular-card ${isCollapsed('points') ? 'is-collapsed' : ''}" data-card-id="points" style="${isVisible('points') ? '' : 'display:none;'}">
                    <div class="graph-modular-card-header">
                        <div class="card-header-left">
                            <div class="card-drag-handle" data-card="points" draggable="true" title="${i18n ? i18n.t('dragToReorder') : 'Drag to reorder'}"><i class="hd-icon hd-icon-hamburger-menu"></i></div>
                            <button type="button" class="btn-card-ctrl btn-card-collapse" data-card="points" data-action="collapse" title="${isCollapsed('points') ? (i18n ? i18n.t('expandPanelTitle') : 'Expand panel') : (i18n ? i18n.t('collapsePanelTitle') : 'Collapse')}"><i class="hd-icon hd-icon-chevrolt-arrow-bottom"></i></button>
                            <span class="card-title">${i18n ? i18n.t('panelPoints') : 'Points Control'}</span>
                        </div>
                        <div class="card-header-right">
                            <button type="button" class="btn-card-ctrl btn-card-up" data-card="points" data-action="up" title="${i18n ? i18n.t('moveUpTitle') : 'Move up'}"><i class="hd-icon hd-icon-arrow-up"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-down" data-card="points" data-action="down" title="${i18n ? i18n.t('moveDownTitle') : 'Move down'}"><i class="hd-icon hd-icon-arrow-bottom"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-close" data-card="points" data-action="close" title="${i18n ? i18n.t('closePanelTitle') : 'Close panel'}"><i class="hd-icon hd-icon-close"></i></button>
                        </div>
                    </div>
                    <div class="graph-modular-card-body">
                        <div class="multi-point-toolbar">
                            <div class="point-selector-wrap">
                                <span class="point-toolbar-label">${i18n ? i18n.t('pointsLabel') : 'Points:'}</span>
                                <div class="point-chips-list" id="point-chips-list"></div>
                                <button type="button" class="btn-add-point" id="btn-add-point" title="${i18n ? i18n.t('addPointTitle') : 'Add intermediate point'}"><i class="hd-icon hd-icon-plus"></i> ${i18n ? i18n.t('addPointBtn') : 'Add Point'}</button>
                                <div class="point-undo-redo-group">
                                    <button type="button" class="btn-point-history" id="btn-undo-point" title="${i18n ? i18n.t('undoPointTitle') : 'Undo point changes (Ctrl+Z)'}" disabled><i class="hd-icon hd-icon-undo-arrow"></i> ${i18n ? i18n.t('undoPointBtn') : 'Undo'}</button>
                                    <button type="button" class="btn-point-history" id="btn-redo-point" title="${i18n ? i18n.t('redoPointTitle') : 'Redo point changes (Ctrl+Y / Ctrl+Shift+Z)'}" disabled><i class="hd-icon hd-icon-redo-arrow"></i> ${i18n ? i18n.t('redoPointBtn') : 'Redo'}</button>
                                </div>
                            </div>
                            <div class="point-details-row">
                                <div class="point-coords-group">
                                    <span class="point-details-label">${i18n ? i18n.t('pointDetailsLabel') : 'Details:'}</span>
                                    <div class="point-detail-field">
                                        <label for="point-x-input">X:</label>
                                        <input type="number" id="point-x-input" class="point-coord-input" min="0" max="1" step="0.01">
                                    </div>
                                    <div class="point-detail-field">
                                        <label for="point-y-input">Y:</label>
                                        <input type="number" id="point-y-input" class="point-coord-input" min="0" max="1" step="0.01">
                                    </div>
                                </div>
                                <div class="point-actions-group">
                                    <span class="point-actions-label">${i18n ? i18n.t('pointActionsLabel') : 'Actions:'}</span>
                                    <button type="button" class="btn-toggle-link-handles is-linked" id="btn-toggle-link-handles" title="${i18n ? i18n.t('toggleLinkHandlesTitle') : 'Toggle linked / unlinked handles'}">
                                        <span class="link-handles-icon"><i class="hd-icon hd-icon-locked"></i></span>
                                        <span class="link-handles-text">${i18n ? i18n.t('pointLinked') : 'Linked'}</span>
                                    </button>
                                    <button type="button" class="btn-delete-point" id="btn-delete-point" title="${i18n ? i18n.t('delPointTitle') : 'Delete selected point'}"><i class="hd-icon hd-icon-trash"></i> ${i18n ? i18n.t('delPointBtn') : 'Delete'}</button>
                                </div>
                            </div>
                            <div class="point-instructions-hint">
                                ${i18n ? i18n.t('instructionsHint') : 'Double-click canvas to add point, on point to delete, on handle knob to break/smooth. Drag to shape.'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 5. Presets & Folders Card -->
                <div class="graph-modular-card ${isCollapsed('presets') ? 'is-collapsed' : ''}" data-card-id="presets" style="${isVisible('presets') ? '' : 'display:none;'}">
                    <div class="graph-modular-card-header">
                        <div class="card-header-left">
                            <div class="card-drag-handle" data-card="presets" draggable="true" title="${i18n ? i18n.t('dragToReorder') : 'Drag to reorder'}"><i class="hd-icon hd-icon-hamburger-menu"></i></div>
                            <button type="button" class="btn-card-ctrl btn-card-collapse" data-card="presets" data-action="collapse" title="${isCollapsed('presets') ? (i18n ? i18n.t('expandPanelTitle') : 'Expand panel') : (i18n ? i18n.t('collapsePanelTitle') : 'Collapse')}"><i class="hd-icon hd-icon-chevrolt-arrow-bottom"></i></button>
                            <span class="card-title">${i18n ? i18n.t('panelPresets') : 'Presets & Folders'}</span>
                        </div>
                        <div class="card-header-right">
                            <button type="button" class="btn-card-ctrl btn-card-up" data-card="presets" data-action="up" title="${i18n ? i18n.t('moveUpTitle') : 'Move up'}"><i class="hd-icon hd-icon-arrow-up"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-down" data-card="presets" data-action="down" title="${i18n ? i18n.t('moveDownTitle') : 'Move down'}"><i class="hd-icon hd-icon-arrow-bottom"></i></button>
                            <button type="button" class="btn-card-ctrl btn-card-close" data-card="presets" data-action="close" title="${i18n ? i18n.t('closePanelTitle') : 'Close panel'}"><i class="hd-icon hd-icon-close"></i></button>
                        </div>
                    </div>
                    <div class="graph-modular-card-body">
                        <div class="curve-presets-section">
                            <div class="curve-presets-header-row">
                                <span class="curve-presets-label">${i18n ? i18n.t('curvePresetsLabel') : 'Curve Presets (Active Curve):'}</span>
                                <div class="preset-action-bar">
                                    <button type="button" class="btn-preset-action btn-create-preset" id="btn-create-preset" title="${i18n ? i18n.t('createPresetTitle') : 'Create preset'}">
                                        <i class="hd-icon hd-icon-plus"></i> ${i18n ? i18n.t('createPresetBtn') : 'Create Preset'}
                                    </button>
                                    <button type="button" class="btn-preset-action btn-export-presets" id="btn-export-presets" title="${i18n ? i18n.t('exportPresetsTitle') : 'Export presets as JSON'}">
                                        <i class="hd-icon hd-icon-download"></i> ${i18n ? i18n.t('exportPresetsBtn') : 'Export'}
                                    </button>
                                    <button type="button" class="btn-preset-action btn-import-presets" id="btn-import-presets" title="${i18n ? i18n.t('importPresetsTitle') : 'Import presets from JSON'}">
                                        <i class="hd-icon hd-icon-paste"></i> ${i18n ? i18n.t('importPresetsBtn') : 'Import'}
                                    </button>
                                    <button type="button" class="btn-preset-action btn-delete-all-presets" id="btn-delete-all-presets" title="${i18n ? i18n.t('deleteAllPresetsTitle') : 'Delete all presets'}">
                                        <i class="hd-icon hd-icon-trash"></i> ${i18n ? i18n.t('deleteAllPresetsBtn') : 'Delete All'}
                                    </button>
                                    <input type="file" id="import-presets-file-input" accept=".json" style="display:none;" />
                                </div>
                            </div>

                            <!-- Inline Preset Creation Form (with Folder Selector) -->
                            <div class="preset-create-form" id="preset-create-form" style="display:none;">
                                <div class="preset-form-inputs-row">
                                    <input type="text" id="preset-name-input" class="preset-name-input" placeholder="${i18n ? i18n.t('presetNamePlaceholder') : 'Preset name...'}" maxlength="30" />
                                    <div class="preset-folder-select-wrap">
                                        <label for="preset-folder-select">${i18n ? i18n.t('folderSelectLabel') : 'Folder:'}</label>
                                        <select id="preset-folder-select" class="preset-folder-select"></select>
                                    </div>
                                </div>
                                <div class="preset-form-actions-row">
                                    <button type="button" class="btn-preset-save" id="btn-preset-save-confirm">${i18n ? i18n.t('saveBtn') : 'Save'}</button>
                                    <button type="button" class="btn-preset-cancel" id="btn-preset-cancel">${i18n ? i18n.t('cancelBtn') : 'Cancel'}</button>
                                </div>
                            </div>

                            <!-- Folder Filter Navigation & New Folder Form -->
                            <div class="preset-folders-nav-bar">
                                <div class="folders-chips-list" id="folders-chips-list"></div>
                                <button type="button" class="btn-new-folder" id="btn-new-folder" title="${i18n ? i18n.t('newFolderTitle') : 'Create new folder'}">
                                    <i class="hd-icon hd-icon-plus"></i> ${i18n ? i18n.t('newFolderBtn') : 'New Folder'}
                                </button>
                            </div>

                            <!-- Inline New Folder Form -->
                            <div class="folder-create-form" id="folder-create-form" style="display:none;">
                                <input type="text" id="folder-name-input" class="folder-name-input" placeholder="${i18n ? i18n.t('newFolderPlaceholder') : 'Folder name...'}" maxlength="25" />
                                <button type="button" class="btn-folder-save" id="btn-folder-save">${i18n ? i18n.t('saveBtn') : 'Save'}</button>
                                <button type="button" class="btn-folder-cancel" id="btn-folder-cancel">${i18n ? i18n.t('cancelBtn') : 'Cancel'}</button>
                            </div>

                            <!-- Presets List (Grouped by Folders, with Delete on each item) -->
                            <div class="custom-presets-section" id="custom-presets-section">
                                <div class="custom-presets-list" id="custom-presets-list"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.canvas = this.container.querySelector('#bezier-canvas');
        this.ctx = this.canvas.getContext('2d');

        const panel = this.container.querySelector('.graph-mode-panel');
        if (panel) {
            requestAnimationFrame(() => {
                panel.classList.remove('no-collapse-transition');
            });
        }
        this.applySectionsLayout();
    }

    setupCanvas() {
        if (!this.canvas) {
            return;
        }
        const dpr = window.devicePixelRatio || 1;
        const wrap = this.canvas.parentElement;
        const displayWidth = wrap && wrap.clientWidth > 0
            ? Math.round(wrap.clientWidth)
            : (this.width || 280);
        const displayHeight = 180;

        if (displayWidth <= 0) {
            return;
        }

        this.width = displayWidth;
        this.height = displayHeight;
        this.canvas.width = Math.round(displayWidth * dpr);
        this.canvas.height = Math.round(displayHeight * dpr);

        if (this.ctx.resetTransform) {
            this.ctx.resetTransform();
        } else {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.scale(dpr, dpr);
    }

    getActiveCurve() {
        const found = this.curves.find((c) => c.id === this.activeCurveId);
        if (found) {
            return found;
        }
        return this.curves[0];
    }

    ensurePointHandles(cur) {
        if (!cur || !cur.points) {
            return;
        }
        const pts = cur.points;
        const n = pts.length;
        for (let i = 0; i < n; i++) {
            const p = pts[i];
            if (i < n - 1 && !p.cpOut && !p.hasNoCpOut) {
                const next = pts[i + 1];
                const dx = (next.x - p.x) / 3;
                let slope = (next.y - p.y) / Math.max(1e-5, next.x - p.x);
                if (i > 0) {
                    const prev = pts[i - 1];
                    const prevSlope = (p.y - prev.y) / Math.max(1e-5, p.x - prev.x);
                    slope = (slope + prevSlope) / 2;
                }
                p.cpOut = {
                    x: Math.round((p.x + dx) * 1000) / 1000,
                    y: Math.round(Math.max(0, Math.min(1, p.y + slope * dx)) * 1000) / 1000
                };
            }
            if (i > 0 && !p.cpIn && !p.hasNoCpIn) {
                const prev = pts[i - 1];
                const dx = (p.x - prev.x) / 3;
                let slope = (p.y - prev.y) / Math.max(1e-5, p.x - prev.x);
                if (i < n - 1) {
                    const next = pts[i + 1];
                    const nextSlope = (next.y - p.y) / Math.max(1e-5, next.x - p.x);
                    slope = (slope + nextSlope) / 2;
                }
                p.cpIn = {
                    x: Math.round((p.x - dx) * 1000) / 1000,
                    y: Math.round(Math.max(0, Math.min(1, p.y - slope * dx)) * 1000) / 1000
                };
            }
        }
    }

    ensurePointHandlesForIndex(cur, i) {
        if (!cur || !cur.points || !cur.points[i]) {
            return;
        }
        const pts = cur.points;
        const n = pts.length;
        const p = pts[i];
        p.hasNoCpIn = false;
        p.hasNoCpOut = false;
        p.straight = false;

        if (i < n - 1) {
            const next = pts[i + 1];
            const dx = (next.x - p.x) / 3;
            let slope = (next.y - p.y) / Math.max(1e-5, next.x - p.x);
            if (i > 0) {
                const prev = pts[i - 1];
                const prevSlope = (p.y - prev.y) / Math.max(1e-5, p.x - prev.x);
                slope = (slope + prevSlope) / 2;
            }
            p.cpOut = {
                x: Math.round((p.x + dx) * 1000) / 1000,
                y: Math.round(Math.max(0, Math.min(1, p.y + slope * dx)) * 1000) / 1000
            };
            if (next.hasNoCpIn) {
                next.hasNoCpIn = false;
                next.cpIn = {
                    x: Math.round((next.x - dx) * 1000) / 1000,
                    y: Math.round(Math.max(0, Math.min(1, next.y - slope * dx)) * 1000) / 1000
                };
            }
        }
        if (i > 0) {
            const prev = pts[i - 1];
            const dx = (p.x - prev.x) / 3;
            let slope = (p.y - prev.y) / Math.max(1e-5, p.x - prev.x);
            if (i < n - 1) {
                const next = pts[i + 1];
                const nextSlope = (next.y - p.y) / Math.max(1e-5, next.x - p.x);
                slope = (slope + nextSlope) / 2;
            }
            p.cpIn = {
                x: Math.round((p.x - dx) * 1000) / 1000,
                y: Math.round(Math.max(0, Math.min(1, p.y - slope * dx)) * 1000) / 1000
            };
            if (prev.hasNoCpOut) {
                prev.hasNoCpOut = false;
                prev.cpOut = {
                    x: Math.round((prev.x + dx) * 1000) / 1000,
                    y: Math.round(Math.max(0, Math.min(1, prev.y + slope * dx)) * 1000) / 1000
                };
            }
        }
    }

    markCurveDirty(c) {
        if (c) {
            this.ensurePointHandles(c);
        }
    }

    evaluateCurveAtFor(c, x) {
        if (!c || !c.points || c.points.length === 0) {
            return 0;
        }
        if (c.points.length === 1) {
            return c.points[0].y;
        }
        this.ensurePointHandles(c);
        return BezierSplineInterpolator.evaluate(c.points, x);
    }

    renderCurvePills() {
        const list = this.container.querySelector('#curve-pills-list');
        const btnAdd = this.container.querySelector('#btn-add-curve');
        const addAxisSelect = this.container.querySelector('#add-curve-axis-select');
        if (!list) {
            return;
        }

        list.innerHTML = '';

        this.curves.forEach((c) => {
            const pill = document.createElement('div');
            pill.className = `curve-layer-pill ${c.id === this.activeCurveId ? 'active' : ''} ${!c.enabled ? 'disabled' : ''}`;
            pill.style.setProperty('--curve-color', c.color);

            const dot = document.createElement('span');
            dot.className = 'pill-color-dot';
            dot.style.backgroundColor = c.color;

            // Interactive Axis Selector Dropdown (Allows changing or swapping axis without losing curve points)
            const axisSelect = document.createElement('select');
            axisSelect.className = 'pill-axis-select';
            axisSelect.title = window.i18n ? window.i18n.t('changeOrSwapAxisTitle') : 'Change or swap axis';

            const otherCurves = this.curves.filter((other) => other.id !== c.id);
            const otherOccupiedAxes = otherCurves.map((other) => other.axisId);

            (this.availableAxes || []).forEach((ax) => {
                const opt = document.createElement('option');
                opt.value = ax.id;
                const dName = window.i18n ? window.i18n.getAxisName(ax.id, ax.name) : ax.name;
                const isOccupied = otherOccupiedAxes.includes(ax.id);
                if (ax.id === c.axisId) {
                    opt.textContent = `${dName} (${ax.id})`;
                    opt.selected = true;
                } else if (isOccupied) {
                    const swapText = window.i18n ? window.i18n.t('swapAxes') : 'Swap';
                    opt.textContent = `${dName} (${ax.id}) -> [${swapText}]`;
                } else {
                    opt.textContent = `${dName} (${ax.id})`;
                }
                axisSelect.appendChild(opt);
            });

            axisSelect.addEventListener('click', (e) => {
                e.stopPropagation();
                if (c.id !== this.activeCurveId) {
                    this.setActiveCurve(c.id);
                }
            });

            axisSelect.addEventListener('change', (e) => {
                e.stopPropagation();
                const chosenAxis = e.target.value;
                if (chosenAxis && chosenAxis !== c.axisId) {
                    this.reassignCurveAxis(c.id, chosenAxis);
                }
            });

            // Visibility toggle button
            const btnEye = document.createElement('button');
            btnEye.type = 'button';
            btnEye.className = 'pill-btn-toggle';
            btnEye.title = c.enabled ? (window.i18n ? window.i18n.t('disableCurve') : 'Disable curve') : (window.i18n ? window.i18n.t('enableCurve') : 'Enable curve');
            btnEye.innerHTML = c.enabled ? '<i class="hd-icon hd-icon-eye"></i>' : '<i class="hd-icon hd-icon-close-eye"></i>';
            btnEye.addEventListener('click', (e) => {
                e.stopPropagation();
                c.enabled = !c.enabled;
                this.renderCurvePills();
                this.redraw();
                this.emitDistribution();
            });

            // Click pill body to set active
            pill.addEventListener('click', () => {
                this.setActiveCurve(c.id);
            });

            pill.appendChild(dot);
            pill.appendChild(axisSelect);
            pill.appendChild(btnEye);

            // Duplicate curve button (copies curve geometry to another axis)
            const btnCopy = document.createElement('button');
            btnCopy.type = 'button';
            btnCopy.className = 'pill-btn-copy';
            btnCopy.title = window.i18n ? window.i18n.t('duplicateCurve') : 'Duplicate curve to another axis';
            btnCopy.innerHTML = '<i class="hd-icon hd-icon-paste"></i>';
            btnCopy.addEventListener('click', (e) => {
                e.stopPropagation();
                this.duplicateCurve(c.id);
            });
            pill.appendChild(btnCopy);

            // Delete button if more than 1 curve
            if (this.curves.length > 1) {
                const btnDel = document.createElement('button');
                btnDel.type = 'button';
                btnDel.className = 'pill-btn-del';
                btnDel.title = window.i18n ? window.i18n.t('deleteCurve') : 'Delete curve';
                btnDel.innerHTML = '<i class="hd-icon hd-icon-close"></i>';
                btnDel.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeCurve(c.id);
                });
                pill.appendChild(btnDel);
            }

            list.appendChild(pill);
        });

        // Update add-curve axis selector dropdown with UNUSED font axes
        const usedAxes = this.curves.map((c) => c.axisId);
        const unusedAxes = (this.availableAxes || []).filter((a) => !usedAxes.includes(a.id));

        if (addAxisSelect) {
            addAxisSelect.innerHTML = '';
            if (unusedAxes.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = window.i18n ? window.i18n.t('allAxesAdded') : 'All axes added';
                addAxisSelect.appendChild(opt);
                addAxisSelect.disabled = true;
            } else {
                unusedAxes.forEach((ax) => {
                    const opt = document.createElement('option');
                    opt.value = ax.id;
                    const displayName = window.i18n ? window.i18n.getAxisName(ax.id, ax.name) : ax.name;
                    opt.textContent = `${displayName} (${ax.id})`;
                    addAxisSelect.appendChild(opt);
                });
                addAxisSelect.disabled = false;
            }
        }

        if (btnAdd) {
            const canAdd = this.curves.length < 6 && unusedAxes.length > 0 && this.availableAxes.length > 0;
            btnAdd.disabled = !canAdd;
            btnAdd.style.opacity = canAdd ? '1' : '0.4';
            if (!canAdd && unusedAxes.length === 0 && this.availableAxes.length > 0) {
                btnAdd.title = window.i18n ? window.i18n.t('allAxesAdded') : 'All font axes are already added';
            } else {
                btnAdd.title = window.i18n ? window.i18n.t('addCurveTitle') : 'Add another curve to this canvas';
            }
        }

        this.updateActiveAxisDropdown();
    }

    updateActiveAxisDropdown() {
        const axisSelect = this.container.querySelector('#graph-axis-select');
        if (!axisSelect) {
            return;
        }
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }

        axisSelect.innerHTML = '';
        if (!this.availableAxes || this.availableAxes.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = window.i18n ? window.i18n.t('staticFont') : 'No Variable Axes';
            axisSelect.appendChild(opt);
            return;
        }

        const otherUsedAxes = this.curves.filter((c) => c.id !== cur.id).map((c) => c.axisId);

        this.availableAxes.forEach((ax) => {
            const opt = document.createElement('option');
            opt.value = ax.id;
            const displayName = window.i18n ? window.i18n.getAxisName(ax.id, ax.name) : ax.name;
            const isOccupied = otherUsedAxes.includes(ax.id);
            if (isOccupied) {
                const swapText = window.i18n ? window.i18n.t('swapAxes') : 'Swap';
                opt.textContent = `${displayName} (${ax.id}) -> [${swapText}]`;
            } else {
                opt.textContent = `${displayName} (${ax.id})`;
            }
            opt.disabled = false;
            axisSelect.appendChild(opt);
        });

        axisSelect.value = cur.axisId;
    }

    renderPointChips() {
        const list = this.container.querySelector('#point-chips-list');
        if (!list) {
            return;
        }
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }

        list.innerHTML = '';
        cur.points.forEach((pt, idx) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            const isBroken = Boolean(pt.brokenHandles);
            const isStraight = Boolean((!pt.cpIn || pt.hasNoCpIn) && (!pt.cpOut || pt.hasNoCpOut));
            chip.className = `point-chip ${idx === cur.selectedPointIdx ? 'active' : ''} ${isStraight ? 'straight-mode' : (isBroken ? 'broken-mode' : '')}`;
            chip.textContent = `P${idx}`;
            const stateLabel = isStraight
                ? (window.i18n ? window.i18n.t('pointStraight') : 'Straight / No Handles')
                : (isBroken ? (window.i18n ? window.i18n.t('pointBroken') : 'Broken Handles') : (window.i18n ? window.i18n.t('pointSmooth') : 'Smooth Handles'));
            chip.title = `Point ${idx}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) [${stateLabel}] - (Alt + Right-click to toggle straight/smooth)`;
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                cur.selectedPointIdx = idx;
                this.renderPointChips();
                this.syncPointInspector();
                this.redraw();
            });
            list.appendChild(chip);
        });
    }

    syncPointInspector() {
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }
        const idx = cur.selectedPointIdx != null ? cur.selectedPointIdx : 0;
        const pt = cur.points[idx] || cur.points[0];

        const inpX = this.container.querySelector('#point-x-input');
        const inpY = this.container.querySelector('#point-y-input');
        const btnToggleLink = this.container.querySelector('#btn-toggle-link-handles');
        const btnDel = this.container.querySelector('#btn-delete-point');

        if (inpX) {
            inpX.value = pt.x.toFixed(2);
            inpX.disabled = false;
        }
        if (inpY) {
            inpY.value = pt.y.toFixed(2);
            inpY.disabled = false;
        }
        if (btnToggleLink) {
            const isStraight = Boolean((!pt.cpIn || pt.hasNoCpIn) && (!pt.cpOut || pt.hasNoCpOut));
            const isBroken = Boolean(pt.brokenHandles);
            const i18n = window.i18n;

            btnToggleLink.classList.remove('is-linked', 'is-unlinked', 'is-straight');

            if (isStraight) {
                btnToggleLink.classList.add('is-straight');
                btnToggleLink.innerHTML = `<span class="link-handles-icon"><i class="hd-icon hd-icon-undo-arrow"></i></span> <span class="link-handles-text">${i18n ? i18n.t('pointStraight') : 'Straight'}</span>`;
                btnToggleLink.title = i18n ? i18n.t('pointStraight') : 'Straight segment (Click to restore smooth handles)';
                btnToggleLink.disabled = false;
            } else if (isBroken) {
                btnToggleLink.classList.add('is-unlinked');
                btnToggleLink.innerHTML = `<span class="link-handles-icon"><i class="hd-icon hd-icon-unlocked"></i></span> <span class="link-handles-text">${i18n ? i18n.t('pointUnlinked') : 'Unlinked'}</span>`;
                btnToggleLink.title = i18n ? i18n.t('toggleLinkHandlesTitle') : 'Unlinked handles (Click to link/smooth)';
                btnToggleLink.disabled = false;
            } else {
                btnToggleLink.classList.add('is-linked');
                btnToggleLink.innerHTML = `<span class="link-handles-icon"><i class="hd-icon hd-icon-locked"></i></span> <span class="link-handles-text">${i18n ? i18n.t('pointLinked') : 'Linked'}</span>`;
                btnToggleLink.title = i18n ? i18n.t('toggleLinkHandlesTitle') : 'Linked smooth handles (Click to unlink/break)';
                btnToggleLink.disabled = false;
            }
        }
        if (btnDel) {
            // Can only delete intermediate points if curve has > 2 points
            btnDel.disabled = (idx === 0 || idx === cur.points.length - 1 || cur.points.length <= 2);
        }

        // Highlight active preset button if matched
        this.container.querySelectorAll('.btn-curve-preset').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.preset === cur.preset);
        });

        this.renderCustomPresets();
    }

    setActiveCurve(curveId) {
        this.activeCurveId = curveId;
        const cur = this.getActiveCurve();

        this.renderCurvePills();
        this.renderPointChips();
        this.syncPointInspector();
        this.updateUndoRedoButtons();
        this.redraw();
        this.updateDistributionPreview();
    }

    addCurve(optAxisId) {
        if (this.curves.length >= 6) {
            return;
        }

        const usedAxes = this.curves.map((c) => c.axisId);
        let targetAxisId = optAxisId;

        if (!targetAxisId || usedAxes.includes(targetAxisId)) {
            const availableUnused = (this.availableAxes || []).filter((a) => !usedAxes.includes(a.id));
            if (availableUnused.length === 0) {
                return; // No duplicate axes allowed!
            }
            targetAxisId = availableUnused[0].id;
        }

        const nextColor = CURVE_PALETTE[this.curves.length % CURVE_PALETTE.length];
        const newId = 'curve_' + Math.random().toString(36).substr(2, 6);

        const newCurve = {
            id: newId,
            axisId: targetAxisId,
            color: nextColor,
            enabled: true,
            points: [
                { x: 0.0, y: 0.0, cpOut: { x: 0.45, y: 0.05 } },
                { x: 1.0, y: 1.0, cpIn: { x: 0.55, y: 0.95 } }
            ],
            selectedPointIdx: 0,
            preset: 's-curve'
        };
        this.ensurePointHandles(newCurve);

        this.curves.push(newCurve);
        this.setActiveCurve(newId);
        this.emitDistribution();
    }

    removeCurve(curveId) {
        if (this.curves.length <= 1) {
            return;
        }
        this.curves = this.curves.filter((c) => c.id !== curveId);
        if (this.activeCurveId === curveId) {
            this.activeCurveId = this.curves[0].id;
        }
        this.setActiveCurve(this.activeCurveId);
        this.emitDistribution();
    }

    reassignCurveAxis(curveId, newAxisId) {
        if (!newAxisId) {
            return;
        }
        const cur = this.curves.find((c) => c.id === curveId);
        if (!cur || cur.axisId === newAxisId) {
            return;
        }

        // Record undo history state
        this.recordHistoryState();

        const oldAxisId = cur.axisId;
        const otherCurve = this.curves.find((c) => c.id !== curveId && c.axisId === newAxisId);

        if (otherCurve) {
            // Swap axes between the two curves!
            // Crucial: Neither curve loses any control points or handle shapes!
            otherCurve.axisId = oldAxisId;
            cur.axisId = newAxisId;
        } else {
            // Reassign to unused font axis
            cur.axisId = newAxisId;
        }

        this.renderCurvePills();
        this.updateActiveAxisDropdown();
        this.updateDistributionPreview();
        this.redraw();
        this.emitDistribution();
    }

    duplicateCurve(curveId) {
        const cur = this.curves.find((c) => c.id === curveId) || this.getActiveCurve();
        if (!cur) {
            return;
        }
        if (this.curves.length >= 6) {
            return;
        }

        const usedAxes = this.curves.map((c) => c.axisId);
        const unusedAxes = (this.availableAxes || []).filter((a) => !usedAxes.includes(a.id));
        if (unusedAxes.length === 0) {
            return;
        }

        const targetAxisId = unusedAxes[0].id;
        const nextColor = CURVE_PALETTE[this.curves.length % CURVE_PALETTE.length];
        const newId = 'curve_' + Math.random().toString(36).substr(2, 6);

        const newCurve = {
            id: newId,
            axisId: targetAxisId,
            color: nextColor,
            enabled: true,
            points: JSON.parse(JSON.stringify(cur.points)),
            selectedPointIdx: cur.selectedPointIdx != null ? cur.selectedPointIdx : 0,
            preset: cur.preset || 'custom'
        };
        this.ensurePointHandles(newCurve);

        this.curves.push(newCurve);
        this.setActiveCurve(newId);
        this.emitDistribution();
    }

    addPointToActiveCurve(optX, optY) {
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }

        let targetX;
        let targetY;

        if (optX !== undefined && optY !== undefined) {
            targetX = Math.max(0.02, Math.min(0.98, optX));
            targetY = Math.max(0, Math.min(1, optY));
        } else {
            // Find the widest interval between adjacent points
            let maxGap = -1;
            let bestIdx = 0;
            for (let i = 0; i < cur.points.length - 1; i++) {
                const gap = cur.points[i + 1].x - cur.points[i].x;
                if (gap > maxGap) {
                    maxGap = gap;
                    bestIdx = i;
                }
            }
            targetX = (cur.points[bestIdx].x + cur.points[bestIdx + 1].x) / 2;
            targetY = this.evaluateCurveAtFor(cur, targetX);
        }

        // Avoid placing point exactly on top of existing point
        const existing = cur.points.find((p) => Math.abs(p.x - targetX) < 0.015);
        if (existing) {
            cur.selectedPointIdx = cur.points.indexOf(existing);
            this.renderPointChips();
            this.syncPointInspector();
            this.redraw();
            return;
        }

        // Record undo state before modifying points
        this.recordHistoryState();

        cur.points.push({
            x: Math.round(targetX * 1000) / 1000,
            y: Math.round(targetY * 1000) / 1000,
            brokenHandles: false
        });

        // Always keep points strictly sorted by X
        cur.points.sort((a, b) => a.x - b.x);

        // Ensure valid X bounds
        cur.points[0].x = Math.max(0.0, Math.min(1.0, cur.points[0].x));
        cur.points[cur.points.length - 1].x = Math.max(0.0, Math.min(1.0, cur.points[cur.points.length - 1].x));

        // Ensure Bézier handles for the new point and its neighbors
        this.ensurePointHandles(cur);

        const newIdx = cur.points.findIndex((p) => Math.abs(p.x - targetX) < 0.01);
        cur.selectedPointIdx = newIdx >= 0 ? newIdx : 1;
        cur.preset = 'custom';

        this.renderPointChips();
        this.syncPointInspector();
        this.redraw();
        this.emitDistribution();
    }

    deletePointAt(idx) {
        const cur = this.getActiveCurve();
        if (!cur || cur.points.length <= 2) {
            return;
        }
        if (idx <= 0 || idx >= cur.points.length - 1) {
            return;
        }

        // Record undo state before deleting point
        this.recordHistoryState();

        cur.points.splice(idx, 1);
        cur.selectedPointIdx = Math.max(0, Math.min(cur.points.length - 1, idx - 1));
        cur.preset = 'custom';
        this.ensurePointHandles(cur);

        this.renderPointChips();
        this.syncPointInspector();
        this.redraw();
        this.emitDistribution();
    }

    deleteSelectedPoint() {
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }
        this.deletePointAt(cur.selectedPointIdx);
    }

    applyPreset(presetKey) {
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }

        // Record undo state before switching preset
        this.recordHistoryState();

        cur.preset = presetKey;
        const found = DEFAULT_PRESETS_DATA.find((p) => p.id === presetKey);
        if (found) {
            cur.points = JSON.parse(JSON.stringify(found.points));
        }

        this.ensurePointHandles(cur);

        cur.selectedPointIdx = 0;
        this.markCurveDirty(cur);
        this.renderPointChips();
        this.syncPointInspector();
        this.redraw();
        this.emitDistribution();
        this.renderCustomPresets();
    }

    getDeletedBuiltInPresets() {
        try {
            const raw = localStorage.getItem('vf_deleted_builtin_presets');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveDeletedBuiltInPresets(list) {
        try {
            localStorage.setItem('vf_deleted_builtin_presets', JSON.stringify(list));
        } catch (e) {}
    }

    deleteBuiltInPreset(presetId) {
        const preset = DEFAULT_PRESETS_DATA.find((p) => p.id === presetId);
        if (!preset) {
            return;
        }

        const displayName = window.i18n ? window.i18n.t(preset.i18nKey) : preset.defaultName;

        this.showConfirmModal({
            title: window.i18n ? window.i18n.t('confirmDeletePresetTitle') : 'Delete Preset',
            message: window.i18n ? window.i18n.t('confirmDeletePresetMsg', { name: displayName }) : `Are you sure you want to delete preset "${displayName}"?`,
            confirmText: window.i18n ? window.i18n.t('confirmDeleteBtn') : 'Delete',
            onConfirm: () => {
                const deleted = this.getDeletedBuiltInPresets();
                if (!deleted.includes(presetId)) {
                    deleted.push(presetId);
                    this.saveDeletedBuiltInPresets(deleted);
                }
                this.renderCustomPresets();
            }
        });
    }

    // =========================================
    // Modular Cards Layout Management (Reorder & Visibility)
    // =========================================
    getSectionsLayout() {
        const defaultCards = ['curves', 'toolbar', 'canvas', 'points', 'presets'];
        try {
            const raw = localStorage.getItem('vf_graph_sections_layout_v2');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed.order) && parsed.visibility) {
                    parsed.order = parsed.order.filter((id) => defaultCards.includes(id));
                    defaultCards.forEach((id) => {
                        if (!parsed.order.includes(id)) {
                            parsed.order.push(id);
                        }
                        if (parsed.visibility[id] === undefined) {
                            parsed.visibility[id] = true;
                        }
                    });
                    parsed.collapsed = parsed.collapsed || {};
                    return parsed;
                }
            }
        } catch (e) {}
        return {
            order: [...defaultCards],
            visibility: {
                curves: true,
                toolbar: true,
                canvas: true,
                points: true,
                presets: true
            },
            collapsed: {}
        };
    }

    saveSectionsLayout(layout) {
        try {
            localStorage.setItem('vf_graph_sections_layout_v2', JSON.stringify(layout));
        } catch (e) {}
        if (window.app && typeof window.app.updateWindowMenuItems === 'function') {
            window.app.updateWindowMenuItems();
        }
    }

    applySectionsLayout() {
        const layout = this.getSectionsLayout();
        const panel = this.container.querySelector('.graph-mode-panel');
        if (!panel) {
            return;
        }

        // Apply visibility and collapsed state
        Object.keys(layout.visibility).forEach((key) => {
            const card = panel.querySelector(`.graph-modular-card[data-card-id="${key}"]`);
            if (card) {
                card.style.display = layout.visibility[key] ? 'flex' : 'none';
                const isCollapsed = Boolean(layout.collapsed && layout.collapsed[key]);
                const body = card.querySelector('.graph-modular-card-body');
                const btnCollapse = card.querySelector('.btn-card-collapse');
                if (btnCollapse) {
                    if (!btnCollapse.querySelector('.hd-icon')) {
                        btnCollapse.innerHTML = '<i class="hd-icon hd-icon-chevrolt-arrow-bottom"></i>';
                    }
                    btnCollapse.title = isCollapsed
                        ? (window.i18n ? window.i18n.t('expandPanelTitle') : 'Expand panel')
                        : (window.i18n ? window.i18n.t('collapsePanelTitle') : 'Collapse panel');
                }
                if (isCollapsed) {
                    card.classList.add('is-collapsed');
                } else {
                    card.classList.remove('is-collapsed');
                }
            }
        });

        // Reorder DOM elements according to layout.order
        layout.order.forEach((key) => {
            const card = panel.querySelector(`.graph-modular-card[data-card-id="${key}"]`);
            if (card) {
                panel.appendChild(card);
            }
        });

        // Update up/down buttons disabled state based on visible order
        const visibleOrder = layout.order.filter((id) => layout.visibility[id] !== false);
        visibleOrder.forEach((id, idx) => {
            const card = panel.querySelector(`.graph-modular-card[data-card-id="${id}"]`);
            if (card) {
                const btnUp = card.querySelector('.btn-card-up');
                const btnDown = card.querySelector('.btn-card-down');
                if (btnUp) {
                    const isFirst = (idx === 0);
                    btnUp.disabled = isFirst;
                    btnUp.style.opacity = isFirst ? '0.25' : '1';
                    btnUp.style.cursor = isFirst ? 'default' : 'pointer';
                }
                if (btnDown) {
                    const isLast = (idx === visibleOrder.length - 1);
                    btnDown.disabled = isLast;
                    btnDown.style.opacity = isLast ? '0.25' : '1';
                    btnDown.style.cursor = isLast ? 'default' : 'pointer';
                }
            }
        });

        this.setupCardDragAndDrop();

        if (window.app && typeof window.app.updateWindowMenuItems === 'function') {
            window.app.updateWindowMenuItems();
        }

        setTimeout(() => {
            this.setupCanvas();
            this.redraw();
        }, 40);
    }

    closeSectionWithFlightAnimation(cardId) {
        const panel = this.container.querySelector('.graph-mode-panel');
        const card = panel ? panel.querySelector(`.graph-modular-card[data-card-id="${cardId}"]`) : null;
        const winBtn = document.getElementById('btn-window-menu');

        if (!card) {
            this.toggleSectionVisibility(cardId, false, false);
            return;
        }

        // If "Փեղկեր" button is not visible or in DOM, fall back to direct hide
        if (!winBtn || winBtn.offsetParent === null) {
            this.toggleSectionVisibility(cardId, false, false);
            return;
        }

        const cardRect = card.getBoundingClientRect();
        const btnRect = winBtn.getBoundingClientRect();

        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const targetCenterX = btnRect.left + btnRect.width / 2;
        const targetCenterY = btnRect.top + btnRect.height / 2;

        const deltaX = targetCenterX - cardCenterX;
        const deltaY = targetCenterY - cardCenterY;

        // Create flying clone ghost
        const ghost = document.createElement('div');
        ghost.className = 'shutter-flying-particle';
        ghost.style.left = `${cardRect.left}px`;
        ghost.style.top = `${cardRect.top}px`;
        ghost.style.width = `${cardRect.width}px`;
        ghost.style.height = `${cardRect.height}px`;

        ghost.innerHTML = card.innerHTML;
        document.body.appendChild(ghost);

        const flightDuration = 440;
        const cubicEasing = 'cubic-bezier(0.22, 1, 0.36, 1)';

        // Animate card out of layout smoothly with the same cubic curve
        card.style.transition = `max-height ${flightDuration}ms ${cubicEasing}, margin ${flightDuration}ms ${cubicEasing}, opacity 260ms ${cubicEasing}, padding ${flightDuration}ms ${cubicEasing}`;
        card.style.maxHeight = `${cardRect.height}px`;
        card.style.overflow = 'hidden';
        card.style.pointerEvents = 'none';

        // Force reflow
        void ghost.offsetWidth;
        void card.offsetHeight;

        requestAnimationFrame(() => {
            ghost.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.025)`;
            ghost.style.borderRadius = '50%';
            ghost.style.opacity = '0.15';
            ghost.style.background = 'var(--accent-blue, #0d99ff)';
            ghost.style.borderColor = '#00d2ff';
            ghost.style.boxShadow = '0 0 16px 4px rgba(13, 153, 255, 0.9), 0 0 6px #00d2ff';

            card.style.maxHeight = '0px';
            card.style.opacity = '0';
            card.style.marginTop = '0px';
            card.style.marginBottom = '0px';
            card.style.paddingTop = '0px';
            card.style.paddingBottom = '0px';
            card.style.borderWidth = '0px';
        });

        setTimeout(() => {
            ghost.remove();

            card.style.transition = '';
            card.style.maxHeight = '';
            card.style.opacity = '';
            card.style.marginTop = '';
            card.style.marginBottom = '';
            card.style.paddingTop = '';
            card.style.paddingBottom = '';
            card.style.borderWidth = '';
            card.style.overflow = '';
            card.style.pointerEvents = '';

            this.toggleSectionVisibility(cardId, false, false);

            winBtn.classList.remove('shutter-btn-pulse');
            void winBtn.offsetWidth;
            winBtn.classList.add('shutter-btn-pulse');
            setTimeout(() => {
                winBtn.classList.remove('shutter-btn-pulse');
            }, 650);
        }, flightDuration);
    }

    toggleSectionCollapse(cardId) {
        const panel = this.container.querySelector('.graph-mode-panel');
        const card = panel ? panel.querySelector(`.graph-modular-card[data-card-id="${cardId}"]`) : null;
        if (!card) {
            return;
        }

        const body = card.querySelector('.graph-modular-card-body');
        const layout = this.getSectionsLayout();
        layout.collapsed = layout.collapsed || {};
        const willCollapse = !layout.collapsed[cardId];
        layout.collapsed[cardId] = willCollapse;
        this.saveSectionsLayout(layout);

        const btnCollapse = card.querySelector('.btn-card-collapse');
        if (btnCollapse) {
            btnCollapse.title = willCollapse
                ? (window.i18n ? window.i18n.t('expandPanelTitle') : 'Expand panel')
                : (window.i18n ? window.i18n.t('collapsePanelTitle') : 'Collapse panel');
        }

        if (!body) {
            this.applySectionsLayout();
            return;
        }

        const cubicEasing = 'cubic-bezier(0.22, 1, 0.36, 1)';
        const duration = 340; // ms: identical duration and cubic bezier for both collapse and expand

        if (willCollapse) {
            // Collapsing with cubic easing
            const startHeight = body.scrollHeight;
            body.style.maxHeight = `${startHeight}px`;
            body.style.overflow = 'hidden';
            void body.offsetHeight; // force reflow

            body.style.transition = `max-height ${duration}ms ${cubicEasing}, opacity ${duration}ms ${cubicEasing}, padding-top ${duration}ms ${cubicEasing}, padding-bottom ${duration}ms ${cubicEasing}`;
            body.style.maxHeight = '0px';
            body.style.opacity = '0';
            body.style.paddingTop = '0px';
            body.style.paddingBottom = '0px';

            card.classList.add('is-collapsed');

            setTimeout(() => {
                body.style.transition = '';
                body.style.maxHeight = '';
                body.style.opacity = '';
                body.style.paddingTop = '';
                body.style.paddingBottom = '';
            }, duration + 20);
        } else {
            // Expanding with exact same cubic easing
            card.classList.remove('is-collapsed');
            body.style.display = 'block';
            body.style.maxHeight = 'none';
            body.style.opacity = '0';
            body.style.paddingTop = '';
            body.style.paddingBottom = '';
            const targetHeight = body.scrollHeight;

            body.style.maxHeight = '0px';
            body.style.overflow = 'hidden';
            void body.offsetHeight; // force reflow

            body.style.transition = `max-height ${duration}ms ${cubicEasing}, opacity ${duration}ms ${cubicEasing}, padding-top ${duration}ms ${cubicEasing}, padding-bottom ${duration}ms ${cubicEasing}`;
            body.style.maxHeight = `${targetHeight}px`;
            body.style.opacity = '1';

            setTimeout(() => {
                body.style.transition = '';
                body.style.maxHeight = '';
                body.style.opacity = '';
                body.style.overflow = '';
                if (cardId === 'canvas') {
                    this.setupCanvas();
                    this.redraw();
                }
            }, duration + 20);
        }

        if (window.app && typeof window.app.updateWindowMenuItems === 'function') {
            window.app.updateWindowMenuItems();
        }
    }

    setupCardDragAndDrop() {
        const panel = this.container.querySelector('.graph-mode-panel');
        if (!panel) {
            return;
        }
        const cards = panel.querySelectorAll('.graph-modular-card');

        cards.forEach((card) => {
            const dragHandle = card.querySelector('.card-drag-handle');
            const header = card.querySelector('.graph-modular-card-header');
            if (header) {
                header.removeAttribute('draggable');
            }
            if (dragHandle) {
                dragHandle.setAttribute('draggable', 'true');

                dragHandle.ondragstart = (e) => {
                    this.draggedCardId = card.dataset.cardId;
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', card.dataset.cardId);
                    card.classList.add('is-dragging');
                };

                dragHandle.ondragend = () => {
                    card.classList.remove('is-dragging');
                    cards.forEach((c) => c.classList.remove('drag-over-top', 'drag-over-bottom'));
                    this.draggedCardId = null;
                };
            }

            card.ondragover = (e) => {
                if (!this.draggedCardId || this.draggedCardId === card.dataset.cardId) {
                    return;
                }
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                const rect = card.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    card.classList.add('drag-over-top');
                    card.classList.remove('drag-over-bottom');
                } else {
                    card.classList.add('drag-over-bottom');
                    card.classList.remove('drag-over-top');
                }
            };

            card.ondragleave = () => {
                card.classList.remove('drag-over-top', 'drag-over-bottom');
            };

            card.ondrop = (e) => {
                if (!this.draggedCardId || this.draggedCardId === card.dataset.cardId) {
                    return;
                }
                e.preventDefault();
                const targetCardId = card.dataset.cardId;
                const rect = card.getBoundingClientRect();
                const placeBefore = (e.clientY < (rect.top + rect.height / 2));

                const layout = this.getSectionsLayout();
                const fromIdx = layout.order.indexOf(this.draggedCardId);
                if (fromIdx !== -1) {
                    layout.order.splice(fromIdx, 1);
                }
                let toIdx = layout.order.indexOf(targetCardId);
                if (toIdx !== -1) {
                    if (!placeBefore) {
                        toIdx++;
                    }
                    layout.order.splice(toIdx, 0, this.draggedCardId);
                } else {
                    layout.order.push(this.draggedCardId);
                }

                card.classList.remove('drag-over-top', 'drag-over-bottom');
                this.draggedCardId = null;

                this.saveSectionsLayout(layout);
                this.applySectionsLayout();
            };
        });
    }

    moveSection(cardId, direction) {
        const layout = this.getSectionsLayout();
        const visibleCards = layout.order.filter((id) => layout.visibility[id] !== false);
        const curVisIdx = visibleCards.indexOf(cardId);
        if (curVisIdx === -1) {
            return;
        }

        const targetVisIdx = curVisIdx + direction;
        if (targetVisIdx < 0 || targetVisIdx >= visibleCards.length) {
            return;
        }

        const targetCardId = visibleCards[targetVisIdx];
        const fromIdx = layout.order.indexOf(cardId);
        const toIdx = layout.order.indexOf(targetCardId);

        if (fromIdx === -1 || toIdx === -1) {
            return;
        }

        // Swap / move relative to target card in full layout.order
        layout.order.splice(fromIdx, 1);
        const insertIdx = layout.order.indexOf(targetCardId);
        if (direction > 0) {
            layout.order.splice(insertIdx + 1, 0, cardId);
        } else {
            layout.order.splice(insertIdx, 0, cardId);
        }

        this.saveSectionsLayout(layout);
        this.applySectionsLayout();
    }

    toggleSectionVisibility(cardId, isVisible, animated = true) {
        const panel = this.container.querySelector('.graph-mode-panel');
        const card = panel ? panel.querySelector(`.graph-modular-card[data-card-id="${cardId}"]`) : null;
        const layout = this.getSectionsLayout();

        layout.visibility[cardId] = Boolean(isVisible);
        this.saveSectionsLayout(layout);

        if (!card || !animated) {
            this.applySectionsLayout();
            if (cardId === 'canvas' && isVisible) {
                setTimeout(() => {
                    this.setupCanvas();
                    this.redraw();
                }, 60);
            }
            return;
        }

        const duration = 340;
        const cubicEasing = 'cubic-bezier(0.22, 1, 0.36, 1)';

        if (!isVisible) {
            // Smoothly collapse out of layout without any button animation
            const startHeight = card.offsetHeight;
            card.style.maxHeight = `${startHeight}px`;
            card.style.overflow = 'hidden';
            card.style.pointerEvents = 'none';
            void card.offsetHeight; // reflow

            card.style.transition = `max-height ${duration}ms ${cubicEasing}, opacity ${Math.round(duration * 0.75)}ms ${cubicEasing}, margin-top ${duration}ms ${cubicEasing}, margin-bottom ${duration}ms ${cubicEasing}, padding-top ${duration}ms ${cubicEasing}, padding-bottom ${duration}ms ${cubicEasing}, border-width ${duration}ms ${cubicEasing}, transform ${duration}ms ${cubicEasing}`;

            requestAnimationFrame(() => {
                card.style.maxHeight = '0px';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.97)';
                card.style.marginTop = '0px';
                card.style.marginBottom = '0px';
                card.style.paddingTop = '0px';
                card.style.paddingBottom = '0px';
                card.style.borderWidth = '0px';
            });

            setTimeout(() => {
                card.style.display = 'none';
                card.style.transition = '';
                card.style.maxHeight = '';
                card.style.opacity = '';
                card.style.transform = '';
                card.style.marginTop = '';
                card.style.marginBottom = '';
                card.style.paddingTop = '';
                card.style.paddingBottom = '';
                card.style.borderWidth = '';
                card.style.overflow = '';
                card.style.pointerEvents = '';
                this.applySectionsLayout();
            }, duration + 20);
        } else {
            // Smoothly reveal and expand back into layout
            card.style.display = 'flex';
            card.style.maxHeight = 'none';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.97)';
            card.style.pointerEvents = 'none';
            const targetHeight = card.offsetHeight || card.scrollHeight;

            card.style.maxHeight = '0px';
            card.style.overflow = 'hidden';
            void card.offsetHeight; // reflow

            card.style.transition = `max-height ${duration}ms ${cubicEasing}, opacity ${duration}ms ${cubicEasing}, transform ${duration}ms ${cubicEasing}`;

            requestAnimationFrame(() => {
                card.style.maxHeight = `${targetHeight}px`;
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            });

            setTimeout(() => {
                card.style.transition = '';
                card.style.maxHeight = '';
                card.style.opacity = '';
                card.style.transform = '';
                card.style.overflow = '';
                card.style.pointerEvents = '';
                this.applySectionsLayout();
                if (cardId === 'canvas') {
                    this.setupCanvas();
                    this.redraw();
                }
            }, duration + 20);
        }
    }

    resetSectionsLayout() {
        const defaultLayout = {
            order: ['curves', 'toolbar', 'canvas', 'points', 'presets'],
            visibility: {
                curves: true,
                toolbar: true,
                canvas: true,
                points: true,
                presets: true
            },
            collapsed: {}
        };
        this.saveSectionsLayout(defaultLayout);
        this.applySectionsLayout();
        setTimeout(() => {
            this.setupCanvas();
            this.redraw();
        }, 60);
    }

    // =========================================
    // Confirmation Dialog Modal Helper
    // =========================================
    showConfirmModal({ title, message, confirmText, cancelText, onConfirm }) {
        const overlay = document.getElementById('app-modal-overlay');
        const titleEl = document.getElementById('app-modal-title');
        const msgEl = document.getElementById('app-modal-message');
        const btnConfirm = document.getElementById('app-modal-confirm');
        const btnCancel = document.getElementById('app-modal-cancel');
        const btnClose = document.getElementById('app-modal-close');

        if (!overlay) {
            if (window.confirm(message || 'Are you sure?')) {
                if (typeof onConfirm === 'function') {
                    onConfirm();
                }
            }
            return;
        }

        titleEl.textContent = title || (window.i18n ? window.i18n.t('confirmDeletePresetTitle') : 'Confirm');
        msgEl.textContent = message || '';
        btnConfirm.textContent = confirmText || (window.i18n ? window.i18n.t('confirmDeleteBtn') : 'Delete');
        btnCancel.textContent = cancelText || (window.i18n ? window.i18n.t('cancelBtn') : 'Cancel');

        const closeModal = () => {
            overlay.classList.remove('is-open');
            setTimeout(() => {
                if (!overlay.classList.contains('is-open')) {
                    overlay.style.display = 'none';
                }
            }, 240);
            btnConfirm.onclick = null;
            btnCancel.onclick = null;
            btnClose.onclick = null;
        };

        btnConfirm.onclick = () => {
            closeModal();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        };

        btnCancel.onclick = closeModal;
        btnClose.onclick = closeModal;
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        };

        overlay.style.display = 'flex';
        void overlay.offsetWidth;
        overlay.classList.add('is-open');
    }

    // =========================================
    // Preset Folders & Custom Presets Management
    // =========================================
    getCustomFolders() {
        try {
            const raw = localStorage.getItem('vf_custom_graph_folders');
            const list = raw ? JSON.parse(raw) : [];
            const genName = window.i18n ? window.i18n.t('folderGeneral') : 'General';
            if (!list.some((f) => f.id === 'general')) {
                list.unshift({ id: 'general', name: genName });
            }
            return list;
        } catch (e) {
            return [{ id: 'general', name: 'General' }];
        }
    }

    saveCustomFolders(list) {
        try {
            localStorage.setItem('vf_custom_graph_folders', JSON.stringify(list));
        } catch (e) {}
    }

    getCollapsedFolders() {
        try {
            const raw = localStorage.getItem('vf_collapsed_folders');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveCollapsedFolders(list) {
        try {
            localStorage.setItem('vf_collapsed_folders', JSON.stringify(list));
        } catch (e) {}
    }

    toggleFolderCollapse(folderId) {
        const list = this.getCollapsedFolders();
        const idx = list.indexOf(folderId);
        if (idx !== -1) {
            list.splice(idx, 1);
        } else {
            list.push(folderId);
        }
        this.saveCollapsedFolders(list);
        this.renderCustomPresets();
    }

    createCustomFolder(name) {
        const clean = (name || '').trim();
        if (!clean) {
            return null;
        }
        const list = this.getCustomFolders();
        const existing = list.find((f) => f.name.toLowerCase() === clean.toLowerCase());
        if (existing) {
            return existing;
        }

        const newFolder = {
            id: 'folder_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
            name: clean,
            createdAt: Date.now()
        };
        list.push(newFolder);
        this.saveCustomFolders(list);
        this.renderCustomPresets();
        return newFolder;
    }

    deleteCustomFolder(folderId) {
        if (folderId === 'general') {
            return;
        }
        const folders = this.getCustomFolders();
        const folder = folders.find((f) => f.id === folderId);
        if (!folder) {
            return;
        }

        this.showConfirmModal({
            title: window.i18n ? window.i18n.t('confirmDeleteFolderTitle') : 'Delete Folder',
            message: window.i18n ? window.i18n.t('confirmDeleteFolderMsg', { name: folder.name }) : `Are you sure you want to delete folder "${folder.name}"?`,
            confirmText: window.i18n ? window.i18n.t('confirmDeleteBtn') : 'Delete',
            onConfirm: () => {
                const presets = this.getCustomPresets();
                presets.forEach((p) => {
                    if (p.folderId === folderId) {
                        p.folderId = 'general';
                    }
                });
                this.saveCustomPresetsList(presets);

                const updatedFolders = folders.filter((f) => f.id !== folderId);
                this.saveCustomFolders(updatedFolders);
                if (this.activeFolderFilter === folderId) {
                    this.activeFolderFilter = 'all';
                }
                this.renderCustomPresets();
            }
        });
    }

    getCustomPresets() {
        try {
            const raw = localStorage.getItem('vf_custom_graph_presets');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveCustomPresetsList(list) {
        try {
            localStorage.setItem('vf_custom_graph_presets', JSON.stringify(list));
        } catch (e) {}
    }

    showPresetCreateForm() {
        const form = this.container.querySelector('#preset-create-form');
        const input = this.container.querySelector('#preset-name-input');
        const folderSel = this.container.querySelector('#preset-folder-select');
        if (!form || !input) {
            return;
        }

        form.style.display = 'flex';
        const defaultName = (window.i18n ? window.i18n.t('defaultPresetName') : 'My Curve') + ' ' + (this.getCustomPresets().length + 1);
        input.value = defaultName;

        // Populate folder select dropdown
        if (folderSel) {
            folderSel.innerHTML = '';
            const folders = this.getCustomFolders();
            folders.forEach((f) => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = f.name;
                if (this.activeFolderFilter === f.id) {
                    opt.selected = true;
                }
                folderSel.appendChild(opt);
            });
        }

        input.focus();
        input.select();
    }

    hidePresetCreateForm() {
        const form = this.container.querySelector('#preset-create-form');
        const input = this.container.querySelector('#preset-name-input');
        if (form) {
            form.style.display = 'none';
        }
        if (input) {
            input.value = '';
        }
    }

    saveCurrentAsPreset(customName, optFolderId) {
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }

        const name = (customName || '').trim() || ((window.i18n ? window.i18n.t('defaultPresetName') : 'My Curve') + ' ' + (this.getCustomPresets().length + 1));
        const folderSel = this.container.querySelector('#preset-folder-select');
        const chosenFolder = optFolderId || (folderSel ? folderSel.value : 'general') || 'general';

        const list = this.getCustomPresets();
        const newPreset = {
            id: 'cp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
            name: name,
            folderId: chosenFolder,
            points: JSON.parse(JSON.stringify(cur.points)),
            createdAt: Date.now()
        };

        list.push(newPreset);
        this.saveCustomPresetsList(list);
        this.hidePresetCreateForm();
        this.renderCustomPresets();
    }

    applyCustomPreset(presetId) {
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }
        const list = this.getCustomPresets();
        const found = list.find((p) => p.id === presetId);
        if (!found) {
            return;
        }

        this.recordHistoryState();
        cur.points = JSON.parse(JSON.stringify(found.points));
        cur.preset = 'custom_' + found.id;
        cur.selectedPointIdx = 0;
        this.ensurePointHandles(cur);
        this.markCurveDirty(cur);
        this.renderPointChips();
        this.syncPointInspector();
        this.redraw();
        this.emitDistribution();
        this.renderCustomPresets();
    }

    deleteCustomPreset(presetId) {
        const list = this.getCustomPresets();
        const preset = list.find((p) => p.id === presetId);
        if (!preset) {
            return;
        }

        this.showConfirmModal({
            title: window.i18n ? window.i18n.t('confirmDeletePresetTitle') : 'Delete Preset',
            message: window.i18n ? window.i18n.t('confirmDeletePresetMsg', { name: preset.name }) : `Are you sure you want to delete preset "${preset.name}"?`,
            confirmText: window.i18n ? window.i18n.t('confirmDeleteBtn') : 'Delete',
            onConfirm: () => {
                const updated = list.filter((p) => p.id !== presetId);
                this.saveCustomPresetsList(updated);
                this.renderCustomPresets();
            }
        });
    }

    deleteAllPresets() {
        const customPresets = this.getCustomPresets();
        const deletedBuiltIns = this.getDeletedBuiltInPresets();
        const allBuiltInsCount = DEFAULT_PRESETS_DATA.length;

        // If there are no custom presets and all built-in presets are already deleted, nothing to delete
        if ((!customPresets || customPresets.length === 0) && (deletedBuiltIns.length >= allBuiltInsCount)) {
            return;
        }

        this.showConfirmModal({
            title: window.i18n ? window.i18n.t('confirmDeleteAllPresetsTitle') : 'Delete All Presets',
            message: window.i18n ? window.i18n.t('confirmDeleteAllPresetsMsg') : 'Are you sure you want to delete all presets? This action cannot be undone.',
            confirmText: window.i18n ? window.i18n.t('confirmDeleteBtn') : 'Delete All',
            onConfirm: () => {
                // Clear custom presets
                this.saveCustomPresetsList([]);

                // Mark all built-ins as deleted
                const allBuiltInIds = DEFAULT_PRESETS_DATA.map((p) => p.id);
                this.saveDeletedBuiltInPresets(allBuiltInIds);

                // Reset active curve preset state
                const cur = this.getActiveCurve();
                if (cur) {
                    cur.preset = 'custom';
                }

                this.renderCustomPresets();
            }
        });
    }

    downloadJSON(data, filename) {
        try {
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'variable-font-presets.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error('Error downloading presets JSON', err);
        }
    }

    exportPresetsJSON() {
        const list = this.getCustomPresets();
        const cur = this.getActiveCurve();
        let exportList = list;

        if (!list || list.length === 0) {
            exportList = [{
                id: 'preset_' + Date.now().toString(36),
                name: (window.i18n ? window.i18n.t('defaultPresetName') : 'My Curve'),
                folderId: 'general',
                points: cur ? JSON.parse(JSON.stringify(cur.points)) : [],
                createdAt: Date.now()
            }];
        }

        this.downloadJSON(exportList, 'variable-font-presets.json');
    }

    importPresetsJSON(file) {
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                const items = Array.isArray(parsed) ? parsed : [parsed];
                const valid = [];

                items.forEach((item) => {
                    if (item && item.name && Array.isArray(item.points) && item.points.length >= 2) {
                        valid.push({
                            id: 'cp_' + Math.random().toString(36).substr(2, 6) + '_' + Date.now().toString(36),
                            name: String(item.name).trim().substring(0, 30),
                            folderId: item.folderId || 'general',
                            points: JSON.parse(JSON.stringify(item.points)),
                            createdAt: item.createdAt || Date.now()
                        });
                    }
                });

                if (valid.length === 0) {
                    alert(window.i18n ? window.i18n.t('presetsImportError') : 'Invalid presets JSON format');
                    return;
                }

                const current = this.getCustomPresets();
                const merged = [...current, ...valid];
                this.saveCustomPresetsList(merged);
                this.renderCustomPresets();

                if (valid.length > 0) {
                    this.applyCustomPreset(valid[0].id);
                }
            } catch (err) {
                console.error('Failed to parse imported presets JSON', err);
                alert(window.i18n ? window.i18n.t('presetsImportError') : 'Invalid presets JSON file');
            }
        };
        reader.readAsText(file);
    }

    renderCustomPresets() {
        const chipsListEl = this.container.querySelector('#folders-chips-list');
        const presetsListEl = this.container.querySelector('#custom-presets-list');
        const i18n = window.i18n;

        // 1. Render Folder Filter Navigation Bar
        if (chipsListEl) {
            chipsListEl.innerHTML = '';
            const allChip = document.createElement('button');
            allChip.type = 'button';
            allChip.className = `folder-chip ${this.activeFolderFilter === 'all' ? 'active' : ''}`;
            allChip.textContent = i18n ? i18n.t('allFolders') : 'All';
            allChip.addEventListener('click', () => {
                this.activeFolderFilter = 'all';
                this.renderCustomPresets();
            });
            chipsListEl.appendChild(allChip);

            const builtInChip = document.createElement('button');
            builtInChip.type = 'button';
            builtInChip.className = `folder-chip ${this.activeFolderFilter === 'builtin' ? 'active' : ''}`;
            builtInChip.innerHTML = `${FOLDER_ICON_SVG} ${i18n ? i18n.t('folderBuiltIn') : 'Basic'}`;
            builtInChip.addEventListener('click', () => {
                this.activeFolderFilter = 'builtin';
                this.renderCustomPresets();
            });
            chipsListEl.appendChild(builtInChip);

            const shapesChip = document.createElement('button');
            shapesChip.type = 'button';
            shapesChip.className = `folder-chip ${this.activeFolderFilter === 'shapes' ? 'active' : ''}`;
            shapesChip.innerHTML = `${FOLDER_ICON_SVG} ${i18n ? i18n.t('folderShapes') : 'Curves'}`;
            shapesChip.addEventListener('click', () => {
                this.activeFolderFilter = 'shapes';
                this.renderCustomPresets();
            });
            chipsListEl.appendChild(shapesChip);

            const dynamicsChip = document.createElement('button');
            dynamicsChip.type = 'button';
            dynamicsChip.className = `folder-chip ${this.activeFolderFilter === 'dynamics' ? 'active' : ''}`;
            dynamicsChip.innerHTML = `${FOLDER_ICON_SVG} ${i18n ? i18n.t('folderDynamics') : 'Dynamics'}`;
            dynamicsChip.addEventListener('click', () => {
                this.activeFolderFilter = 'dynamics';
                this.renderCustomPresets();
            });
            chipsListEl.appendChild(dynamicsChip);

            // Custom folders
            const customFolders = this.getCustomFolders();
            customFolders.forEach((f) => {
                const fChip = document.createElement('button');
                fChip.type = 'button';
                fChip.className = `folder-chip ${this.activeFolderFilter === f.id ? 'active' : ''}`;
                fChip.innerHTML = `${FOLDER_ICON_SVG} ${f.name}`;
                fChip.addEventListener('click', () => {
                    this.activeFolderFilter = f.id;
                    this.renderCustomPresets();
                });
                chipsListEl.appendChild(fChip);
            });
        }

        // 2. Render All Presets (Built-in + Custom) Grouped by Folders
        if (presetsListEl) {
            presetsListEl.innerHTML = '';
            const cur = this.getActiveCurve();
            const deletedBuiltIns = this.getDeletedBuiltInPresets();
            const customPresets = this.getCustomPresets();
            const customFolders = this.getCustomFolders();
            const collapsedFolders = this.getCollapsedFolders();

            const builtInFolders = [
                { id: 'builtin', name: i18n ? i18n.t('folderBuiltIn') : 'Basic' },
                { id: 'shapes', name: i18n ? i18n.t('folderShapes') : 'Curves' },
                { id: 'dynamics', name: i18n ? i18n.t('folderDynamics') : 'Dynamics' }
            ];

            // Render Built-in folders if active filter matches
            builtInFolders.forEach((folder) => {
                if (this.activeFolderFilter !== 'all' && this.activeFolderFilter !== folder.id) {
                    return;
                }

                const isCollapsed = collapsedFolders.includes(folder.id);
                const availablePresets = DEFAULT_PRESETS_DATA.filter((p) => p.folder === folder.id && !deletedBuiltIns.includes(p.id));

                const groupEl = document.createElement('div');
                groupEl.className = `custom-folder-group ${isCollapsed ? 'is-collapsed' : ''}`;

                const headerEl = document.createElement('div');
                headerEl.className = 'custom-folder-group-header';

                const headerLeftEl = document.createElement('div');
                headerLeftEl.className = 'custom-folder-header-left';

                const btnCollapseFolder = document.createElement('button');
                btnCollapseFolder.type = 'button';
                btnCollapseFolder.className = 'btn-folder-collapse';
                btnCollapseFolder.innerHTML = isCollapsed ? '<i class="hd-icon hd-icon-chevrolt-arrow-right"></i>' : '<i class="hd-icon hd-icon-chevrolt-arrow-bottom"></i>';
                btnCollapseFolder.title = isCollapsed
                    ? (i18n ? i18n.t('expandFolderTitle') : 'Expand folder')
                    : (i18n ? i18n.t('collapseFolderTitle') : 'Collapse folder');
                btnCollapseFolder.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFolderCollapse(folder.id);
                });

                const titleEl = document.createElement('span');
                titleEl.className = 'custom-folder-group-title';
                titleEl.innerHTML = `${FOLDER_ICON_SVG} ${folder.name} (${availablePresets.length})`;
                titleEl.style.cursor = 'pointer';
                titleEl.title = isCollapsed
                    ? (i18n ? i18n.t('expandFolderTitle') : 'Expand folder')
                    : (i18n ? i18n.t('collapseFolderTitle') : 'Collapse folder');
                titleEl.addEventListener('click', () => {
                    this.toggleFolderCollapse(folder.id);
                });

                headerLeftEl.appendChild(btnCollapseFolder);
                headerLeftEl.appendChild(titleEl);
                headerEl.appendChild(headerLeftEl);
                groupEl.appendChild(headerEl);

                const itemsListEl = document.createElement('div');
                itemsListEl.className = 'custom-folder-items-list';

                if (availablePresets.length === 0) {
                    const emptyEl = document.createElement('span');
                    emptyEl.className = 'no-custom-presets-hint';
                    emptyEl.textContent = i18n ? i18n.t('noCustomPresets') : 'No presets in this folder';
                    itemsListEl.appendChild(emptyEl);
                } else {
                    availablePresets.forEach((p) => {
                        const item = document.createElement('div');
                        const isActive = cur && cur.preset === p.id;
                        item.className = `custom-preset-chip ${isActive ? 'active' : ''}`;

                        const btnApply = document.createElement('button');
                        btnApply.type = 'button';
                        btnApply.className = 'btn-apply-custom-preset';
                        const pName = i18n ? i18n.t(p.i18nKey) : p.defaultName;
                        btnApply.textContent = pName;
                        btnApply.title = pName;
                        btnApply.addEventListener('click', () => {
                            this.applyPreset(p.id);
                        });

                        const btnDel = document.createElement('button');
                        btnDel.type = 'button';
                        btnDel.className = 'btn-del-custom-preset';
                        btnDel.innerHTML = '<i class="hd-icon hd-icon-close"></i>';
                        btnDel.title = i18n ? i18n.t('deletePresetTitle') : 'Delete this preset';
                        btnDel.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.deleteBuiltInPreset(p.id);
                        });

                        item.appendChild(btnApply);
                        item.appendChild(btnDel);
                        itemsListEl.appendChild(item);
                    });
                }

                groupEl.appendChild(itemsListEl);
                presetsListEl.appendChild(groupEl);
            });

            // Render Custom folders if active filter matches
            const targetCustomFolders = this.activeFolderFilter === 'all'
                ? customFolders
                : customFolders.filter((f) => f.id === this.activeFolderFilter);

            targetCustomFolders.forEach((folder) => {
                const isCollapsed = collapsedFolders.includes(folder.id);
                const folderPresets = customPresets.filter((p) => (p.folderId || 'general') === folder.id);

                const groupEl = document.createElement('div');
                groupEl.className = `custom-folder-group ${isCollapsed ? 'is-collapsed' : ''}`;
                groupEl.dataset.dropFolder = folder.id;

                const headerEl = document.createElement('div');
                headerEl.className = 'custom-folder-group-header';

                const headerLeftEl = document.createElement('div');
                headerLeftEl.className = 'custom-folder-header-left';

                const btnCollapseFolder = document.createElement('button');
                btnCollapseFolder.type = 'button';
                btnCollapseFolder.className = 'btn-folder-collapse';
                btnCollapseFolder.innerHTML = isCollapsed ? '<i class="hd-icon hd-icon-chevrolt-arrow-right"></i>' : '<i class="hd-icon hd-icon-chevrolt-arrow-bottom"></i>';
                btnCollapseFolder.title = isCollapsed
                    ? (i18n ? i18n.t('expandFolderTitle') : 'Expand folder')
                    : (i18n ? i18n.t('collapseFolderTitle') : 'Collapse folder');
                btnCollapseFolder.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFolderCollapse(folder.id);
                });

                const titleEl = document.createElement('span');
                titleEl.className = 'custom-folder-group-title';
                titleEl.innerHTML = `${FOLDER_ICON_SVG} ${folder.name} (${folderPresets.length})`;
                titleEl.style.cursor = 'pointer';
                titleEl.title = isCollapsed
                    ? (i18n ? i18n.t('expandFolderTitle') : 'Expand folder')
                    : (i18n ? i18n.t('collapseFolderTitle') : 'Collapse folder');
                titleEl.addEventListener('click', () => {
                    this.toggleFolderCollapse(folder.id);
                });

                headerLeftEl.appendChild(btnCollapseFolder);
                headerLeftEl.appendChild(titleEl);
                headerEl.appendChild(headerLeftEl);

                // If user folder and not 'general', allow deleting folder
                if (folder.id !== 'general') {
                    const btnDelFolder = document.createElement('button');
                    btnDelFolder.type = 'button';
                    btnDelFolder.className = 'btn-del-folder';
                    btnDelFolder.innerHTML = '<i class="hd-icon hd-icon-close"></i>';
                    btnDelFolder.title = i18n ? i18n.t('deleteFolderTitle') : 'Delete folder';
                    btnDelFolder.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteCustomFolder(folder.id);
                    });
                    headerEl.appendChild(btnDelFolder);
                }

                groupEl.appendChild(headerEl);

                const itemsListEl = document.createElement('div');
                itemsListEl.className = 'custom-folder-items-list';

                if (folderPresets.length === 0) {
                    const emptyEl = document.createElement('span');
                    emptyEl.className = 'no-custom-presets-hint';
                    emptyEl.textContent = i18n ? i18n.t('noCustomPresets') : 'No presets in this folder';
                    itemsListEl.appendChild(emptyEl);
                } else {
                    folderPresets.forEach((p) => {
                        const item = document.createElement('div');
                        const isActive = cur && cur.preset === ('custom_' + p.id);
                        item.className = `custom-preset-chip ${isActive ? 'active' : ''}`;
                        item.dataset.presetId = p.id;

                        const btnApply = document.createElement('button');
                        btnApply.type = 'button';
                        btnApply.className = 'btn-apply-custom-preset';
                        btnApply.textContent = p.name;
                        btnApply.title = p.name;
                        btnApply.addEventListener('click', () => {
                            this.applyCustomPreset(p.id);
                        });

                        const btnDel = document.createElement('button');
                        btnDel.type = 'button';
                        btnDel.className = 'btn-del-custom-preset';
                        btnDel.innerHTML = '<i class="hd-icon hd-icon-close"></i>';
                        btnDel.title = i18n ? i18n.t('deletePresetTitle') : 'Delete this preset';
                        btnDel.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.deleteCustomPreset(p.id);
                        });

                        item.appendChild(btnApply);
                        item.appendChild(btnDel);
                        itemsListEl.appendChild(item);
                    });
                }

                groupEl.appendChild(itemsListEl);
                presetsListEl.appendChild(groupEl);
            });
            this.setupPresetDragAndDrop(presetsListEl);
        }
    }

    setupPresetDragAndDrop(listEl) {
        const self = this;
        listEl.querySelectorAll('.custom-preset-chip[data-preset-id]').forEach((chip) => {
            chip.addEventListener('pointerdown', (e) => {
                if (e.button !== 0 || e.target.closest('.btn-del-custom-preset')) {
                    return;
                }
                const presetId = chip.dataset.presetId;
                const srcGroup = chip.closest('[data-drop-folder]');
                const srcFolder = srcGroup ? srcGroup.dataset.dropFolder : 'general';
                const startX = e.clientX;
                const startY = e.clientY;
                let dragging = false;
                let ghost = null;
                let originRect = null;
                let lastTarget = null;

                const findTarget = (x, y) => {
                    const els = document.elementsFromPoint(x, y);
                    for (let k = 0; k < els.length; k++) {
                        const g = els[k].closest ? els[k].closest('[data-drop-folder]') : null;
                        if (g && listEl.contains(g)) {
                            return g;
                        }
                    }
                    return null;
                };

                const clearHighlight = () => {
                    listEl.querySelectorAll('.is-drop-target').forEach((g) => g.classList.remove('is-drop-target'));
                };

                const onMove = (ev) => {
                    if (!dragging) {
                        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) {
                            return;
                        }
                        dragging = true;
                        originRect = chip.getBoundingClientRect();
                        ghost = chip.cloneNode(true);
                        ghost.classList.add('preset-drag-ghost');
                        ghost.style.cssText = `position:fixed;left:${originRect.left}px;top:${originRect.top}px;width:${originRect.width}px;height:${originRect.height}px;margin:0;z-index:10000;pointer-events:none;`;
                        document.body.appendChild(ghost);
                        chip.classList.add('is-drag-source');
                        listEl.classList.add('is-dragging-preset');
                    }
                    ev.preventDefault();
                    ghost.style.transform = `translate(${ev.clientX - startX}px, ${ev.clientY - startY}px) scale(1.06)`;
                    const target = findTarget(ev.clientX, ev.clientY);
                    if (target !== lastTarget) {
                        clearHighlight();
                        if (target && target.dataset.dropFolder !== srcFolder) {
                            target.classList.add('is-drop-target');
                        }
                        lastTarget = target;
                    }
                };

                const onUp = (ev) => {
                    document.removeEventListener('pointermove', onMove, true);
                    document.removeEventListener('pointerup', onUp, true);
                    document.removeEventListener('pointercancel', onUp, true);
                    if (!dragging) {
                        return;
                    }
                    // swallow the click that follows a drag
                    const swallow = (ce) => { ce.stopPropagation(); ce.preventDefault(); };
                    chip.addEventListener('click', swallow, { capture: true, once: true });
                    setTimeout(() => chip.removeEventListener('click', swallow, true), 0);

                    clearHighlight();
                    listEl.classList.remove('is-dragging-preset');
                    const target = findTarget(ev.clientX, ev.clientY);
                    const destFolder = target ? target.dataset.dropFolder : null;
                    const ghostRect = ghost.getBoundingClientRect();

                    if (destFolder && destFolder !== srcFolder) {
                        // FLIP: remember positions, move, re-render, animate from old positions
                        const before = {};
                        listEl.querySelectorAll('.custom-preset-chip[data-preset-id]').forEach((c) => {
                            before[c.dataset.presetId] = c.getBoundingClientRect();
                        });
                        const presets = self.getCustomPresets();
                        const p = presets.find((x) => String(x.id) === String(presetId));
                        if (p) {
                            p.folderId = destFolder;
                            self.saveCustomPresetsList(presets);
                        }
                        const collapsed = self.getCollapsedFolders();
                        const ci = collapsed.indexOf(destFolder);
                        if (ci !== -1) {
                            collapsed.splice(ci, 1);
                            self.saveCollapsedFolders(collapsed);
                        }
                        self.renderCustomPresets();
                        ghost.remove();
                        const newList = self.container.querySelector('#custom-presets-list');
                        if (newList) {
                            newList.querySelectorAll('.custom-preset-chip[data-preset-id]').forEach((c) => {
                                const id = c.dataset.presetId;
                                const nr = c.getBoundingClientRect();
                                const from = (String(id) === String(presetId)) ? ghostRect : before[id];
                                if (!from) {
                                    return;
                                }
                                const dx = from.left - nr.left;
                                const dy = from.top - nr.top;
                                if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                                    return;
                                }
                                c.animate(
                                    [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
                                    { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                                );
                            });
                        }
                    } else {
                        // Snap back smoothly
                        const dx = originRect.left - ghostRect.left;
                        const dy = originRect.top - ghostRect.top;
                        const anim = ghost.animate(
                            [{ transform: ghost.style.transform }, { transform: 'translate(0, 0) scale(1)' }],
                            { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                        );
                        anim.onfinish = () => {
                            ghost.remove();
                            chip.classList.remove('is-drag-source');
                        };
                    }
                };

                document.addEventListener('pointermove', onMove, true);
                document.addEventListener('pointerup', onUp, true);
                document.addEventListener('pointercancel', onUp, true);
            });
        });
    }
    getAxisRange(axisId) {
        if (this.availableAxes && this.availableAxes.length > 0) {
            const found = this.availableAxes.find((a) => a.id === axisId);
            if (found) {
                return { min: found.min, max: found.max };
            }
        }
        return { min: 0, max: 100 };
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

    isPointInPolygon(pt, polygon) {
        if (!polygon || polygon.length < 3) {
            return false;
        }
        let inside = false;
        const x = pt.x;
        const y = pt.y;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;
            const xj = polygon[j].x;
            const yj = polygon[j].y;
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    isPointInBox(pt, p1, p2) {
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        return pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
    }

    bindEvents() {
        // Modular Cards Controls (Up, Down, Close, Collapse): Robust delegated listener
        if (this._containerClickHandler) {
            this.container.removeEventListener('click', this._containerClickHandler);
            this._containerClickHandler = null;
        }
        this._containerClickHandler = (e) => {
            const btnCtrl = e.target.closest('.btn-card-ctrl');
            if (btnCtrl) {
                e.stopPropagation();
                e.preventDefault();
                const card = btnCtrl.closest('.graph-modular-card');
                const cardId = btnCtrl.dataset.card || (card ? card.dataset.cardId : null);
                const action = btnCtrl.dataset.action;
                if (!cardId || !action) {
                    return;
                }
                if (action === 'up') {
                    this.moveSection(cardId, -1);
                } else if (action === 'down') {
                    this.moveSection(cardId, 1);
                } else if (action === 'close') {
                    this.closeSectionWithFlightAnimation(cardId);
                } else if (action === 'collapse') {
                    this.toggleSectionCollapse(cardId);
                }
                return;
            }

            // Click card header to toggle collapse (except drag handle or interactive controls)
            const header = e.target.closest('.graph-modular-card-header');
            if (header && !e.target.closest('.card-drag-handle') && !e.target.closest('input') && !e.target.closest('select') && !e.target.closest('button')) {
                const card = header.closest('.graph-modular-card');
                if (card && card.dataset.cardId) {
                    this.toggleSectionCollapse(card.dataset.cardId);
                }
            }
        };
        this.container.addEventListener('click', this._containerClickHandler);

        // Folder Form Controls
        const btnNewFolder = this.container.querySelector('#btn-new-folder');
        const folderCreateForm = this.container.querySelector('#folder-create-form');
        const folderNameInput = this.container.querySelector('#folder-name-input');
        const btnFolderSave = this.container.querySelector('#btn-folder-save');
        const btnFolderCancel = this.container.querySelector('#btn-folder-cancel');

        if (btnNewFolder) {
            btnNewFolder.addEventListener('click', () => {
                if (folderCreateForm.style.display !== 'none') {
                    folderCreateForm.style.display = 'none';
                } else {
                    folderCreateForm.style.display = 'flex';
                    if (folderNameInput) {
                        folderNameInput.value = '';
                        folderNameInput.focus();
                    }
                }
            });
        }

        if (btnFolderSave && folderNameInput) {
            btnFolderSave.addEventListener('click', () => {
                const val = folderNameInput.value.trim();
                if (val) {
                    const newF = this.createCustomFolder(val);
                    if (newF) {
                        this.activeFolderFilter = newF.id;
                        this.renderCustomPresets();
                    }
                }
                if (folderCreateForm) {
                    folderCreateForm.style.display = 'none';
                }
            });
        }

        if (btnFolderCancel && folderCreateForm) {
            btnFolderCancel.addEventListener('click', () => {
                folderCreateForm.style.display = 'none';
            });
        }

        if (folderNameInput) {
            folderNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (btnFolderSave) {
                        btnFolderSave.click();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    if (folderCreateForm) {
                        folderCreateForm.style.display = 'none';
                    }
                }
            });
        }
        const axisSelect = this.container.querySelector('#graph-axis-select');
        const targetSelect = this.container.querySelector('#graph-target-select');
        const btnAdd = this.container.querySelector('#btn-add-curve');
        const addAxisSelect = this.container.querySelector('#add-curve-axis-select');
        const btnAddPoint = this.container.querySelector('#btn-add-point');
        const btnDelPoint = this.container.querySelector('#btn-delete-point');
        const btnToggleLink = this.container.querySelector('#btn-toggle-link-handles');
        const inpX = this.container.querySelector('#point-x-input');
        const inpY = this.container.querySelector('#point-y-input');

        const btnUndoPoint = this.container.querySelector('#btn-undo-point');
        const btnRedoPoint = this.container.querySelector('#btn-redo-point');

        // Preset Action Bar & Inline Creation Form Elements
        const btnCreatePreset = this.container.querySelector('#btn-create-preset');
        const btnExportPresets = this.container.querySelector('#btn-export-presets');
        const btnImportPresets = this.container.querySelector('#btn-import-presets');
        const btnDeleteAllPresets = this.container.querySelector('#btn-delete-all-presets');
        const importFileInput = this.container.querySelector('#import-presets-file-input');

        const presetCreateForm = this.container.querySelector('#preset-create-form');
        const presetNameInput = this.container.querySelector('#preset-name-input');
        const btnPresetSaveConfirm = this.container.querySelector('#btn-preset-save-confirm');
        const btnPresetCancel = this.container.querySelector('#btn-preset-cancel');

        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                const chosenAxis = addAxisSelect ? addAxisSelect.value : null;
                this.addCurve(chosenAxis);
            });
        }

        if (btnCreatePreset) {
            btnCreatePreset.addEventListener('click', () => {
                if (presetCreateForm && presetCreateForm.style.display !== 'none') {
                    this.hidePresetCreateForm();
                } else {
                    this.showPresetCreateForm();
                }
            });
        }

        if (btnPresetSaveConfirm) {
            btnPresetSaveConfirm.addEventListener('click', () => {
                const name = presetNameInput ? presetNameInput.value : '';
                this.saveCurrentAsPreset(name);
            });
        }

        if (btnPresetCancel) {
            btnPresetCancel.addEventListener('click', () => {
                this.hidePresetCreateForm();
            });
        }

        if (presetNameInput) {
            presetNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveCurrentAsPreset(presetNameInput.value);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.hidePresetCreateForm();
                }
            });
        }

        if (btnExportPresets) {
            btnExportPresets.addEventListener('click', () => {
                this.exportPresetsJSON();
            });
        }

        if (btnImportPresets && importFileInput) {
            btnImportPresets.addEventListener('click', () => {
                importFileInput.value = '';
                importFileInput.click();
            });

            importFileInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                    this.importPresetsJSON(file);
                }
            });
        }

        if (btnDeleteAllPresets) {
            btnDeleteAllPresets.addEventListener('click', () => {
                this.deleteAllPresets();
            });
        }

        if (btnAddPoint) {
            btnAddPoint.addEventListener('click', () => {
                this.addPointToActiveCurve();
            });
        }

        if (btnDelPoint) {
            btnDelPoint.addEventListener('click', () => {
                this.deleteSelectedPoint();
            });
        }

        if (btnToggleLink) {
            btnToggleLink.addEventListener('click', () => {
                const cur = this.getActiveCurve();
                if (!cur) {
                    return;
                }
                const idx = cur.selectedPointIdx != null ? cur.selectedPointIdx : 0;
                const pt = cur.points[idx];
                if (!pt) {
                    return;
                }

                this.recordHistoryState();
                const isStraight = Boolean((!pt.cpIn || pt.hasNoCpIn) && (!pt.cpOut || pt.hasNoCpOut));

                if (isStraight) {
                    this.ensurePointHandlesForIndex(cur, idx);
                    pt.brokenHandles = false;
                } else {
                    pt.brokenHandles = !pt.brokenHandles;
                    if (!pt.brokenHandles) {
                        // Symmetrize handles when relinking
                        if (pt.cpOut && pt.cpIn) {
                            const dx = pt.cpOut.x - pt.x;
                            const dy = pt.cpOut.y - pt.y;
                            const prevPt = cur.points[idx - 1];
                            pt.cpIn.x = Math.max(prevPt ? prevPt.x : 0, Math.min(pt.x, Math.round((pt.x - dx) * 1000) / 1000));
                            pt.cpIn.y = Math.max(0, Math.min(1, Math.round((pt.y - dy) * 1000) / 1000));
                        }
                    }
                }

                cur.preset = 'custom';
                this.markCurveDirty(cur);
                this.renderPointChips();
                this.syncPointInspector();
                this.redraw();
                this.emitDistribution();
            });
        }

        if (btnUndoPoint) {
            btnUndoPoint.addEventListener('click', () => {
                this.undo();
            });
        }

        if (btnRedoPoint) {
            btnRedoPoint.addEventListener('click', () => {
                this.redo();
            });
        }

        // Numeric Point coordinate inputs
        if (inpX) {
            inpX.addEventListener('change', (e) => {
                const cur = this.getActiveCurve();
                if (!cur) {
                    return;
                }
                const idx = cur.selectedPointIdx != null ? cur.selectedPointIdx : 0;
                const n = cur.points.length;
                if (idx >= 0 && idx < n) {
                    const minAllowed = (idx === 0) ? 0.0 : cur.points[idx - 1].x + 0.01;
                    const maxAllowed = (idx === n - 1) ? 1.0 : cur.points[idx + 1].x - 0.01;
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) {
                        val = cur.points[idx].x;
                    }
                    val = Math.max(minAllowed, Math.min(maxAllowed, val));

                    const oldX = cur.points[idx].x;
                    const dx = val - oldX;

                    // Move handles along with anchor
                    if (cur.points[idx].cpOut) {
                        cur.points[idx].cpOut.x = Math.max(val, Math.min(idx < n - 1 ? cur.points[idx + 1].x : 1, cur.points[idx].cpOut.x + dx));
                    }
                    if (cur.points[idx].cpIn) {
                        cur.points[idx].cpIn.x = Math.max(idx > 0 ? cur.points[idx - 1].x : 0, Math.min(val, cur.points[idx].cpIn.x + dx));
                    }

                    this.recordHistoryState();
                    cur.points[idx].x = Math.round(val * 1000) / 1000;
                    cur.preset = 'custom';
                    this.markCurveDirty(cur);
                    this.syncPointInspector();
                    this.redraw();
                    this.emitDistribution();
                }
            });
        }

        if (inpY) {
            inpY.addEventListener('change', (e) => {
                const cur = this.getActiveCurve();
                if (!cur) {
                    return;
                }
                const idx = cur.selectedPointIdx;
                if (idx >= 0 && idx < cur.points.length) {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) {
                        val = cur.points[idx].y;
                    }
                    val = Math.max(0, Math.min(1, val));
                    this.recordHistoryState();
                    cur.points[idx].y = Math.round(val * 100) / 100;
                    cur.preset = 'custom';
                    this.markCurveDirty(cur);
                    this.syncPointInspector();
                    this.redraw();
                    this.emitDistribution();
                }
            });
        }

        if (axisSelect) {
            axisSelect.addEventListener('change', (e) => {
                const cur = this.getActiveCurve();
                if (cur && e.target.value && e.target.value !== cur.axisId) {
                    this.reassignCurveAxis(cur.id, e.target.value);
                }
            });
        }

        if (targetSelect) {
            targetSelect.addEventListener('change', (e) => {
                this.distributionTarget = e.target.value;
                this.emitDistribution();
            });
        }

        // Presets for Active Curve
        this.container.querySelectorAll('.btn-curve-preset').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.btn-curve-preset').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyPreset(btn.dataset.preset);
            });
        });

        // Canvas coordinate helper
        const getCanvasCoord = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = rect.width > 0 ? this.width / rect.width : 1;
            const scaleY = rect.height > 0 ? this.height / rect.height : 1;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        let lastDownTime = 0;
        let lastDownPos = { x: 0, y: 0 };
        let lastProcessedDblTime = 0;

        // Unified Double-Click Handler: Handles handle knobs, anchor deletion, and adding new points cleanly
        const handleCanvasDoubleClick = (pos, e) => {
            const now = Date.now();
            if (now - lastProcessedDblTime < 350) {
                return true;
            }
            lastProcessedDblTime = now;
            const cur = this.getActiveCurve();
            if (!cur) {
                return false;
            }

            const n = cur.points.length;

            // 1. Check Bézier handle knobs first (Hit radius: 14px)
            for (let i = 0; i < n; i++) {
                const pt = cur.points[i];
                // Check cpOut
                if (i < n - 1 && pt.cpOut) {
                    const cpPix = this.normToPixel(pt.cpOut);
                    if (Math.hypot(pos.x - cpPix.x, pos.y - cpPix.y) <= 14) {
                        if (e && e.preventDefault) {
                            e.preventDefault();
                        }
                        this.recordHistoryState();
                        pt.brokenHandles = !pt.brokenHandles;

                        // If smoothed, mirror cpIn symmetrically
                        if (!pt.brokenHandles && i > 0 && pt.cpIn) {
                            const prevPt = cur.points[i - 1];
                            const dx = pt.cpOut.x - pt.x;
                            const dy = pt.cpOut.y - pt.y;
                            pt.cpIn.x = Math.max(prevPt ? prevPt.x : 0, Math.min(pt.x, Math.round((pt.x - dx) * 1000) / 1000));
                            pt.cpIn.y = Math.max(0, Math.min(1, Math.round((pt.y - dy) * 1000) / 1000));
                        }

                        cur.selectedPointIdx = i;
                        this.markCurveDirty(cur);
                        this.renderPointChips();
                        this.syncPointInspector();
                        this.redraw();
                        this.emitDistribution();
                        this.activeDrag = null;
                        return true;
                    }
                }
                // Check cpIn
                if (i > 0 && pt.cpIn) {
                    const cpPix = this.normToPixel(pt.cpIn);
                    if (Math.hypot(pos.x - cpPix.x, pos.y - cpPix.y) <= 14) {
                        if (e && e.preventDefault) {
                            e.preventDefault();
                        }
                        this.recordHistoryState();
                        pt.brokenHandles = !pt.brokenHandles;

                        // If smoothed, mirror cpOut symmetrically
                        if (!pt.brokenHandles && i < n - 1 && pt.cpOut) {
                            const nextPt = cur.points[i + 1];
                            const dx = pt.x - pt.cpIn.x;
                            const dy = pt.y - pt.cpIn.y;
                            pt.cpOut.x = Math.max(pt.x, Math.min(nextPt ? nextPt.x : 1, Math.round((pt.x + dx) * 1000) / 1000));
                            pt.cpOut.y = Math.max(0, Math.min(1, Math.round((pt.y + dy) * 1000) / 1000));
                        }

                        cur.selectedPointIdx = i;
                        this.markCurveDirty(cur);
                        this.renderPointChips();
                        this.syncPointInspector();
                        this.redraw();
                        this.emitDistribution();
                        this.activeDrag = null;
                        return true;
                    }
                }
            }

            // 2. Check Anchor Points (Hit radius: 14px)
            for (let i = 0; i < n; i++) {
                const pix = this.normToPixel(cur.points[i]);
                if (Math.hypot(pos.x - pix.x, pos.y - pix.y) <= 14) {
                    if (e && e.preventDefault) {
                        e.preventDefault();
                    }
                    if (i > 0 && i < n - 1) {
                        this.deletePointAt(i);
                    }
                    this.activeDrag = null;
                    return true;
                }
            }

            // 3. Empty Canvas -> Add new point at exact (X, Y)
            const normPos = this.pixelToNorm(pos);
            if (normPos.x >= 0.02 && normPos.x <= 0.98) {
                if (e && e.preventDefault) {
                    e.preventDefault();
                }
                const clampedY = Math.max(0, Math.min(1, normPos.y));
                this.addPointToActiveCurve(normPos.x, clampedY);
                this.dragStartState = this.getCurvePointsSnapshot(cur);
                this.activeDrag = { type: 'anchor', pointIdx: cur.selectedPointIdx };
                return true;
            }

            return false;
        };

        // Alt + Right-Click Handler: removes handles on knobs or nodes and converts into straight lines
        let lastAltRightTime = 0;
        const handleAltRightClick = (pos, e) => {
            const now = Date.now();
            if (now - lastAltRightTime < 300) {
                return true;
            }
            lastAltRightTime = now;
            if (e && e.preventDefault) {
                e.preventDefault();
            }

            const cur = this.getActiveCurve();
            if (!cur) {
                return false;
            }
            const n = cur.points.length;

            // 1. Check Bézier handle knobs first (Hit radius: 14px)
            for (let i = 0; i < n; i++) {
                const pt = cur.points[i];
                // Check cpOut
                if (i < n - 1 && pt.cpOut && !pt.hasNoCpOut) {
                    const cpPix = this.normToPixel(pt.cpOut);
                    if (Math.hypot(pos.x - cpPix.x, pos.y - cpPix.y) <= 14) {
                        this.recordHistoryState();
                        pt.cpOut = null;
                        pt.hasNoCpOut = true;
                        // Straighten adjacent incoming handle on this segment
                        const nextPt = cur.points[i + 1];
                        if (nextPt) {
                            nextPt.cpIn = null;
                            nextPt.hasNoCpIn = true;
                        }
                        cur.selectedPointIdx = i;
                        cur.preset = 'custom';
                        this.markCurveDirty(cur);
                        this.renderPointChips();
                        this.syncPointInspector();
                        this.redraw();
                        this.emitDistribution();
                        this.activeDrag = null;
                        return true;
                    }
                }
                // Check cpIn
                if (i > 0 && pt.cpIn && !pt.hasNoCpIn) {
                    const cpPix = this.normToPixel(pt.cpIn);
                    if (Math.hypot(pos.x - cpPix.x, pos.y - cpPix.y) <= 14) {
                        this.recordHistoryState();
                        pt.cpIn = null;
                        pt.hasNoCpIn = true;
                        // Straighten adjacent outgoing handle on this segment
                        const prevPt = cur.points[i - 1];
                        if (prevPt) {
                            prevPt.cpOut = null;
                            prevPt.hasNoCpOut = true;
                        }
                        cur.selectedPointIdx = i;
                        cur.preset = 'custom';
                        this.markCurveDirty(cur);
                        this.renderPointChips();
                        this.syncPointInspector();
                        this.redraw();
                        this.emitDistribution();
                        this.activeDrag = null;
                        return true;
                    }
                }
            }

            // 2. Check Anchor Points / Nodes (Hit radius: 14px)
            for (let i = 0; i < n; i++) {
                const pt = cur.points[i];
                const pix = this.normToPixel(pt);
                if (Math.hypot(pos.x - pix.x, pos.y - pix.y) <= 14) {
                    this.recordHistoryState();

                    const isCurrentlyStraight = (!pt.cpIn || pt.hasNoCpIn) && (!pt.cpOut || pt.hasNoCpOut);
                    if (isCurrentlyStraight) {
                        // Toggle back to smooth handles
                        this.ensurePointHandlesForIndex(cur, i);
                    } else {
                        // Remove all handles from this node and make connected lines straight!
                        pt.cpIn = null;
                        pt.cpOut = null;
                        pt.hasNoCpIn = true;
                        pt.hasNoCpOut = true;
                        pt.straight = true;
                        pt.brokenHandles = false;

                        // Also straighten adjacent handles on the connecting segments
                        if (i > 0 && cur.points[i - 1]) {
                            cur.points[i - 1].cpOut = null;
                            cur.points[i - 1].hasNoCpOut = true;
                        }
                        if (i < n - 1 && cur.points[i + 1]) {
                            cur.points[i + 1].cpIn = null;
                            cur.points[i + 1].hasNoCpIn = true;
                        }
                    }

                    cur.selectedPointIdx = i;
                    cur.preset = 'custom';
                    this.markCurveDirty(cur);
                    this.renderPointChips();
                    this.syncPointInspector();
                    this.redraw();
                    this.emitDistribution();
                    this.activeDrag = null;
                    return true;
                }
            }

            return false;
        };

        // Pointer Down: handle knobs, anchor selection/drag, double-click add/remove/break, and Alt+Right-click straight
        const onDown = (e) => {
            const pos = getCanvasCoord(e);
            const cur = this.getActiveCurve();
            if (!cur) {
                return;
            }

            // Alt + Right-Click: remove handles and turn into straight lines
            if (e.altKey && (e.button === 2 || e.buttons === 2)) {
                if (handleAltRightClick(pos, e)) {
                    return;
                }
            }

            const now = Date.now();
            const isDbl = (now - lastDownTime < 420 && Math.hypot(pos.x - lastDownPos.x, pos.y - lastDownPos.y) < 18);
            lastDownTime = now;
            lastDownPos = pos;

            if (isDbl) {
                if (handleCanvasDoubleClick(pos, e)) {
                    return;
                }
            }

            // 1. Check if clicked near any Bézier handle knob (cpOut / cpIn) of active curve (hit radius: 12px)
            const n = cur.points.length;
            const normPos = this.pixelToNorm(pos);
            this.dragStartNormPos = normPos;
            this.dragStartPoints = JSON.parse(JSON.stringify(cur.points));
            this.shiftOrthoLock = null;

            for (let i = 0; i < n; i++) {
                const pt = cur.points[i];
                if (i < n - 1 && pt.cpOut && !pt.hasNoCpOut) {
                    const cpPix = this.normToPixel(pt.cpOut);
                    if (Math.hypot(pos.x - cpPix.x, pos.y - cpPix.y) <= 12) {
                        const itemKey = 'cpOut_' + i;
                        if (!e.shiftKey && !this.selectedItems.has(itemKey)) {
                            this.selectedItems = new Set([itemKey]);
                        } else if (e.shiftKey) {
                            if (this.selectedItems.has(itemKey)) this.selectedItems.delete(itemKey);
                            else this.selectedItems.add(itemKey);
                        }
                        this.dragStartState = this.getCurvePointsSnapshot(cur);
                        if (e.altKey && !pt.brokenHandles) {
                            this.recordHistoryState();
                            pt.brokenHandles = true;
                        }
                        this.activeDrag = { type: 'cpOut', pointIdx: i };
                        cur.selectedPointIdx = i;
                        this.renderPointChips();
                        this.syncPointInspector();
                        this.redraw();
                        e.preventDefault();
                        if (this.canvas.setPointerCapture && e.pointerId !== undefined) {
                            try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
                        }
                        return;
                    }
                }
                if (i > 0 && pt.cpIn && !pt.hasNoCpIn) {
                    const cpPix = this.normToPixel(pt.cpIn);
                    if (Math.hypot(pos.x - cpPix.x, pos.y - cpPix.y) <= 12) {
                        const itemKey = 'cpIn_' + i;
                        if (!e.shiftKey && !this.selectedItems.has(itemKey)) {
                            this.selectedItems = new Set([itemKey]);
                        } else if (e.shiftKey) {
                            if (this.selectedItems.has(itemKey)) this.selectedItems.delete(itemKey);
                            else this.selectedItems.add(itemKey);
                        }
                        this.dragStartState = this.getCurvePointsSnapshot(cur);
                        if (e.altKey && !pt.brokenHandles) {
                            this.recordHistoryState();
                            pt.brokenHandles = true;
                        }
                        this.activeDrag = { type: 'cpIn', pointIdx: i };
                        cur.selectedPointIdx = i;
                        this.renderPointChips();
                        this.syncPointInspector();
                        this.redraw();
                        e.preventDefault();
                        if (this.canvas.setPointerCapture && e.pointerId !== undefined) {
                            try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
                        }
                        return;
                    }
                }
            }

            // 2. Check if clicked near any anchor point of active curve (hit radius: 14px)
            let clickedPointIdx = -1;
            for (let i = 0; i < cur.points.length; i++) {
                const pix = this.normToPixel(cur.points[i]);
                if (Math.hypot(pos.x - pix.x, pos.y - pix.y) <= 14) {
                    clickedPointIdx = i;
                    break;
                }
            }

            if (clickedPointIdx >= 0) {
                const itemKey = 'anchor_' + clickedPointIdx;
                if (!e.shiftKey && !this.selectedItems.has(itemKey)) {
                    this.selectedItems = new Set([itemKey]);
                } else if (e.shiftKey) {
                    if (this.selectedItems.has(itemKey)) this.selectedItems.delete(itemKey);
                    else this.selectedItems.add(itemKey);
                }
                this.dragStartState = this.getCurvePointsSnapshot(cur);
                cur.selectedPointIdx = clickedPointIdx;
                this.activeDrag = { type: 'anchor', pointIdx: clickedPointIdx };
                this.renderPointChips();
                this.syncPointInspector();
                this.redraw();
                e.preventDefault();
                if (this.canvas.setPointerCapture && e.pointerId !== undefined) {
                    try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
                }
                return;
            }

            // 3. Single-click near another curve -> switch active curve
            for (let cIdx = 0; cIdx < this.curves.length; cIdx++) {
                const c = this.curves[cIdx];
                if (c.id === this.activeCurveId || !c.enabled) {
                    continue;
                }
                for (let i = 0; i < c.points.length; i++) {
                    const pix = this.normToPixel(c.points[i]);
                    if (Math.hypot(pos.x - pix.x, pos.y - pix.y) <= 14) {
                        this.setActiveCurve(c.id);
                        return;
                    }
                }
                if (normPos.x >= 0 && normPos.x <= 1) {
                    const expectedY = this.evaluateCurveAtFor(c, normPos.x);
                    if (Math.abs(expectedY - normPos.y) <= 0.08) {
                        this.setActiveCurve(c.id);
                        return;
                    }
                }
            }

            // 4. Empty Canvas Drag -> Start Marquee (Alt = Lasso Marquee, Normal = Box Marquee)
            if (e.altKey) {
                this.activeMarquee = { type: 'lasso', points: [pos] };
            } else {
                this.activeMarquee = { type: 'box', start: pos, current: pos };
            }
            if (!e.shiftKey) {
                this.selectedItems.clear();
            }
            e.preventDefault();
            if (this.canvas.setPointerCapture && e.pointerId !== undefined) {
                try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
            }
        };

        // Pointer Move: dragging anchor or Bézier handle (symmetric or broken), or hover detection
        const onMove = (e) => {
            const pos = getCanvasCoord(e);
            const cur = this.getActiveCurve();
            if (!cur) {
                return;
            }

            // Handle active Marquee drag
            if (this.activeMarquee) {
                e.preventDefault();
                if (this.activeMarquee.type === 'box') {
                    this.activeMarquee.current = pos;
                } else if (this.activeMarquee.type === 'lasso') {
                    const pts = this.activeMarquee.points;
                    const lastPt = pts[pts.length - 1];
                    if (!lastPt || Math.hypot(pos.x - lastPt.x, pos.y - lastPt.y) >= 2) {
                        pts.push(pos);
                    }
                }
                this.redraw();
                return;
            }

            if (this.activeDrag && this.dragStartNormPos && this.dragStartPoints) {
                e.preventDefault();
                const norm = this.pixelToNorm(pos);
                let dx = norm.x - this.dragStartNormPos.x;
                let dy = norm.y - this.dragStartNormPos.y;

                // Ortho Snapping when Shift is held down (Lock movement strictly to initial X or Y direction)
                if (e.shiftKey) {
                    if (!this.shiftOrthoLock) {
                        this.shiftOrthoLock = (Math.abs(dx) >= Math.abs(dy)) ? 'x' : 'y';
                    }
                    if (this.shiftOrthoLock === 'x') {
                        dy = 0;
                    } else if (this.shiftOrthoLock === 'y') {
                        dx = 0;
                    }
                } else {
                    this.shiftOrthoLock = null;
                }

                cur.preset = 'custom';
                const n = cur.points.length;

                // Apply dx, dy to all items in this.selectedItems (or single active drag)
                const itemsToMove = this.selectedItems.size > 0 ? this.selectedItems : new Set([`${this.activeDrag.type}_${this.activeDrag.pointIdx}`]);

                itemsToMove.forEach((itemKey) => {
                    const parts = itemKey.split('_');
                    const itemType = parts[0];
                    const idx = parseInt(parts[1], 10);
                    if (isNaN(idx) || idx < 0 || idx >= n) return;

                    const initPt = this.dragStartPoints[idx];
                    const pt = cur.points[idx];
                    if (!initPt || !pt) return;

                    if (itemType === 'cpOut' && initPt.cpOut && pt.cpOut) {
                        if (e.altKey && !pt.brokenHandles) {
                            pt.brokenHandles = true;
                        }
                        const nextPt = cur.points[idx + 1];
                        const prevPt = cur.points[idx - 1];
                        const clampedX = Math.max(pt.x, Math.min(nextPt ? nextPt.x : 1.0, initPt.cpOut.x + dx));
                        const clampedY = Math.max(0, Math.min(1, initPt.cpOut.y + dy));
                        pt.cpOut = {
                            x: Math.round(clampedX * 1000) / 1000,
                            y: Math.round(clampedY * 1000) / 1000
                        };
                        if (!pt.brokenHandles && idx > 0 && pt.cpIn) {
                            const hDx = pt.cpOut.x - pt.x;
                            const hDy = pt.cpOut.y - pt.y;
                            const minX = prevPt ? prevPt.x : 0.0;
                            pt.cpIn = {
                                x: Math.round(Math.max(minX, Math.min(pt.x, pt.x - hDx)) * 1000) / 1000,
                                y: Math.round(Math.max(0, Math.min(1, pt.y - hDy)) * 1000) / 1000
                            };
                        }
                    } else if (itemType === 'cpIn' && initPt.cpIn && pt.cpIn) {
                        if (e.altKey && !pt.brokenHandles) {
                            pt.brokenHandles = true;
                        }
                        const prevPt = cur.points[idx - 1];
                        const nextPt = cur.points[idx + 1];
                        const clampedX = Math.max(prevPt ? prevPt.x : 0.0, Math.min(pt.x, initPt.cpIn.x + dx));
                        const clampedY = Math.max(0, Math.min(1, initPt.cpIn.y + dy));
                        pt.cpIn = {
                            x: Math.round(clampedX * 1000) / 1000,
                            y: Math.round(clampedY * 1000) / 1000
                        };
                        if (!pt.brokenHandles && idx < n - 1 && pt.cpOut) {
                            const hDx = pt.x - pt.cpIn.x;
                            const hDy = pt.y - pt.cpIn.y;
                            const maxX = nextPt ? nextPt.x : 1.0;
                            pt.cpOut = {
                                x: Math.round(Math.max(pt.x, Math.min(maxX, pt.x + hDx)) * 1000) / 1000,
                                y: Math.round(Math.max(0, Math.min(1, pt.y + hDy)) * 1000) / 1000
                            };
                        }
                    } else if (itemType === 'anchor') {
                        let newX = initPt.x + dx;
                        let newY = Math.max(0, Math.min(1, initPt.y + dy));

                        if (idx === 0) {
                            const maxX = n > 1 ? cur.points[1].x - 0.015 : 0.98;
                            newX = Math.max(0.0, Math.min(maxX, newX));
                        } else if (idx === n - 1) {
                            const minX = n > 1 ? cur.points[n - 2].x + 0.015 : 0.02;
                            newX = Math.max(minX, Math.min(1.0, newX));
                        } else {
                            const minX = cur.points[idx - 1].x + 0.015;
                            const maxX = cur.points[idx + 1].x - 0.015;
                            newX = Math.max(minX, Math.min(maxX, newX));
                        }

                        pt.x = Math.round(newX * 1000) / 1000;
                        pt.y = Math.round(newY * 1000) / 1000;

                        if (initPt.cpOut && pt.cpOut) {
                            pt.cpOut.x = Math.round(Math.max(newX, Math.min(idx < n - 1 ? cur.points[idx + 1].x : 1, initPt.cpOut.x + dx)) * 1000) / 1000;
                            pt.cpOut.y = Math.round(Math.max(0, Math.min(1, initPt.cpOut.y + dy)) * 1000) / 1000;
                        }
                        if (initPt.cpIn && pt.cpIn) {
                            pt.cpIn.x = Math.round(Math.max(idx > 0 ? cur.points[idx - 1].x : 0, Math.min(newX, initPt.cpIn.x + dx)) * 1000) / 1000;
                            pt.cpIn.y = Math.round(Math.max(0, Math.min(1, initPt.cpIn.y + dy)) * 1000) / 1000;
                        }
                    }
                });

                this.markCurveDirty(cur);
                this.syncPointInspector();
                this.redraw();
                this.emitDistribution();
                return;
            }

            // Hover detection (handle knobs first, then anchors)
            let hoverTarget = null;
            const n = cur.points.length;
            for (let i = 0; i < n; i++) {
                const pt = cur.points[i];
                if (i < n - 1 && pt.cpOut && !pt.hasNoCpOut) {
                    const cpPix = this.normToPixel(pt.cpOut);
                    if (Math.hypot(pos.x - cpPix.x, pos.y - cpPix.y) <= 8) {
                        hoverTarget = { type: 'cpOut', idx: i };
                        break;
                    }
                }
                if (i > 0 && pt.cpIn && !pt.hasNoCpIn) {
                    const cpPix = this.normToPixel(pt.cpIn);
                    if (Math.hypot(pos.x - cpPix.x, pos.y - cpPix.y) <= 8) {
                        hoverTarget = { type: 'cpIn', idx: i };
                        break;
                    }
                }
                const pix = this.normToPixel(pt);
                if (Math.hypot(pos.x - pix.x, pos.y - pix.y) <= 10) {
                    hoverTarget = { type: 'anchor', idx: i };
                    break;
                }
            }

            this.hoverTarget = hoverTarget;
            this.canvas.style.cursor = hoverTarget ? 'pointer' : 'crosshair';
            this.redraw();
        };

        // Pointer Up / Cancel
        const onUp = (e) => {
            if (this.activeMarquee) {
                const cur = this.getActiveCurve();
                if (cur && cur.points) {
                    const n = cur.points.length;
                    const newSel = e.shiftKey ? new Set(this.selectedItems) : new Set();
                    const { type } = this.activeMarquee;

                    for (let i = 0; i < n; i++) {
                        const pt = cur.points[i];
                        const pixAnchor = this.normToPixel(pt);
                        let isInsideAnchor = false;

                        if (type === 'box') {
                            isInsideAnchor = this.isPointInBox(pixAnchor, this.activeMarquee.start, this.activeMarquee.current);
                        } else if (type === 'lasso') {
                            isInsideAnchor = this.isPointInPolygon(pixAnchor, this.activeMarquee.points);
                        }
                        if (isInsideAnchor) {
                            newSel.add('anchor_' + i);
                        }

                        if (i < n - 1 && pt.cpOut && !pt.hasNoCpOut) {
                            const pixOut = this.normToPixel(pt.cpOut);
                            let isInsideOut = false;
                            if (type === 'box') {
                                isInsideOut = this.isPointInBox(pixOut, this.activeMarquee.start, this.activeMarquee.current);
                            } else if (type === 'lasso') {
                                isInsideOut = this.isPointInPolygon(pixOut, this.activeMarquee.points);
                            }
                            if (isInsideOut) {
                                newSel.add('cpOut_' + i);
                            }
                        }

                        if (i > 0 && pt.cpIn && !pt.hasNoCpIn) {
                            const pixIn = this.normToPixel(pt.cpIn);
                            let isInsideIn = false;
                            if (type === 'box') {
                                isInsideIn = this.isPointInBox(pixIn, this.activeMarquee.start, this.activeMarquee.current);
                            } else if (type === 'lasso') {
                                isInsideIn = this.isPointInPolygon(pixIn, this.activeMarquee.points);
                            }
                            if (isInsideIn) {
                                newSel.add('cpIn_' + i);
                            }
                        }
                    }

                    if (newSel.size > 0) {
                        this.selectedItems = newSel;
                        for (const key of this.selectedItems) {
                            const parts = key.split('_');
                            const idx = parseInt(parts[1], 10);
                            if (!isNaN(idx)) {
                                cur.selectedPointIdx = idx;
                                break;
                            }
                        }
                    }
                }
                this.activeMarquee = null;
                if (this.canvas.releasePointerCapture && e.pointerId !== undefined) {
                    try { this.canvas.releasePointerCapture(e.pointerId); } catch (err) {}
                }
                this.renderPointChips();
                this.syncPointInspector();
                this.redraw();
                return;
            }

            if (this.activeDrag) {
                this.activeDrag = null;
                this.shiftOrthoLock = null;
                this.dragStartNormPos = null;
                this.dragStartPoints = null;
                if (this.canvas.releasePointerCapture && e.pointerId !== undefined) {
                    try { this.canvas.releasePointerCapture(e.pointerId); } catch (err) {}
                }

                if (this.dragStartState) {
                    const cur = this.getActiveCurve();
                    if (cur) {
                        const currentSnapshot = this.getCurvePointsSnapshot(cur);
                        if (JSON.stringify(this.dragStartState.points) !== JSON.stringify(currentSnapshot.points)) {
                            this.recordHistoryState(this.dragStartState);
                        }
                    }
                    this.dragStartState = null;
                }

                this.redraw();
            }
        };

        // Fallback Native Double Click Listener
        const onDblClick = (e) => {
            const pos = getCanvasCoord(e);
            handleCanvasDoubleClick(pos, e);
        };

        this.setupLetterEditing();
        const helpBtn = this.container.querySelector('#btn-curves-help');
        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showCurvesHelp();
            });
        }

        this.canvas.addEventListener('pointerdown', onDown);
        this.canvas.addEventListener('pointermove', onMove);
        this.canvas.addEventListener('pointerup', onUp);
        this.canvas.addEventListener('pointercancel', onUp);
        this.canvas.addEventListener('pointerleave', () => {
            if (!this.activeDrag && this.hoverTarget) {
                this.hoverTarget = null;
                this.redraw();
            }
        });
        this.canvas.addEventListener('dblclick', onDblClick);
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.altKey) {
                const pos = getCanvasCoord(e);
                handleAltRightClick(pos, e);
            }
        });

        // Keyboard shortcuts: Delete/Backspace to delete point, Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo)
        if (this._windowKeydownHandler) {
            window.removeEventListener('keydown', this._windowKeydownHandler);
            this._windowKeydownHandler = null;
        }
        this._windowKeydownHandler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelectedPoint();
                return;
            }
            const isCtrl = e.ctrlKey || e.metaKey;
            if (isCtrl && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                this.undo();
                return;
            }
            if (isCtrl && (e.key === 'y' || e.key === 'Y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
                e.preventDefault();
                this.redo();
                return;
            }
        };
        window.addEventListener('keydown', this._windowKeydownHandler);

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
            const wrap = this.container.querySelector('.canvas-wrapper') || this.container;
            if (wrap) {
                this.resizeObserver = new ResizeObserver(() => {
                    this.setupCanvas();
                    this.redraw();
                });
                this.resizeObserver.observe(wrap);
            }
        }
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

        const palette = (window.themeManager && typeof window.themeManager.getCanvasColors === 'function')
            ? window.themeManager.getCanvasColors()
            : { bg: '#161616', grid: '#252525', border: '#353535', dropline: 'rgba(255, 255, 255, 0.35)', isLight: false };

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, w, h);

        // Grid lines
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

        ctx.strokeStyle = palette.border;
        ctx.strokeRect(pad, pad, plotW, plotH);

        const samples = 64;
        const activeCur = this.getActiveCurve();

        // 1. Draw Inactive / Background curves first (dimmed)
        this.curves.forEach((c) => {
            if (c.id === this.activeCurveId || !c.enabled) {
                return;
            }
            ctx.save();
            ctx.strokeStyle = c.color;
            ctx.lineWidth = 1.8;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            for (let s = 0; s <= samples; s++) {
                const normX = s / samples;
                const normY = this.evaluateCurveAtFor(c, normX);
                const pix = { x: pad + normX * plotW, y: h - pad - normY * plotH };
                if (s === 0) {
                    ctx.moveTo(pix.x, pix.y);
                } else {
                    ctx.lineTo(pix.x, pix.y);
                }
            }
            ctx.stroke();

            // Background points
            ctx.fillStyle = c.color;
            c.points.forEach((pt) => {
                const pix = this.normToPixel(pt);
                ctx.beginPath();
                ctx.arc(pix.x, pix.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        });

        // 2. Draw Active curve with gradient fill, glow, handles, and multi-point nodes
        if (activeCur && activeCur.enabled) {
            this.ensurePointHandles(activeCur);
            const pts = activeCur.points;
            const n = pts.length;
            const plotLeft = pad;
            const plotRight = w - pad;
            const p0Pix = this.normToPixel(pts[0]);
            const pnPix = this.normToPixel(pts[n - 1]);

            // Main curve line (flat, crisp, no shadow or gradients)
            ctx.save();
            ctx.strokeStyle = activeCur.color;
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            if (pts[0].x > 0) {
                ctx.moveTo(plotLeft, p0Pix.y);
                ctx.lineTo(p0Pix.x, p0Pix.y);
            } else {
                ctx.moveTo(p0Pix.x, p0Pix.y);
            }

            for (let i = 0; i < n - 1; i++) {
                const a0 = pts[i];
                const a1 = pts[i + 1];
                const hasCp1 = Boolean(a0.cpOut && !a0.hasNoCpOut);
                const hasCp2 = Boolean(a1.cpIn && !a1.hasNoCpIn);
                const a1Pix = this.normToPixel(a1);

                if (!hasCp1 && !hasCp2) {
                    ctx.lineTo(a1Pix.x, a1Pix.y);
                } else {
                    const dx = (a1.x - a0.x) / 3;
                    const dy = (a1.y - a0.y) / 3;
                    const cp1 = (hasCp1 && a0.cpOut) ? a0.cpOut : { x: a0.x + dx, y: a0.y + dy };
                    const cp2 = (hasCp2 && a1.cpIn) ? a1.cpIn : { x: a1.x - dx, y: a1.y - dy };
                    const cp1Pix = this.normToPixel(cp1);
                    const cp2Pix = this.normToPixel(cp2);
                    ctx.bezierCurveTo(cp1Pix.x, cp1Pix.y, cp2Pix.x, cp2Pix.y, a1Pix.x, a1Pix.y);
                }
            }

            if (pts[n - 1].x < 1.0) {
                ctx.lineTo(plotRight, pnPix.y);
            }

            ctx.stroke();
            ctx.restore();

            // 3. DRAW BÉZIER HANDLES (Լծակներ) - Visible ONLY when present
            for (let i = 0; i < n; i++) {
                const anchor = pts[i];
                const aPix = this.normToPixel(anchor);
                const isBroken = Boolean(anchor.brokenHandles);

                // Draw Outgoing Handle (cpOut)
                if (i < n - 1 && anchor.cpOut && !anchor.hasNoCpOut) {
                    const cpPix = this.normToPixel(anchor.cpOut);
                    const isCpDragging = (this.activeDrag && this.activeDrag.type === 'cpOut' && this.activeDrag.pointIdx === i);
                    const isCpHovered = (this.hoverTarget && this.hoverTarget.type === 'cpOut' && this.hoverTarget.idx === i);

                    // Stem line
                    ctx.save();
                    ctx.strokeStyle = isBroken ? 'rgba(249, 115, 22, 0.85)' : 'rgba(56, 189, 248, 0.75)';
                    ctx.lineWidth = 1.6;
                    if (isBroken) {
                        ctx.setLineDash([3, 2]);
                    }
                    ctx.beginPath();
                    ctx.moveTo(aPix.x, aPix.y);
                    ctx.lineTo(cpPix.x, cpPix.y);
                    ctx.stroke();

                    // Control handle knob
                    ctx.fillStyle = isBroken
                        ? (isCpDragging || isCpHovered ? '#fb923c' : '#ea580c')
                        : (isCpDragging || isCpHovered ? '#38bdf8' : '#0284c7');
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.8;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    if (isBroken) {
                        // Diamond knob for broken/corner handle
                        const r = isCpDragging || isCpHovered ? 5.5 : 4.5;
                        ctx.moveTo(cpPix.x, cpPix.y - r);
                        ctx.lineTo(cpPix.x + r, cpPix.y);
                        ctx.lineTo(cpPix.x, cpPix.y + r);
                        ctx.lineTo(cpPix.x - r, cpPix.y);
                        ctx.closePath();
                    } else {
                        // Circle knob for smooth symmetric handle
                        ctx.arc(cpPix.x, cpPix.y, isCpDragging || isCpHovered ? 5.5 : 4.5, 0, Math.PI * 2);
                    }
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }

                // Draw Incoming Handle (cpIn)
                if (i > 0 && anchor.cpIn && !anchor.hasNoCpIn) {
                    const cpPix = this.normToPixel(anchor.cpIn);
                    const isCpDragging = (this.activeDrag && this.activeDrag.type === 'cpIn' && this.activeDrag.pointIdx === i);
                    const isCpHovered = (this.hoverTarget && this.hoverTarget.type === 'cpIn' && this.hoverTarget.idx === i);

                    // Stem line
                    ctx.save();
                    ctx.strokeStyle = isBroken ? 'rgba(249, 115, 22, 0.85)' : 'rgba(56, 189, 248, 0.75)';
                    ctx.lineWidth = 1.6;
                    if (isBroken) {
                        ctx.setLineDash([3, 2]);
                    }
                    ctx.beginPath();
                    ctx.moveTo(aPix.x, aPix.y);
                    ctx.lineTo(cpPix.x, cpPix.y);
                    ctx.stroke();

                    // Control handle knob
                    ctx.fillStyle = isBroken
                        ? (isCpDragging || isCpHovered ? '#fb923c' : '#ea580c')
                        : (isCpDragging || isCpHovered ? '#38bdf8' : '#0284c7');
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.8;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    if (isBroken) {
                        // Diamond knob for broken/corner handle
                        const r = isCpDragging || isCpHovered ? 5.5 : 4.5;
                        ctx.moveTo(cpPix.x, cpPix.y - r);
                        ctx.lineTo(cpPix.x + r, cpPix.y);
                        ctx.lineTo(cpPix.x, cpPix.y + r);
                        ctx.lineTo(cpPix.x - r, cpPix.y);
                        ctx.closePath();
                    } else {
                        // Circle knob for smooth symmetric handle
                        ctx.arc(cpPix.x, cpPix.y, isCpDragging || isCpHovered ? 5.5 : 4.5, 0, Math.PI * 2);
                    }
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // 4. Points (Anchor Nodes) rendering - drawn on top of handles
            pts.forEach((pt, idx) => {
                const pix = this.normToPixel(pt);
                const isSelected = (idx === activeCur.selectedPointIdx);
                const isHovered = (this.hoverTarget && this.hoverTarget.type === 'anchor' && this.hoverTarget.idx === idx);
                const isStraightNode = (!pt.cpIn || pt.hasNoCpIn) && (!pt.cpOut || pt.hasNoCpOut);

                // Dashed vertical guideline to baseline for selected point
                if (isSelected) {
                    ctx.save();
                    ctx.setLineDash([3, 3]);
                    ctx.strokeStyle = palette.dropline;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(pix.x, pix.y);
                    ctx.lineTo(pix.x, h - pad);
                    ctx.stroke();
                    ctx.restore();
                }

                // Outer focus ring for selected point
                if (isSelected) {
                    ctx.save();
                    ctx.strokeStyle = pt.brokenHandles ? '#f97316' : (isStraightNode ? '#38bdf8' : activeCur.color);
                    ctx.lineWidth = 2.0;
                    ctx.beginPath();
                    if (isStraightNode) {
                        ctx.strokeRect(pix.x - 10, pix.y - 10, 20, 20);
                    } else {
                        ctx.arc(pix.x, pix.y, 11, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    ctx.restore();
                }

                // Anchor Point knob (Square for Corner/Straight points, Circle for Smooth points)
                ctx.save();
                const radius = isSelected ? 7.5 : (isHovered ? 6.5 : 5.0);
                ctx.fillStyle = isSelected ? '#ffffff' : activeCur.color;
                ctx.strokeStyle = pt.brokenHandles ? '#f97316' : (isStraightNode ? '#38bdf8' : '#ffffff');
                ctx.lineWidth = pt.brokenHandles ? 2.4 : 2.0;
                ctx.beginPath();
                if (isStraightNode) {
                    const sz = radius * 1.8;
                    ctx.rect(pix.x - sz / 2, pix.y - sz / 2, sz, sz);
                } else {
                    ctx.arc(pix.x, pix.y, radius, 0, Math.PI * 2);
                }
                ctx.fill();
                ctx.stroke();
                ctx.restore();

            });

            // 5. Draw Distribution Hover Projection Lines & Floating Value Badge
            if (this.hoveredDistIndex !== null) {
                const realCount = Math.max(1, this.itemCount || 16);
                const count = Math.max(2, Math.min(48, realCount));
                if (this.hoveredDistIndex >= 0 && this.hoveredDistIndex < count) {
                    const i = this.hoveredDistIndex;
                    const sampleIdx = this.getBarSampleIndex(i, count, realCount);
                    const xNorm = realCount > 1 ? sampleIdx / (realCount - 1) : 0;
                    const yNorm = this.getLetterY(activeCur, sampleIdx, realCount);

                    const pixX = pad + xNorm * plotW;
                    const pixY = h - pad - yNorm * plotH;
                    const baselineY = h - pad;
                    const leftAxisX = pad;
                    const rightAxisX = w - pad;
                    const topAxisY = pad;

                    const axisObj = this.availableAxes.find((a) => a.id === activeCur.axisId);
                    const rawAxisName = axisObj ? axisObj.name : activeCur.axisId;
                    const axisName = window.i18n ? window.i18n.getAxisName(activeCur.axisId, rawAxisName) : rawAxisName;
                    const range = this.getAxisRange(activeCur.axisId);
                    const calculatedVal = Math.round(range.min + yNorm * (range.max - range.min));
                    const rawChar = (this.textSnippet && this.textSnippet[sampleIdx]) ? this.textSnippet[sampleIdx] : null;
                    const letterDisplay = rawChar ? `'${rawChar}'` : `#${sampleIdx + 1}`;

                    ctx.save();

                    // 1. Vertical parallel/projection line: from baseline up to curve point (parallel to Y-axis)
                    ctx.strokeStyle = activeCur.color || '#38bdf8';
                    ctx.lineWidth = 1.8;
                    ctx.setLineDash([4, 3]);
                    ctx.beginPath();
                    ctx.moveTo(pixX, baselineY);
                    ctx.lineTo(pixX, pixY);
                    ctx.stroke();

                    // 2. Horizontal parallel/projection line: from curve point left to Y-axis (parallel to X-axis)
                    ctx.beginPath();
                    ctx.moveTo(leftAxisX, pixY);
                    ctx.lineTo(pixX, pixY);
                    ctx.stroke();

                    // 3. Subtle dashed extensions across canvas
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 4]);
                    ctx.beginPath();
                    ctx.moveTo(pixX, pixY);
                    ctx.lineTo(rightAxisX, pixY);
                    ctx.moveTo(pixX, pixY);
                    ctx.lineTo(pixX, topAxisY);
                    ctx.stroke();

                    // 4. Axis Tick Indicators
                    ctx.setLineDash([]);
                    ctx.fillStyle = activeCur.color || '#38bdf8';
                    // Bottom baseline tick
                    ctx.fillRect(pixX - 2.5, baselineY - 2.5, 5, 5);
                    // Left Y-axis tick
                    ctx.fillRect(leftAxisX - 2.5, pixY - 2.5, 5, 5);

                    // 5. Glowing Intersection Node on Curve
                    ctx.fillStyle = `${activeCur.color || '#38bdf8'}35`;
                    ctx.beginPath();
                    ctx.arc(pixX, pixY, 11, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = activeCur.color || '#38bdf8';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(pixX, pixY, 5.5, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = activeCur.color || '#38bdf8';
                    ctx.beginPath();
                    ctx.arc(pixX, pixY, 2.5, 0, Math.PI * 2);
                    ctx.fill();

                    // 6. Floating Value Badge next to Point on Canvas
                    const badgeText = `${letterDisplay} • ${axisName}: ${calculatedVal}`;
                    ctx.font = 'bold 9.5px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    const textMetrics = ctx.measureText(badgeText);
                    const badgeW = Math.round(textMetrics.width + 16);
                    const badgeH = 22;

                    let badgeX = Math.round(pixX - badgeW / 2);
                    if (badgeX < pad + 4) badgeX = pad + 4;
                    if (badgeX + badgeW > w - pad - 4) badgeX = w - pad - 4 - badgeW;

                    let badgeY = Math.round(pixY - badgeH - 10);
                    if (badgeY < pad + 4) {
                        badgeY = Math.round(pixY + 10);
                    }

                    // Flat badge pill (no shadow)
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.fillStyle = '#161618';
                    ctx.strokeStyle = activeCur.color || '#38bdf8';
                    ctx.lineWidth = 1.2;

                    const r = 5;
                    ctx.beginPath();
                    ctx.moveTo(badgeX + r, badgeY);
                    ctx.lineTo(badgeX + badgeW - r, badgeY);
                    ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + r);
                    ctx.lineTo(badgeX + badgeW, badgeY + badgeH - r);
                    ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - r, badgeY + badgeH);
                    ctx.lineTo(badgeX + r, badgeY + badgeH);
                    ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - r);
                    ctx.lineTo(badgeX, badgeY + r);
                    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    // Text inside badge
                    ctx.shadowColor = 'transparent';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

                    ctx.restore();
                }
            }
        }

        // 6. Draw Marquee Overlay (Box Marquee or Alt-held Lasso Marquee)
        if (this.activeMarquee) {
            if (this.activeMarquee.type === 'box') {
                const { start, current } = this.activeMarquee;
                ctx.save();
                ctx.fillStyle = 'rgba(13, 153, 255, 0.14)';
                ctx.strokeStyle = '#0d99ff';
                ctx.lineWidth = 1.2;
                ctx.setLineDash([4, 3]);
                const bx = Math.min(start.x, current.x);
                const by = Math.min(start.y, current.y);
                const bw = Math.abs(current.x - start.x);
                const bh = Math.abs(current.y - start.y);
                ctx.fillRect(bx, by, bw, bh);
                ctx.strokeRect(bx, by, bw, bh);
                ctx.restore();
            } else if (this.activeMarquee.type === 'lasso') {
                const pts = this.activeMarquee.points;
                if (pts && pts.length > 1) {
                    ctx.save();
                    ctx.fillStyle = 'rgba(249, 115, 22, 0.16)';
                    ctx.strokeStyle = '#f97316';
                    ctx.lineWidth = 1.4;
                    ctx.setLineDash([4, 3]);
                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    for (let lp = 1; lp < pts.length; lp++) {
                        ctx.lineTo(pts[lp].x, pts[lp].y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        if (this.showDistPoints) {
            const dpCur = this.getActiveCurve();
            if (dpCur) {
                this.drawDistributionPoints(ctx, dpCur, pad, plotW, plotH, h);
            }
        }

        this.updateDistributionPreview();
    }

    updateDistributionPreview() {
        const barContainer = this.container.querySelector('#distribution-bars');
        const countLabel = this.container.querySelector('#preview-sample-count');
        const axisLabel = this.container.querySelector('#preview-axis-label');
        const footerEl = this.container.querySelector('#distribution-axis-footer');
        if (!barContainer) {
            return;
        }

        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }

        const axisObj = this.availableAxes.find((a) => a.id === cur.axisId);
        const rawAxisName = axisObj ? axisObj.name : cur.axisId;
        const axisName = window.i18n ? window.i18n.getAxisName(cur.axisId, rawAxisName) : rawAxisName;
        const range = this.getAxisRange(cur.axisId);

        if (axisLabel) {
            const headingText = this.distributionTarget === 'characters'
                ? (window.i18n ? window.i18n.t('charDistribution') : 'Տառերի բաշխում')
                : (window.i18n ? window.i18n.t('itemDistribution') : 'Առարկաների բաշխում');
            axisLabel.textContent = headingText;
        }

        barContainer.classList.remove('has-limit-warning');
        const realCount = Math.max(1, this.itemCount || 16);
        const count = Math.max(2, Math.min(48, realCount));
        barContainer.classList.toggle('is-thin', count > 20);
        barContainer.classList.toggle('dist-bars-dense', count > 36);
        barContainer.classList.toggle('dist-bars-ultra', count > 44);

        if (countLabel) {
            const countStr = this.distributionTarget === 'characters'
                ? (window.i18n ? window.i18n.t('charactersCount', { count: realCount }) : `${realCount} characters`)
                : (window.i18n ? window.i18n.t('itemsCount', { count: realCount }) : `${realCount} items`);
            countLabel.textContent = countStr;
        }

        if (footerEl) {
            footerEl.innerHTML = `
                <div class="dist-footer-axis-wrap">
                    <span class="dist-footer-dot" style="background: ${cur.color}"></span>
                    <span class="dist-footer-axis-name">${axisName}</span>
                    <span class="dist-footer-axis-tag">${cur.axisId}</span>
                </div>
                <div class="dist-footer-range">${range.min} &rarr; ${range.max}</div>
            `;
        }

        const hoverReadout = this.container.querySelector('#preview-hover-readout');
        let existingItems = barContainer.querySelectorAll('.dist-bar-item');

        if (existingItems.length !== count) {
            // Count changed: rebuild DOM elements and attach hover listeners
            let html = '';
            for (let i = 0; i < count; i++) {
                html += `
                    <div class="dist-bar-item" data-index="${i}">
                        <div class="dist-bar-track">
                            <div class="dist-bar-fill">
                                <div class="dist-bar-inner-content">
                                    <span class="dist-bar-inner-char"></span>
                                    <span class="dist-bar-inner-val"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            barContainer.innerHTML = html;
            existingItems = barContainer.querySelectorAll('.dist-bar-item');

            existingItems.forEach((item) => {
                const idx = parseInt(item.dataset.index, 10);
                item.addEventListener('mouseenter', () => {
                    this.hoveredDistIndex = idx;
                    item.classList.add('is-hovered');
                    if (hoverReadout) {
                        hoverReadout.textContent = item.dataset.tip || '';
                    }
                    this.redraw();
                });
                item.addEventListener('mouseleave', () => {
                    if (this.hoveredDistIndex === idx) {
                        this.hoveredDistIndex = null;
                    }
                    item.classList.remove('is-hovered');
                    if (hoverReadout) {
                        hoverReadout.textContent = '';
                    }
                    this.redraw();
                });
            });
        }

        existingItems.forEach((item, i) => {
            const sampleIdx = this.getBarSampleIndex(i, count, realCount);
            const yNorm = this.getLetterY(cur, sampleIdx, realCount);
            const calculatedVal = Math.round(range.min + yNorm * (range.max - range.min));
            const isOverride = Boolean(cur.overrides && cur.overrides[sampleIdx] !== undefined);

            const rawChar = (this.textSnippet && this.textSnippet[sampleIdx]) ? this.textSnippet[sampleIdx] : null;
            const letterDisplay = rawChar ? `${rawChar}` : `#${sampleIdx + 1}`;
            const tipText = window.i18n
                ? window.i18n.t('distBarLetterTip', { char: `'${letterDisplay}'`, idx: sampleIdx + 1, axis: axisName, val: calculatedVal })
                : `Letter '${letterDisplay}' (#${sampleIdx + 1}): ${axisName} = ${calculatedVal}`;

            item.dataset.index = i;
            item.dataset.sample = sampleIdx;
            item.dataset.label = letterDisplay;
            item.dataset.val = calculatedVal;
            item.dataset.tip = tipText;
            item.title = tipText;
            item.classList.toggle('is-hovered', this.hoveredDistIndex === i);
            item.classList.toggle('is-override', isOverride);

            const innerChar = item.querySelector('.dist-bar-inner-char');
            if (innerChar) innerChar.textContent = letterDisplay;
            const innerVal = item.querySelector('.dist-bar-inner-val');
            if (innerVal) innerVal.textContent = calculatedVal;

            const fill = item.querySelector('.dist-bar-fill');
            if (fill) {
                // Exact proportional height: bar height == value on the axis range
                fill.style.height = `${(yNorm * 100).toFixed(2)}%`;
                fill.style.background = cur.color;
            }
        });

        if (this.hoveredDistIndex !== null && hoverReadout && existingItems[this.hoveredDistIndex]) {
            hoverReadout.textContent = existingItems[this.hoveredDistIndex].dataset.tip || '';
        }
    }

    // ---- Per-letter distribution helpers ----
    getBarSampleIndex(i, count, realCount) {
        if (realCount === count) {
            return i;
        }
        const xNorm = count > 1 ? i / (count - 1) : 0;
        return Math.min(Math.round(xNorm * (realCount - 1)), realCount - 1);
    }

    // Exact normalized value (0..1) for letter index i out of n letters.
    getLetterY(cur, i, n) {
        if (cur && cur.overrides && cur.overrides[i] !== undefined && i < this.itemCount) {
            return cur.overrides[i];
        }
        const x = n > 1 ? i / (n - 1) : 0;
        return this.evaluateCurveAtFor(cur, x);
    }

    setLetterOverride(letterIdx, yNorm, silent) {
        const cur = this.getActiveCurve();
        if (!cur) {
            return;
        }
        if (!cur.overrides) {
            cur.overrides = {};
        }
        cur.overrides[letterIdx] = Math.max(0, Math.min(1, Math.round(yNorm * 1000) / 1000));
        this.updateDistributionPreview();
        this.redraw();
        if (!silent) {
            this.emitDistribution();
        }
    }

    clearLetterOverride(letterIdx) {
        const cur = this.getActiveCurve();
        if (cur && cur.overrides && cur.overrides[letterIdx] !== undefined) {
            delete cur.overrides[letterIdx];
            this.updateDistributionPreview();
            this.redraw();
            this.emitDistribution();
        }
    }

    clearAllOverrides() {
        const cur = this.getActiveCurve();
        if (cur && cur.overrides && Object.keys(cur.overrides).length) {
            cur.overrides = {};
            this.updateDistributionPreview();
            this.redraw();
            this.emitDistribution();
        }
    }

    setupLetterEditing() {
        const barContainer = this.container.querySelector('#distribution-bars');
        const chk = this.container.querySelector('#chk-show-dist-points');
        const btnReset = this.container.querySelector('#btn-reset-overrides');
        const canvas = this.canvas;
        if (!barContainer || !canvas) {
            return;
        }

        if (btnReset) {
            btnReset.addEventListener('click', () => this.clearAllOverrides());
        }
        if (chk) {
            chk.checked = Boolean(this.showDistPoints);
            chk.addEventListener('change', () => {
                this.showDistPoints = chk.checked;
                this.redraw();
            });
        }

        // --- Drag bars vertically to set the letter's own value ---
        let barDrag = null;
        barContainer.addEventListener('pointerdown', (e) => {
            const item = e.target.closest('.dist-bar-item');
            if (!item || e.button !== 0) {
                return;
            }
            const track = item.querySelector('.dist-bar-track');
            const rect = track.getBoundingClientRect();
            barDrag = { sample: parseInt(item.dataset.sample, 10), rect };
            try { barContainer.setPointerCapture(e.pointerId); } catch (err) {}
            e.preventDefault();
            this.setLetterOverride(barDrag.sample, 1 - (e.clientY - rect.top) / rect.height);
        });
        barContainer.addEventListener('pointermove', (e) => {
            if (!barDrag) {
                return;
            }
            this.setLetterOverride(barDrag.sample, 1 - (e.clientY - barDrag.rect.top) / barDrag.rect.height);
        });
        const endBar = (e) => {
            if (barDrag) {
                try { barContainer.releasePointerCapture(e.pointerId); } catch (err) {}
                barDrag = null;
            }
        };
        barContainer.addEventListener('pointerup', endBar);
        barContainer.addEventListener('pointercancel', endBar);
        barContainer.addEventListener('dblclick', (e) => {
            const item = e.target.closest('.dist-bar-item');
            if (item) {
                this.clearLetterOverride(parseInt(item.dataset.sample, 10));
            }
        });

        // --- Drag distribution points on the curve (capture phase: runs before curve editing) ---
        const hitDistPoint = (e) => {
            if (!this.showDistPoints) {
                return null;
            }
            const cur = this.getActiveCurve();
            if (!cur) {
                return null;
            }
            const r = canvas.getBoundingClientRect();
            const px = (e.clientX - r.left) * (this.width / r.width);
            const py = (e.clientY - r.top) * (this.height / r.height);
            const n = Math.max(1, this.itemCount || 16);
            if (n > 128) {
                return null;
            }
            let best = null;
            let bestD = 9;
            for (let i = 0; i < n; i++) {
                const pix = this.normToPixel({ x: n > 1 ? i / (n - 1) : 0, y: this.getLetterY(cur, i, n) });
                const d = Math.hypot(px - pix.x, py - pix.y);
                if (d <= bestD) {
                    bestD = d;
                    best = i;
                }
            }
            return best;
        };

        let ptDrag = null;
        canvas.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) {
                return;
            }
            const idx = hitDistPoint(e);
            if (idx === null) {
                return;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
            ptDrag = { idx };
            try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
            this.hoveredDistIndex = null;
        }, true);
        canvas.addEventListener('pointermove', (e) => {
            if (ptDrag) {
                e.stopImmediatePropagation();
                const r = canvas.getBoundingClientRect();
                const py = (e.clientY - r.top) * (this.height / r.height);
                const y = 1 - (py - this.padding) / (this.height - this.padding * 2);
                this.setLetterOverride(ptDrag.idx, y);
            } else if (this.showDistPoints) {
                canvas.style.cursor = hitDistPoint(e) !== null ? 'ns-resize' : '';
            }
        }, true);
        const endPt = (e) => {
            if (ptDrag) {
                e.stopImmediatePropagation();
                try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
                ptDrag = null;
            }
        };
        canvas.addEventListener('pointerup', endPt, true);
        canvas.addEventListener('pointercancel', endPt, true);
        canvas.addEventListener('dblclick', (e) => {
            const idx = hitDistPoint(e);
            if (idx !== null) {
                e.stopImmediatePropagation();
                this.clearLetterOverride(idx);
            }
        }, true);
    }

    drawDistributionPoints(ctx, cur, pad, plotW, plotH, h) {
        const n = Math.max(1, this.itemCount || 16);
        if (n > 128) {
            return;
        }
        ctx.save();
        for (let i = 0; i < n; i++) {
            const x = n > 1 ? i / (n - 1) : 0;
            const y = this.getLetterY(cur, i, n);
            const isOv = Boolean(cur.overrides && cur.overrides[i] !== undefined);
            const px = pad + x * plotW;
            const py = h - pad - y * plotH;
            ctx.beginPath();
            ctx.arc(px, py, isOv ? 4.2 : 3.2, 0, Math.PI * 2);
            ctx.fillStyle = isOv ? '#ffffff' : cur.color;
            ctx.strokeStyle = isOv ? cur.color : 'rgba(255,255,255,0.85)';
            ctx.lineWidth = isOv ? 2 : 1.2;
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }

    showCurvesHelp() {
        const en = window.i18n && window.i18n.currentLang === 'en';
        const rows = en ? [
            ['Add point', 'Double-click on the curve'],
            ['Delete point', 'Double-click on a point / Delete / Backspace'],
            ['Move point or handle', 'Drag'],
            ['Break / smooth handle', 'Double-click the handle knob'],
            ['Unlink handle while dragging', 'Alt + Drag handle'],
            ['Remove handles', 'Alt + Right-click'],
            ['Add to selection', 'Shift + Click'],
            ['Lock axis while dragging', 'Shift + Drag'],
            ['Box / lasso select', 'Drag on empty area / Alt + Drag'],
            ['Undo', 'Ctrl + Z'],
            ['Redo', 'Ctrl + Y / Ctrl + Shift + Z'],
            ['Show distribution points', 'Checkbox under the canvas; drag a dot up/down to change that letter'],
            ['Set a single letter value', 'Drag its bar in the distribution bars'],
            ['Reset a letter to the curve', 'Double-click its bar or its dot']
        ] : [
            ['Ավելացնել կետ', 'Կրկնակի կտտոց կորի վրա'],
            ['Ջնջել կետ', 'Կրկնակի կտտոց կետի վրա / Delete / Backspace'],
            ['Տեղափոխել կետը կամ լծակը', 'Քաշել'],
            ['Կոտրել / սահունացնել լծակը', 'Կրկնակի կտտոց լծակի վրա'],
            ['Ապակապել լծակը քաշելիս', 'Alt + Քաշել լծակը'],
            ['Վերացնել լծակները', 'Alt + Աջ կտտոց'],
            ['Ավելացնել ընտրությանը', 'Shift + Կտտոց'],
            ['Կողպել առանցքը քաշելիս', 'Shift + Քաշել'],
            ['Ընտրել շրջանակով / լասսոյով', 'Քաշել դատարկ տեղում / Alt + Քաշել'],
            ['Հետարկել', 'Ctrl + Z'],
            ['Վերարկել', 'Ctrl + Y / Ctrl + Shift + Z'],
            ['Ցուցադրել բաշխիչ կետերը', 'Նշատուփ կտավի տակ. կետը վեր/վար քաշելով փոխվում է այդ տառը'],
            ['Փոխել առանձին տառի միավորը', 'Քաշել նրա սյունը բաշխման սյուների մեջ'],
            ['Վերադարձնել տառը կորին', 'Կրկնակի կտտոց սյան կամ կետի վրա']
        ];
        const title = en ? 'Curve panel: features & shortcuts' : 'Կորերի փեղկ՝ հնարավորություններ և ստեղներ';

        const old = document.getElementById('curves-help-overlay');
        if (old) {
            old.remove();
        }
        const ov = document.createElement('div');
        ov.id = 'curves-help-overlay';
        ov.className = 'app-modal-overlay';
        ov.innerHTML = `
            <div class="app-modal-dialog curves-help-dialog">
                <div class="app-modal-header">
                    <span class="app-modal-title">${title}</span>
                    <button type="button" class="app-modal-close-btn"><i class="hd-icon hd-icon-close"></i></button>
                </div>
                <div class="app-modal-body">
                    <ul class="curves-help-list">
                        ${rows.map((r) => `<li><span class="help-what">${r[0]}</span><kbd class="help-key">${r[1]}</kbd></li>`).join('')}
                    </ul>
                </div>
            </div>`;
        document.body.appendChild(ov);
        const close = () => {
            ov.classList.remove('is-open');
            setTimeout(() => ov.remove(), 260);
        };
        ov.addEventListener('click', (e) => {
            if (e.target === ov) close();
        });
        ov.querySelector('.app-modal-close-btn').addEventListener('click', close);
        requestAnimationFrame(() => ov.classList.add('is-open'));
    }

    emitDistribution() {
        const count = Math.max(2, Math.min(1000, this.itemCount || 16));
        const activeCur = this.getActiveCurve();

        // Multi-curve payload: one exact value per letter (curve value or per-letter override)
        const curvesPayload = this.curves.filter((c) => c.enabled).map((c) => {
            const evaluatedValues = [];
            for (let i = 0; i < count; i++) {
                evaluatedValues.push(this.getLetterY(c, i, count));
            }
            const range = this.getAxisRange(c.axisId);
            return {
                targetAxis: c.axisId,
                minVal: range.min,
                maxVal: range.max,
                distributedValues: evaluatedValues,
                curveData: {
                    points: JSON.parse(JSON.stringify(c.points)),
                    preset: c.preset || 'custom'
                }
            };
        });

        if (curvesPayload.length === 0 && activeCur) {
            return;
        }

        const primary = curvesPayload[0] || {};
        const payload = {
            targetAxis: primary.targetAxis || (activeCur ? activeCur.axisId : 'wght'),
            distributionTarget: this.distributionTarget,
            minVal: primary.minVal,
            maxVal: primary.maxVal,
            distributedValues: primary.distributedValues || [],
            curves: curvesPayload,
            curvesCollection: JSON.parse(JSON.stringify(this.curves))
        };

        if (typeof this.onChange === 'function') {
            this.onChange(payload);
        }
    }

    syncSelection(info) {
        if (!info) {
            return;
        }

        if (info.type === 'text') {
            this.itemCount = info.charCount > 0 ? info.charCount : 16;
            this.distributionTarget = 'characters';
            this.textSnippet = info.textSnippet || '';
            const targetSel = this.container.querySelector('#graph-target-select');
            if (targetSel) {
                targetSel.value = 'characters';
            }
        } else {
            this.itemCount = info.totalSelected > 0 ? info.totalSelected : 8;
            this.distributionTarget = 'items';
            this.textSnippet = '';
            const targetSel = this.container.querySelector('#graph-target-select');
            if (targetSel) {
                targetSel.value = 'items';
            }
        }

        this.availableAxes = (info.axes && info.axes.length > 0) ? info.axes : [];

        // Align curves with active available axes and eliminate duplicate axes
        if (this.availableAxes.length > 0) {
            const assigned = new Set();
            this.curves.forEach((c) => {
                if (!this.availableAxes.some((a) => a.id === c.axisId) || assigned.has(c.axisId)) {
                    const nextUnassigned = this.availableAxes.find((a) => !assigned.has(a.id));
                    if (nextUnassigned) {
                        c.axisId = nextUnassigned.id;
                    }
                }
                assigned.add(c.axisId);
            });

            // If more curves than available axes, keep only up to availableAxes.length
            if (this.curves.length > this.availableAxes.length) {
                this.curves = this.curves.slice(0, this.availableAxes.length);
                if (!this.curves.some((c) => c.id === this.activeCurveId)) {
                    this.activeCurveId = this.curves[0].id;
                }
            }
        }

        // If the item has saved curve parameters, restore them seamlessly
        if (info.savedCurve) {
            try {
                if (Array.isArray(info.savedCurve.curvesCollection) && info.savedCurve.curvesCollection.length > 0) {
                    this.curves = JSON.parse(JSON.stringify(info.savedCurve.curvesCollection));
                    if (!this.curves.some((c) => c.id === this.activeCurveId)) {
                        this.activeCurveId = this.curves[0].id;
                    }
                } else if (Array.isArray(info.savedCurve.curves) && info.savedCurve.curves.length > 0) {
                    info.savedCurve.curves.forEach((sc, idx) => {
                        if (this.curves[idx] && sc.curveData && sc.curveData.points) {
                            this.curves[idx].points = JSON.parse(JSON.stringify(sc.curveData.points));
                            if (sc.curveData.preset) {
                                this.curves[idx].preset = sc.curveData.preset;
                            }
                            if (sc.targetAxis) {
                                this.curves[idx].axisId = sc.targetAxis;
                            }
                        }
                    });
                }
            } catch (eCurve) {}
        }

        this.renderCurvePills();
        this.renderPointChips();
        this.syncPointInspector();
        this.updateDistributionPreview();
        this.redraw();
    }
}

window.GraphMode = GraphMode;

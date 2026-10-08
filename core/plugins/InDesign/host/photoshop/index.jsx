/**
 * Variable Font & Dynamic Parameter Controller - ExtendScript Engine
 * Adobe Photoshop Host Script
 * 
 * Follows K&R / 1TBS brace formatting.
 */

// JSON Polyfill for ExtendScript (ECMAScript 3 compatibility)
if (typeof JSON !== 'object') {
    JSON = {};
}
(function() {
    'use strict';
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function() {
            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z'
                : null;
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder) {
        var i, k, v, length, mind = '', partial, value = holder[key];
        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    return '[' + partial.join(',') + ']';
                }
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + ':' + v);
                        }
                    }
                }
                return '{' + partial.join(',') + '}';
        }
    }

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function(value) {
            return str('', {'': value});
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function(text) {
            return eval('(' + text + ')');
        };
    }
}());

var VariableFontPlugin = {
    appName: 'photoshop',

    shapeParameters: [
        { id: 'opacity', name: 'Layer Opacity (%)', min: 0, max: 100, step: 1, defaultVal: 100 }
    ],

    _fontCache: {},

    /**
     * Query real OpenType Variable Font axes from Photoshop ActionManager
     * ONLY returns axes that actually exist in the active font.
     */
    getPhotoshopVariableAxes: function() {
        var axes = [];
        try {
            var ref = new ActionReference();
            ref.putEnumerated(stringIDToTypeID('layer'), stringIDToTypeID('ordinal'), stringIDToTypeID('targetEnum'));
            var desc = executeActionGet(ref);

            if (desc.hasKey(stringIDToTypeID('textKey'))) {
                var textDesc = desc.getObjectValue(stringIDToTypeID('textKey'));
                if (textDesc.hasKey(stringIDToTypeID('textStyleRange'))) {
                    var styleList = textDesc.getList(stringIDToTypeID('textStyleRange'));
                    if (styleList.length > 0) {
                        var firstRange = styleList.getObjectValue(0);
                        if (firstRange.hasKey(stringIDToTypeID('textStyle'))) {
                            var styleObj = firstRange.getObjectValue(stringIDToTypeID('textStyle'));
                            if (styleObj.hasKey(stringIDToTypeID('fontVariationAxes'))) {
                                var varList = styleObj.getList(stringIDToTypeID('fontVariationAxes'));
                                for (var i = 0; i < varList.length; i++) {
                                    var axisObj = varList.getObjectValue(i);
                                    var tag = axisObj.hasKey(stringIDToTypeID('axis')) ? axisObj.getString(stringIDToTypeID('axis')) : ('axis_' + i);
                                    var nameStr = axisObj.hasKey(stringIDToTypeID('name')) ? axisObj.getString(stringIDToTypeID('name')) : tag;
                                    var minV = axisObj.hasKey(stringIDToTypeID('minimum')) ? axisObj.getDouble(stringIDToTypeID('minimum')) : 0;
                                    var maxV = axisObj.hasKey(stringIDToTypeID('maximum')) ? axisObj.getDouble(stringIDToTypeID('maximum')) : 100;
                                    var defV = axisObj.hasKey(stringIDToTypeID('default')) ? axisObj.getDouble(stringIDToTypeID('default')) : minV;

                                    axes.push({
                                        id: tag,
                                        name: nameStr || tag,
                                        min: minV,
                                        max: maxV,
                                        step: (maxV - minV > 100) ? 1 : 0.5,
                                        defaultVal: defV
                                    });
                                }
                            }
                        }
                    }
                }
            }
        } catch(e) {}
        return axes;
    },

    getPhotoshopFonts: function(familyName) {
        if (!familyName) return [];
        var famKey = familyName.toLowerCase();
        if (this._fontCache[famKey]) return this._fontCache[famKey];

        var list = [];
        try {
            var fonts = app.fonts;
            for (var i = 0; i < fonts.length; i++) {
                try {
                    var f = fonts[i];
                    if (f.family && f.family.toLowerCase() === famKey) {
                        list.push(f);
                    }
                } catch(e) {}
            }
        } catch(e) {}

        this._fontCache[famKey] = list;
        return list;
    },

    findNearestPhotoshopFont: function(familyName, targetWght) {
        var fonts = VariableFontPlugin.getPhotoshopFonts(familyName);
        if (fonts.length === 0) return null;

        var best = fonts[0];
        var minDiff = 9999;

        for (var i = 0; i < fonts.length; i++) {
            var f = fonts[i];
            var styleName = (f.style || f.postScriptName || '').toLowerCase();
            var w = 400;

            if (styleName.indexOf('thin') !== -1 || styleName.indexOf('hairline') !== -1) w = 100;
            else if (styleName.indexOf('light') !== -1) w = 300;
            else if (styleName.indexOf('medium') !== -1) w = 500;
            else if (styleName.indexOf('semibold') !== -1 || styleName.indexOf('demi') !== -1) w = 600;
            else if (styleName.indexOf('bold') !== -1) w = 700;
            else if (styleName.indexOf('black') !== -1 || styleName.indexOf('heavy') !== -1) w = 900;

            var diff = Math.abs(w - targetWght);
            if (diff < minDiff) {
                minDiff = diff;
                best = f;
            }
        }

        return best ? best.postScriptName : null;
    },

    getUIBrightness: function() {
        return -1;
    },

    queryUIBrightness: function() {
        return JSON.stringify({
            success: true,
            uiBrightness: VariableFontPlugin.getUIBrightness()
        });
    },

    getSelectionInfo: function() {
        try {
            if (!app.documents.length) {
                return JSON.stringify({
                    success: true,
                    hasDoc: false,
                    hasSelection: false,
                    message: 'No document open in Photoshop.'
                });
            }

            var doc = app.activeDocument;
            var layer = null;
            try { layer = doc.activeLayer; } catch(e1) {}

            if (!layer) {
                return JSON.stringify({
                    success: true,
                    hasDoc: true,
                    hasSelection: false,
                    message: 'No layer selected.',
                    documentTextFrames: VariableFontPlugin.getDocumentTextFramesList()
                });
            }

            var isText = (layer.kind === LayerKind.TEXT);

            var result = {
                success: true,
                hasDoc: true,
                hasSelection: true,
                totalSelected: 1,
                type: isText ? 'text' : 'shape',
                fontName: '',
                fontFamily: '',
                textSnippet: '',
                isVariableFont: false,
                charCount: 0,
                axes: [],
                currentValues: {},
                savedCurve: null,
                itemCount: 1
            };

            if (isText && layer.textItem) {
                var ti = layer.textItem;
                var rawContents = ti.contents || '';
                result.textSnippet = String(rawContents).substring(0, 64).replace(/[\r\n\t]+/g, ' ');
                result.charCount = String(rawContents).length;

                var postScript = ti.font || 'ArialMT';
                result.fontName = postScript;
                result.fontFamily = postScript.split('-')[0] || postScript;

                // Dynamically query actual native variable axes from ActionManager
                var varAxes = VariableFontPlugin.getPhotoshopVariableAxes();
                if (varAxes && varAxes.length > 0) {
                    result.axes = varAxes;
                    result.isVariableFont = true;
                } else {
                    // Non-variable font: no axes returned
                    result.axes = [];
                    result.isVariableFont = false;
                }

                var curWght = 400;
                var styleStr = postScript.toLowerCase();
                if (styleStr.indexOf('thin') !== -1 || styleStr.indexOf('hairline') !== -1) curWght = 100;
                else if (styleStr.indexOf('light') !== -1) curWght = 300;
                else if (styleStr.indexOf('medium') !== -1) curWght = 500;
                else if (styleStr.indexOf('semibold') !== -1) curWght = 600;
                else if (styleStr.indexOf('bold') !== -1) curWght = 700;
                else if (styleStr.indexOf('black') !== -1) curWght = 900;

                var trk = 0;
                try { trk = Math.round(ti.tracking || 0); } catch(eT) {}
                var scale = 100;
                try { scale = Math.round(ti.horizontalScale || 100); } catch(eS) {}

                result.currentValues = {
                    wght: curWght,
                    wdth: scale,
                    tracking: trk
                };
            } else {
                result.axes = VariableFontPlugin.shapeParameters;
                var op = Math.round(layer.opacity !== undefined ? layer.opacity : 100);
                result.currentValues = {
                    opacity: op
                };
            }

            return JSON.stringify(result);
        } catch (e) {
            return JSON.stringify({
                success: false,
                error: e.toString()
            });
        }
    },

    getDocumentTextFramesList: function() {
        var list = [];
        try {
            if (!app.documents.length) return list;
            var doc = app.activeDocument;
            var layers = doc.layers;
            var count = 0;

            function scanLayers(layerCollection) {
                for (var i = 0; i < layerCollection.length && count < 50; i++) {
                    var l = layerCollection[i];
                    if (l.kind === LayerKind.TEXT && l.textItem) {
                        var raw = l.textItem.contents || '';
                        var snippet = String(raw).replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ');
                        if (snippet.length > 40) snippet = snippet.substring(0, 40) + '...';
                        if (!snippet) snippet = '[Empty Text Layer]';

                        list.push({
                            index: count,
                            text: snippet,
                            snippet: snippet,
                            fontName: l.textItem.font || 'Photoshop Font',
                            isVariable: true,
                            charCount: String(raw).length
                        });
                        count++;
                    } else if (l.layers && l.layers.length > 0) {
                        scanLayers(l.layers);
                    }
                }
            }

            scanLayers(layers);
        } catch(e) {}
        return list;
    },

    selectTextFrame: function(indexStr) {
        try {
            if (!app.documents.length) {
                return JSON.stringify({ success: false, message: 'No document open.' });
            }
            var doc = app.activeDocument;
            var index = parseInt(indexStr, 10);
            var foundLayer = null;
            var count = 0;

            function findTextLayer(layerCollection) {
                for (var i = 0; i < layerCollection.length; i++) {
                    var l = layerCollection[i];
                    if (l.kind === LayerKind.TEXT && l.textItem) {
                        if (count === index) {
                            foundLayer = l;
                            return;
                        }
                        count++;
                    } else if (l.layers && l.layers.length > 0) {
                        findTextLayer(l.layers);
                        if (foundLayer) return;
                    }
                }
            }

            findTextLayer(doc.layers);
            if (foundLayer) {
                doc.activeLayer = foundLayer;
            }

            return VariableFontPlugin.getSelectionInfo();
        } catch(e) {
            return JSON.stringify({ success: false, error: e.toString() });
        }
    },

    applyParameters: function(jsonPayload) {
        try {
            if (!app.documents.length) {
                return JSON.stringify({ success: false, message: 'No document active' });
            }

            var params = typeof jsonPayload === 'string' ? JSON.parse(jsonPayload) : jsonPayload;
            var doc = app.activeDocument;
            var layer = doc.activeLayer;

            if (!layer) {
                return JSON.stringify({ success: false, message: 'No active layer' });
            }

            if (layer.kind === LayerKind.TEXT && layer.textItem) {
                var ti = layer.textItem;

                if (params.wght !== undefined && ti.font) {
                    var fam = ti.font.split('-')[0] || ti.font;
                    var matchedFont = VariableFontPlugin.findNearestPhotoshopFont(fam, Number(params.wght));
                    if (matchedFont) {
                        try { ti.font = matchedFont; } catch(eF) {}
                    }
                }

                if (params.wdth !== undefined) {
                    try { ti.horizontalScale = Math.max(25, Math.min(250, Number(params.wdth))); } catch(eW) {}
                }

                if (params.tracking !== undefined) {
                    try { ti.tracking = Number(params.tracking); } catch(eT) {}
                }
            } else {
                if (params.opacity !== undefined) {
                    try { layer.opacity = Math.max(0, Math.min(100, Number(params.opacity))); } catch(eO) {}
                }
            }

            return JSON.stringify({ success: true });
        } catch (e) {
            return JSON.stringify({ success: false, error: e.toString() });
        }
    },

    applyCurveDistribution: function(jsonPayload) {
        try {
            if (!app.documents.length) {
                return JSON.stringify({ success: false, message: 'No document active' });
            }

            var config = typeof jsonPayload === 'string' ? JSON.parse(jsonPayload) : jsonPayload;
            var doc = app.activeDocument;
            var layer = doc.activeLayer;

            if (!layer) {
                return JSON.stringify({ success: false, message: 'No active layer' });
            }

            var curveList = [];
            if (config.curves && config.curves.length > 0) {
                curveList = config.curves;
            } else if (config.distributedValues) {
                curveList = [config];
            }

            if (layer.kind === LayerKind.TEXT && layer.textItem && curveList.length > 0) {
                var ti = layer.textItem;
                var cur = curveList[0];
                var vals = cur.distributedValues || [];
                if (vals.length > 0) {
                    var midVal = vals[Math.floor(vals.length / 2)];
                    var minV = Number(cur.minVal !== undefined ? cur.minVal : 0);
                    var maxV = Number(cur.maxVal !== undefined ? cur.maxVal : 100);
                    var targetVal = minV + midVal * (maxV - minV);

                    if (cur.targetAxis === 'wght' && ti.font) {
                        var fam = ti.font.split('-')[0] || ti.font;
                        var matched = VariableFontPlugin.findNearestPhotoshopFont(fam, targetVal);
                        if (matched) { try { ti.font = matched; } catch(eF) {} }
                    } else if (cur.targetAxis === 'wdth') {
                        try { ti.horizontalScale = Math.max(25, Math.min(250, Number(targetVal))); } catch(eW) {}
                    } else if (cur.targetAxis === 'tracking') {
                        try { ti.tracking = Number(targetVal); } catch(eT) {}
                    }
                }
            } else if (curveList.length > 0) {
                var cur = curveList[0];
                var vals = cur.distributedValues || [];
                if (vals.length > 0) {
                    var midVal = vals[Math.floor(vals.length / 2)];
                    var minV = Number(cur.minVal !== undefined ? cur.minVal : 0);
                    var maxV = Number(cur.maxVal !== undefined ? cur.maxVal : 100);
                    var op = minV + midVal * (maxV - minV);
                    if (cur.targetAxis === 'opacity') {
                        try { layer.opacity = Math.max(0, Math.min(100, Number(op))); } catch(eO) {}
                    }
                }
            }

            return JSON.stringify({ success: true });
        } catch (e) {
            return JSON.stringify({ success: false, error: e.toString() });
        }
    }
};

/**
 * Variable Font & Dynamic Parameter Controller - ExtendScript Engine
 * Adobe Illustrator Host Script
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
    appName: 'illustrator',

    // Dynamic shape parameters for path items
    shapeParameters: [
        { id: 'strokeWidth', name: 'Stroke Width', min: 0.5, max: 50, step: 0.5, defaultVal: 2 },
        { id: 'opacity', name: 'Opacity', min: 0, max: 100, step: 1, defaultVal: 100 }
    ],

    _axisMapCache: {},

    /**
     * Clean and prevent rogue strokes from polluting Illustrator's default character style
     */
    cleanDefaultCharacterStyle: function(doc) {
        try {
            if (!doc) {
                return;
            }
            if (doc.characterStyles && doc.characterStyles.length > 0) {
                var defStyle = doc.characterStyles[0];
                if (defStyle && defStyle.characterAttributes) {
                    var ca = defStyle.characterAttributes;
                    if (ca.strokeWeight > 0 || (ca.strokeColor && ca.strokeColor.typename !== 'NoColor')) {
                        ca.strokeWeight = 0;
                        ca.strokeColor = new NoColor();
                    }
                    if (ca.textFont && ca.textFont.axisVector && ca.textFont.axisVector.length > 0) {
                        var regF = VariableFontPlugin.findNearestFontInstance(ca.textFont.family, { wght: 400, wdth: 100 });
                        if (regF) {
                            ca.textFont = regF;
                        }
                    }
                }
            }
        } catch (e) {}
    },

    getFamilyAxisMapping: function(family) {
        if (!family) {
            return {};
        }
        var famKey = family.toLowerCase();
        if (this._axisMapCache[famKey]) {
            return this._axisMapCache[famKey];
        }

        var familyFonts = [];
        for (var i = 0; i < app.textFonts.length; i++) {
            var f = app.textFonts[i];
            if (f.family.toLowerCase() === famKey) {
                familyFonts.push(f);
            }
        }

        var map = {};
        if (familyFonts.length === 0) {
            this._axisMapCache[famKey] = map;
            return map;
        }

        var sample = familyFonts[0];
        if (!sample.axisVector || sample.axisVector.length === 0) {
            this._axisMapCache[famKey] = map;
            return map;
        }

        var numAxes = sample.axisVector.length;

        for (var k = 0; k < numAxes; k++) {
            var minV = 999999;
            var maxV = -999999;

            for (var j = 0; j < familyFonts.length; j++) {
                var av = familyFonts[j].axisVector;
                if (av && av[k] !== undefined) {
                    if (av[k] < minV) minV = av[k];
                    if (av[k] > maxV) maxV = av[k];
                }
            }

            if (maxV > 250) {
                map.wght = { index: k, min: minV, max: maxV };
            } else if (minV >= 35 && maxV <= 250) {
                map.wdth = { index: k, min: minV, max: maxV };
            } else if (minV >= -25 && maxV <= 25) {
                map.slnt = { index: k, min: minV, max: maxV };
            } else if (minV >= 4 && maxV <= 150) {
                map.opsz = { index: k, min: minV, max: maxV };
            }
        }

        this._axisMapCache[famKey] = map;
        return map;
    },

    detectFontAxes: function(font) {
        var axes = [];
        if (!font) {
            return axes;
        }

        function addAxis(id, name, min, max, step, def) {
            axes.push({ id: id, name: name, min: min, max: max, step: step, defaultVal: def });
        }

        var family = font.family || '';
        var map = VariableFontPlugin.getFamilyAxisMapping(family);

        if (font.axisVector && font.axisVector.length > 0) {
            if (map.wght) {
                var defW = 400;
                if (defW < map.wght.min) defW = map.wght.min;
                if (defW > map.wght.max) defW = map.wght.max;
                addAxis('wght', 'Weight', map.wght.min, map.wght.max, 1, defW);
            }
            if (map.wdth) {
                var defWd = 100;
                if (defWd < map.wdth.min) defWd = map.wdth.min;
                if (defWd > map.wdth.max) defWd = map.wdth.max;
                addAxis('wdth', 'Width', map.wdth.min, map.wdth.max, 1, defWd);
            }
            if (map.slnt) {
                var defSl = 0;
                if (defSl < map.slnt.min) defSl = map.slnt.min;
                if (defSl > map.slnt.max) defSl = map.slnt.max;
                addAxis('slnt', 'Slant', map.slnt.min, map.slnt.max, 0.5, defSl);
            }
            if (map.opsz) {
                var defOp = 14;
                if (defOp < map.opsz.min) defOp = Math.round((map.opsz.min + map.opsz.max) / 2);
                if (defOp > map.opsz.max) defOp = map.opsz.max;
                addAxis('opsz', 'Optical Size', map.opsz.min, map.opsz.max, 0.5, defOp);
            }
        }

        return axes;
    },

    readItemMetadata: function(item) {
        var vals = {};
        var savedCurve = null;
        var metaFamily = null;
        var metaFontName = null;

        if (item.note && item.note.length > 0) {
            try {
                var parsed = JSON.parse(item.note);
                if (parsed && parsed.values) {
                    for (var k in parsed.values) {
                        vals[k] = parsed.values[k];
                    }
                }
                if (parsed && parsed.curve) {
                    savedCurve = parsed.curve;
                }
                if (parsed && parsed.fontFamily) {
                    metaFamily = parsed.fontFamily;
                }
                if (parsed && parsed.fontName) {
                    metaFontName = parsed.fontName;
                }
            } catch (e) {}
        }

        if (item.typename === 'TextFrame') {
            var tr = item.textRange;
            var ca = tr.characterAttributes;
            var font = ca.textFont;

            if (font) {
                var map = VariableFontPlugin.getFamilyAxisMapping(font.family);
                var familyMatches = (!metaFamily || metaFamily.toLowerCase() === font.family.toLowerCase());
                if (!familyMatches) {
                    vals = {};
                }

                if (font.axisVector && font.axisVector.length > 0) {
                    if (map.wght && font.axisVector[map.wght.index] !== undefined) {
                        vals.wght = font.axisVector[map.wght.index];
                    }
                    if (map.wdth && font.axisVector[map.wdth.index] !== undefined) {
                        vals.wdth = font.axisVector[map.wdth.index];
                    }
                    if (map.slnt && font.axisVector[map.slnt.index] !== undefined) {
                        vals.slnt = font.axisVector[map.slnt.index];
                    }
                    if (map.opsz && font.axisVector[map.opsz.index] !== undefined) {
                        vals.opsz = font.axisVector[map.opsz.index];
                    }
                } else {
                    var s = (font.style || '').toLowerCase();
                    if (s.indexOf('thin') !== -1 || s.indexOf('hairline') !== -1) vals.wght = 100;
                    else if (s.indexOf('extra light') !== -1 || s.indexOf('ultralight') !== -1) vals.wght = 200;
                    else if (s.indexOf('light') !== -1) vals.wght = 300;
                    else if (s.indexOf('book') !== -1) vals.wght = 350;
                    else if (s.indexOf('medium') !== -1) vals.wght = 500;
                    else if (s.indexOf('semibold') !== -1 || s.indexOf('demi') !== -1) vals.wght = 600;
                    else if (s.indexOf('bold') !== -1) vals.wght = 700;
                    else if (s.indexOf('black') !== -1 || s.indexOf('heavy') !== -1) vals.wght = 900;
                    else vals.wght = 400;

                    vals.wdth = Math.round(ca.horizontalScale || 100);
                }
            }
            if (vals.tracking === undefined) {
                vals.tracking = Math.round(ca.tracking || 0);
            }
        } else if (item.typename === 'PathItem' || item.typename === 'CompoundPathItem') {
            if (vals.strokeWidth === undefined) {
                vals.strokeWidth = item.stroked ? Math.round(item.strokeWidth * 10) / 10 : 2;
            }
            if (vals.opacity === undefined) {
                vals.opacity = Math.round(item.opacity !== undefined ? item.opacity : 100);
            }
        }

        return { values: vals, curve: savedCurve };
    },

    saveItemMetadata: function(item, params, curve) {
        try {
            var existing = {};
            if (item.note && item.note.length > 0) {
                try {
                    existing = JSON.parse(item.note);
                } catch (e) {}
            }
            if (params) {
                existing.values = existing.values || {};
                for (var p in params) {
                    existing.values[p] = params[p];
                }
            }
            if (curve) {
                existing.curve = curve;
            }
            if (item.typename === 'TextFrame') {
                try {
                    var f = item.textRange.characterAttributes.textFont;
                    if (f) {
                        existing.fontFamily = f.family;
                        existing.fontName = f.name;
                    }
                } catch(e) {}
            }
            item.note = JSON.stringify(existing);
        } catch (e) {}
    },

    getUIBrightness: function() {
        var b = -1;
        try {
            b = app.preferences.getRealPreference('uiBrightness');
        } catch (e1) {
            try {
                b = app.preferences.getIntegerPreference('uiBrightness');
            } catch (e2) {}
        }
        return b;
    },

    queryUIBrightness: function() {
        return JSON.stringify({
            success: true,
            uiBrightness: VariableFontPlugin.getUIBrightness()
        });
    },

    getSelectionInfo: function() {
        var uiBrightness = VariableFontPlugin.getUIBrightness();
        try {
            if (!app.documents.length) {
                return JSON.stringify({
                    success: true,
                    hasDoc: false,
                    hasSelection: false,
                    uiBrightness: uiBrightness,
                    message: 'No document open in Illustrator.'
                });
            }

            var doc = app.activeDocument;
            VariableFontPlugin.cleanDefaultCharacterStyle(doc);

            var sel = doc.selection;

            if (!sel || (sel.length !== undefined && sel.length === 0)) {
                return JSON.stringify({
                    success: true,
                    hasDoc: true,
                    hasSelection: false,
                    uiBrightness: uiBrightness,
                    message: 'Deselected',
                    documentTextFrames: VariableFontPlugin.getDocumentTextFramesList()
                });
            }

            var textFrames = [];
            var pathItems = [];

            if (sel.typename === 'TextRange') {
                try {
                    var parentTf = sel.parent;
                    if (parentTf && parentTf.typename === 'TextFrame') {
                        textFrames.push(parentTf);
                    }
                } catch (e) {}
            } else if (sel.length !== undefined) {
                function collectItems(items) {
                    for (var i = 0; i < items.length; i++) {
                        var it = items[i];
                        if (it.typename === 'TextFrame') {
                            textFrames.push(it);
                        } else if (it.typename === 'PathItem' || it.typename === 'CompoundPathItem') {
                            pathItems.push(it);
                        } else if (it.typename === 'GroupItem') {
                            collectItems(it.pageItems);
                        }
                    }
                }
                collectItems(sel);
            }

            if (textFrames.length === 0 && pathItems.length === 0) {
                return JSON.stringify({
                    success: true,
                    hasDoc: true,
                    hasSelection: false,
                    uiBrightness: uiBrightness,
                    message: 'No editable text frames or vector items selected.',
                    documentTextFrames: VariableFontPlugin.getDocumentTextFramesList()
                });
            }

            var result = {
                success: true,
                hasDoc: true,
                hasSelection: true,
                uiBrightness: uiBrightness,
                totalSelected: sel.length || 1,
                type: 'mixed',
                fontName: '',
                fontFamily: '',
                textSnippet: '',
                isVariableFont: false,
                charCount: 0,
                axes: [],
                currentValues: {},
                savedCurve: null,
                itemCount: sel.length || 1
            };

            if (textFrames.length > 0) {
                result.type = 'text';
                var firstTf = textFrames[0];
                var tr = firstTf.textRange;
                var charAttr = tr.characterAttributes;
                var font = charAttr.textFont;

                try {
                    result.itemId = firstTf.uuid || (firstTf.name ? firstTf.name : ('tf_' + tr.characters.length + '_' + Math.round(firstTf.position[0]) + '_' + Math.round(firstTf.position[1])));
                } catch(eId) {
                    result.itemId = 'tf_' + tr.characters.length;
                }

                result.charCount = tr.characters.length;
                result.fontName = font ? font.name : 'Variable Font';
                result.fontFamily = font ? font.family : 'Variable Font';

                try {
                    result.textSnippet = tr.contents.substring(0, 64).replace(/[\r\n\t]+/g, ' ');
                } catch(eText) {
                    result.textSnippet = '';
                }

                result.axes = VariableFontPlugin.detectFontAxes(font);
                result.isVariableFont = (result.axes.length > 0);

                var meta = VariableFontPlugin.readItemMetadata(firstTf);
                result.currentValues = meta.values;
                result.savedCurve = meta.curve;
            } else if (pathItems.length > 0) {
                result.type = 'shape';
                var firstPath = pathItems[0];
                try {
                    result.itemId = firstPath.uuid || (firstPath.name ? firstPath.name : ('path_' + Math.round(firstPath.position[0]) + '_' + Math.round(firstPath.position[1])));
                } catch(ePId) {
                    result.itemId = 'shape_' + (firstPath.typename || 'path');
                }
                result.axes = VariableFontPlugin.shapeParameters;

                var pathMeta = VariableFontPlugin.readItemMetadata(firstPath);
                result.currentValues = pathMeta.values;
                result.savedCurve = pathMeta.curve;
            }

            return JSON.stringify(result);
        } catch (e) {
            return JSON.stringify({
                success: false,
                error: e.toString(),
                line: e.line
            });
        }
    },

    getDocumentTextFramesList: function() {
        var list = [];
        try {
            if (!app.documents.length) {
                return list;
            }
            var doc = app.activeDocument;
            var tfs = doc.textFrames;
            var maxCount = Math.min(tfs.length, 50);
            for (var i = 0; i < maxCount; i++) {
                var tf = tfs[i];
                var rawContents = '';
                var fontName = 'Standard Font';
                var isVar = false;
                var charCount = 0;

                try {
                    rawContents = tf.contents || '';
                    charCount = rawContents.length;
                } catch(e1) {}

                try {
                    if (tf.textRange && tf.textRange.characterAttributes && tf.textRange.characterAttributes.textFont) {
                        var tfFont = tf.textRange.characterAttributes.textFont;
                        fontName = tfFont.name || tfFont.family || 'Font';
                        var axes = VariableFontPlugin.detectFontAxes(tfFont);
                        isVar = (axes && axes.length > 0);
                    }
                } catch(e2) {}

                var cleanSnippet = rawContents.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ');
                if (cleanSnippet.length > 40) {
                    cleanSnippet = cleanSnippet.substring(0, 40) + '...';
                }
                if (!cleanSnippet) {
                    cleanSnippet = '[Empty Text Frame]';
                }

                list.push({
                    index: i,
                    text: cleanSnippet,
                    snippet: cleanSnippet,
                    fontName: fontName,
                    isVariable: isVar,
                    charCount: charCount
                });
            }
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
            if (isNaN(index) || index < 0 || index >= doc.textFrames.length) {
                return JSON.stringify({ success: false, message: 'Invalid text frame index.' });
            }

            doc.selection = null;
            var targetTf = doc.textFrames[index];
            targetTf.selected = true;

            try {
                app.redraw();
            } catch(eRedraw) {}

            return VariableFontPlugin.getSelectionInfo();
        } catch(e) {
            return JSON.stringify({ success: false, error: e.toString() });
        }
    },

    findNearestFontInstance: function(family, params) {
        if (!family) {
            return null;
        }

        var targetWght = params.wght !== undefined ? Number(params.wght) : null;
        var targetWdth = params.wdth !== undefined ? Number(params.wdth) : null;
        var targetSlnt = params.slnt !== undefined ? Number(params.slnt) : null;
        var targetOpsz = params.opsz !== undefined ? Number(params.opsz) : null;

        var map = VariableFontPlugin.getFamilyAxisMapping(family);

        var candidates = [];
        var famLower = family.toLowerCase();
        for (var i = 0; i < app.textFonts.length; i++) {
            var f = app.textFonts[i];
            if (f.family.toLowerCase() === famLower) {
                candidates.push(f);
            }
        }

        if (candidates.length === 0) {
            return null;
        }
        if (candidates.length === 1) {
            return candidates[0];
        }

        var best = null;
        var minD = 99999999;

        for (var c = 0; c < candidates.length; c++) {
            var cand = candidates[c];
            var dist = 0;

            if (cand.axisVector && cand.axisVector.length > 0) {
                if (targetWght !== null && map.wght) {
                    var cW = cand.axisVector[map.wght.index];
                    if (cW !== undefined) {
                        dist += Math.pow((cW - targetWght) / 100, 2);
                    }
                }
                if (targetWdth !== null && map.wdth) {
                    var cWd = cand.axisVector[map.wdth.index];
                    if (cWd !== undefined) {
                        dist += Math.pow((cWd - targetWdth) / 10, 2);
                    }
                }
                if (targetSlnt !== null && map.slnt) {
                    var cS = cand.axisVector[map.slnt.index];
                    if (cS !== undefined) {
                        dist += Math.pow((cS - targetSlnt) / 5, 2);
                    }
                }
                if (targetOpsz !== null && map.opsz) {
                    var cOp = cand.axisVector[map.opsz.index];
                    if (cOp !== undefined) {
                        dist += Math.pow((cOp - targetOpsz) / 5, 2);
                    }
                }
            } else {
                var s = (cand.style || '').toLowerCase();
                var sWght = 400;
                if (s.indexOf('thin') !== -1 || s.indexOf('hairline') !== -1) sWght = 100;
                else if (s.indexOf('extra light') !== -1 || s.indexOf('ultralight') !== -1) sWght = 200;
                else if (s.indexOf('light') !== -1) sWght = 300;
                else if (s.indexOf('book') !== -1) sWght = 350;
                else if (s.indexOf('medium') !== -1) sWght = 500;
                else if (s.indexOf('semibold') !== -1 || s.indexOf('demi') !== -1) sWght = 600;
                else if (s.indexOf('extrabold') !== -1 || s.indexOf('ultrabold') !== -1) sWght = 800;
                else if (s.indexOf('bold') !== -1) sWght = 700;
                else if (s.indexOf('black') !== -1 || s.indexOf('heavy') !== -1) sWght = 900;

                var isCond = s.indexOf('cond') !== -1;
                var targetCond = targetWdth !== null && targetWdth < 90;
                var condDiff = (isCond === targetCond) ? 0 : 500;
                dist = Math.abs(sWght - (targetWght !== null ? targetWght : 400)) + condDiff;
            }

            if (dist < minD) {
                minD = dist;
                best = cand;
            }
        }

        return best;
    },

    applyParameters: function(jsonPayload) {
        try {
            if (!app.documents.length) {
                return JSON.stringify({ success: false, message: 'No document active' });
            }

            var params = typeof jsonPayload === 'string' ? JSON.parse(jsonPayload) : jsonPayload;
            var doc = app.activeDocument;
            var sel = doc.selection;

            if (!sel || sel.length === 0) {
                return JSON.stringify({ success: false, message: 'No selection' });
            }

            VariableFontPlugin.cleanDefaultCharacterStyle(doc);

            for (var i = 0; i < sel.length; i++) {
                var item = sel[i];

                if (item.typename === 'TextFrame') {
                    var tr = item.textRange;
                    var ca = tr.characterAttributes;

                    if (ca.textFont && (params.wght !== undefined || params.wdth !== undefined || params.slnt !== undefined || params.opsz !== undefined)) {
                        var targetF = VariableFontPlugin.findNearestFontInstance(ca.textFont.family, params);
                        if (targetF) {
                            ca.textFont = targetF;
                        }
                    }

                    if (ca.textFont) {
                        var map = VariableFontPlugin.getFamilyAxisMapping(ca.textFont.family);
                        if (!map.wdth && params.wdth !== undefined) {
                            ca.horizontalScale = Math.max(25, Math.min(250, Number(params.wdth)));
                        } else if (map.wdth) {
                            ca.horizontalScale = 100;
                        }
                    }

                    if (params.tracking !== undefined) {
                        ca.tracking = Number(params.tracking);
                    }
                } else if (item.typename === 'PathItem' || item.typename === 'CompoundPathItem') {
                    if (params.strokeWidth !== undefined) {
                        item.stroked = true;
                        item.strokeWidth = Number(params.strokeWidth);
                    }
                    if (params.opacity !== undefined) {
                        item.opacity = Math.max(0, Math.min(100, Number(params.opacity)));
                    }
                }

                VariableFontPlugin.saveItemMetadata(item, params, null);
            }

            app.redraw();
            return JSON.stringify({ success: true });
        } catch (e) {
            return JSON.stringify({ success: false, error: e.toString(), line: e.line });
        }
    },

    applyCurveDistribution: function(jsonPayload) {
        try {
            if (!app.documents.length) {
                return JSON.stringify({ success: false, message: 'No document active' });
            }

            var config = typeof jsonPayload === 'string' ? JSON.parse(jsonPayload) : jsonPayload;
            var doc = app.activeDocument;
            var sel = doc.selection;

            if (!sel || sel.length === 0) {
                return JSON.stringify({ success: false, message: 'No selection' });
            }

            VariableFontPlugin.cleanDefaultCharacterStyle(doc);

            var curveList = [];
            if (config.curves && config.curves.length > 0) {
                curveList = config.curves;
            } else if (config.distributedValues) {
                curveList = [config];
            }

            var mode = config.distributionTarget || 'characters';

            if (mode === 'characters' && sel.length === 1 && sel[0].typename === 'TextFrame') {
                var tf = sel[0];
                var chars = tf.textRange.characters;
                var count = chars.length;
                if (count > 0 && curveList.length > 0) {
                    for (var c = 0; c < count; c++) {
                        var normIndex = count > 1 ? c / (count - 1) : 0;
                        var charAttr = chars[c].characterAttributes;

                        var p = {};
                        for (var k = 0; k < curveList.length; k++) {
                            var cur = curveList[k];
                            var vals = cur.distributedValues || [];
                            if (vals.length > 0) {
                                var vIdx = Math.min(Math.floor(normIndex * vals.length), vals.length - 1);
                                var cy = vals[vIdx];
                                var minV = Number(cur.minVal !== undefined ? cur.minVal : 0);
                                var maxV = Number(cur.maxVal !== undefined ? cur.maxVal : 100);
                                p[cur.targetAxis] = minV + cy * (maxV - minV);
                            }
                        }

                        if (charAttr.textFont) {
                            var targetF = VariableFontPlugin.findNearestFontInstance(charAttr.textFont.family, p);
                            if (targetF) {
                                charAttr.textFont = targetF;
                            }
                            var map = VariableFontPlugin.getFamilyAxisMapping(charAttr.textFont.family);
                            if (p.wdth !== undefined) {
                                if (map.wdth) {
                                    charAttr.horizontalScale = 100;
                                } else {
                                    charAttr.horizontalScale = Math.max(25, Math.min(250, Number(p.wdth)));
                                }
                            }
                            if (p.tracking !== undefined) {
                                charAttr.tracking = Number(p.tracking);
                            }
                        }
                    }
                }
                VariableFontPlugin.saveItemMetadata(tf, null, config);
            } else {
                var itemCount = sel.length;
                if (itemCount > 0 && curveList.length > 0) {
                    for (var i = 0; i < itemCount; i++) {
                        var norm = itemCount > 1 ? i / (itemCount - 1) : 0;
                        var it = sel[i];

                        var p = {};
                        for (var k = 0; k < curveList.length; k++) {
                            var cur = curveList[k];
                            var vals = cur.distributedValues || [];
                            if (vals.length > 0) {
                                var vIdx = Math.min(Math.floor(norm * vals.length), vals.length - 1);
                                var cy = vals[vIdx];
                                var minV = Number(cur.minVal !== undefined ? cur.minVal : 0);
                                var maxV = Number(cur.maxVal !== undefined ? cur.maxVal : 100);
                                p[cur.targetAxis] = minV + cy * (maxV - minV);
                            }
                        }

                        if (it.typename === 'TextFrame') {
                            var ca = it.textRange.characterAttributes;
                            if (ca.textFont) {
                                var targetF = VariableFontPlugin.findNearestFontInstance(ca.textFont.family, p);
                                if (targetF) {
                                    ca.textFont = targetF;
                                }
                                var map = VariableFontPlugin.getFamilyAxisMapping(ca.textFont.family);
                                if (p.wdth !== undefined) {
                                    if (map.wdth) {
                                        ca.horizontalScale = 100;
                                    } else {
                                        ca.horizontalScale = Math.max(25, Math.min(250, Number(p.wdth)));
                                    }
                                }
                                if (p.tracking !== undefined) {
                                    ca.tracking = Number(p.tracking);
                                }
                            }
                        } else if (it.typename === 'PathItem' || it.typename === 'CompoundPathItem') {
                            if (p.strokeWidth !== undefined) {
                                it.stroked = true;
                                it.strokeWidth = Number(p.strokeWidth);
                            }
                            if (p.opacity !== undefined) {
                                it.opacity = Math.max(0, Math.min(100, Number(p.opacity)));
                            }
                        }

                        VariableFontPlugin.saveItemMetadata(it, null, config);
                    }
                }
            }

            app.redraw();
            return JSON.stringify({ success: true, count: sel.length });
        } catch (e) {
            return JSON.stringify({ success: false, error: e.toString(), line: e.line });
        }
    }
};

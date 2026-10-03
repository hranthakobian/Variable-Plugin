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
    _familyFontsCache: {},
    _nearestFontCache: {},

    /**
     * Extract root family name without hyphenated style suffixes
     */
    extractBaseFamily: function(famOrName) {
        if (!famOrName) return '';
        var s = String(famOrName);
        var dashIdx = s.indexOf('-');
        if (dashIdx !== -1) {
            s = s.substring(0, dashIdx);
        }
        return s.toLowerCase().replace(/[\s\-_]+/g, '');
    },

    /**
     * Cache family fonts to prevent scanning app.textFonts thousands of times
     */
    getFamilyFonts: function(family, fontName) {
        if (!family && !fontName) {
            return [];
        }
        var baseFam = VariableFontPlugin.extractBaseFamily(family) || VariableFontPlugin.extractBaseFamily(fontName);
        var famKey = (family || '').toLowerCase().replace(/[\s\-_]+/g, '');
        var nameKey = (fontName || '').toLowerCase().replace(/[\s\-_]+/g, '');
        var cacheKey = baseFam + '||' + famKey + '||' + nameKey;
        if (this._familyFontsCache[cacheKey]) {
            return this._familyFontsCache[cacheKey];
        }

        var familyFonts = [];
        try {
            var allFonts = app.textFonts;
            for (var i = 0; i < allFonts.length; i++) {
                try {
                    var f = allFonts[i];
                    if (!f) continue;
                    var fFam = (f.family || '').toLowerCase().replace(/[\s\-_]+/g, '');
                    var fName = (f.name || '').toLowerCase().replace(/[\s\-_]+/g, '');
                    var fBase = VariableFontPlugin.extractBaseFamily(f.family) || VariableFontPlugin.extractBaseFamily(f.name);

                    if (fFam === famKey || (baseFam && fBase === baseFam) ||
                        (baseFam && (fFam.indexOf(baseFam) === 0 || fName.indexOf(baseFam) === 0))) {
                        familyFonts.push(f);
                    }
                } catch (eFont) {}
            }
        } catch (eAll) {}
        this._familyFontsCache[cacheKey] = familyFonts;
        return familyFonts;
    },

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

        var familyFonts = VariableFontPlugin.getFamilyFonts(family);

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

    isVariableFont: function(font) {
        if (!font) {
            return false;
        }
        var fam = (font.family || '').toLowerCase();
        var name = (font.name || '').toLowerCase();

        if (fam.indexOf('variable') !== -1 || name.indexOf('variable') !== -1) return true;
        if (fam.indexOf('concept') !== -1 || name.indexOf('concept') !== -1) return true;
        if (fam.indexOf('bahnschrift') !== -1 || name.indexOf('bahnschrift') !== -1) return true;
        if (fam.indexOf('flex') !== -1 || name.indexOf('flex') !== -1) return true;
        if (fam.indexOf('vf') !== -1 || name.indexOf('vf') !== -1) return true;
        if (name.indexOf('-var') !== -1 || fam.indexOf(' var') !== -1) return true;

        try {
            if (font.axisVector && font.axisVector.length > 0) return true;
        } catch (eAv) {}

        return false;
    },

    detectFontAxes: function(font) {
        var axes = [];

        function addAxis(id, name, min, max, step, def) {
            for (var i = 0; i < axes.length; i++) {
                if (axes[i].id === id) {
                    return;
                }
            }
            axes.push({ id: id, name: name, min: min, max: max, step: step, defaultVal: def });
        }

        var isVar = VariableFontPlugin.isVariableFont(font);
        var fam = font ? (font.family || '').toLowerCase() : '';

        if (isVar) {
            if (fam.indexOf('acumin') !== -1) {
                addAxis('wght', 'Weight', 100, 900, 1, 400);
                addAxis('wdth', 'Width', 45, 115, 1, 100);
                addAxis('slnt', 'Slant', -12, 0, 0.5, 0);
            } else if (fam.indexOf('minion') !== -1) {
                addAxis('wght', 'Weight', 300, 900, 1, 400);
                addAxis('opsz', 'Optical Size', 6, 72, 0.5, 11);
            } else if (fam.indexOf('myriad') !== -1) {
                addAxis('wght', 'Weight', 100, 900, 1, 400);
                addAxis('wdth', 'Width', 50, 150, 1, 100);
            } else if (fam.indexOf('bahnschrift') !== -1) {
                addAxis('wght', 'Weight', 300, 900, 1, 400);
                addAxis('wdth', 'Width', 75, 100, 1, 100);
            } else if (fam.indexOf('roboto flex') !== -1) {
                addAxis('wght', 'Weight', 100, 1000, 1, 400);
                addAxis('wdth', 'Width', 25, 151, 1, 100);
                addAxis('slnt', 'Slant', -10, 0, 0.5, 0);
                addAxis('opsz', 'Optical Size', 8, 144, 0.5, 14);
            } else {
                var famFonts = font ? VariableFontPlugin.getFamilyFonts(font.family) : [];
                var hasWdth = false;
                var hasSlnt = false;
                var hasOpsz = false;
                for (var f = 0; f < famFonts.length; f++) {
                    var st = (famFonts[f].style || '').toLowerCase();
                    if (st.indexOf('cond') !== -1 || st.indexOf('wide') !== -1 || st.indexOf('ext') !== -1) hasWdth = true;
                    if (st.indexOf('italic') !== -1 || st.indexOf('oblique') !== -1 || st.indexOf('slant') !== -1) hasSlnt = true;
                    if (st.indexOf('optical') !== -1 || st.indexOf('caption') !== -1 || st.indexOf('subhead') !== -1) hasOpsz = true;
                }
                addAxis('wght', 'Weight', 100, 900, 1, 400);
                if (hasWdth) addAxis('wdth', 'Width', 50, 200, 1, 100);
                if (hasSlnt) addAxis('slnt', 'Slant', -15, 0, 0.5, 0);
                if (hasOpsz) addAxis('opsz', 'Optical Size', 6, 72, 0.5, 12);
            }
            return axes;
        }

        // STATIC FONT:
        var familyFonts = font ? VariableFontPlugin.getFamilyFonts(font.family) : [];
        if (familyFonts.length > 1) {
            addAxis('wght', 'Weight', 100, 900, 1, 400);
        }
        addAxis('wdth', 'Width', 50, 200, 1, 100);

        return axes;
    },

    /**
     * Resolve active selection into text ranges, text frames, and path items.
     * Accurately distinguishes between highlighted text range (Type tool)
     * and entire text frames (Selection tool).
     */
    resolveSelection: function(doc) {
        var res = {
            selectedTextRange: null,
            textFrames: [],
            pathItems: []
        };
        if (!doc) {
            return res;
        }

        var sel = null;
        try {
            sel = doc.selection;
        } catch (eSel) {
            return res;
        }
        if (!sel) {
            return res;
        }

        // 1. Direct TextRange selection (Type tool highlight)
        if (sel.typename === 'TextRange') {
            try {
                if (sel.contents && sel.contents.length > 0) {
                    res.selectedTextRange = sel;
                }
            } catch (eTr) {
                res.selectedTextRange = sel;
            }
            try {
                if (sel.parent && sel.parent.typename === 'TextFrame') {
                    res.textFrames.push(sel.parent);
                }
            } catch (eP) {}
            return res;
        }

        // 1b. Direct single TextFrame selection (Selection tool / Black Arrow)
        if (sel.typename === 'TextFrame') {
            res.textFrames.push(sel);
            res.selectedTextRange = null;
            return res;
        }

        // 1c. Direct single PathItem selection
        if (sel.typename === 'PathItem' || sel.typename === 'CompoundPathItem') {
            try {
                if (sel.parent && sel.parent.typename === 'TextFrame') {
                    res.textFrames.push(sel.parent);
                    return res;
                }
            } catch (ePar) {}
            res.pathItems.push(sel);
            return res;
        }

        // 2. Collection or array of selected items
        function collectItems(items) {
            if (!items) return;
            var len = 0;
            try {
                len = (items.length !== undefined) ? items.length : (items.count !== undefined ? items.count : 0);
            } catch (eLen) {}

            for (var i = 0; i < len; i++) {
                var it = null;
                try {
                    it = items[i];
                } catch (eItem) {}
                if (!it) continue;

                var tName = '';
                try {
                    tName = it.typename || '';
                } catch (eTn) {}

                if (tName === 'TextRange') {
                    if (!res.selectedTextRange) {
                        res.selectedTextRange = it;
                    }
                    try {
                        if (it.parent && it.parent.typename === 'TextFrame') {
                            var pTf = it.parent;
                            var alreadyIn = false;
                            for (var k = 0; k < res.textFrames.length; k++) {
                                if (res.textFrames[k] === pTf) { alreadyIn = true; break; }
                            }
                            if (!alreadyIn) res.textFrames.push(pTf);
                        }
                    } catch (ePTf) {}
                } else if (tName === 'TextFrame') {
                    res.textFrames.push(it);
                } else if (tName === 'PathItem' || tName === 'CompoundPathItem') {
                    try {
                        if (it.parent && it.parent.typename === 'TextFrame') {
                            res.textFrames.push(it.parent);
                            continue;
                        }
                    } catch (ePar2) {}
                    res.pathItems.push(it);
                } else if (tName === 'GroupItem') {
                    try {
                        collectItems(it.pageItems);
                    } catch (eG) {}
                }
            }
        }

        if (sel.length !== undefined || sel.count !== undefined) {
            collectItems(sel);
        }

        return res;
    },

    readItemMetadata: function(item) {
        var vals = {};
        var savedCurve = null;
        var metaFamily = null;
        var metaFontName = null;

        try {
            if (item.note && item.note.length > 0) {
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
            }
        } catch (eNote) {}

        var itemType = '';
        try {
            itemType = item.typename;
        } catch (eIt) {}

        if (itemType === 'TextFrame') {
            var tr = null;
            var font = null;
            var hScale = 100;
            var trk = 0;

            try {
                tr = item.textRange;
                if (tr) {
                    try {
                        if (tr.characterAttributes) {
                            font = tr.characterAttributes.textFont;
                            hScale = tr.characterAttributes.horizontalScale || 100;
                            trk = tr.characterAttributes.tracking || 0;
                        }
                    } catch (eCa1) {}

                    if (!font && tr.characters && tr.characters.length > 0) {
                        try {
                            var firstCharCa = tr.characters[0].characterAttributes;
                            if (firstCharCa) {
                                font = firstCharCa.textFont;
                                hScale = firstCharCa.horizontalScale || 100;
                                trk = firstCharCa.tracking || 0;
                            }
                        } catch (eCa2) {}
                    }
                }
            } catch (eTr) {}

            if (font) {
                var fam = font.family || '';
                var map = VariableFontPlugin.getFamilyAxisMapping(fam);
                var familyMatches = (!metaFamily || metaFamily.toLowerCase() === fam.toLowerCase());
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
                    else if (vals.wght === undefined) vals.wght = 400;

                    if (vals.wdth === undefined) {
                        vals.wdth = Math.round(hScale);
                    }
                }
            }
        } else if (itemType === 'PathItem' || itemType === 'CompoundPathItem') {
            try {
                if (vals.strokeWidth === undefined) {
                    vals.strokeWidth = item.stroked ? Math.round(item.strokeWidth * 10) / 10 : 2;
                }
                if (vals.opacity === undefined) {
                    vals.opacity = Math.round(item.opacity !== undefined ? item.opacity : 100);
                }
            } catch (ePathMeta) {}
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

            var resolved = VariableFontPlugin.resolveSelection(doc);
            var selectedTextRange = resolved.selectedTextRange;
            var textFrames = resolved.textFrames;
            var pathItems = resolved.pathItems;

            if (!selectedTextRange && textFrames.length === 0 && pathItems.length === 0) {
                return JSON.stringify({
                    success: true,
                    hasDoc: true,
                    hasSelection: false,
                    uiBrightness: uiBrightness,
                    message: 'Deselected',
                    documentTextFrames: VariableFontPlugin.getDocumentTextFramesList()
                });
            }

            var result = {
                success: true,
                hasDoc: true,
                hasSelection: true,
                uiBrightness: uiBrightness,
                totalSelected: selectedTextRange ? 1 : (textFrames.length || pathItems.length || 1),
                type: 'mixed',
                isTextRange: Boolean(selectedTextRange),
                fontName: '',
                fontFamily: '',
                textSnippet: '',
                isVariableFont: true,
                charCount: 0,
                axes: [],
                currentValues: {},
                savedCurve: null,
                itemCount: 1
            };

            if (selectedTextRange) {
                result.type = 'text';
                var tr = selectedTextRange;
                var font = null;
                try {
                    font = tr.characterAttributes.textFont;
                } catch (eF1) {}
                if (!font) {
                    try {
                        if (tr.characters && tr.characters.length > 0) {
                            font = tr.characters[0].characterAttributes.textFont;
                        }
                    } catch (eF2) {}
                }

                var charCount = 1;
                try {
                    charCount = tr.contents ? tr.contents.length : tr.characters.length;
                } catch (eCC1) {}
                result.charCount = charCount;
                result.itemCount = charCount;

                var fName = font ? font.name : 'Standard Font';
                var fFamily = font ? font.family : 'Standard Font';
                result.fontName = fName;
                result.fontFamily = fFamily;
                result.itemId = 'range_' + charCount + '_' + fName;

                try {
                    result.textSnippet = (tr.contents || '').substring(0, 128).replace(/[\r\n\t]+/g, ' ');
                } catch (eText1) {
                    result.textSnippet = '';
                }

                result.axes = VariableFontPlugin.detectFontAxes(font);
                result.isVariableFont = VariableFontPlugin.isVariableFont(font);

                if (textFrames.length > 0) {
                    var meta = VariableFontPlugin.readItemMetadata(textFrames[0]);
                    result.currentValues = meta.values;
                    result.savedCurve = meta.curve;
                }
            } else if (textFrames.length > 0) {
                result.type = 'text';
                var firstTf = textFrames[0];
                var tr = null;
                var font = null;
                try {
                    tr = firstTf.textRange;
                    if (tr) {
                        try {
                            font = tr.characterAttributes.textFont;
                        } catch (eF3) {}
                        if (!font && tr.characters && tr.characters.length > 0) {
                            try {
                                font = tr.characters[0].characterAttributes.textFont;
                            } catch (eF4) {}
                        }
                    }
                } catch (eTr2) {}

                var charCount = 1;
                try {
                    charCount = tr ? (tr.characters ? tr.characters.length : (tr.contents ? tr.contents.length : 1)) : (firstTf.contents ? firstTf.contents.length : 1);
                } catch (eCC2) {}
                result.charCount = charCount;
                result.itemCount = charCount;

                var fName = font ? font.name : 'Standard Font';
                var fFamily = font ? font.family : 'Standard Font';
                result.fontName = fName;
                result.fontFamily = fFamily;

                try {
                    result.itemId = firstTf.uuid || (firstTf.name ? firstTf.name : ('tf_' + charCount + '_' + Math.round(firstTf.position[0]) + '_' + Math.round(firstTf.position[1])));
                } catch (eId) {
                    result.itemId = 'tf_' + charCount;
                }

                try {
                    result.textSnippet = (firstTf.contents || '').substring(0, 128).replace(/[\r\n\t]+/g, ' ');
                } catch (eText2) {
                    result.textSnippet = '';
                }

                result.axes = VariableFontPlugin.detectFontAxes(font);
                result.isVariableFont = VariableFontPlugin.isVariableFont(font);

                var meta = VariableFontPlugin.readItemMetadata(firstTf);
                result.currentValues = meta.values;
                result.savedCurve = meta.curve;
            } else if (pathItems.length > 0) {
                result.type = 'shape';
                var firstPath = pathItems[0];
                try {
                    result.itemId = firstPath.uuid || (firstPath.name ? firstPath.name : ('path_' + Math.round(firstPath.position[0]) + '_' + Math.round(firstPath.position[1])));
                } catch (ePId) {
                    result.itemId = 'shape_' + (firstPath.typename || 'path');
                }
                result.axes = VariableFontPlugin.shapeParameters;
                result.itemCount = pathItems.length;

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
                    var tfFont = null;
                    if (tf.textRange) {
                        try {
                            if (tf.textRange.characterAttributes) {
                                tfFont = tf.textRange.characterAttributes.textFont;
                            }
                        } catch (eCaList1) {}
                        if (!tfFont && tf.textRange.characters && tf.textRange.characters.length > 0) {
                            try {
                                tfFont = tf.textRange.characters[0].characterAttributes.textFont;
                            } catch (eCaList2) {}
                        }
                    }
                    if (tfFont) {
                        fontName = tfFont.name || tfFont.family || 'Font';
                        isVar = VariableFontPlugin.isVariableFont(tfFont);
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

    findNearestFontInstance: function(family, params, fontName) {
        if (!family && !fontName) {
            return null;
        }

        var targetWght = params.wght !== undefined ? Math.round(Number(params.wght)) : null;
        var targetWdth = params.wdth !== undefined ? Math.round(Number(params.wdth)) : null;
        var targetSlnt = params.slnt !== undefined ? Math.round(Number(params.slnt) * 10) / 10 : null;
        var targetOpsz = params.opsz !== undefined ? Math.round(Number(params.opsz) * 10) / 10 : null;

        var famLower = (family || fontName || '').toLowerCase();
        var cacheKey = famLower + '|' + (fontName || '') + '|' + targetWght + '|' + targetWdth + '|' + targetSlnt + '|' + targetOpsz;
        if (VariableFontPlugin._nearestFontCache[cacheKey]) {
            return VariableFontPlugin._nearestFontCache[cacheKey];
        }

        var map = VariableFontPlugin.getFamilyAxisMapping(family);
        var candidates = VariableFontPlugin.getFamilyFonts(family, fontName);

        if (candidates.length === 0) {
            return null;
        }
        if (candidates.length === 1) {
            VariableFontPlugin._nearestFontCache[cacheKey] = candidates[0];
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
                var s = ((cand.style || '') + ' ' + (cand.name || '')).toLowerCase();
                var sWght = 400;
                if (s.indexOf('extrablack') !== -1 || s.indexOf('extra black') !== -1 || s.indexOf('ultrablack') !== -1) sWght = 950;
                else if (s.indexOf('black') !== -1 || s.indexOf('heavy') !== -1) sWght = 900;
                else if (s.indexOf('extrabold') !== -1 || s.indexOf('extra bold') !== -1 || s.indexOf('ultrabold') !== -1) sWght = 800;
                else if (s.indexOf('semibold') !== -1 || s.indexOf('semi bold') !== -1 || s.indexOf('demi') !== -1) sWght = 600;
                else if (s.indexOf('bold') !== -1) sWght = 700;
                else if (s.indexOf('medium') !== -1) sWght = 500;
                else if (s.indexOf('book') !== -1) sWght = 350;
                else if (s.indexOf('extralight') !== -1 || s.indexOf('extra light') !== -1 || s.indexOf('ultralight') !== -1) sWght = 200;
                else if (s.indexOf('light') !== -1) sWght = 300;
                else if (s.indexOf('thin') !== -1 || s.indexOf('hairline') !== -1) sWght = 100;

                var sWdth = 100;
                if (s.indexOf('ultracondensed') !== -1 || s.indexOf('ultra condensed') !== -1) sWdth = 50;
                else if (s.indexOf('extracondensed') !== -1 || s.indexOf('extra condensed') !== -1) sWdth = 62;
                else if (s.indexOf('semicondensed') !== -1 || s.indexOf('semi condensed') !== -1) sWdth = 87;
                else if (s.indexOf('condensed') !== -1 || s.indexOf('cond') !== -1) sWdth = 75;
                else if (s.indexOf('ultraexpanded') !== -1 || s.indexOf('ultra expanded') !== -1) sWdth = 200;
                else if (s.indexOf('extraexpanded') !== -1 || s.indexOf('extra expanded') !== -1) sWdth = 150;
                else if (s.indexOf('semiexpanded') !== -1 || s.indexOf('semi expanded') !== -1) sWdth = 112;
                else if (s.indexOf('expanded') !== -1 || s.indexOf('extended') !== -1 || s.indexOf('wide') !== -1) sWdth = 125;

                var isItalic = s.indexOf('italic') !== -1 || s.indexOf('oblique') !== -1;
                var targetItalic = targetSlnt !== null && targetSlnt < -2;
                var italicDiff = (isItalic === targetItalic) ? 0 : 300;

                var wDiff = targetWght !== null ? Math.abs(sWght - targetWght) : 0;
                var wdDiff = targetWdth !== null ? Math.abs(sWdth - targetWdth) * 4 : 0;
                dist = wDiff + wdDiff + italicDiff;
            }

            if (dist < minD) {
                minD = dist;
                best = cand;
            }
        }

        if (best) {
            VariableFontPlugin._nearestFontCache[cacheKey] = best;
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

            VariableFontPlugin.cleanDefaultCharacterStyle(doc);

            var resolved = VariableFontPlugin.resolveSelection(doc);
            var selectedTextRange = resolved.selectedTextRange;
            var textFrames = resolved.textFrames;
            var pathItems = resolved.pathItems;

            if (!selectedTextRange && textFrames.length === 0 && pathItems.length === 0) {
                return JSON.stringify({ success: false, message: 'No selection' });
            }

            if (selectedTextRange) {
                var curFont = null;
                try {
                    curFont = selectedTextRange.characterAttributes.textFont;
                } catch(eCf1) {}
                if (!curFont && selectedTextRange.characters && selectedTextRange.characters.length > 0) {
                    try { curFont = selectedTextRange.characters[0].characterAttributes.textFont; } catch(eCf2) {}
                }

                if (curFont && (params.wght !== undefined || params.wdth !== undefined || params.slnt !== undefined || params.opsz !== undefined)) {
                    var targetF = VariableFontPlugin.findNearestFontInstance(curFont.family, params, curFont.name);
                    if (targetF) {
                        try {
                            selectedTextRange.characterAttributes.textFont = targetF;
                        } catch(eSetF) {}
                        try {
                            var chs = selectedTextRange.characters;
                            for (var ci = 0; ci < chs.length; ci++) {
                                try { chs[ci].characterAttributes.textFont = targetF; } catch(eChF) {}
                            }
                        } catch(eLoopCh) {}
                    }
                }

                if (curFont) {
                    var map = VariableFontPlugin.getFamilyAxisMapping(curFont.family);
                    if (!map.wdth && params.wdth !== undefined) {
                        var hs = Math.max(25, Math.min(250, Number(params.wdth)));
                        try {
                            selectedTextRange.characterAttributes.horizontalScale = hs;
                        } catch(eHs) {}
                        try {
                            var chs = selectedTextRange.characters;
                            for (var ci = 0; ci < chs.length; ci++) {
                                try { chs[ci].characterAttributes.horizontalScale = hs; } catch(eChHs) {}
                            }
                        } catch(eLoopHs) {}
                    } else if (map.wdth) {
                        try { selectedTextRange.characterAttributes.horizontalScale = 100; } catch(eHs100) {}
                    }
                }

                try {
                    if (selectedTextRange.parent && selectedTextRange.parent.typename === 'TextFrame') {
                        VariableFontPlugin.saveItemMetadata(selectedTextRange.parent, params, null);
                    }
                } catch (e) {}
            } else if (textFrames.length > 0) {
                for (var i = 0; i < textFrames.length; i++) {
                    var item = textFrames[i];
                    var curFont = null;
                    try {
                        curFont = item.textRange.characterAttributes.textFont;
                    } catch(eCf3) {}
                    if (!curFont && item.textRange.characters && item.textRange.characters.length > 0) {
                        try { curFont = item.textRange.characters[0].characterAttributes.textFont; } catch(eCf4) {}
                    }

                    if (curFont && (params.wght !== undefined || params.wdth !== undefined || params.slnt !== undefined || params.opsz !== undefined)) {
                        var targetF = VariableFontPlugin.findNearestFontInstance(curFont.family, params, curFont.name);
                        if (targetF) {
                            try {
                                item.textRange.characterAttributes.textFont = targetF;
                            } catch(eSetF2) {}
                            try {
                                var chs = item.textRange.characters;
                                for (var ci = 0; ci < chs.length; ci++) {
                                    try { chs[ci].characterAttributes.textFont = targetF; } catch(eChF2) {}
                                }
                            } catch(eLoopCh2) {}
                        }
                    }

                    if (curFont) {
                        var map = VariableFontPlugin.getFamilyAxisMapping(curFont.family);
                        if (!map.wdth && params.wdth !== undefined) {
                            var hs = Math.max(25, Math.min(250, Number(params.wdth)));
                            try {
                                item.textRange.characterAttributes.horizontalScale = hs;
                            } catch(eHs2) {}
                            try {
                                var chs = item.textRange.characters;
                                for (var ci = 0; ci < chs.length; ci++) {
                                    try { chs[ci].characterAttributes.horizontalScale = hs; } catch(eChHs2) {}
                                }
                            } catch(eLoopHs2) {}
                        } else if (map.wdth) {
                            try { item.textRange.characterAttributes.horizontalScale = 100; } catch(eHs1002) {}
                        }
                    }

                    VariableFontPlugin.saveItemMetadata(item, params, null);
                }
            } else if (pathItems.length > 0) {
                for (var j = 0; j < pathItems.length; j++) {
                    var pItem = pathItems[j];
                    if (params.strokeWidth !== undefined) {
                        pItem.stroked = true;
                        pItem.strokeWidth = Number(params.strokeWidth);
                    }
                    if (params.opacity !== undefined) {
                        pItem.opacity = Math.max(0, Math.min(100, Number(params.opacity)));
                    }
                    VariableFontPlugin.saveItemMetadata(pItem, params, null);
                }
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

            var resolved = VariableFontPlugin.resolveSelection(doc);
            var selectedTextRange = resolved.selectedTextRange;
            var textFrames = resolved.textFrames;
            var pathItems = resolved.pathItems;

            if (!selectedTextRange && textFrames.length === 0 && pathItems.length === 0) {
                return JSON.stringify({ success: false, message: 'No selection' });
            }

            var curveList = [];
            if (config.curves && config.curves.length > 0) {
                curveList = config.curves;
            } else if (config.distributedValues) {
                curveList = [config];
            }

            var mode = config.distributionTarget || 'characters';

            if (selectedTextRange) {
                var chars = selectedTextRange.characters;
                var count = chars.length;
                if (count > 128) {
                    return JSON.stringify({ success: false, message: 'Character count exceeds limit (max 128)' });
                }
                if (count > 0 && curveList.length > 0) {
                    for (var c = 0; c < count; c++) {
                        var normIndex = count > 1 ? c / (count - 1) : 0;
                        var charAttr = null;
                        try { charAttr = chars[c].characterAttributes; } catch(eCa) {}
                        if (!charAttr) continue;

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

                        var charFont = null;
                        try { charFont = charAttr.textFont; } catch(eCf) {}
                        if (charFont) {
                            var targetF = VariableFontPlugin.findNearestFontInstance(charFont.family, p, charFont.name);
                            if (targetF) {
                                try { charAttr.textFont = targetF; } catch(eSetTf) {}
                            }
                            var map = VariableFontPlugin.getFamilyAxisMapping(charFont.family);
                            if (p.wdth !== undefined) {
                                if (map.wdth) {
                                    try { charAttr.horizontalScale = 100; } catch(eHs) {}
                                } else {
                                    try { charAttr.horizontalScale = Math.max(25, Math.min(250, Number(p.wdth))); } catch(eHs2) {}
                                }
                            }
                        }
                    }
                }
                try {
                    if (selectedTextRange.parent && selectedTextRange.parent.typename === 'TextFrame') {
                        VariableFontPlugin.saveItemMetadata(selectedTextRange.parent, null, config);
                    }
                } catch (e) {}
            } else if (mode === 'characters' && textFrames.length > 0) {
                var tf = textFrames[0];
                var chars = tf.textRange.characters;
                var count = chars.length;
                if (count > 128) {
                    return JSON.stringify({ success: false, message: 'Character count exceeds limit (max 128)' });
                }
                if (count > 0 && curveList.length > 0) {
                    for (var c = 0; c < count; c++) {
                        var normIndex = count > 1 ? c / (count - 1) : 0;
                        var charAttr = null;
                        try { charAttr = chars[c].characterAttributes; } catch(eCaTf) {}
                        if (!charAttr) continue;

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

                        var charFont = null;
                        try { charFont = charAttr.textFont; } catch(eCfTf) {}
                        if (charFont) {
                            var targetF = VariableFontPlugin.findNearestFontInstance(charFont.family, p, charFont.name);
                            if (targetF) {
                                try { charAttr.textFont = targetF; } catch(eSetTf2) {}
                            }
                            var map = VariableFontPlugin.getFamilyAxisMapping(charFont.family);
                            if (p.wdth !== undefined) {
                                if (map.wdth) {
                                    try { charAttr.horizontalScale = 100; } catch(eHs3) {}
                                } else {
                                    try { charAttr.horizontalScale = Math.max(25, Math.min(250, Number(p.wdth))); } catch(eHs4) {}
                                }
                            }
                        }
                    }
                }
                VariableFontPlugin.saveItemMetadata(tf, null, config);
            } else {
                var targetItems = textFrames.length > 0 ? textFrames : pathItems;
                var itemCount = targetItems.length;
                if (itemCount > 0 && curveList.length > 0) {
                    for (var i = 0; i < itemCount; i++) {
                        var norm = itemCount > 1 ? i / (itemCount - 1) : 0;
                        var it = targetItems[i];

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
                            var tr = it.textRange;
                            var ca = null;
                            var curF = null;
                            try {
                                ca = tr.characterAttributes;
                                if (ca) curF = ca.textFont;
                            } catch(eCaIt) {}
                            if (!curF && tr && tr.characters && tr.characters.length > 0) {
                                try { curF = tr.characters[0].characterAttributes.textFont; } catch(eChIt) {}
                            }
                            if (curF) {
                                var targetF = VariableFontPlugin.findNearestFontInstance(curF.family, p, curF.name);
                                if (targetF && ca) {
                                    try { ca.textFont = targetF; } catch(eSetTf3) {}
                                    try {
                                        var chs = tr.characters;
                                        for (var ci = 0; ci < chs.length; ci++) {
                                            try { chs[ci].characterAttributes.textFont = targetF; } catch(eChF3) {}
                                        }
                                    } catch(eLoopCh3) {}
                                }
                                var map = VariableFontPlugin.getFamilyAxisMapping(curF.family);
                                if (p.wdth !== undefined && ca) {
                                    var hs = map.wdth ? 100 : Math.max(25, Math.min(250, Number(p.wdth)));
                                    try { ca.horizontalScale = hs; } catch(eHs5) {}
                                    try {
                                        var chs = tr.characters;
                                        for (var ci = 0; ci < chs.length; ci++) {
                                            try { chs[ci].characterAttributes.horizontalScale = hs; } catch(eChHs5) {}
                                        }
                                    } catch(eLoopHs3) {}
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
            return JSON.stringify({ success: true, count: selectedTextRange ? 1 : (textFrames.length || pathItems.length || 1) });
        } catch (e) {
            return JSON.stringify({ success: false, error: e.toString(), line: e.line });
        }
    }
};

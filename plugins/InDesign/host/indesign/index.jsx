/**
 * Variable Font & Dynamic Parameter Controller - ExtendScript Engine
 * Adobe InDesign Host Script
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
    appName: 'indesign',

    shapeParameters: [
        { id: 'strokeWidth', name: 'Stroke Weight (pt)', min: 0.5, max: 50, step: 0.5, defaultVal: 2 },
        { id: 'opacity', name: 'Opacity (%)', min: 0, max: 100, step: 1, defaultVal: 100 }
    ],

    _familyCache: {},

    /**
     * Extract primary text object from any InDesign selection (TextFrame, Text, Word, Character, Paragraph, InsertionPoint, Story)
     */
    getTextObject: function(item) {
        if (!item) return null;
        try {
            var cName = item.constructor ? item.constructor.name : '';
            if (cName === 'TextFrame' || item.typename === 'TextFrame') {
                if (item.texts && item.texts.length > 0) return item.texts[0];
                if (item.parentStory) return item.parentStory;
            }
            if (item.hasOwnProperty('appliedFont') || item.hasOwnProperty('contents') || cName === 'Text' || cName === 'Word' || cName === 'Character' || cName === 'Paragraph' || cName === 'Story' || cName === 'InsertionPoint') {
                return item;
            }
        } catch(e) {}
        return null;
    },

    getFontFamilyInstances: function(familyName) {
        if (!familyName) return [];
        var famKey = familyName.toLowerCase();
        if (this._familyCache[famKey]) {
            return this._familyCache[famKey];
        }

        var list = [];
        try {
            var fonts = app.fonts;
            for (var i = 0; i < fonts.length; i++) {
                try {
                    var f = fonts[i];
                    if (f.fontFamily && f.fontFamily.toLowerCase() === famKey) {
                        list.push(f);
                    }
                } catch(e) {}
            }
        } catch(e) {}

        this._familyCache[famKey] = list;
        return list;
    },

    /**
     * Inspect font for actual OpenType Variable axes in InDesign
     */
    detectFontAxes: function(appliedFont) {
        var axes = [];
        if (!appliedFont) return axes;

        try {
            // Check native InDesign designAxes or fontVariations on font object
            if (typeof appliedFont === 'object' && appliedFont.designAxes && appliedFont.designAxes.length > 0) {
                for (var a = 0; a < appliedFont.designAxes.length; a++) {
                    var ax = appliedFont.designAxes[a];
                    axes.push({
                        id: ax.tag || ax.name.toLowerCase(),
                        name: ax.name || ax.tag,
                        min: ax.min !== undefined ? ax.min : 0,
                        max: ax.max !== undefined ? ax.max : 100,
                        step: 1,
                        defaultVal: ax.defaultValue !== undefined ? ax.defaultValue : ax.min
                    });
                }
                return axes;
            }
        } catch(e1) {}

        var famName = '';
        try {
            famName = typeof appliedFont === 'string' ? appliedFont.split('\t')[0] : (appliedFont.fontFamily || appliedFont.name || '');
        } catch(e2) {}

        var instances = VariableFontPlugin.getFontFamilyInstances(famName);

        // If the font family has variable font instances or style variations
        if (instances.length > 1) {
            var hasWeight = false;
            var hasWidth = false;

            for (var i = 0; i < instances.length; i++) {
                var st = (instances[i].fontStyleName || instances[i].name || '').toLowerCase();
                if (st.indexOf('bold') !== -1 || st.indexOf('light') !== -1 || st.indexOf('thin') !== -1 || st.indexOf('medium') !== -1 || st.indexOf('black') !== -1) {
                    hasWeight = true;
                }
                if (st.indexOf('cond') !== -1 || st.indexOf('expand') !== -1 || st.indexOf('narrow') !== -1) {
                    hasWidth = true;
                }
            }

            if (hasWeight) {
                axes.push({ id: 'wght', name: 'Weight', min: 100, max: 900, step: 1, defaultVal: 400 });
            }
            if (hasWidth) {
                axes.push({ id: 'wdth', name: 'Width / Scale (%)', min: 50, max: 200, step: 1, defaultVal: 100 });
            }
        }

        return axes;
    },

    findNearestInDesignFont: function(familyName, targetWght) {
        var instances = VariableFontPlugin.getFontFamilyInstances(familyName);
        if (instances.length === 0) return null;

        var best = instances[0];
        var minDiff = 9999;

        for (var i = 0; i < instances.length; i++) {
            var inst = instances[i];
            var styleName = (inst.fontStyleName || inst.name || '').toLowerCase();
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
                best = inst;
            }
        }

        return best;
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
                    message: 'No document open in InDesign.'
                });
            }

            var doc = app.activeDocument;
            var sel = app.selection;

            if (!sel || sel.length === 0) {
                return JSON.stringify({
                    success: true,
                    hasDoc: true,
                    hasSelection: false,
                    message: 'Deselected',
                    documentTextFrames: VariableFontPlugin.getDocumentTextFramesList()
                });
            }

            var rawItem = sel[0];
            var textObj = VariableFontPlugin.getTextObject(rawItem);
            var isText = (textObj !== null);

            var result = {
                success: true,
                hasDoc: true,
                hasSelection: true,
                totalSelected: sel.length,
                type: isText ? 'text' : 'shape',
                fontName: '',
                fontFamily: '',
                textSnippet: '',
                isVariableFont: false,
                charCount: 0,
                axes: [],
                currentValues: {},
                savedCurve: null,
                itemCount: sel.length
            };

            if (isText) {
                var contents = textObj.contents || '';
                if (typeof contents === 'object' && contents.join) {
                    contents = contents.join('');
                }
                result.textSnippet = String(contents).substring(0, 64).replace(/[\r\n\t]+/g, ' ');
                result.charCount = String(contents).length;

                var fontObj = textObj.appliedFont;
                var fontName = 'Standard Font';
                var familyName = 'Standard';

                if (fontObj) {
                    fontName = typeof fontObj === 'string' ? fontObj : (fontObj.name || fontObj.fontFamily || 'Font');
                    familyName = typeof fontObj === 'string' ? fontObj.split('\t')[0] : (fontObj.fontFamily || fontName);
                }

                result.fontName = fontName;
                result.fontFamily = familyName;

                result.axes = VariableFontPlugin.detectFontAxes(fontObj);
                result.isVariableFont = (result.axes.length > 0);

                var curWght = 400;
                var styleName = '';
                try { styleName = (textObj.fontStyle || fontName).toLowerCase(); } catch(eStyle) {}

                if (styleName.indexOf('thin') !== -1 || styleName.indexOf('hairline') !== -1) curWght = 100;
                else if (styleName.indexOf('light') !== -1) curWght = 300;
                else if (styleName.indexOf('medium') !== -1) curWght = 500;
                else if (styleName.indexOf('semibold') !== -1) curWght = 600;
                else if (styleName.indexOf('bold') !== -1) curWght = 700;
                else if (styleName.indexOf('black') !== -1) curWght = 900;

                var trk = 0;
                try { trk = Math.round(textObj.tracking || 0); } catch(eT) {}
                var scale = 100;
                try { scale = Math.round(textObj.horizontalScale || 100); } catch(eS) {}

                result.currentValues = {
                    wght: curWght,
                    wdth: scale,
                    tracking: trk
                };
            } else {
                result.axes = VariableFontPlugin.shapeParameters;
                var strokeW = 2;
                try { strokeW = rawItem.strokeWeight || 2; } catch(e1) {}
                var op = 100;
                try {
                    if (rawItem.transparencySettings && rawItem.transparencySettings.blendingSettings) {
                        op = rawItem.transparencySettings.blendingSettings.opacity;
                    } else if (rawItem.itemOpacity !== undefined) {
                        op = rawItem.itemOpacity;
                    }
                } catch(e2) {}

                result.currentValues = {
                    strokeWidth: Math.round(strokeW * 10) / 10,
                    opacity: Math.round(op)
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
            var tfs = doc.textFrames;
            var maxCount = Math.min(tfs.length, 50);

            for (var i = 0; i < maxCount; i++) {
                var tf = tfs[i];
                var rawContents = '';
                try { rawContents = tf.contents || ''; } catch(e) {}
                var snippet = String(rawContents).replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ');
                if (snippet.length > 40) snippet = snippet.substring(0, 40) + '...';
                if (!snippet) snippet = '[Empty Text Frame]';

                var fontName = 'InDesign Font';
                try {
                    var tObj = VariableFontPlugin.getTextObject(tf);
                    if (tObj && tObj.appliedFont) {
                        fontName = typeof tObj.appliedFont === 'string' ? tObj.appliedFont : (tObj.appliedFont.name || tObj.appliedFont.fontFamily);
                    }
                } catch(eF) {}

                list.push({
                    index: i,
                    text: snippet,
                    snippet: snippet,
                    fontName: fontName,
                    isVariable: true,
                    charCount: String(rawContents).length
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

            var targetTf = doc.textFrames[index];
            app.select(targetTf, SelectionOptions.REPLACE_WITH);
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
            var sel = app.selection;

            if (!sel || sel.length === 0) {
                return JSON.stringify({ success: false, message: 'No selection' });
            }

            for (var i = 0; i < sel.length; i++) {
                var rawItem = sel[i];
                var textObj = VariableFontPlugin.getTextObject(rawItem);

                if (textObj) {
                    if (params.wght !== undefined && textObj.appliedFont) {
                        var fam = typeof textObj.appliedFont === 'string' ? textObj.appliedFont.split('\t')[0] : (textObj.appliedFont.fontFamily || '');
                        var matchedFont = VariableFontPlugin.findNearestInDesignFont(fam, Number(params.wght));
                        if (matchedFont) {
                            try { textObj.appliedFont = matchedFont; } catch(eF) {}
                        }
                    }

                    if (params.wdth !== undefined) {
                        try { textObj.horizontalScale = Math.max(25, Math.min(250, Number(params.wdth))); } catch(eW) {}
                    }

                    if (params.tracking !== undefined) {
                        try { textObj.tracking = Number(params.tracking); } catch(eT) {}
                    }
                } else {
                    if (params.strokeWidth !== undefined) {
                        try { rawItem.strokeWeight = Number(params.strokeWidth); } catch(eS) {}
                    }
                    if (params.opacity !== undefined) {
                        try {
                            if (rawItem.transparencySettings && rawItem.transparencySettings.blendingSettings) {
                                rawItem.transparencySettings.blendingSettings.opacity = Number(params.opacity);
                            } else if (rawItem.itemOpacity !== undefined) {
                                rawItem.itemOpacity = Number(params.opacity);
                            }
                        } catch(eO) {}
                    }
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
            var sel = app.selection;

            if (!sel || sel.length === 0) {
                return JSON.stringify({ success: false, message: 'No selection' });
            }

            var curveList = [];
            if (config.curves && config.curves.length > 0) {
                curveList = config.curves;
            } else if (config.distributedValues) {
                curveList = [config];
            }

            var mode = config.distributionTarget || 'characters';

            if (mode === 'characters' && sel.length === 1 && sel[0].characters) {
                var tf = sel[0];
                var chars = tf.characters;
                var count = chars.length;

                for (var c = 0; c < count; c++) {
                    var normIndex = count > 1 ? c / (count - 1) : 0;
                    var ch = chars[c];

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

                    if (p.wght !== undefined && ch.appliedFont) {
                        var fam = typeof ch.appliedFont === 'string' ? ch.appliedFont.split('\t')[0] : (ch.appliedFont.fontFamily || '');
                        var matchedFont = VariableFontPlugin.findNearestInDesignFont(fam, Number(p.wght));
                        if (matchedFont) {
                            try { ch.appliedFont = matchedFont; } catch(eF) {}
                        }
                    }
                    if (p.wdth !== undefined) {
                        try { ch.horizontalScale = Math.max(25, Math.min(250, Number(p.wdth))); } catch(eW) {}
                    }
                    if (p.tracking !== undefined) {
                        try { ch.tracking = Number(p.tracking); } catch(eT) {}
                    }
                }
            } else {
                var itemCount = sel.length;
                for (var i = 0; i < itemCount; i++) {
                    var norm = itemCount > 1 ? i / (itemCount - 1) : 0;
                    var rawItem = sel[i];
                    var textObj = VariableFontPlugin.getTextObject(rawItem);

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

                    if (textObj) {
                        if (p.wght !== undefined && textObj.appliedFont) {
                            var fam = typeof textObj.appliedFont === 'string' ? textObj.appliedFont.split('\t')[0] : (textObj.appliedFont.fontFamily || '');
                            var matchedFont = VariableFontPlugin.findNearestInDesignFont(fam, Number(p.wght));
                            if (matchedFont) {
                                try { textObj.appliedFont = matchedFont; } catch(eF) {}
                            }
                        }
                        if (p.wdth !== undefined) {
                            try { textObj.horizontalScale = Math.max(25, Math.min(250, Number(p.wdth))); } catch(eW) {}
                        }
                        if (p.tracking !== undefined) {
                            try { textObj.tracking = Number(p.tracking); } catch(eT) {}
                        }
                    } else {
                        if (p.strokeWidth !== undefined) {
                            try { rawItem.strokeWeight = Number(p.strokeWidth); } catch(eS) {}
                        }
                        if (p.opacity !== undefined) {
                            try {
                                if (rawItem.transparencySettings && rawItem.transparencySettings.blendingSettings) {
                                    rawItem.transparencySettings.blendingSettings.opacity = Number(p.opacity);
                                } else if (rawItem.itemOpacity !== undefined) {
                                    rawItem.itemOpacity = Number(p.opacity);
                                }
                            } catch(eO) {}
                        }
                    }
                }
            }

            return JSON.stringify({ success: true, count: sel.length });
        } catch (e) {
            return JSON.stringify({ success: false, error: e.toString() });
        }
    }
};

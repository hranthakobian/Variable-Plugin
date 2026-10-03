/**
 * CSInterface - v7.0.0
 * Adobe Common Extensibility Platform Interface
 * Follows K&R / 1TBS brace formatting.
 */

function CSInterface() {
}

CSInterface.THEME_COLOR_CHANGED_EVENT = "com.adobe.csxs.events.ThemeColorChanged";

/**
 * User Colors
 */
function RGBColor(red, green, blue, alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
}

function Direction(x, y) {
    this.x = x;
    this.y = y;
}

function GradientStop(offset, rgbColor) {
    this.offset = offset;
    this.rgbColor = rgbColor;
}

function GradientColor(type, direction, numStops, arrGradientStop) {
    this.type = type;
    this.direction = direction;
    this.numStops = numStops;
    this.arrGradientStop = arrGradientStop;
}

function UIColor(type, antialiasLevel, color) {
    this.type = type;
    this.antialiasLevel = antialiasLevel;
    this.color = color;
}

function AppSkinInfo(baseFontFamily, baseFontSize, appBarBackgroundColor, panelBackgroundColor, appBarBackgroundColorSRGB, panelBackgroundColorSRGB, systemHighlightColor) {
    this.baseFontFamily = baseFontFamily;
    this.baseFontSize = baseFontSize;
    this.appBarBackgroundColor = appBarBackgroundColor;
    this.panelBackgroundColor = panelBackgroundColor;
    this.appBarBackgroundColorSRGB = appBarBackgroundColorSRGB;
    this.panelBackgroundColorSRGB = panelBackgroundColorSRGB;
    this.systemHighlightColor = systemHighlightColor;
}

function HostEnvironment(appId, appVersion, appLocale, appUILocale, appIdVersion, isAppOnline, appSkinInfo) {
    this.appId = appId;
    this.appVersion = appVersion;
    this.appLocale = appLocale;
    this.appUILocale = appUILocale;
    this.appIdVersion = appIdVersion;
    this.isAppOnline = isAppOnline;
    this.appSkinInfo = appSkinInfo;
}

function HostCapabilities(extentionLifecycle, supportOnlySynchronousEvents) {
    this.extentionLifecycle = extentionLifecycle;
    this.supportOnlySynchronousEvents = supportOnlySynchronousEvents;
}

function SystemPath() {
}
SystemPath.USER_DATA = "userData";
SystemPath.COMMON_FILES = "commonFiles";
SystemPath.MY_DOCUMENTS = "myDocuments";
SystemPath.APPLICATION = "application";
SystemPath.EXTENSION = "extension";
SystemPath.HOST_APPLICATION = "hostApplication";

function ColorType() {
}
ColorType.RGB = "rgb";
ColorType.GRADIENT = "gradient";

function CSEvent(type, scope, appId, extensionId) {
    this.type = type;
    this.scope = scope || "GLOBAL";
    this.appId = appId || "ILST";
    this.extensionId = extensionId || "";
    this.data = "";
}

/**
 * Host communication
 */
CSInterface.prototype.getHostEnvironment = function() {
    var cStr = window.__adobe_cep__ ? window.__adobe_cep__.getHostEnvironment() : null;
    if (!cStr) {
        return new HostEnvironment("ILST", "28.0", "en_US", "en_US", "ILST-28.0", true, new AppSkinInfo("Adobe Clean", 12, null, null, null, null, null));
    }
    return JSON.parse(cStr);
};

CSInterface.prototype.evalScript = function(script, callback) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.evalScript(script, callback);
    } else {
        if (callback) {
            callback(JSON.stringify({ success: false, error: 'CEP environment not detected' }));
        }
    }
};

CSInterface.prototype.addEventListener = function(type, listener, obj) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.addEventListener(type, listener, obj);
    } else {
        window.addEventListener(type, listener);
    }
};

CSInterface.prototype.removeEventListener = function(type, listener, obj) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.removeEventListener(type, listener, obj);
    } else {
        window.removeEventListener(type, listener);
    }
};

CSInterface.prototype.requestOpenExtension = function(extensionId, params) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.requestOpenExtension(extensionId, params);
    }
};

CSInterface.prototype.getSystemPath = function(pathType) {
    if (window.__adobe_cep__) {
        return window.__adobe_cep__.getSystemPath(pathType);
    }
    return "/";
};

CSInterface.prototype.closeExtension = function() {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.closeExtension();
    } else {
        window.close();
    }
};

/**
 * Variable Font & Dynamic Parameter Controller - ExtendScript Master Dispatcher
 * Multi-Host Auto-Detector for Adobe Illustrator, InDesign, and Photoshop
 */

(function() {
    'use strict';
    
    var scriptFile = new File($.fileName);
    var hostDir = scriptFile.parent;
    
    var appName = (typeof app !== 'undefined' && app.name) ? app.name.toLowerCase() : '';
    if (!appName && typeof BridgeTalk !== 'undefined' && BridgeTalk.appName) {
        appName = BridgeTalk.appName.toLowerCase();
    }
    
    var targetEngine = null;
    
    if (appName.indexOf('illustrator') !== -1) {
        targetEngine = new File(hostDir.fullName + '/illustrator/index.jsx');
    } else if (appName.indexOf('indesign') !== -1) {
        targetEngine = new File(hostDir.fullName + '/indesign/index.jsx');
    } else if (appName.indexOf('photoshop') !== -1) {
        targetEngine = new File(hostDir.fullName + '/photoshop/index.jsx');
    } else {
        // Fallback to Illustrator engine
        targetEngine = new File(hostDir.fullName + '/illustrator/index.jsx');
    }
    
    if (targetEngine && targetEngine.exists) {
        $.evalFile(targetEngine);
    }
})();

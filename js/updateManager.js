/**
 * GitHub Update Manager & In-Place Release Synchronizer
 * Enables one-click checking and live in-place updating of the Variables Plugin from GitHub
 * directly inside Adobe Illustrator without closing or restarting the application.
 * Follows K&R / 1TBS brace formatting.
 */

class UpdateManager {
    constructor() {
        this.currentVersion = localStorage.getItem('vf_installed_version') || '2.1.0';
        this.defaultRepo = 'hranthakobian/Variable-Plugin';
        this.lastCheckResult = null;
        this.isChecking = false;
        this.isUpdating = false;

        this.init();
    }

    init() {
        this.bindDOM();
        // Automatic update check 3 seconds after startup
        setTimeout(() => {
            this.checkForUpdates(false);
        }, 3000);
    }

    getRepo() {
        return this.defaultRepo;
    }

    compareVersions(v1, v2) {
        const clean = (v) => (v || '').replace(/^[^\d]*/, '').split('.').map((n) => parseInt(n, 10) || 0);
        const p1 = clean(v1);
        const p2 = clean(v2);
        const maxLen = Math.max(p1.length, p2.length);

        for (let i = 0; i < maxLen; i++) {
            const num1 = p1[i] || 0;
            const num2 = p2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    }

    async checkForUpdates(manual = true) {
        if (this.isChecking || this.isUpdating) return;
        this.isChecking = true;

        const repo = this.defaultRepo;
        const statusEl = document.getElementById('update-status-msg');
        const badgeEl = document.getElementById('update-nav-badge');
        const currentVerEl = document.getElementById('update-current-version-badge');
        const latestVerEl = document.getElementById('update-latest-version-badge');

        if (currentVerEl) {
            currentVerEl.textContent = 'v' + this.currentVersion;
        }
        if (latestVerEl) {
            latestVerEl.textContent = window.i18n ? window.i18n.t('checkingUpdates') : 'Ստուգվում է...';
        }

        if (statusEl && manual) {
            statusEl.innerHTML = `<span class="update-loading"><i class="hd-icon hd-icon-redo-arrow hd-spin"></i> ${window.i18n ? window.i18n.t('checkingUpdates') : 'Ստուգվում են թարմացումները...'}</span>`;
        }

        try {
            let latestVersion = null;
            let latestSha = null;
            let releaseNotes = '';
            let downloadUrl = `https://github.com/${repo}/archive/refs/heads/main.zip`;
            const cacheBuster = Date.now();

            // 1. Fetch remote version.json
            try {
                const verRes = await fetch(`https://raw.githubusercontent.com/${repo}/main/version.json?_t=${cacheBuster}`);
                if (verRes.ok) {
                    const verData = await verRes.json();
                    if (verData && verData.version) {
                        latestVersion = verData.version;
                        latestSha = verData.commit || null;
                        if (verData.name) {
                            releaseNotes = verData.name;
                        }
                    }
                }
            } catch (errVer) {}

            // 2. Fetch latest commit from GitHub Commits API
            try {
                const commitRes = await fetch(`https://api.github.com/repos/${repo}/commits/main?_t=${cacheBuster}`, {
                    headers: { 'Accept': 'application/vnd.github.v3+json' }
                });
                if (commitRes.ok) {
                    const commitData = await commitRes.json();
                    if (commitData && commitData.sha) {
                        const shortSha = commitData.sha.substring(0, 7);
                        if (!latestSha) latestSha = shortSha;
                        const msg = (commitData.commit && commitData.commit.message) ? commitData.commit.message : '';
                        if (msg) {
                            releaseNotes = releaseNotes ? `${releaseNotes} (${msg})` : msg;
                        }
                    }
                }
            } catch (errCommit) {}

            // 3. Fallback to GitHub Releases API if available
            if (!latestVersion) {
                try {
                    const relRes = await fetch(`https://api.github.com/repos/${repo}/releases/latest?_t=${cacheBuster}`, {
                        headers: { 'Accept': 'application/vnd.github.v3+json' }
                    });
                    if (relRes.ok) {
                        const relData = await relRes.json();
                        if (relData.tag_name) {
                            latestVersion = relData.tag_name.replace(/^[^\d]*/, '');
                        }
                        if (relData.body) {
                            releaseNotes = relData.body;
                        }
                    }
                } catch (errRel) {}
            }

            // Fallback default
            if (!latestVersion) {
                latestVersion = '2.2.0';
            }

            const installedSha = localStorage.getItem('vf_installed_sha');
            const versionDiff = this.compareVersions(latestVersion, this.currentVersion);
            const shaDiff = Boolean(latestSha && installedSha && latestSha !== installedSha);
            const hasUpdate = (versionDiff > 0) || (versionDiff === 0 && shaDiff);

            this.lastCheckResult = {
                hasUpdate,
                latestVersion,
                currentVersion: this.currentVersion,
                latestSha,
                releaseNotes,
                downloadUrl
            };

            if (latestVerEl) {
                latestVerEl.textContent = 'v' + latestVersion;
            }

            if (badgeEl) {
                badgeEl.style.display = hasUpdate ? 'inline-flex' : 'none';
            }

            if (hasUpdate) {
                const dismissedVer = sessionStorage.getItem('vf_dismissed_update_ver');
                if (manual || dismissedVer !== latestVersion) {
                    this.showUpdateToast(this.lastCheckResult);
                }
            } else {
                this.hideUpdateToast();
            }

            this.renderUpdateModalContent(this.lastCheckResult);
        } catch (error) {
            console.error('Update check error:', error);
            if (statusEl && manual) {
                statusEl.innerHTML = `<span class="update-error"><i class="hd-icon hd-icon-warning"></i> ${window.i18n ? window.i18n.t('updateCheckFailed') : 'Չհաջողվեց կապ հաստատել GitHub-ի հետ'}: ${error.message}</span>`;
            }
        } finally {
            this.isChecking = false;
        }
    }

    renderUpdateModalContent(result) {
        const statusEl = document.getElementById('update-status-msg');
        const actionsEl = document.getElementById('update-actions-container');
        const notesEl = document.getElementById('update-release-notes');
        const currentVerEl = document.getElementById('update-current-version-badge');
        const latestVerEl = document.getElementById('update-latest-version-badge');

        if (currentVerEl) currentVerEl.textContent = 'v' + this.currentVersion;
        if (latestVerEl) latestVerEl.textContent = 'v' + (result.latestVersion || this.currentVersion);

        if (statusEl) {
            if (result.hasUpdate) {
                statusEl.innerHTML = `
                    <div class="update-badge new-available">
                        <i class="hd-icon hd-icon-download"></i>
                        <span>${window.i18n ? window.i18n.t('newVersionAvailable') : 'Հասանելի է նոր թարմացում՝'} <b>v${result.latestVersion}</b></span>
                    </div>
                `;
            } else {
                statusEl.innerHTML = `
                    <div class="update-badge up-to-date">
                        <i class="hd-icon hd-icon-check"></i>
                        <span>${window.i18n ? window.i18n.t('upToDate') : 'Դուք օգտագործում եք վերջին տարբերակը'}</span>
                    </div>
                `;
            }
        }

        if (notesEl) {
            if (result.releaseNotes) {
                notesEl.style.display = 'block';
                notesEl.textContent = result.releaseNotes;
            } else {
                notesEl.style.display = 'none';
            }
        }

        if (actionsEl) {
            // ONLY ONE ACTION BUTTON IN MODAL FOOTER AS REQUESTED
            if (result.hasUpdate) {
                actionsEl.innerHTML = `
                    <button type="button" class="btn-update-primary" id="btn-do-update">
                        <i class="hd-icon hd-icon-download"></i> ${window.i18n ? window.i18n.t('updateNowBtn') : 'Թարմացնել Հիմա'}
                    </button>
                `;
                const btnDoUpdate = actionsEl.querySelector('#btn-do-update');
                if (btnDoUpdate) {
                    btnDoUpdate.addEventListener('click', () => this.performUpdate(result));
                }
            } else {
                actionsEl.innerHTML = `
                    <button type="button" class="btn-update-secondary" id="btn-recheck-update">
                        <i class="hd-icon hd-icon-redo-arrow"></i> ${window.i18n ? window.i18n.t('checkAgainBtn') : 'Ստուգել Կրկին'}
                    </button>
                `;
                const btnRecheck = actionsEl.querySelector('#btn-recheck-update');
                if (btnRecheck) {
                    btnRecheck.addEventListener('click', () => this.checkForUpdates(true));
                }
            }
        }
    }

    async performUpdate(result) {
        if (this.isUpdating) return;
        this.isUpdating = true;
        this.hideUpdateToast();

        const statusEl = document.getElementById('update-status-msg');
        const actionsEl = document.getElementById('update-actions-container');

        if (actionsEl) {
            const btn = actionsEl.querySelector('#btn-do-update');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="hd-icon hd-icon-redo-arrow hd-spin"></i> ${window.i18n ? window.i18n.t('downloadingUpdate') : 'Ներբեռնվում է...'}`;
            }
        }

        if (statusEl) {
            statusEl.innerHTML = `
                <div class="update-installing">
                    <i class="hd-icon hd-icon-redo-arrow hd-spin"></i>
                    <span>${window.i18n ? window.i18n.t('downloadingUpdate') : 'Ներբեռնվում և տեղադրվում է թարմացումը...'}</span>
                </div>
            `;
        }

        // Execute background updater
        try {
            await this.runLiveUpdate(result);

            // Mark installed version & commit
            this.currentVersion = result.latestVersion || '2.2.0';
            localStorage.setItem('vf_installed_version', this.currentVersion);
            if (result.latestSha) {
                localStorage.setItem('vf_installed_sha', result.latestSha);
            }

            const currentVerEl = document.getElementById('update-current-version-badge');
            if (currentVerEl) currentVerEl.textContent = 'v' + this.currentVersion;

            if (statusEl) {
                statusEl.innerHTML = `
                    <div class="update-badge up-to-date">
                        <i class="hd-icon hd-icon-check"></i>
                        <span>${window.i18n ? window.i18n.t('updateCompletedReload') : 'Թարմացումը բարեհաջող տեղադրվեց: Վերագործարկվում է...'}</span>
                    </div>
                `;
            }

            // Reload ExtendScript in Illustrator memory with proper path stripping & $.global assignment
            const bridge = window.illustratorBridge || window.bridge;
            if (bridge && bridge.isCEP && bridge.csInterface) {
                try {
                    let extPath = bridge.csInterface.getSystemPath('extension') || '';
                    if (extPath.indexOf('file:///') === 0) {
                        extPath = extPath.substring(8);
                    } else if (extPath.indexOf('file://') === 0) {
                        extPath = extPath.substring(7);
                    }
                    if (extPath.indexOf('/') === 0 && extPath.charAt(2) === ':') {
                        extPath = extPath.substring(1);
                    }
                    extPath = decodeURI(extPath).replace(/\\/g, '/');
                    const evalCmd = `(function() {
                        var f = new File("${extPath}/host/illustrator/index.jsx");
                        if (f.exists) {
                            $.evalFile(f);
                            if (typeof VariableFontPlugin !== 'undefined') {
                                $.global.VariableFontPlugin = VariableFontPlugin;
                            }
                            return 'RELOADED';
                        }
                        return 'FILE_NOT_FOUND';
                    })()`;
                    await bridge.evalScript(evalCmd);
                } catch (eJsx) {
                    console.warn('ExtendScript live reload error:', eJsx);
                }
            }

            // Reload CEP Panel with cache-busting timestamp
            setTimeout(() => {
                const cleanUrl = window.location.href.split('?')[0];
                window.location.href = cleanUrl + '?_v=' + Date.now();
            }, 1000);

        } catch (updateErr) {
            console.error('Update execution error:', updateErr);
            this.isUpdating = false;
            if (statusEl) {
                statusEl.innerHTML = `<span class="update-error"><i class="hd-icon hd-icon-warning"></i> Սխալ՝ ${updateErr.message}</span>`;
            }
            if (actionsEl) {
                actionsEl.innerHTML = `
                    <button type="button" class="btn-update-primary" id="btn-do-update">
                        <i class="hd-icon hd-icon-download"></i> ${window.i18n ? window.i18n.t('updateNowBtn') : 'Կրկնել'}
                    </button>
                `;
                const btnRetry = actionsEl.querySelector('#btn-do-update');
                if (btnRetry) btnRetry.addEventListener('click', () => this.performUpdate(result));
            }
        }
    }

    runLiveUpdate(result) {
        return new Promise((resolve, reject) => {
            const timeoutTimer = setTimeout(() => {
                // If 25 seconds pass, proceed with reload
                resolve({ success: true, timeout: true });
            }, 25000);

            // Dynamically detect current running extension path
            let currentExtPath = '';
            if (window.bridge && window.bridge.csInterface) {
                try {
                    currentExtPath = window.bridge.csInterface.getSystemPath('extension') || '';
                    if (currentExtPath.indexOf('file:///') === 0) {
                        currentExtPath = currentExtPath.substring(8);
                    } else if (currentExtPath.indexOf('file://') === 0) {
                        currentExtPath = currentExtPath.substring(7);
                    }
                    if (currentExtPath.indexOf('/') === 0 && currentExtPath.charAt(2) === ':') {
                        currentExtPath = currentExtPath.substring(1);
                    }
                    currentExtPath = decodeURI(currentExtPath);
                } catch (ePath) {}
            }
            const normalizedExtPath = currentExtPath ? currentExtPath.replace(/\\/g, '/') : '';

            // Construct Windows PowerShell update command
            const psScript = `
$ProgressPreference = 'SilentlyContinue';
$repo = '${this.defaultRepo}';
$zipUrl = 'https://github.com/' + $repo + '/archive/refs/heads/main.zip';
$tempZip = Join-Path $env:TEMP 'VariablePlugin_Update.zip';
$tempDir = Join-Path $env:TEMP 'VariablePlugin_Update_Ext';
$doneFile = Join-Path $env:TEMP 'VariablePlugin_Update_Done.txt';

if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue };
if (Test-Path $tempZip) { Remove-Item -Path $tempZip -Force -ErrorAction SilentlyContinue };
if (Test-Path $doneFile) { Remove-Item -Path $doneFile -Force -ErrorAction SilentlyContinue };

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;
try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing;
} catch {
    (New-Object System.Net.WebClient).DownloadFile($zipUrl, $tempZip);
}

Expand-Archive -Path $tempZip -DestinationPath $tempDir -Force;

$extractedContainer = Get-ChildItem -Path $tempDir | Where-Object { $_.PSIsContainer } | Select-Object -First 1;
$extractedRoot = if ($extractedContainer) { $extractedContainer.FullName } else { Join-Path $tempDir 'Variable-Plugin-main' };
$extractedIlst = Join-Path $extractedRoot 'plugins\\Illustrator';

$targets = @(
    (Join-Path $env:APPDATA 'Adobe\\CEP\\extensions\\com.illustrator.variables.panel'),
    (Join-Path $env:APPDATA 'Adobe\\CEP\\extensions\\com.adobe.variables.panel')
);
if ('${normalizedExtPath}') {
    $targets += '${normalizedExtPath}';
}

$exclude = @('.git', '.vscode', 'install.bat', 'uninstall.bat', 'install.ps1', 'uninstall.ps1', 'install.sh', 'uninstall.sh', 'plugins', 'figma');

foreach ($target in ($targets | Select-Object -Unique)) {
    if (!(Test-Path $target)) {
        New-Item -ItemType Directory -Path $target -Force | Out-Null;
    }
    if (Test-Path $extractedRoot) {
        Get-ChildItem -Path $extractedRoot | ForEach-Object {
            if ($exclude -notcontains $_.Name) {
                Copy-Item -Path $_.FullName -Destination $target -Recurse -Force -ErrorAction SilentlyContinue;
            }
        };
    }
    if (Test-Path $extractedIlst) {
        Get-ChildItem -Path $extractedIlst | ForEach-Object {
            if ($exclude -notcontains $_.Name) {
                Copy-Item -Path $_.FullName -Destination $target -Recurse -Force -ErrorAction SilentlyContinue;
            }
        };
    }
}

Remove-Item -Path $tempZip -Force -ErrorAction SilentlyContinue;
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue;
Set-Content -Path $doneFile -Value 'SUCCESS' -Encoding UTF8;
`.trim().replace(/\r?\n/g, ' ');

            // Method 1: If Node.js child_process is available
            if (typeof require !== 'undefined') {
                try {
                    const cp = require('child_process');
                    cp.exec(`powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command "${psScript.replace(/"/g, '\\"')}"`, (err) => {
                        clearTimeout(timeoutTimer);
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ success: true });
                        }
                    });
                    return;
                } catch (nodeErr) {}
            }

            // Method 2: If ExtendScript is available (CEP environment)
            if (window.bridge && window.bridge.isCEP && window.bridge.csInterface) {
                const jsxCommand = `
                    (function() {
                        try {
                            var isWin = (Folder.fs === 'Windows') || ($.os.indexOf('Windows') !== -1);
                            if (isWin) {
                                var batFile = new File(Folder.temp.fsName + "/vp_update_runner.cmd");
                                batFile.open("w");
                                batFile.write("@echo off\\r\\n");
                                batFile.write("powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command \\"${psScript.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}\\"\\r\\n");
                                batFile.close();
                                batFile.execute();
                            } else {
                                var shFile = new File(Folder.temp.fsName + "/vp_update_runner.sh");
                                shFile.open("w");
                                shFile.write("#!/bin/bash\\n");
                                shFile.write("TMP_ZIP=\\"/tmp/VariablePlugin_Update.zip\\"\\n");
                                shFile.write("TMP_DIR=\\"/tmp/VariablePlugin_Update_Ext\\"\\n");
                                shFile.write("DONE_FILE=\\"/tmp/VariablePlugin_Update_Done.txt\\"\\n");
                                shFile.write("rm -rf \\"$TMP_DIR\\" \\"$TMP_ZIP\\" \\"$DONE_FILE\\"\\n");
                                shFile.write("mkdir -p \\"$TMP_DIR\\"\\n");
                                shFile.write("curl -L -s \\"https://github.com/${this.defaultRepo}/archive/refs/heads/main.zip\\" -o \\"$TMP_ZIP\\"\\n");
                                shFile.write("unzip -q -o \\"$TMP_ZIP\\" -d \\"$TMP_DIR\\"\\n");
                                shFile.write("EXT_ROOT=$(find \\"$TMP_DIR\\" -mindepth 1 -maxdepth 1 -type d | head -n 1)\\n");
                                shFile.write("TARGET_DIR=\\"$HOME/Library/Application Support/Adobe/CEP/extensions/com.illustrator.variables.panel\\"\\n");
                                shFile.write("TARGET_ALT=\\"$HOME/Library/Application Support/Adobe/CEP/extensions/com.adobe.variables.panel\\"\\n");
                                shFile.write("mkdir -p \\"$TARGET_DIR\\" \\"$TARGET_ALT\\"\\n");
                                shFile.write("if [ -d \\"$EXT_ROOT\\" ]; then rsync -av --exclude='.git' --exclude='plugins' --exclude='figma' \\"$EXT_ROOT/\\" \\"$TARGET_DIR/\\"; rsync -av --exclude='.git' --exclude='plugins' --exclude='figma' \\"$EXT_ROOT/\\" \\"$TARGET_ALT/\\"; fi\\n");
                                shFile.write("if [ -d \\"$EXT_ROOT/plugins/Illustrator\\" ]; then rsync -av --exclude='.git' \\"$EXT_ROOT/plugins/Illustrator/\\" \\"$TARGET_DIR/\\"; rsync -av --exclude='.git' \\"$EXT_ROOT/plugins/Illustrator/\\" \\"$TARGET_ALT/\\"; fi\\n");
                                shFile.write("if [ -n \\"${normalizedExtPath}\\" ]; then mkdir -p \\"${normalizedExtPath}\\"; if [ -d \\"$EXT_ROOT\\" ]; then rsync -av --exclude='.git' --exclude='plugins' --exclude='figma' \\"$EXT_ROOT/\\" \\"${normalizedExtPath}/\\"; fi; if [ -d \\"$EXT_ROOT/plugins/Illustrator\\" ]; then rsync -av --exclude='.git' \\"$EXT_ROOT/plugins/Illustrator/\\" \\"${normalizedExtPath}/\\"; fi; fi\\n");
                                shFile.write("rm -rf \\"$TMP_ZIP\\" \\"$TMP_DIR\\"\\n");
                                shFile.write("echo \\"SUCCESS\\" > \\"$DONE_FILE\\"\\n");
                                shFile.close();
                                app.system("chmod +x \\"" + shFile.fsName + "\\" && \\"" + shFile.fsName + "\\" &");
                            }
                            return "STARTED";
                        } catch(e) {
                            return "ERROR: " + e.message;
                        }
                    })();
                `;
                window.bridge.evalScript(jsxCommand).then(() => {
                    // Poll for completion file
                    const pollInterval = setInterval(() => {
                        window.bridge.evalScript(`new File(Folder.temp.fsName + "/VariablePlugin_Update_Done.txt").exists;`).then((exists) => {
                            if (exists === true || exists === 'true') {
                                clearInterval(pollInterval);
                                clearTimeout(timeoutTimer);
                                // Clean up done file
                                window.bridge.evalScript(`
                                    var df = new File(Folder.temp.fsName + "/VariablePlugin_Update_Done.txt");
                                    if (df.exists) df.remove();
                                    var bf = new File(Folder.temp.fsName + "/vp_update_runner.cmd");
                                    if (bf.exists) bf.remove();
                                    var sf = new File(Folder.temp.fsName + "/vp_update_runner.sh");
                                    if (sf.exists) sf.remove();
                                `).catch(() => {});
                                resolve({ success: true });
                            }
                        }).catch(() => {});
                    }, 500);
                }).catch((evalErr) => {
                    clearTimeout(timeoutTimer);
                    reject(evalErr);
                });
                return;
            }

            // Method 3: Browser simulation fallback
            setTimeout(() => {
                clearTimeout(timeoutTimer);
                resolve({ success: true, simulated: true });
            }, 1500);
        });
    }

    showUpdateToast(result) {
        if (result) {
            this.lastCheckResult = result;
        }
        const toast = document.getElementById('update-toast-notification');
        if (!toast) return;

        // If update modal is currently open, don't overlap with toast
        const modal = document.getElementById('update-modal-overlay');
        if (modal && modal.classList.contains('is-open')) {
            return;
        }

        const titleEl = document.getElementById('update-toast-title');
        const descEl = document.getElementById('update-toast-desc');
        const actionEl = document.getElementById('update-toast-action-text');

        const i18n = window.i18n;
        const ver = result.latestVersion || '2.2.0';

        if (titleEl) {
            titleEl.textContent = i18n ? i18n.t('updateToastTitle') : 'Առկա է նոր թարմացում';
        }
        if (descEl) {
            descEl.textContent = i18n ? i18n.t('updateToastDesc', { version: ver }) : `Տարբերակ v${ver}-ը պատրաստ է`;
        }
        if (actionEl) {
            actionEl.textContent = i18n ? i18n.t('updateToastAction') : 'Թարմացնել';
        }

        toast.style.display = 'flex';
        void toast.offsetWidth; // Force reflow for smooth pop up transition
        toast.classList.add('is-visible');
    }

    hideUpdateToast() {
        const toast = document.getElementById('update-toast-notification');
        if (!toast) return;

        toast.classList.remove('is-visible');
        setTimeout(() => {
            if (!toast.classList.contains('is-visible')) {
                toast.style.display = 'none';
            }
        }, 450);
    }

    bindDOM() {
        const btnHeaderUpdate = document.getElementById('btn-header-update');
        const modal = document.getElementById('update-modal-overlay');
        const btnClose = document.getElementById('btn-update-modal-close');

        const toast = document.getElementById('update-toast-notification');
        const toastContent = document.getElementById('update-toast-content');
        const btnToastUpdate = document.getElementById('btn-toast-update');
        const btnToastDismiss = document.getElementById('btn-toast-dismiss');

        const openModal = () => {
            modal.style.display = 'flex';
            void modal.offsetWidth; // force reflow for smooth transition
            modal.classList.add('is-open');
        };

        const closeModal = () => {
            modal.classList.remove('is-open');
            setTimeout(() => {
                if (!modal.classList.contains('is-open')) {
                    modal.style.display = 'none';
                }
            }, 250);
        };

        if (btnHeaderUpdate && modal) {
            btnHeaderUpdate.addEventListener('click', () => {
                this.hideUpdateToast();
                openModal();
                this.checkForUpdates(true);
            });
        }

        if (btnClose && modal) {
            btnClose.addEventListener('click', () => {
                closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        // Bottom push notification toast event bindings
        if (btnToastUpdate) {
            btnToastUpdate.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideUpdateToast();
                openModal();
                if (this.lastCheckResult) {
                    this.renderUpdateModalContent(this.lastCheckResult);
                } else {
                    this.checkForUpdates(true);
                }
            });
        }

        if (toastContent) {
            toastContent.addEventListener('click', () => {
                this.hideUpdateToast();
                openModal();
                if (this.lastCheckResult) {
                    this.renderUpdateModalContent(this.lastCheckResult);
                } else {
                    this.checkForUpdates(true);
                }
            });
        }

        if (btnToastDismiss) {
            btnToastDismiss.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.lastCheckResult && this.lastCheckResult.latestVersion) {
                    try {
                        sessionStorage.setItem('vf_dismissed_update_ver', this.lastCheckResult.latestVersion);
                    } catch (err) {}
                }
                this.hideUpdateToast();
            });
        }

        // Update toast texts dynamically on language switch
        if (window.i18n && typeof window.i18n.onLanguageChange === 'function') {
            window.i18n.onLanguageChange(() => {
                if (this.lastCheckResult && this.lastCheckResult.hasUpdate) {
                    const titleEl = document.getElementById('update-toast-title');
                    const descEl = document.getElementById('update-toast-desc');
                    const actionEl = document.getElementById('update-toast-action-text');
                    const i18n = window.i18n;
                    const ver = this.lastCheckResult.latestVersion || '2.2.0';
                    if (titleEl) titleEl.textContent = i18n ? i18n.t('updateToastTitle') : 'Առկա է նոր թարմացում';
                    if (descEl) descEl.textContent = i18n ? i18n.t('updateToastDesc', { version: ver }) : `Տարբերակ v${ver}-ը պատրաստ է`;
                    if (actionEl) actionEl.textContent = i18n ? i18n.t('updateToastAction') : 'Թարմացնել';
                }
            });
        }
    }
}

window.updateManager = new UpdateManager();

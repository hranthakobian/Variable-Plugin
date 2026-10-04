/**
 * GitHub Update Manager & In-Place Release Synchronizer
 * Enables one-click checking and live in-place updating of the Variables Plugin from GitHub
 * directly inside Adobe Illustrator without closing or restarting the application.
 * Follows K&R / 1TBS brace formatting.
 */

class UpdateManager {
    constructor() {
        this.currentVersion = localStorage.getItem('vf_installed_version') || '2.6.0';
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
                latestVersion = '2.6.0';
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
            this.currentVersion = result.latestVersion || '2.6.0';
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

    async runLiveUpdate(result) {
        const repo = this.defaultRepo;
        const bridge = window.illustratorBridge || window.bridge;
        const statusEl = document.getElementById('update-status-msg');

        const fallbackFiles = [
            'index.html',
            'version.json',
            'CSXS/manifest.xml',
            'css/styles.css',
            'css/components.css',
            'css/figma-theme.css',
            'js/app.js',
            'js/bridge.js',
            'js/i18n.js',
            'js/themeManager.js',
            'js/tourGuide.js',
            'js/updateManager.js',
            'js/figmaCode.js',
            'js/lib/CSInterface.js',
            'js/lib/components.js',
            'js/modes/sliderMode.js',
            'js/modes/graphMode.js',
            'js/modes/designSpaceMode.js',
            'host/index.jsx',
            'host/illustrator/index.jsx',
            'host/indesign/index.jsx',
            'host/photoshop/index.jsx'
        ];

        let filesToDownload = [];
        try {
            const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/main?recursive=1&_t=${Date.now()}`);
            if (treeRes.ok) {
                const treeData = await treeRes.json();
                if (treeData && Array.isArray(treeData.tree)) {
                    const ilstPrefix = 'plugins/Illustrator/';
                    const ilstBlobs = treeData.tree.filter((item) => item.type === 'blob' && item.path.indexOf(ilstPrefix) === 0);
                    if (ilstBlobs.length > 0) {
                        filesToDownload = ilstBlobs.map((item) => ({
                            remotePath: item.path,
                            localPath: item.path.substring(ilstPrefix.length)
                        }));
                    } else {
                        filesToDownload = treeData.tree
                            .filter((item) => item.type === 'blob' && !item.path.startsWith('.') && !item.path.startsWith('plugins/') && !item.path.startsWith('figma/'))
                            .map((item) => ({ remotePath: item.path, localPath: item.path }));
                    }
                }
            }
        } catch (eTree) {}

        if (!filesToDownload.length) {
            filesToDownload = fallbackFiles.map((f) => ({
                remotePath: `plugins/Illustrator/${f}`,
                localPath: f,
                fallbackRemote: f
            }));
        }

        // Get extension path
        let extPath = '';
        if (bridge && bridge.csInterface) {
            try {
                extPath = bridge.csInterface.getSystemPath('extension') || '';
                if (extPath.indexOf('file:///') === 0) extPath = extPath.substring(8);
                else if (extPath.indexOf('file://') === 0) extPath = extPath.substring(7);
                if (extPath.indexOf('/') === 0 && extPath.charAt(2) === ':') extPath = extPath.substring(1);
                extPath = decodeURI(extPath).replace(/\\/g, '/');
            } catch (eP) {}
        }

        let completed = 0;
        const total = filesToDownload.length;

        for (const fileItem of filesToDownload) {
            let content = null;
            const cacheBust = Date.now();

            try {
                const url = `https://raw.githubusercontent.com/${repo}/main/${fileItem.remotePath}?_t=${cacheBust}`;
                const res = await fetch(url);
                if (res.ok) {
                    content = await res.text();
                } else if (fileItem.fallbackRemote) {
                    const fallbackUrl = `https://raw.githubusercontent.com/${repo}/main/${fileItem.fallbackRemote}?_t=${cacheBust}`;
                    const res2 = await fetch(fallbackUrl);
                    if (res2.ok) {
                        content = await res2.text();
                    }
                }
            } catch (errDl) {
                console.warn('Failed downloading:', fileItem.remotePath, errDl);
            }

            if (content !== null && bridge && bridge.isCEP) {
                try {
                    const payloadStr = JSON.stringify({
                        extPath: extPath,
                        path: fileItem.localPath,
                        content: content
                    });
                    const b64 = btoa(unescape(encodeURIComponent(payloadStr)));
                    const writeCmd = `(function() {
                        if (typeof VariableFontPlugin !== 'undefined' && typeof VariableFontPlugin.writeFileBase64 === 'function') {
                            return VariableFontPlugin.writeFileBase64('${b64}');
                        }
                        return JSON.stringify({ success: false, error: 'writeFileBase64 missing' });
                    })()`;

                    await bridge.evalScript(writeCmd);
                } catch (errWrite) {
                    console.error('Failed writing file via ExtendScript:', fileItem.localPath, errWrite);
                }
            }

            completed++;
            if (statusEl) {
                statusEl.innerHTML = `
                    <div class="update-installing">
                        <i class="hd-icon hd-icon-redo-arrow hd-spin"></i>
                        <span>${window.i18n ? window.i18n.t('downloadingUpdate') : 'Տեղադրվում է...'} (${completed}/${total})</span>
                    </div>
                `;
            }
        }

        return { success: true, totalUpdated: completed };
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
        const ver = result.latestVersion || '2.6.0';

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
                    const ver = this.lastCheckResult.latestVersion || '2.6.0';
                    if (titleEl) titleEl.textContent = i18n ? i18n.t('updateToastTitle') : 'Առկա է նոր թարմացում';
                    if (descEl) descEl.textContent = i18n ? i18n.t('updateToastDesc', { version: ver }) : `Տարբերակ v${ver}-ը պատրաստ է`;
                    if (actionEl) actionEl.textContent = i18n ? i18n.t('updateToastAction') : 'Թարմացնել';
                }
            });
        }
    }
}

window.updateManager = new UpdateManager();

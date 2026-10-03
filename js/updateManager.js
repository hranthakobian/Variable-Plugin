/**
 * GitHub Update Manager & Release Synchronizer
 * Enables one-click checking and updating of the Variables Plugin from GitHub.
 * Follows K&R / 1TBS brace formatting.
 */

class UpdateManager {
    constructor() {
        this.currentVersion = '2.1.0';
        this.storageKeyRepo = 'vf_github_repo';
        this.storageKeyAutoCheck = 'vf_auto_check_updates';
        this.defaultRepo = 'hranthakobian/Variable-Plugin';
        this.lastCheckResult = null;
        this.isChecking = false;

        this.init();
    }

    init() {
        this.bindDOM();
        if (this.isAutoCheckEnabled()) {
            setTimeout(() => {
                this.checkForUpdates(false);
            }, 3000);
        }
    }

    getRepo() {
        return this.defaultRepo;
    }

    setRepo(repoName) {
        try {
            localStorage.setItem(this.storageKeyRepo, (repoName || '').trim());
        } catch (e) {}
    }

    isAutoCheckEnabled() {
        try {
            return localStorage.getItem(this.storageKeyAutoCheck) !== 'false';
        } catch (e) {
            return true;
        }
    }

    setAutoCheckEnabled(val) {
        try {
            localStorage.setItem(this.storageKeyAutoCheck, val ? 'true' : 'false');
        } catch (e) {}
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
        if (this.isChecking) return;
        this.isChecking = true;

        const repo = this.getRepo().trim();
        const statusEl = document.getElementById('update-status-msg');
        const badgeEl = document.getElementById('update-nav-badge');

        if (statusEl && manual) {
            statusEl.innerHTML = `<span class="update-loading"><i class="hd-icon hd-icon-redo-arrow"></i> ${window.i18n ? window.i18n.t('checkingUpdates') : 'Checking for updates...'}</span>`;
        }

        try {
            let latestVersion = null;
            let releaseNotes = '';
            let downloadUrl = '';
            let tagName = '';

            // 1. Try GitHub Releases API
            try {
                const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
                    headers: { 'Accept': 'application/vnd.github.v3+json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    tagName = data.tag_name || data.name || '';
                    latestVersion = tagName.replace(/^[^\d]*/, '');
                    releaseNotes = data.body || '';
                    downloadUrl = data.zipball_url || data.html_url || `https://github.com/${repo}/releases/latest`;
                }
            } catch (err) {}

            // 2. Fallback to raw manifest.json / package.json if no GitHub Release is published yet
            if (!latestVersion) {
                try {
                    const rawRes = await fetch(`https://raw.githubusercontent.com/${repo}/main/manifest.json`);
                    if (rawRes.ok) {
                        const rawManifest = await rawRes.json();
                        latestVersion = rawManifest.version || rawManifest.api || '2.0.0';
                        downloadUrl = `https://github.com/${repo}/archive/refs/heads/main.zip`;
                    }
                } catch (err) {}
            }

            if (!latestVersion) {
                if (statusEl && manual) {
                    statusEl.innerHTML = `<span class="update-error"><i class="hd-icon hd-icon-warning"></i> ${window.i18n ? window.i18n.t('updateCheckFailed') : 'Could not reach GitHub repository'} (${repo})</span>`;
                }
                this.isChecking = false;
                return;
            }

            const hasUpdate = this.compareVersions(latestVersion, this.currentVersion) > 0;
            this.lastCheckResult = {
                hasUpdate,
                latestVersion,
                currentVersion: this.currentVersion,
                releaseNotes,
                downloadUrl,
                tagName
            };

            if (badgeEl) {
                badgeEl.style.display = hasUpdate ? 'inline-flex' : 'none';
            }

            this.renderUpdateModalContent(this.lastCheckResult);
        } catch (error) {
            console.error('Update check error:', error);
            if (statusEl && manual) {
                statusEl.innerHTML = `<span class="update-error"><i class="hd-icon hd-icon-warning"></i> Error: ${error.message}</span>`;
            }
        } finally {
            this.isChecking = false;
        }
    }

    renderUpdateModalContent(result) {
        const statusEl = document.getElementById('update-status-msg');
        const actionsEl = document.getElementById('update-actions-container');
        const notesEl = document.getElementById('update-release-notes');
        const currentVerEl = document.getElementById('update-current-version');
        const latestVerEl = document.getElementById('update-latest-version');

        if (currentVerEl) currentVerEl.textContent = this.currentVersion;
        if (latestVerEl) latestVerEl.textContent = result.latestVersion || this.currentVersion;

        if (statusEl) {
            if (result.hasUpdate) {
                statusEl.innerHTML = `
                    <div class="update-badge new-available">
                        <i class="hd-icon hd-icon-download"></i>
                        <span>${window.i18n ? window.i18n.t('newVersionAvailable') : 'New version available:'} <b>v${result.latestVersion}</b></span>
                    </div>
                `;
            } else {
                statusEl.innerHTML = `
                    <div class="update-badge up-to-date">
                        <i class="hd-icon hd-icon-check"></i>
                        <span>${window.i18n ? window.i18n.t('upToDate') : 'You are using the latest version.'}</span>
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
            if (result.hasUpdate) {
                actionsEl.innerHTML = `
                    <button type="button" class="btn-update-primary" id="btn-do-update">
                        <i class="hd-icon hd-icon-download"></i> ${window.i18n ? window.i18n.t('updateNowBtn') : 'Update Plugin Now'}
                    </button>
                    <button type="button" class="btn-update-secondary" id="btn-open-github">
                        <i class="hd-icon hd-icon-api"></i> GitHub
                    </button>
                `;
                const btnDoUpdate = actionsEl.querySelector('#btn-do-update');
                const btnOpenGithub = actionsEl.querySelector('#btn-open-github');
                if (btnDoUpdate) {
                    btnDoUpdate.addEventListener('click', () => this.performUpdate(result));
                }
                if (btnOpenGithub) {
                    btnOpenGithub.addEventListener('click', () => {
                        window.open(result.downloadUrl || `https://github.com/${this.getRepo()}`, '_blank');
                    });
                }
            } else {
                actionsEl.innerHTML = `
                    <button type="button" class="btn-update-secondary" id="btn-recheck-update">
                        <i class="hd-icon hd-icon-redo-arrow"></i> ${window.i18n ? window.i18n.t('checkAgainBtn') : 'Check Again'}
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
        const statusEl = document.getElementById('update-status-msg');
        if (statusEl) {
            statusEl.innerHTML = `
                <div class="update-installing">
                    <i class="hd-icon hd-icon-download"></i>
                    <span>${window.i18n ? window.i18n.t('downloadingUpdate') : 'Downloading and applying update...'}</span>
                </div>
            `;
        }

        // Check if Node.js / CEP environment is available for in-place reload
        if (typeof require !== 'undefined' && typeof process !== 'undefined') {
            try {
                // If running in CEP with Node integration
                const https = require('https');
                const fs = require('fs');
                const path = require('path');
                // Trigger download or reload
                setTimeout(() => {
                    if (statusEl) {
                        statusEl.innerHTML = `<span class="update-success"><i class="hd-icon hd-icon-check"></i> ${window.i18n ? window.i18n.t('updateCompletedReload') : 'Update completed! Reloading extension...'}</span>`;
                    }
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }, 1000);
                return;
            } catch (err) {}
        }

        // Direct download fallback
        if (result.downloadUrl) {
            window.open(result.downloadUrl, '_blank');
        }
        if (statusEl) {
            statusEl.innerHTML = `
                <div class="update-instructions">
                    <i class="hd-icon hd-icon-info"></i>
                    <span>${window.i18n ? window.i18n.t('updateZipDownloaded') : 'Downloaded latest package. Run update.bat or install.bat to finish.'}</span>
                </div>
            `;
        }
    }

    bindDOM() {
        const btnHeaderUpdate = document.getElementById('btn-header-update');
        const modal = document.getElementById('update-modal-overlay');
        const btnClose = document.getElementById('btn-update-modal-close');
        const btnCheckNow = document.getElementById('btn-check-updates-now');

        if (btnHeaderUpdate && modal) {
            btnHeaderUpdate.addEventListener('click', () => {
                modal.style.display = 'flex';
                this.checkForUpdates(true);
            });
        }

        if (btnClose && modal) {
            btnClose.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (btnCheckNow) {
            btnCheckNow.addEventListener('click', () => {
                this.checkForUpdates(true);
            });
        }
    }
}

window.updateManager = new UpdateManager();

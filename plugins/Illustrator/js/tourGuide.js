/**
 * Studio Tour Guide & First-Time Onboarding
 * Guides users through «Արվեստանոց» (Studio) with an interactive, step-by-step
 * spotlight walkthrough, and provides first-time welcome dialog.
 * Follows K&R / 1TBS brace formatting.
 */

class StudioTourGuide {
    constructor(appController) {
        this.app = appController;
        this.currentStep = 0;
        this.isTourActive = false;

        this.steps = [
            {
                cardId: 'curves',
                selector: '[data-card-id="curves"]',
                titleKey: 'tourStep1Title',
                descKey: 'tourStep1Desc'
            },
            {
                cardId: 'toolbar',
                selector: '[data-card-id="toolbar"]',
                titleKey: 'tourStep2Title',
                descKey: 'tourStep2Desc'
            },
            {
                cardId: 'canvas',
                selector: '[data-card-id="canvas"]',
                titleKey: 'tourStep3Title',
                descKey: 'tourStep3Desc'
            },
            {
                cardId: 'points',
                selector: '[data-card-id="points"]',
                titleKey: 'tourStep4Title',
                descKey: 'tourStep4Desc'
            },
            {
                cardId: 'presets',
                selector: '[data-card-id="presets"]',
                titleKey: 'tourStep5Title',
                descKey: 'tourStep5Desc'
            },
            {
                cardId: 'window',
                selector: '#btn-window-menu',
                titleKey: 'tourStep6Title',
                descKey: 'tourStep6Desc'
            }
        ];

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Welcome Modal Buttons
        const btnStartTour = document.getElementById('btn-welcome-start-tour');
        const btnStartWithoutTour = document.getElementById('btn-welcome-start-without-tour');
        const btnWelcomeClose = document.getElementById('btn-welcome-close');

        if (btnStartTour) {
            btnStartTour.addEventListener('click', () => {
                this.hideWelcomeModal();
                this.startTour();
            });
        }

        if (btnStartWithoutTour) {
            btnStartWithoutTour.addEventListener('click', () => {
                this.hideWelcomeModal();
                this.markCompleted();
            });
        }

        if (btnWelcomeClose) {
            btnWelcomeClose.addEventListener('click', () => {
                this.hideWelcomeModal();
                this.markCompleted();
            });
        }

        // Tour Bubble Navigation Buttons
        const btnNext = document.getElementById('tour-btn-next');
        const btnPrev = document.getElementById('tour-btn-prev');
        const btnSkip = document.getElementById('tour-btn-skip');
        const btnCloseTour = document.getElementById('tour-btn-close');

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                this.nextStep();
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                this.prevStep();
            });
        }

        if (btnSkip) {
            btnSkip.addEventListener('click', () => {
                this.skipTour();
            });
        }

        if (btnCloseTour) {
            btnCloseTour.addEventListener('click', () => {
                this.skipTour();
            });
        }

        // Keyboard navigation during tour (Arrow keys & Escape)
        window.addEventListener('keydown', (e) => {
            if (!this.isTourActive) {
                return;
            }
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                e.preventDefault();
                this.nextStep();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevStep();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.skipTour();
            }
        });
    }

    /**
     * Check if user is opening «Արվեստանոց» (Studio) for the first time
     */
    checkFirstTimeWelcome() {
        try {
            const completed = localStorage.getItem('vf_studio_onboarding_completed');
            if (!completed || completed !== 'true') {
                this.showWelcomeModal();
            }
        } catch (e) {
            console.error('Error reading onboarding status from localStorage', e);
        }
    }

    showWelcomeModal() {
        const modal = document.getElementById('studio-welcome-overlay');
        if (!modal) {
            return;
        }

        this.updateWelcomeTexts();
        modal.style.display = 'flex';
    }

    hideWelcomeModal() {
        const modal = document.getElementById('studio-welcome-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateWelcomeTexts() {
        const i18n = window.i18n;
        const titleEl = document.getElementById('studio-welcome-title');
        const descEl = document.getElementById('studio-welcome-desc');
        const btnStartTour = document.getElementById('btn-welcome-start-tour');
        const btnStartWithoutTour = document.getElementById('btn-welcome-start-without-tour');

        if (titleEl) {
            titleEl.textContent = i18n ? i18n.t('welcomeStudioTitle') : 'Բարի գալուստ Արվեստանոց';
        }
        if (descEl) {
            descEl.textContent = i18n ? i18n.t('welcomeStudioDesc') : 'Այստեղ կարող եք ստեղծել և կառավարել տառատեսակի բազմառանցքային կորեր, բաշխել փոփոխականությունը տառերի կամ առարկաների վրա, ստեղծել preset-ներ և պանակներ։';
        }
        if (btnStartTour) {
            btnStartTour.innerHTML = `<i class="hd-icon hd-icon-check"></i> ${i18n ? i18n.t('btnStartTour') : 'Սկսել ուսուցումը'}`;
        }
        if (btnStartWithoutTour) {
            btnStartWithoutTour.textContent = i18n ? i18n.t('btnStartWithoutTour') : 'Սկսել առանց ուսուցման';
        }
    }

    /**
     * Start the step-by-step interactive walkthrough
     */
    startTour() {
        this.isTourActive = true;
        this.currentStep = 0;

        const overlay = document.getElementById('studio-tour-overlay');
        const bubble = document.getElementById('studio-tour-bubble');

        if (overlay) {
            overlay.style.display = 'block';
        }
        if (bubble) {
            bubble.style.display = 'flex';
        }

        this.showStep(0);
    }

    showStep(index) {
        if (index < 0 || index >= this.steps.length) {
            this.finishTour();
            return;
        }

        this.currentStep = index;
        const step = this.steps[index];
        const i18n = window.i18n;

        // 1. Remove highlight from previously focused elements
        document.querySelectorAll('.tour-highlighted-card').forEach((el) => {
            el.classList.remove('tour-highlighted-card');
        });

        // 2. Ensure target card is visible and expanded in GraphMode
        if (this.app && this.app.graphMode && step.cardId !== 'window') {
            const layout = this.app.graphMode.getSectionsLayout();
            if (layout) {
                // If card is collapsed, expand it
                if (layout.collapsed && layout.collapsed[step.cardId]) {
                    layout.collapsed[step.cardId] = false;
                    this.app.graphMode.saveSectionsLayout(layout);
                    this.app.graphMode.applySectionsLayout();
                }
                // If card was hidden, unhide it
                if (layout.visibility && !layout.visibility[step.cardId]) {
                    layout.visibility[step.cardId] = true;
                    this.app.graphMode.saveSectionsLayout(layout);
                    this.app.graphMode.applySectionsLayout();
                }
            }
        }

        // 3. Find target element in DOM
        const targetEl = document.querySelector(step.selector);
        if (targetEl) {
            targetEl.classList.add('tour-highlighted-card');
            try {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {
                targetEl.scrollIntoView(true);
            }
        }

        // 4. Update tour bubble contents
        const stepCounter = document.getElementById('tour-step-counter');
        const titleEl = document.getElementById('tour-step-title');
        const descEl = document.getElementById('tour-step-desc');
        const btnPrev = document.getElementById('tour-btn-prev');
        const btnNext = document.getElementById('tour-btn-next');
        const btnSkip = document.getElementById('tour-btn-skip');

        if (stepCounter) {
            stepCounter.textContent = i18n
                ? i18n.t('tourStepIndicator', { current: index + 1, total: this.steps.length })
                : `Քայլ ${index + 1} / ${this.steps.length}`;
        }

        if (titleEl) {
            titleEl.textContent = i18n ? i18n.t(step.titleKey) : `Քայլ ${index + 1}`;
        }

        if (descEl) {
            descEl.textContent = i18n ? i18n.t(step.descKey) : '';
        }

        if (btnPrev) {
            btnPrev.disabled = (index === 0);
            btnPrev.innerHTML = `<i class="hd-icon hd-icon-arrow-left"></i> ${i18n ? i18n.t('tourPrev') : 'Հետ'}`;
        }

        if (btnNext) {
            const isLast = (index === this.steps.length - 1);
            btnNext.innerHTML = isLast
                ? `<i class="hd-icon hd-icon-check"></i> ${i18n ? i18n.t('tourFinish') : 'Ավարտել'}`
                : `${i18n ? i18n.t('tourNext') : 'Հաջորդ'} <i class="hd-icon hd-icon-arrow-right"></i>`;
            btnNext.classList.toggle('btn-finish', isLast);
        }

        if (btnSkip) {
            btnSkip.textContent = i18n ? i18n.t('tourSkip') : 'Բաց թողնել';
        }

        // 5. Smart positioning of the tour bubble
        this.positionBubble(targetEl);
    }

    positionBubble(targetEl) {
        const bubble = document.getElementById('studio-tour-bubble');
        if (!bubble) {
            return;
        }

        if (!targetEl) {
            bubble.style.top = '';
            bubble.style.bottom = '16px';
            return;
        }

        const rect = targetEl.getBoundingClientRect();
        const viewportH = window.innerHeight;

        // If target is in the lower half of the viewport, display bubble pinned near top
        if (rect.top > viewportH * 0.55) {
            bubble.style.bottom = '';
            bubble.style.top = '12px';
            bubble.setAttribute('data-pos', 'top');
        } else {
            // Target is in the upper half of viewport -> display bubble pinned near bottom
            bubble.style.top = '';
            bubble.style.bottom = '12px';
            bubble.setAttribute('data-pos', 'bottom');
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.finishTour();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    skipTour() {
        this.cleanupTour();
        this.markCompleted();
    }

    finishTour() {
        this.cleanupTour();
        this.markCompleted();
    }

    cleanupTour() {
        this.isTourActive = false;

        document.querySelectorAll('.tour-highlighted-card').forEach((el) => {
            el.classList.remove('tour-highlighted-card');
        });

        const overlay = document.getElementById('studio-tour-overlay');
        const bubble = document.getElementById('studio-tour-bubble');

        if (overlay) {
            overlay.style.display = 'none';
        }
        if (bubble) {
            bubble.style.display = 'none';
        }
    }

    markCompleted() {
        try {
            localStorage.setItem('vf_studio_onboarding_completed', 'true');
        } catch (e) {}
    }

    /**
     * Restart the tour anytime (e.g. from Window menu)
     */
    restartTour() {
        if (this.app && typeof this.app.switchMode === 'function') {
            this.app.switchMode('graph');
        }
        setTimeout(() => {
            this.startTour();
        }, 100);
    }
}

window.StudioTourGuide = StudioTourGuide;

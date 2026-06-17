/**
 * Projects Page: Demo Container Management
 * Handles template cloning, injection, and project-specific functionality
 */

class ProjectDemoManager {
    constructor() {
        this.projectCards = document.querySelectorAll('.project-card');
        this.currentDemoProject = null;
        this.demoStates = {
            counter: { count: 0 },
            password: { value: '' }
        };
        // Modal state
        this._modalOverlay = null;
        this._modalContent = null;
        this._lastTrigger = null;
        this.init();
    }

    /**
     * Initialize event listeners and setup
     */
    init() {
        // Event delegation on project cards
        this.projectCards.forEach((card) => {
            card.addEventListener('click', (e) => {
                // Ignore if clicking the button directly (will be handled by button listener)
                if (e.target.closest('.project-trigger')) return;
                this.handleCardClick(card);
            });

            // Explicit button click handler
            const trigger = card.querySelector('.project-trigger');
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleCardClick(card);
            });

            // Keyboard support (Enter/Space on card)
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCardClick(card);
                }
            });
        });
    }

    /**
     * Handle project card click
     */
    handleCardClick(card) {
        const projectType = card.getAttribute('data-project');
        const trigger = card.querySelector('.project-trigger');

        // If this demo is already open, close it
        if (this.currentDemoProject === projectType) {
            this.closeDemo();
            return;
        }

        // Close any open demo
        if (this.currentDemoProject) {
            this.closeDemo();
        }

            // Open the selected demo
        this.openDemo(projectType, trigger, card);
    }

    /**
     * Open a demo by cloning its template
     */
    openDemo(projectType, triggerButton, card) {
        const templateId = `${projectType}-template`;
        const template = document.getElementById(templateId);

        if (!template) {
            console.error(`Template ${templateId} not found`);
            return;
        }

        // Create and open a centered modal with overlay
        this._lastTrigger = triggerButton;

        // Build overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="project-modal" role="dialog" aria-modal="true" aria-label="Project demo">
                <button class="modal-close" aria-label="Close demo">&times;</button>
                <div class="modal-content"></div>
            </div>
        `;

        // Insert template content into modal-content
        const modalContentEl = overlay.querySelector('.modal-content');
        modalContentEl.appendChild(template.content.cloneNode(true));

        // Append to body
        document.body.appendChild(overlay);
        this._modalOverlay = overlay;
        this._modalContent = modalContentEl;

        // Prevent background scroll
        document.documentElement.classList.add('modal-open');
        document.body.style.overflow = 'hidden';

        // Accessibility: focus management
        const modalPanel = this._modalContent.querySelector('.project-demo-panel');
        if (modalPanel) modalPanel.setAttribute('tabindex', '-1');

        // Initialize project-specific functionality (targets will query this._modalContent)
        this.initializeProjectDemo(projectType);

        // Ensure the demo panel is visible inside the modal (re-use 'active' animation class)
        if (modalPanel) {
            // add active class so CSS animations/visibility apply
            modalPanel.classList.add('active');
        }

        // Wire close handlers
        const closeButton = overlay.querySelector('.modal-close');
        closeButton.addEventListener('click', () => this.closeDemo());

        // If template contains an internal close button, wire it too
        const innerDemoClose = modalContentEl.querySelector('.demo-close-btn');
        if (innerDemoClose) innerDemoClose.addEventListener('click', () => this.closeDemo());

        overlay.addEventListener('click', (ev) => {
            if (ev.target === overlay) this.closeDemo();
        });

        // Key handlers: ESC to close, Tab trap
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.closeDemo();
            } else if (e.key === 'Tab') {
                // focus trap
                const focusable = overlay.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };
        document.addEventListener('keydown', keyHandler);
        // store handler so we can remove later
        this._modalKeyHandler = keyHandler;

        // Show with animation
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            const panelToFocus = modalPanel || overlay.querySelector('.project-modal');
            if (panelToFocus) panelToFocus.focus();
        });

        // Update trigger state
        triggerButton.setAttribute('aria-expanded', 'true');
        triggerButton.innerHTML = 'Hide Demo <i class="bi bi-chevron-up ms-2"></i>';

        this.currentDemoProject = projectType;
    }

    /**
     * Initialize project-specific demo functionality
     */
    initializeProjectDemo(projectType) {
        switch (projectType) {
            case 'counter':
                this.initCounterDemo();
                break;
            case 'password':
                this.initPasswordDemo();
                break;
        }
    }

    /**
     * Counter App Demo
     */
    initCounterDemo() {
        const display = this._modalContent.querySelector('#counterValue');
        const increaseBtn = this._modalContent.querySelector('#increaseBtn');
        const decreaseBtn = this._modalContent.querySelector('#decreaseBtn');
        const resetBtn = this._modalContent.querySelector('#resetBtn');

        this.demoStates.counter.count = 0;
        this.updateCounterDisplay();

        increaseBtn.addEventListener('click', () => {
            this.demoStates.counter.count++;
            this.updateCounterDisplay();
        });

        decreaseBtn.addEventListener('click', () => {
            this.demoStates.counter.count--;
            this.updateCounterDisplay();
        });

        resetBtn.addEventListener('click', () => {
            this.demoStates.counter.count = 0;
            this.updateCounterDisplay();
        });
    }

    /**
     * Update counter display with animation
     */
    updateCounterDisplay() {
        const display = this._modalContent.querySelector('#counterValue');
        display.textContent = this.demoStates.counter.count;
        display.style.animation = 'none';
        setTimeout(() => {
            display.style.animation = 'pulse 0.3s ease';
        }, 10);
    }

    /**
     * Password Generator Demo
     */
    initPasswordDemo() {
        const lengthSlider = this._modalContent.querySelector('#passwordLength');
        const lengthValue = this._modalContent.querySelector('#lengthValue');
        const passwordInput = this._modalContent.querySelector('#generatedPassword');
        const generateBtn = this._modalContent.querySelector('#generatePasswordBtn');
        const copyBtn = this._modalContent.querySelector('#copyPasswordBtn');
        const copiedMessage = this._modalContent.querySelector('#copiedMessage');

        // Update length display
        lengthSlider.addEventListener('input', () => {
            lengthValue.textContent = lengthSlider.value;
        });

        // Generate password
        generateBtn.addEventListener('click', () => {
            const length = parseInt(lengthSlider.value);
            const password = this.generatePassword(length);
            passwordInput.value = password;
            this.demoStates.password.value = password;
        });

        // Copy to clipboard
        copyBtn.addEventListener('click', () => {
            if (passwordInput.value) {
                navigator.clipboard.writeText(passwordInput.value).then(() => {
                    copiedMessage.style.display = 'block';
                    setTimeout(() => {
                        copiedMessage.style.display = 'none';
                    }, 2000);
                }).catch(() => {
                    alert('Failed to copy password');
                });
            }
        });

        // Generate initial password
        generateBtn.click();
    }

    /**
     * Generate a secure random password
     */
    generatePassword(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    /**
     * Close the current demo with animation
     */
    closeDemo() {
        if (!this.currentDemoProject) return;
        // Update trigger button state
        const triggerBtn = document.querySelector(
            `.project-card[data-project="${this.currentDemoProject}"] .project-trigger`
        );
        if (triggerBtn) {
            triggerBtn.setAttribute('aria-expanded', 'false');
            triggerBtn.innerHTML = 'View Demo <i class="bi bi-chevron-down ms-2"></i>';
        }

        // Remove modal overlay with fade
        if (this._modalOverlay) {
            const overlay = this._modalOverlay;
            overlay.classList.remove('visible');
            // remove key handler
            if (this._modalKeyHandler) document.removeEventListener('keydown', this._modalKeyHandler);

            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                this._modalOverlay = null;
                this._modalContent = null;
                // restore scrolling
                document.documentElement.classList.remove('modal-open');
                document.body.style.overflow = '';
                // return focus to trigger
                if (this._lastTrigger) this._lastTrigger.focus();
                this.currentDemoProject = null;
                this._lastTrigger = null;
            }, 300);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProjectDemoManager();
});

(function () {
    try {
        var key = 'portfolio-theme';
        var saved = null;
        try { saved = localStorage.getItem(key); } catch (e) { saved = null; }
        var isValid = saved === 'dark' || saved === 'light';
        var theme = isValid ? saved : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-bs-theme', theme);
    } catch (e) {
        /* Fail silently */
    }
}());

document.addEventListener('DOMContentLoaded', function () {
    const themeStorageKey = "portfolio-theme";
    const rootElement = document.documentElement;
    const themeToggle = document.querySelector("[data-theme-toggle]");

    const readStoredTheme = () => {
        try {
            const theme = localStorage.getItem(themeStorageKey);
            return theme === "dark" || theme === "light" ? theme : null;
        } catch (error) {
            return null;
        }
    };

    const saveTheme = (theme) => {
        try {
            localStorage.setItem(themeStorageKey, theme);
        } catch (error) {
            return;
        }
    };

    const getSystemTheme = () => {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    const applyTheme = (theme) => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        rootElement.setAttribute("data-theme", theme);
        rootElement.setAttribute("data-bs-theme", theme);

        if (themeToggle) {
            themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
            themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
            themeToggle.setAttribute("title", `Switch to ${nextTheme} mode`);
        }
    };

    applyTheme(readStoredTheme() || getSystemTheme());

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = rootElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
            saveTheme(nextTheme);
        });
    }

    // ---- Contact form validation ----
    const contactForm = document.querySelector("#contactForm");

    if (contactForm) {
        const nameInput = document.querySelector("#name");
        const emailInput = document.querySelector("#email");
        const messageInput = document.querySelector("#message");
        const formStatus = document.querySelector("#formStatus");

        const fields = [
            {
                input: nameInput,
                errorId: "#nameError",
                validate: (value) => value.trim().length >= 2,
                message: "Please enter at least 2 characters.",
            },
            {
                input: emailInput,
                errorId: "#emailError",
                validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
                message: "Please enter a valid email address.",
            },
            {
                input: messageInput,
                errorId: "#messageError",
                validate: (value) => value.trim().length >= 10,
                message: "Message must be at least 10 characters long.",
            },
        ];

        const showError = (input, errorId, message) => {
            const errorElement = document.querySelector(errorId);
            input.classList.add("is-invalid");
            input.setAttribute("aria-invalid", "true");
            errorElement.textContent = message;
        };

        const clearError = (input, errorId) => {
            const errorElement = document.querySelector(errorId);
            input.classList.remove("is-invalid");
            input.removeAttribute("aria-invalid");
            errorElement.textContent = "";
        };

        const validateField = (field) => {
            const isValid = field.validate(field.input.value);
            if (isValid) {
                clearError(field.input, field.errorId);
            } else {
                showError(field.input, field.errorId, field.message);
            }
            return isValid;
        };

        fields.forEach((field) => {
            field.input.addEventListener("input", () => {
                if (field.input.classList.contains("is-invalid")) {
                    validateField(field);
                }
            });
        });

        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            formStatus.textContent = "";
            formStatus.classList.remove("success");

            const results = fields.map(validateField);
            const isValid = results.every(Boolean);

            if (isValid) {
                const nameValue = nameInput.value.trim();
                formStatus.textContent = `Thanks, ${nameValue}. Your message looks good and is ready to send.`;
                formStatus.classList.add("success");
                contactForm.reset();
            } else {
                formStatus.textContent = "Please fix the highlighted fields and try again.";
                const firstInvalid = fields.find((field) => field.input.classList.contains("is-invalid"));
                if (firstInvalid) {
                    firstInvalid.input.focus();
                }
            }
        });
    }

    // ---- Progress bars: read `data-progress` and animate width ----
    function applyProgressBar(el) {
        if (!el) return;
        let raw = el.getAttribute('data-progress') || el.dataset.progress;
        if (!raw) {
            raw = el.textContent || '';
        }
        let target = String(raw).trim();
        if (!target) return;
        if (!target.endsWith('%')) {
            // numeric like 85 -> treat as percent
            if (!isNaN(target)) target = target + '%';
        }
        // clamp
        const n = parseFloat(target);
        const clamped = Math.max(0, Math.min(100, n));
        const final = clamped + '%';
        // set ARIA
        el.setAttribute('role', 'progressbar');
        el.setAttribute('aria-valuemin', '0');
        el.setAttribute('aria-valuemax', '100');
        el.setAttribute('aria-valuenow', String(clamped));
        // trigger animation from 0 -> final
        el.style.width = '0';
        requestAnimationFrame(() => {
            el.style.width = final;
        });
    }

    document.querySelectorAll('.progress-bar').forEach(applyProgressBar);

    // Observe changes to data-progress attributes and update accordingly
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'data-progress') {
                applyProgressBar(m.target);
            }
        }
    });

    document.querySelectorAll('.progress-bar').forEach((el) => {
        observer.observe(el, { attributes: true });
    });

    const navCollapseEl = document.querySelector('#mainNavbar');

    if (navCollapseEl && window.bootstrap) {
        const collapseInstance = window.bootstrap.Collapse.getOrCreateInstance(navCollapseEl, { toggle: false });
        navCollapseEl.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                if (navCollapseEl.classList.contains('show')) {
                    collapseInstance.hide();
                }
            });
        });
    }
});

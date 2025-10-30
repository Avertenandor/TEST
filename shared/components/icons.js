/**
 * GENESIS - SVG Icon Library
 * Professional SVG icons for UI/UX enhancement
 * Version: 1.0
 * Date: 2025-10-29
 */

const GenesisIcons = {

    // ============================================
    // WALLET ICONS
    // ============================================

    trustWallet: `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="16" fill="#3375BB"/>
            <path d="M32 12L16 20V32C16 44 24 52 32 52C40 52 48 44 48 32V20L32 12Z" fill="white"/>
            <path d="M32 16L20 22V32C20 41 26 47 32 47C38 47 44 41 44 32V22L32 16Z" fill="#3375BB"/>
        </svg>
    `,

    safePal: `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="16" fill="#0B1426"/>
            <path d="M32 12L16 20V32C16 44 24 52 32 52C40 52 48 44 48 32V20L32 12Z" fill="#00D395"/>
            <path d="M28 32L32 36L40 28" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,

    // ============================================
    // INFO ICONS
    // ============================================

    globe: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
    `,

    lock: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    `,

    lightbulb: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18h6"/>
            <path d="M10 22h4"/>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
        </svg>
    `,

    info: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
    `,

    // ============================================
    // ACTION ICONS
    // ============================================

    copy: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
    `,

    check: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    `,

    chevronDown: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    `,

    arrowRight: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
        </svg>
    `,

    download: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
    `,

    externalLink: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
    `,

    // ============================================
    // CRYPTO/BLOCKCHAIN ICONS
    // ============================================

    wallet: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
        </svg>
    `,

    shield: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    `,

    // ============================================
    // HELPER FUNCTION
    // ============================================

    /**
     * Get SVG icon as HTML string
     * @param {string} iconName - Name of the icon
     * @param {string} className - Optional CSS class
     * @param {object} attrs - Optional additional attributes
     * @returns {string} SVG HTML string
     */
    get: function(iconName, className = '', attrs = {}) {
        const icon = this[iconName];
        if (!icon) {
            console.warn(`Icon "${iconName}" not found in GenesisIcons`);
            return '';
        }

        // Parse SVG and add class/attrs
        const parser = new DOMParser();
        const doc = parser.parseFromString(icon, 'image/svg+xml');
        const svg = doc.querySelector('svg');

        if (className) {
            svg.classList.add(...className.split(' '));
        }

        Object.keys(attrs).forEach(key => {
            svg.setAttribute(key, attrs[key]);
        });

        return svg.outerHTML;
    },

    /**
     * Insert icon into DOM element
     * @param {HTMLElement} element - Target element
     * @param {string} iconName - Name of the icon
     * @param {string} className - Optional CSS class
     */
    insertInto: function(element, iconName, className = '') {
        if (!element) return;
        element.innerHTML = this.get(iconName, className);
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GenesisIcons;
}

// Global window object
if (typeof window !== 'undefined') {
    window.GenesisIcons = GenesisIcons;
}

/**
 * i18next Internationalization Configuration
 * Professional multi-language support for VotEth
 * Supports: English, Hindi, Gujarati, Marathi
 */

// i18next configuration using CDN
const i18nextConfig = {
    lng: 'en', // Default language
    fallbackLng: 'en',
    debug: false,
    
    // Available languages
    supportedLngs: ['en', 'hi', 'gu', 'mr'],
    
    // Namespace configuration
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Backend configuration for loading translation files
    backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        crossDomain: false,
        withCredentials: false
    },
    
    // Detection configuration
    detection: {
        // Order of detection methods - localStorage first to respect user choice
        order: ['localStorage', 'navigator'],
        
        // Keys to lookup language from
        lookupLocalStorage: 'voteth_language',
        
        // Cache user language
        caches: ['localStorage'],
        
        // Exclude certain languages from being detected
        excludeCacheFor: ['cimode'],
        
        // Check cache validity to prevent auto-reset
        checkWhitelist: true
    },
    
    // Interpolation configuration
    interpolation: {
        escapeValue: false, // React already escapes
        formatSeparator: ',',
        format: function(value, format, lng) {
            if (format === 'uppercase') return value.toUpperCase();
            if (format === 'lowercase') return value.toLowerCase();
            return value;
        }
    },
    
    // React-specific options (if using React in future)
    react: {
        useSuspense: false
    }
};

/**
 * Language Manager Class
 * Handles language switching and UI updates
 */
class LanguageManager {
    constructor() {
        this.currentLang = 'en';
        this.languages = {
            'en': { name: 'English', nativeName: 'English', flag: '🇬🇧' },
            'hi': { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
            'gu': { name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
            'mr': { name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' }
        };
        this.initialized = false;
    }

    /**
     * Initialize i18next
     */
    async init() {
        try {
            // Check if i18next is loaded
            if (typeof i18next === 'undefined') {
                console.error('i18next library not loaded!');
                return false;
            }

            // Initialize i18next with HttpBackend and LanguageDetector
            await i18next
                .use(i18nextHttpBackend)
                .use(i18nextBrowserLanguageDetector)
                .init(i18nextConfig);

            this.currentLang = i18next.language;
            this.initialized = true;
            
            // Lock the language to prevent auto-detection changes
            if (localStorage.getItem('voteth_language')) {
                const savedLang = localStorage.getItem('voteth_language');
                if (savedLang !== i18next.language) {
                    await i18next.changeLanguage(savedLang);
                    this.currentLang = savedLang;
                }
            }

            console.log('✅ i18next initialized successfully');
            console.log('📍 Current language:', this.currentLang);

            // Update UI with initial translations
            this.updateUI();

            // Set up language selector
            this.setupLanguageSelector();

            return true;

        } catch (error) {
            console.error('❌ i18next initialization failed:', error);
            return false;
        }
    }

    /**
     * Change language
     */
    async changeLanguage(lang) {
        if (!this.languages[lang]) {
            console.error(`Language '${lang}' not supported`);
            return false;
        }

        try {
            // Save to localStorage FIRST to prevent detection override
            localStorage.setItem('voteth_language', lang);
            
            await i18next.changeLanguage(lang);
            this.currentLang = lang;
            this.updateUI();
            
            console.log('✅ Language changed to:', this.languages[lang].nativeName);
            
            // Show notification
            this.showLanguageNotification(lang);
            
            return true;
        } catch (error) {
            console.error('Error changing language:', error);
            return false;
        }
    }

    /**
     * Update all UI elements with translations
     */
    updateUI() {
        if (!this.initialized) return;

        // Translate all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = i18next.t(key);
            
            // Check if it's a placeholder or regular content
            if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                // Preserve HTML structure if needed
                if (element.getAttribute('data-i18n-html') === 'true') {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update page title
        document.title = i18next.t('app.title');

        // Update language selector button
        this.updateLanguageSelector();

        console.log('🔄 UI updated with translations');
    }

    /**
     * Setup language selector dropdown
     */
    setupLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (!selector) return;

        // Clear existing options
        selector.innerHTML = '';

        // Add language options
        Object.keys(this.languages).forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = `${this.languages[lang].flag} ${this.languages[lang].nativeName}`;
            option.selected = lang === this.currentLang;
            selector.appendChild(option);
        });

        // Add change event listener
        selector.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }

    /**
     * Update language selector button display
     */
    updateLanguageSelector() {
        const selectorBtn = document.getElementById('currentLanguageBtn');
        if (selectorBtn) {
            const lang = this.languages[this.currentLang];
            selectorBtn.textContent = `${lang.flag} ${lang.nativeName}`;
        }
    }

    /**
     * Show language change notification
     */
    showLanguageNotification(lang) {
        const langInfo = this.languages[lang];
        const message = `Language changed to ${langInfo.nativeName}`;
        
        // Use existing QR notification system if available
        if (typeof qrManager !== 'undefined' && qrManager.showNotification) {
            qrManager.showNotification(`${langInfo.flag} ${message}`, 'success');
        } else {
            console.log('✅', message);
        }
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        return this.languages;
    }

    /**
     * Translate a key programmatically
     */
    t(key, options = {}) {
        if (!this.initialized) {
            console.warn('LanguageManager not initialized');
            return key;
        }
        return i18next.t(key, options);
    }

    /**
     * Translate with interpolation
     * Example: t('election.remainingTime', { seconds: 120 })
     */
    translate(key, params = {}) {
        return this.t(key, params);
    }

    /**
     * Check if RTL (Right-to-Left) language
     * For future Arabic/Hebrew support
     */
    isRTL() {
        const rtlLangs = ['ar', 'he', 'ur'];
        return rtlLangs.includes(this.currentLang);
    }

    /**
     * Apply RTL styles if needed
     */
    applyRTL() {
        if (this.isRTL()) {
            document.body.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('dir', 'rtl');
        } else {
            document.body.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('dir', 'ltr');
        }
    }
}

// Create global instance
const languageManager = new LanguageManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        languageManager.init();
    });
} else {
    languageManager.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}

// Global helper function for translations
window.t = function(key, params) {
    return languageManager.translate(key, params);
};

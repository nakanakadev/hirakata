

class I18nManager {
    constructor() {
        this.currentLanguage = 'es';
        this.translations = {};
        this.availableLanguages = ['es', 'en', 'ja'];
        this.fallbackLanguage = 'en';
        this.isReady = false;
        this.languageConfig = {
            es: { name: 'Español', flag: '🇪🇸', direction: 'ltr' },
            en: { name: 'English', flag: '🇺🇸', direction: 'ltr' },
            ja: { name: '日本語', flag: '🇯🇵', direction: 'ltr' }
        };
        this.init();
    }
    async init() {
        this.currentLanguage = this.detectLanguage();
        await this.loadLanguage(this.currentLanguage);
        this.applyLanguage();
        this.isReady = true;
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('i18nReady', {
                detail: { language: this.currentLanguage }
            }));
        }
    }
    detectLanguage() {
        const savedLanguage = localStorage.getItem('hirakata-language');
        if (savedLanguage && this.availableLanguages.includes(savedLanguage)) {
            return savedLanguage;
        }
        const browserLanguage = navigator.language.split('-')[0];
        if (this.availableLanguages.includes(browserLanguage)) {
            return browserLanguage;
        }
        return this.currentLanguage;
    }
    async loadLanguage(language) {
        try {
            const url = `./i18n/${language}.json`;
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            this.translations[language] = jsonData;
        } catch (error) {
            if (language !== this.fallbackLanguage) {
                await this.loadLanguage(this.fallbackLanguage);
                this.currentLanguage = this.fallbackLanguage;
            } else {
                this.translations[language] = this.getDefaultTranslations();
            }
        }
    }
    getDefaultTranslations() {
        return {
            meta: { name: "Español", code: "es", direction: "ltr" },
            navigation: { home: "Inicio", hiragana: "Hiragana", katakana: "Katakana" },
            loading: { title: "Cargando HiraKata", subtitle: "Sistema modular en acción..." },
            home: { title: "Aprende Japonés con HiraKata", subtitle: "Domina Hiragana y Katakana" },
            features: { title: "Características", subtitle: "Todo lo que necesitas" },
            cta: { title: "¡Comienza ahora!", subtitle: "Únete a miles de estudiantes" },
            footer: { copyright: "© 2025 HiraKata" }
        };
    }
    async changeLanguage(language) {
        if (!this.availableLanguages.includes(language)) {
            return;
        }
        localStorage.setItem('hirakata-language', language);
        this.currentLanguage = language;
        if (!this.translations[language]) {
            await this.loadLanguage(language);
        }
        this.applyLanguage();
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language, config: this.languageConfig[language] }
        }));
    }
    t(key, replacements = {}) {
        const translation = this.getNestedValue(this.translations[this.currentLanguage], key);
        if (translation === undefined) {
            const fallbackTranslation = this.getNestedValue(this.translations[this.fallbackLanguage], key);
            if (fallbackTranslation === undefined) {
                return `[${key}]`;
            }
            return this.replaceVariables(fallbackTranslation, replacements);
        }
        return this.replaceVariables(translation, replacements);
    }
    getNestedValue(obj, key) {
        return key.split('.').reduce((current, keyPart) => {
            return current && current[keyPart] !== undefined ? current[keyPart] : undefined;
        }, obj);
    }
    replaceVariables(translation, replacements) {
        if (typeof translation !== 'string') return translation;
        return translation.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
            return replacements[variable] !== undefined ? replacements[variable] : match;
        });
    }
    applyLanguage() {
        const currentConfig = this.languageConfig[this.currentLanguage];
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = currentConfig.direction;
        this.updateMetaTags();
        if (window.HIRAKATA_CONFIG) {
            window.HIRAKATA_CONFIG.CURRENT_LANGUAGE = this.currentLanguage;
        }
    }
    updateMetaTags() {
        let langMeta = document.querySelector('meta[name="language"]');
        if (!langMeta) {
            langMeta = document.createElement('meta');
            langMeta.name = 'language';
            document.head.appendChild(langMeta);
        }
        langMeta.content = this.currentLanguage;
    }
    getAvailableLanguages() {
        return this.availableLanguages.map(code => ({
            code,
            ...this.languageConfig[code]
        }));
    }
    getCurrentLanguageConfig() {
        return {
            code: this.currentLanguage,
            ...this.languageConfig[this.currentLanguage]
        };
    }
    isLanguageLoaded(language) {
        return this.translations[language] !== undefined;
    }
    getSection(section) {
        const sectionTranslations = this.getNestedValue(this.translations[this.currentLanguage], section);
        return sectionTranslations || {};
    }
}

window.i18n = new I18nManager();
window.t = (key, replacements = {}) => window.i18n.t(key, replacements);

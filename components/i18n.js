

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
    // Asegura que la URL actual tenga ?lang= para persistencia entre F5 y compartir enlaces
    this.ensureLangParamInUrl();
        this.isReady = true;
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('i18nReady', {
                detail: { language: this.currentLanguage }
            }));
        }
    }
    detectLanguage() {
        // 1. Query param ?lang=
        try {
            const params = new URLSearchParams(window.location.search);
            const qpLang = params.get('lang');
            if (qpLang && this.availableLanguages.includes(qpLang)) {
                localStorage.setItem('hirakata-language', qpLang);
                return qpLang;
            }
        } catch(_) { /* ignore */ }
        // 2. LocalStorage
        const savedLanguage = localStorage.getItem('hirakata-language');
        if (savedLanguage && this.availableLanguages.includes(savedLanguage)) {
            return savedLanguage;
        }
        // 3. Browser
        try {
            const browserLanguage = navigator.language.split('-')[0];
            if (this.availableLanguages.includes(browserLanguage)) {
                return browserLanguage;
            }
        } catch(_) { /* ignore */ }
        // 4. Default
        return this.currentLanguage;
    }
    getLanguageFileUrl(language) {
        try {
            const rawPath = window.location.pathname || '/';
            // Normaliza removiendo index.html
            const path = rawPath.replace(/index\.html$/i, '');
            // Partes no vacías
            const parts = path.split('/').filter(Boolean);
            // Detecta si primer segmento es el nombre del repo (GitHub Pages) para no contar ese salto
            const REPO_NAME = 'hirakata';
            let hops;
            if (parts.length === 0) {
                hops = 0; // raíz
            } else if (parts[0] === REPO_NAME) {
                // Ignora segmento base (repo)
                hops = parts.length - 1;
            } else {
                hops = parts.length; // servidor local sin prefijo
            }
            const prefix = hops > 0 ? '../'.repeat(hops) : './';
            return `${prefix}i18n/${language}.json`;
        } catch (_) {
            return `./i18n/${language}.json`;
        }
    }
    async loadLanguage(language) {
        try {
            const url = this.getLanguageFileUrl(language);
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) {
                // Reintento con ruta absoluta desde raíz
                const altUrl = `/i18n/${language}.json`;
                const altResp = await fetch(altUrl, { cache: 'no-cache' });
                if (!altResp.ok) {
                    throw new Error(`HTTP error! status: ${response.status} & alt ${altResp.status}`);
                }
                const altJson = await altResp.json();
                this.translations[language] = altJson;
                return;
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
    this.ensureLangParamInUrl();
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
        // Traducir inmediatamente nodos con data-i18n si existe función t
        try {
            if (this.translations[this.currentLanguage]) {
                const nodes = document.querySelectorAll('[data-i18n]');
                nodes.forEach(node => {
                    const key = node.getAttribute('data-i18n');
                    if (key) {
                        const txt = this.t(key);
                        if (txt && typeof txt === 'string') node.textContent = txt;
                    }
                });
            }
        } catch(_) { /* ignore */ }
        // Reemplazar tokens de plantilla {{t:clave}} en HTML inyectado (footer, componentes estáticos)
        try {
            this.processTemplateTokens();
        } catch(_) { /* ignore */ }
        // Actualiza enlaces de navegación para mantener ?lang
        try {
            const anchors = document.querySelectorAll('a[href]');
            anchors.forEach(a => {
                if (/^(https?:|mailto:|#)/i.test(a.getAttribute('href'))) return; // ignora externos y anchors
                const url = new URL(a.getAttribute('href'), window.location.href);
                url.searchParams.set('lang', this.currentLanguage);
                a.setAttribute('href', url.pathname.replace(/\/index\.html$/, '/') + (url.search ? url.search : ''));
            });
        } catch(_) { /* ignore */ }
        if (window.HIRAKATA_CONFIG) {
            window.HIRAKATA_CONFIG.CURRENT_LANGUAGE = this.currentLanguage;
        }
    }
    processTemplateTokens(root=document) {
        if(!root) return;
        const walker = (el) => {
            // Solo procesar elementos que contienen el patrón para minimizar trabajo
            if(el.innerHTML && el.innerHTML.includes('{{t:')){
                el.innerHTML = el.innerHTML.replace(/\{\{t:([^}]+)\}\}/g, (m,k)=>{
                    const key = k.trim();
                    return this.t(key) || `[${key}]`;
                });
            }
            // No descender si no hay hijos significativos
            if(el.children && el.children.length){
                Array.from(el.children).forEach(child=>walker(child));
            }
        };
        walker(root.body ? root.body : root);
    }
    ensureLangParamInUrl() {
        try {
            if (typeof window === 'undefined') return;
            const url = new URL(window.location.href);
            const current = url.searchParams.get('lang');
            if (current !== this.currentLanguage) {
                url.searchParams.set('lang', this.currentLanguage);
                // Mantiene historial limpio (no añade nueva entrada)
                window.history.replaceState({}, '', url.pathname + url.search + url.hash);
            }
        } catch(_) { /* ignore */ }
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

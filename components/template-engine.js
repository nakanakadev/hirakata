

class TemplateEngine {    constructor(basePath = '') {
        this.basePath = basePath;
        this.cache = new Map();
        this.i18nReady = false;        
        
        window.addEventListener('i18nReady', () => {
            this.i18nReady = true;
        });
        
        
        window.addEventListener('languageChanged', () => {
            this.clearCache();
        });
        
        
        if (window.i18n && window.i18n.isReady) {
            this.i18nReady = true;
        }
    }

    
    async loadComponent(componentPath) {
        if (this.cache.has(componentPath)) {
            return this.cache.get(componentPath);
        }

        try {
            const response = await fetch(`${this.basePath}components/${componentPath}`);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath}`);
            }
            const template = await response.text();
            this.cache.set(componentPath, template);
            return template;
        } catch (error) {
            
            return '';
        }
    }    
    render(template, context = {}) {
        let rendered = template;
        
        
        const i18nAvailable = window.i18n && (window.i18n.isReady || window.i18n.isLanguageLoaded(window.i18n.currentLanguage));
        
        
        if (i18nAvailable) {
            rendered = this.processI18nTokens(rendered);
            if (!this.i18nReady) {
                this.i18nReady = true; 
            }
        } else {
            
        }
        
        
        for (const [key, value] of Object.entries(context)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, value || '');
        }

        
        const unreplacedVars = rendered.match(/{{[^}]+}}/g);
        

        return rendered;
    }    
    processI18nTokens(template) {
        if (!window.i18n || !window.t) {
            
            return template;
        }
        
        
        const i18nPattern = /\{\{t:([^|{}]+)(\|[^}]+)?\}\}/g;
        
        return template.replace(i18nPattern, (match, key, params) => {
            try {
                let replacements = {};
                
                
                if (params) {
                    const paramString = params.substring(1); 
                    const paramPairs = paramString.split(',');
                    paramPairs.forEach(pair => {
                        const [paramKey, paramValue] = pair.split(':');
                        if (paramKey && paramValue) {
                            replacements[paramKey.trim()] = paramValue.trim();
                        }
                    });
                }
                  const translation = window.t(key, replacements);
                return translation;
            } catch (error) {
                return match; // Devolver el token original si falla
            }
        });
    }

    
    async buildPage(config) {
        const {
            title,
            pageContent,
            context = {}
        } = config;

        try {
            
            const [head, header, footer] = await Promise.all([
                this.loadComponent('head.html'),
                this.loadComponent('header.html'),
                this.loadComponent('footer.html')
            ]);

            
            const renderedHead = this.render(head, { title, ...context });
            const renderedHeader = this.render(header, context);
            const renderedFooter = this.render(footer, context);

            
            const fullPage = renderedHead + 
                            renderedHeader + 
                            pageContent + 
                            renderedFooter;

            return fullPage;
        } catch (error) {
            
            return '';
        }
    }

    
    clearCache() {
        this.cache.clear();
    }
}


const PAGE_CONFIGS = {
    home: {
        headerGradient: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600',
        logoSize: 'h-24 md:h-28',
        logoPadding: 'pt-12',
        titlePadding: 'pb-8',
        titleSize: 'text-3xl md:text-4xl lg:text-5xl',
        titleLayout: '',
        textColor: 'text-indigo-100',
        navSpacing: 'space-x-4 md:space-x-8',
        logoPath: './',
        cssPath: './',
        homeUrl: './',
        hiraganaUrl: './hiragana/',
        katakanaUrl: './katakana/',
        hiraganaClass: 'hover:text-indigo-100',
        katakanaClass: 'hover:text-indigo-100',
        hiraganaState: 'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30',
        katakanaState: 'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30',
        extraNavItems: `<a href="#reference-tables"
                       class="group px-6 py-3 text-white hover:text-indigo-100 transition-all duration-300 text-lg font-semibold rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30">
                        <span class="flex items-center space-x-2">
                            <span>📚</span>
                            <span>Tablas</span>
                        </span>
                    </a>`
    },
    
    hiragana: {
        headerGradient: 'bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600',
        logoSize: 'h-24 md:h-28',
        logoPadding: 'pt-12',
        titlePadding: 'pb-8',
        titleSize: 'text-3xl md:text-4xl lg:text-5xl',
        titleLayout: 'flex items-center justify-center gap-4',
        titleIcon: '<span class="text-5xl">ひ</span>',
        textColor: 'text-indigo-100',
        navSpacing: 'space-x-4 md:space-x-8',
        logoPath: '../',
        cssPath: '../',
        homeUrl: '../',
        hiraganaUrl: '../hiragana/',
        katakanaUrl: '../katakana/',
        hiraganaClass: 'bg-white/20',
        katakanaClass: 'hover:text-indigo-100',
        hiraganaState: 'border-2 border-white/50',
        katakanaState: 'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30',        extraNavItems: `<button id="toggle-mode"
                       class="group px-6 py-3 text-white hover:text-indigo-100 transition-all duration-300 text-lg font-semibold rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30 cursor-pointer">
                        <span class="flex items-center space-x-2">
                            <span class="text-xl font-bold">あ</span>
                            <span>⇄</span>
                            <span class="text-xl font-bold">A</span>
                        </span>
                    </button>`,
        
        chartUrl: 'hiragana-chart.html',
        scriptName: 'hiragana',
        helpButtonColor: 'bg-indigo-500',
        helpButtonHover: 'hover:bg-indigo-600',
        helpButtonRing: 'focus:ring-indigo-200',
        characterGradient: 'bg-gradient-to-br from-indigo-500 to-blue-600',
        inputFocus: 'focus:border-indigo-500',
        inputRing: 'focus:ring-4 focus:ring-indigo-100',
        buttonGradient: 'bg-gradient-to-r from-indigo-500 to-blue-600',
        buttonHover: 'hover:from-indigo-600 hover:to-blue-700',
        buttonRing: 'focus:ring-indigo-200'
    },

    hiraganaChart: {
        headerGradient: 'bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600',
        logoSize: 'h-16 md:h-20',
        logoPadding: 'pt-8',
        titlePadding: 'pb-6',
        titleSize: 'text-2xl md:text-3xl',
        titleLayout: 'flex items-center justify-center gap-2',
        titleIcon: '<span class="text-3xl">ひ</span>',
        textColor: 'text-indigo-100',
        navSpacing: 'space-x-4 md:space-x-6',
        logoPath: '../',
        cssPath: '../',
        homeUrl: '../',
        hiraganaUrl: '../hiragana/',
        katakanaUrl: '../katakana/',
        hiraganaClass: 'bg-white/20',
        katakanaClass: 'hover:text-indigo-100',
        hiraganaState: 'border-2 border-white/50',
        katakanaState: 'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30',
        extraNavItems: ''
    },
    
    katakana: {
        headerGradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600',
        logoSize: 'h-24 md:h-28',
        logoPadding: 'pt-12',
        titlePadding: 'pb-8',
        titleSize: 'text-3xl md:text-4xl lg:text-5xl',
        titleLayout: 'flex items-center justify-center gap-4',
        titleIcon: '<span class="text-5xl">カ</span>',
        textColor: 'text-blue-100',
        navSpacing: 'space-x-4 md:space-x-8',
        logoPath: '../',
        cssPath: '../',
        homeUrl: '../',
        hiraganaUrl: '../hiragana/',
        katakanaUrl: '../katakana/',
        hiraganaClass: 'hover:text-blue-100',
        katakanaClass: 'bg-white/20',
        hiraganaState: 'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30',
        katakanaState: 'border-2 border-white/50',        extraNavItems: `<button id="toggle-mode"
                       class="group px-6 py-3 text-white hover:text-blue-100 transition-all duration-300 text-lg font-semibold rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30 cursor-pointer">
                        <span class="flex items-center space-x-2">
                            <span class="text-xl font-bold">ア</span>
                            <span>⇄</span>
                            <span class="text-xl font-bold">A</span>
                        </span>
                    </button>`,
        
        chartUrl: 'katakana-chart.html',
        scriptName: 'katakana',
        helpButtonColor: 'bg-blue-500',
        helpButtonHover: 'hover:bg-blue-600',
        helpButtonRing: 'focus:ring-blue-200',
        characterGradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        inputFocus: 'focus:border-blue-500',
        inputRing: 'focus:ring-4 focus:ring-blue-100',
        buttonGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        buttonHover: 'hover:from-blue-600 hover:to-indigo-700',
        buttonRing: 'focus:ring-blue-200'
    },

    katakanaChart: {
        headerGradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600',
        logoSize: 'h-16 md:h-20',
        logoPadding: 'pt-8',
        titlePadding: 'pb-6',
        titleSize: 'text-2xl md:text-3xl',
        titleLayout: 'flex items-center justify-center gap-2',
        titleIcon: '<span class="text-3xl">カ</span>',
        textColor: 'text-blue-100',
        navSpacing: 'space-x-4 md:space-x-6',
        logoPath: '../',
        cssPath: '../',
        homeUrl: '../',
        hiraganaUrl: '../hiragana/',
        katakanaUrl: '../katakana/',
        hiraganaClass: 'hover:text-blue-100',
        katakanaClass: 'bg-white/20',
        hiraganaState: 'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 border-2 border-transparent hover:border-white/30',
        katakanaState: 'border-2 border-white/50',
        extraNavItems: ''
    }
};


async function loadPage(pageType, customContext = {}) {
    const templateEngine = new TemplateEngine();
    const config = PAGE_CONFIGS[pageType];
    
    if (!config) {
        
        return '';
    }

    return await templateEngine.buildPage({
        title: customContext.title || pageType,
        pageContent: customContext.content || '',
        context: { ...config, ...customContext }
    });
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TemplateEngine, PAGE_CONFIGS, loadPage };
}


if (typeof window !== 'undefined') {
    window.HiraKataTemplates = { TemplateEngine, PAGE_CONFIGS, loadPage };
}

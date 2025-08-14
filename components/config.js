const HIRAKATA_CONFIG = {
    // Configuración de Internacionalización
    I18N: {
        DEFAULT_LANGUAGE: 'es',
        AVAILABLE_LANGUAGES: ['es', 'en', 'ja'],
        FALLBACK_LANGUAGE: 'en',
        STORAGE_KEY: 'hirakata-language',
        AUTO_DETECT: true
    },

    URLS: {
        BASE: 'https://nakanakadev.github.io/hirakata/',
        HOME: './',
        HIRAGANA: './hiragana/',
        KATAKANA: './katakana/',
        GITHUB: 'https://github.com/nakanakadev/'
    },

    PATHS: {
        LOGO: './hirakata-nobg.png',
        CSS: './styles.css',
        DATA: {
            HIRAGANA: '../data/hiragana.json',
            KATAKANA: '../data/katakana.json'
        },
    },

    THEME: {
        PALETTES: {
            PRIMARY: {
                INDIGO: 'indigo',
                BLUE: 'blue',
                PURPLE: 'purple'
            },
            HIRAGANA: {
                PRIMARY: 'indigo-500',
                SECONDARY: 'blue-600',
                GRADIENT: 'from-indigo-500 via-blue-500 to-indigo-600'
            },
            KATAKANA: {
                PRIMARY: 'blue-500',
                SECONDARY: 'indigo-600', 
                GRADIENT: 'from-blue-500 via-indigo-500 to-blue-600'
            },
            HOME: {
                GRADIENT: 'from-indigo-600 via-blue-600 to-purple-600'
            }
        },
        
        SIZES: {
            LOGO: {
                LARGE: 'h-24 md:h-28',
                MEDIUM: 'h-16 md:h-20',
                SMALL: 'h-12'
            },
            TITLE: {
                HERO: 'text-3xl md:text-4xl lg:text-5xl',
                PAGE: 'text-2xl md:text-3xl',
                SECTION: 'text-xl md:text-2xl'
            }
        }
    },

    CONTENT: {
        APP_NAME: 'HiraKata',
        TAGLINE: 'Aprende Japonés con HiraKata',
        COPYRIGHT: '© 2025 HiraKata. Desarrollado con ❤️ por nakanakadev',
        SUBTITLE: 'Hecho para estudiantes de japonés, por estudiantes de japonés.',
        
        PAGES: {
            HOME: {
                TITLE: 'Aprende Japonés con HiraKata - Hiragana, Katakana y Kanji',
                HERO_TITLE: '¡Aprende Japonés con HiraKata!',
                HERO_SUBTITLE: 'Domina los silabarios Hiragana y Katakana, y prepárate para los Kanji con ejercicios interactivos y divertidos.'
            },
            HIRAGANA: {
                TITLE: 'Hiragana - Aprende Japonés con HiraKata',
                PAGE_TITLE: 'Practica Hiragana',
                SUBTITLE: 'Domina el silabario Hiragana con ejercicios interactivos y divertidos.',
                CHART_TITLE: 'Tabla Completa de Hiragana',
                CHART_SUBTITLE: 'Referencia visual de todos los caracteres del silabario Hiragana'
            },
            KATAKANA: {
                TITLE: 'Katakana - Aprende Japonés con HiraKata',
                PAGE_TITLE: 'Practica Katakana', 
                SUBTITLE: 'Domina el silabario Katakana con ejercicios interactivos y divertidos.',
                CHART_TITLE: 'Tabla Completa de Katakana',
                CHART_SUBTITLE: 'Referencia visual de todos los caracteres del silabario Katakana'
            }
        },        NAVIGATION: {
            HOME: '🏠 Inicio',
            HIRAGANA: 'ひ Hiragana',
            KATAKANA: 'カ Katakana',
            TABLES: '📚 Tablas',
            TOGGLE_MODE: '⇄ Modo',
            TOGGLE_CHARS: {
                HIRAGANA: { JP: 'あ', EN: 'A' },
                KATAKANA: { JP: 'ア', EN: 'A' }
            }
        },

        PRACTICE: {
            QUESTION: '¿Cómo se lee este carácter?',
            PLACEHOLDER: 'Escribe la romanización',
            BUTTON_CHECK: 'Verificar Respuesta',
            ENCOURAGEMENT: '💪 ¡Sigue practicando!',
            HELP_ARIA: 'Ver tabla completa de {{script}}'
        }    },

    PAGES: {
        HIRAGANA: {
            title: 'Hiragana - HiraKata',
            description: 'Practica Hiragana - Aprende japonés con ejercicios interactivos',
            pageTitle: 'Practica Hiragana',
            subtitle: 'Domina el silabario Hiragana con ejercicios interactivos y divertidos.',
            theme: {
                gradient: 'from-indigo-500 via-blue-500 to-indigo-600',
                primary: 'indigo-500',
                secondary: 'blue-600'
            },
            chartUrl: 'hiragana-chart.html',
            scriptPath: 'script.js'
        },
        KATAKANA: {
            title: 'Katakana - HiraKata',
            description: 'Practica Katakana - Aprende japonés con ejercicios interactivos',
            pageTitle: 'Practica Katakana',
            subtitle: 'Domina el silabario Katakana con ejercicios interactivos y divertidos.',
            theme: {
                gradient: 'from-blue-500 via-indigo-500 to-blue-600',
                primary: 'blue-500',
                secondary: 'indigo-600'
            },
            chartUrl: 'katakana-chart.html',
            scriptPath: 'script.js'
        }
    },

    SETTINGS: {
        CACHE_ENABLED: true,
        DEBUG_MODE: false,
        ANIMATION_DURATION: 300,
        
        TABLE_CONFIG: {
            CONSONANT_ORDER: ['', 'k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'y', 'r', 'w'],
            VOWEL_ORDER: ['a', 'i', 'u', 'e', 'o'],
            YOON_CONSONANTS: ['ky', 'gy', 'shy', 'jy', 'chy', 'ny', 'hy', 'by', 'py', 'my', 'ry'],
            YOON_VOWELS: ['a', 'u', 'o']
        }
    }
};

function getRelativePaths(level = 0) {
    const prefix = '../'.repeat(level);
    return {
        logo: prefix + 'hirakata-nobg.png',
        css: prefix + 'styles.css',
        components: prefix + 'components/',
        data: prefix + 'data/',
        images: prefix + 'img/'
    };
}

function generatePageConfig(pageType, customConfig = {}) {
    const baseConfig = HIRAKATA_CONFIG.CONTENT.PAGES[pageType.toUpperCase()];
    const themeConfig = HIRAKATA_CONFIG.THEME.PALETTES[pageType.toUpperCase()] || HIRAKATA_CONFIG.THEME.PALETTES.PRIMARY;
    
    return {
        ...baseConfig,
        ...themeConfig,
        ...customConfig
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HIRAKATA_CONFIG, getRelativePaths, generatePageConfig };
}

if (typeof window !== 'undefined') {
    window.HIRAKATA_CONFIG = HIRAKATA_CONFIG;
    window.getRelativePaths = getRelativePaths;
    window.generatePageConfig = generatePageConfig;
}

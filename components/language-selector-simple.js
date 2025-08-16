
let currentLanguage = localStorage.getItem('hirakata-language') || 'es';
const languages = {
    es: { name: 'Español', flag: '🇪🇸' },
    en: { name: 'English', flag: '🇺🇸' },
    ja: { name: '日本語', flag: '🇯🇵' }
};

window.toggleLanguageDropdown = function() {
    const dropdown = document.getElementById('language-dropdown');
    const arrow = document.getElementById('language-arrow');
    const button = document.getElementById('language-toggle');
    
    if (!dropdown) {
        return;
    }
    
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        if (arrow) arrow.style.transform = 'rotate(180deg)';
        if (button) button.setAttribute('aria-expanded', 'true');
    } else {
        dropdown.style.display = 'none';
        if (arrow) arrow.style.transform = 'rotate(0deg)';
        if (button) button.setAttribute('aria-expanded', 'false');
    }
};

window.changeLanguage = async function(langCode) {
    if (!languages[langCode]) {
        return;
    }
    
    localStorage.setItem('hirakata-language', langCode);
    
    currentLanguage = langCode;
    
    updateSelectorUI(langCode);
    
    window.toggleLanguageDropdown();
    
    if (window.i18n && window.i18n.changeLanguage) {
        try {
            await window.i18n.changeLanguage(langCode);
            
            if (window.updateUI) {
                window.updateUI();
            } else {
                setTimeout(() => location.reload(), 300);
            }
        } catch (error) {
            setTimeout(() => location.reload(), 300);
        }
    } else {
        setTimeout(() => location.reload(), 300);
    }
};

function setupClickOutside() {
    document.addEventListener('click', function(event) {
        const selector = document.getElementById('language-selector');
        const dropdown = document.getElementById('language-dropdown');
        
        if (selector && !selector.contains(event.target) && dropdown && dropdown.style.display === 'block') {
            window.toggleLanguageDropdown();
        }
    });
}

function setupEscapeKey() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const dropdown = document.getElementById('language-dropdown');
            if (dropdown && dropdown.style.display === 'block') {
                window.toggleLanguageDropdown();
            }
        }
    });
}

function initLanguageSelector() {
    setupClickOutside();
    setupEscapeKey();
    
    let targetLanguage = currentLanguage;
    if (window.i18n && window.i18n.currentLanguage) {
        targetLanguage = window.i18n.currentLanguage;
    } else {
        const savedLang = localStorage.getItem('hirakata-language');
        if (savedLang && languages[savedLang]) {
            targetLanguage = savedLang;
        }
    }
    
    currentLanguage = targetLanguage;
    
    updateSelectorUI(targetLanguage);
}

window.initLanguageSelector = initLanguageSelector;

function updateSelectorUI(langCode) {
    const flagElement = document.getElementById('current-language-flag');
    const nameElement = document.getElementById('current-language-name');
    
    if (flagElement && nameElement && languages[langCode]) {
        flagElement.textContent = languages[langCode].flag;
        nameElement.textContent = languages[langCode].name;
    }
    
    ['es', 'en', 'ja'].forEach(lang => {
        const check = document.getElementById(`check-${lang}`);
        if (check) {
            const newOpacity = lang === langCode ? '1' : '0';
            check.style.opacity = newOpacity;
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSelector);
} else {
    initLanguageSelector();
}

function tryImmediateUpdate() {
    const flagElement = document.getElementById('current-language-flag');
    const nameElement = document.getElementById('current-language-name');
    
    if (flagElement && nameElement) {
        let targetLanguage = localStorage.getItem('hirakata-language') || 'es';
        if (window.i18n && window.i18n.currentLanguage) {
            targetLanguage = window.i18n.currentLanguage;
        }
        
        currentLanguage = targetLanguage;
        updateSelectorUI(targetLanguage);
        return true; // Éxito
    } else {
        return false; // No encontrado
    }
}

window.tryImmediateUpdate = tryImmediateUpdate;

function startImmediateUpdate() {
    let attempts = 0;
    const maxAttempts = 20; // máximo 1 segundo de espera
    
    const retry = () => {
        if (tryImmediateUpdate()) {
            console.log('✅ Actualización inmediata exitosa');
            return;
        }        
        attempts++;
        if (attempts < maxAttempts) {
            setTimeout(retry, 50);
        }
    };
    
    retry();
}

startImmediateUpdate();

window.addEventListener('i18nReady', function(event) {
    const i18nLanguage = event.detail.language;
    if (i18nLanguage && languages[i18nLanguage] && i18nLanguage !== currentLanguage) {
        currentLanguage = i18nLanguage;
        updateSelectorUI(i18nLanguage);
    }
});

window.addEventListener('languageChanged', function(event) {
    const newLanguage = event.detail.language;
    if (newLanguage && languages[newLanguage] && newLanguage !== currentLanguage) {
        currentLanguage = newLanguage;
        updateSelectorUI(newLanguage);
    }
});

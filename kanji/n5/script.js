document.addEventListener('DOMContentLoaded', () => {
    const kanjiChartContainer = document.getElementById('kanji-chart-container');
    console.debug('[KANJI] DOMContentLoaded, current lang:', window.i18n && window.i18n.currentLanguage);
    fetch('kanji-chart.html')
        .then(response => {
            console.debug('[KANJI] Chart fragment status', response.status);
            return response.text();
        })
        .then(html => {
            kanjiChartContainer.innerHTML = html;
            applyTranslations();
            // Placeholder de carga mientras llega el JSON
            const body = document.getElementById('kanji-table-body');
            if(body){
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="4" class="p-4 text-center text-slate-500" data-i18n="loading.title">${fallbackT('loading.title','Cargando...')}</td>`;
                body.appendChild(tr);
            }
            loadKanjiData();
        })
        .catch(error => {
            console.error('Error loading kanji chart:', error);
            kanjiChartContainer.innerHTML = `<p class="text-red-500 text-center" data-i18n="kanji.errors.chartLoad">${fallbackT('kanji.errors.chartLoad','Error al cargar la tabla de kanji.')}</p>`;
            applyTranslations();
        });
    window.addEventListener('languageChanged', () => {
        applyTranslations();
    });
    if(window.i18n && window.i18n.isReady){ applyTranslations(); }
});

function fallbackT(key, def){
    if(window.t) return window.t(key) || def;
    return def;
}

function applyTranslations(){
    if(!(window.i18n && window.t)) return;
    document.querySelectorAll('[data-i18n]').forEach(node=>{
        const k=node.getAttribute('data-i18n');
        if(k) node.textContent = window.t(k);
    });
}

function loadKanjiData() {
    const jsonUrl = '/data/kanji/n5.json'; // ruta absoluta para evitar problemas de resolución
    console.debug('[KANJI] Fetching data from', jsonUrl);
    fetch(jsonUrl, { cache: 'no-cache' })
        .then(response => {
            console.debug('[KANJI] Data status', response.status);
            return response.json();
        })
        .then(data => {
            if(!data || !data.n5){ throw new Error('Formato inesperado de JSON'); }
            window.__KANJI_N5_DATA__ = data.n5; // cache para re-render
            console.debug('[KANJI] Entries loaded:', data.n5.length);
            renderKanjiTable();
        })
        .catch(error => {
            console.error('Error loading kanji data:', error);
            const tableBody = document.getElementById('kanji-table-body');
            if(tableBody) {
                tableBody.innerHTML = '';
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.className = 'p-4 text-center text-red-500';
                cell.setAttribute('data-i18n','kanji.errors.dataLoad');
                cell.textContent = fallbackT('kanji.errors.dataLoad','No se pudieron cargar los datos de los kanji.');
                row.appendChild(cell);
                tableBody.appendChild(row);
                applyTranslations();
            }
        });
}

function getCurrentLang(){
    return (window.i18n && window.i18n.currentLanguage) ? window.i18n.currentLanguage : 'en';
}

function resolveMeaning(entry){
    if(!entry) return '';
    const m = entry.meaning;
    if(typeof m === 'string') return m; // retrocompatibilidad
    const lang = getCurrentLang();
    if(m[lang]) return m[lang];
    return m['en'] || Object.values(m)[0] || '';
}

function renderKanjiTable(){
    const tableBody = document.getElementById('kanji-table-body');
    if(!tableBody || !window.__KANJI_N5_DATA__) return;
    tableBody.innerHTML = '';
    window.__KANJI_N5_DATA__.forEach(entry => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition-colors duration-200';
        row.innerHTML = `
            <td class="p-4 border border-slate-200 text-center text-3xl font-bold text-slate-800">${entry.kanji}</td>
            <td class="p-4 border border-slate-200 text-slate-600">${resolveMeaning(entry)}</td>
            <td class="p-4 border border-slate-200 text-slate-600 font-mono">${entry.onyomi || ''}</td>
            <td class="p-4 border border-slate-200 text-slate-600 font-mono">${entry.kunyomi || ''}</td>`;
        tableBody.appendChild(row);
    });
}

window.addEventListener('languageChanged', () => {
    renderKanjiTable();
});

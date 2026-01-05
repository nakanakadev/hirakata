let allN5Kanji = [];
let kanjiSearch, meaningSearch, onyomiSearch, kunyomiSearch;

document.addEventListener('DOMContentLoaded', () => {
    const kanjiChartContainer = document.getElementById('kanji-chart-container');

    // Manejar el cambio de idioma para volver a renderizar la tabla y la búsqueda.
    window.addEventListener('languageChanged', () => {
        if (window.initPageI18n) {
            window.initPageI18n();
        }
        // Disparar un solo evento de input para recargar y filtrar
        if (kanjiSearch) {
            const event = new Event('input', { bubbles: true, cancelable: true });
            kanjiSearch.dispatchEvent(event);
        }
    });

    // Cargar el componente de la tabla de kanji
    fetch('kanji-chart.html')
        .then(response => response.text())
        .then(html => {
            kanjiChartContainer.innerHTML = html;
            
            // Inicializar los campos de búsqueda
            kanjiSearch = document.getElementById('kanji-search');
            meaningSearch = document.getElementById('meaning-search');
            onyomiSearch = document.getElementById('onyomi-search');
            kunyomiSearch = document.getElementById('kunyomi-search');

            // Traducir el contenido estático recién inyectado
            if (window.initPageI18n) {
                window.initPageI18n();
            }

            // Añadir listeners para cada campo de búsqueda
            [kanjiSearch, meaningSearch, onyomiSearch, kunyomiSearch].forEach(input => {
                if (input) {
                    input.addEventListener('input', handleMultiSearch);
                }
            });
            
            // Cargar los datos de los kanji
            loadKanjiData();
        })
        .catch(error => {
            console.error('Error al cargar la tabla de kanji:', error);
            kanjiChartContainer.innerHTML = `<p class="text-red-500 text-center">${window.t ? window.t('kanji.table.loadError') : 'Could not load the chart.'}</p>`;
        });
});

function renderKanjiTable(kanjiList) {
    const tableBody = document.getElementById('kanji-table-body');
    if (!tableBody) {
        console.error('No se encontró el cuerpo de la tabla de kanji.');
        return;
    }
    tableBody.innerHTML = ''; // Limpiar resultados anteriores

    if (kanjiList.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.className = 'p-8 text-center text-slate-500';
        cell.textContent = window.t ? window.t('kanji.table.noResults') : 'No kanji found.';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    kanjiList.forEach(kanji => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition-colors duration-200';

        const translatedMeaning = window.t ? window.t('kanji_meanings.' + kanji.kanji) : kanji.meaning;
        const displayMeaning = translatedMeaning.startsWith('[') ? kanji.meaning : translatedMeaning;

        row.innerHTML = `
            <td class="p-4 border border-slate-200 text-center text-3xl font-bold text-slate-800">${kanji.kanji}</td>
            <td class="p-4 border border-slate-200 text-slate-600">${displayMeaning}</td>
            <td class="p-4 border border-slate-200 text-slate-600 font-mono">${kanji.onyomi}</td>
            <td class="p-4 border border-slate-200 text-slate-600 font-mono">${kanji.kunyomi}</td>
        `;

        tableBody.appendChild(row);
    });
}

function handleMultiSearch() {
    const kanjiQuery = kanjiSearch.value.toLowerCase().trim();
    const meaningQuery = meaningSearch.value.toLowerCase().trim();
    const onyomiQuery = onyomiSearch.value.toLowerCase().trim();
    const kunyomiQuery = kunyomiSearch.value.toLowerCase().trim();

    if (!allN5Kanji) return;

    const filteredKanji = allN5Kanji.filter(kanji => {
        const meaning = (window.t ? window.t('kanji_meanings.' + kanji.kanji) : kanji.meaning).toLowerCase();
        const onyomi = kanji.onyomi.toLowerCase();
        const kunyomi = kanji.kunyomi.toLowerCase();

        return (
            kanji.kanji.includes(kanjiQuery) &&
            meaning.includes(meaningQuery) &&
            onyomi.includes(onyomiQuery) &&
            kunyomi.includes(kunyomiQuery)
        );
    });

    renderKanjiTable(filteredKanji);
}


function loadKanjiData() {
    if (allN5Kanji.length > 0) {
        renderKanjiTable(allN5Kanji);
        return;
    }
    fetch('../../data/kanji.json')
        .then(response => response.json())
        .then(data => {
            allN5Kanji = data.n5;
            // Renderizar la tabla completa la primera vez
            renderKanjiTable(allN5Kanji);
        })
        .catch(error => {
            console.error('Error al cargar los datos de kanji:', error);
            const tableBody = document.getElementById('kanji-table-body');
            if(tableBody) {
                tableBody.innerHTML = '';
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.className = 'p-4 text-center text-red-500';
                cell.textContent = window.t ? window.t('kanji.table.loadError') : 'Could not load kanji data.';
                row.appendChild(cell);
                tableBody.appendChild(row);
            }
        });
}
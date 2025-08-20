document.addEventListener('DOMContentLoaded', () => {
    const kanjiChartContainer = document.getElementById('kanji-chart-container');

    // Cargar el componente de la tabla de kanji
    fetch('kanji-chart.html')
        .then(response => response.text())
        .then(html => {
            kanjiChartContainer.innerHTML = html;
            // Una vez cargada la estructura de la tabla, cargar los datos de los kanji
            loadKanjiData();
        })
        .catch(error => {
            console.error('Error al cargar la tabla de kanji:', error);
            kanjiChartContainer.innerHTML = '<p class="text-red-500 text-center">Error al cargar la tabla de kanji.</p>';
        });
});

function loadKanjiData() {
    fetch('../data/kanji.json')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('kanji-table-body');
            if (!tableBody) {
                console.error('No se encontró el cuerpo de la tabla de kanji.');
                return;
            }

            data.n5.forEach(kanji => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-slate-50 transition-colors duration-200';

                row.innerHTML = `
                    <td class="p-4 border border-slate-200 text-center text-3xl font-bold text-slate-800">${kanji.kanji}</td>
                    <td class="p-4 border border-slate-200 text-slate-600">${kanji.meaning}</td>
                    <td class="p-4 border border-slate-200 text-slate-600 font-mono">${kanji.onyomi}</td>
                    <td class="p-4 border border-slate-200 text-slate-600 font-mono">${kanji.kunyomi}</td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al cargar los datos de kanji:', error);
            const tableBody = document.getElementById('kanji-table-body');
            if(tableBody) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.className = 'p-4 text-center text-red-500';
                cell.textContent = 'No se pudieron cargar los datos de los kanji.';
                row.appendChild(cell);
                tableBody.appendChild(row);
            }
        });
}

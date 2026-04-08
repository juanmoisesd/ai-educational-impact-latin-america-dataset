// Global state
let globalData = [];
let filteredData = [];

// Configuration
const COLORS = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    neutral: '#94a3b8'
};

const PLOT_CONFIG = {
    responsive: true,
    displayModeBar: false
};

// Load data
async function loadData() {
    try {
        const response = await fetch('data/dataset_final.csv');
        const csvData = await response.text();

        Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(results) {
                globalData = results.data.filter(d => d.participant_id);
                filteredData = [...globalData];

                populateFilters();
                updateDashboard();
            }
        });
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('summary-cards').innerHTML = `<div class="col-span-full text-center p-8 bg-red-50 text-red-600 rounded-xl">Error loading dataset. Please ensure the CSV file is accessible.</div>`;
    }
}

function populateFilters() {
    const countries = [...new Set(globalData.map(d => d.country))].sort();
    const select = document.getElementById('country-filter');
    countries.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

function applyFilters() {
    const country = document.getElementById('country-filter').value;
    if (country === 'all') {
        filteredData = [...globalData];
    } else {
        filteredData = globalData.filter(d => d.country === country);
    }
    updateDashboard();
}

function updateDashboard() {
    document.getElementById('record-count').textContent = filteredData.length;
    renderSummary();
    renderVariableAnalysis();
    renderCombinations();
}

function renderSummary() {
    const container = document.getElementById('summary-cards');
    if (filteredData.length === 0) {
        container.innerHTML = '';
        return;
    }

    const avgPerf = (filteredData.reduce((acc, curr) => acc + curr.academic_performance, 0) / filteredData.length).toFixed(1);
    const avgMot = (filteredData.reduce((acc, curr) => acc + curr.motivation_score, 0) / filteredData.length).toFixed(1);
    const avgReg = (filteredData.reduce((acc, curr) => acc + curr.self_regulation_score, 0) / filteredData.length).toFixed(1);
    const totalParticipants = filteredData.length;

    const cards = [
        { label: 'Avg Performance', value: `${avgPerf}%`, color: 'blue' },
        { label: 'Avg Motivation', value: avgMot, color: 'emerald' },
        { label: 'Avg Self-Regulation', value: avgReg, color: 'amber' },
        { label: 'Participants', value: totalParticipants, color: 'indigo' }
    ];

    container.innerHTML = cards.map(card => `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">${card.label}</p>
            <p class="text-3xl font-black text-gray-900 mt-2">${card.value}</p>
            <div class="w-full bg-gray-100 h-1 mt-4 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full" style="width: ${Math.min(parseFloat(card.value) * (card.value.includes('%') ? 1 : 20), 100)}%"></div>
            </div>
        </div>
    `).join('');
}

function renderVariableAnalysis() {
    const layoutBase = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 10, b: 30, l: 30, r: 10 },
        font: { family: 'Inter, sans-serif', size: 11 },
        showlegend: false
    };

    // Academic Performance
    Plotly.newPlot('plot-performance', [{
        x: filteredData.map(d => d.academic_performance),
        type: 'histogram',
        marker: { color: COLORS.primary, line: { color: 'white', width: 1 } },
        nbinsx: 20
    }], layoutBase, PLOT_CONFIG);

    // Motivation
    Plotly.newPlot('plot-motivation', [{
        x: filteredData.map(d => d.motivation_score),
        type: 'histogram',
        marker: { color: COLORS.success, line: { color: 'white', width: 1 } },
        nbinsx: 5
    }], layoutBase, PLOT_CONFIG);

    // Self-regulation
    Plotly.newPlot('plot-regulation', [{
        x: filteredData.map(d => d.self_regulation_score),
        type: 'histogram',
        marker: { color: COLORS.warning, line: { color: 'white', width: 1 } },
        nbinsx: 5
    }], layoutBase, PLOT_CONFIG);

    // Country Bar
    const countryCounts = {};
    filteredData.forEach(d => countryCounts[d.country] = (countryCounts[d.country] || 0) + 1);
    Plotly.newPlot('plot-countries', [{
        x: Object.keys(countryCounts),
        y: Object.values(countryCounts),
        type: 'bar',
        marker: {
            color: Object.values(countryCounts),
            colorscale: 'Viridis'
        }
    }], layoutBase, PLOT_CONFIG);
}

function renderCombinations() {
    const layoutBase = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 30, b: 50, l: 50, r: 20 },
        font: { family: 'Inter, sans-serif', size: 12 }
    };

    // Performance vs Motivation
    Plotly.newPlot('plot-perf-vs-mot', [{
        x: filteredData.map(d => d.motivation_score),
        y: filteredData.map(d => d.academic_performance),
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: filteredData.map(d => d.self_regulation_score),
            colorscale: 'Portland',
            size: 10,
            opacity: 0.7,
            showscale: true,
            colorbar: { title: 'Self-Reg', thickness: 15 }
        }
    }], {
        ...layoutBase,
        xaxis: { title: 'Motivation Score (1-5)' },
        yaxis: { title: 'Academic Performance (%)' }
    }, PLOT_CONFIG);

    // Performance by Country Box
    const countries = [...new Set(filteredData.map(d => d.country))];
    const boxTraces = countries.map(c => ({
        y: filteredData.filter(d => d.country === c).map(d => d.academic_performance),
        type: 'box',
        name: c,
        boxpoints: 'outliers',
        marker: { color: COLORS.secondary }
    }));

    Plotly.newPlot('plot-perf-by-country', boxTraces, {
        ...layoutBase,
        yaxis: { title: 'Performance (%)' },
        showlegend: false
    }, PLOT_CONFIG);
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.textContent.toLowerCase().includes(id)) {
            btn.classList.add('bg-indigo-50', 'text-indigo-600');
        } else {
            btn.classList.remove('bg-indigo-50', 'text-indigo-600');
        }
    });

    window.dispatchEvent(new Event('resize'));
}

// Initialize
loadData();
showSection('variables');

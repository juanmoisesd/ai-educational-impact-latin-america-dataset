// Global data
let globalData = [];

// Load data
async function loadData() {
    const response = await fetch('../data/analysis_ready/dataset_final.csv');
    const csvData = await response.text();

    Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            globalData = results.data.filter(d => d.participant_id); // Filter out empty rows
            renderDashboard();
        }
    });
}

function renderDashboard() {
    renderSummary();
    renderVariableAnalysis();
    renderCombinations();
}

function renderSummary() {
    const container = document.getElementById('summary-cards');
    const avgPerf = (globalData.reduce((acc, curr) => acc + curr.academic_performance, 0) / globalData.length).toFixed(1);
    const avgMot = (globalData.reduce((acc, curr) => acc + curr.motivation_score, 0) / globalData.length).toFixed(1);
    const totalParticipants = globalData.length;
    const countriesCount = new Set(globalData.map(d => d.country)).size;

    const cards = [
        { label: 'Avg Performance', value: `${avgPerf}%`, color: 'blue' },
        { label: 'Avg Motivation', value: avgMot, color: 'green' },
        { label: 'Total Participants', value: totalParticipants, color: 'indigo' },
        { label: 'Countries Covered', value: countriesCount, color: 'purple' }
    ];

    container.innerHTML = cards.map(card => `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p class="text-sm font-medium text-gray-500 uppercase">${card.label}</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">${card.value}</p>
        </div>
    `).join('');
}

function renderVariableAnalysis() {
    // Academic Performance Distribution
    const perf = globalData.map(d => d.academic_performance);
    Plotly.newPlot('plot-performance', [{
        x: perf,
        type: 'histogram',
        marker: { color: '#6366f1' }
    }], {
        title: 'Academic Performance Distribution',
        margin: { t: 40, b: 40, l: 40, r: 20 },
        font: { family: 'Inter, sans-serif' }
    });

    // Motivation Distribution
    const mot = globalData.map(d => d.motivation_score);
    Plotly.newPlot('plot-motivation', [{
        x: mot,
        type: 'histogram',
        marker: { color: '#10b981' }
    }], {
        title: 'Motivation Score Distribution',
        margin: { t: 40, b: 40, l: 40, r: 20 },
        font: { family: 'Inter, sans-serif' }
    });

    // Self-regulation Distribution
    const reg = globalData.map(d => d.self_regulation_score);
    Plotly.newPlot('plot-regulation', [{
        x: reg,
        type: 'histogram',
        marker: { color: '#f59e0b' }
    }], {
        title: 'Self-regulation Score Distribution',
        margin: { t: 40, b: 40, l: 40, r: 20 },
        font: { family: 'Inter, sans-serif' }
    });

    // Participant Count by Country
    const countries = globalData.map(d => d.country);
    const countryCounts = {};
    countries.forEach(c => countryCounts[c] = (countryCounts[c] || 0) + 1);

    Plotly.newPlot('plot-countries', [{
        x: Object.keys(countryCounts),
        y: Object.values(countryCounts),
        type: 'bar',
        marker: { color: '#8b5cf6' }
    }], {
        title: 'Participants by Country',
        margin: { t: 40, b: 40, l: 40, r: 20 },
        font: { family: 'Inter, sans-serif' }
    });
}

function renderCombinations() {
    // Performance vs Motivation Scatter
    Plotly.newPlot('plot-perf-vs-mot', [{
        x: globalData.map(d => d.motivation_score),
        y: globalData.map(d => d.academic_performance),
        mode: 'markers',
        type: 'scatter',
        marker: { color: '#6366f1', opacity: 0.6 }
    }], {
        title: 'Performance vs Motivation',
        xaxis: { title: 'Motivation Score' },
        yaxis: { title: 'Academic Performance (%)' },
        margin: { t: 40, b: 60, l: 60, r: 20 },
        font: { family: 'Inter, sans-serif' }
    });

    // Performance by Country (Box plot)
    const countries = [...new Set(globalData.map(d => d.country))];
    const boxTraces = countries.map(c => ({
        y: globalData.filter(d => d.country === c).map(d => d.academic_performance),
        type: 'box',
        name: c
    }));

    Plotly.newPlot('plot-perf-by-country', boxTraces, {
        title: 'Performance by Country',
        margin: { t: 40, b: 60, l: 60, r: 20 },
        font: { family: 'Inter, sans-serif' },
        showlegend: false
    });
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    // Relayout plots to fix sizing issues when showing hidden divs
    window.dispatchEvent(new Event('resize'));
}

// Initial load
loadData();

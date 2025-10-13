console.log("Parkhaus Dashboard gestartet");

// ==================== GLOBALE VARIABLEN ====================
let currentChart = null;
let allDataCache = null;
let currentView = 'weekly';
let individualView = 'weekly';
let selectedParkhaus = null;
let availableParkhaeuser = [];

// ==================== INITIALISIERUNG ====================
fetch('https://im3-projekt.wanderpodcastecho.ch/unload.php')
    .then(response => response.json())
    .then(data => {
        console.log("Daten geladen:", data.length, "Einträge");
        allDataCache = data;
        extractAvailableParkhaeuser(data);
        createWeeklyAverageChart(data);
        setupMainEventListeners();
    })
    .catch(error => console.error('Fehler beim Laden der Daten:', error));

// ==================== PARKHAUS-EXTRAKTION ====================
function extractAvailableParkhaeuser(data) {
    const parkhausMap = new Map();
    
    // Alle Parkhäuser mit Daten der letzten 7 Tage sammeln
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    data.forEach(entry => {
        const entryTime = new Date(entry.created_at || entry.time);
        
        // Parkhaus hinzufügen wenn es in den letzten 7 Tagen Daten hat
        if (entryTime >= sevenDaysAgo && !parkhausMap.has(entry.phid)) {
            parkhausMap.set(entry.phid, {
                phid: entry.phid,
                phname: entry.phname || entry.phid
            });
        }
    });
    
    availableParkhaeuser = Array.from(parkhausMap.values())
        .sort((a, b) => a.phname.localeCompare(b.phname));
    
    selectedParkhaus = availableParkhaeuser[0]?.phid;
    
    console.log(`${availableParkhaeuser.length} Parkhäuser mit Daten der letzten 7 Tage gefunden:`, 
                availableParkhaeuser.map(ph => ph.phname));
}

// ==================== EVENT LISTENERS ====================
function setupMainEventListeners() {
    const elements = {
        weeklyBtn: document.getElementById('weeklyBtn'),
        dailyBtn: document.getElementById('dailyBtn'),
        individualBtn: document.getElementById('individualBtn'),
        chartTitle: document.getElementById('chartTitle'),
        parkhausSelector: document.getElementById('parkhausSelector')
    };
    
    elements.weeklyBtn.addEventListener('click', () => switchMainView('weekly', elements));
    elements.dailyBtn.addEventListener('click', () => switchMainView('daily', elements));
    elements.individualBtn.addEventListener('click', () => switchMainView('individual', elements));
}

function switchMainView(view, elements) {
    if (currentView === view) return;
    
    currentView = view;
    if (currentChart) currentChart.destroy();
    
    switch (view) {
        case 'weekly':
            createWeeklyAverageChart(allDataCache);
            elements.chartTitle.textContent = 'Wöchentliche Durchschnittsbelegung';
            elements.parkhausSelector.style.display = 'none';
            setActiveMainButton(elements.weeklyBtn, [elements.dailyBtn, elements.individualBtn]);
            break;
            
        case 'daily':
            createDaily24hAverageChart(allDataCache);
            elements.chartTitle.textContent = '24h Durchschnitt - Einzelne Parkhäuser';
            elements.parkhausSelector.style.display = 'none';
            setActiveMainButton(elements.dailyBtn, [elements.weeklyBtn, elements.individualBtn]);
            break;
            
        case 'individual':
            individualView = 'weekly';
            createParkhausButtons();
            setupIndividualViewButtons();
            createIndividualParkhausChart(allDataCache, selectedParkhaus);
            updateIndividualChartTitle();
            elements.parkhausSelector.style.display = 'block';
            setActiveMainButton(elements.individualBtn, [elements.weeklyBtn, elements.dailyBtn]);
            break;
    }
}

function setupIndividualViewButtons() {
    const weeklyViewBtn = document.getElementById('weeklyViewBtn');
    const hourlyViewBtn = document.getElementById('hourlyViewBtn');
    
    weeklyViewBtn.addEventListener('click', () => switchIndividualView('weekly', weeklyViewBtn, hourlyViewBtn));
    hourlyViewBtn.addEventListener('click', () => switchIndividualView('hourly', hourlyViewBtn, weeklyViewBtn));
    
    setActiveViewButton(weeklyViewBtn, hourlyViewBtn);
}

function switchIndividualView(view, activeBtn, inactiveBtn) {
    if (individualView === view) return;
    
    individualView = view;
    if (currentChart) currentChart.destroy();
    
    if (view === 'weekly') {
        createIndividualParkhausChart(allDataCache, selectedParkhaus);
    } else {
        createIndividual24hDetailChart(allDataCache, selectedParkhaus);
    }
    
    updateIndividualChartTitle();
    setActiveViewButton(activeBtn, inactiveBtn);
}

// ==================== PARKHAUS-BUTTONS ====================
// ==================== PARKHAUS-BUTTONS ====================
function createParkhausButtons() {
    const container = document.getElementById('parkhausButtons');
    container.innerHTML = '';
    
    availableParkhaeuser.forEach(parkhaus => {
        const button = document.createElement('button');
        button.classList.add('parkhaus-btn');
        button.innerHTML = `
            <img src="images/IMG_0310.PNG" alt="${parkhaus.phname}">
            <span>${parkhaus.phname}</span>
        `;
        button.addEventListener('click', () => switchParkhaus(parkhaus.phid, button));
        container.appendChild(button);
    });
}

function switchParkhaus(phid, button) {
    selectedParkhaus = phid;
    if (currentChart) currentChart.destroy();

    if (individualView === 'weekly') {
        createIndividualParkhausChart(allDataCache, phid);
    } else {
        createIndividual24hDetailChart(allDataCache, phid);
    }

    updateIndividualChartTitle();
    updateFreePlacesDisplay();
    setActiveParkhausButton(button);
}

function updateIndividualChartTitle() {
    const chartTitle = document.getElementById('chartTitle');
    const parkhaus = availableParkhaeuser.find(p => p.phid === selectedParkhaus);
    
    if (parkhaus) {
        const viewText = individualView === 'weekly' ? 'Wöchentliche Auslastung' : '24h Detailansicht';
        chartTitle.textContent = `${parkhaus.phname} - ${viewText}`;
    }
}

function updateFreePlacesDisplay() {
    // Aktuellsten Wert für das ausgewählte Parkhaus finden (unabhängig vom Status)
    const latestEntry = allDataCache
        .filter(entry => entry.phid === selectedParkhaus)
        .sort((a, b) => new Date(b.created_at || b.time) - new Date(a.created_at || a.time))[0];
    
    let freePlacesContainer = document.getElementById('freePlacesDisplay');
    
    if (!freePlacesContainer) {
        // Container erstellen wenn nicht vorhanden
        freePlacesContainer = document.createElement('div');
        freePlacesContainer.id = 'freePlacesDisplay';
        freePlacesContainer.className = 'free-places-display';
        
        const parkhausSelector = document.getElementById('parkhausSelector');
        parkhausSelector.appendChild(freePlacesContainer);
    }
    
    if (latestEntry) {
        const isOpen = latestEntry.phstate === 'offen';
        const statusClass = isOpen ? 'status-open' : 'status-closed';
        const statusText = isOpen ? 'Geöffnet' : 'Nicht verfügbar';
        
        freePlacesContainer.innerHTML = `
            <div class="free-places-info">
                <div class="parkhaus-status">
                    <span class="status-label">Status:</span>
                    <span class="status-value ${statusClass}">${statusText}</span>
                </div>
                ${isOpen ? `
                    <div class="free-places-data">
                        <span class="label">Aktuell freie Plätze:</span>
                        <span class="value">${latestEntry.shortfree || 0}</span>
                        <span class="percentage">(${(latestEntry.belegung_prozent || 0).toFixed(1)}% belegt)</span>
                    </div>
                ` : '<div class="no-data">Keine Parkplatz-Daten verfügbar</div>'}
            </div>
        `;
    } else {
        freePlacesContainer.innerHTML = '<div class="free-places-info">Keine aktuellen Daten verfügbar</div>';
    }
}

// ==================== CHART-OPTIONEN ====================
function getChartOptions(type) {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            title: { display: false },
            legend: { display: true, position: 'top' }
        },
        interaction: { intersect: false, mode: 'index' }
    };

    const yAxisConfig = {
        beginAtZero: true,
        max: 100,
        ticks: {
            stepSize: 10,
            callback: function(value) {
                return value + '%';
            }
        }
    };

    switch (type) {
        case 'dual':
            return {
                ...baseOptions,
                scales: {
                    y: {
                        ...yAxisConfig,
                        title: { display: true, text: 'Belegung (%)' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        title: { display: true, text: 'Freie Plätze' },
                        grid: { drawOnChartArea: false }
                    },
                    x: { title: { display: true, text: 'Datum' } }
                }
            };
            
        case 'single':
            return {
                ...baseOptions,
                scales: {
                    y: {
                        ...yAxisConfig,
                        title: { display: true, text: 'Belegung (%)' }
                    },
                    x: { title: { display: true, text: 'Parkhäuser' } }
                }
            };
            
        case 'time':
            return {
                ...baseOptions,
                plugins: {
                    ...baseOptions.plugins,
                    tooltip: {
                        callbacks: {
                            label: (context) => `Auslastung: ${context.parsed.y.toFixed(1)}%`,
                            title: (context) => `Zeit: ${context[0].label}`
                        }
                    }
                },
                scales: {
                    y: {
                        ...yAxisConfig,
                        title: { display: true, text: 'Auslastung (%)' }
                    },
                    x: { 
                        title: { display: true, text: 'Uhrzeit' },
                        ticks: { maxTicksLimit: 12 }
                    }
                }
            };
            
        default:
            return {
                ...baseOptions,
                scales: {
                    y: {
                        ...yAxisConfig,
                        title: { display: true, text: 'Auslastung (%)' }
                    }
                }
            };
    }
}

// ==================== HILFSFUNKTIONEN ====================
function setActiveMainButton(activeBtn, inactiveBtns) {
    activeBtn.classList.add('active');
    inactiveBtns.forEach(btn => btn.classList.remove('active'));
}

function setActiveViewButton(activeBtn, inactiveBtn) {
    activeBtn.classList.add('active');
    inactiveBtn.classList.remove('active');
}

function setActiveParkhausButton(activeBtn) {
    document.querySelectorAll('.parkhaus-btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function createIndividualParkhausChart(allData, phid) {
    const ctx = document.getElementById('mainChart');
    const individualData = processIndividualParkhausData(allData, phid);
    
    const parkhausName = allData.find(entry => entry.phid === phid)?.phname || phid;
    
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: individualData.labels,
            datasets: [{
                label: `${parkhausName} - Wöchentliche Auslastung (%)`,
                data: individualData.weeklyData,
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: getChartOptions('single')
    });
    
    updateFreePlacesDisplay();
}

function createIndividual24hDetailChart(allData, phid) {
    const ctx = document.getElementById('mainChart');
    const individualData = processIndividualParkhausData(allData, phid);
    
    const parkhausName = allData.find(entry => entry.phid === phid)?.phname || phid;
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: individualData.labels24h,
            datasets: [{
                label: `${parkhausName} - 24h Auslastung (%)`,
                data: individualData.data24h,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: getChartOptions('time')
    });
    
    updateFreePlacesDisplay();
}

function processIndividualParkhausData(allData, phid) {
    const parkhausData = allData.filter(entry => 
        entry.phid === phid && entry.belegung_prozent
    );
    
    // Wöchentliche Daten
    const groupedByDate = {};
    parkhausData.forEach(entry => {
        const dateKey = new Date(entry.created_at || entry.time).toISOString().split('T')[0];
        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(parseFloat(entry.belegung_prozent));
    });
    
    const sortedDates = Object.keys(groupedByDate).sort().slice(-7);
    const labels = [], weeklyData = [];
    
    sortedDates.forEach(dateKey => {
        const dayData = groupedByDate[dateKey];
        const dayAvg = dayData.reduce((sum, val) => sum + val, 0) / dayData.length;
        
        labels.push(new Date(dateKey).toLocaleDateString('de-DE', {
            weekday: 'short', month: 'short', day: 'numeric'
        }));
        weeklyData.push(Math.round(dayAvg * 100) / 100);
    });
    
    // 24h Daten
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent24hData = parkhausData
        .filter(entry => new Date(entry.created_at || entry.time) >= twentyFourHoursAgo)
        .sort((a, b) => new Date(a.created_at || a.time) - new Date(b.created_at || b.time));
    
    const labels24h = [], data24h = [];
    recent24hData.forEach(entry => {
        const entryTime = new Date(entry.created_at || entry.time);
        labels24h.push(entryTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
        data24h.push(parseFloat(entry.belegung_prozent));
    });
    
    return { labels, weeklyData, labels24h, data24h };
}

// ==================== INITIALISIERUNG DER ANWENDUNG ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard bereit - alle Funktionen geladen");
});

// ==================== CHART-ERSTELLUNG ====================
function createWeeklyAverageChart(allData) {
    const ctx = document.getElementById('mainChart');
    const weeklyData = processWeeklyData(allData);
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weeklyData.labels,
            datasets: [{
                label: 'Durchschnittliche Belegung (%)',
                data: weeklyData.averages,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.1
            }, {
                label: 'Freie Plätze (Durchschnitt)',
                data: weeklyData.freeSpaces,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: getChartOptions('dual')
    });
}
function createDaily24hAverageChart(allData) {
    const ctx = document.getElementById('mainChart');
    const daily24hData = process24hAverageData(allData);
    
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: daily24hData.labels,
            datasets: [{
                label: '24h Durchschnitt (%)',
                data: daily24hData.averages,
                backgroundColor: daily24hData.colors,
                borderColor: daily24hData.borderColors,
                borderWidth: 2
            }]
        },
        options: getChartOptions('single')
    });
}

// ==================== DATENVERARBEITUNG ====================
function processWeeklyData(allData) {
    const groupedByDate = {};
    
    allData.forEach(entry => {
        // Berücksichtige alle Einträge mit Belegungsdaten, unabhängig vom Status
        if (!entry.belegung_prozent) return;
        
        const dateKey = new Date(entry.created_at || entry.time).toISOString().split('T')[0];
        
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = { belegungen: [], freePlaetze: [] };
        }
        
        groupedByDate[dateKey].belegungen.push(parseFloat(entry.belegung_prozent));
        groupedByDate[dateKey].freePlaetze.push(parseInt(entry.shortfree) || 0);
    });
    
    const sortedDates = Object.keys(groupedByDate).sort().slice(-7);
    const labels = [], averages = [], freeSpaces = [];
    
    sortedDates.forEach(dateKey => {
        const dayData = groupedByDate[dateKey];
        const avgBelegung = dayData.belegungen.reduce((sum, val) => sum + val, 0) / dayData.belegungen.length;
        const avgFree = dayData.freePlaetze.reduce((sum, val) => sum + val, 0) / dayData.freePlaetze.length;
        
        labels.push(new Date(dateKey).toLocaleDateString('de-DE', {
            weekday: 'short', month: 'short', day: 'numeric'
        }));
        averages.push(Math.round(avgBelegung * 100) / 100);
        freeSpaces.push(Math.round(avgFree));
    });
    
    return { labels, averages, freeSpaces };
}

function process24hAverageData(allData) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent24hData = allData.filter(entry => 
        new Date(entry.created_at || entry.time) >= twentyFourHoursAgo
    );
    
    const groupedByParkhaus = {};
    
    recent24hData.forEach(entry => {
        // Berücksichtige alle Einträge mit Belegungsdaten, unabhängig vom Status
        if (!entry.belegung_prozent) return;
        
        if (!groupedByParkhaus[entry.phid]) {
            groupedByParkhaus[entry.phid] = {
                name: entry.phname || entry.phid,
                belegungen: [],
                lastStatus: entry.phstate // Letzten bekannten Status speichern
            };
        }
        
        groupedByParkhaus[entry.phid].belegungen.push(parseFloat(entry.belegung_prozent));
        // Aktualisiere Status mit dem neuesten Eintrag
        groupedByParkhaus[entry.phid].lastStatus = entry.phstate;
    });
    
    const labels = [], averages = [], colors = [], borderColors = [];
    
    Object.values(groupedByParkhaus).forEach(parkhaus => {
        if (parkhaus.belegungen.length === 0) return;
        
        const avg = parkhaus.belegungen.reduce((sum, val) => sum + val, 0) / parkhaus.belegungen.length;
        const roundedAvg = Math.round(avg * 100) / 100;
        
        labels.push(parkhaus.name);
        averages.push(roundedAvg);
        
        // Farbkodierung basierend auf Status und Belegung
        const isOpen = parkhaus.lastStatus === 'offen';
        
        if (!isOpen) {
            // Geschlossene Parkhäuser in Grautönen
            colors.push('rgba(128, 128, 128, 0.6)');
            borderColors.push('rgba(128, 128, 128, 1)');
        } else if (roundedAvg >= 90) {
            colors.push('rgba(255, 99, 132, 0.8)');
            borderColors.push('rgba(255, 99, 132, 1)');
        } else if (roundedAvg >= 70) {
            colors.push('rgba(255, 205, 86, 0.8)');
            borderColors.push('rgba(255, 205, 86, 1)');
        } else {
            colors.push('rgba(75, 192, 192, 0.8)');
            borderColors.push('rgba(75, 192, 192, 1)');
        }
    });
    
    console.log(`24h-Durchschnitt für ${labels.length} Parkhäuser berechnet:`, labels);
    
    return { labels, averages, colors, borderColors };
}
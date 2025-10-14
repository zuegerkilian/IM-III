console.log("Parkhaus Dashboard gestartet");

// ==================== GLOBALE VARIABLEN ====================
let currentChart = null;
let allDataCache = null;
let currentView = 'weekly';
let individualView = 'weekly';
let selectedParkhaus = null;
let availableParkhaeuser = [];
let map = null; // Karten-Variable

// ==================== OVERLAY-FUNKTIONEN ====================
function openParkhausOverlay(parkhausName, parkhausId) {
    console.log(`Öffne Overlay für: ${parkhausName} (${parkhausId})`);
    
    // Overlay-Titel setzen
    document.getElementById('overlayTitle').textContent = parkhausName;
    
    // Daten für das spezielle Parkhaus laden
    loadParkhausDetails(parkhausId, parkhausName);
    
    // Overlay anzeigen
    document.getElementById('parkhausOverlay').style.display = 'block';
    
    // Körper-Scrolling deaktivieren
    document.body.style.overflow = 'hidden';
}

function closeOverlay() {
    console.log("Schließe Overlay");
    
    // Overlay verstecken
    document.getElementById('parkhausOverlay').style.display = 'none';
    
    // Körper-Scrolling wieder aktivieren
    document.body.style.overflow = 'auto';
}

function loadParkhausDetails(parkhausId, parkhausName) {
    const overlayContent = document.getElementById('overlayContent');
    
    // Loading-Zustand anzeigen
    overlayContent.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <p>Lade Parkhaus-Details...</p>
        </div>
    `;
    
    // API-Call für spezifische Parkhaus-Daten
    fetch(`https://im3-projekt.wanderpodcastecho.ch/unload.php?phid=${parkhausId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                displayParkhausDetails(data, parkhausName);
            } else {
                displayDemoParkhausDetails(parkhausId, parkhausName);
            }
        })
        .catch(error => {
            console.error('Fehler beim Laden der Parkhaus-Details:', error);
            displayDemoParkhausDetails(parkhausId, parkhausName);
        });
}

function displayParkhausDetails(data, parkhausName) {
    const latestData = data[0]; // Neueste Daten
    const overlayContent = document.getElementById('overlayContent');
    
    const isOpen = latestData.phstate === 'offen';
    const freePlaces = latestData.shortfree || 0;
    const occupancyPercent = latestData.belegung_prozent || 0;
    const totalPlaces = latestData.parkplaetze_gesamt || 'N/A';
    const address = latestData.adresse || 'Adresse nicht verfügbar';
    
    overlayContent.innerHTML = `
        <div class="parkhaus-detail">
            <img src="images/IMG_0310.PNG" alt="${parkhausName}" style="width: 200px; border-radius: 15px; margin: 20px 0;">
            
            <div class="status-badge ${isOpen ? 'status-open' : 'status-closed'}">
                ${isOpen ? '🟢 Geöffnet' : '🔴 Geschlossen'}
            </div>
            
            <div class="parkhaus-stats">
                <div class="stat-box">
                    <h4>Freie Plätze</h4>
                    <div class="value">${freePlaces}</div>
                </div>
                <div class="stat-box">
                    <h4>Belegung</h4>
                    <div class="value">${occupancyPercent.toFixed(1)}%</div>
                </div>
                <div class="stat-box">
                    <h4>Gesamt Plätze</h4>
                    <div class="value">${totalPlaces}</div>
                </div>
                <div class="stat-box">
                    <h4>Verfügbarkeit</h4>
                    <div class="value">${((totalPlaces - freePlaces) / totalPlaces * 100).toFixed(0)}%</div>
                </div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">📍 Standort</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">${address}</p>
            </div>
            
            <div style="margin: 20px 0;">
                <button onclick="closeOverlay()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-family: 'Bagel Fat One', sans-serif;
                    font-size: 16px;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Schließen
                </button>
            </div>
        </div>
    `;
}

function displayDemoParkhausDetails(parkhausId, parkhausName) {
    const overlayContent = document.getElementById('overlayContent');
    
    // Demo-Daten für verschiedene Parkhäuser
    const demoData = {
        'P001': { free: 45, total: 120, occupancy: 62.5, address: 'Neumarkt 2, 9000 St. Gallen' },
        'P002': { free: 23, total: 80, occupancy: 71.3, address: 'Rathausgasse 1, 9000 St. Gallen' },
        'P003': { free: 67, total: 200, occupancy: 66.5, address: 'Manorgasse 9, 9000 St. Gallen' }
    };
    
    const data = demoData[parkhausId] || { free: 15, total: 100, occupancy: 85, address: 'St. Gallen Zentrum' };
    
    overlayContent.innerHTML = `
        <div class="parkhaus-detail">
            <img src="images/IMG_0310.PNG" alt="${parkhausName}" style="width: 200px; border-radius: 15px; margin: 20px 0;">
            
            <div class="status-badge status-open">
                🟢 Geöffnet
            </div>
            
            <div class="parkhaus-stats">
                <div class="stat-box">
                    <h4>Freie Plätze</h4>
                    <div class="value">${data.free}</div>
                </div>
                <div class="stat-box">
                    <h4>Belegung</h4>
                    <div class="value">${data.occupancy.toFixed(1)}%</div>
                </div>
                <div class="stat-box">
                    <h4>Gesamt Plätze</h4>
                    <div class="value">${data.total}</div>
                </div>
                <div class="stat-box">
                    <h4>Preis/Stunde</h4>
                    <div class="value">CHF 2.50</div>
                </div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">📍 Standort</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">${data.address}</p>
            </div>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">🕒 Öffnungszeiten</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">Mo-So: 06:00 - 24:00 Uhr</p>
            </div>
            
            <div style="margin: 20px 0;">
                <button onclick="closeOverlay()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-family: 'Bagel Fat One', sans-serif;
                    font-size: 16px;
                    cursor: pointer;
                    transition: transform 0.2s;
                    margin-right: 10px;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Schließen
                </button>
                
                <button onclick="showOnMap('${parkhausId}')" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-family: 'Bagel Fat One', sans-serif;
                    font-size: 16px;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Auf Karte zeigen
                </button>
            </div>
        </div>
    `;
}

function showOnMap(parkhausId) {
    closeOverlay();
    // Scroll zur Karte
    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    console.log(`Zeige ${parkhausId} auf der Karte`);
}

// Event-Listener für ESC-Taste zum Schließen des Overlays
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeOverlay();
    }
});

// Event-Listener für Klick außerhalb des Overlay-Inhalts
document.getElementById('parkhausOverlay')?.addEventListener('click', function(event) {
    if (event.target === this) {
        closeOverlay();
    }
});

// ==================== INITIALISIERUNG ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM geladen - initialisiere Karte und Dashboard");
    
    // Karte initialisieren
    initializeMap();
    
    // Daten laden
    loadDashboardData();
});

// ==================== KARTEN-FUNKTIONEN ====================
function initializeMap() {
    try {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.warn('Karten-Element nicht gefunden');
            return;
        }

        // St. Gallen Koordinaten
        const stGallenCoords = [47.4245, 9.3767];

        // Karte initialisieren
        map = L.map('map').setView(stGallenCoords, 13);

        // OpenStreetMap-Tiles hinzufügen
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>-Mitwirkende',
        }).addTo(map);

        // Marker für St. Gallen Stadtzentrum
        const marker = L.marker(stGallenCoords).addTo(map);
        marker.bindPopup('<b>St. Gallen</b><br>Stadtzentrum').openPopup();

        // Maßstabsleiste hinzufügen
        L.control.scale().addTo(map);

        console.log("Karte erfolgreich initialisiert");
        
        // Parkhaus-Marker hinzufügen wenn Daten verfügbar
        if (allDataCache) {
            addParkhausMarkers();
        }
    } catch (error) {
        console.error('Fehler bei der Karten-Initialisierung:', error);
    }
}

function loadDashboardData() {
    fetch('https://im3-projekt.wanderpodcastecho.ch/unload.php')
        .then(response => response.json())
        .then(data => {
            console.log("Daten geladen:", data.length, "Einträge");
            allDataCache = data;
            extractAvailableParkhaeuser(data);
            
            // Parkhaus-Marker zur Karte hinzufügen
            if (map) {
                addParkhausMarkers();
            }
            
            // Dashboard nur initialisieren wenn Chart-Element existiert
            const chartElement = document.getElementById('mainChart');
            if (chartElement) {
                createWeeklyAverageChart(data);
                setupMainEventListeners();
            }
        })
        .catch(error => console.error('Fehler beim Laden der Daten:', error));
}

function addParkhausMarkers() {
    if (!map || !allDataCache) return;
    
    // Eindeutige Parkhäuser mit Koordinaten finden
    const parkhausMap = new Map();
    
    allDataCache.forEach(entry => {
        if (entry.phid && entry.lon && entry.lat && !parkhausMap.has(entry.phid)) {
            parkhausMap.set(entry.phid, {
                phid: entry.phid,
                phname: entry.phname || entry.phid,
                lat: parseFloat(entry.lat),
                lon: parseFloat(entry.lon),
                phstate: entry.phstate,
                shortfree: entry.shortfree,
                belegung_prozent: entry.belegung_prozent
            });
        }
    });
    
    // Marker für jedes Parkhaus hinzufügen
    parkhausMap.forEach(parkhaus => {
        const isOpen = parkhaus.phstate === 'offen';
        const markerColor = isOpen ? 'green' : 'red';
        
        // Custom Icon basierend auf Status
        const icon = L.divIcon({
            className: 'custom-parkhaus-marker',
            html: `<div style="
                background-color: ${markerColor};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        const marker = L.marker([parkhaus.lat, parkhaus.lon], { icon }).addTo(map);
        
        // Popup mit Parkhaus-Informationen
        const popupContent = `
            <div style="font-family: 'Bagel Fat One', sans-serif; text-align: center;">
                <h4 style="margin: 5px 0; color: #333;">${parkhaus.phname}</h4>
                <p style="margin: 3px 0; color: ${isOpen ? 'green' : 'red'}; font-weight: bold;">
                    ${isOpen ? 'Geöffnet' : 'Geschlossen'}
                </p>
                ${isOpen && parkhaus.shortfree !== null ? `
                    <p style="margin: 3px 0; color: #666;">
                        Freie Plätze: <strong>${parkhaus.shortfree}</strong>
                    </p>
                    <p style="margin: 3px 0; color: #666;">
                        Belegung: <strong>${(parkhaus.belegung_prozent || 0).toFixed(1)}%</strong>
                    </p>
                ` : ''}
            </div>
        `;
        
        marker.bindPopup(popupContent);
    });
    
    console.log(`${parkhausMap.size} Parkhaus-Marker zur Karte hinzugefügt`);
}


// Hover für Overlay
document.getElementById("parkhaus_button").addEventListener("click", function() {
  const overlay = document.getElementById("parkhausOverlay");
  overlay.classList.toggle("active"); // Ein- und ausblenden
});


document.getElementById('parkhausButton').addEventListener('click', function () {

    const overlay = document.getElementById('parkhausOverlay');

    if (overlay.style.display === 'block') {

        overlay.style.display = 'none';

    } else {

        overlay.style.display = 'block';

    }

});


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
function createParkhausButtons() {
    const container = document.getElementById('parkhausButtons');
    container.innerHTML = '';
    
    availableParkhaeuser.forEach(parkhaus => {
        const button = document.createElement('button');
        button.classList.add('parkhaus-btn');
        button.addEventListener('click', () => switchParkhaus(parkhaus.phid, button));
        
        button.innerHTML = `
            <img src="images/IMG_0310.PNG" alt="${parkhaus.phname}">
            <span>${parkhaus.phname}</span>
        `;
        
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

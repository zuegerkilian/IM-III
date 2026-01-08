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
    document.getElementById('overlayTitle').textContent = parkhausId + "  " + parkhausName;
   
    // Daten für das spezielle Parkhaus laden
    loadParkhausDetails(parkhausId, parkhausName);
   
    // Overlay anzeigen
    document.getElementById('parkhausOverlay').style.display = 'block';
   
    // Körper-Scrolling deaktivieren
    document.body.style.overflow = 'hidden';
}


function closeOverlay() {
    console.log("Schließe Overlay");
   
    // Overlay-Chart zerstören falls vorhanden
    if (overlayChart) {
        overlayChart.destroy();
        overlayChart = null;
    }
   
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
    const phid = latestData.phid;
   
    const isOpen = latestData.phstate === 'offen';
    const freePlaces = latestData.shortfree || 0;
    const occupancyPercent = latestData.belegung_prozent || 0;
    const totalPlaces = latestData.shortmax ?? 0;
   
    overlayContent.innerHTML = `
        <div class="parkhaus-detail">
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
                    <div class="value">${((100 - occupancyPercent).toFixed(1))}%</div>
                </div>
            </div>
           

            <!-- Chart-Buttons für Overlay -->
            <div class="overlay-chart-buttons" style="margin: 20px 0; text-align: center;">
                <button id="overlayWeeklyBtn" class="chart-button active" onclick="switchOverlayChart('weekly', '${phid}')">
                    Wöchentliche Ansicht
                </button>
                <button id="overlayDailyBtn" class="chart-button" onclick="switchOverlayChart('daily', '${phid}')">
                    24h Ansicht
                </button>
            </div>

            <!-- Chart für Parkhaus-Verlauf -->
            <div class="overlay-chart-container" style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 id="overlayChartTitle" style="text-align: center; color: #333; margin-bottom: 15px;">Wöchentliche Belegung</h3>
                <div style="height: 300px; position: relative;">
                    <canvas id="overlayChart"></canvas>
                </div>
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

    // Initial den wöchentlichen Chart für dieses Parkhaus laden
    setTimeout(() => {
        if (allDataCache) {
            createWeeklyChart(allDataCache, 'overlayChart', phid);
        }
    }, 100);
}


function displayDemoParkhausDetails(parkhausId, parkhausName) {
    const overlayContent = document.getElementById('overlayContent');
    if (!overlayContent) {
        console.error('Overlay-Container fehlt, kann Fehlerhinweis nicht anzeigen.');
        return;
    }


    // Fallback-Anzeige bei Ladefehler oder fehlenden Daten
    overlayContent.innerHTML = `
        <div class="parkhaus-detail">
            <div class="status-badge status-closed">
                🔴 Daten konnten nicht geladen werden
            </div>


            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Fehler</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">Für ${parkhausName} (${parkhausId}) liegen aktuell keine Live-Daten vor.</p>
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




// aus verlauf eingefügt


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
        if (typeof L === 'undefined') {
            console.warn('Leaflet JS wurde nicht geladen. Karte wird nicht initialisiert.');
            return;
        }
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
    console.log("===== LADE DASHBOARD-DATEN =====");
    fetch('https://im3-projekt.wanderpodcastecho.ch/unload.php')
        .then(response => {
            console.log("API Response Status:", response.status);
            return response.json();
        })
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
            console.log("Canvas Element gefunden:", !!chartElement);
            console.log("Chart.js geladen:", typeof Chart !== 'undefined');
           
            if (chartElement) {
                console.log("Starte Chart-Erstellung...");
                // Standardmäßig wöchentliche Ansicht laden
                createWeeklyChart(data);
                setupMainEventListeners();
            } else {
                console.warn("FEHLER: mainChart Canvas nicht gefunden!");
            }
        })
        .catch(error => {
            console.error('Fehler beim Laden der Daten:', error);
        });
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

        marker.on('click', () => {
    // Name aus Daten, sonst phid als Fallback
    const name = parkhaus.phname || parkhaus.phid;
    openParkhausOverlay(name, parkhaus.phid);
});
    });
   
    console.log(`${parkhausMap.size} Parkhaus-Marker zur Karte hinzugefügt`);
}
// ==================== DASHBOARD-UTILS (fehlende Funktionen ergänzt) ====================
function extractAvailableParkhaeuser(data) {
    if (!Array.isArray(data)) {
        console.warn('extractAvailableParkhaeuser: data ist kein Array');
        return;
    }
    // Speichert eindeutige Parkhaus-IDs für spätere Buttons/Filter
    availableParkhaeuser = [...new Set(data.map(item => item.phid).filter(Boolean))];
    console.log('Verfügbare Parkhäuser:', availableParkhaeuser.length);
}

// ==================== CHART-FUNKTIONEN ====================

// Funktion für 24h-Ansicht: Stündliche Durchschnittsbelegung aller Parkhäuser
function create24HourChart(data, canvasId = 'mainChart', phidFilter = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) {
        console.warn('create24HourChart: Canvas fehlt');
        return;
    }
    if (!Array.isArray(data) || data.length === 0) {
        console.warn('create24HourChart: keine Daten vorhanden');
        return;
    }

    // Filtere nach Parkhaus wenn phidFilter gesetzt ist
    const filteredData = phidFilter ? data.filter(row => row.phid === phidFilter) : data;

    // Datenpunkte der letzten 24 Stunden
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recent24h = filteredData.filter(row => {
        const rowDate = new Date(row.created_at);
        return rowDate >= yesterday && rowDate <= now;
    });

    // Gruppierung nach Stunde
    const perHour = {};
    recent24h.forEach(row => {
        const hour = (row.created_at || '').slice(0, 13); // YYYY-MM-DD HH
        if (!hour) return;
        perHour[hour] = perHour[hour] || { sum: 0, count: 0 };
        perHour[hour].sum += Number(row.belegung_prozent) || 0;
        perHour[hour].count += 1;
    });

    // Sortiere nach Zeit und erstelle Labels
    const sortedHours = Object.keys(perHour).sort();
    const labels = sortedHours.map(hourKey => {
        try {
            // Format: "YYYY-MM-DD HH" -> Parse als ISO DateTime
            const [datePart, hourPart] = hourKey.split(' ');
            const date = new Date(datePart + 'T' + hourPart + ':00:00');
            return date.toLocaleString('de-DE', { 
                day: '2-digit', 
                month: '2-digit', 
                hour: '2-digit'
            }) + ' Uhr';
        } catch (e) {
            return hourKey;
        }
    });
    const values = sortedHours.map(hour => 
        perHour[hour].count ? perHour[hour].sum / perHour[hour].count : 0
    );

    // Chart zerstören falls vorhanden
    if (canvasId === 'mainChart' && currentChart) {
        currentChart.destroy();
    }

    const chartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Ø Belegung letzte 24h (%)',
                data: values,
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118,75,162,0.2)',
                tension: 0.3,
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    title: {
                        display: true,
                        text: 'Belegung (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Zeit'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });

    if (canvasId === 'mainChart') {
        currentChart = chartInstance;
    }
    
    console.log('24h-Chart erstellt mit', values.length, 'Datenpunkten');
    return chartInstance;
}

// Funktion für 7-Tage-Ansicht: Tägliche Durchschnittsbelegung
function createWeeklyChart(data, canvasId = 'mainChart', phidFilter = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) {
        console.warn('createWeeklyChart: Canvas fehlt');
        return;
    }
    if (!Array.isArray(data) || data.length === 0) {
        console.warn('createWeeklyChart: keine Daten vorhanden');
        return;
    }

    // Filtere nach Parkhaus wenn phidFilter gesetzt ist
    const filteredData = phidFilter ? data.filter(row => row.phid === phidFilter) : data;

    // Datenpunkte der letzten 7 Tage
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recent7days = filteredData.filter(row => {
        const rowDate = new Date(row.created_at);
        return rowDate >= weekAgo && rowDate <= now;
    });

    // Gruppierung nach Tag
    const perDay = {};
    recent7days.forEach(row => {
        const day = (row.created_at || '').slice(0, 10); // YYYY-MM-DD
        if (!day) return;
        perDay[day] = perDay[day] || { sum: 0, count: 0 };
        perDay[day].sum += Number(row.belegung_prozent) || 0;
        perDay[day].count += 1;
    });

    // Sortiere nach Datum und erstelle Labels
    const sortedDays = Object.keys(perDay).sort();
    const labels = sortedDays.map(day => {
        const date = new Date(day);
        return date.toLocaleDateString('de-DE', { 
            weekday: 'short',
            day: '2-digit', 
            month: '2-digit'
        });
    });
    const values = sortedDays.map(day => 
        perDay[day].count ? perDay[day].sum / perDay[day].count : 0
    );

    // Chart zerstören falls vorhanden
    if (canvasId === 'mainChart' && currentChart) {
        currentChart.destroy();
    }

    const chartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ø Belegung letzte 7 Tage (%)',
                data: values,
                backgroundColor: 'rgba(102,126,234,0.6)',
                borderColor: '#667eea',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    title: {
                        display: true,
                        text: 'Belegung (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Datum'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });

    if (canvasId === 'mainChart') {
        currentChart = chartInstance;
    }
    
    console.log('Wochen-Chart erstellt mit', values.length, 'Datenpunkten');
    return chartInstance;
}


function createWeeklyAverageChart(data) {
    const canvas = document.getElementById('mainChart');
    if (!canvas || !canvas.getContext) {
        console.warn('createWeeklyAverageChart: mainChart Canvas fehlt');
        return;
    }
    if (!Array.isArray(data) || data.length === 0) {
        console.warn('createWeeklyAverageChart: keine Daten vorhanden');
        return;
    }


    // Einfache Demo-Auswertung: durchschnittliche Belegung pro Tag (nach Datum gruppiert)
    const perDay = {};
    data.forEach(row => {
        const day = (row.created_at || '').slice(0, 10);
        if (!day) return;
        perDay[day] = perDay[day] || { sum: 0, count: 0 };
        perDay[day].sum += Number(row.belegung_prozent) || 0;
        perDay[day].count += 1;
    });


    const labels = Object.keys(perDay).sort();
    const values = labels.map(day => perDay[day].count ? perDay[day].sum / perDay[day].count : 0);


    if (currentChart) {
        currentChart.destroy();
    }


    currentChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Ø Belegung (%)',
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102,126,234,0.2)',
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
    console.log('Chart aktualisiert (wöchentliche Ansicht)');
}


function setupMainEventListeners() {
    // Schützt vor doppelter Registrierung
    if (setupMainEventListeners._initialized) return;


    const weeklyBtn = document.getElementById('weeklyBtn');
    const dailyBtn = document.getElementById('dailyBtn');
    const chartTitle = document.getElementById('chartTitle');


    if (weeklyBtn) {
        weeklyBtn.addEventListener('click', () => {
            currentView = 'weekly';
            
            // Button-Styling
            weeklyBtn.classList.add('active');
            dailyBtn.classList.remove('active');
            
            // Chart-Titel aktualisieren
            if (chartTitle) {
                chartTitle.textContent = 'Wöchentliche Durchschnittsbelegung (7 Tage)';
            }
            
            // Wöchentlichen Chart erstellen
            createWeeklyChart(allDataCache || []);
        });
    }


    if (dailyBtn) {
        dailyBtn.addEventListener('click', () => {
            currentView = 'daily';
            
            // Button-Styling
            dailyBtn.classList.add('active');
            weeklyBtn.classList.remove('active');
            
            // Chart-Titel aktualisieren
            if (chartTitle) {
                chartTitle.textContent = '24h Durchschnittsbelegung (stündlich)';
            }
            
            // 24h Chart erstellen
            create24HourChart(allDataCache || []);
        });
    }


    setupMainEventListeners._initialized = true;
    console.log('Event-Listener für Dashboard gesetzt');
}


// ==================== OVERLAY CHART-FUNKTIONEN ====================
// Globale Variable für Overlay Chart
let overlayChart = null;

// Funktion zum Wechseln zwischen Charts im Overlay
function switchOverlayChart(viewType, phid) {
    const weeklyBtn = document.getElementById('overlayWeeklyBtn');
    const dailyBtn = document.getElementById('overlayDailyBtn');
    const chartTitle = document.getElementById('overlayChartTitle');
    
    if (viewType === 'weekly') {
        // Button-Styling
        if (weeklyBtn) weeklyBtn.classList.add('active');
        if (dailyBtn) dailyBtn.classList.remove('active');
        
        // Titel aktualisieren
        if (chartTitle) {
            chartTitle.textContent = 'Wöchentliche Belegung (7 Tage)';
        }
        
        // Chart erstellen
        if (allDataCache) {
            if (overlayChart) {
                overlayChart.destroy();
            }
            overlayChart = createWeeklyChart(allDataCache, 'overlayChart', phid);
        }
    } else if (viewType === 'daily') {
        // Button-Styling
        if (dailyBtn) dailyBtn.classList.add('active');
        if (weeklyBtn) weeklyBtn.classList.remove('active');
        
        // Titel aktualisieren
        if (chartTitle) {
            chartTitle.textContent = '24h Belegung (stündlich)';
        }
        
        // Chart erstellen
        if (allDataCache) {
            if (overlayChart) {
                overlayChart.destroy();
            }
            overlayChart = create24HourChart(allDataCache, 'overlayChart', phid);
        }
    }
}
// aus verlauf eingefügt (bereinigt):
// Ungültige Selektoren entfernt, da es keine Elemente mit diesen IDs gibt.






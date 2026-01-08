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
    const totalPlaces = latestData.shortmax ?? 0;
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
                    <div class="value">${((100 - occupancyPercent).toFixed(1))}%</div>
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
    if (!overlayContent) {
        console.error('Overlay-Container fehlt, kann Fehlerhinweis nicht anzeigen.');
        return;
    }


    // Fallback-Anzeige bei Ladefehler oder fehlenden Daten
    overlayContent.innerHTML = `
        <div class="parkhaus-detail">
            <img src="images/IMG_0310.PNG" alt="${parkhausName}" style="width: 200px; border-radius: 15px; margin: 20px 0;">


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
                createWeeklyAverageChart(data);
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
    const individualBtn = document.getElementById('individualBtn');


    if (weeklyBtn) {
        weeklyBtn.addEventListener('click', () => {
            currentView = 'weekly';
            createWeeklyAverageChart(allDataCache || []);
        });
    }


    if (dailyBtn) {
        dailyBtn.addEventListener('click', () => {
            currentView = 'daily';
            // Placeholder: könnte auf Stundenmittel umstellen
            createWeeklyAverageChart(allDataCache || []);
        });
    }


    if (individualBtn) {
        individualBtn.addEventListener('click', () => {
            currentView = 'individual';
            // Placeholder: hier könnte Einzelparkhaus-Auswahl aktiviert werden
            createWeeklyAverageChart(allDataCache || []);
        });
    }


    setupMainEventListeners._initialized = true;
    console.log('Event-Listener für Dashboard gesetzt');
}
// aus verlauf eingefügt (bereinigt):
// Ungültige Selektoren entfernt, da es keine Elemente mit diesen IDs gibt.






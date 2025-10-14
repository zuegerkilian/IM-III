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

})

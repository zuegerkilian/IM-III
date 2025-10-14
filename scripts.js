console.log("Parkhaus Dashboard gestartet");

// ==================== GLOBALE VARIABLEN ====================
let currentChart = null;
let allDataCache = null;
let currentView = 'weekly';
let individualView = 'weekly';
let selectedParkhaus = null;
let availableParkhaeuser = [];
let map = null; // Karten-Variable

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
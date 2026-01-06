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
    const totalPlaces = latestData.shortmax || 'N/A';
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

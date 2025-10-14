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


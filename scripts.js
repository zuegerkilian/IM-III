console.log("Parking Dashboard gestartet");

let map = null;
let currentChart = null;
let overlayChart = null;
let selectedParkhaus = null;

// ==================== MARKER ====================
const parkhausLocations = [
    { coords: [47.4218, 9.37090], title: "P21 Neumarkt" },
    { coords: [47.4245, 9.37122], title: "P22 Rathaus" },
    { coords: [47.4238, 9.37271], title: "P23 Manor" },
    { coords: [47.4228, 9.36713], title: "P24 Bahnhof" },
    { coords: [47.4222, 9.37465], title: "P31 Oberer Graben" },
    { coords: [47.4208, 9.3767], title: "P32 Raiffeisen" },
    { coords: [47.4218, 9.37422], title: "P33 Einstein" },
    { coords: [47.4202, 9.37234], title: "P25 Kreuzbleiche" },
    { coords: [47.4281, 9.37578], title: "P41 Unterer Graben" },
    { coords: [47.4254, 9.37929], title: "P42 Bruggraben" },
    { coords: [47.4240, 9.37928], title: "P43 Spisertor" },
    { coords: [47.4271, 9.37797], title: "P44 Brühltor" },
    { coords: [47.4176, 9.3548], title: "P51 Stadtpark/AZSG" },
    { coords: [47.4293, 9.38046], title: "P52 Spelteriniplatz" },
    { coords: [47.4309, 9.38182], title: "P53 OLMA" },
    { coords: [47.4311, 9.38366], title: "P54 OLMA Messen" }
];

// ==================== MAP INITIALIZATION ====================
function initializeMap() {
    map = L.map('map').setView([47.4245, 9.3767], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap-Mitwirkende'
    }).addTo(map);

    parkhausLocations.forEach(loc => {
        const marker = L.marker(loc.coords).addTo(map)
            .bindPopup(`<b>${loc.title}</b>`);
        marker.on('click', () => {
            selectedParkhaus = loc.title;
            openParkhausOverlay(loc.title);
            createDashboardChart('weekly', loc.title);
        });
    });
}

// ==================== OVERLAY ====================
function openParkhausOverlay(name) {
    document.getElementById('overlayTitle').textContent = name;
    document.getElementById('parkhausOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const overlayContent = document.getElementById('overlayContent');
    overlayContent.innerHTML = `
        <p>Daten für <strong>${name}</strong>:</p>
        <canvas id="overlayChart"></canvas>
        <div class="overlay-chart-buttons">
            <button id="overlayWeeklyBtn" class="active" onclick="switchOverlayChart('weekly')">Woche</button>
            <button id="overlayDailyBtn" onclick="switchOverlayChart('daily')">24h</button>
        </div>
    `;
    createOverlayChart('weekly');
}

function closeOverlay() {
    document.getElementById('parkhausOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    if (overlayChart) overlayChart.destroy();
}

function switchOverlayChart(view) {
    document.getElementById('overlayWeeklyBtn').classList.toggle('active', view==='weekly');
    document.getElementById('overlayDailyBtn').classList.toggle('active', view==='daily');
    createOverlayChart(view);
}

function createOverlayChart(view) {
    const ctx = document.getElementById('overlayChart').getContext('2d');
    if (overlayChart) overlayChart.destroy();

    const labels = view==='weekly' ? ['Mo','Di','Mi','Do','Fr','Sa','So'] : ['0','4','8','12','16','20'];
    const data = labels.map(()=>Math.floor(Math.random()*100));

    overlayChart = new Chart(ctx, {
        type: view==='weekly' ? 'bar' : 'line',
        data: { labels, datasets:[{label:'Belegung (%)',data,backgroundColor:'rgba(102,126,234,0.6)',borderColor:'#667eea',borderWidth:2,fill:true}] },
        options: { responsive:true, maintainAspectRatio:false }
    });
}

// ==================== DASHBOARD ====================
function createDashboardChart(view='weekly', parkhausName='Alle Parkhäuser') {
    document.getElementById('dashboardTitle').textContent = `Belegung: ${parkhausName}`;
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (currentChart) currentChart.destroy();

    const labels = view==='weekly' ? ['Mo','Di','Mi','Do','Fr','Sa','So'] : ['0','4','8','12','16','20'];
    const data = labels.map(()=>Math.floor(Math.random()*100));

    currentChart = new Chart(ctx, {
        type: view==='weekly' ? 'bar':'line',
        data:{ labels, datasets:[{label:'Belegung (%)',data,backgroundColor:'rgba(102,126,234,0.6)',borderColor:'#667eea',borderWidth:2,fill:true}] },
        options:{ responsive:true, maintainAspectRatio:false }
    });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    createDashboardChart();

    document.getElementById('weeklyBtn').addEventListener('click', () => createDashboardChart('weekly', selectedParkhaus || 'Alle Parkhäuser'));
    document.getElementById('dailyBtn').addEventListener('click', () => createDashboardChart('daily', selectedParkhaus || 'Alle Parkhäuser'));
});

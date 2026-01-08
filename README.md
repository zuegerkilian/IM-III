# IM-III

 Projektbeschreibung
 Die Webseite bietet eine interaktive Übersicht über die Parkhäuser der Stadt St. Gallen. Auf einer Karte werden alle Parkhäuser als Marker angezeigt, inklusive Status und verfügbarer Parkplätze. Ein Dashboard visualisiert die Auslastung in übersichtlichen Diagrammen, sowohl als Wochen- als auch als 24-Stunden-Ansicht. Zusätzlich können einzelne Parkhäuser ausgewählt werden, um detaillierte Belegungsdaten (von vergangenen Tagen) und aktuelle Verfügbarkeiten in einem Overlay anzuzeigen.


Projektname
Parking Stadt St.Gallen

FHGR-Email, Vor- und Nachname aller Gruppenmitglieder
kilian.zueger@stud.fhgr.ch, Kilian Züger
julia.jaeger@stud.fhgr.ch, Julia Jäger

URL der verwendeten APIs
https://www.freepublicapis.com/parking-stgallen

Figma-URL
https://www.figma.com/proto/zhdZATPFk67P19FSY7Q8kd/Parking-Stadt-St.Gall%C3%A4?node-id=152-5651&t=14tFAUUsRqyFJSCK-1

GitHub URL
https://github.com/zuegerkilian/IM-III/

Projekt-URL der laufenden Website
https://im3-projekt.wanderpodcastecho.ch/

Angabe über weitere Verwendung
Die Webseite zeigt Parkhäuser in St. Gallen auf einer interaktiven Karte und bietet einen Überblick über deren Auslastung. Nutzer können Parkhäuser auswählen und deren Verfügbarkeit sowie zeitliche Entwicklungen einsehen. Sie unterstützt so eine schnelle und informierte Parkplatzsuche. Somit kann der/die User/in immer abwägen zu welchen Zeiten und Parken in der Stadt St. Gallen einfacher oder schwieriger ist.

Learnings
Durch den Unterricht sowie die praktische Umsetzung im Projekt konnten wir ein gutes Verständnis für den ETL-Prozess entwickeln. Besonders das Arbeiten mit JavaScript haben wir weiter vertieft und praktisch angewendet. Auch wenn Inhalte aus dem letzten Semester nicht mehr vollständig präsent waren, stellte diese Einheit eine wertvolle Wiederholung dar. Zudem war es spannend, erstmals eine eigene Datenbank zu erstellen und diese kreativ in die Webseite zu integrieren.

Schwierigkeiten 
Eine der grössten Herausforderungen war die ungewohnte Schreibweise und Logik der Programmiersprache PHP. Der gesamte ETL-Prozess nahm viel Zeit in Anspruch, bis alle Schritte korrekt funktionierten. Auch die Auffrischung unserer JavaScript-Kenntnisse erforderte zusätzlichen Aufwand. Besonders anspruchsvoll gestaltete sich die Einbettung der API. Zu Beginn trat zudem ein Fehler in der Datenbank auf, wodurch die Daten falsch gesammelt wurden, dieser konnte jedoch später behoben werden. Auch das Overlay bereitete anfänglich Schwierigkeiten, da es nicht wie erwartet funktionierte, dieses Problem konnten wir jedoch ebenfalls lösen. Eine weitere Herausforderung bestand darin, dass Aktualisierungen nicht immer korrekt übernommen wurden, wodurch unterschiedliche Ansichten entstanden und es teilweise zu Verschlimmbesserungen kam. Zusätzlich erschwerte das Browser-Caching die Arbeit, da Änderungen nicht immer sofort sichtbar waren und Fehler dadurch oft erst verzögert erkannt und nachträglich korrigiert werden mussten.


genutzten Ressourcen
ChatGPT, VS Co-Pilot und Gemini halfen wenn wir nicht mehr weiterkammen – insbesondere beim Überprüfen des Codes oder beim Debugging.


Beispielpromt 1:
    Wie müssen wir den code aus chart.js in in unseren code einfügen damit die Line chart funktioniert?

Gute Frage 👍 — ich erklär’s dir Schritt für Schritt, damit eure Line Chart mit Chart.js funktioniert.

🧩 1. Chart.js einbinden

Zuerst müsst ihr Chart.js in euer HTML einbinden. Das geht am einfachsten über ein CDN-Link im <head> oder kurz vor dem Ende des <body>:

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

🧱 2. Canvas-Element im HTML anlegen

In eurer HTML-Datei braucht ihr ein <canvas>-Element, in dem der Chart gerendert wird:

<canvas id="myChart"></canvas>


Das könnt ihr z. B. in einem Container platzieren:

<div class="chart-container" style="width: 80%; max-width: 600px;">
  <canvas id="myChart"></canvas>
</div>

⚙️ 3. Chart.js-Code in euer JavaScript einfügen

Jetzt kommt der eigentliche Code für das Diagramm — entweder in einem <script>-Tag nach dem Canvas oder in eurer externen script.js:

<script>
  const ctx = document.getElementById('myChart').getContext('2d');
  
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni'],
      datasets: [{
        label: 'Umsatz in CHF',
        data: [1200, 1900, 3000, 2500, 3200, 4000],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3, // Rundung der Linie
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
</script>

📁 Wenn ihr mit separaten Dateien arbeitet

Falls ihr separate HTML- und JS-Dateien habt:

index.html

<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Line Chart Beispiel</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <canvas id="myChart"></canvas>
  <script src="script.js"></script>
</body>
</html>


script.js

const ctx = document.getElementById('myChart').getContext('2d');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni'],
    datasets: [{
      label: 'Umsatz in CHF',
      data: [1200, 1900, 3000, 2500, 3200, 4000],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});


Möchtest du mir kurz zeigen, wie euer Code aktuell aufgebaut ist (HTML + JS), damit ich dir genau sagen kann, wo ihr den Chart.js-Code einfügen müsst (z. B. ob ihr eine externe JS-Datei nutzt oder Inline-Script)?




ChatGPT kann Fehler machen. Überprüfe wichtige Informationen. Siehe Cookie-Voreins

Beispielpromt 2:
          <div class="parkhaus_box">
                <button class="parkhaus_button" onclick="window.location.href='detail.html'">
                <img src="images/IMG_0310.PNG" alt="Bild_Parkhaus" class="Bild_Parkhaus">
                <div class="graybar_parkhaus">
                 <p>Stadtpark/AZSG</p>
                  </div>
                 </button>
            </div>

Wie und wo muss ich mein OVerlay gestalten?

Gute Frage — das hängt davon ab, wann und wie dein Overlay erscheinen soll. Ich erkläre dir kurz die Varianten und zeige dir dann den passenden Code.

🧭 Grundidee

Du hast aktuell eine Box mit einem Button und einem Bild:

<div class="parkhaus_box">
  <button class="parkhaus_button" onclick="window.location.href='detail.html'">
    <img src="images/IMG_0310.PNG" alt="Bild_Parkhaus" class="Bild_Parkhaus">
    <div class="graybar_parkhaus">
      <p>Stadtpark/AZSG</p>
    </div>
  </button>
</div>


Wenn du ein Overlay gestalten möchtest (z. B. eine halbtransparente Ebene mit Text oder Symbol, die über dem Bild liegt), musst du Folgendes tun:

🔧 1. HTML-Struktur leicht anpassen

Du kannst das Overlay als zusätzliches <div> innerhalb des Buttons, aber über dem Bild platzieren:

<div class="parkhaus_box">
  <button class="parkhaus_button" onclick="window.location.href='detail.html'">
    <img src="images/IMG_0310.PNG" alt="Bild_Parkhaus" class="Bild_Parkhaus">

    <!-- Hier kommt das Overlay -->
    <div class="overlay">
      <p>Freie Plätze: 12</p>
    </div>

    <div class="graybar_parkhaus">
      <p>Stadtpark/AZSG</p>
    </div>
  </button>
</div>

🎨 2. CSS für das Overlay

Jetzt machst du das Overlay mit absoluter Positionierung und Transparenz sichtbar:

.parkhaus_box {
  position: relative;
  display: inline-block;
}

.parkhaus_button {
  position: relative;
  border: none;
  padding: 0;
  background: none;
}

.Bild_Parkhaus {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
}

/* Das Overlay selbst */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); /* halbtransparentes Schwarz */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

/* Overlay beim Hover einblenden */
.parkhaus_button:hover .overlay {
  opacity: 1;
}

.graybar_parkhaus {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(80, 80, 80, 0.7);
  color: white;
  text-align: center;
  padding: 4px 0;
  border-radius: 0 0 12px 12px;
}

💡 Ergebnis

Dein Bild bleibt sichtbar.

Beim Hover blendet sich ein dunkles Overlay mit Text ein.

Du kannst natürlich den Effekt auch dauerhaft sichtbar machen, indem du opacity: 1; standardmäßig setzt und den Hover-Effekt entfernst.

Wenn du mir sagst, wann das Overlay erscheinen soll (z. B. beim Hover, Klick, oder immer sichtbar mit Statusanzeige), kann ich den Code gezielt dafür anpassen.
👉 Soll das Overlay immer sichtbar sein, nur beim Hover, oder per Klick auf das Bild erscheinen?

onclick="window.location.href='detail.html'"> Beim klic sollte das overlay erscheinen

Perfekt — dann willst du, dass das Overlay beim Klick erscheint, statt sofort auf detail.html weiterzuleiten.
Das bedeutet:
👉 Wir ersetzen das direkte onclick="window.location.href='detail.html'" durch ein JavaScript, das zuerst das Overlay anzeigt — und optional nach ein paar Sekunden oder einem zweiten Klick weiterleitet.

✅ Schritt 1: HTML anpassen

Wir entfernen das direkte onclick im Button und geben ihm stattdessen eine ID oder Klasse, damit wir ihn über JavaScript ansprechen können:

<div class="parkhaus_box">
  <button class="parkhaus_button">
    <img src="images/IMG_0310.PNG" alt="Bild_Parkhaus" class="Bild_Parkhaus">

    <!-- Overlay -->
    <div class="overlay">
      <p>Bitte warten...</p>
    </div>

    <div class="graybar_parkhaus">
      <p>Stadtpark/AZSG</p>
    </div>
  </button>
</div>

🎨 Schritt 2: CSS für Overlay (zuerst unsichtbar)
.parkhaus_box {
  position: relative

Beispielpromt 3:
auf der webseite wird bei einigenn parkhäusern der wert gesamt plätze noch als N/A ausgegeben warum ist das so und wie kann ich es beheben?

Das Problem ist, dass die Tabelle Ph_stammdaten keine Einträge für diese Parkhaus-IDs hat.

Warum zeigt sich shortmax = N/A?
Im unload.php wird ein LEFT JOIN gemacht:
<?php
LEFT JOIN Ph_stammdaten ps ON p.phid = ps.phid

Wenn für eine phid kein Eintrag in Ph_stammdaten existiert, ist ps.shortmax NULL → wird in JavaScript zu null → dein Code zeigt 'N/A'.

So behebst du es:
Option 1: Debug - Überprüfe was die API zurückgibt
Öffne Browser-Konsole (F12), klicke auf einen Parkhaus-Button und schau was angezeigt wird:

// Gib das in der Konsole ein:
console.log(allDataCache);
// Oder klicke einen Button und schau die logs

Du siehst dann, welche phid-Werte existieren und welche shortmax-Werte NULL sind.

Option 2: Befülle die Stammdaten-Tabelle
Erstelle diese Datei:

<?php
// stammdaten_load.php
<?php
require_once 'config.php';

// Stammdaten für die Parkhäuser
$stammdaten = [
    ['phid' => 'P21', 'phname' => 'Parkhaus Neumarkt', 'shortmax' => 274, 'lat' => 47.4245, 'lon' => 9.3767],
    ['phid' => 'P22', 'phname' => 'Parkhaus Rathaus', 'shortmax' => 143, 'lat' => 47.4250, 'lon' => 9.3770],
    ['phid' => 'P23', 'phname' => 'Parkhaus Manor', 'shortmax' => 412, 'lat' => 47.4240, 'lon' => 9.3765],
    ['phid' => 'P24', 'phname' => 'Cityparking Bahnhof', 'shortmax' => 155, 'lat' => 47.4260, 'lon' => 9.3750],
    // ... weitere Parkhäuser hinzufügen
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    $sql = "INSERT INTO Ph_stammdaten (phid, phname, shortmax, lat, lon) 
            VALUES (:phid, :phname, :shortmax, :lat, :lon)
            ON DUPLICATE KEY UPDATE shortmax = :shortmax, lat = :lat, lon = :lon";
    
    $stmt = $pdo->prepare($sql);
    
    foreach ($stammdaten as $data) {
        $stmt->execute($data);
    }
    
    echo json_encode(['success' => 'Stammdaten geladen']);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>

Speichere das, öffne https://im3-projekt.wanderpodcastecho.ch/stammdaten_load.php im Browser und führe es einmalig aus.

Option 3: Überprüfe deine Datenbank direkt
Schau, welche Tabellen und Spalten es gibt:

SELECT * FROM Ph_stammdaten;

Falls die Tabelle leer ist oder falsche phid-Werte hat, musst du sie befüllen.

Welche IDs verwendest du in den Buttons? (P21, P22, etc.)
Dann kann ich dir das exakte Insert-Script schreiben.
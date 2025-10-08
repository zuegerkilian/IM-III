<?php

/* ============================================================================
   HANDLUNGSANWEISUNG (transform.php)
   0) Schau dir die Rohdaten genau an und plane exakt, wie du die Daten umwandeln möchtest (auf Papier)
   1) Binde extract.php ein und erhalte das Rohdaten-Array.
   2) Definiere Mapping Koordinaten → Anzeigename (z. B. Bern/Chur/Zürich).
   3) Konvertiere Einheiten (z. B. °F → °C) und runde sinnvoll (Celsius = (Fahrenheit - 32) * 5 / 9).
   4) Leite eine einfache "condition" ab (z. B. sonnig/teilweise bewölkt/bewölkt/regnerisch).
   5) Baue ein kompaktes, flaches Array je Standort mit den Ziel-Feldern.
   6) Optional: Sortiere die Werte (z. B. nach Zeit), entferne irrelevante Felder.
   7) Validiere Pflichtfelder (location, temperature_celsius, …).
   8) Kodieren: json_encode(..., JSON_PRETTY_PRINT) → JSON-String.
   9) GIB den JSON-String ZURÜCK (return), nicht ausgeben – für den Load-Schritt.
  10) Fehlerfälle als Exception nach oben weiterreichen (kein HTML/echo).
   ============================================================================ */

// Bindet das Skript extract.php für Rohdaten ein und speichere es in $data
$data = include('extract.php');

echo "<pre>";
print_r($data);
echo "</pre>";

// --- Rohdaten (JSON-String aus der Aufgabenstellung) ---
$json_raw_data = '{"total_count": 16, "results": [{"phid": "P22", "phname": "Rathaus", "phstate": "offen", "shortmax": 83, "shortfree": 0, "shortoccupied": 83, "belegung_prozent": 100, "standort": {"lon": 9.371221, "lat": 47.424453}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P23", "phname": "Manor", "phstate": "offen", "shortmax": 132, "shortfree": 55, "shortoccupied": 77, "belegung_prozent": 58, "standort": {"lon": 9.372705, "lat": 47.423793}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P24", "phname": "Bahnhof", "phstate": "offen", "shortmax": 275, "shortfree": 73, "shortoccupied": 202, "belegung_prozent": 73, "standort": {"lon": 9.367127, "lat": 47.422775}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P31", "phname": "Oberer Graben", "phstate": "offen", "shortmax": 138, "shortfree": 57, "shortoccupied": 81, "belegung_prozent": 58, "standort": {"lon": 9.374646, "lat": 47.422223}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P42", "phname": "Burggraben", "phstate": "offen", "shortmax": 337, "shortfree": 132, "shortoccupied": 205, "belegung_prozent": 60, "standort": {"lon": 9.379288, "lat": 47.425396}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P52", "phname": "Spelterini", "phstate": "nicht verf\u00fcgbar", "shortmax": 0, "shortfree": 0, "shortoccupied": 0, "belegung_prozent": null, "standort": {"lon": 9.380463, "lat": 47.429303}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P43", "phname": "Spisertor", "phstate": "offen", "shortmax": 35, "shortfree": 18, "shortoccupied": 17, "belegung_prozent": 48, "standort": {"lon": 9.379277, "lat": 47.424039}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P54", "phname": "OLMA Messen", "phstate": "nicht verf\u00fcgbar", "shortmax": 0, "shortfree": 0, "shortoccupied": 0, "belegung_prozent": null, "standort": {"lon": 9.383656, "lat": 47.431147}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P21", "phname": "Neumarkt", "phstate": "offen", "shortmax": 274, "shortfree": 120, "shortoccupied": 154, "belegung_prozent": 56, "standort": {"lon": 9.370902, "lat": 47.4218}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P25", "phname": "Kreuzbleiche", "phstate": "nicht verf\u00fcgbar", "shortmax": 0, "shortfree": 0, "shortoccupied": 0, "belegung_prozent": null, "standort": {"lon": 9.362406, "lat": 47.420232}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P41", "phname": "Unterer Graben", "phstate": "nicht verf\u00fcgbar", "shortmax": 0, "shortfree": 0, "shortoccupied": 0, "belegung_prozent": null, "standort": {"lon": 9.375785, "lat": 47.428104}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P51", "phname": "Stadtpark AZSG", "phstate": "offen", "shortmax": 88, "shortfree": 12, "shortoccupied": 76, "belegung_prozent": 86, "standort": {"lon": 9.384783, "lat": 47.430177}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P32", "phname": "Raiffeisen", "phstate": "offen", "shortmax": 96, "shortfree": 6, "shortoccupied": 90, "belegung_prozent": 93, "standort": {"lon": 9.372335, "lat": 47.42081}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P33", "phname": "Einstein", "phstate": "offen", "shortmax": 187, "shortfree": 67, "shortoccupied": 120, "belegung_prozent": 64, "standort": {"lon": 9.37422, "lat": 47.42177}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P44", "phname": "Br\u00fchltor", "phstate": "offen", "shortmax": 448, "shortfree": 311, "shortoccupied": 137, "belegung_prozent": 30, "standort": {"lon": 9.377966, "lat": 47.427118}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}, {"phid": "P53", "phname": "OLMA Parkplatz", "phstate": "offen", "shortmax": 300, "shortfree": 0, "shortoccupied": 300, "belegung_prozent": 100, "standort": {"lon": 9.381821, "lat": 47.430875}, "zeitpunkt": "2025-10-07T09:01:43+00:00"}]}';

// JSON-Daten dekodieren
$raw_data = json_decode($json_raw_data, true);

if ($raw_data === null) {
    die("Fehler beim Dekodieren der JSON-Daten.\n");
}

$parkhaeuser_data = $raw_data['results'] ?? [];
$transformedData = [];


// Transformiert und fügt die notwendigen Informationen hinzu
foreach ($parkhaeuser_data as $parkhaus) {
    // 1. phstate: Direkt übernehmen (im JSON sind "offen" und "nicht verfügbar" bereits korrekt)
    $phstate = $parkhaus['phstate'];
    
    // 2. shortfree: Übernehmen
    $shortfree = (int)($parkhaus['shortfree'] ?? 0);
    
    // 3. belegung_prozent: Übernehmen, NULL-Werte für Datenbank vorbereiten (Float oder NULL)
    // MariaDB/MySQL PDO behandelt PHP 'null' als SQL NULL
    $belegung_prozent = is_numeric($parkhaus['belegung_prozent']) ? (float)$parkhaus['belegung_prozent'] : "0";

    // 4. phid: Übernehmen
    $phid = $parkhaus['phid'] ?? '';
    
    // 5. verfuegbarkeit: Logik anwenden
    // if ($shortfree = 0) { return 'besetzt'; } else { return 'frei'; }
    // Wichtig: Im PHP-Kontext führt $shortfree = 0 zu einer Zuweisung und dann zu false.
    // Die korrekte Logik, die in der Anweisung gemeint ist (Vergleich), ist:
    $verfuegbarkeit = ($shortfree === 0) ? 'besetzt' : 'frei';
    
    // Datenstruktur erstellen, Spaltennamen der Datenbanktabelle als Schlüssel
    $transformedData[] = [
        // 'id' und 'created_at' werden von der DB automatisch gesetzt (DEFAULT current_timestamp() bzw. AUTO_INCREMENT)
        'phid'               => $phid,
        'phstate'            => $phstate,
        'shortfree'          => $shortfree,
        'belegung_prozent'   => $belegung_prozent,
        'verfuegbarkeit'     => $verfuegbarkeit,
    ];
}

echo "Transformation abgeschlossen. " . count($transformedData) . " Datensätze transformiert.\n";

// Kodiert die transformierten Daten in JSON
$json_output = json_encode($transformedData, JSON_PRETTY_PRINT);

// Gibt die JSON-Daten zurück, anstatt sie auszugeben
return $json_output;
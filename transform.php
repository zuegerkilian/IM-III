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

// echo "<pre>";
// print_r($data);
// echo "</pre>";

if ($data === null) {
    die("Fehler beim Laden der Daten.\n");
}

$parkhaeuser_data = $data['results'] ?? [];
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
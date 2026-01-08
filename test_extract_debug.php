<?php
echo "<h1>Extract.php Debugging</h1>";

// Test 1: Datei existiert?
if (file_exists('extract.php')) {
    echo "<p style='color:green'>✅ extract.php existiert</p>";
} else {
    echo "<p style='color:red'>❌ extract.php NICHT gefunden</p>";
    die();
}

// Test 2: Include funktioniert?
echo "<h2>Test 2: Daten abrufen</h2>";
$response = include('extract.php');

echo "<p><strong>Typ der Antwort:</strong> " . gettype($response) . "</p>";
echo "<p><strong>Länge:</strong> " . strlen($response) . " Zeichen</p>";

// Test 3: Ist es JSON?
echo "<h2>Test 3: JSON-Validität</h2>";
$decoded = json_decode($response, true);
if ($decoded === null) {
    echo "<p style='color:red'>❌ KEINE gültigen JSON-Daten</p>";
    echo "<p><strong>Erste 500 Zeichen der Antwort:</strong></p>";
    echo "<pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre>";
} else {
    echo "<p style='color:green'>✅ Gültiges JSON</p>";
    
    // Test 4: Wie viele Datensätze?
    if (isset($decoded['results'])) {
        echo "<p><strong>Anzahl Datensätze:</strong> " . count($decoded['results']) . "</p>";
        echo "<p><strong>Erstes Element:</strong></p>";
        echo "<pre>" . json_encode($decoded['results'][0], JSON_PRETTY_PRINT) . "</pre>";
    } else {
        echo "<p style='color:orange'>⚠️ Kein 'results'-Feld gefunden</p>";
        echo "<pre>" . json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "</pre>";
    }
}
?>
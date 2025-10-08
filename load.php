<?php
/* ============================================================================
   HANDLUNGSANWEISUNG (load.php)
   1) Binde 001_config.php (PDO-Config) ein.
   2) Binde transform.php ein → erhalte TRANSFORM-JSON.
   3) json_decode(..., true) → Array mit Datensätzen.
   4) Stelle PDO-Verbindung her (ERRMODE_EXCEPTION, FETCH_ASSOC).
   5) Bereite INSERT/UPSERT-Statement mit Platzhaltern vor.
   6) Iteriere über Datensätze und führe execute(...) je Zeile aus.
   7) Optional: Transaktion verwenden (beginTransaction/commit) für Performance.
   8) Bei Erfolg: knappe Bestätigung ausgeben (oder still bleiben, je nach Kontext).
   9) Bei Fehlern: Exception fangen → generische Fehlermeldung/Code (kein Stacktrace).
  10) Keine Debug-Ausgaben in Produktion; sensible Daten nicht loggen.
   ============================================================================ */

// Transformations-Skript  als '230_transform.php' einbinden
$json_output = include('transform.php');

// Dekodiert die JSON-Daten zu einem Array
$dataArray = json_decode($json_output, true);

require_once 'config.php'; // Bindet die Datenbankkonfiguration ein

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // SQL INSERT Statement vorbereiten
    $sql = "INSERT INTO Parkhaeuser (phid, phstate, shortfree, belegung_prozent, verfuegbarkeit) 
            VALUES (:phid, :phstate, :shortfree, :belegung_prozent, :verfuegbarkeit)";
            
    $stmt = $pdo->prepare($sql);
    
    $pdo->beginTransaction();

    foreach ($transformedData as $data) {
        // Die Spalten 'id' und 'created_at' werden weggelassen, da sie von der DB verwaltet werden.
        $stmt->execute([
            ':phid'               => $data['phid'],
            ':phstate'            => $data['phstate'],
            ':shortfree'          => $data['shortfree'],
            // PDO sendet NULL für PHP null, wenn die Spalte dies zulässt (Float erlaubt NULL bei MariaDB)
            ':belegung_prozent'   => $data['belegung_prozent'],
            ':verfuegbarkeit'     => $data['verfuegbarkeit'],
        ]);
    }
    
    $pdo->commit();
    echo "Daten erfolgreich in die Datenbanktabelle 'Parkhaeuser' geladen.\n";
    
} catch (\PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // Fehlerbehandlung
    echo "Datenbankfehler: " . $e->getMessage() . "\n";
    // Für Debugging: echo "SQLSTATE: " . $e->getCode() . "\n";
    die();
}
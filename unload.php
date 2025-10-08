<?php
/* ============================================================================
   HANDLUNGSANWEISUNG (unload.php)
   1) Setze Header: Content-Type: application/json; charset=utf-8.
   2) Binde 001_config.php (PDO-Config) ein.
   3) Lies optionale Request-Parameter (z. B. location, limit, from/to) und validiere.
   4) Baue SELECT mit PREPARED STATEMENT (WHERE/ORDER BY/LIMIT je nach Parametern).
   5) Binde Parameter sicher (execute([...]) oder bindValue()).
   6) Hole Datensätze (fetchAll) – optional gruppieren/umformen fürs Frontend.
   7) Antworte IMMER als JSON (json_encode) – auch bei leeren Treffern ([]) .
   8) Setze sinnvolle HTTP-Statuscodes (400 für Bad Request, 404 bei 0 Treffern (Detail), 200 ok).
   9) Fehlerfall: 500 + { "error": "..." } (keine internen Details leaken).
  10) Keine HTML-Ausgabe; keine var_dump in Prod.
   ============================================================================ */

// Datenbankkonfiguration einbinden
require_once 'config.php'; 

// Header setzen, um JSON-Inhaltstyp zurückzugeben
header('Content-Type: application/json');

// Den Parkhaus-ID-Parameter aus der URL holen (z.B. unload.php?phid=P123)
if (isset($_GET['phid']) && !empty($_GET['phid'])) {
    // Parameter bereinigen (hier nur einfache Typumwandlung/Trimmen)
    $phid = trim($_GET['phid']);
} else {
    // Wenn 'phid' nicht gesetzt ist, leeren String setzen, um alle Daten abzurufen 
    // oder eine Fehlermeldung ausgeben, je nach Anforderung.
    $phid = null; // null bedeutet: Alle abrufen, wenn der Filter weggelassen wird
    // OPTIONAL: Fehler ausgeben, wenn phid zwingend ist:
    /*
    echo json_encode(['error' => 'Der Parkhaus-ID (phid) Parameter wird benötigt.']);
    exit;
    */
}


try {
    // Erstellt eine neue PDO-Instanz mit der Konfiguration aus config.php
    $pdo = new PDO($dsn, $username, $password, $options);

    // Initialisiere die Abfrage
    $sql_params = [];
    
    // SQL-Query, um Daten aus der 'Parkhaeuser'-Tabelle auszuwählen
    // Sortiert nach der automatisch generierten ID oder einem Zeitstempel, falls vorhanden
    $sql = "SELECT * FROM `Parkhaeuser` WHERE 1";

    // Fügt eine WHERE-Klausel hinzu, wenn ein phid-Filter vorhanden ist
    if ($phid !== null) {
        // Verwende benannte Parameter für bessere Lesbarkeit und Sicherheit
        $sql .= " WHERE phid = :phid";
        $sql_params[':phid'] = $phid;
    }

    // Sortierung hinzufügen (Annahme: eine 'created_at' Spalte existiert, oder nach einer ID sortieren)
    $sql .= " ORDER BY created_at DESC";

    // Bereitet die SQL-Anweisung vor
    $stmt = $pdo->prepare($sql);

    // Führt die Abfrage mit den vorbereiteten Parametern aus
    $stmt->execute($sql_params);

    // Holt alle passenden Einträge
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Gibt die Ergebnisse im JSON-Format zurück (auch wenn $results leer ist)
    echo json_encode($results);
    
} catch (\PDOException $e) {
    // Fehlerbehandlung: Gibt eine Fehlermeldung zurück, wenn etwas schiefgeht
    // Loggen Sie den Fehler für die interne Verwendung, geben Sie aber keine Details an den Benutzer zurück
    // error_log("Datenbankfehler in unload.php: " . $e->getMessage()); 
   echo json_encode(['error' => $e->getMessage()]);
}


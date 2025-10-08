<?php
$data = [
    "firstname" => "Kilian",
    "lastname" => "Züger",
    "email" => "kilian.zueger@gmail.com"
];

require_once "config.php";

try {
    // Erstellt eine neue PDO-Instanz mit der Konfiguration aus config.php
    $pdo = new PDO($dsn, $username, $password, $options);

    // SQL-Query mit Platzhaltern für das Einfügen von Daten
    $sql = "INSERT INTO User (firstname, lastname, email)
    VALUES (?, ?, ?)"; // muss immer genau gleich viele ? wie Werte haben

    // Bereitet die SQL-Anweisung vor
    $stmt = $pdo->prepare($sql);

    // Fügt jedes Element im Array in die Datenbank ein
    //foreach ($dataArray as $item) { //den loop brauchen wir für unser projekt eher nicht

        $stmt->execute([
            $data["firstname"],
            $data["lastname"],
            $data["email"]
        ]);
    

    echo "Daten erfolgreich eingefügt.";
}catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}
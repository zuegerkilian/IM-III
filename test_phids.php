<?php
$json_output = include('transform.php');
$dataArray = json_decode($json_output, true);

echo "<h1>PHIDs von der API:</h1>";
echo "<pre>";
foreach ($dataArray as $data) {
    echo "PHID: " . $data['phid'] . "\n";
}
echo "</pre>";

// Jetzt prüfen, welche in der DB existieren
require_once 'config.php';
$pdo = new PDO($dsn, $username, $password, $options);
$stmt = $pdo->query("SELECT phid FROM Ph_stammdaten ORDER BY phid");
$existing = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "<h1>PHIDs in Ph_stammdaten:</h1>";
echo "<pre>";
print_r($existing);
echo "</pre>";
?>
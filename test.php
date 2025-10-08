<?php

// --> Variable definieren
// vgl. javascript: let name = "Nico";
$name = "Nico";
echo $name;

echo "<br>"; // Zeilenumbruch in HTML


$a = 5;
$b = 10;
echo $a + $b;

// --> funktionen
function multiply($a, $b) {
    return $a * $b;
}
echo (multiply (5, 10)); 

echo "<br>"; // Zeilenumbruch in HTML

// --> bedingung
// note muss 4 oder grösser sein
$note = 3;
if ($note >= 4) {
    echo ("du hesch bestande!");
} else if ($note <4 && $note >= 3.5) {
    echo ("du dörfsch nomol e prüefig schribe");
} else {
    echo ("usegheit");
}

// --> arrays
$banane = ["gelb", "süss", "krumm"];

echo "<pre>"; // pre formatieren 
print_r($banane[2]); // mit dem 2 in eckigen Klammern wird das 3. Element des Arrays ausgegeben
echo "</pre>"; // so werden die daten schöner dargestellt


foreach ($banane as $eigenschaften) {
    echo $eigenschaften . "<br>";
}

echo "<br>"; // Zeilenumbruch in HTML

// assotiative arrays (aka. objekte)
$standorte = [
    "chur" => 15.4,
    "Zürich" => 20,
    "Bern" => -1
];

foreach($standorte as $ort => $temperatur) {
    echo $temperatur . "/" . $ort . "<br>";
}


?>
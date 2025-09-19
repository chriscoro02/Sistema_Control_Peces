<?php
// Lee las credenciales de la superglobal $_SERVER, que es más fiable bajo Apache.
$host = $_SERVER['DB_HOST'] ?? null;
$db_name = $_SERVER['DB_DATABASE'] ?? null;
$username = $_SERVER['DB_USER'] ?? null;
$password = $_SERVER['DB_PASSWORD'] ?? null;

// --- Tu código de depuración (ahora debería mostrar los valores) ---
echo "<h2>Valores leídos por PHP desde \$_SERVER:</h2>";
echo "host: " . ($host ?? '<b>NO ENCONTRADO</b>') . "<br/>";
echo "db: " . ($db_name ?? '<b>NO ENCONTRADO</b>') . "<br/>";
echo "user: " . ($username ?? '<b>NO ENCONTRADO</b>') . "<br/>";
// No mostramos la contraseña completa por seguridad
echo "pass: " . (empty($password) ? '<b>NO ENCONTRADO</b>' : '******** (encontrada)') . "<br/>";
echo "<hr/>";
// ----------------------------------------------------------------

// Verifica si las variables se cargaron correctamente.
if (!$host || !$db_name || !$username || !$password) {
    die("Error crítico: PHP no pudo leer una o más variables de entorno de la base de datos desde \$_SERVER. Revisa el docker-compose.yml.");
}

try {
    // La conexión PDO no cambia.
    $conn = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<h1>¡Éxito! Conexión a la base de datos remota de Hostinger establecida desde PHP.</h1>";
} catch(PDOException $e) {
    // Si llegas aquí, las variables son correctas, pero hay otro problema (poco probable).
    die("Error de PDO: No se pudo conectar a la base de datos.<br/>Mensaje: " . $e->getMessage());
}
?>

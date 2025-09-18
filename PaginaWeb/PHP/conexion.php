<?php
// PHP/conexion.php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$DB_HOST = "localhost"; // En Hostinger suele ser 'localhost'
$DB_NAME = "u315648687_piscicola";
$DB_USER = "u315648687_Administrador";
$DB_PASS = "Sistema_Gestion25";

$cn = mysqli_init();
mysqli_options($cn, MYSQLI_OPT_CONNECT_TIMEOUT, 8);
if (!@mysqli_real_connect($cn, $DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, 3306, null, 0)) {
  http_response_code(500);
  die("Error de conexión MySQL: (".mysqli_connect_errno().") ".mysqli_connect_error());
}
$cn->set_charset("utf8mb4");
$cn->query("SET time_zone='-04:00'");

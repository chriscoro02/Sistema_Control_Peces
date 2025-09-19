<?php
// PHP/check_session.php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['id_usuario'])) {
  echo json_encode(['ok'=>false]); exit;
}

echo json_encode([
  'ok'       => true,
  'usuario'  => $_SESSION['usuario'] ?? '',
  'nombre'   => $_SESSION['nombre'] ?? '',
  'apellido' => $_SESSION['apellido'] ?? '',
  'id_rol'   => $_SESSION['id_rol'] ?? 0
]);

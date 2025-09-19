<?php
require_once __DIR__ . '/conexion.php';
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'ok'   => true,
  'db'   => $DB_NAME ?? null,
  'user' => $DB_USER ?? null,
  'host' => $DB_HOST ?? null,
  'time' => date('c')
]);

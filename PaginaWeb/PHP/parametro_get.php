<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$id_user = (int)($_SESSION['id_usuario'] ?? 0);
$id      = (int)($_GET['id'] ?? 0);

if ($id_user <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }
if ($id <= 0)      { echo json_encode(['ok'=>false,'msg'=>'ID inválido']); exit; }

$stmt = $cn->prepare("SELECT id_parametro, id_estanque, fecha, temperatura, ph, oxigeno, amonio, nitritos, turbidez, observacion, registrado_por
                      FROM parametro_agua
                      WHERE id_parametro=? LIMIT 1");
$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
if (!$row) { echo json_encode(['ok'=>false,'msg'=>'No encontrado']); exit; }

if ((int)$row['registrado_por'] !== $id_user ) {
  http_response_code(403);
  echo json_encode(['ok'=>false,'msg'=>'Sin permiso']); exit;
}
unset($row['registrado_por']);

echo json_encode(['ok'=>true,'data'=>$row]);

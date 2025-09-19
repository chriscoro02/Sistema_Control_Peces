<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$id_user = (int)($_SESSION['id_usuario'] ?? 0);
$id_rol  = (int)($_SESSION['id_rol'] ?? 0);
$id      = (int)($_GET['id'] ?? 0);

if ($id_user <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }
if ($id <= 0)      { echo json_encode(['ok'=>false,'msg'=>'ID inválido']); exit; }

$stmt = $cn->prepare("SELECT id_lote, id_estanque, id_especie, id_proveedor,
                             codigo_lote, fecha_siembra, cantidad_inicial, origen, creado_por
                      FROM lote WHERE id_lote=? LIMIT 1");
$stmt->bind_param("i", $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
if (!$row) { echo json_encode(['ok'=>false,'msg'=>'No encontrado']); exit; }

// Solo propietario (o admin id_rol=1 si quieres permitir)
if ($row['creado_por'] != $id_user /* && $id_rol != 1 */) {
  http_response_code(403);
  echo json_encode(['ok'=>false,'msg'=>'Sin permiso']); exit;
}
unset($row['creado_por']); // no exponer

echo json_encode(['ok'=>true,'data'=>$row]);

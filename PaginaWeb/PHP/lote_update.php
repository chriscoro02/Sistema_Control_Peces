<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
  $id_user = (int)($_SESSION['id_usuario'] ?? 0);
  if ($id_user <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

  $id_lote          = (int)($_POST['id_lote'] ?? 0);
  $id_estanque      = (int)($_POST['id_estanque'] ?? 0);
  $id_especie       = (int)($_POST['id_especie'] ?? 0);
  $id_proveedor_raw = $_POST['id_proveedor'] ?? null;
  $id_proveedor     = ($id_proveedor_raw === null || $id_proveedor_raw === '') ? null : (int)$id_proveedor_raw;
  $codigo_lote      = trim($_POST['codigo_lote'] ?? '');
  $fecha_siembra    = $_POST['fecha_siembra'] ?? '';
  $cantidad_inicial = (int)($_POST['cantidad_inicial'] ?? 0);
  $origen           = trim($_POST['origen'] ?? '');

  if ($id_lote<=0 || $id_estanque<=0 || $id_especie<=0 || $codigo_lote==='' || $fecha_siembra==='' || $cantidad_inicial<=0) {
    echo json_encode(['ok'=>false,'msg'=>'Campos obligatorios faltantes']); exit;
  }

  // Verificar propiedad
  $own = $cn->query("SELECT creado_por FROM lote WHERE id_lote={$id_lote}")->fetch_assoc();
  if (!$own) { echo json_encode(['ok'=>false,'msg'=>'Lote no existe']); exit; }
  if ((int)$own['creado_por'] !== $id_user /* && (int)($_SESSION['id_rol']??0)!==1 */) {
    http_response_code(403);
    echo json_encode(['ok'=>false,'msg'=>'Sin permiso']); exit;
  }

  // Unicidad del código (excluyendo el mismo registro)
  $st = $cn->prepare("SELECT 1 FROM lote WHERE codigo_lote=? AND id_lote<>? LIMIT 1");
  $st->bind_param("si", $codigo_lote, $id_lote);
  $st->execute();
  if ($st->get_result()->num_rows > 0) {
    echo json_encode(['ok'=>false,'msg'=>'El código de lote ya existe']); exit;
  }

  // Validación básica de FKs
  $ok1 = $cn->query("SELECT 1 FROM estanque WHERE id_estanque={$id_estanque}")->num_rows>0;
  $ok2 = $cn->query("SELECT 1 FROM especie  WHERE id_especie={$id_especie}")->num_rows>0;
  if (!$ok1 || !$ok2) { echo json_encode(['ok'=>false,'msg'=>'Estanque o especie inválidos']); exit; }
  if ($id_proveedor !== null) {
    $ok3 = $cn->query("SELECT 1 FROM proveedor WHERE id_proveedor={$id_proveedor}")->num_rows>0;
    if (!$ok3) { echo json_encode(['ok'=>false,'msg'=>'Proveedor inválido']); exit; }
  }

  // Update
  $sql = "UPDATE lote
          SET id_estanque=?, id_especie=?, id_proveedor=?, codigo_lote=?, fecha_siembra=?, cantidad_inicial=?, origen=?
          WHERE id_lote=?";
  $st = $cn->prepare($sql);

  if ($id_proveedor === null) {
    $null = null;
    $st->bind_param("iiissisi", $id_estanque, $id_especie, $null, $codigo_lote, $fecha_siembra, $cantidad_inicial, $origen, $id_lote);
  } else {
    $st->bind_param("iiissisi", $id_estanque, $id_especie, $id_proveedor, $codigo_lote, $fecha_siembra, $cantidad_inicial, $origen, $id_lote);
  }

  $st->execute();
  echo json_encode(['ok'=>true]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'Error interno','err'=>$e->getMessage()]);
}

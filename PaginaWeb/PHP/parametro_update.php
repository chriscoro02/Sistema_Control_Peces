<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
  $id_user = (int)($_SESSION['id_usuario'] ?? 0);
  if ($id_user <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

  $id_parametro = (int)($_POST['id_parametro'] ?? 0);
  $id_estanque  = (int)($_POST['id_estanque'] ?? 0);
  $fecha        = trim($_POST['fecha'] ?? '');

  $temperatura  = $_POST['temperatura'] ?? null;
  $ph           = $_POST['ph'] ?? null;
  $oxigeno      = $_POST['oxigeno'] ?? null;
  $amonio       = $_POST['amonio'] ?? null;
  $nitritos     = $_POST['nitritos'] ?? null;
  $turbidez     = $_POST['turbidez'] ?? null;
  $observacion  = trim($_POST['observacion'] ?? '');

  if ($id_parametro<=0 || $id_estanque<=0 || $fecha==='') {
    echo json_encode(['ok'=>false,'msg'=>'Campos obligatorios faltantes']); exit;
  }

  // Normaliza "YYYY-MM-DDTHH:MM" -> "YYYY-MM-DD HH:MM:00"
  if (strpos($fecha,'T') !== false) $fecha = str_replace('T',' ',substr($fecha,0,16)).":00";

  // Propiedad
  $own = $cn->query("SELECT registrado_por FROM parametro_agua WHERE id_parametro={$id_parametro}")->fetch_assoc();
  if (!$own) { echo json_encode(['ok'=>false,'msg'=>'Registro no existe']); exit; }
  if ((int)$own['registrado_por'] !== $id_user /* && (int)($_SESSION['id_rol']??0)!==1 */) {
    http_response_code(403);
    echo json_encode(['ok'=>false,'msg'=>'Sin permiso']); exit;
  }

  // FK válida
  $okEst = $cn->query("SELECT 1 FROM estanque WHERE id_estanque={$id_estanque}")->num_rows>0;
  if (!$okEst) { echo json_encode(['ok'=>false,'msg'=>'Estanque inválido']); exit; }

  // Normaliza numéricos a NULL o float
  $temperatura = ($temperatura === null || $temperatura==='') ? null : (float)$temperatura;
  $ph          = ($ph          === null || $ph==='')          ? null : (float)$ph;
  $oxigeno     = ($oxigeno     === null || $oxigeno==='')     ? null : (float)$oxigeno;
  $amonio      = ($amonio      === null || $amonio==='')      ? null : (float)$amonio;
  $nitritos    = ($nitritos    === null || $nitritos==='')    ? null : (float)$nitritos;
  $turbidez    = ($turbidez    === null || $turbidez==='')    ? null : (float)$turbidez;
  $observacion = ($observacion === '') ? null : $observacion;

  $sql = "UPDATE parametro_agua
          SET id_estanque=?, fecha=?, temperatura=?, ph=?, oxigeno=?, amonio=?, nitritos=?, turbidez=?, observacion=?
          WHERE id_parametro=?";
  $st = $cn->prepare($sql);
  // i s d d d d d d s i
  $st->bind_param("isddddddsi",
    $id_estanque, $fecha, $temperatura, $ph, $oxigeno, $amonio, $nitritos, $turbidez, $observacion, $id_parametro
  );

  $st->execute();
  echo json_encode(['ok'=>true]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'Error interno','err'=>$e->getMessage()]);
}

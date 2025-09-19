<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

// Para ver errores como excepción (útil en desarrollo)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
  $id_usuario = (int)($_SESSION['id_usuario'] ?? 0);
  if ($id_usuario <= 0) {
    echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit;
  }

  $id_estanque = (int)($_POST['id_estanque'] ?? 0);
  $fecha       = trim($_POST['fecha'] ?? ''); // "YYYY-MM-DDTHH:MM" o "YYYY-MM-DD HH:MM:SS"

  // opcionales
  $temperatura = $_POST['temperatura'] ?? null;
  $ph          = $_POST['ph'] ?? null;
  $oxigeno     = $_POST['oxigeno'] ?? null;
  $amonio      = $_POST['amonio'] ?? null;
  $nitritos    = $_POST['nitritos'] ?? null;
  $turbidez    = $_POST['turbidez'] ?? null;
  $observacion = trim($_POST['observacion'] ?? '');

  if ($id_estanque<=0 || $fecha==='') {
    echo json_encode(['ok'=>false,'msg'=>'Estanque y fecha son obligatorios']); exit;
  }

  // Normaliza "YYYY-MM-DDTHH:MM" -> "YYYY-MM-DD HH:MM:00"
  if (strpos($fecha,'T') !== false) {
    $fecha = str_replace('T',' ',substr($fecha,0,16)).":00";
  }

  // FK válida
  $okEst = $cn->query("SELECT 1 FROM estanque WHERE id_estanque={$id_estanque}")->num_rows > 0;
  if (!$okEst) { echo json_encode(['ok'=>false,'msg'=>'Estanque inválido']); exit; }

  // Normaliza numéricos vacíos a NULL y castea
  $temperatura = ($temperatura === null || $temperatura==='') ? null : (float)$temperatura;
  $ph          = ($ph          === null || $ph==='')          ? null : (float)$ph;
  $oxigeno     = ($oxigeno     === null || $oxigeno==='')     ? null : (float)$oxigeno;
  $amonio      = ($amonio      === null || $amonio==='')      ? null : (float)$amonio;
  $nitritos    = ($nitritos    === null || $nitritos==='')    ? null : (float)$nitritos;
  $turbidez    = ($turbidez    === null || $turbidez==='')    ? null : (float)$turbidez;
  $observacion = ($observacion === '') ? null : $observacion;

  $sql = "INSERT INTO parametro_agua
          (id_estanque, fecha, temperatura, ph, oxigeno, amonio, nitritos, turbidez, observacion, registrado_por)
          VALUES (?,?,?,?,?,?,?,?,?,?)";
  $st = $cn->prepare($sql);

  // TIPOS CORRECTOS: i s d d d d d d s i  (10 en total)
  $st->bind_param(
    "isddddddsi",
    $id_estanque, $fecha, $temperatura, $ph, $oxigeno, $amonio, $nitritos, $turbidez, $observacion, $id_usuario
  );

  $st->execute();

  echo json_encode(['ok'=>true,'id'=>$st->insert_id]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'Error interno','err'=>$e->getMessage()]);
}

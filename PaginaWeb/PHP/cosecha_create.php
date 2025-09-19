<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
  $id_user = (int)($_SESSION['id_usuario'] ?? 0);
  if ($id_user <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

  $id_lote = (int)($_POST['id_lote'] ?? 0);
  $fecha   = trim($_POST['fecha'] ?? '');
  $cantidad_total = ($_POST['cantidad_total'] ?? null);
  $peso_total = ($_POST['peso_total'] ?? null);
  $id_calidad = ($_POST['id_calidad'] ?? null);
  $id_peso = ($_POST['id_peso'] ?? null);
  $observacion = trim($_POST['observacion'] ?? '');

  if ($id_lote <= 0 || $fecha === '') {
    echo json_encode(['ok'=>false,'msg'=>'Lote y fecha son obligatorios']); exit;
  }

  // Normaliza fecha "YYYY-MM-DDTHH:MM" -> "YYYY-MM-DD HH:MM:00"
  if (strpos($fecha,'T') !== false) $fecha = str_replace('T',' ',substr($fecha,0,16)).":00";

  // Verificar existencia del lote
  $ok = $cn->query("SELECT 1 FROM lote WHERE id_lote={$id_lote}")->num_rows > 0;
  if (!$ok) { echo json_encode(['ok'=>false,'msg'=>'Lote inválido']); exit; }

  // Normaliza numéricos
  $cantidad_total = ($cantidad_total === '' || $cantidad_total === null) ? null : (int)$cantidad_total;
  $peso_total = ($peso_total === '' || $peso_total === null) ? null : (float)$peso_total;
  $id_calidad = ($id_calidad === '' || $id_calidad === null) ? null : (int)$id_calidad;
  $id_peso = ($id_peso === '' || $id_peso === null) ? null : (int)$id_peso;
  $observacion = ($observacion === '') ? null : $observacion;

  $st = $cn->prepare("INSERT INTO cosecha (id_lote, fecha, cantidad_total, peso_total, id_calidad, id_peso, observacion, registrado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  $st->bind_param("isdiiddi",
    $id_lote, $fecha, $cantidad_total, $peso_total, $id_calidad, $id_peso, $observacion, $id_user
  );
  $st->execute();

  echo json_encode(['ok'=>true,'id'=>$st->insert_id]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'Error interno','err'=>$e->getMessage()]);
}

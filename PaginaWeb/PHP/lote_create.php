<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$id_usuario = (int)($_SESSION['id_usuario'] ?? 0);
if ($id_usuario <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

$codigo_lote      = trim($_POST['codigo_lote'] ?? '');
$id_estanque      = (int)($_POST['id_estanque'] ?? 0);
$id_especie       = (int)($_POST['id_especie'] ?? 0);
$id_proveedor_raw = $_POST['id_proveedor'] ?? null;
$id_proveedor     = ($id_proveedor_raw === null || $id_proveedor_raw === '') ? null : (int)$id_proveedor_raw;
$fecha_siembra    = $_POST['fecha_siembra'] ?? '';
$cantidad_inicial = (int)($_POST['cantidad_inicial'] ?? 0);
$origen           = trim($_POST['origen'] ?? '');

if ($codigo_lote === '' || $id_estanque<=0 || $id_especie<=0 || $fecha_siembra==='' || $cantidad_inicial<=0) {
  echo json_encode(['ok'=>false,'msg'=>'Completa los campos obligatorios']); exit;
}

// Valida existencia de FK básicas
$ok1 = $cn->query("SELECT 1 FROM estanque WHERE id_estanque={$id_estanque}")->num_rows > 0;
$ok2 = $cn->query("SELECT 1 FROM especie  WHERE id_especie={$id_especie}")->num_rows > 0;
if (!$ok1 || !$ok2) { echo json_encode(['ok'=>false,'msg'=>'Estanque o especie no válidos']); exit; }
if ($id_proveedor !== null) {
  $ok3 = $cn->query("SELECT 1 FROM proveedor WHERE id_proveedor={$id_proveedor}")->num_rows > 0;
  if (!$ok3) { echo json_encode(['ok'=>false,'msg'=>'Proveedor no válido']); exit; }
}

// Unicidad de código
$st = $cn->prepare("SELECT 1 FROM lote WHERE codigo_lote=? LIMIT 1");
$st->bind_param("s", $codigo_lote);
$st->execute();
if ($st->get_result()->num_rows > 0) { echo json_encode(['ok'=>false,'msg'=>'El código de lote ya existe']); exit; }

// Insert
$st = $cn->prepare("INSERT INTO lote
  (id_estanque, id_especie, id_proveedor, codigo_lote, fecha_siembra, cantidad_inicial, origen, creado_por)
  VALUES (?,?,?,?,?,?,?,?)");

if ($id_proveedor === null) {
  // bind null correctamente
  $null = null;
  $st->bind_param("iiissisi",
    $id_estanque, $id_especie, $null, $codigo_lote, $fecha_siembra, $cantidad_inicial, $origen, $id_usuario
  );
} else {
  $st->bind_param("iiissisi",
    $id_estanque, $id_especie, $id_proveedor, $codigo_lote, $fecha_siembra, $cantidad_inicial, $origen, $id_usuario
  );
}

$st->execute();
echo json_encode(['ok'=>true, 'id'=>$st->insert_id]);

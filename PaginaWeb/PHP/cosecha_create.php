<?php
// PHP/cosecha_create.php

require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$id_usuario = (int)($_SESSION['id_usuario'] ?? 0);
if ($id_usuario <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

$id_lote        = (int)($_POST['id_lote'] ?? 0);
$fecha          = trim($_POST['fecha'] ?? '');
$cantidad_total = (int)($_POST['cantidad_total'] ?? 0);
$peso_promedio  = empty($_POST['peso_promedio']) ? null : (float)$_POST['peso_promedio'];
$id_calidad     = empty($_POST['id_calidad']) ? null : (int)$_POST['id_calidad'];
$id_peso        = empty($_POST['id_peso']) ? null : (int)$_POST['id_peso'];

if ($id_lote <= 0 || $fecha === '' || $cantidad_total <= 0) {
  echo json_encode(['ok'=>false,'msg'=>'Completa los campos obligatorios: Lote, Fecha y Cantidad.']); exit;
}

$stmt = $cn->prepare("INSERT INTO cosecha
  (id_lote, fecha, cantidad_total, peso_promedio, id_calidad, id_peso, registrado_por)
  VALUES (?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("isidiii",
  $id_lote, $fecha, $cantidad_total, $peso_promedio, $id_calidad, $id_peso, $id_usuario
);

$stmt->execute();

if ($stmt->error) {
    echo json_encode(['ok'=>false, 'msg' => 'Error al guardar la cosecha: ' . $stmt->error]);
} else {
    echo json_encode(['ok'=>true, 'id'=>$stmt->insert_id]);
}

$stmt->close();
$cn->close();
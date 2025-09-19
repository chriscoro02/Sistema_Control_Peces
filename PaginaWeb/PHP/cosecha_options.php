<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

try {
  $res = [];

  // lotes: id_lote, codigo_lote (o codigo)
  $q = $cn->query("SELECT id_lote, codigo_lote FROM lote ORDER BY codigo_lote ASC");
  $lotes = $q->fetch_all(MYSQLI_ASSOC);

  // calidades: id_calidad, nombre
  $q2 = $cn->query("SELECT id_calidad, nombre FROM calidad ORDER BY nombre ASC");
  $calidades = $q2->fetch_all(MYSQLI_ASSOC);

  // pesos (categorías): id_peso, nombre
  $q3 = $cn->query("SELECT id_peso, nombre FROM peso_categoria ORDER BY nombre ASC");
  $pesos = $q3->fetch_all(MYSQLI_ASSOC);

  echo json_encode(['ok'=>true,'lotes'=>$lotes,'calidades'=>$calidades,'pesos'=>$pesos]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'msg'=>'Error interno','err'=>$e->getMessage()]);
}

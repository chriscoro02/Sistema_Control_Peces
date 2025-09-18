<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$id_usuario = (int)($_SESSION['id_usuario'] ?? 0);
if ($id_usuario <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

$q = trim($_GET['q'] ?? '');
$limit  = max(1, min(200, (int)($_GET['limit']  ?? 100)));
$offset = max(0,         (int)($_GET['offset'] ?? 0));

$sql = "SELECT p.id_parametro, p.fecha,
               e.codigo AS estanque,
               p.temperatura, p.ph, p.oxigeno, p.amonio, p.nitritos, p.turbidez, p.observacion
        FROM parametro_agua p
        JOIN estanque e ON e.id_estanque = p.id_estanque
        WHERE p.registrado_por = ?
          ".($q!=='' ? "AND (e.codigo LIKE CONCAT('%',?,'%') OR p.observacion LIKE CONCAT('%',?,'%'))" : "")."
        ORDER BY p.fecha DESC, p.id_parametro DESC
        LIMIT ? OFFSET ?";

if ($q!=='') {
  $st = $cn->prepare($sql);
  $st->bind_param("issii", $id_usuario, $q, $q, $limit, $offset);
} else {
  $st = $cn->prepare($sql);
  $st->bind_param("iii", $id_usuario, $limit, $offset);
}
$st->execute();
$res = $st->get_result();
$data = [];
while($row = $res->fetch_assoc()){ $data[] = $row; }

echo json_encode(['ok'=>true, 'data'=>$data]);

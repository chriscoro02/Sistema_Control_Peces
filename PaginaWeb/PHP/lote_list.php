<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$id_usuario = (int)($_SESSION['id_usuario'] ?? 0);
if ($id_usuario <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

$q = trim($_GET['q'] ?? '');
$limit = max(1, min(100, (int)($_GET['limit'] ?? 50)));
$offset = max(0, (int)($_GET['offset'] ?? 0));

$sql = "SELECT l.id_lote, l.codigo_lote, l.fecha_siembra, l.cantidad_inicial, l.origen,
               e.codigo AS estanque, s.nombre AS especie, p.nombre_empresa AS proveedor
        FROM lote l
        JOIN estanque e ON e.id_estanque = l.id_estanque
        JOIN especie  s ON s.id_especie  = l.id_especie
        LEFT JOIN proveedor p ON p.id_proveedor = l.id_proveedor
        WHERE l.creado_por = ?
          ".($q !== '' ? "AND l.codigo_lote LIKE CONCAT('%',?,'%')" : "")."
        ORDER BY l.id_lote DESC
        LIMIT ? OFFSET ?";

if ($q !== '') {
  $stmt = $cn->prepare($sql);
  $stmt->bind_param("isii", $id_usuario, $q, $limit, $offset);
} else {
  $stmt = $cn->prepare($sql);
  $stmt->bind_param("iii", $id_usuario, $limit, $offset);
}

$stmt->execute();
$res = $stmt->get_result();
$data = [];
while ($row = $res->fetch_assoc()) { $data[] = $row; }

echo json_encode(['ok'=>true, 'data'=>$data]);

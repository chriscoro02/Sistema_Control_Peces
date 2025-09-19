<?php
// PHP/cosecha_list.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$id_usuario = (int)($_SESSION['id_usuario'] ?? 0);
if ($id_usuario <= 0) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

$sql = "SELECT 
            c.id_cosecha, c.fecha, c.cantidad_total, c.peso_promedio,
            l.codigo_lote,
            cc.clase AS calidad_clase,
            cp.categoria AS peso_categoria,
            CONCAT(pe.nombre, ' ', pe.apellido) as registrado_por_nombre
        FROM cosecha c
        JOIN lote l ON l.id_lote = c.id_lote
        LEFT JOIN clasificacion_calidad cc ON cc.id_calidad = c.id_calidad
        LEFT JOIN clasificacion_peso cp ON cp.id_peso = c.id_peso
        LEFT JOIN usuario u ON u.id_usuario = c.registrado_por
        LEFT JOIN persona pe ON pe.id_persona = u.id_persona
        WHERE c.registrado_por = ?
        ORDER BY c.fecha DESC";

$stmt = $cn->prepare($sql);
if (!$stmt) {
    echo json_encode(['ok'=>false, 'msg'=>'Error en la consulta SQL: ' . $cn->error]);
    exit;
}

$stmt->bind_param("i", $id_usuario);
$stmt->execute();

if ($stmt->error) {
    echo json_encode(['ok'=>false, 'msg' => 'Error al ejecutar la consulta: ' . $stmt->error]);
    exit;
}

$res = $stmt->get_result();
$data = [];
while ($row = $res->fetch_assoc()) { $data[] = $row; }

echo json_encode(['ok'=>true, 'data'=>$data]);
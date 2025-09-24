<?php
// PHP/cosecha_options.php

require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

if (!isset($_SESSION['id_usuario'])) { 
    echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); 
    exit; 
}

$lotes     = $cn->query("SELECT lote.id_lote, lote.codigo_lote FROM lote LEFT JOIN cosecha ON cosecha.id_lote = lote.id_lote WHERE cosecha.id_lote IS NULL ORDER BY lote.codigo_lote")->fetch_all(MYSQLI_ASSOC);
$calidades = $cn->query("SELECT id_calidad, clase FROM clasificacion_calidad ORDER BY id_calidad")->fetch_all(MYSQLI_ASSOC);
$pesos     = $cn->query("SELECT id_peso, categoria FROM clasificacion_peso ORDER BY id_peso")->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'ok' => true, 
    'lotes' => $lotes, 
    'calidades' => $calidades,
    'pesos' => $pesos
]);
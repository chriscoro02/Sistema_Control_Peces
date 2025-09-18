<?php
require_once __DIR__ . '/cors.php';
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

if (!isset($_SESSION['id_usuario'])) { echo json_encode(['ok'=>false,'msg'=>'Sesión expirada']); exit; }

$estanques = $cn->query("SELECT id_estanque, codigo FROM estanque ORDER BY codigo")->fetch_all(MYSQLI_ASSOC);
$especies  = $cn->query("SELECT id_especie, nombre FROM especie ORDER BY nombre")->fetch_all(MYSQLI_ASSOC);
$proveed   = $cn->query("SELECT id_proveedor, nombre_empresa FROM proveedor ORDER BY nombre_empresa")->fetch_all(MYSQLI_ASSOC);

echo json_encode(['ok'=>true, 'estanques'=>$estanques, 'especies'=>$especies, 'proveedores'=>$proveed]);

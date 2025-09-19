<?php
// PHP/login.php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/PHP/conexion.php';

$body = $_POST;
if (empty($body)) {
  // Soporta JSON también
  $body = json_decode(file_get_contents('php://input'), true) ?? [];
}

$email = trim($body['email'] ?? '');
$pass  = trim($body['password'] ?? '');

if ($email === '' || $pass === '') {
  echo json_encode(['ok'=>false, 'msg'=>'Completa email y contraseña.']); exit;
}

$stmt = $cn->prepare("SELECT u.id_usuario, u.id_persona, u.id_rol, u.email, u.password, u.estado,
                             p.nombre, p.apellido
                      FROM usuario u
                      JOIN persona p ON p.id_persona = u.id_persona
                      WHERE u.email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

$ok = false;
if ($user && strtoupper($user['estado']) === 'ACTIVO') {
  $hash = $user['password'];
  if (preg_match('/^\$2y\$\d{2}\$/', $hash)) {
    // Bcrypt
    $ok = password_verify($pass, $hash);
  } else {
    // Soporte transitorio a texto plano
    $ok = hash_equals($hash, $pass);
  }
}

if (!$ok) {
  echo json_encode(['ok'=>false, 'msg'=>'Credenciales inválidas o usuario inactivo.']); exit;
}

// Sesión
$_SESSION['id_usuario'] = (int)$user['id_usuario'];
$_SESSION['id_persona'] = (int)$user['id_persona'];
$_SESSION['id_rol']     = (int)($user['id_rol'] ?? 0);
$_SESSION['usuario']    = $user['email'];
$_SESSION['nombre']     = $user['nombre'];
$_SESSION['apellido']   = $user['apellido'];

echo json_encode([
  'ok'=>true,
  'redirect'=>'/HTML/dashboard.html'
]);

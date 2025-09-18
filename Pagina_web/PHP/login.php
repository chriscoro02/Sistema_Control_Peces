<?php
// login.php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

// >>> Config DB (tu hosting)
$host = 'localhost';
$dbname = 'u315648687_piscicola';
$username = 'u315648687_Admin';
$password = 'Sistema_Gestion25';

// Sólo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'msg' => 'Método no permitido']);
  exit;
}

$email = trim($_POST['email'] ?? '');
$pass  = (string)($_POST['password'] ?? '');

if ($email === '' || $pass === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'msg' => 'Complete email y contraseña']);
  exit;
}

try {
  $pdo = new PDO(
    "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
    $username,
    $password,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );

  // Traer usuario por email + datos básicos para sesión
  // Tablas según tu esquema: usuario, persona, rol
  $sql = "SELECT u.id_usuario, u.email, u.password, u.estado, u.id_rol,
                 p.nombre, p.apellido,
                 r.nombre AS rol_nombre
          FROM usuario u
          JOIN persona p ON p.id_persona = u.id_persona
          LEFT JOIN rol r ON r.id_rol = u.id_rol
          WHERE u.email = :email
          LIMIT 1";
  $st = $pdo->prepare($sql);
  $st->execute([':email' => $email]);
  $u = $st->fetch();

  if (!$u) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'msg' => 'Usuario no encontrado']);
    exit;
  }

  if ($u['estado'] !== 'ACTIVO') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'msg' => 'Usuario inactivo']);
    exit;
  }

  $dbHash = (string)$u['password'];

  // 1) Si la BD guarda hash -> password_verify
  // 2) Si guarda en texto plano (como tu dump de ejemplo) -> comparación directa
  $credencialesValidas = false;
  if (strlen($dbHash) >= 55 && preg_match('/^\$2[ayb]\$|^\$argon2/', $dbHash)) {
    // parece hash (bcrypt/argon2)
    $credencialesValidas = password_verify($pass, $dbHash);
  } else {
    // texto plano
    $credencialesValidas = hash_equals($dbHash, $pass);
  }

  if (!$credencialesValidas) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'msg' => 'Credenciales inválidas']);
    exit;
  }

  // OK -> setear sesión
  $_SESSION['id_usuario'] = (int)$u['id_usuario'];
  $_SESSION['usuario']    = $u['email'];
  $_SESSION['nombre']     = $u['nombre'];
  $_SESSION['apellido']   = $u['apellido'];
  $_SESSION['rol']        = $u['rol_nombre'] ?? null;

  echo json_encode([
    'ok' => true,
    'msg' => 'Acceso concedido',
    'user' => [
      'id' => (int)$u['id_usuario'],
      'email' => $u['email'],
      'nombre' => $u['nombre'],
      'apellido' => $u['apellido'],
      'rol' => $u['rol_nombre'] ?? null
    ],
    // Cambia por tu destino real después del login
    'redirect' => '/Pagina_web/HTML/dashboard.php'
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'msg' => 'Error de servidor', 'detail' => $e->getMessage()]);
}

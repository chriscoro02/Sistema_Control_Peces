<?php
// public_html/Sistema_Peces/login.php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

/* ==========================================================
   C O R S  (solo si el HTML NO está en Hostinger)
   Si todo vive en /Sistema_Peces/, puedes dejarlo así.
   Si llamas desde GitHub/localhost, deja esta whitelist.
   ========================================================== */
$allowed_origins = [
  'https://sienna-curlew-728554.hostingersite.com',
  'https://*.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];
if (isset($_SERVER['HTTP_ORIGIN'])) {
  foreach ($allowed_origins as $allowed) {
    $pattern = '#^' . str_replace(['*', '.'], ['.*', '\.'], $allowed) . '$#';
    if (preg_match($pattern, $_SERVER['HTTP_ORIGIN'])) {
      header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
      header('Access-Control-Allow-Credentials: true');
      header('Access-Control-Allow-Methods: POST, OPTIONS');
      header('Vary: Origin');
      break;
    }
  }
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

/* ==========================================================
   Credenciales de tu base de datos (Hostinger)
   ========================================================== */
$host = 'localhost';
$dbname = 'u315648687_piscicola';
$username = 'u315648687_Admin';
$password = 'Sistema_Gestion25';

/* ======= Solo aceptar POST ======= */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'msg' => 'Método no permitido']);
  exit;
}

/* ======= Validar entrada ======= */
$email = trim($_POST['email'] ?? '');
$pass  = (string)($_POST['password'] ?? '');

if ($email === '' || $pass === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'msg' => 'Complete email y contraseña']);
  exit;
}

try {
  /* ======= Conexión PDO ======= */
  $pdo = new PDO(
    "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
    $username,
    $password,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );

  /* ======= Consulta según tu esquema real ======= */
  // usuario(email, password, estado, id_persona, id_rol) + persona + rol
  // (estructura y datos del volcado que compartiste)
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

  // Soporta password_hash o texto plano (en tu dump hay ejemplo plano: 12345)
  $credencialesValidas = false;
  if (strlen($dbHash) >= 55 && preg_match('/^\$2[ayb]\$|^\$argon2/', $dbHash)) {
    $credencialesValidas = password_verify($pass, $dbHash);
  } else {
    $credencialesValidas = hash_equals($dbHash, $pass);
  }

  if (!$credencialesValidas) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'msg' => 'Credenciales inválidas']);
    exit;
  }

  /* ======= Sesión OK ======= */
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
    // Redirige a tu dashboard (HTML o PHP; crea el archivo)
    'redirect' => '../../Pagina_web/HTML/dashboard.html'
  ]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'msg' => 'Error de servidor', 'detail' => $e->getMessage()]);
}
<?php
// PHP/cors.php
$allowed = [
  'http://127.0.0.1:5500',
  'http://localhost:8000',
  'http://localhost',
  'https://sienna-curlew-728554.hostingersite.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed, true)) {
  header("Access-Control-Allow-Origin: $origin");
  header("Vary: Origin");
  header("Access-Control-Allow-Credentials: true");
  header("Access-Control-Allow-Headers: Content-Type, Accept");
  header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

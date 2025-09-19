// JS/ventas.js
const API_BASE  = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK = API_BASE + "PHP/check_session.php";
const URL_LIST  = API_BASE + "PHP/venta_list.php";

const $ = (s) => document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody      = $("#tbodyVentas");

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = `${j.nombre ?? ""} ${j.apellido ?? ""}`.trim() || j.usuario || "Usuario";
  return j;
}

async function loadVentas() {
  tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Cargando…</td></tr>`;

  const r = await fetch(URL_LIST, { credentials: "include" });
  const j = await r.json();

  if (!j.ok) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Error: ${j.msg || "No se pudo obtener las ventas"}</td></tr>`;
    return;
  }

  if (!j.data.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = j.data.map(row => `
    <tr>
      <td>${row.id_registro_venta}</td>
      <td>${new Date(row.fecha_salida).toLocaleString('es-ES')}</td>
      <td><strong>Cosecha #${row.id_cosecha} (${row.codigo_lote})</strong></td>
      <td>${row.destino_tipo || "-"}</td>
      <td>${row.estado || "-"}</td>
      <td>${row.temperatura_transporte ? parseFloat(row.temperatura_transporte).toFixed(2) + ' °C' : "-"}</td>
      <td>${row.registrado_por_nombre || "-"}</td>
      <td>${row.observacion || "-"}</td> 
    </tr>
  `).join("");
}

(async () => {
    await requireSession();
    await loadVentas();
})();
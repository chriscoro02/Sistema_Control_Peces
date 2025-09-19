// JS/cosechas.js
const API_BASE  = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK = API_BASE + "PHP/check_session.php";
const URL_LIST  = API_BASE + "PHP/cosecha_list.php";

const $ = (s) => document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody      = $("#tbodyCosechas");

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = `${j.nombre ?? ""} ${j.apellido ?? ""}`.trim() || j.usuario || "Usuario";
  return j;
}

async function loadCosechas() {
  tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">Cargando…</td></tr>`;

  const r = await fetch(URL_LIST, { credentials: "include" });
  const j = await r.json();

  if (!j.ok) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-danger">Error: ${j.msg || "No se pudo obtener las cosechas"}</td></tr>`;
    return;
  }

  if (!j.data.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = j.data.map(row => `
    <tr>
      <td>${row.id_cosecha}</td>
      <td>${new Date(row.fecha).toLocaleString('es-ES')}</td>
      <td><strong>${row.codigo_lote}</strong></td>
      <td>${row.cantidad_total}</td>
      <td>${row.peso_total ? parseFloat(row.peso_total).toFixed(2) + ' kg' : "-"}</td>
      <td>${row.calidad_clase || "-"}</td>
      <td>${row.peso_categoria || "-"}</td>
      <td>${row.registrado_por_nombre || "-"}</td>
      <td>${row.observacion || "-"}</td>
    </tr>
  `).join("");
}

(async () => {
    try {
        await requireSession();
        await loadCosechas();
    } catch (err) {
        console.error("Error en la inicialización:", err);
    }
})();
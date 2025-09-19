// JS/alimentacion.js
const API_BASE  = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK = API_BASE + "PHP/check_session.php";

// --- Endpoints que necesitarás crear en PHP ---
const URL_LIST  = API_BASE + "PHP/alimentacion_list.php"; 
// ---------------------------------------------

const $ = (s) => document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody      = $("#tbodyAlimentacion");
const q          = $("#q");

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  sessionStorage.setItem("user", JSON.stringify(j));
  usuarioBox.textContent = `${j.nombre ?? ""} ${j.apellido ?? ""}`.trim() || j.usuario || "Usuario";
  return j;
}

async function loadAlimentacion() {
  const params = new URLSearchParams();
  const term = q.value.trim();
  if (term) params.set("q", term);

  // Se actualiza el colspan a 9
  tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">Cargando…</td></tr>`;

  const r = await fetch(`${URL_LIST}?${params}`, { credentials: "include" });
  const j = await r.json();

  if (!j.ok) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-danger">Error: ${j.msg || "No se pudo obtener los registros"}</td></tr>`;
    return;
  }

  if (!j.data.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = j.data.map(row => `
    <tr>
      <td>${row.id_registro_alimentacion}</td>
      <td>${new Date(row.fecha).toLocaleString('es-ES')}</td>
      <td><strong>${row.codigo_lote || "-"}</strong></td>
      <td>${row.tipo_alimento_nombre || "-"}</td>
      <td>${parseFloat(row.cantidad).toFixed(2)} kg</td>
      <td>${row.frecuencia || "-"}</td>
      <td>${row.comportamiento || "-"}</td>
      <td>${row.observacion || "-"}</td> <td>${row.registrado_por_nombre || "-"}</td>
    </tr>
  `).join("");
}

document.getElementById("btnReload")?.addEventListener("click", loadAlimentacion);
q?.addEventListener("keydown", (e) => { if (e.key === "Enter") loadAlimentacion(); });

// Init
(async () => {
    await requireSession();
    await loadAlimentacion();
})();